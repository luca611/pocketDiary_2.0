import { sendError, sendSuccess } from "../utils/returns.mjs";
import { isEmpty, isTaken, isValidEmail, validatePassword } from "../utils/validator.mjs";

export async function register(req, res) {
    let { email, password, ntema, name } = req.body;

    console.log(req.body);
    if (await isEmpty(email)) {
        sendError(res, "Email is required");
        return;
    }

    if (await !isTaken(email)) {
        sendError(res, "Email is already in use");
        return;
    }

    if (await !isValidEmail(email)) {
        sendError(res, "Email is invalid");
        return;
    }

    if (await isEmpty(password)) {
        sendError(res, "Password is required");
        return;
    }

    if (await !validatePassword(password)) {
        sendError(res, "Password must be at least 8 characters long");
        return
    }

    sendSuccess(res, "User registered successfully");


}