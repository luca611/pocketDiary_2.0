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
 * Function to remove borders from all theme color elements.
 * This function iterates through predefined theme colors and removes the "border" class from each element.
 */
export function removeBorders() {
    const themeColors = {
        1: "yellow",
        2: "blue",
        3: "green",
        4: "purple"
    };

    Object.values(themeColors).forEach(themeColor => {
        ebi(themeColor).classList.remove("border");
    });
}

/** 
 * Function to apply a border to an HTML element based on the provided color. if id is in themeColors
 * @param {string} color - The color to apply as a border, which should match the ID of the HTML element.
 */
export function applyborder(color) {
    const element = ebi(color);
    const colorVar = "--primary-" + color;
    const colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
    document.documentElement.style.setProperty("--currentBorderColor", colorValue);
    element.classList.add("border");
}