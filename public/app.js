

const cacheName = "pwaname"; //PWA id here
//Register PWA service worker
if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("sw.js");
}
//Redirect HTTP to HTTPS
if (location.protocol == "http:") {
	location.href = "https" + location.href.substring(4);
}
//Check for updates
let xhr = new XMLHttpRequest();
xhr.onload = function () {
	let v = xhr.responseText.trim();
	if (!localStorage.pwaversion) {
		localStorage.pwaversion = v;
	} else if (localStorage.pwaversion != v) {
		console.log("Updating PWA");
		delete localStorage.pwaversion;
		caches.delete(cacheName).then((_) => {
			location.reload();
		});
	}
};
xhr.onerror = function () {
	console.log("Update check failed");
};
xhr.open("GET", "pwaversion.txt?t=" + Date.now());
xhr.send();


// Check if cookies are enabled
if (!navigator.cookieEnabled) {
	alert("Cookies are disabled in your browser. Please enable cookies to use this application.");
}



//-----------------------------------------------------------------
//app code

const rootStyles = getComputedStyle(document.documentElement);
const serverURL = "";

let email, password, username = "loading";
let sidebar, overlayBar;
let overlayPopUp, popUp;
let eventCreation, gradeCreation, hourCreation, nameChange, passwordChange;

let currentTheme = 1;
let currentPage = 2;

let currentPopupPage = 0;

let primaryColor = rootStyles.getPropertyValue("--primary-color");
let secondaryColor = rootStyles.getPropertyValue("--secondary-color");
let tertiaryColor = rootStyles.getPropertyValue("--minor-color");

let currentDate = new Date();

//-----------------------------------------------------------------

/**
 * shorthand for document.getElementById
 * @param {string} id html object id 
 * @returns 
 */
function ebi(id) {
	return document.getElementById(id);
}

//-----------------------------------------------------------------

// event listeners for online/offline status
window.addEventListener('online', () => {
	showFeedback(0, "You are back online");
	autologin();
});

window.addEventListener('offline', () => {
	showFeedback(2, "You are offline");
});

//-----------------------------------------------------------------
//COLORS FUNCTIONS
//-----------------------------------------------------------------

/**
 * Function that applys a standart theme to the website, used if custom theme is not set
 */
function applyTheme() {
	const themeColors = {
		1: "yellow",
		2: "blue",
		3: "green",
		4: "purple"
	};

	if (themeColors[currentTheme]) {
		let colorVar = `--primary-${themeColors[currentTheme]}`;
		let colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
		document.documentElement.style.setProperty("--primary-color", colorValue);

		colorVar = `--secondary-${themeColors[currentTheme]}`;
		colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
		document.documentElement.style.setProperty("--secondary-color", colorValue);

		colorVar = `--minor-${themeColors[currentTheme]}`;
		colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
		document.documentElement.style.setProperty("--minor-color", colorValue);
	}
}

//-----------------------------------------------------------------

function setColor(type, color) {
	switch (type) {
		case 'primary':
			applyPrimaryColor(color);
			break;
		case 'secondary':
			applySecondaryColor(color);
			break;
		case 'tertiary':
			applyTertiaryColor(color);
			break;
	}
}

//-----------------------------------------------------------------

function applyPrimaryColor(color) {
	switch (color) {
		case 'yellow':
			document.documentElement.style.setProperty("--primary-color", rootStyles.getPropertyValue("--primary-yellow"));
			break;
		case 'blue':
			document.documentElement.style.setProperty("--primary-color", rootStyles.getPropertyValue("--primary-blue"));
			break;
		case 'green':
			document.documentElement.style.setProperty("--primary-color", rootStyles.getPropertyValue("--primary-green"));
			break;
		case 'purple':
			document.documentElement.style.setProperty("--primary-color", rootStyles.getPropertyValue("--primary-purple"));
			break;
		case 'custom':
			const colorPicker = document.getElementById("primaryColorPicker");
			document.documentElement.style.setProperty("--primary-color", colorPicker.value);
			break;
	}
}

//-----------------------------------------------------------------

function applySecondaryColor(color) {
	let colorPicker;
	switch (color) {
		case 'yellow':
			document.documentElement.style.setProperty("--secondary-color", rootStyles.getPropertyValue("--secondary-yellow"));
			break;
		case 'blue':
			document.documentElement.style.setProperty("--secondary-color", rootStyles.getPropertyValue("--secondary-blue"));
			break;
		case 'green':
			document.documentElement.style.setProperty("--secondary-color", rootStyles.getPropertyValue("--secondary-green"));
			break;
		case 'purple':
			document.documentElement.style.setProperty("--secondary-color", rootStyles.getPropertyValue("--secondary-purple"));
			break;
		case 'custom':
			colorPicker = document.getElementById("secondaryColorPicker");
			document.documentElement.style.setProperty("--secondary-color", colorPicker.value);
			break;
	}
}

//-----------------------------------------------------------------

function applyTertiaryColor(color) {
	switch (color) {
		case 'yellow':
			document.documentElement.style.setProperty("--minor-color", rootStyles.getPropertyValue("--minor-yellow"));
			break;
		case 'blue':
			document.documentElement.style.setProperty("--minor-color", rootStyles.getPropertyValue("--minor-blue"));
			break;
		case 'green':
			document.documentElement.style.setProperty("--minor-color", rootStyles.getPropertyValue("--minor-green"));
			break;
		case 'purple':
			document.documentElement.style.setProperty("--minor-color", rootStyles.getPropertyValue("--minor-purple"));
			break;
		case 'custom':
			const colorPicker = document.getElementById("tertiaryColorPicker");
			document.documentElement.style.setProperty("--minor-color", colorPicker.value);
			break;
	}
}


//-----------------------------------------------------------------

//sidebar functions
function openSideBar() {
	ebi("sidebar").classList.add("open");
	ebi("overlaySidebar").classList.add("visible");
}

//-----------------------------------------------------------------

function closeSidebar() {
	ebi("sidebar").classList.remove("open");
	ebi("overlaySidebar").classList.remove("visible");
}

function apriReport() {
	openReport();
	setPopupPage(6);
	openPopup(3);
	fillChart();
}

function openReport() {

	const url = serverURL + "/getMarks" + "?t=" + Date.now();

	const xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		if (xhr.status === 200) {
			const response = JSON.parse(xhr.responseText);
			if (response.error === "0") {
				const marks = response.marks;

				if (marks.length === 0) {
					ebi("reportSubjectList").innerHTML = "";
					ebi("bestSujectName").innerText = "--";
					ebi("worstSujectName").innerText = "--";
					ebi("avgValue").innerText = "--";
					ebi("avgValue").style.color = "black";
					ebi("numGrades").innerText = "--";
					return;
				}

				const totalMarks = marks.reduce((sum, mark) => sum + parseFloat(mark.mark), 0);
				const avgMark = totalMarks / marks.length;

				const marksBySubject = marks.reduce((acc, mark) => {
					if (!acc[mark.subject]) {
						acc[mark.subject] = [];
					}
					acc[mark.subject].push(parseFloat(mark.mark));
					return acc;
				}, {});

				const subjectAverages = Object.entries(marksBySubject).map(([subject, marks]) => {
					const subjectAvg = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
					return { subject, avg: subjectAvg };
				});

				const bestSubject = subjectAverages.reduce((best, current) => (current.avg > best.avg ? current : best));
				const worstSubject = subjectAverages.reduce((worst, current) => (current.avg < worst.avg ? current : worst));

				const numberOfSubjects = Object.keys(marksBySubject).length;

				const avg = avgMark;
				const best = bestSubject.subject;
				const worst = worstSubject.subject;
				const numSubjects = numberOfSubjects;

				let avgContainer = ebi("avgValue");
				let bestContainer = ebi("bestSujectName");
				let worstContainer = ebi("worstSujectName");
				let numGradeContainer = ebi("numGrades")

				if (avg >= 6.5) {
					avgContainer.style.color = "green";
				} else if (avg >= 5) {
					avgContainer.style.color = "orange";
				} else {
					avgContainer.style.color = "red";
				}

				avgContainer.innerText = avg.toFixed(2);
				bestContainer.innerText = best;
				worstContainer.innerText = worst;
				numGradeContainer.innerText = numSubjects;

				loadSubjects("reportSubjectList");
			} else {
				console.error("Error fetching marks:", response.message);
			}
		} else {
			console.error("Failed to fetch marks. Status:", xhr.status);
		}
	};

	xhr.onerror = function () {
		console.error("Network error while fetching marks.");
	};

	xhr.send();
}

function renderChartBySubject() {
	fillChart(ebi("reportSubjectList").value);
}

//popup functions
function openPopup(page = 0) {
	if (page === 0) {
		ebi("popupConfrimButton").innerText = "Create";
		ebi("popupConfrimButton").onclick = createEvent;
	}
	else if (page === 2) {
		ebi("popupConfrimButton").innerText = "add";
		ebi("popupConfrimButton").onclick = addmark;
		ebi("gradeName").value = "";
		ebi("subject").value = "";
		ebi("grade").value = "";
		ebi("gradeDate").value = "";
		loadSubjects("subjectDataList");
	}

	if (page === 3) {
		ebi("popup").classList.add("large");
		ebi("popUpBody").classList.add("large");
	}

	ebi("popup").classList.add("open");
	ebi("overlayPopUp").classList.add("visible");
	ebi("popupDeleteButton").classList.add("hidden");
}


//-----------------------------------------------------------------

function closePopup() {

	if (currentPopupPage === 6) {
		setPopupPage(1);
	}
	ebi("popup").classList.remove("open");
	ebi("popup").classList.remove("large");
	ebi("popUpBody").classList.remove("large");
	ebi("overlayPopUp").classList.remove("visible");
	clearForm();
}

//-----------------------------------------------------------------

function showFeedback(type = 0, message = "success") {
	const feedbackContainer = ebi("feedbackContainer");
	feedbackContainer.innerHTML = "";

	const feedbackDiv = document.createElement("div");
	feedbackDiv.classList.add("feedBack");

	const icon = document.createElement("img");
	icon.classList.add("icon");

	const messageParagraph = document.createElement("p");

	if (type === 0) {
		icon.src = "resources/icons/succes.svg";
		messageParagraph.classList.add("success");
	} else if (type === 1) {
		icon.src = "resources/icons/inform.svg";
		messageParagraph.classList.add("warning");
	} else if (type === 2) {
		icon.src = "resources/icons/error.svg";
		messageParagraph.classList.add("error");
	}

	icon.alt = "";
	messageParagraph.innerText = message;

	feedbackDiv.appendChild(icon);
	feedbackDiv.appendChild(messageParagraph);
	feedbackContainer.appendChild(feedbackDiv);

	feedbackDiv.onclick = function () {
		feedbackContainer.innerHTML = "";
	};

	setTimeout(() => {
		feedbackContainer.innerHTML = "";
	}, 4000);
}


//-----------------------------------------------------------------

/**
 * 0: event
 * 1: grade
 * 2: name
 * 3: password
 */
function setPopupPage(page = 0) {
	const pages = document.getElementsByClassName("bodyContainer");
	if (page > pages.length - 1) {
		page = 0;
	}
	Array.from(pages).forEach((e) => {
		e.classList.add("hidden");
	});

	pages[page].classList.remove("hidden");
	ebi("popupConfrimButton").onclick = null;
	ebi("popupCancelButton").onclick = closePopup;
	ebi("popupConfrimButton").classList.remove("hidden");
	ebi("popupCancelButton").classList.remove("hidden");
	ebi("popupCancelButton").innerText = "Cancel";
	ebi("popupDeleteButton").classList.add("hidden");
	ebi("popupDeleteButton").onclick = null;

	switch (page) {
		case 0:
			ebi("popupConfrimButton").onclick = createEvent;
			ebi("popupConfrimButton").innerText = "Create";
			break;
		case 1:
			ebi("popupConfrimButton").onclick = function () {
				addmark();
			};
			ebi("popupConfrimButton").innerText = "Add";
			break;
		case 2:
			ebi("popupConfrimButton").onclick = changeName;
			ebi("popupConfrimButton").innerText = "Change";
			break;
		case 3:
			ebi("popupConfrimButton").onclick = changePassword;
			ebi("popupConfrimButton").innerText = "Change";
			break;
		case 4:
			ebi("popupConfrimButton").onclick = changeThemeSettings;
			ebi("popupConfrimButton").innerText = "Change";
			ebi("popupCancelButton").onclick = restoreColorsAndClose;
			break;
		case 5:
			ebi("popupConfrimButton").onclick = function () {
				sendScheduleInfo();
			};
			ebi("popupConfrimButton").innerText = "Plan";
			break;
		case 6:
			ebi("popupConfrimButton").classList.add("hidden");
			ebi("popupCancelButton").classList.remove("hidden");
			ebi("popupCancelButton").innerText = "Close";
			break;
		default:
			console.error("Invalid page number");
			break;
	}

	currentPopupPage = page;
}

//-----------------------------------------------------------------

function addmark() {
	ebi("popupConfrimButton").disabled = true;
	let title = ebi("gradeName").value.trim();
	let subject = ebi("subject").value.trim();
	let mark = parseFloat(ebi("grade").value.trim());
	if (isNaN(mark) || mark < 0 || mark > 10) {
		displayError("gradeError", "Please enter a valid mark between 0 and 10");

		ebi("popupConfrimButton").disabled = false;
		console.log("error in fields numbers"); return;
	}
	let date = ebi("gradeDate").value.trim();

	if (!title || !subject || !date) {
		displayError("gradeError", "Please fill in all fields");
		console.log("error in fields");
		ebi("popupConfrimButton").disabled = false;
		return;
	}

	date = formatDate(new Date(date));

	const url = serverURL + "/addMark";
	const data = { mark, title, subject, date };

	const xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		if (xhr.status === 200) {
			const response = JSON.parse(xhr.responseText);
			if (response.error == '0') {
				showFeedback(0, "Mark added successfully");
				closePopup();
				ebi("gradeName").value = "";
				ebi("subject").value = "";
				ebi("grade").value = "";
				ebi("gradeDate").value = "";
				let container = ebi("containerVoti");
				container.innerHTML = "";
				loadGrades();
			} else {
				displayError("gradeError", response.message);
			}
		} else {
			displayError("gradeError", "Failed to add mark. Please try again.");
		}
	};

	xhr.onerror = function () {
		displayError("gradeError", "Network error. Please try again.");
	};

	xhr.send(JSON.stringify(data));
	ebi("popupConfrimButton").disabled = false;
}

function loadGrades() {
	let container = ebi("containerVoti");
	container.innerHTML = "";
	let url = serverURL + "/getMarks?t=" + Date.now();
	const xhr = new XMLHttpRequest();
	xhr.open("GET", serverURL + url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		if (xhr.status === 200) {
			const response = JSON.parse(xhr.responseText);
			if (response.error === "0") {
				const marks = response.marks;
				if (marks.length === 0) {
					container.classList.add("showplaceholder");

					let emptyMessage = document.createElement("div");
					emptyMessage.classList.add("markImgPlaceholder");

					let img = document.createElement("img");
					img.src = "resources/imgs/markLogo.svg";
					img.alt = "empty grades";

					let text = document.createElement("p");
					text.innerText = "No marks available yet, add some!";
					emptyMessage.appendChild(img);
					emptyMessage.appendChild(text);
					container.appendChild(emptyMessage);
					return;
				} else {
					container.classList.remove("showplaceholder");
				}
				marks.forEach(mark => {
					let outerWrap = document.createElement("div");
					outerWrap.classList.add("voto");
					outerWrap.id = mark.id;

					let voto = document.createElement("div");
					voto.classList.add("numeroVoto");

					if (mark.mark % 1 === 0) {
						voto.innerText = Math.floor(mark.mark);
					} else if (mark.mark % 1 >= 0.1 && mark.mark % 1 <= 0.3) {
						voto.innerText = Math.floor(mark.mark) + "+";
					} else if (mark.mark % 1 >= 0.4 && mark.mark % 1 <= 0.6) {
						voto.innerText = Math.floor(mark.mark) + ".5";
					} else if (mark.mark % 1 >= 0.7 && mark.mark % 1 <= 0.9) {
						voto.innerText = Math.ceil(mark.mark) + "-";
					} else {
						voto.innerText = mark.mark.toFixed(1);
					}

					if (mark.mark >= 6.5) {
						voto.style.borderColor = 'green';
					} else if (mark.mark >= 5) {
						voto.style.borderColor = 'orange';
					} else {
						voto.style.borderColor = 'red';
					}

					let innerWrap = document.createElement("div");
					innerWrap.classList.add("descriptionGrades");

					let description = document.createElement("div");

					let title = document.createElement("h4");
					let desc = document.createElement("p");
					desc.classList.add("descrizioneVoto");
					title.innerText = mark.title;
					desc.innerText = mark.subject + " - " + mark.date.split("T")[0].split("-").slice(1).join("/");

					let button = document.createElement("button");
					button.classList.add("eventButton");

					let icon = document.createElement("img");
					icon.classList.add("eventIcon");
					icon.src = "resources/icons/edit.svg";
					icon.alt = "edit";

					button.appendChild(icon);
					button.onclick = () => {
						let id = mark.id;
						openPopup(1);
						ebi("popupDeleteButton").classList.remove("hidden");
						ebi("popupDeleteButton").onclick = () => showConfirmDelete(id, false, true);

						ebi("gradeName").value = mark.title;
						ebi("subject").value = mark.subject;
						ebi("grade").value = mark.mark;
						ebi("gradeDate").value = mark.date.split("T")[0];
						ebi("gradeError").innerText = "";
						ebi("popupConfrimButton").innerText = "Save";
						ebi("popupConfrimButton").onclick = () => {
							ebi("popupConfrimButton").disabled = true;
							let mark = parseFloat(ebi("grade").value.trim());
							if (isNaN(mark) || mark < 0 || mark > 10) {
								displayError("gradeError", "Please enter a valid mark between 0 and 10");
								ebi("popupConfrimButton").disabled = false;
								return;
							}
							let title = ebi("gradeName").value.trim();
							let subject = ebi("subject").value.trim();
							let date = ebi("gradeDate").value.trim();
							if (!title || !subject || !date) {
								displayError("gradeError", "Please fill in all fields");
								ebi("popupConfrimButton").disabled = false;
								return;
							}
							date = formatDate(new Date(date));
							updateMark(id, mark, title, subject, date);
						};
					}

					description.classList.add("desc");

					description.appendChild(title);
					description.appendChild(desc);

					innerWrap.appendChild(description)
					innerWrap.appendChild(button)
					outerWrap.appendChild(voto);
					outerWrap.appendChild(innerWrap);

					container.appendChild(outerWrap);
				});

				loadSubjects();
			} else {
				console.error("Error fetching marks:", response.message);
			}
		} else {
			console.error("Failed to fetch marks. Status:", xhr.status);
		}
	};

	xhr.onerror = function () {
		console.error("Network error while fetching marks.");
	};

	xhr.send();
}

function updateMark(id, mark, title, subject, date) {
	const url = serverURL + "/updateMark";
	const data = { id, mark, title, subject, date };

	const xhr = new XMLHttpRequest();
	xhr.open("PUT", url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		if (xhr.status === 200) {
			const response = JSON.parse(xhr.responseText);
			if (response.error == '0') {
				ebi("popupConfrimButton").disabled = false;
				showFeedback(0, "Mark updated successfully");
				loadGrades();
				closePopup();
			} else {
				displayError("gradeError", response.message);
			}
		} else {
			displayError("gradeError", "Failed to update mark. Please try again.");
			ebi("popupConfrimButton").disabled = false;
		}
	};

	xhr.onerror = function () {
		displayError("gradeError", "Network error. Please try again.");
		ebi("popupConfrimButton").disabled = false;
	};

	xhr.send(JSON.stringify(data));
}

//-----------------------------------------------------------------

function openThemeChange() {
	setPopupPage(4);
	openPopup(1);
}

//-----------------------------------------------------------------

function restoreColorsAndClose() {
	document.documentElement.style.setProperty("--primary-color", primaryColor);
	document.documentElement.style.setProperty("--secondary-color", secondaryColor);
	document.documentElement.style.setProperty("--minor-color", tertiaryColor);

	closePopup();
}

function changeThemeSettings() {
	showFeedback(0, "Theme changed successfully");
	primaryColor = rootStyles.getPropertyValue("--primary-color");
	secondaryColor = rootStyles.getPropertyValue("--secondary-color");
	tertiaryColor = rootStyles.getPropertyValue("--minor-color");
	saveCustomTheme();
	closePopup();
}

//-----------------------------------------------------------------

function isValidHex(hex) {
	if (hex.charAt(0) !== "#") {
		hex = "#" + hex;
	}
	return /^#[0-9A-F]{6}$/i.test(hex);
}

//-----------------------------------------------------------------

function setHexColor(type) {
	switch (type) {
		case "primary":
			if (isValidHex(ebi("primaryColorHex").value.trim())) {
				ebi("primaryColorHex").classList.add("valid");
				ebi("primaryColorHex").classList.remove("error");
				let hex = ebi("primaryColorHex").value.trim();
				if (hex.charAt(0) !== "#") {
					hex = "#" + hex;
				}
				document.documentElement.style.setProperty("--primary-color", hex);
			}
			else {
				ebi("primaryColorHex").classList.add("error");
				ebi("primaryColorHex").classList.remove("valid");
			}
			break;
		case "secondary":
			if (isValidHex(ebi("secondaryColorHex").value.trim())) {
				ebi("secondaryColorHex").classList.add("valid");
				ebi("secondaryColorHex").classList.remove("error");
				let hex = ebi("secondaryColorHex").value.trim();
				if (hex.charAt(0) !== "#") {
					hex = "#" + hex;
				}
				document.documentElement.style.setProperty("--secondary-color", hex);
			}
			else {
				ebi("secondaryColorHex").classList.add("error");
				ebi("secondaryColorHex").classList.remove("valid");
			}
			break;
		case "tertiary":
			if (isValidHex(ebi("tertiaryColorHex").value.trim())) {
				ebi("tertiaryColorHex").classList.add("valid");
				ebi("tertiaryColorHex").classList.remove("error");
				let hex = ebi("tertiaryColorHex").value.trim();
				if (hex.charAt(0) !== "#") {
					hex = "#" + hex;
				}
				document.documentElement.style.setProperty("--minor-color", hex);
			}
			else {
				ebi("tertiaryColorHex").classList.add("error");
				ebi("tertiaryColorHex").classList.remove("valid");
			}
			break;
		default:
			break;
	}
}

//-----------------------------------------------------------------

function saveCustomTheme() {
	let customTheme = {
		primary: primaryColor.trim(),
		secondary: secondaryColor.trim(),
		tertiary: tertiaryColor.trim()
	};

	let xhr = new XMLHttpRequest();

	xhr.withCredentials = true;
	xhr.open("PUT", serverURL + "/updateTheme");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			loadCustomTheme();
		} else {
			console.error(response.message);
		}
	};

	xhr.onerror = function () {
		console.error("Network error");
	};

	xhr.send(JSON.stringify(customTheme));
}

//-----------------------------------------------------------------

function loadCustomTheme() {
	getTheme();
}


//-----------------------------------------------------------------

function clearForm() {
	switch (currentPopupPage) {
		case 0: {
			//event creation
			ebi("eventName").value = "";
			ebi("eventDescription").value = "";
			ebi("eventDate").value = "";
			displayError("eventError", "");

			break;
		}
		case 1: {
			//grade creation
			break;
		}
		case 2: {
			//name change
			ebi("newName").value = "";
			displayError("nameError", "");
			break;
		}
		case 3: {
			//password change
			ebi("newPassword").value = "";
			ebi("newConfirmPassword").value = "";
			ebi("currentPassword").value = "";
			displayError("popupPasswordError", "");
			break;
		}
		default: {
			break;
		}
	}
}

function disableLoading() {
	ebi("loadingScreen").classList.add("hidden");
}

function enableLoading() {
	ebi("loadingScreen").classList.remove("hidden");
}

//-----------------------------------------------------------------

function swapToWelcome() {
	cleanRegister();
	cleanLogin();
	ebi("welcome").classList.remove("hidden");
	ebi("login").classList.add("hidden");
	ebi("register").classList.add("hidden");
}

//-----------------------------------------------------------------

function swapToLogin() {
	cleanRegister();
	cleanLogin();
	ebi("welcome").classList.add("hidden");
	ebi("login").classList.remove("hidden");
	ebi("register").classList.add("hidden");
}

//-----------------------------------------------------------------

function swapToRegister() {
	cleanLogin();
	cleanRegister();
	ebi("welcome").classList.add("hidden");
	ebi("login").classList.add("hidden");
	ebi("register").classList.remove("hidden");
}

//-----------------------------------------------------------------

function swapToHome() {
	setPopupPage(0);
	updateActivePageLink();

	ebi("addButtonContainer").classList.remove("hidden");
	ebi("autenticazione").classList.add("hidden");
	ebi("page").classList.remove("hidden");

	ebi("pageTitle").innerText = "hi, ";
	ebi("decoratedTitle").innerText = username;

	getTheme();
	loadNotes();
	loadUsername();
	disableLoading();
}

//-----------------------------------------------------------------

function openNameChange() {
	setPopupPage(2);
	openPopup(1);
}

//-----------------------------------------------------------------

function openPasswordChange() {
	setPopupPage(3);
	openPopup(1);
}

//-----------------------------------------------------------------

function scrollToBottom() {
	const div = document.getElementById("messagesList");
	div.scrollTo({
		top: div.scrollHeight,
		behavior: 'smooth'
	});
}

//-----------------------------------------------------------------

function updateActivePageLink() {
	let links = document.getElementsByClassName("barLink");
	Array.from(links).forEach((link) => {
		link.classList.remove("active");
	});

	links[currentPage].classList.add("active");
}

function toPage(page1, page2) {
	ebi(page1).classList.add("hidden");
	ebi(page2).classList.remove("hidden");
}

function disableAddButton() {
	ebi("addButtonContainer").classList.add("hidden");
}

function addNotesButton(type = 0) {
	ebi("addButtonContainer").onclick = () => {
		openPopup(type);
	}
}

function showAddButton() {
	ebi("addButtonContainer").classList.remove("hidden");
}

function hideAllPages() {
	let pages = document.getElementsByClassName("section");
	Array.from(pages).forEach((page) => {
		page.classList.add("hidden");
	});
}

//-----------------------------------------------------------------
function validatePassword(password) {
	const hasUpperCase = /[A-Z]/.test(password);
	return password.length >= 8 && hasUpperCase;
}

async function proceedToTheme() {
	enableLoading();
	email = ebi("registerUsername").value.trim().toLowerCase();
	password = ebi("registerPassword").value.trim();
	const confirmPassword = ebi("confirmPassword").value.trim();

	if (!email || !password || !confirmPassword) {
		displayError("registerError", "Please fill in all fields");
		disableLoading();
		return;
	}

	if (password !== confirmPassword) {
		displayError("registerError", "Passwords do not match");
		disableLoading();
		return;
	}
	if (!validatePassword(password)) {
		displayError("registerError", "Password too weak");
		disableLoading();
		return;
	}

	const available = await checkEmailAvailability(email);

	disableLoading();
	if (available) {
		toPage("register", "theme");
	} else {
		const errorMessage = navigator.onLine
			? "Email already taken"
			: "No connection. Please try again.";
		displayError("registerError", errorMessage);
	}
}



//-----------------------------------------------------------------

function cleanRegister() {
	ebi("registerUsername").value = "";
	ebi("registerPassword").value = "";
	ebi("confirmPassword").value = "";
	ebi("registerError").innerText = "";
}

//-----------------------------------------------------------------

function cleanLogin() {
	ebi("loginUsername").value = "";
	ebi("loginPassword").value = "";
	ebi("loginError").innerText = "";
}

//-----------------------------------------------------------------

function displayError(elementId, message) {
	ebi(elementId).innerText = message;
}

//-----------------------------------------------------------------

function setTheme(theme = 1) {
	const themeColors = {
		1: "yellow",
		2: "blue",
		3: "green",
		4: "purple"
	};

	Object.values(themeColors).forEach(color => {
		ebi(color).classList.remove("border");
	});

	currentTheme = theme;

	if (themeColors[theme]) {
		const element = ebi(themeColors[theme]);
		const colorVar = `--primary-${themeColors[theme]}`;
		const colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
		document.documentElement.style.setProperty("--currentBorderColor", colorValue);
		element.classList.add("border");
	}
}

/*
	navigation functions
 
	-> toSettings: hides all pages and shows the settings page
	-> toHome: hides all pages and shows the home page
*/

function toSettings() {
	disableAddButton();
	hideAllPages();
	ebi("settings").classList.remove("hidden");
	ebi("pageTitle").innerText = "Settings";
	ebi("decoratedTitle").innerText = "";
	currentPage = 0;
	updateActivePageLink();
	closeSidebar();
}
//-----------------------------------------------------------------
function toGrades() {
	disableAddButton();
	setPopupPage(1);
	hideAllPages();
	ebi("grades").classList.remove("hidden");
	ebi("pageTitle").innerText = "Marks";
	ebi("decoratedTitle").innerText = "";
	currentPage = 3;
	updateActivePageLink();
	closeSidebar();
	addNotesButton(0);
	loadGrades();
	loadSubjects();
}

//-----------------------------------------------------------------

function toCalendar() {
	setPopupPage(0);
	disableAddButton();
	hideAllPages();
	ebi("calendar").classList.remove("hidden");
	ebi("pageTitle").innerText = "Calendar";
	ebi("decoratedTitle").innerText = "";
	currentPage = 4;
	updateActivePageLink();
	closeSidebar();
	renderCalendar();
	let today = new Date();
	let date = currentDate.getMonth() + 1 + "/" + today.getDate() + "/" + currentDate.getFullYear();
	loadCalendarNotesInfo(date);
	addNotesButton(1);
}

//-----------------------------------------------------------------
function toHome() {
	loadNotes();
	setPopupPage(0);
	showAddButton();
	hideAllPages();
	ebi("homepage").classList.remove("hidden");
	ebi("pageTitle").innerText = "hi, ";
	ebi("decoratedTitle").innerText = username;
	currentPage = 2;
	updateActivePageLink();
	closeSidebar();
	addNotesButton(0);
}

//-----------------------------------------------------------------

function toChat() {
	setPopupPage(5);
	disableAddButton();
	hideAllPages();
	ebi("chatPage").classList.remove("hidden");
	ebi("pageTitle").innerText = "Pocket AI";
	ebi("decoratedTitle").innerText = "";
	currentPage = 1;
	updateActivePageLink();
	closeSidebar();
}

function loadSubjects(slectID = "subjectlist") {
	const url = serverURL + "/getSubjects" + "?t=" + Date.now();

	const xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		const response = JSON.parse(xhr.responseText);
		if (response.error === "0") {
			const subjects = response.subjects;
			const subjectList = ebi(slectID);
			subjectList.innerHTML = "";

			if (slectID === "subjectDataList") {
			} else {
				const allOption = document.createElement("option");
				allOption.value = "0";
				allOption.textContent = "All";
				subjectList.appendChild(allOption);
			}

			subjects.forEach(subject => {
				const option = document.createElement("option");
				option.value = subject.subject;
				option.textContent = subject.subject;
				subjectList.appendChild(option);
			});
		} else {
			console.error("Failed to load subjects:", response.message);
		}
	};

	xhr.onerror = function () {
		console.error("Network error while fetching subjects.");
	};

	xhr.send();
}

function loadMarksbysubject() {
	let option = ebi("subjectlist").value;

	if (option === "0") {
		loadGrades();
	} else {
		const url = serverURL + "/getMarksBySubject?subject=" + encodeURIComponent(option) + "&t=" + Date.now();
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.withCredentials = true;
		xhr.setRequestHeader("Content-Type", "application/json");

		xhr.onload = function () {
			if (xhr.status === 200) {
				const response = JSON.parse(xhr.responseText);
				if (response.error === "0") {
					const marks = response.marks;
					let container = ebi("containerVoti");
					container.innerHTML = "";
					marks.forEach(mark => {
						let outerWrap = document.createElement("div");
						outerWrap.classList.add("voto");
						outerWrap.id = mark.id;

						let voto = document.createElement("div");
						voto.classList.add("numeroVoto");

						if (mark.mark % 1 === 0) {
							voto.innerText = Math.floor(mark.mark);
						} else if (mark.mark % 1 >= 0.1 && mark.mark % 1 <= 0.3) {
							voto.innerText = Math.floor(mark.mark) + "+";
						} else if (mark.mark % 1 >= 0.4 && mark.mark % 1 <= 0.6) {
							voto.innerText = Math.floor(mark.mark) + ".5";
						} else if (mark.mark % 1 >= 0.7 && mark.mark % 1 <= 0.9) {
							voto.innerText = Math.ceil(mark.mark) + "-";
						} else {
							voto.innerText = mark.mark.toFixed(1);
						}

						if (mark.mark >= 6.5) {
							voto.style.borderColor = 'green';
						} else if (mark.mark >= 5) {
							voto.style.borderColor = 'orange';
						} else {
							voto.style.borderColor = 'red';
						}

						let innerWrap = document.createElement("div");
						innerWrap.classList.add("descriptionGrades");

						let description = document.createElement("div");

						let title = document.createElement("h4");
						let desc = document.createElement("p");
						desc.classList.add("descrizioneVoto");
						title.innerText = mark.title;
						desc.innerText = mark.subject + " - " + mark.date.split("T")[0].split("-").slice(1).join("/");

						description.classList.add("desc");

						let button = document.createElement("button");
						button.classList.add("eventButton");

						let icon = document.createElement("img");
						icon.classList.add("eventIcon");
						icon.src = "resources/icons/edit.svg";
						icon.alt = "edit";

						button.appendChild(icon);
						button.onclick = () => {
							let id = mark.id;
							openPopup(1);

							ebi("popupDeleteButton").classList.remove("hidden");
							ebi("popupDeleteButton").onclick = () => showConfirmDelete(id, false, true);

							ebi("gradeName").value = mark.title;
							ebi("subject").value = mark.subject;
							ebi("grade").value = mark.mark;
							ebi("gradeDate").value = mark.date.split("T")[0];
							ebi("gradeError").innerText = "";
							ebi("popupConfrimButton").innerText = "Save";
							ebi("popupConfrimButton").onclick = () => {
								ebi("popupConfrimButton").disabled = true;
								let mark = parseFloat(ebi("grade").value.trim());
								if (isNaN(mark) || mark < 0 || mark > 10) {
									displayError("gradeError", "Please enter a valid mark between 0 and 10");
									ebi("popupConfrimButton").disabled = false;
									return;
								}
								let title = ebi("gradeName").value.trim();
								let subject = ebi("subject").value.trim();
								let date = ebi("gradeDate").value.trim();
								if (!title || !subject || !date) {
									displayError("gradeError", "Please fill in all fields");
									ebi("popupConfrimButton").disabled = false;
									return;
								}
								date = formatDate(new Date(date));
								updateMark(id, mark, title, subject, date);
							};
						}

						description.appendChild(title);
						description.appendChild(desc);

						innerWrap.appendChild(description);
						innerWrap.appendChild(button)
						outerWrap.appendChild(voto);
						outerWrap.appendChild(innerWrap);

						container.appendChild(outerWrap);
					});
				} else {
					console.error("Error fetching marks by subject:", response.message);
				}
			} else {
				console.error("Failed to fetch marks by subject. Status:", xhr.status);
			}
		};

		xhr.onerror = function () {
			console.error("Network error while fetching marks by subject.");
		};

		xhr.send();
	}
}

/*
	event functions
 
	-> showPlaceholder: hides the events list and shows the placeholder
	-> showNotes: shows the events list and hides the placeholder
	-> showDeleteButton: shows the delete button for an event
	-> openEvent: opens the popup with the event data
*/

function showPlaceholder() {
	ebi("eventsList").classList.add("hidden");
	ebi("eventPlaceholder").classList.remove("hidden");
	ebi("eventPlaceholder").classList.add("visible");
}

//-----------------------------------------------------------------


function showNotes(notes) {
	ebi("eventsList").classList.remove("hidden");
	ebi("eventPlaceholder").classList.add("hidden");
	ebi("eventPlaceholder").classList.remove("visible");
	let list = ebi("eventsList");
	list.innerHTML = "";

	notes.forEach((note, index) => {
		const event = document.createElement("div");
		event.classList.add("upcomingEvent");
		event.id = note.id;
		event.onclick = () => showDeleteButton(note.id);

		const buttonContainer = document.createElement("div");
		buttonContainer.classList.add("eventButtonContainer");

		const button = document.createElement("button");
		button.classList.add("eventButton");
		button.onclick = () => openEvent(note);

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

//-----------------------------------------------------------------

function showDeleteButton(id) {
	if (!ebi(id).querySelector(".deleteNoteButton")) {
		let deleteButton = document.createElement("button");
		deleteButton.classList.add("deleteNoteButton");

		let deleteIcon = document.createElement("img");
		deleteIcon.src = "resources/icons/delete.svg";
		deleteIcon.classList.add("eventIcon");

		deleteButton.appendChild(deleteIcon);
		ebi(id).appendChild(deleteButton);

		deleteButton.onclick = (e) => {
			e.stopPropagation();
			showConfirmDelete(id);
		};

		let fakeScroll = document.createElement("div");
		fakeScroll.classList.add("fakeEmpty", "fakeScroll");
		ebi(id).appendChild(fakeScroll);

		const handleClickOutside = (e) => {
			try {
				if (!ebi(id).contains(e.target)) {
					fakeScroll.classList.add("hide");
					setTimeout(() => {
						fakeScroll.classList.remove("fakeScroll");
						fakeScroll.classList.remove("hide");
						deleteButton.remove();
						fakeScroll.remove();
					}, 210);
					document.removeEventListener("click", handleClickOutside);
				}
			} catch (e) {
			}
		};

		document.addEventListener("click", handleClickOutside);
	}
}

function showConfirmDelete(id, iscalendar = false, isMark = false) {
	ebi("cancelOverlay").classList.remove("hidden");
	if (isMark) {
		ebi("confirmCancellation").onclick = () => deleteMark(id);
	} else {
		ebi("confirmCancellation").onclick = () => deleteEvent(id, iscalendar);
	}
}

//-----------------------------------------------------------------
function openEvent(note, date = 0) {
	openPopup();
	ebi("popupDeleteButton").classList.remove("hidden");
	ebi("popupDeleteButton").onclick = () => showConfirmDelete(note.id, true);

	ebi("popupConfrimButton").innerText = "Save";
	ebi("popupConfrimButton").onclick = () => saveEvent(note, date);
	ebi("eventName").value = note.title;
	ebi("eventDescription").value = note.description;
	let data = note.date.split('T')[0];
	ebi("eventDate").value = data;
}

/*
	auth functions
 
	-> register: sends a POST request to the server to register a new user
	-> login: sends a POST request to the server to login a user
 
*/

function checkEmailAvailability(email) {
	if (!navigator.onLine) {
		return false;
	}
	if (!email) {
		return false;
	}
	let url = serverURL + "/validateEmail?email=" + email;
	let timestamp = new Date().getTime();
	url += "&t=" + timestamp;
	let xhr = new XMLHttpRequest();
	xhr.open("GET", url, false);
	xhr.send();

	if (xhr.status === 200) {
		let response = JSON.parse(xhr.responseText);
		return response.error === "0";
	} else {
		return false;
	}
}

//-----------------------------------------------------------------


function register() {
	displayError("registerError", "");
	enableLoading();
	username = ebi("registerName").value;
	let ntema = currentTheme;

	const url = serverURL + "/register";

	if (!email || !password) {
		toPage("name", "register");
		displayError("registerError", "an error occurred, please try again");
		disableLoading();
		return;
	}

	if (!username) {
		displayError("nameError", "Please fill in all fields");
		disableLoading();
		return;
	}

	let primary = getColorFromTheme(1, currentTheme);
	let secondary = getColorFromTheme(2, currentTheme);
	let tertiary = getColorFromTheme(3, currentTheme);


	const data = { email, password, primary, secondary, tertiary, name: username };
	const xhr = new XMLHttpRequest();

	xhr.open("POST", url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		disableLoading();
		let response = JSON.parse(xhr.responseText);
		if (response.error == 1) {
			displayError("nameError", "Registration failed: " + response.message);
			return;
		}

		swapToHome();
		location.reload();
	};

	xhr.onerror = function () {
		disableLoading();
		console.error("Network error:", xhr);
		displayError("nameError", "Network error. Please try again.");
	};

	xhr.send(JSON.stringify(data));
}

//-----------------------------------------------------------------

function getColorFromTheme(type, theme) {
	let color = null;
	switch (type) {
		case 1:
			switch (theme) {
				case 1:
					color = rootStyles.getPropertyValue("--primary-yellow");
					break;
				case 2:
					color = rootStyles.getPropertyValue("--primary-blue");
					break;
				case 3:
					color = rootStyles.getPropertyValue("--primary-green");
					break;
				case 4:
					color = rootStyles.getPropertyValue("--primary-purple");
					break;
			}
			break;
		case 2:
			switch (theme) {
				case 1:
					color = rootStyles.getPropertyValue("--secondary-yellow");
					break;
				case 2:
					color = rootStyles.getPropertyValue("--secondary-blue");
					break;
				case 3:
					color = rootStyles.getPropertyValue("--secondary-green");
					break;
				case 4:
					color = rootStyles.getPropertyValue("--secondary-purple");
					break;
			}
			break;
		case 3:
			switch (theme) {
				case 1:
					color = rootStyles.getPropertyValue("--minor-yellow");
					break;
				case 2:
					color = rootStyles.getPropertyValue("--minor-blue");
					break;
				case 3:
					color = rootStyles.getPropertyValue("--minor-green");
					break;
				case 4:
					color = rootStyles.getPropertyValue("--minor-purple");
					break;
			}
			break;
		default:
			console.error("Invalid type:", type);
			break;
	}
	return color;
}

//-----------------------------------------------------------------

async function logout() {
	let url = serverURL + "/logout";

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.open("DELETE", url);
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 1) {
			console.error("Logout failed:", response.message);
			return;
		}
		location.reload();
	};

	xhr.send();
}

//-----------------------------------------------------------------

function swapToHex() {
	ebi("hex").classList.remove("hidden");
	ebi("rgb").classList.add("hidden");
}

function swapToRgb() {
	ebi("hex").classList.add("hidden");
	ebi("rgb").classList.remove("hidden");
}

//-----------------------------------------------------------------

function login(logEmail = ebi("loginUsername").value.trim().toLowerCase(), logPassword = ebi("loginPassword").value.trim()) {
	displayError("loginError", "");
	enableLoading();
	if (!navigator.onLine) {
		displayError("loginError", "No connection. Please try again.");
		disableLoading();
		return false;
	}

	const url = serverURL + "/login";

	if (!logEmail || !logPassword) {
		disableLoading();
		displayError("loginError", "Please fill in all fields");
		return false;
	}

	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email: logEmail, password: logPassword }),
		credentials: 'include' // This is important for sending/receiving cookies
	})
		.then(response => response.json())
		.then(data => {
			if (data.error == 0) {
				cleanLogin();
				swapToHome();
			} else {
				disableLoading();
				displayError("loginError", data.message);
			}
		})
		.catch(err => {
			displayError("loginError", "Network error. Please try again.");
		});
}

//-----------------------------------------------------------------

function isLoggedTest() {
	const url = serverURL + "/isLogged";
	xhr.withCredentials = true;
	const xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			swapToHome();
		} else {
			swapToLogin();
		}
	};

	xhr.send();
}

async function autologin() {
	if (!navigator.onLine) {
		showFeedback(2, "You are offline");
		return;
	}

	const url = serverURL + "/isLogged";

	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.open("GET", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			swapToHome();
		} else {
			swapToWelcome();
		}
	};

	xhr.send();
}

loadCustomTheme();

/*
	db manipulation functions
 
	-> createEvent: sends a POST request to the server to create a new event
	-> loadNotes: sends a POST request to the server to get all the events
	-> saveEvent: sends a POST request to the server to update an event
	-> deleteEvent: sends a POST request to the server to delete an event
 
*/

function createEvent() {
	const title = ebi("eventName").value.trim();
	const description = ebi("eventDescription").value.trim();
	let date = ebi("eventDate").value.trim();

	if (!title || !description || !date) {
		displayError("eventError", "Please fill in all fields");
		return;
	}
	date = formatDate(date);

	const url = serverURL + "/addNote";
	const data = { title, description, date };

	const xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	const confirmButton = ebi("popupConfrimButton");
	confirmButton.disabled = true;

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);

		if (response.error == 0) {
			displayError("eventError", "");
			ebi("eventName").value = "";
			ebi("eventDescription").value = "";
			ebi("eventDate").value = "";
			closePopup();
			loadNotes();
			renderCalendar();
			loadCalendarNotesInfo(date);
			showFeedback(0, "Event created");
		} else {
			confirmButton.disabled = false;
			displayError("eventError", response.message);
		}
	};

	xhr.onerror = function () {
		confirmButton.disabled = false;
		displayError("eventError", "Network error. Please try again.");
	};

	xhr.send(JSON.stringify(data));
}

//-----------------------------------------------------------------
function loadNotes() {
	const url = serverURL + "/getDayNotes";

	let date = new Date();
	date = formatDate(date);
	const body = JSON.stringify({ date });

	const xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			try {
				if (Array.isArray(JSON.parse(xhr.responseText).notes)) {
					if (response.notes.length > 0) {
						showNotes(response.notes);
					} else {
						showPlaceholder();
						return;
					}
				} else {
					showPlaceholder();
					throw new Error("Unexpected response format");
				}
			} catch (e) {
				showPlaceholder();
				throw new Error("Error parsing response" + e);
			}
		} else {
			showPlaceholder();
			throw new Error(xhr.responseText);
		}
	};

	xhr.onerror = function () {
		showPlaceholder();
		throw new Error(xhr.statusText);

	};
	xhr.send(body);
}


function formatDate(date) {
	if (typeof date !== 'string') {
		date = date.toISOString().split('T')[0];
	}
	const [year, month, day] = date.split("-");
	return `${month}/${day}/${year}`;
}

function showCalendarNotes(notes) {
	/*"title": "prova",
	"description": "ababab",
	"dataora": "2025-01-26T00:00:00.000Z"
	*/
}

function loadNotesByDate(date) {
	const url = serverURL + "/getDayNotes";

	date = formatDate(date);
	const body = JSON.stringify({ date });

	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			try {
				if (Array.isArray(response.notes)) {
					if (response.notes.length > 0) {
						showCalendarNotes(data.notes);
					} else {
						return;
					}
				} else {
					throw new Error("Unexpected response format");
				}
			} catch (e) {
				throw new Error("Error parsing response" + e);
			}
		} else {
			throw new Error(xhr.responseText);
		}
	};

	xhr.onerror = function () {
		throw new Error(xhr.statusText);

	};
	xhr.send(body);
}


function closeCancellation() {
	ebi("cancelOverlay").classList.add("hidden");
	ebi("confirmCancellation").onclick = () => { };
}

function showCancellation(id) {
	ebi("cancelOverlay").classList.remove("hidden");
	ebi("confirmCancellation").onclick = () => deleteEvent(id);
}
//-----------------------------------------------------------------



function renderCalendar() {
	const monthYear = document.getElementById('monthYear');
	const daysContainer = document.getElementById('daysContainer');
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const firstDay = new Date(year, month, 1).getDay();
	const lastDate = new Date(year, month + 1, 0).getDate();

	monthYear.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

	daysContainer.innerHTML = '';
	for (let i = 0; i < firstDay; i++) {
		const emptyDiv = document.createElement('div');
		emptyDiv.classList.add('empty');
		daysContainer.appendChild(emptyDiv);
	}

	let lastDay = 1;
	for (let i = 1; i <= lastDate; i++) {
		const dayDiv = document.createElement('div');
		dayDiv.classList.add('day');
		dayDiv.textContent = i;
		dayDiv.id = i;
		dayDiv.classList.add('calendarDays');
		dayDiv.onclick = () => {
			let date = currentDate.getMonth() + 1 + "/" + i + "/" + currentDate.getFullYear();
			loadCalendarNotesInfo(date);
		}
		daysContainer.appendChild(dayDiv);
		lastDay = i;
	}

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.open("POST", serverURL + "/getDaysWithNotes");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			if (response.days !== null && response.days.length > 0) {
				response.days.forEach(day => {
					document.getElementById(day).classList.add('note');
					let div = document.createElement('div');
					div.classList.add('dailyPin');
					document.getElementById(day).appendChild(div);
				});
			}
		}
	}

	xhr.onerror = function () {
		console.error("Network error");
	}


	const firstDayOfMonth = formatDate(new Date(year, month, 2));
	const lastDayOfMonth = formatDate(new Date(year, month, lastDate + 1));
	let data = { startDate: firstDayOfMonth, endDate: lastDayOfMonth };
	xhr.send(JSON.stringify(data));
}

function prevMonth() {
	currentDate.setMonth(currentDate.getMonth() - 1);
	renderCalendar();
}

function nextMonth() {
	currentDate.setMonth(currentDate.getMonth() + 1);
	renderCalendar();
}
//-----------------------------------------------------------------

function saveEvent(note, sentDate) {
	if (typeof note === "undefined") {
		return;
	}
	const title = ebi("eventName").value.trim();
	const description = ebi("eventDescription").value.trim();
	const date = formatDate(ebi("eventDate").value.trim());

	if (!title || !description || !date) {
		displayError("eventError", "Please fill in all fields");
		return;
	}

	const url = serverURL + "/updateNote";

	const data = { title, description, date, id: note.id };

	const xhr = new XMLHttpRequest();
	xhr.open("PUT", url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	const confirmButton = ebi("popupConfrimButton");
	confirmButton.disabled = true;

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			displayError("eventError", "");
			ebi("eventName").value = "";
			ebi("eventDescription").value = "";
			ebi("eventDate").value = "";
			closePopup();
			if (sentDate === 0) {
				loadNotes();
			} else {
				renderCalendar();
				loadCalendarNotesInfo(sentDate);
			}

			showFeedback(0, "Event updated");
		} else {
			confirmButton.disabled = false;
			displayError("eventError", response.message);
		}
	};

	xhr.onerror = function () {
		confirmButton.disabled = false;
		displayError("eventError", "Network error. Please try again.");
	};

	xhr.send(JSON.stringify(data));
}

//-----------------------------------------------------------------

function deleteMark(id) {
	closeCancellation();
	let url = serverURL + "/deleteMarkbyid";

	url += `?id=` + id;

	const xhr = new XMLHttpRequest();
	xhr.open("DELETE", url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			loadGrades();
			showFeedback(1, "Mark deleted");
			closePopup();
			loadSubjects();
		} else {
			loadGrades();
			closePopup();
			showFeedback(2, "Error deleting mark");
		}
	};

	xhr.onerror = function () {
		console.error("Network error:", xhr);
	};

	xhr.send();
}

//-----------------------------------------------------------------

function deleteEvent(id, iscalendar = false) {
	closeCancellation();
	let url = serverURL + "/deleteNote";

	url += `?id=` + id;

	const xhr = new XMLHttpRequest();
	xhr.open("DELETE", url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			loadNotes();
			showFeedback(1, "Event deleted");
			if (iscalendar) {
				renderCalendar();
				let date = currentDate.getMonth() + 1 + "/" + currentDate.getDate() + "/" + currentDate.getFullYear();
				loadCalendarNotesInfo(date);
				closePopup();
			}
		} else {
			loadNotes();
			closePopup();
			showFeedback(2, "Error deleting event");
		}
	};

	xhr.onerror = function () {
		console.error("Network error:", xhr);
	};

	xhr.send();
}

//-----------------------------------------------------------------

function changeName() {
	ebi("popupNameError").innerText = "";
	const newName = ebi("newName").value.trim();

	if (!newName) {
		displayError("popupNameError", "Please fill in all fields");
		return;
	}

	const url = serverURL + "/updateName";

	const data = { name: newName };

	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.open("PUT", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	const confirmButton = ebi("popupConfrimButton");
	confirmButton.disabled = true;

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			displayError("popupNameError", "");
			username = newName;
			ebi("newName").value = "";
			closePopup();

			setInterval(() => {
				confirmButton.disabled = false;
			}, 1000);
			showFeedback(0, "Name changed");
		} else {
			displayError("popupNameError", response.message);
		}
	};

	xhr.onerror = function () {
		confirmButton.disabled = false;
		displayError("popupNameError", "Network error. Please try again.");
	};

	xhr.send(JSON.stringify(data));
}

//-----------------------------------------------------------------

function changePassword() {

	ebi("popupPasswordError").innerText = "";
	const newPassword = ebi("newPassword").value.trim();
	const confirmPassword = ebi("newConfirmPassword").value.trim();
	const oldPassword = ebi("currentPassword").value.trim();

	if (!newPassword || !confirmPassword || !oldPassword) {
		displayError("popupPasswordError", "Please fill in all fields");
		return;
	}

	if (newPassword !== confirmPassword) {
		displayError("popupPasswordError", "Passwords do not match");
		return;
	}

	if (newPassword === oldPassword) {
		displayError("popupPasswordError", "New password must be different from the old one");
		return;
	}

	if (newPassword.length < 8) {
		displayError("popupPasswordError", "Password must be at least 8 characters long");
		return;
	}

	const url = serverURL + "/updatePassword";

	const data = { newPassword };

	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.open("PUT", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	const confirmButton = ebi("popupConfrimButton");
	confirmButton.disabled = true;

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			displayError("popupPasswordError", "");
			ebi("newPassword").value = "";
			ebi("newConfirmPassword").value = "";
			ebi("currentPassword").value = "";

			closePopup();

			setInterval(() => {
				confirmButton.disabled = false;
			}, 1000);
			showFeedback(0, "Password changed");
		} else {
			displayError("popupPasswordError", response.message);
		}
	};

	xhr.onerror = function () {
		confirmButton.disabled = false;
		displayError("popupPasswordError", "Network error. Please try again.");
	};

	xhr.send(JSON.stringify(data));
}



//-----------------------------------------------------------------

function loadUsername() {
	const url = serverURL + "/getName";

	const xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			username = response.message;
			ebi("decoratedTitle").innerText = username;
		} else {
			console.error(xhr.responseText);
		}
	};

	xhr.onerror = function () {
		console.error(xhr.statusText);
	};

	xhr.send();
}

//-----------------------------------------------------------------ù

function getSavedTheme() {
	// Retrieve colors from localStorage if available
	const storedPrimary = localStorage.getItem("primaryColor");
	const storedSecondary = localStorage.getItem("secondaryColor");
	const storedTertiary = localStorage.getItem("tertiaryColor");

	if (storedPrimary && storedSecondary && storedTertiary) {
		document.documentElement.style.setProperty("--primary-color", storedPrimary);
		document.documentElement.style.setProperty("--secondary-color", storedSecondary);
		document.documentElement.style.setProperty("--minor-color", storedTertiary);
		primaryColor = storedPrimary;
		secondaryColor = storedSecondary;
		tertiaryColor = storedTertiary;
	}
}

function getTheme() {

	const url = serverURL + "/getTheme";

	const xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == "0") {
			const { primary, secondary, tertiary } = response.message;
			const primaryHex = "#" + primary;
			const secondaryHex = "#" + secondary;
			const tertiaryHex = "#" + tertiary;

			document.documentElement.style.setProperty("--primary-color", primaryHex);
			document.documentElement.style.setProperty("--secondary-color", secondaryHex);
			document.documentElement.style.setProperty("--minor-color", tertiaryHex);

			primaryColor = primaryHex;
			secondaryColor = secondaryHex;
			tertiaryColor = tertiaryHex;

			// Save the new colors to localStorage
			localStorage.setItem("primaryColor", primaryHex);
			localStorage.setItem("secondaryColor", secondaryHex);
			localStorage.setItem("tertiaryColor", tertiaryHex);
		} else {
			console.error(xhr.responseText);
		}
	};

	xhr.onerror = function () {
		console.error(xhr.statusText);
	};

	xhr.send();
}

//-----------------------------------------------------------------

function parseMarkdown(markdownText) {
	const md = window.markdownit();
	return md.render(markdownText);
}
//-----------------------------------------------------------------

function sendMessage() {
	let message = ebi("userInput").value.trim();
	ebi("userInput").value = "";
	ebi("userInput").disabled = true;
	if (!message || message === "") {
		return;
	}

	ebi("sendButton").disabled = true;

	let newMessage = document.createElement("div");
	newMessage.classList.add("message");
	newMessage.classList.add("user");
	let displayMessage = parseMarkdown(message);
	newMessage.innerHTML = displayMessage;

	ebi("messagesList").appendChild(newMessage);

	let aiResponse = document.createElement("div");
	aiResponse.classList.add("message");
	aiResponse.classList.add("ai");
	aiResponse.classList.add("loading");
	let loadAnimation = document.createElement("img");
	loadAnimation.src = "resources/icons/chatLoading.svg";
	loadAnimation.classList.add("loadingAnimation");
	aiResponse.appendChild(loadAnimation);
	ebi("messagesList").appendChild(aiResponse);
	scrollToBottom();

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.open("POST", serverURL + "/chat");

	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		ebi("sendButton").disabled = false;
		ebi("userInput").disabled = false;
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			aiResponse.innerHTML = "";
			let parsedResponse = parseMarkdown(response.message);
			aiResponse.innerHTML = parsedResponse;
			aiResponse.classList.remove("loading");
			scrollToBottom();
		} else {
			aiResponse.innerText = "i'm sorry, something went wrong :(";
			aiResponse.classList.remove("loading");
		}
	};

	xhr.onerror = function () {
		ebi("sendButton").disabled = false;
		ebi("userInput").disabled = false;
		aiResponse.innerText = "i'm sorry, something went wrong :(";
		aiResponse.classList.remove("loading");
	};

	xhr.send(JSON.stringify({ message }));
}

function sendScheduleInfo() {
	ebi("popupConfrimButton").disabled = true;

	let subject = ebi("subjectToStudy").value.trim();

	if (!subject || subject === "") {
		displayError("aiError", "Please fill in all fields");
		return;
	}

	let fromDate;
	let toDate;
	try {
		fromDate = formatDate(ebi("fromDate").value.trim());
		toDate = formatDate(ebi("toDate").value.trim());
	} catch (e) {
		displayError("aiError", "Please fill in all fields");
		return;
	}

	let frequency = ebi("frequency").value;

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.open("POST", serverURL + "/setStudyPlan");

	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {

		ebi("popupConfrimButton").disabled = false;
		let response = JSON.parse(xhr.responseText);

		if (response.error == 0) {
			displayError("aiError", "");
			closePopup();
			let chat = ebi("messagesList")

			let notes = response.message.notes;
			let i = 0;
			for (let note of notes) {
				let messageContainer = document.createElement("div");
				let id = "messageContainer" + i
				messageContainer.id = id;
				i++;

				let messageBody = document.createElement("div");
				messageBody.classList.add("message");
				messageBody.classList.add("ai");

				let title = document.createElement("h4");
				title.innerText = note.title;

				let description = document.createElement("p");
				description.innerText = note.description;

				let date = document.createElement("p");
				date.innerText = note.date;

				let messageButtons = document.createElement("div");
				messageButtons.classList.add("messageButtons");

				let addButton = document.createElement("button");

				addButton.innerText = "Add";
				addButton.classList.add("messageButton");
				addButton.classList.add("success");
				addButton.onclick = () => {
					addStudyPlan(note, id);

				}

				let cancelButton = document.createElement("button");
				cancelButton.innerText = "refuse";
				cancelButton.classList.add("messageButton");
				cancelButton.classList.add("delete");
				cancelButton.onclick = () => {
					cancelStudyPlan(id);
				}

				messageButtons.appendChild(addButton);
				messageButtons.appendChild(cancelButton);

				messageBody.appendChild(title);
				messageBody.appendChild(description);
				messageBody.appendChild(date);

				messageContainer.appendChild(messageBody);
				messageContainer.appendChild(messageButtons);

				chat.appendChild(messageContainer);
			};
		} else {
			displayError("aiError", response.message);
		}
	};

	xhr.onerror = function () {
		displayError("aiError", "Network error. Please try again.");
	};

	xhr.send(JSON.stringify({ subject, startDate: fromDate, endDate: toDate, frequency }));
}

function addStudyPlan(note, id) {

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.open("POST", serverURL + "/addNote");

	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			ebi(id).remove();
			showFeedback(0, "Event added to your calendar");
		} else {
			showFeedback(1, response.message);
		}
	};

	xhr.onerror = function () {
		showFeedback(2, "Network error");
	}

	xhr.send(JSON.stringify({ title: note.title, description: note.description, date: note.date }));

	ebi(id).remove();
}

function cancelStudyPlan(id) {
	ebi(id).remove();
}


function loadCalendarNotesInfo(date) {
	if (!date) {
		return;
	}

	ebi("headerNote").innerText = "events on " + date;
	ebi("descriptionCalendar").innerText = "click on an event to see the description";
	let xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	xhr.open("POST", serverURL + "/getDayNotes");

	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error !== "0") {
			showFeedback(1, "an error occured");
			return;
		}

		let notes = response.notes;

		let container = ebi("noteListCalendar");

		container.innerHTML = "";

		if (notes.length === 0) {

		}
		else {
			for (let note of notes) {

				let externalContainer = document.createElement("div");
				externalContainer.id = "calendarNote" + note.id;
				externalContainer.classList.add("noteCalendar");

				let button = document.createElement("button");
				button.classList.add("eventButton");
				button.onclick = () => openEvent(note, date);


				let buttonImage = document.createElement("img");
				buttonImage.src = "resources/icons/edit.svg";
				buttonImage.classList.add("eventIcon");

				button.appendChild(buttonImage);

				let title = document.createElement("div");
				title.classList.add("noteTitle");

				title.innerText = note.title;

				title.onclick = () => showEventDesctiption(note.description);

				externalContainer.appendChild(button);
				externalContainer.appendChild(title);

				container.appendChild(externalContainer);
			}

			const confirmButton = ebi("popupConfrimButton");
			confirmButton.disabled = false;
		}
	}

	xhr.onerror = function () {
		showFeedback(2, "Network error");
	}

	xhr.send(JSON.stringify({ date }));
}


function showEventDesctiption(description) {
	ebi("descriptionCalendar").innerText = description;
}


/*
		* Function to get the color based on the average mark
		* @param {number} average - The average mark
		* @param {number} opacity - The opacity of the color
		* @returns {string} - The color in rgba format
		*/
function getColor(average, opacity) {
	if (average < 5.75) return "rgba(255, 0, 0, " + opacity + ")"; // Red
	if (average >= 5.75 && average <= 6.25) return "rgb(253, 218, 13, " + opacity + ")"; // Yellow
	return "rgba(0, 128, 0, " + opacity + ")";
}

/*
* Function to get the color of the point based on the mark
* @param {object} ctx - The context of the point
* @returns {string} - The color in rgba format
*/
function formatDateChart(dateString) {
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const date = new Date(dateString);
	return date.getDate() + " " + months[date.getMonth()];
}

/*
* Function to get the color of the point based on the mark
* @param {object} ctx - The context of the point
* @returns {string} - The color in rgba format
*/
function marksTendency(ctx, opacity = 1) {
	if (ctx.p1.parsed.y > 5.75 && ctx.p1.parsed.y <= 6.25) {
		return "rgb(253, 218, 13, " + opacity + ")";
	} else if (ctx.p1.parsed.y > 6.25) {
		return "rgba(0, 128, 0, " + opacity + ")";
	} else {
		return "rgba(255, 0, 0, " + opacity + ")";
	}
}

/*
* Function to get the color of the point based on the mark
* @param {object} ctx - the chart object
* @returns {string} - dataset to generae the chart
*/
function createChart(canvasId, dataset) {
	// Destroy previous chart instance if it exists
	if (window.myChart) {
		window.myChart.destroy();
	}
	const ctx = document.getElementById(canvasId).getContext("2d");

	// Animation configuration
	const totalDuration = 400;
	const delayBetweenPoints = totalDuration / dataset.length;
	const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1] ? ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y : ctx.chart.scales.y.getPixelForValue(100);
	const animation = {
		x: {
			type: 'number',
			easing: 'linear',
			duration: delayBetweenPoints,
			from: NaN,
			delay(ctx) {
				if (ctx.type !== 'data' || ctx.xStarted) {
					return 0;
				}
				ctx.xStarted = true;
				return ctx.index * delayBetweenPoints;
			}
		},
		y: {
			type: 'number',
			easing: 'linear',
			duration: delayBetweenPoints,
			from: previousY,
			delay(ctx) {
				if (ctx.type !== 'data' || ctx.yStarted) {
					return 0;
				}
				ctx.yStarted = true;
				return ctx.index * delayBetweenPoints;
			}
		}
	};

	// Sort the dataset by date in case it's not sorted
	dataset.sort((a, b) => new Date(a.date) - new Date(b.date));

	// Extract the labels and data from the dataset
	const labels = dataset.map(entry => formatDateChart(entry.date));
	const data = dataset.map(entry => entry.mark);

	// Calculate the cumulative averages
	const cumulativeAverages = data.map((_, index) => {
		const subset = data.slice(0, index + 1);
		return subset.reduce((sum, mark) => sum + mark, 0) / subset.length;
	});

	// Create the chart
	const average = data.reduce((sum, mark) => sum + mark, 0) / data.length;
	const backgroundColor = getColor(average, 0.3);
	const borderColor = getColor(average, 1);
	const pointColor = getColor(average, 1);
	const six = data.map(() => 6);

	window.myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: labels,
			datasets: [

				{
					data: data,
					borderColor: borderColor,
					borderWidth: 2,
					fill: false,
					pointRadius: 4,
					tension: 0,
					pointBackgroundColor: pointColor,
					segment: {
						borderColor: ctx => marksTendency(ctx, 1),
					}
				},

				{
					label: 'Average',
					data: cumulativeAverages,
					borderColor: 'rgb(70, 130, 180)',
					borderWidth: 2,
					fill: true,
					backgroundColor: backgroundColor,
					pointRadius: 4,
					pointBackgroundColor: 'rgb(70, 130, 180)',
					tension: 0,
					segment: {
						backgroundColor: ctx => marksTendency(ctx, 0.3),
						pointBackgroundColor: ctx => marksTendency(ctx),
					}
				},

				// drawing the 6 line
				{
					data: six,
					borderColor: 'rgba(0, 0, 0, 0.5)',
					borderDash: [5, 5],
					borderWidth: 1,
					pointRadius: 0,
					fill: false,
				},
			]
		},
		options: {
			animation,
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: false
				}
			},
			scales: {
				y: {
					beginAtZero: true,
					suggestedMax: 10
				}
			},

		}
	});
}

function fillChart(subject = 0) {

	let url;
	if (subject == 0) {
		url = serverURL + "/getMarks?t=" + Date.now();
	} else {
		url = serverURL + "/getMarksBySubject?subject=" + encodeURIComponent(subject) + "&t=" + Date.now();
	}

	const xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		let response = JSON.parse(xhr.responseText);
		if (response.error == 0) {
			const transformedData = response.marks.map(mark => ({
				date: mark.date.split("T")[0],
				mark: parseFloat(mark.mark)
			}));
			createChart("chart", transformedData);
		} else {
			console.error(xhr.responseText);
		}
	};

	xhr.onerror = function () {
		console.error(xhr.statusText);
	};

	xhr.send();
}