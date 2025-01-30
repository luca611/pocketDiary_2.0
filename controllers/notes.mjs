import { closeDbConnection, connectToDb } from "../db/dbClinet.mjs";
import { decryptMessage, encryptMessage } from "../security/encryption.mjs";
import { sendError, sendNotLoggedIn, sendSuccess } from "../utils/returns.mjs";
import { isValidDate, isValidDescription, isValidTitle } from "../utils/validator.mjs";

//----------------------------------- CREATE -----------------------------------//

/**
 * Add a note :: TO BE TESTED
 * 
 * @param {Request} req - express request object
 * @param {Response} res - express response object
 */

export async function addNote(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let {title, description, date} = req.body;
    
    if(!isValidTitle(title)) {
        sendError(res, "Invalid title");
        return;
    }

    if(!isValidDescription(description)) {
        sendError(res, "Invalid description");
        return;
    }

    if(!isValidDate(date)) {
        sendError(res, "Invalid date");
        return;
    }

    let encryptedTitle = encryptMessage(title);
    let encryptedDescription = encryptMessage(description);
    let encryptedDate = encryptMessage(date);

    let conn = null;
    try{
        conn = await connectToDb();
    }catch(err){
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    const query = `INSERT INTO notes(titolo, testo, dataora, idstudente) VALUES($1, $2, $3, $4)`;
    try{
        await conn.query(query, [encryptedTitle, encryptedDescription, encryptedDate, req.session.email]);
    }catch(err){
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
 * Get all notes of a day :: TO BE TESTED
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

    if(!isValidDate(date)) {
        sendError(res, "Invalid date");
        return;
    }

    let conn = null;
    try{
        conn = await connectToDb();
    }catch(err){
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    let encryptedEmail = encryptMessage(req.session.email);
    const query = `SELECT * FROM notes WHERE idstudente = $1 AND dataora = $2`;
    let result = null;
    try{
        result = await conn.query(query, [encryptedEmail, encryptMessage(date)]);
    }catch(err){
        console.error(err);
        sendError(res, "Database error");
        closeDbConnection(conn);
        return;
    }

    let notes = result.rows.map((note) => {
        return {
            id: note.id,
            title: decryptMessage(note.titolo),
            description: decryptMessage(note.testo),
            date: decryptMessage(note.dataora),
        };
    });

    res.status(200).send({error: '0', notes});
    closeDbConnection(conn);
}

/**
 * Get a specific note by id :: TO BE TESTED
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

    let conn = null;
    try{
        conn = await connectToDb();
    }catch(err){
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    let encryptedEmail = encryptMessage(req.session.email);
    const query = `SELECT * FROM notes WHERE idstudente = $1 AND id = $2`;
    let result = null;
    try{
        result = await conn.query(query, [encryptedEmail, id]);
    }catch(err){
        console.error(err);
        sendError(res, "Database error");
        closeDbConnection(conn);
        return;
    }

    if(result.rows.length === 0){
        sendError(res, "Note not found");
        closeDbConnection(conn);
        return;
    }

    let note = result.rows[0];
    let noteData = {
        id: note.id,
        title: decryptMessage(note.titolo),
        description: decryptMessage(note.testo),
        date: decryptMessage(note.dataora),
    };

    res.status(200).send({error: '0', note: noteData});
    closeDbConnection(conn);
}

//----------------------------------- UPDATE -----------------------------------//

/**
 * Update a note :: TO BE TESTED
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

    if(!isValidTitle(title)) {
        sendError(res, "Invalid title");
        return;
    }

    if(!isValidDescription(description)) {
        sendError(res, "Invalid description");
        return;
    }

    if(!isValidDate(date)) {
        sendError(res, "Invalid date");
        return;
    }

    let conn = null;
    try{
        conn = await connectToDb();
    }catch(err){
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    let encryptedTitle = encryptMessage(title);
    let encryptedDescription = encryptMessage(description);
    let encryptedDate = encryptMessage(date);

    const query = `UPDATE notes SET titolo = $1, testo = $2, dataora = $3 WHERE id = $4 AND idstudente = $5`;
    try{
        await conn.query(query, [encryptedTitle, encryptedDescription, encryptedDate, id, req.session.email]);
    }
    catch(err){
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
 * Delete a note :: TO BE TESTED
 * @param {Request} req - express request object
 * @param {Response} res - express response object
*/
export async function deleteNote(req,res){
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    let { id } = req.body;

    let conn = null;
    try{
        conn = await connectToDb();
    }catch(err){
        console.error(err);
        sendError(res, "Database error");
        return;
    }

    const query = `DELETE FROM notes WHERE id = $1 AND idstudente = $2`;
    try{
        await conn.query(query, [id, req.session.email]);
    }catch(err){
        console.error(err);
        sendError(res, "Database error");
        closeDbConnection(conn);
        return;
    }

    sendSuccess(res, "Note deleted successfully");
    closeDbConnection(conn);
}