/* globals importScripts */

const APP_PREFIX = "ToCheck";
const CACHE_VERSION = "_v1.15";
const CACHE_NAME = APP_PREFIX;
const URLS = [
	"./",
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
	"./favicon.ico",
];

importScripts("js/cache-polyfill.js");

// Cache resources
self.addEventListener("install", function (e) {
	e.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			return cache.addAll(URLS);
		})
	);
});

// Respond with cached resources
self.addEventListener("fetch", function (e) {
	//console.log(e.request.url);	// eslint-disable-line no-console
	e.respondWith(
		caches.match(e.request).then(function (response) {
			// If valid response is found in cache return it, otherwise,
			// fetch from the Internet and put in cache
			return response || fetch(e.request).then(function (r) {
				return caches.open(CACHE_NAME).then(function (cache) {
					cache.put(e.request, r.clone());
					return response;
				});
			});
		})
	);
});
