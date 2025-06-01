/**
 * Utility functions for the application.
 */

/**
 * shorthand for document.getElementById
 * @param {string} id html object id 
 * @return {HTMLElement} the html element with the given id
 */
export function ebi(id) {
    return document.getElementById(id);
}


/**
 * Function to clear the specified form.
 * @param {string} form - The form type, which can be "login", "register"
 */
export function clearForm(form) {
    switch (form) {
        case "login":
            clearLoginform();
            break;
        case "register":
            clearRegisterForm();
            break;
        default:
            return false;
    }
    return true;
}


/**
 * Support function to clear the login form fields.
 */
function clearLoginform() {
    ebi("loginUsername").value = "";
    ebi("loginPassword").value = "";
}

/**
 * Support function to clear the register form fields.
 */
function clearRegisterForm() {
    ebi("registerUsername").value = "";
    ebi("registerPassword").value = "";
    ebi("confirmPassword").value = "";
}

/**
 * Function to hide an HTML element by its ID.
 * @param {string} id - The ID of the HTML element to hide.
 * @returns {boolean} - Returns true if the element was found and hidden, false otherwise.
 */
export function showElement(id) {
    const element = ebi(id);
    if (element) {
        element.classList.remove("hidden");
        return true;
    }
    return false;
}

/**
 * Function to hide an HTML element by its ID.
 * @param {string} id - The ID of the HTML element to hide.
 * @returns {boolean} - Returns true if the element was found and hidden, false otherwise.
 */
export function hideElement(id) {
    const element = ebi(id);
    if (element) {
        element.classList.add("hidden");
        return true;
    }
    return false;
}

/**
 * Function to get the value of an input element with ID "value".
 * @param {HTMLElement} element - The HTML element to get the value from.
 * @returns {string} - Returns the trimmed value of the input element, or "-1" if the element is not found or the value is empty.
 */
export function getValue(element = null) {
    if (element === null) {
        return "-1";
    }

    try {
        const value = ebi(element).value.trim();
        if (value === "") return "-1";
        return value;
    } catch (e) {
        console.error("Error getting value:", e);
        return "-1";
    }
}

/**
 * Function to display an error message in an HTML element with the specified ID.
 * @param {string} elementId - The ID of the HTML element where the error message will be displayed.
 * @param {string} message - The error message to display.
 */
export function displayError(elementId, message) {
    ebi(elementId).innerText = message;
}

/**
 * Function to check if an object can be interacted with.
 * @param {Object} object - The object to check for interaction.
 * @returns {boolean} - Returns true if the object is not null, not undefined, is an object, and has at least one key; otherwise, returns false.
 */
export function canInteract(object) {
    if (object === null || object === undefined) return false;
    return true;
}