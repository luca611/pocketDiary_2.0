import { closeDbConnection, connectToDb } from "../db/dbClinet.mjs";
import { decryptMessage, encryptMessage } from "../security/encryption.mjs";
import { sendError, sendNotLoggedIn, sendServerError, sendSuccess } from "../utils/returns.mjs";
import { isValidDate, isValidDescription, isValidTitle } from "../utils/validator.mjs";
import { NOTE_DESCRIPTION_MAX_LENGTH, NOTE_ENCRYPTEDTITLE_LENGTH, NOTE_TITLE_MAX_LENGTH } from "../utils/vars.mjs";

//----------------------------------- CREATE -----------------------------------//

/**
 * Add a note
 * 
 * @param {Request} req - express request object
 * @param {Response} res - express response object
 */

export async function addNote(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    //data verification
    let { title, description, date } = req.body;

    if (!title || !date) {
        sendError(res, "Missing data");
        return;
    }

    //cleanng data 
    title = title.trim();
    description = description.trim();

    //data validation
    if (!isValidTitle(title)) {
        sendError(res, "Invalid title length");
        return;
    }

    //can be empty
    if (!isValidDescription(description)) {
        sendError(res, "Invalid description length");
        return;
    }

    if (!isValidDate(date)) {
        sendError(res, "Invalid date");
        return;
    }

    //data encryption

    let encryptedTitle = encryptMessage(req.session.key, title);
    if (title.length > NOTE_ENCRYPTEDTITLE_LENGTH) {
        sendError(res, "Title too long");
        return;
    }

    let encryptedDescription = encryptMessage(req.session.key, description);
    if (description.length > NOTE_DESCRIPTION_MAX_LENGTH) {
        sendError(res, "Description too long");
        return;
    }

    //data insertion
    let conn = null;
    let id = req.session.userid;

    try {
        conn = await connectToDb();
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    const query = `INSERT INTO notes(title, description, date, studentID) VALUES($1, $2, $3, $4)`;
    try {
        await conn.query(query, [encryptedTitle, encryptedDescription, date, id]);
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        closeDbConnection(conn);
        return;
    }

    sendSuccess(res, "Note added successfully");
    closeDbConnection(conn);
}

//----------------------------------- READ -----------------------------------//

/**
 * Get all notes of a day
 * 
 * @param {Request} req - express request object
 * @param {Response} res - express response object
 */
export async function getDayNotes(req, res) {

    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let { date } = req.body;

    if (!date) {
        sendError(res, "Invalid date");
        return;
    }

    if (!isValidDate(date, true)) {
        sendError(res, "Invalid date");
        return;
    }

    let conn = null;
    let id = req.session.userid;
    try {
        conn = await connectToDb();
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    const query = `SELECT * FROM notes WHERE studentID = $1 AND date = $2`;
    let result = null;
    try {
        result = await conn.query(query, [id, date]);
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        closeDbConnection(conn);
        return;
    }

    let notes = result.rows.map((notes) => {
        return {
            id: notes.id,
            title: decryptMessage(req.session.key, notes.title),
            description: decryptMessage(req.session.key, notes.description),
            date: notes.date,
        };
    });


    //for comodity i used custom response then the ones in the returns.mjs
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(200).send({ error: '0', notes });
    closeDbConnection(conn);
}

/**
 * Get a specific note by id
 * 
 * @param {Request} req - express request object
 * @param {Response} res - express response object
 */
export async function getNoteById(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let { id } = req.query;

    if (!id) {
        sendError(res, "Invalid id");
        return;
    }

    let conn = null;
    let studentid = req.session.userid;
    try {
        conn = await connectToDb();
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    const query = `SELECT * FROM notes WHERE studentID = $1 AND id = $2`;
    let result = null;
    try {
        result = await conn.query(query, [studentid, id]);
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        closeDbConnection(conn);
        return;
    }

    if (result.rows.length === 0) {
        sendError(res, "Note not found");
        closeDbConnection(conn);
        return;
    }

    let note = result.rows[0];
    let noteData = {
        id: note.id,
        title: decryptMessage(req.session.key, note.title),
        description: decryptMessage(req.session.key, note.description),
        date: note.date,
    };

    //for comodity i used custom response then the ones in the returns.mjs
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(200).send({ error: '0', note: noteData });
    closeDbConnection(conn);
}

/**
 * Get days with notes in a range (ment to be used for calendar so same month is required)
 * 
 * @param {Request} req - express request object
 * @param {Response} res - express response object
*/

export async function getNoteDates(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
        sendError(res, "Invalid range");
        return;
    }

    if (!isValidDate(startDate, true)) {
        sendError(res, "Invalid start date");
        return;
    }

    if (!isValidDate(endDate, true)) {
        sendError(res, "Invalid end date");
        return;
    }

    const startMonth = new Date(startDate).getMonth();
    const endMonth = new Date(endDate).getMonth();

    if (startMonth !== endMonth) {
        sendError(res, "Start date and end date must be in the same month");
        return;
    }

    if (startDate > endDate) {
        sendError(res, "Invalid range");
        return;
    }

    let conn = null;
    let studentid = req.session.userid;
    try {
        conn = await connectToDb();
    } catch (err) {
        console.error(err);
        sendServerError(res, "Database error");
        return;
    }

    const query = `SELECT DISTINCT EXTRACT(DAY FROM DATE) AS days FROM notes WHERE studentid = $1 AND date >= $2 AND date <= $3`;

    let result = null;
    try {
        result = await conn.query(query, [studentid, startDate, endDate]);
    } catch (err) {
        console.error(err);
        sendServerError(res, "Database error");
        closeDbConnection(conn);
        return;
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(200).send({ error: '0', days: result.rows.map((row) => row.days) });
    closeDbConnection(conn);
}

//----------------------------------- UPDATE -----------------------------------//

/**
 * Update a note
 * 
 * @param {Request} req - express request object
 * @param {Response} res - express response object
 */

export async function updateNote(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let { id, title, description, date } = req.body;

    if (!id) {
        sendError(res, "Invalid id");
        return;
    }

    if (!title || !description || !date) {
        sendError(res, "No data to update");
        return;
    }

    if (!isValidTitle(title)) {
        sendError(res, "Invalid title");
        return;
    }

    if (!isValidDescription(description)) {
        sendError(res, "Invalid description");
        return;
    }

    if (!isValidDate(date)) {
        sendError(res, "Invalid date");
        return;
    }

    let conn = null;
    let studentid = req.session.userid;

    try {
        conn = await connectToDb();
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    let encryptedTitle = encryptMessage(req.session.key, title);
    if (title.length > NOTE_ENCRYPTEDTITLE_LENGTH) {
        sendError(res, "Title too long");
        return;
    }

    let encryptedDescription = encryptMessage(req.session.key, description);
    if (description.length > NOTE_DESCRIPTION_MAX_LENGTH) {
        sendError(res, "Description too long");
        return;
    }

    let encryptedDate = date;

    const existingNoteQuery = `SELECT * FROM notes WHERE id = $1 AND studentid = $2`;
    const query = `UPDATE notes SET title = $1, description = $2, date = $3 WHERE id = $4 AND studentid = $5`;
    try {
        const existingNoteResult = await conn.query(existingNoteQuery, [id, studentid]);

        if (existingNoteResult.rows.length === 0) {
            sendError(res, "Note not found");
            closeDbConnection(conn);
            return;
        }

        await conn.query(query, [encryptedTitle, encryptedDescription, encryptedDate, id, studentid]);
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        closeDbConnection(conn);
        return;
    }

    sendSuccess(res, "Note updated successfully");
    closeDbConnection(conn);
}

//----------------------------------- DELETE -----------------------------------//

/**
 * Delete a note
 * @param {Request} req - express request object
 * @param {Response} res - express response object
*/
export async function deleteNote(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let { id } = req.query;

    if (!id) {
        sendError(res, "Invalid id");
        return;
    }

    let conn = null;
    let studentid = req.session.userid;
    try {
        conn = await connectToDb();
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    const existingNoteQuery = `SELECT * FROM notes WHERE id = $1 AND studentid = $2`;
    const query = `DELETE FROM notes WHERE id = $1 AND studentid = $2`;
    try {
        const existingNoteResult = await conn.query(existingNoteQuery, [id, studentid]);

        if (existingNoteResult.rows.length === 0) {
            sendError(res, "Note not found");
            closeDbConnection(conn);
            return;
        }

        await conn.query(query, [id, req.session.email]);
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        closeDbConnection(conn);
        return;
    }

    sendSuccess(res, "Note deleted successfully");
    closeDbConnection(conn);
}