import { Query } from "pg";
import { connectToDb } from "../db/dbClinet.mjs";
import { createHash, decryptMessage, encryptMessage } from "../security/encryption.mjs";
import { sendError, sendSuccess } from "../utils/returns.mjs";
import { isEmpty, isTaken, isValidEmail, validatePassword } from "../utils/validator.mjs";
import { query } from "express";


/**
 * Function that validate user credentials and adds it to the server
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function register(req, res) {
    let { email, password, ntema, name } = req.body;

    // email checks
    email = email.trim();
    email = email.toLowerCase();

    if (isEmpty(email)) {
        sendError(res, "Email is required");
        return;
    }

    if (!isValidEmail(email)) {
        console.log("email invalid");
        sendError(res, "Email format is invalid");
        return;
    }

    if (isTaken(email)) {
        sendError(res, "Email is already in use");
        return;
    }

    // password checks
    password = password.trim();

    if (isEmpty(password)) {
        sendError(res, "Password is required");
        return;
    }

    if (!validatePassword(password)) {
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
    if(typeof ntema !== 'number'){
        sendError(res, "theme type not valid");
        return;
    }

    if(!(ntema < 1 || ntema > 4)){
        sendError(res, "invalid theme");
        return;
    }


    sendSuccess(res, "User registered successfully");
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
    } catch(error) {
        sendError(res, "server network error");
        return;
    }

    try{
        closeDbConnection(connection);
    }catch(e){
        sendError(res, "network error");
    }

    //binding credential to session
    req.session.email = encryptedEmail;
    req.session.name = encryptedName;
    req.session.theme = ntema;
    req.session.key = key;

    sendSuccess(res, "User registered successfully");
}

/**
 * 
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function login(req, res){
    let { email, password } = req.body;
    
    if(isEmpty(email) || isEmpty(password)){
        sendError("invalid inputs: email or password is empty");
        return;
    }

    let connection = null;
    
    try{
        connection = await connectToDb();
    }catch(error){
        sendError(res, "server network error");
        return;
    }

    // ensuring data is the same format of the ones in db
    email = encryptMessage(process.env.ENCRYPT_KEY, email);
    password = createHash(password); 

    // cheking on the db 
    const query = `SELECT chiave, nome, ntema FROM studenti WHERE email = $1 AND password = $2`;
    const params = [email, password];
    let result;
    try{
        result = await client.query(query, params);
    }catch(e){
        sendError(res, "network error");
        closeDbConnection(connection);
        return;
    }
    
    // closing connection
    try{
        closeDbConnection(connection);
    }catch(e){
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
    req.session.email = user.email;
    req.session.name = user.nome;
    req.session.password = user.password;
    req.session.key = decryptMessage(process.env.ENCRYPTION_KEY, user.key)

    sendSuccess(res, "logged in successful");
}