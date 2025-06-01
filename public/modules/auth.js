/**
 * Auth module for handling user authentication and authorization.
 * This module provides functions to check if a user is authenticated and to log or register a user.
 */


export const logged = 1;
export const notLogged = 0;
export const error = -1;
export const missingData = -2;
export const emailTaken = -3;
export const emailAvailable = 1;

/**
 * function to check currrent user authentication status
 * @returns {Promise<number>} - Returns a promise that resolves to:
 *                             - 1 if the user is authenticated,
 *                             - 0 if the user is not authenticated,
 *                             - -1 if there was an error during the check.
 */
export async function isAuthenticated() {
    try {
        if (!navigator.onLine) {
            return error;
        }

        const url = "/isLogged";
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        return new Promise((resolve, reject) => {
            xhr.open("GET", url);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = function () {
                if (xhr.status === 200) {
                    let response = JSON.parse(xhr.responseText);
                    if (response.error === "0") {
                        resolve(logged);
                    } else {
                        resolve(error);
                    }
                } else {
                    //since server respond with 400 when user is not authenticated i can assume it's for that reason
                    resolve(notLogged);
                }
            };
            xhr.onerror = function () {
                resolve(error);
            };
            xhr.send();
        });
    } catch (e) {
        return error;
    }
}


/**
 * Function to log in a user.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<number>} - Returns a promise that resolves to:
 *                             - 1 if the login was successful,
 *                             - 0 if the login failed,
 *                             - -1 if there was an error during the login process.
 */

export async function login(email = null, password = null) {
    try {
        if (email === null || password === null) {
            return missingData;
        }

        if (!navigator.onLine) {
            return error;
        }

        const url = "/login";
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        return new Promise((resolve, reject) => {
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = function () {
                if (xhr.status === 200 || xhr.status === 400) {
                    let response = JSON.parse(xhr.responseText);
                    let message = response.message || "No info provided";

                    if (response.error == "0") {
                        resolve({ status: logged, message: message });
                    } else {
                        resolve({ status: notLogged, message: message });
                    }
                } else {
                    resolve({ status: notLogged, message: "Unexpected response from server" });
                }
            };

            xhr.onerror = function () {
                resolve({ status: error, message: "Network error occurred" });
            };

            xhr.send(JSON.stringify({ email, password }));
        });
    } catch (e) {
        return { status: error, message: e.message };
    }
}


/**
 * Function to register a new user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<number>} - Returns a promise that resolves to:
 *                             - 1 if the registration was successful,
 *                             - 0 if the registration failed,
 *                             - -1 if there was an error during the registration process.
 */
export async function checkEmailAvailability(email) {
    try {
        if (!email) {
            return missingData;
        }

        if (!navigator.onLine) {
            return error;
        }

        const url = "/checkEmail" + "?email=" + encodeURIComponent(email);
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        return new Promise((resolve, reject) => {
            xhr.open("GET", url);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = function () {
                if (xhr.status === 200 || xhr.status === 400) {
                    let response = JSON.parse(xhr.responseText);
                    if (response.error == "0") {
                        resolve({ status: emailAvailable, message: "Email is available" });
                    } else {
                        resolve({ status: emailTaken, message: "Email is already taken" });
                    }
                } else {
                    resolve({ status: error, message: "Unexpected response from server" });
                }
            };

            xhr.onerror = function () {
                resolve({ status: error, message: "Network error occurred" });
            };

            xhr.send();
        });
    } catch (e) {
        return { status: error, message: e.message };
    }
}


/**
 * Function to validate a password.
 * @param {string} password - The password to validate.
 * @returns {Object} - Returns an object with status and message:
 *                     - status: true if valid, false if invalid,
 *                     - message: a string describing the validation result.
 */
export function validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough && !hasUpperCase) {
        return { status: false, message: "Password must be at least 8 characters long and contain uppercase letter." };
    } else if (!isLongEnough) {
        return { status: false, message: "Password must be at least 8 characters long." };
    } else if (!hasUpperCase) {
        return { status: false, message: "Password must contain at least one uppercase letter." };
    }
    return { status: true };
}


/**
 * Function to validate a name.
 * @param {string} name - The name to validate.
 * @returns {Object} - Returns an object with status and message:
 *                     - status: true if valid, false if invalid,
 *                     - message: a string describing the validation result.
 */
export function validateName(name) {
    if (name === "-1" || name.trim() === "") {
        return { status: false, message: "Please enter a valid name" };
    }
    if (name.length < 3) {
        return { status: false, message: "Name too shrot (min 3)" };
    }
    if (name.length > 50) {
        return { status: false, message: "Name too long (max 50)" };
    }
    return { status: true, message: "" };
}


/**
 * Function to register a new user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<number>} - Returns a promise that resolves to:
 *                             - 1 if the registration was successful,
 *                             - 0 if the registration failed,
 *                             - -1 if there was an error during the registration process.
 */
export async function register(email = "-1", password = "-1", name = "-1", colorObject = null) {
    try {
        if (email === "-1" || password === "-1" || name === "-1") {
            return missingData;
        }

        if (!navigator.onLine) {
            return error;
        }

        if (colorObject === null) {
            colorObject = {
                primary: getComputedStyle(document.documentElement).getPropertyValue("--primary-yellow").trim(),
                secondary: getComputedStyle(document.documentElement).getPropertyValue("--secondary-yellow").trim(),
                tertiary: getComputedStyle(document.documentElement).getPropertyValue("--tertiary-yellow").trim()
            };
        }
        if (colorObject.primary === "" || colorObject.secondary === "" || colorObject.tertiary === "") {
            console.error("Color object is incomplete:", colorObject);
            return { status: error, message: "Color object is incomplete" };
        }

        const url = "/register";
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        return new Promise((resolve, reject) => {
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = function () {
                if (xhr.status === 200 || xhr.status === 400) {
                    let response = JSON.parse(xhr.responseText);
                    let message = response.message || "No info provided";

                    if (response.error == "0") {
                        resolve({ status: logged, message: message });
                    } else {
                        resolve({ status: notLogged, message: message });
                    }
                } else {
                    resolve({ status: notLogged, message: "Unexpected response from server" });
                }
            };

            xhr.onerror = function () {
                resolve({ status: error, message: "Network error occurred" });
            };

            const data = { email, password, name, primary: colorObject.primary, secondary: colorObject.secondary, tertiary: colorObject.tertiary };
            xhr.send(JSON.stringify(data));
        });
    } catch (e) {
        return { status: error, message: e.message };
    }
}


/**
 * Fetches the user's name from the server.
 * @returns {Promise<string|null>} - Resolves to the user's name or null if error.
 */
async function getUsername() {
    try {
        if (!navigator.onLine) return null;
        const url = "/getName";
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        return new Promise((resolve) => {
            xhr.open("GET", url);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = function () {
                if (xhr.status === 200) {
                    let response = JSON.parse(xhr.responseText);
                    if (response.error === "0") {
                        resolve(response.message);
                    } else {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            };
            xhr.onerror = function () {
                resolve(null);
            };
            xhr.send();
        });
    } catch {
        return null;
    }
}

/**
 * Fetches the user's theme from the server.
 * @returns {Promise<Object|null>} - Resolves to the theme object or null if error.
 */
async function getTheme() {
    try {
        if (!navigator.onLine) return null;
        const url = "/getTheme";
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        return new Promise((resolve) => {
            xhr.open("GET", url);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = function () {
                if (xhr.status === 200) {
                    let response = JSON.parse(xhr.responseText);
                    if (response.error === "0") {
                        resolve(response.message);
                    } else {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            };
            xhr.onerror = function () {
                resolve(null);
            };
            xhr.send();
        });
    } catch {
        return null;
    }
}

/**
 * Gets user info (name and theme) from the server.
 * @returns {Promise<{name: string|null, primary: string|null, secondary: string|null}>}
 */
export async function getUserInfo() {
    const [name, theme] = await Promise.all([getUsername(), getTheme()]);
    if (name === null || theme === null) {
        console.error("Failed to fetch user info: name or theme is null");
        return null;
    }

    return {
        name: name,
        primary: theme.primary,
        secondary: theme.secondary,
        tertiary: theme.tertiary
    };
}