import { closeDbConnection, connectToDb } from "../db/dbClinet.mjs";
import { decryptMessage, encryptMessage } from "../security/encryption.mjs";
import { sendError, sendNotLoggedIn, sendSuccess } from "../utils/returns.mjs";
import { isValidDate } from "../utils/validator.mjs";
import { MARK_MAXSUBJECT_LENGTH, MARK_MAXTITLE_LENGTH, MARK_MAXGRADE } from "../utils/vars.mjs";

//----------------------------------- CREATE -----------------------------------//
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
    let studentId = req.session.userid;

    if (!mark || !title || !subject || !date) {
        sendError(res, "Missing inputs");
        return;
    }

    title = title.trim();
    subject = subject.trim();
    date = date.trim();
    mark = parseFloat(mark.toFixed(2));

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
        closeDbConnection(connection)
        return;
    }

    closeDbConnection(connection);
    sendSuccess(res, "Mark added successfully");
    return;
}

//----------------------------------- READ -----------------------------------//
/**
 * Get all marks from the database
 * 
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * 
 * @returns {Promise<void>} - A promise that resolves when the marks are retrieved
 */

export async function getMarks(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let studentId = req.session.userid;
    let connection = null;
    try {
        connection = await connectToDb();
    } catch (error) {
        console.error(error);
        sendError(res, "server network error");
        return;
    }

    const query = `SELECT id, mark, title, subject, date FROM marks WHERE studentid = $1 ORDER BY date DESC`;
    const values = [studentId];

    let results = null;
    try {
        results = await connection.query(query, values);
    } catch (error) {
        console.log(error);
        sendError(res, "server internal error, try again");
        closeDbConnection(connection)
        return;
    }

    closeDbConnection(connection);

    let marks = results.rows.map(mark => ({
        id: mark.id,
        mark: mark.mark,
        title: decryptMessage(req.session.key, mark.title),
        subject: decryptMessage(req.session.key, mark.subject),
        date: mark.date,
    }));

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(200).send({ error: '0', marks });

    return;
}

/**
 * Get marks by subject from the database
 * 
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * 
 * @returns {Promise<void>} - A promise that resolves when the marks are retrieved
 */
export async function getMarksBySubject(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let subject = req.query.subject;

    if (!subject) {
        sendError(res, "Missing inputs");
        return;
    }
    subject = subject.trim();


    let studentId = req.session.userid;
    let connection = null;
    try {
        connection = await connectToDb();
    } catch (error) {
        console.error(error);
        sendError(res, "server network error");
        return;
    }

    console.log("subject", subject);
    const query = `SELECT id, mark, title, subject, date FROM marks WHERE studentid = $1 AND subject ILIKE $2`;
    const values = [studentId, subject];

    let results = null;
    try {
        results = await connection.query(query, values);
    } catch (error) {
        console.log(error);
        sendError(res, "server internal error, try again");
        closeDbConnection(connection)
        return;
    }

    closeDbConnection(connection);

    let marks = results.rows.map(mark => ({
        id: mark.id,
        mark: mark.mark,
        title: decryptMessage(req.session.key, mark.title),
        subject: decryptMessage(req.session.key, mark.subject),
        date: mark.date,
    }));

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(200).send({ error: '0', marks });
}

/**
 * Get marks by date from the database
 * 
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * 
 * @returns {Promise<void>} - A promise that resolves when the marks are retrieved
 */

export async function getSubjects(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let studentId = req.session.userid;
    let connection = null;
    try {
        connection = await connectToDb();
    } catch (error) {
        console.error(error);
        sendError(res, "server network error");
        return;
    }

    const query = `SELECT DISTINCT subject FROM marks WHERE studentid = $1`;
    const values = [studentId];

    let results = null;
    try {
        results = await connection.query(query, values);
    } catch (error) {
        console.log(error);
        sendError(res, "server internal error, try again");
        closeDbConnection(connection)
        return;
    }

    closeDbConnection(connection);

    let subjects = results.rows.map(subject => ({
        subject: decryptMessage(req.session.key, subject.subject),
    }));

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(200).send({ error: '0', subjects });

}
