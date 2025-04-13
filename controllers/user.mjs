import { connectToDb, closeDbConnection } from "../db/dbClinet.mjs";
import { createHash, decryptMessage, encryptMessage, generateKey } from "../security/encryption.mjs";
import { sendError, sendSuccess, sendNotLoggedIn } from "../utils/returns.mjs";
import { isEmpty, isTaken, isValidColor, isValidEmail, validatePassword } from "../utils/validator.mjs";

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
    req.session.id = "";
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
    if (isValidColor(primary) && isValidColor(secondary) && isValidColor(tertiary)) {
        sendError(res, "Theme colors are not valid");
        return;
    }

    let encryptedEmail = encryptMessage(process.env.ENCRYPTION_KEY, email);
    let encryptedPassword = createHash(password)
    let encryptedName = encryptMessage(process.env.ENCRYPTION_KEY, name);
    let primary_color = primary
    let secondary_color = secondary
    let tertiary_color = tertiary
    let key = encryptMessage(process.env.ENCRYPTION_KEY, generateKey());

    const query = `INSERT INTO students (email, password, name, primary_color, secondary_color, tertiary_color, key) VALUES ($1, $2, $3, $4, $5, $6)`;

    try {
        await connection.query(query, [encryptedEmail, encryptedPassword, encryptedName, primary_color, secondary_color, tertiary_color, key]);
    } catch (error) {
        console.log(error);
        sendError(res, "server internal error, try again");
        closeDbConnection(connection);
        return;
    }

    //get the user id from the database
    const query2 = `SELECT key FROM studenti WHERE email = $1`;
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

    //binding credential to session
    req.session.key = decryptMessage(process.env.ENCRYPTION_KEY, key);
    req.session.id = userid.rows[0].key;
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
    const query = `SELECT chiave, nome, ntema FROM studenti WHERE email = $1 AND password = $2`;
    const params = [email, password];
    let result;
    try {
        result = await connection.query(query, params);
    } catch (e) {
        sendError(res, "network error");
        closeDbConnection(connection);
        return;
    }

    // see if there's a user matching username and password
    // there should be only 1 match but to avoid any kind
    // of error i prefered to check the length of the result

    if (result.rows.length != 1) {
        sendError(res, "Invalid credentials");
        return;
    }

    const user = result.rows[0];

    //binding user information to session
    req.session.email = email;
    req.session.key = decryptMessage(process.env.ENCRYPTION_KEY, user.chiave);
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

    let encryptedEmail = req.session.email;
    let query = `SELECT ntema FROM studenti WHERE email = $1`;

    let result;
    try {
        result = await connection.query(query, [encryptedEmail]);
    } catch (error) {
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    let theme = result.rows[0].ntema;
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

    let encryptedEmail = req.session.email;
    let query = `SELECT nome FROM studenti WHERE email = $1`;

    let result;
    try {
        result = await connection.query(query, [encryptedEmail]);
    } catch (error) {
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    let name = decryptMessage(process.env.ENCRYPTION_KEY, result.rows[0].nome);
    sendSuccess(res, name);
    closeDbConnection(connection);
}

/**
 * Function that gets the user email from the database
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 * 
 */
export async function getCustomTheme(req, res) {
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

    let encryptedEmail = req.session.email;
    let query = `SELECT HexCustom FROM studenti WHERE email = $1`;

    let result;
    try {
        result = await connection.query(query, [encryptedEmail]);
    } catch (error) {
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    let customTheme = result.rows[0].hexcustom;
    sendSuccess(res, customTheme);
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

    if (req.session.password === createHash(newPassword)) {
        sendError(res, "Password is the same as the old one");
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

    let encryptedEmail = req.session.email;
    let encryptedNewPassword = createHash(newPassword);
    let query = `UPDATE studenti SET password = $1 WHERE email = $2`;

    try {
        await connection.query(query, [encryptedNewPassword, encryptedEmail]);
    } catch (error) {
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }


    req.session.password = encryptedNewPassword;
    sendSuccess(res, "Password updated successfully");
    closeDbConnection(connection);
}

/**
 * Function that updates the user theme in the database
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

    let { theme } = req.body;

    if (!theme) {
        sendError(res, "invalid inputs");
        return;
    }

    if (typeof theme !== 'number') {
        sendError(res, "theme type not valid");
        return;
    }

    if (theme < 1 || theme > 4) {
        sendError(res, "invalid theme");
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

    let encryptedEmail = req.session.email;
    let query = `UPDATE studenti SET ntema = $1 WHERE email = $2`;

    try {
        await connection.query(query, [theme, encryptedEmail]);
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

    if (!name) {
        sendError(res, "invalid inputs");
        return;
    }

    name = name.trim();

    if (isEmpty(name)) {
        sendError(res, "Name is required");
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

    let encryptedEmail = req.session.email;
    let encryptedName = encryptMessage(process.env.ENCRYPTION_KEY, name);
    let query = `UPDATE studenti SET nome = $1 WHERE email = $2`;

    try {
        await connection.query(query, [encryptedName, encryptedEmail]);
    } catch (error) {
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    sendSuccess(res, "name updated successfully");
    closeDbConnection(connection);
}

/**
 * Function that updates the user custom theme in the database
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function updateCustomTheme(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let { customTheme } = req.body;

    if (!customTheme) {
        sendError(res, "invalid inputs");
        return;
    }

    if (isEmpty(customTheme)) {
        sendError(res, "Custom theme is required");
        return;
    }

    const hexPattern = /^#[0-9A-Fa-f]{6};#[0-9A-Fa-f]{6};#[0-9A-Fa-f]{6}$/;

    if (!hexPattern.test(customTheme)) {
        sendError(res, "Custom theme format is invalid");
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

    let encryptedEmail = req.session.email;
    let query = `UPDATE studenti SET hexcustom = $1 WHERE email = $2`;

    try {
        await connection.query(query, [customTheme, encryptedEmail]);
    } catch (error) {
        console.log(error);
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    sendSuccess(res, "Custom theme updated successfully");
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

    let encryptedEmail = req.session.email;
    let query = `DELETE FROM studenti WHERE email = $1`;

    try {
        await connection.query(query, [encryptedEmail]);
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