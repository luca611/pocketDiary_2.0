import { closeDbConnection, connectToDb } from "../db/dbClinet.mjs";
import { decryptMessage, encryptMessage } from "../security/encryption.mjs";
import { sendError, sendNotLoggedIn, sendSuccess } from "../utils/returns.mjs";
import { isValidDate, isValidDescription, isValidTitle } from "../utils/validator.mjs";

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

    let { title, description, date } = req.body;

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

    let encryptedTitle = encryptMessage(req.session.key, title);
    let encryptedDescription = encryptMessage(req.session.key, description);

    let conn = null;
    try {
        conn = await connectToDb();
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    const query = `INSERT INTO note(titolo, testo, dataora, idstudente) VALUES($1, $2, $3, $4)`;
    try {
        await conn.query(query, [encryptedTitle, encryptedDescription, date, req.session.email]);
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

    if (!isValidDate(date)) {
        sendError(res, "Invalid date");
        return;
    }

    let conn = null;
    try {
        conn = await connectToDb();
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    const query = `SELECT * FROM note WHERE idstudente = $1 AND dataora = $2`;
    let result = null;
    try {
        result = await conn.query(query, [req.session.email, date]);
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        closeDbConnection(conn);
        return;
    }

    let notes = result.rows.map((note) => {
        return {
            id: note.id,
            title: decryptMessage(req.session.key, note.titolo),
            description: decryptMessage(req.session.key, note.testo),
            date: note.dataora,
        };
    });

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
    try {
        conn = await connectToDb();
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    const query = `SELECT * FROM note WHERE idstudente = $1 AND id = $2`;
    let result = null;
    try {
        result = await conn.query(query, [req.session.email, id]);
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
        title: decryptMessage(req.session.key, note.titolo),
        description: decryptMessage(req.session.key, note.testo),
        date: note.dataora,
    };

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(200).send({ error: '0', note: noteData });
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
    try {
        conn = await connectToDb();
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    let encryptedTitle = encryptMessage(req.session.key, title);
    let encryptedDescription = encryptMessage(req.session.key, description);
    let encryptedDate = date;

    const existingNoteQuery = `SELECT * FROM note WHERE id = $1 AND idstudente = $2`;
    const query = `UPDATE note SET titolo = $1, testo = $2, dataora = $3 WHERE id = $4 AND idstudente = $5`;
    try {
        const existingNoteResult = await conn.query(existingNoteQuery, [id, req.session.email]);

        if (existingNoteResult.rows.length === 0) {
            sendError(res, "Note not found");
            closeDbConnection(conn);
            return;
        }

        await conn.query(query, [encryptedTitle, encryptedDescription, encryptedDate, id, req.session.email]);
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
    try {
        conn = await connectToDb();
    } catch (err) {
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    const existingNoteQuery = `SELECT * FROM note WHERE id = $1 AND idstudente = $2`;
    const query = `DELETE FROM note WHERE id = $1 AND idstudente = $2`;
    try {
        const existingNoteResult = await conn.query(existingNoteQuery, [id, req.session.email]);

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