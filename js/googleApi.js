/* globals gapi, debug, $ */

const API_KEY = "AIzaSyCuZUd6F2KNE8QSFGMNMWVv6HxiK8NuU0M";
const CLIENT_ID = "672870556931-ptqqho5vg0ni763q8srvhr3kpahndjae.apps.googleusercontent.com";

const SCOPES = "https://www.googleapis.com/auth/drive.appdata";
const DISCOVERY_DOCUMENTS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

const CONFIG_FILENAME = "to-check-config.json";

var isSignedIn;

function initClient() {
    // Initialize the JavaScript client library
    gapi.client.init({
        "apiKey": API_KEY,
        "clientId": CLIENT_ID,
        "scope": SCOPES,
        "discoveryDocs": DISCOVERY_DOCUMENTS
    }).then(function () {
        // Listen for sign-in state changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state
        isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
        updateSigninStatus(isSignedIn);

        if (isSignedIn) {
            gapi.client.load("drive", "v3", onDriveAPILoaded);
        }
    }).then(function (response) {
        debug.log(response.result);
    }, function (reason) {
        debug.log(`Error: ${reason.result.error.message}`);
    });
}

/**
 * What to do when the Drive API has been loaded
 */
function onDriveAPILoaded() {
    gapi.client.drive.files.list({
        spaces: "appDataFolder",
        fields: "nextPageToken, files(id, name)",
        pageSize: 100
    }).then(function (response) {
        let configFileId = "";
        let files = response.result.files;
        if (files) {
            // Otherwise, replace local with Drive
            for (let i = 0; i < files.length; ++i) {
                debug.log(`Found file: ${files[i].name} - ${files[i].id}`);
                if (files[i].name === CONFIG_FILENAME) {
                    // Config file found, use this file to load everything
                    configFileId = files[i].id;
                }
            }

            if (configFileId !== "") {
                // Set data from here
                /*gapi.client.drive.files.get({
                    fileId: configFileId,
                    mimeType: "application/json",
                    fields: "webContentLink"
                }).then(function (response) {
                    debug.log(response.result);
                    fetch(response.result.webContentLink)
                        .then(result => result.blob())
                        .then(function (blob) {
                            let reader = new FileReader();
                            reader.addEventListener("loadend", function () {
                            // reader.result
                                debug.log(reader.result);
                            });
                            reader.readAsText(blob);
                        });
                    
                });*/
                $.ajax({
                    url: `https://www.googleapis.com/drive/v3/files/${configFileId}?alt=media`,
                    method: "GET",
                    success: function (response) {
                        debug.log(response);
                    },
                    error: function (error) {
                        debug.log(error);
                    }
                });

            } else {
                // If file not in Drive, upload local (first time)
                debug.log("Config file not found");
                uploadDataToDrive(jsonFromLocalStorage());
            }
        }
    });
}

/**
 * Generate a JSON object from the local storage
 * @returns {*} JSON data object containing everything that can be stored
 */
function jsonFromLocalStorage() {
    let jsonData = {};
    jsonData.currentTheme = localStorage.getItem("currentTheme");
    jsonData.hideCompleted = localStorage.getItem("hideCompleted");
    jsonData.sortKeys = localStorage.getItem("sortKeys");
    jsonData.toCheckLists = localStorage.getItem("toCheckLists");
    jsonData.currentList = localStorage.getItem("currentList");

    return jsonData;
}

function uploadDataToDrive(jsonData) {
    gapi.client.drive.files.create({
        name: CONFIG_FILENAME,
        parents: ["appDataFolder"],
        mimeType: "application/json",
        body: JSON.stringify(jsonData)
    }).then(function (response) {
        debug.log(`File uploaded. ID: ${response.result.id}`);
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        // TODO: Replace with user profile icon
    } else {
        // TODO: Replace with person icon
    }
}

/**  Sign in the user upon button click */
function signIn(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/** Sign out the user upon button click */
function signOut(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function loadClient() {
    if (debug.dev) {
        gapi.load("client:auth2", initClient);
    }
}
