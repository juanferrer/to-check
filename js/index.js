/* globals $, debug, isSignedIn, uploadAppData */

// #region Globals

/** Settings */
var settings = {
    toCheckLists: "",
    currentList: "",
    currentTheme: "",
    hideCompleted: false,
    sortKeys: false
};

/** Settings as they were after last sync */
var settingsLast = {}; // eslint-disable-line no-unused-vars

const listPrefaceString = "lisname";
const elementPrefaceString = "elename";

// eslint-disable-next-line no-unused-vars
let refresh = () => {
    location.reload(true);
};

/** Open and close the side menu */
let toggleSideMenu = () => {
    if ($("#side-menu").attr("data-open")) {
        hideSideMenu();
    } else {
        showSideMenu();
    }
};

let hideSideMenu = () => {
    $("#side-menu")[0].style.left = "-250px";
    $("#side-menu").removeAttr("data-open");
};

let showSideMenu = () => {
    $("#side-menu")[0].style.left = "0px";
    $("#side-menu").attr("data-open", true);
};

/** Change the app theme */
let switchTheme = () => {
    let oldTheme = $("input[name=theme]:checked").val();
    let newTheme = oldTheme === "light" ? "dark" : "light";

    $("#theme-button").toggleClass("light");
    $("#theme-button").toggleClass("dark");

    $(`input[value=${newTheme}`).click();

    $("#theme-button").attr("data-theme", newTheme);
    localStorage.setItem("currentTheme", newTheme);
    settings.currentTheme = newTheme;
    saveSettings();
};

let toggleHideCompleted = () => {
    // Check if the attribute is present
    let newHideCompleted = $("#completed-button")[0].hasAttribute("data-hide");

    $("#completed-button").toggleClass("on");
    $("#completed-button").toggleClass("off");

    if (newHideCompleted) {
        $("#completed-button").removeAttr("data-hide");
    } else {
        $("#completed-button").attr("data-hide", "");
    }
    localStorage.setItem("hideCompleted", !newHideCompleted);
    settings.hideCompleted = !newHideCompleted;
    saveSettings();

    populateList();
};

let toggleSortKeys = () => {
    // Check if the attribute is present
    let newSortKeys = $("#sort-button")[0].hasAttribute("data-sort");

    $("#sort-button").toggleClass("on");
    $("#sort-button").toggleClass("off");

    if (newSortKeys) {
        $("#sort-button").removeAttr("data-sort");
    } else {
        $("#sort-button").attr("data-sort", "");
    }
    localStorage.setItem("sortKeys", !newSortKeys);
    settings.sortKeys = !newSortKeys;
    saveSettings();
    populateList();
};

/**
 * Update the list title
 * @param {Event} e
 * @listens blur
 */
let updateListTitle = e => {
    let newListName = e.currentTarget.textContent;
    if (convertToVarName(newListName, true) !== settings.currentList) {
        settings.toCheckLists[convertToVarName(newListName, true)] = settings.toCheckLists[settings.currentList];
        settings.toCheckLists[settings.currentList] = undefined;
        settings.currentList = convertToVarName(newListName, true);

        saveLists();
        populateList();
        populateSideMenu();
    }
};

/**
 * Reload the list selected
 * @param {Event} e
 * @listens click
 */
let changeListSelection = e => {
    settings.currentList = convertToVarName(e.currentTarget.firstChild.textContent, true);

    populateList();
    populateSideMenu();
    saveLists();
    toggleSideMenu();
};

/**
 * Create and select a new list
 * @param {Event} e
 * @listens click
 */
let addList = () => {
    settings.currentList = convertToVarName("New List", true);

    let newListNum = 2;
    while (settings.toCheckLists[settings.currentList] !== undefined) {
        settings.currentList = convertToVarName(`New List ${newListNum}`, true);
        newListNum++;
    }

    settings.toCheckLists[settings.currentList] = {};
    populateList();
    saveLists();
    populateSideMenu();
    toggleSideMenu();
};

/**
 * Remove the selected list
 * @param {Event} e
 * @listens click
 */
let removeList = e => {
    let listToRemove = convertToVarName(e.currentTarget.previousElementSibling.textContent, true);


    settings.toCheckLists[listToRemove] = undefined;
    populateSideMenu();
    if (settings.currentList === listToRemove) {
        if ($("#side-menu-list").children().length === 0) {
            addList();
        } else settings.currentList = convertToVarName($("#side-menu-list").children()[0].firstChild.textContent, true);
    }
    populateList();
    saveLists();
};

/**
 * Change the status of the clicked checkbox
 * @param {Event} e
 * @listens click
 * */
let toggleCheckbox = e => {
    let checkbox = e.currentTarget.previousElementSibling;
    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) checkbox.setAttribute("checked", true);
    else checkbox.removeAttribute("checked");

    saveLists();
    populateList();
};

/**
 * Add a new item to the list and update
 * @param {Event} e
 * @listens click
 */
let addItemToList = e => {
    let itemName = e.currentTarget.nextElementSibling.textContent;
    if (itemName) {
        settings.toCheckLists[settings.currentList] = settings.toCheckLists[settings.currentList] || {};

        settings.toCheckLists[settings.currentList][convertToVarName(itemName)] = false;
        populateList();
        saveLists();
        $("#list-add-input").empty();
    }
};

/**
 * Remove an item from the list and update
 * @param {Event} e
 */
let removeItem = e => {
    e.currentTarget.parentElement.remove();
    saveLists();
    populateList();
};

/**
 * Do different things depending on the key that has been pressed
 * @param {*} e
 */
let handleKeyPress = e => {
    if (e.key === "Enter") $("#list-add-button").click();
};

/** Load settings */
let loadSettings = () => {
    settings.currentTheme = localStorage.getItem("currentTheme") || "light";
    settings.hideCompleted = localStorage.getItem("hideCompleted") === "true";
    settings.sortKeys = localStorage.getItem("sortKeys") === "true";
};

/** Make necessary changes to match settings */
let applySettings = () => {
    if (settings.currentTheme !== $("#theme-button").attr("data-theme")) switchTheme();
    if (settings.hideCompleted !== $("#completed-button")[0].hasAttribute("data-hide")) toggleHideCompleted();
    if (settings.sortKeys !== $("#sort-button")[0].hasAttribute("data-sort")) toggleSortKeys();
};

/** If logged in, sync settings to Google Drive*/
let saveSettings = () => {
    if (debug.dev && isSignedIn) {
        uploadAppData();
    }
};

/** Load the lists */
let loadLists = () => {
    let listsJSONStr = localStorage.getItem("toCheckLists");
    settings.toCheckLists = listsJSONStr ? JSON.parse(listsJSONStr) : {};
    settings.currentList = localStorage.getItem("currentList") || convertToVarName("New List", true);
};

/** Fill the list area with the currently selected list */
let populateList = () => {
    $("#list").empty();
    $("#list-title")[0].innerHTML = convertToTitle(settings.currentList);
    if (settings.toCheckLists[settings.currentList]) {

        let keys = Object.keys(settings.toCheckLists[settings.currentList]);

        if (settings.sortKeys) keys = keys.sort();

        //Object.keys(toCheckLists[currentListName]).sort().forEach(itemName => {
        keys.forEach(itemName => {
            /*if (hideCompleted && toCheckLists[currentListName][itemName]) {
                // Don't add
            } else {*/
            let newElement = document.createElement("li");
            newElement.setAttribute("class", `list-group-item d-flex align-items-center ${settings.toCheckLists[settings.currentList][itemName] && settings.hideCompleted ? "hidden" : ""}`);
            newElement.innerHTML = `<input type="checkbox" ${settings.toCheckLists[settings.currentList][itemName] ? 'checked="true"' : ""}>` +
                '<span class="checkbox"></span>' +
                `<span class="checkbox-label" contenteditable="true">${convertToTitle(itemName)}</span>` +
                //'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-circle theme-colored-icon btn-item-delete"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
                '<i class="material-icons theme-colored-icon btn-item-delete">cancel</i>';
            $("#list")[0].appendChild(newElement);
            //}
        });

        $(".checkbox").off("click", toggleCheckbox);
        $(".checkbox").click(toggleCheckbox);
        $(".checkbox-label").off(saveLists);
        $(".checkbox-label").blur(saveLists);
        $(".btn-item-delete").off(removeItem);
        $(".btn-item-delete").click(removeItem);
    }
};

/** Save the lists */
let saveLists = () => {
    settings.toCheckLists[settings.currentList] = {};
    Array.from($("#list").children()).forEach(e => {
        settings.toCheckLists[settings.currentList][convertToVarName(e.children[2].textContent)] = e.firstChild.getAttribute("checked") === "true";
    });
    localStorage.setItem("toCheckLists", JSON.stringify(settings.toCheckLists));
    localStorage.setItem("currentList", settings.currentList);
    saveSettings();
};

/**
 * Extract a title from the var name
 * @param {string} s String to be titleised
 */
let convertToTitle = s => {
    let firstCharOfName = s.startsWith(listPrefaceString) || s.startsWith(elementPrefaceString) ? elementPrefaceString.length : 0;
    return decodeURI(s.slice(firstCharOfName));
};

/**
 * Convert to a valid var name
 * @param {string} s String that needs to become a var name
 * @param {boolean} isList Whether the var name needs to be for an element or a list
 */
let convertToVarName = (s, isList = false) => {
    return (isList ? listPrefaceString : elementPrefaceString) + encodeURI(s).trim();
};

/** Load the list names on the side menu */
let populateSideMenu = () => {
    $("#side-menu-list").empty();

    for (let itemName in settings.toCheckLists) {
        if (settings.toCheckLists[itemName]) {
            let newElement = document.createElement("li");
            newElement.setAttribute("class", `list-group-item d-flex align-items-center ${settings.currentList === itemName ? "selected" : ""}`);
            newElement.innerHTML = `<span class="side-menu-list-name theme-colored-text" >${convertToTitle(itemName)}</span>` +
                //'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash theme-colored-icon btn-list-delete"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
                '<i class="material-icons theme-colored-icon btn-list-delete">delete</i>';
            $("#side-menu-list")[0].appendChild(newElement);
        }
    }

    $("#side-menu-list").children().off(changeListSelection);
    $("#side-menu-list").children().click(changeListSelection);
    $(".btn-list-delete").off(removeList);
    $(".btn-list-delete").click(removeList);
};

/**
 * "Deep copy"
 */
let deepCopy = (o) => {
    return JSON.parse(JSON.stringify(o));
};

let main = () => {
    // Store the Add to Home Screen prompt
    let deferredPrompt;
    window.addEventListener("beforeinstallprompt", e => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;

        if (localStorage.getItem("appInstalled") === "false") {
            setTimeout(() => {
                deferredPrompt.prompt();
                localStorage.setItem("appInstalled", true);
                deferredPrompt.userChoice.then(result => {
                    if (result.outcome === "accepted") {
                        // Installed
                    } else {
                        // Prompt dismissed
                    }
                });
            }, 5000);
        }
    });

    /*window["isUpdateAvailable"]
        .then(isAvailable => {
            if (isAvailable) {
                $("#alert-modal").modal();
            }
        });*/

    //feather.replace();
    loadLists();
    loadSettings();
    applySettings();
    populateList();
    populateSideMenu();
    settingsLast = localStorage.getItem("settingsLast");
};

// #region Event handlers

$("#menu-button").click(toggleSideMenu);

$("#theme-button").click(switchTheme);

$("#completed-button").click(toggleHideCompleted);

$("#side-menu-list").children().click(changeListSelection);

$("#side-menu-list-add-button").click(addList);

$("#list-title").click(hideSideMenu);

$("#list-area").click(hideSideMenu);

$("#list-title").blur(updateListTitle);

$(".checkbox").click(toggleCheckbox);

$("#list-add-button").click(addItemToList);

$(".btn-item-delete").click(removeItem);

$("#list-add-input").keydown(handleKeyPress);

$("#sort-button").click(toggleSortKeys);

// #endregion

main();
