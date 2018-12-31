/* globals importScripts */

const APP_PREFIX = "ToCheck";
const CACHE_VERSION = "";//"_v1.8";
const CACHE_NAME = APP_PREFIX + CACHE_VERSION;
const URLS = [
	"./",
	"./index.html",
	"./styles/style.css",
	"./styles/boostrap.min.css",
	"./webfonts/open-sans.css",
	"./webfonts/mem8YaGs126MiZpBA-UFWJ0bbck.woff2",
	"./webfonts/mem8YaGs126MiZpBA-UFUZ0bbck.woff2",
	"./webfonts/mem8YaGs126MiZpBA-UFWZ0bbck.woff2",
	"./webfonts/mem8YaGs126MiZpBA-UFVp0bbck.woff2",
	"./webfonts/mem8YaGs126MiZpBA-UFWp0bbck.woff2",
	"./webfonts/mem8YaGs126MiZpBA-UFW50bbck.woff2",
	"./webfonts/mem8YaGs126MiZpBA-UFVZ0b.woff2",
	"https://fonts.googleapis.com/icon?family=Material+Icons",
	"./js/index.js",
	"./3rd-party/jquery-3.3.1.slim.min.js",
	"./3rd-party/bootstrap.bundle.min.js",
	// "./3rd-party/feather.min.js",
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
			if (response) {
				return response;     // if valid response is found in cache return it
			} else {
				return fetch(e.request);     //fetch from internet
			}
		})
	);
});
