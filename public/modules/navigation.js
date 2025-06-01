/**
 * Utility functions for the application.
 * This module provides functions to handle navigation in the application,
 */

import { canInteract, ebi, clearForm, showElement, hideElement } from "./utils.js";
import { closeSidebar } from "./sidebar.js";

let __activePage = "";

/** 
 * Function to navigate to different authentication forms.
 * @param {string} path - The path to navigate to
 * @returns {boolean} - Returns true if the navigation was successful, false otherwise.
 */
export function navigateTo(path) {
    if (canInteract("sidebar")) closeSidebar();
    switch (path) {
        case "login":
            __activePage = "login";
            hideAllSections();
            showSection("authentication");
            hideAuthForms();
            showAuthForm("login");
            break;
        case "register":
            __activePage = "register";
            hideAllSections();
            showSection("authentication");
            hideAuthForms();
            showAuthForm("register");
            break;
        case "welcome":
            __activePage = "welcome";
            hideAllSections();
            showSection("authentication");
            hideAuthForms();
            showAuthForm("welcome");
            break;
        case "theme":
            __activePage = "theme";
            hideAllSections();
            showSection("authentication");
            hideAuthForms();
            showAuthForm("theme");
            break;
        case "name":
            __activePage = "name";
            hideAllSections();
            showSection("authentication");
            hideAuthForms();
            showAuthForm("name");
            break;
        case "home":
            __activePage = "home";
            hideAllSections();
            showSection("page");
            hideBodyPages();
            showBodyPage("homepage");
            break;
        default:
            return false;
    }
    updateActivePage(path);
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

/**
 * Function to hide all body pages.
 * This function hides the home, profile, and settings pages.
 */
function hideBodyPages() {
    hideElement("homepage");
    hideElement("settings");
    hideElement("chatPage");
    hideElement("schedule");
    hideElement("grades");
    hideElement("hours");
}

/**
 * Function to show a specific body page.
 * @param {string} page - The page to show, which can be "home", "settings", "chatPage", "schedule", "grades", or "hours".
 * @returns {boolean} - Returns true if the page was shown successfully, false otherwise (debug purposes).
 */
function showBodyPage(page) {
    if (ebi(page)) {
        showElement(page);
        return true;
    }
    return false;   // Debug purposes
}

/**
 * Function to update the active page in the navigation.
 * @param {string} path - The path of the active page.
 */
function updateActivePage(path) {
    removeAllHighlights();
    switch (path) {
        case "home":
            highlight("homeButton");
            break;
        default:
            __activePage = "";
    }
}

/**
 * Function to remove all highlights from the navigation items.
 */
function removeAllHighlights() {
    ebi("settingsButton").classList.remove("active");
    ebi("aiButton").classList.remove("active");
    ebi("homeButton").classList.remove("active");
    ebi("gradeButton").classList.remove("active");
    ebi("calendarButton").classList.remove("active");
    ebi("scheduleButton").classList.remove("active");
}

/**
 * Function to highlight the active navigation item.
 * @param {string} id - The ID of the navigation item to highlight.
 */
function highlight(id) {
    ebi(id).classList.add("active");
}

/**
 * Function to set the page title and decoration.
 * @param {string} title - The title to set for the page.
 * @param {string} decoration - The decoration (second part and colored) to set for the page title.
 */
export function setTitle(title = "", decoration = "") {
    ebi("pageTitle").innerText = title;
    ebi("decoratedTitle").innerText = decoration;
}

