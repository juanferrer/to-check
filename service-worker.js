/* globals importScripts */

const APP_PREFIX = "ToCheck_";
const CACHE_VERSION = "v1.6";
const CACHE_NAME = APP_PREFIX + CACHE_VERSION;
const URLS = [
	"/to-check/",
	"/to-check/index.html",
	"/to-check/index.html",
	"/to-check/styles/style.css",
	"/to-check/styles/boostrap.min.css",
	"/to-check/webfonts/open-sans.css",
	"/to-check/webfonts/mem8YaGs126MiZpBA-UFWJ0bbck.woff2",
	"/to-check/webfonts/mem8YaGs126MiZpBA-UFUZ0bbck.woff2",
	"/to-check/webfonts/mem8YaGs126MiZpBA-UFWZ0bbck.woff2",
	"/to-check/webfonts/mem8YaGs126MiZpBA-UFVp0bbck.woff2",
	"/to-check/webfonts/mem8YaGs126MiZpBA-UFWp0bbck.woff2",
	"/to-check/webfonts/mem8YaGs126MiZpBA-UFW50bbck.woff2",
	"/to-check/webfonts/mem8YaGs126MiZpBA-UFVZ0b.woff2",
	"/to-check/js/index.js",
	"/to-check/3rd-party/jquery-3.3.1.slim.min.js",
	"/to-check/3rd-party/bootstrap.min.js",
	"/to-check/3rd-party/feather.min.js",
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
	console.log(e.request.url);	// eslint-disable-line no-console
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

// Delete outdated caches
self.addEventListener("activate", function (e) {
	e.waitUntil(
		caches.keys().then(function (keyList) {
			// keyList contains all cache names under your username.github.io
			// filter out ones that has this app prefix to create white list
			var cacheWhitelist = keyList.filter(function (key) {
				return key.indexOf(APP_PREFIX);
			});
			// add current cache name to white list
			cacheWhitelist.push(CACHE_NAME);

			return Promise.all(keyList.map(function (key, i) {
				if (cacheWhitelist.indexOf(key) === -1) {
					return caches.delete(keyList[i]);
				}
			}));
		})
	);
});
