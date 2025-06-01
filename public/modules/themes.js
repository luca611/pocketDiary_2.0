/**
 * Themes module for managing themes in the application.
 */

import { ebi } from "./utils.js";

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
export function applyborder(color = "yellow") {
    const element = ebi(color);
    const colorVar = "--primary-" + color;
    const colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
    document.documentElement.style.setProperty("--currentBorderColor", colorValue);
    element.classList.add("border");
}

/**
 * Function to get the primary, secondary, and tertiary colors from CSS variables.
 * @param {string} color - The base color to retrieve, defaults to "yellow".
 * @returns {Object} - An object containing the primary, secondary, and tertiary colors.
 */
export function getColorsObject(color = "yellow") {
    const primary = getComputedStyle(document.documentElement).getPropertyValue("--primary-" + color).trim();
    const secondary = getComputedStyle(document.documentElement).getPropertyValue("--secondary-" + color).trim();
    const tertiary = getComputedStyle(document.documentElement).getPropertyValue("--minor-" + color).trim();
    return {
        primary: primary,
        secondary: secondary,
        tertiary: tertiary
    };
}

/**
 * Function to set the current app color from localstorage or variables.
 * @param {string} primary - The primary color to set, defaults to the value stored in localStorage.
 * @param {string} secondary - The secondary color to set, defaults to the value stored in localStorage.    
 * @param {string} tertiary - The tertiary color to set, defaults to the value stored in localStorage.
 */
export function applyTheme(primary = localStorage.getItem("primary"), secondary = localStorage.getItem("secondary"), tertiary = localStorage.getItem("tertiary")) {
    if (primary && !primary.startsWith("#")) primary = "#" + primary;
    if (secondary && !secondary.startsWith("#")) secondary = "#" + secondary;
    if (tertiary && !tertiary.startsWith("#")) tertiary = "#" + tertiary;

    document.documentElement.style.setProperty("--primary-color", primary);
    document.documentElement.style.setProperty("--secondary-color", secondary);
    document.documentElement.style.setProperty("--minor-color", tertiary);

    localStorage.setItem("primary", primary);
    localStorage.setItem("secondary", secondary);
    localStorage.setItem("tertiary", tertiary);
}