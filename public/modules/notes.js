import { ebi } from "./utils.js";
import { hideElement, showElement } from "./utils.js";

/**
 * Function to load notes for the current day.
 * @returns {Promise<void>} - A promise that resolves when the notes are loaded.
 */
export async function loadNotes() {
    const today = new Date();
    const dateString = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();

    try {
        const response = await fetch("/getDayNotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: dateString })
        });
        const data = await response.json();

        if (data.error === "0" && Array.isArray(data.notes) && data.notes.length > 0) {
            showNotes(data.notes);
        } else {
            showPlaceholder();
        }
    } catch (err) {
        showPlaceholder();
    }
}


/**
 * Function to show a placeholder when no notes are available.
 */
function showPlaceholder() {
    hideElement("eventsList");
    showElement("eventPlaceholder");
    ebi("eventPlaceholder").classList.add("visible");
}


/**
 * Function to display notes in the events list.
 * @param {Array} notes - An array of note objects to display.
 */
function showNotes(notes) {
    showElement("eventsList");
    hideElement("eventPlaceholder");
    ebi("eventPlaceholder").classList.remove("visible");

    let list = ebi("eventsList");
    list.innerHTML = "";

    notes.forEach((note, index) => {
        const event = document.createElement("div");
        event.classList.add("upcomingEvent");
        event.id = note.id;

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("eventButtonContainer");

        const button = document.createElement("button");
        button.classList.add("eventButton");
        button.onclick = () => { }//openEvent(note);

        const icon = document.createElement("img");
        icon.classList.add("eventIcon");
        icon.src = "resources/icons/edit.svg";
        icon.alt = "edit";

        button.appendChild(icon);
        buttonContainer.appendChild(button);

        const infoContainer = document.createElement("div");
        infoContainer.classList.add("eventInfoContainer");

        const title = document.createElement("h3");
        title.classList.add("eventTitle");
        title.innerText = note.title;

        const info = document.createElement("p");
        info.classList.add("eventInfo");
        info.innerText = note.description;

        infoContainer.appendChild(title);
        infoContainer.appendChild(info);

        event.appendChild(buttonContainer);
        event.appendChild(infoContainer);

        const fakeEmpty = document.createElement("div");
        fakeEmpty.classList.add("fakeEmpty");

        event.appendChild(fakeEmpty);

        list.appendChild(event);
    });
    const confirmButton = ebi("popupConfrimButton");
    confirmButton.disabled = false;
}

