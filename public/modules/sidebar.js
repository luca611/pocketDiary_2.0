/**
 * Sidebar module for managing the sidebar functionality.
 * This module provides functions to open and close the sidebar.
 */
import { ebi } from "./utils.js";

/**
 * This module provides functions to open and close the sidebar.
 */
export function openSideBar() {
    ebi("sidebar").classList.add("open");
    ebi("overlaySidebar").classList.add("visible");
}

/**
 * Function to close the sidebar.
 */
export function closeSidebar() {
    ebi("sidebar").classList.remove("open");
    ebi("overlaySidebar").classList.remove("visible");
}