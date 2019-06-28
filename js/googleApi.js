/* globals gapi, debug, gdad, settings, applySettings, populateList, populateSideMenu */

const API_KEY = "AIzaSyCuZUd6F2KNE8QSFGMNMWVv6HxiK8NuU0M";
const CLIENT_ID = "672870556931-ptqqho5vg0ni763q8srvhr3kpahndjae.apps.googleusercontent.com";

const SCOPES = "https://www.googleapis.com/auth/drive.appdata";
const DISCOVERY_DOCUMENTS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

const CONFIG_FILENAME = "to-check-config.json";

var isSignedIn = false;
var appData;

/**
 * Initialize the gapi client and prepare for signin state changes
 */
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

    }).then(function (response) {
        debug.log(response);
    }, function (error) {
        debug.log(`Error: ${error}`);
    });
}

/**
 * What to do when the Drive API has been loaded
 */
function syncSettingsFromDrive() {
    gapi.client.drive.files.list({
        spaces: "appDataFolder",
        fields: "files(id, name)",
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

                downloadAppData().then(result => {

                    let settingsTemp = {};
                    let key;
                    for (key in settings) {
                        if (settings.hasOwnProperty(key) && result.hasOwnProperty(key)) {
                            // Both of them have the key, compare and decide which one to keep
                            if (key === "toCheckLists") {
                                // The lists should be combined so that both sides are maintained
                                settingsTemp[key] = Object.assign({}, result[key], settings[key]);
                            } else if (key === "currentList") {
                                // If it's the current list, ignore remote
                                settingsTemp[key] = settings[key];
                            } else {
                                settingsTemp[key] = result[key] || settings[key];
                            }
                        } else {
                            // result doesn't have the key, keep the one in settings
                            settingsTemp[key] = settings[key];
                        }
                    }
                    settings = settingsTemp; // eslint-disable-line no-global-assign
                    applySettings();
                    populateList();
                    populateSideMenu();
                });

            } else {
                // If file not in Drive, upload local (first time)
                debug.log("Config file not found");
                uploadAppData();
            }
        }
    });
}

let uploadAppData = () => {
    appData.save(settings);
};

/**
 * @returns {Promise<*>} Settings object
 */
let downloadAppData = () => {
    return appData.read();/*.then(function (response) {
        debug.log(response);
        return response;
    }, function (error) {
        debug.log(error);
    });*/
};

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        // TODO: Replace with user profile icon
        if (debug.dev) {
            if (gapi.client && !gapi.client.drive) {
                // The client is ready, but the drive API is not loaded yet
                gapi.client.load("drive", "v3", syncSettingsFromDrive);
            }

            if (!appData) {
                // Also load appData
                appData = gdad(CONFIG_FILENAME, CLIENT_ID);
            }

        }

    } else {
        // TODO: Replace with person icon
    }
}

/**  Sign in the user upon button click */
function signIn(event) { // eslint-disable-line no-unused-vars
    debug.log(event);
    gapi.auth2.getAuthInstance().signIn();
}

/** Sign out the user upon button click */
function signOut(event) { // eslint-disable-line no-unused-vars
    debug.log(event);
    gapi.auth2.getAuthInstance().signOut();
}

/** Load the client:auth2 library */
function loadClient() { // eslint-disable-line no-unused-vars
    if (debug.dev) {
        gapi.load("client:auth2", initClient);
    }
}
