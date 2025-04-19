import { closeDbConnection, connectToDb } from "../db/dbClinet.mjs";
import { encryptMessage } from "../security/encryption.mjs";
import { sendError, sendNotLoggedIn, sendSuccess } from "../utils/returns.mjs";
import { isValidDate } from "../utils/validator.mjs";
import { MARK_MAXSUBJECT_LENGTH, MARK_MAXTITLE_LENGTH, MARK_MAXGRADE } from "../utils/vars.mjs";

/**
 * Add a mark to the database
 * 
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * 
 * @returns {Promise<void>} - A promise that resolves when the mark is added
 */

export async function addMark(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let { mark, title, subject, date } = req.body;
    const studentId = req.session.studentId;

    if (!mark || !title || !subject || !date) {
        sendError(res, "Missing inputs");
        return;
    }

    title = title.trim();
    subject = subject.trim();
    date = date.trim();
    mark = parseFloat(mark);

    if (isNaN(mark)) {
        sendError(res, "Mark must be a number");
        return;
    }

    if (title.length > MARK_MAXTITLE_LENGTH || title.length < 1) {
        sendError(res, "Mark title too long");
        return;
    }

    if (subject.length > MARK_MAXSUBJECT_LENGTH || subject.length < 1) {
        sendError(res, "Mark subject too long");
        return;
    }

    if (mark < 0 || mark > MARK_MAXGRADE) {
        sendError(res, "Mark must be between 0 and 10");
        return;
    }

    if (!isValidDate(date, true)) {
        sendError(res, "Invalid date format");
        return;
    }

    let connection = null;
    try {
        connection = await connectToDb();
    } catch (error) {
        console.error(error);
        sendError(res, "server network error");
        return;
    }

    title = encryptMessage(req.session.key, title);
    subject = encryptMessage(req.session.key, subject);

    const query = `INSERT INTO marks (studentid, mark, title, subject, date) VALUES ($1, $2, $3, $4, $5)`;
    const values = [studentId, mark, title, subject, date];

    try {
        await connection.query(query, values);
    } catch (error) {
        console.log(error);
        sendError(res, "server internal error, try again");
        closeDbConnection(client)
        return;
    }

    closeDbConnection(connection);
    sendSuccess(res, "Mark added successfully");
    return;
}