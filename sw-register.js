/* globals debug, Toastify */

if ("serviceWorker" in navigator) {
    let newWorker;
    if (navigator.serviceWorker.controller) {
        debug.log("[PWA] active service worker found, no need to register");
    } else {
        // Register the service worker
        navigator.serviceWorker.register("./service-worker.js", {
            scope: "./"
        }).then(function (reg) {

            // Check if there is an update
            reg.addEventListener("updatefound", () => {
                debug.log("[PWA] Update found");
                newWorker = reg.installing;
                newWorker.addEventListener("statechage", () => {
                    switch (newWorker.state) {
                        case "installed":
                            // A new service worker was just installed,
                            // so it must have been an update
                            if (navigator.serviceWorker.controller) {
                                Toastify({
                                    text: "New update available! Click here to refresh",
                                    duration: 0,
                                    onClick: () => { location.reload(0); },
                                    close: true,
                                    gravity: "bottom",
                                    className: "notification",
                                    selector: "notification-placeholder"
                                }).showToast();
                            }
                            break;
                    }
                });
            });

            debug.log("[PWA] Service worker has been registered for scope: " + reg.scope);
        }).catch(function (err) {
            debug.log("[PWA] Service worker registration failed: ", err);
        });
    }
}
