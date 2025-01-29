/**
 * send an error response
 * 
 * @param {Response} res - express response object
 * @param {string} message - error message
 */

export function sendError(res, message) {
    res.status(400).send({ error: '1', message });
}

/** 
 * send a success response
 * 
 * @param {Response} res - express response object
 * @param {string} message - success message
 */
export function sendSuccess(res, message) {
    res.status(200).send({ error: '0', message });
}

/**
 * send a not logged in response
 * 
 * @param {Response} res - express response object
 */
export function sendNotLoggedIn(res) {
    res.status(401).send({ error: '1', message: 'Login required' });
}