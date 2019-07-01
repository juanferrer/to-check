/* globals gapi, debug, gdad, settings, settingsLast, applySettings, populateList, populateSideMenu, deepCopy */

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
 * Compare the options and decide what change should be maintained
 * @param {*} last Copy of last push
 * @param {*} local Current
 * @param {*} remote Remote
 */
function decideWhichToKeep(last, local, remote) {
    if (last === local) {
        // No changes since last. If there are changes, remote has them
        return remote;
    } else if (last === remote) {
        // Last push was by this device. If there are changes, local has them
        return local;
    } else {
        // Either local === remote or they're all different. Assume remote is correct
        return remote;
    }
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

                downloadAppData().then(remoteSettings => {

                    // In principle, copy remoteSettings and decide which changes to keep
                    let settingsTemp = deepCopy(remoteSettings);
                    let key, list, item;
                    for (key in settings) {
                        // Special cases
                        if (key === "currentList") {
                            // If it's currentList, ignore remote
                            settingsTemp[key] = settings[key];
                        } else if (settingsLast[key] !== settings[key] &&
                            settings[key] !== remoteSettings[key] &&
                            settingsLast[key] !== remoteSettings[key]) {
                            // There are changes in both settings and remote
                            // What to do depends on the setting
                            if (key === "toCheckLists") {
                                // Lists may be different, so we need to go through each list and decide which one to keep
                                // Same conditions as above so no explanation
                                for (list in settings[key]) {
                                    if (settingsLast[key][list] !== settings[key][list] &&
                                        settings[key][list] !== remoteSettings[key][list] &&
                                        settingsLast[key][list] !== remoteSettings[key][list]) {
                                        // Compare each item in the list
                                        for (item in settingsLast[key][list]) {
                                            if (settingsLast[key][list][item] !== settings[key][list][item] &&
                                                settings[key][list][item] !== remoteSettings[key][list][item] &&
                                                settingsLast[key][list][item] !== remoteSettings[key][list][item]) {
                                                // They all are different. I don't know. Remote is right
                                                settingsTemp[key][list][item] = remoteSettings[key][list][item];
                                            } else {
                                                settingsTemp[key][list][item] = decideWhichToKeep(
                                                    settingsLast[key][list][item],
                                                    settings[key][list][item],
                                                    remoteSettings[key][list][item]);
                                            }
                                        }
                                    } else {
                                        settingsTemp[key][list] = decideWhichToKeep(
                                            settingsLast[key][list],
                                            settings[key][list],
                                            remoteSettings[key][list]);
                                    }
                                }
                            } else {
                                // For everything else assume remote is correct
                                //settingsTemp[key] = remoteSettings[key];
                                settingsTemp[key] = decideWhichToKeep(
                                    settingsLast[key],
                                    settings[key],
                                    remoteSettings[key]);
                            }
                        } else {
                            settingsTemp[key] = decideWhichToKeep(settingsLast[key], settings[key], remoteSettings[key]);
                        }
                    }
                    settings = deepCopy(settingsTemp); // eslint-disable-line no-global-assign
                    applySettings();
                    settings = deepCopy(settingsTemp); // eslint-disable-line no-global-assign
                    populateList();
                    populateSideMenu();
                    //uploadAppData();
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
    if (isSignedIn) {
        appData.save(settings);
        settingsLast = settings; // eslint-disable-line no-global-assign
    }
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
