/**
 * Utility functions for the application.
 * This module provides functions to handle navigation in the application,
 */

import { ebi, clearForm, showElement, hideElement } from "./utils.js";

/** 
 * Function to navigate to different authentication forms.
 * @param {string} path - The path to navigate to
 * @returns {boolean} - Returns true if the navigation was successful, false otherwise.
 */
export function navigateTo(path) {
    switch (path) {
        case "login":
            hideAllSections();
            showSection("authentication");
            hideAuthForms();
            showAuthForm("login");
            break;
        case "register":
            hideAllSections();
            showSection("authentication");
            hideAuthForms();
            showAuthForm("register");
            break;
        case "welcome":
            hideAllSections();
            showSection("authentication");
            hideAuthForms();
            showAuthForm("welcome");
            break;
        case "theme":
            hideAllSections();
            showSection("authentication");
            hideAuthForms();
            showAuthForm("theme");
            break;
        default:
            return false;
    }
    return true;
}

/**
 * Function to hide all sections of the application.
 * This function hides the authentication section and the main page section.
*/
export function hideAllSections() {
    hideElement("authentication");
    hideElement("page");
}

/**
 * Function to show a specific section of the application.
 * @param {string} section - The section to show, which can be "authentication" or "page".
 * @returns {boolean} - Returns true if the section was shown successfully, false otherwise (debug purposes).
 */
export function showSection(section) {
    switch (section) {
        case "authentication":
            showElement("authentication");
            break;
        case "page":
            showElement("page");
            break;
        default:
            return false;
    }
    return true;
}

/**
 * Function to hide all authentication forms.
 * This function hides the login, register, and change password forms.
 */
export function hideAuthForms() {
    hideElement("welcome");
    hideElement("login");
    hideElement("register");
    hideElement("theme");
    hideElement("name");
}

/**
 * Function to show the specified authentication form.
 * @param {string} form - The form type, which can be "login", "register"...
 * @returns {boolean} - Returns true if the form was shown successfully, false otherwise (debug purposes).
 */
export function showAuthForm(form) {
    switch (form) {
        case "login":
            showElement("login");
            clearForm("login");
            break;
        case "register":
            showElement("register");
            clearForm("register");
            break;
        case "welcome":
            showElement("welcome");
            break;
        case "theme":
            showElement("theme");
            break;
        case "name":
            showElement("name");
            break;
        default:
            return false;
    }
    return true;
}

