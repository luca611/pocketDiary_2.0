import e from "express";
import { connectToDb, closeDbConnection } from "../db/dbClinet.mjs";
import { createHash, decryptMessage, encryptMessage, generateKey } from "../security/encryption.mjs";
import { sendError, sendSuccess } from "../utils/returns.mjs";
import { isEmpty, isTaken, isValidEmail, validatePassword } from "../utils/validator.mjs";
import session from "express-session";


/**
 * Function that validate user credentials and adds it to the server
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function register(req, res) {
    req.session.email = "";
    req.session.name = "";
    req.session.theme = "";
    req.session.key = "";
    req.session.password = "";

    console.log("register session: ", req.session);

    let { email, password, ntema, name } = req.body;

    // email checks
    email = email.trim();
    email = email.toLowerCase();

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

    // ntema checks
    if (typeof ntema !== 'number') {
        sendError(res, "theme type not valid");
        return;
    }

    if (ntema < 1 || ntema > 4) {
        sendError(res, "invalid theme");
        return;
    }

    let connection = null;
    try {
        connection = await connectToDb();
    } catch (error) {
        sendError(res, "server network error");
        return;
    }

    let encryptedEmail = encryptMessage(process.env.ENCRYPTION_KEY, email);
    let encryptedPassword = createHash(password)
    let encryptedName = encryptMessage(process.env.ENCRYPTION_KEY, name);
    let theme = ntema;
    let key = encryptMessage(process.env.ENCRYPTION_KEY, generateKey());

    const query = `INSERT INTO studenti (email, password, nome, ntema, chiave) VALUES ($1, $2, $3, $4, $5)`;

    try {
        await connection.query(query, [encryptedEmail, encryptedPassword, encryptedName, theme, key]);
    } catch (error) {
        console.log(error);
        sendError(res, "server network error");
        closeDbConnection(connection);
        return;
    }

    try {
        closeDbConnection(connection);
    } catch (e) {
        sendError(res, "network error");
        return
    }

    //binding credential to session
    req.session.email = encryptedEmail;
    req.session.name = encryptedName;
    req.session.theme = ntema;
    req.session.key = decryptMessage(process.env.ENCRYPTION_KEY, key);
    req.session.password = encryptedPassword;

    sendSuccess(res, "User registered successfully");
    closeDbConnection(connection);
}

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
 * 
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function login(req, res) {
    req.session.email = "";
    req.session.name = "";
    req.session.theme = "";
    req.session.key = "";
    req.session.password = "";

    let { email, password } = req.body;

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

    // closing connection
    try {
        closeDbConnection(connection);
    } catch (e) {
        sendError(res, "network error");
    }

    // see if there's a user matching username and password
    // there should be only 1 match but to avoid any kind
    // of error i prefere

    if (result.rows.length != 1) {
        sendError(res, "Invalid credentials");
        return;
    }

    const user = result.rows[0];

    //binding user information to session
    req.session.email = email;
    req.session.name = user.nome;
    req.session.password = password;
    req.session.theme = user.ntema;
    req.session.key = decryptMessage(process.env.ENCRYPTION_KEY, user.chiave);

    sendSuccess(res, "logged in successful");
}