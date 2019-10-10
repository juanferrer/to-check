/* globals _, gapi, debug, gdad, settings, settingsLast, applySettings, populateList,
populateSideMenu, deepCopy, setProfileImage */

const API_KEY = "AIzaSyCuZUd6F2KNE8QSFGMNMWVv6HxiK8NuU0M";
const CLIENT_ID = "672870556931-ptqqho5vg0ni763q8srvhr3kpahndjae.apps.googleusercontent.com";

const SCOPES = "https://www.googleapis.com/auth/drive.appdata";
const DISCOVERY_DOCUMENTS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

const CONFIG_FILENAME = "to-check-config.json";

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
        updateSigninStatus();

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
    if (_.isEqual(last, local)) {
        // No changes since last. If there are changes, remote has them
        return remote;
    } else if (_.isEqual(last, remote)) {
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
    if (!appData) {
        // Load appData if not already loaded
        appData = gdad(CONFIG_FILENAME, CLIENT_ID);
    }

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
                    let performComparison = true;

                    // First, check if either settingsLast and remoteSettings are empty
                    if (_.isEqual(settingsLast, {})) {
                        // So, we have never uploaded data to Drive from this device
                        if (_.isEqual(remoteSettings, {})) {
                            // More so, this is the first time ever we attempt to sync from Drive. Keep local
                            settingsTemp = deepCopy(settings);
                            performComparison = false;
                        } else {
                            // So, we have changes in both settings and remoteSettings. Keep remote
                            performComparison = false;
                        }
                    }

                    if (performComparison) {
                        let key, list, item;
                        for (key in settings) {
                            // Special cases
                            if (key === "currentList") {
                                // If it's currentList, ignore remote
                                settingsTemp[key] = settings[key];
                            } else if (!_.isEqual(settingsLast[key], settings[key]) &&
                                !_.isEqual(settings[key], remoteSettings[key]) &&
                                !_.isEqual(settingsLast[key], remoteSettings[key])) {
                                // There are changes in both settings and remote
                                // What to do depends on the setting
                                if (key === "toCheckLists") {
                                    // Lists may be different, so we need to go through each list and decide which one to keep
                                    // Same conditions as above so no explanation
                                    for (list in settings[key]) {
                                        if (!_.isEqual(settingsLast[key][list], settings[key][list]) &&
                                            !_.isEqual(settings[key][list], remoteSettings[key][list]) &&
                                            !_.isEqual(settingsLast[key][list], remoteSettings[key][list])) {
                                            // Compare each item in the list
                                            for (item in settings[key][list]) {
                                                if (!_.isEqual(settingsLast[key][list][item], settings[key][list][item]) &&
                                                    !_.isEqual(settings[key][list][item].remoteSettings[key][list][item]) &&
                                                    !_.isEqual(settingsLast[key][list][item], remoteSettings[key][list][item])) {
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
                    }
                    settings = deepCopy(settingsTemp); // eslint-disable-line no-global-assign
                    applySettings();
                    settings = deepCopy(settingsTemp); // eslint-disable-line no-global-assign
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
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        appData.save(settings);
        settingsLast = deepCopy(settings); // eslint-disable-line no-global-assign
    }
};

/**
 * @returns {Promise<*>} Settings object
 */
let downloadAppData = () => {
    return appData.read();
};

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called
 */
function updateSigninStatus() {
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        // Replace with user profile icon
        gapi.client.request({
            path: "https://people.googleapis.com/v1/people/me",
            params: { personFields: "photos" }
        }).then(response => {
            debug.log(response);
            setProfileImage(response.result.photos[0].url);
        }, error => {
            debug.log(error);
        });

        if (gapi && gapi.client && !gapi.client.drive) {
            // The client is ready, but the drive API is not loaded yet
            gapi.client.load("drive", "v3", syncSettingsFromDrive);
        } else if (!appData) {
            // Also load appData
            appData = gdad(CONFIG_FILENAME, CLIENT_ID);
            syncSettingsFromDrive();
        } else {
            // Everything is ready, we just need to sync the settings
            syncSettingsFromDrive();
        }
    } else {
        // Replace with person icon
        setProfileImage();
    }
}

/**  Sign in the user upon button click */
function signIn(event) { // eslint-disable-line no-unused-vars
    debug.log(event);
    let signInOptions = {prompt: "consent"};
    gapi.auth2.getAuthInstance().signIn(signInOptions);
}

/** Sign out the user upon button click */
function signOut(event) { // eslint-disable-line no-unused-vars
    debug.log(event);
    gapi.auth2.getAuthInstance().signOut();
}

/** Load the client:auth2 library */
function loadClient() { // eslint-disable-line no-unused-vars
    gapi.load("client:auth2", initClient);
}
