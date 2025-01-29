import { encryptMessage } from "../security/encryption.mjs";
import { sendError, sendSuccess } from "../utils/returns.mjs";
import { isEmpty, isTaken, isValidEmail, validatePassword } from "../utils/validator.mjs";

export async function register(req, res) {
    let { email, password, ntema, name } = req.body;

    // email checks
    email = email.trim();
    email = email.toLowerCase();

    if (isEmpty(email)) {
        sendError(res, "Email is required");
        return;
    }

    if (!isValidEmail(email)) {
        console.log("email invalid");
        sendError(res, "Email format is invalid");
        return;
    }

    if (isTaken(email)) {
        sendError(res, "Email is already in use");
        return;
    }

    // password checks
    password = password.trim();

    if (isEmpty(password)) {
        sendError(res, "Password is required");
        return;
    }

    if (!validatePassword(password)) {
        sendError(res, "Password too weak");
        return;
    }

    // name checks
    name = name.trim();
    name = name.toLowerCase();

    if (isEmpty(name)) {
        sendError(res, "Name is required");
        return;
    }

    // ntema checks
    if(typeof ntema !== 'number'){
        sendError(res, "theme type not valid");
        return;
    }

    if(!(ntema < 1 || ntema > 4)){
        sendError(res, "invalid theme");
        return;
    }


    sendSuccess(res, "User registered successfully");
    let connection = null;
    try {
        connection = await connectToDb();
    } catch (error) {
        sendError(res, "server network error");
        return;
    }

    let encryptedEmail = encryptMessage(process.env.ENCRYPTION_KEY, email);
    let encryptedPassword = encryptMessage(process.env.ENCRYPTION_KEY, password);
    let encryptedName = encryptMessage(process.env.ENCRYPTION_KEY, name);
    let theme = ntema;
    let key = encryptMessage(process.env.ENCRYPTION_KEY, generateKey());

    const query = `INSERT INTO studenti (email, password, nome, ntema, chiave) VALUES ($1, $2, $3, $4, $5)`;

    try {
        await connection.query(query, [encryptedEmail, encryptedPassword, encryptedName, theme, key]);
    } catch
    (error) {
        sendError(res, "server network error");
        return;
    }
    closeDbConnection(connection);

    sendSuccess(res, "User registered successfully");


}