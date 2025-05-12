import { closeDbConnection, connectToDb } from "../db/dbClinet.mjs";
import { decryptMessage, encryptMessage } from "../security/encryption.mjs";
import { sendError, sendNotLoggedIn, sendSuccess } from "../utils/returns.mjs";
import { HOUR_MAXENCNAME_LENGTH, HOUR_MAXNAME_LENGTH } from "../utils/vars.mjs";

export async function getHours(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    const { day } = req.query;
    let studentId = req.session.userid;

    if (!day) {
        sendError(res, "Missing day");
        return;
    }

    const dayMapping = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 7
    };

    const dayValue = dayMapping[day.toLowerCase()];
    if (!dayValue) {
        sendError(res, "Invalid day name");
        return;
    }

    const query = "SELECT * FROM hours WHERE studentid = ? AND day = ?";
    const values = [studentId, dayValue];

    let connection = null;
    try {
        connection = await connectToDb();
    } catch (error) {
        console.error(error);
        sendError(res, "server network error");
        return;
    }

    try {
        results = await connection.query(query, values);
    } catch (error) {
        console.log(error);
        sendError(res, "server internal error, try again");
        closeDbConnection(connection)
        return;
    }

    const hours = results.rows.map(hour => ({
        id: hour.id,
        name: decryptMessage(req.session.key, hour.name),
        hour: hour.hour,
    }));
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(200).send({ error: '0', hours });
    closeDbConnection(connection);
}


/**
 * Deletes an hour from the database
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
export async function addHour(req, res) {
    if (!req.session.logged) {
        sendNotLoggedIn(res);
        return;
    }

    const { day, hour, name } = req.body;
    let studentId = req.session.userid;

    if (!day || !hour || !name) {
        sendError(res, "Missing data");
        return;
    }

    if (name.length > HOUR_MAXNAME_LENGTH) {
        sendError(res, "Name too long");
        return;
    }

    const dayMapping = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 7
    };

    const dayValue = dayMapping[day.toLowerCase()];
    if (!dayValue) {
        sendError(res, "Invalid day name");
        return;
    }

    let encryptedname = encryptMessage(req.session.key, name);
    if (encryptedname.length > HOUR_MAXENCNAME_LENGTH) {
        sendError(res, "Name too long");
        return;
    }

    const query = "INSERT INTO hours (studentid, day, hour, name) VALUES ($1, $2, $3, $4)";
    const values = [studentId, dayValue, hour, encryptedname];
    let connection = null;
    try {
        connection = await connectToDb();
    } catch (error) {
        console.error(error);
        sendError(res, "server network error");
        return;
    }
    try {
        await connection.query(query, values).catch(error => {
            console.error("Query Error:", error.message);
            throw error;
        });
    } catch (error) {
        console.log(error);
        sendError(res, "server internal error, try again");
        closeDbConnection(connection)
        return;
    }
    sendSuccess(res, "Hour added successfully");
    closeDbConnection(connection);
}



