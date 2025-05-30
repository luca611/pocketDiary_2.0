/**
 * Auth module for handling user authentication and authorization.
 * This module provides functions to check if a user is authenticated and to log or register a user.
 */


export const logged = 1;
export const notLogged = 0;
export const error = -1;
export const missingData = -2;

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
        xhr.open("GET", url, false);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();

        if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.error === "0") {
                return logged;
            } else {
                return error;
            }
        } else {
            //since server respond with 400 when user is not authenticated i can assume it's for that reason
            return notLogged;
        }
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

export async function login(username = null, password = null) {
    try {
        if (username === null || password === null) {
            return missingData;
        }

        if (!navigator.onLine) {
            return error;
        }

        const url = "/login";
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open("POST", url, false);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ username, password }));

        if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.error === "0") {
                return logged;
            } else {
                return notLogged;
            }
        } else {
            return notLogged;
        }
    } catch (e) {
        return error;
    }
}
