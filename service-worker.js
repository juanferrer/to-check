/* globals importScripts, debug */

const APP_PREFIX = "ToCheck";
// const CACHE_VERSION = "_v1.18"; //eslint-disable-line no-unused-vars
const CACHE_NAME = APP_PREFIX;
const URLS = [
    /*"./",
    "./index.html",
    "./styles/style.css",
    "./styles/boostrap.min.css",
    "https://fonts.googleapis.com/css?family=Open+Sans",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "./js/index.js",
    "https://code.jquery.com/jquery-3.3.1.slim.min.js",
    "./3rd-party/bootstrap.bundle.min.js",
    "./android-chrome-192x192.png",
    "./android-chrome-384x384.png",
    "./android-chrome-512x512.png",
    "./apple-touch-icon.png",
    "./favicon-16x16.png",
    "./favicon-32x32.png",
    "./mstile-150x150.png",
    "./safari-pinned-tab.svg",
    "./favicon.ico",*/
];

importScripts("js/cache-polyfill.js");
const offlineFallbackPage = "index.html";

// Cache resources
self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            cache.add(offlineFallbackPage);
            return cache.addAll(URLS);
        })
    );
});

self.addEventListener("activate", function (e) {
    e.waitUntil(self.clients.claim());
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function(e) {
    //if (e.request.method !== "GET") return;

    // If request was success, add or update it in the cache
    e.respondWith(fetch(e.request)
        .then(function (response) {
            debug.log("[PWA] add page to offline cache: " + response.url);
            e.waitUntil(updateCache(e.request, response.clone()));
            return response;
        }).catch(function (error) {
            debug.log("[PWA] " + error);
            return fromCache(e.request);
        })
    );
});

function fromCache(request) {
    // Check to see if you have it in the cache
    // Return response
    // If not in the cache, then return error page
    return caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(request).then(function (response) {
            return response || fetch(request)
        }).then(function (response) {
            const responseClone = response.clone();
            cache.put(request, responseClone);
        });
    });

    /*        if (!response || response.status === 404) {
                return Promise.reject("no-match");
            }

            return response;
        });
    });*/
}

function updateCache(request, response) {
    return caches.open(CACHE_NAME).then(function (cache) {
        if(!request.url.includes("chrome-extension://")){
            return cache.put(request, response);
        }

    });
}
