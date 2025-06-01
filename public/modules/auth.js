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