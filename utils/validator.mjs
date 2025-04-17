import { closeDbConnection, connectToDb } from "../db/dbClinet.mjs";
import { encryptMessage } from "../security/encryption.mjs";
import { sendError, sendServerError, sendSuccess } from "./returns.mjs";
import { NOTE_DESCRIPTION_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from "./vars.mjs";

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
    const query = `SELECT * FROM students WHERE email = $1`;
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

/**
 * Validate a title
 * @param {string} title - The title to validate
 * @returns {boolean} - True if the title is valid, false otherwise
*/
export function isValidTitle(title) {
    if (title.length < 1 || title.length > NOTE_TITLE_MAX_LENGTH) {
        return false;
    }
    return true;
}

/**
 * Validate a description
 * @param {string} description - The description to validate
 * @returns {boolean} - True if the description is valid, false otherwise
*/
export function isValidDescription(description) {
    if (description.length > NOTE_DESCRIPTION_MAX_LENGTH) {
        return false;
    }
    return true;
}

/**
 * Validate an email
 * @param {string} email - The email to validate
 * @returns {boolean} - True if the email is valid, false otherwise
*/
export async function validateEmail(req, res) {
    const { email } = req.query;
    if (!email) {
        return sendError(res, "Email cannot be empty");
    }
    let client = null;
    try {
        client = await connectToDb();
    } catch (error) {
        return sendError(res, "Error connecting to database");
    }
    const encryptedEmail = encryptMessage(process.env.ENCRYPTION_KEY, email);
    const query = `SELECT * FROM students WHERE email = $1`;
    try {
        const result = await client.query(query, [encryptedEmail]);
        closeDbConnection(client);
        if (result.rows.length > 0) {
            return sendError(res, "Email already taken");
        }
        return sendSuccess(res, "Email is valid");
    } catch (error) {
        return sendServerError(res, "Error validating email");
    }
}

/**
 * Validate a date
 * @param {string} date - The date to validate
 * @returns {boolean} - True if the date is valid, false otherwise
*/
export function isValidDate(date, canBeInPast = false) {
    const dateParts = date.split('/');
    if (dateParts.length !== 3) {
        return false;
    }
    const [month, day, year] = dateParts.map(part => parseInt(part, 10));
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
        return false;
    }
    const parsedDate = new Date(year, month - 1, day);
    if (parsedDate.getMonth() + 1 !== month || parsedDate.getDate() !== day || parsedDate.getFullYear() !== year) {
        return false;
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(now.getFullYear() + 10);

    if (isNaN(parsedDate.getTime())) {
        return false;
    }

    if (canBeInPast) {
        return parsedDate <= maxFutureDate;
    }
    return parsedDate >= now && parsedDate <= maxFutureDate;
}

/**
 * Validate a color
 * @param {string} color - The color to validate
 * @return {boolean} - True if the color is valid, false otherwise
 * */
export function isValidColor(color) {
    const hexColorRegex = /^[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(color);
}