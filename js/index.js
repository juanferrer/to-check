/* globals $, feather */

// #region Globals
var lists;
var currentListName = "lisnameMovies";
const moviePrefaceString = "movname";
const listPrefaceString = "lisname";

/** Open and close the side menu */
let toggleSideMenu = () => {
	if ($("#side-menu").attr("data-open")) {
		$("#side-menu")[0].style.width = "0px";
		$("#side-menu").removeAttr("data-open");
	} else {
		$("#side-menu")[0].style.width = "250px";
		$("#side-menu").attr("data-open", true);
	}
};

/** Change the app theme */
let switchTheme = () => {
	let switchToLightTheme = $("#theme-button").attr("data-theme") === "dark";
	if (switchToLightTheme) {
		$(":root").css("--main-color", "hsla(0, 0%, 98%, 1)");
		$(":root").css("--background-color", "hsla(0, 0%, 90%, 1)");
		$(":root").css("--semi-transparent-hover", "hsla(0, 0%, 30%, 0.3)");
		$(":root").css("--text-color", "hsla(0, 0%, 20%, 1)");
		$(":root").css("--icon-color", "hsla(0, 0%, 20%, 1)");
		$("#light-theme-icon").css("display", "none");
		$("#dark-theme-icon").css("display", "initial");

	} else {
		$(":root").css("--main-color", "hsla(0, 0%, 20%, 1)");
		$(":root").css("--background-color", "hsla(0, 0%, 15%, 1)");
		$(":root").css("--semi-transparent-hover", "hsla(0, 0%, 70%, 0.3)");
		$(":root").css("--text-color", "hsla(0, 0%, 90%, 1)");
		$(":root").css("--icon-color", "hsla(0, 0%, 90%, 1)");
		$("#light-theme-icon").css("display", "initial");
		$("#dark-theme-icon").css("display", "none");
	}

	$("#theme-button").attr("data-theme", switchToLightTheme ? "light" : "dark");
};

let toggleCheckbox = (e) => {
	let checkbox = e.currentTarget.previousElementSibling;
	checkbox.checked = !checkbox.checked;

	if (checkbox.checked) checkbox.setAttribute("checked", true);
	else checkbox.removeAttribute("checked");

	saveLists();
};

let addItemToList = (e) => {
	let itemName = e.currentTarget.nextElementSibling.innerHTML;

	lists[currentListName] = lists[currentListName] || {};

	lists[currentListName][convertToVarName(itemName)] = false;
	populateList();
	saveLists();
	$("#list-add-input").empty();
};

/** Load the lists */
let loadLists = () => {
	let listsJSONStr = localStorage.getItem("toCheckLists");
	lists = listsJSONStr ? JSON.parse(listsJSONStr) : {};
};

/**
 * Capitalise the first letter of each word, turning it into a title
 * @param {string} s String to be titleised
 */
let convertToTitle = s => {
	let firstCharOfName = s.startsWith(listPrefaceString) || s.startsWith(moviePrefaceString) ? moviePrefaceString.length : 0;
	return s.slice(firstCharOfName).split(/(?=[A-Z])|(?=[0-9])/g).join(" ").trim();
};

/**
 * Remove spaces and convert to a camel case string
 * @param {string} s String that needs to become a variable name
 */
let convertToVarName = s => {
	let pascalCaseStr = s.split(" ").reduce((a, c) => {
		return a + c.charAt(0).toUpperCase() + c.slice(1);
	}, "");
	return listPrefaceString + pascalCaseStr.trim();
};

/** Fill the list area with the currently selected list */
let populateList = () => {
	$("#list").empty();
	$("#list-title")[0].innerHTML = convertToTitle(currentListName);
	for (let itemName in lists[currentListName]) {
		let newElement = document.createElement("li");
		newElement.setAttribute("class", "list-group-item d-flex align-items-center");
		newElement.innerHTML = `<input type="checkbox" ${lists[currentListName][itemName] ? 'checked="true"' : ""}>` +
			'<span class="checkbox"></span>' +
			`<span class="checkbox-label" contenteditable="true">${convertToTitle(itemName)}</span>`;
		$("#list")[0].appendChild(newElement);
	}

	$(".checkbox").off("click", toggleCheckbox);
	$(".checkbox").click(toggleCheckbox);
};

/** Save the lists */
let saveLists = () => {
	lists[currentListName] = {};
	Array.from($("#list").children()).forEach(e => {
		lists[currentListName][convertToVarName(e.lastChild.innerHTML)] = e.firstChild.getAttribute("checked") === "true";
	});
	localStorage.setItem("toCheckLists", JSON.stringify(lists));
};

let main = () => {
	feather.replace();
	loadLists();
	populateList();
};

// #region Event handlers

$("#menu-button").click(toggleSideMenu);

$("#theme-button").click(switchTheme);

$(".checkbox").click(toggleCheckbox);

$("#list-add-button").click(addItemToList);

// #endregion

main();
