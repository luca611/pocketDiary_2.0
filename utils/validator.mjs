import { closeDbConnection, connectToDb } from "../db/dbClinet.mjs";
import { encryptMessage } from "../security/encryption.mjs";


/**
 * Validate a password
 * @param {string} password - The password to validate
 * @returns {boolean} - True if the password is valid, false otherwise
*/
export function validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    return password.length >= 8 && hasUpperCase;
}


/**
 * Check if a string is empty
 * @param {string} str - The string to check
 * @returns {boolean} - True if the string is empty, false otherwise
 * @throws {Error} - Error if connection fails
*/
export function isEmpty(str) {
    str = str.trim();
    str = str.toLowerCase();
    return !str === "";
}

/**
 * Check if an email is already taken
 * @param {string} email - The email address to check
 * @returns {boolean} - True if the email is taken, false otherwise
*/
export async function isTaken(email) {
    let connection = null;
    try {
        connection = await connectToDb();
    } catch (error) {
        return true;
    }

    let encryptedEmail = encryptMessage(process.env.ENCRYPTION_KEY, email);
    const query = `SELECT * FROM studenti WHERE email = $1`;
    const result = await connection.query(query, [encryptedEmail]);

    closeDbConnection(connection);
    console.log(result.rows.length);

    let len = result.rows.length;
    if (len === 0) {
        return false;
    }
    return true;
}

/**
 * Validate an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if the email is valid, false otherwise
 * @throws {Error} - Error if connection fails
*/
export async function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return false;
    }
}