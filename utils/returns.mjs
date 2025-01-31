/**
 * send an error response
 * 
 * @param {Response} res - express response object
 * @param {string} message - error message
 */
export function sendError(res, message) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(400).send({ error: '1', message });
}

/** 
 * send a success response
 * 
 * @param {Response} res - express response object
 * @param {string} message - success message
 */
export function sendSuccess(res, message) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(200).send({ error: '0', message });
}

/**
 * send a not logged in response
 * 
 * @param {Response} res - express response object
 */
export function sendNotLoggedIn(res) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(401).send({ error: '1', message: 'Login required' });
}