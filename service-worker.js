/* globals importScripts */

importScripts("js/cache-polyfill.js");

self.addEventListener("install", function (e) {
	e.waitUntil(
		caches.open("tocheck").then(function (cache) {
			return cache.addAll([
				"index.html",
				"index.html?homescreen=1",
				"?homescreen=1",
				"styles/style.css",
				"styles/boostrap.min.css",
				"js/index.js",
				"3rd-party/jquery-3.3.1.slim.min.js",
				"3rd-party/bootstrap.min.js",
				"3rd-party/feather.min.js",
			]);
		})
	);
});

self.addEventListener("fetch", function (event) {
	console.log(event.request.url);
	event.respondWith(
		caches.match(event.request).then(function (response) {
			return response || fetch(event.request);
		})
	);
});
