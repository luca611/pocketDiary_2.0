import { connectToDb, closeDbConnection } from "../db/dbClinet.mjs";
import { createHash, decryptMessage, encryptMessage, generateKey } from "../security/encryption.mjs";
import { sendError, sendSuccess, sendNotLoggedIn } from "../utils/returns.mjs";
import { isEmpty, isTaken, isValidColor, isValidEmail, validatePassword } from "../utils/validator.mjs";
import { STUDENT_MAXEMAIL_LENGTH, STUDENT_MAXKEY_LENGTH, STUDENT_MAXNAME_LENGTH, STUDENT_MAXPASSWORD_LENGTH } from "../utils/vars.mjs";

//----------------------------------- CREATE -----------------------------------//


/**
 * Function that validate user credentials and adds it to the server
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function register(req, res) {
    req.session.email = "";
    req.session.userid = "";
    req.session.key = "";
    req.session.logged = false;

    // getting the data from the request body

    let { email, password, primary, secondary, tertiary, name } = req.body;

    // controling the data

    if (!email || !password || !name || !primary || !secondary || !tertiary) {
        sendError(res, "missing inputs");
        return;
    }

    email = email.trim();
    email = email.toLowerCase();
    name = name.trim();
    name = name.toLowerCase();
    primary = primary.trim();
    secondary = secondary.trim();
    tertiary = tertiary.trim();

    // email checks
    if (await isEmpty(email)) {
        sendError(res, "Email is required");
        return;
    }

    if (await !isValidEmail(email)) {
        console.log("email invalid");
        sendError(res, "Email format is invalid");
        return;
    }

    if (await isTaken(email)) {
        sendError(res, "Email is already in use");
        return;
    }

    // password checks
    password = password.trim();

    if (await isEmpty(password)) {
        sendError(res, "Password is required");
        return;
    }

    if (await !validatePassword(password)) {
        sendError(res, "Password too weak");
        return;
    }

    // name checks
    name = name.trim();
    name = name.toLowerCase();

    if (isEmpty(name)) {
        sendError(res, "Name is required");
        return;
    }

    // theme checks
    if (!isValidColor(primary) || !isValidColor(secondary) || !isValidColor(tertiary)) {
        sendError(res, "Theme colors are not valid");
        return;
    }

    // encrypting the data before sending it to the database and making sure it is not too long
    let encryptedEmail = encryptMessage(process.env.ENCRYPTION_KEY, email);
    if (encryptedEmail.length > STUDENT_MAXEMAIL_LENGTH) {
        sendError(res, "Email exceed max length allowed");
        return;
    }

    let encryptedPassword = createHash(password)
    if (encryptedPassword.length > STUDENT_MAXPASSWORD_LENGTH) {
        sendError(res, "Password exceed max length allowed");
        return;
    }
    let encryptedName = encryptMessage(process.env.ENCRYPTION_KEY, name);
    if (encryptedName.length > STUDENT_MAXNAME_LENGTH) {
        sendError(res, "Name exceed max length allowed");
        return;
    }

    let primary_color = primary
    let secondary_color = secondary
    let tertiary_color = tertiary

    //unique key for the user
    let key = encryptMessage(process.env.ENCRYPTION_KEY, generateKey());
    if (key.length > STUDENT_MAXKEY_LENGTH) {
        sendError(res, "Key exceed max length allowed");
        return;
    }

    // adding the user to the database
    let connection = null;
    try {
        connection = await connectToDb();
    } catch (error) {
        sendError(res, "server network error");
        return;
    }

    const query = `INSERT INTO students (email, password, name, primary_color, secondary_color, tertiary_color, key) VALUES ($1, $2, $3, $4, $5, $6,$7)`;

    try {
        await connection.query(query, [encryptedEmail, encryptedPassword, encryptedName, primary_color, secondary_color, tertiary_color, key]);
    } catch (error) {
        console.log(error);
        sendError(res, "server internal error, try again");
        closeDbConnection(connection);
        return;
    }

    //get the user id from the database
    const query2 = `SELECT key FROM students WHERE email = $1`;
    const params = [encryptedEmail];

    let userid;
    try {
        userid = await connection.query(query2, params);
    } catch (error) {
        console.log(error);
        sendError(res, "Error retriving user id");
        closeDbConnection(connection);
        return;
    }

    userid = userid.rows[0].key;
    console.log(userid);

    //binding credential to session
    req.session.key = decryptMessage(process.env.ENCRYPTION_KEY, key);
    req.session.userid = userid;
    req.session.logged = true;

    sendSuccess(res, "User registered successfully");
    closeDbConnection(connection);
}

/**
 * 
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function login(req, res) {
    req.session.email = "";
    req.session.key = "";
    req.session.password = "";
    req.session.logged = false;

    let { email, password } = req.body;

    if (!email || !password) {
        sendError(res, "invalid inputs");
        return;
    }

    if (isEmpty(email) || isEmpty(password)) {
        sendError("invalid inputs: email or password is empty");
        return;
    }

    let connection = null;

    try {
        connection = await connectToDb();
    } catch (error) {
        sendError(res, "server network error");
        return;
    }

    // ensuring data is the same format of the ones in db
    email = encryptMessage(process.env.ENCRYPTION_KEY, email);
    password = createHash(password);

    // cheking on the db 
    const query = `SELECT id, key FROM students WHERE email = $1 AND password = $2`;
    const params = [email, password];
    let result;
    try {
        result = await connection.query(query, params);
    } catch (e) {
        sendError(res, "network error");
        closeDbConnection(connection);
        return;
    }

    if (result.rows.length != 1) {
        sendError(res, "Invalid credentials");
        return;
    }

    const user = result.rows[0];

    //binding user information to session
    req.session.userid = user.id;
    req.session.key = decryptMessage(process.env.ENCRYPTION_KEY, user.key);
    req.session.logged = true;

    sendSuccess(res, "logged in successful");
    // closing connection
    closeDbConnection(connection);
}


//----------------------------------- READ -----------------------------------//

/**
 *  Function that gets the user theme from the database
 * 
 *  @param {Request} req
 *  @param {Response} res
 *  @returns {void}
 */

export async function getTheme(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let connection = null;
    try {
        connection = await connectToDb();
    }
    catch (error) {
        sendError(res, "server network error");
        return;
    }

    let id = req.session.userid;
    let query = `SELECT primary_color,secondary_color,tertiary_color  FROM students WHERE id = $1`;

    let result;
    try {
        result = await connection.query(query, [id]);
    } catch (error) {
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    let primary = result.rows[0].primary_color;
    let secondary = result.rows[0].secondary_color;
    let tertiary = result.rows[0].tertiary_color;


    // [*] might reconsider reformatting the response to be more readable
    let theme = {
        primary: primary,
        secondary: secondary,
        tertiary: tertiary
    };

    sendSuccess(res, theme);
    closeDbConnection(connection);
}

/**
 * Function that gets the user name from the database
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function getName(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let connection = null;
    try {
        connection = await connectToDb();
    }
    catch (error) {
        sendError(res, "server network error");
        return;
    }

    let id = req.session.userid;
    let query = `SELECT name FROM students WHERE id = $1`;

    let result;
    try {
        result = await connection.query(query, [id]);
    } catch (error) {
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    let name = decryptMessage(process.env.ENCRYPTION_KEY, result.rows[0].name);
    sendSuccess(res, name);
    closeDbConnection(connection);
}

//----------------------------------- UPDATE -----------------------------------//

/**
 *  Function that updates the user password in the database
 *  
 *  @param {Request} req
 *  @param {Response} res
 *  @returns {void}
 */
export async function updatePassword(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let { newPassword } = req.body;

    if (!newPassword) {
        sendError(res, "invalid inputs");
        return;
    }

    if (isEmpty(newPassword)) {
        sendError(res, "Password is required");
        return;
    }

    if (!validatePassword(newPassword)) {
        sendError(res, "Password too weak");
        return;
    }

    // encrypting the data before sending it to the database and making sure it is not too long
    let encryptedNewPassword = createHash(newPassword);
    if (encryptedNewPassword.length > STUDENT_MAXPASSWORD_LENGTH) {
        sendError(res, "Password exceed max length allowed");
        return;
    }


    let connection = null;
    try {
        connection = await connectToDb();
    }
    catch (error) {
        sendError(res, "server network error");
        return;
    }


    let query = `UPDATE students SET password = $1 WHERE id = $2`;

    let id = req.session.userid;
    try {
        await connection.query(query, [encryptedNewPassword, id]);
    } catch (error) {
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    sendSuccess(res, "Password updated successfully");
    closeDbConnection(connection);
}

/**
 * Function that updates the user theme in the database
 * [*] might consider making colors optional and only update the ones that are provided
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function updateTheme(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let { primary, secondary, tertiary } = req.body;

    //making sure the data is not empty
    if (!primary || !secondary || !tertiary) {
        sendError(res, "Missing inputs");
        return;
    }

    primary = primary.trim();
    secondary = secondary.trim();
    tertiary = tertiary.trim();

    if (isEmpty(primary) || isEmpty(secondary) || isEmpty(tertiary)) {
        sendError(res, "Theme colors are required");
        return;
    }

    //making sure the data is in the right format
    if (!isValidColor(primary) || !isValidColor(secondary) || !isValidColor(tertiary)) {
        sendError(res, "Theme colors are not valid");
        return;
    }

    //applying the changes to the database
    let connection = null;
    try {
        connection = await connectToDb();
    }
    catch (error) {
        sendError(res, "server network error");
        return;
    }

    let id = req.session.userid;
    let query = `UPDATE students SET primary_color = $1, secondary_color = $2, tertiary_color = $3  WHERE id = $4`;

    try {
        await connection.query(query, [primary, secondary, tertiary, id]);
    } catch (error) {
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    sendSuccess(res, "theme updated successfully");
    closeDbConnection(connection);
}

/**
 * Function that updates the user name in the database
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function updateName(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let { name } = req.body;

    //making sure the data is not empty
    if (!name) {
        sendError(res, "invalid inputs");
        return;
    }

    name = name.trim();

    if (isEmpty(name)) {
        sendError(res, "Name is required");
        return;
    }

    let encryptedName = encryptMessage(process.env.ENCRYPTION_KEY, name);
    if (encryptedName.length > STUDENT_MAXNAME_LENGTH) {
        sendError(res, "Name exceed max length allowed");
        return;
    }

    //applying the changes to the database
    let connection = null;
    try {
        connection = await connectToDb();
    }
    catch (error) {
        sendError(res, "server network error");
        return;
    }

    let id = req.session.userid;
    let query = `UPDATE students SET name = $1 WHERE id = $2`;

    try {
        await connection.query(query, [encryptedName, id]);
    } catch (error) {
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    sendSuccess(res, "name updated successfully");
    closeDbConnection(connection);
}

//----------------------------------- DELETE -----------------------------------//

/**
 * Function that deletes the session and logs out the user
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            sendError(res, "Failed to log out");
            return;
        }
        sendSuccess(res, "Logged out successfully");
    });
}

/**
 * Function that deletes the user from the database
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */

export async function deleteUser(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let connection = null;
    try {
        connection = await connectToDb();
    }
    catch (error) {
        sendError(res, "server network error");
        return;
    }

    let id = req.session.userid;
    let query = `DELETE FROM students WHERE id = $1`;

    try {
        await connection.query(query, [id]);
    } catch (error) {
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    req.session.destroy((err) => {
        if (err) {
            sendError(res, "Failed to delete user");
            return;
        }
        sendSuccess(res, "User deleted successfully");
    });
    closeDbConnection(connection);
}