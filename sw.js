var CACHE = "zzz-v2";
var ASSETS = [
    "./index.html",
    "./css/style.css",
    "./js/main.js",
    "./manifest.json",
    "./img/v1.0.png",
    "./img/v1.1.png",
    "./img/v1.2.png",
    "./img/v1.3.png",
    "./img/v1.4.png",
    "./img/v1.5.png",
    "./img/v1.6.png",
    "./img/v1.7.png",
    "./img/v2.0.png",
    "./img/v2.1.png",
    "./img/v2.2.png",
    "./img/v2.3.png",
    "./img/v2.4.png",
    "./img/v2.5.png",
    "./img/v2.6.png",
    "./img/v2.7.png",
    "./img/v2.8.png",
    "./img/v3.0.png"
];

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (cache) {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener("fetch", function (e) {
    e.respondWith(
        caches.match(e.request).then(function (r) {
            return r || fetch(e.request);
        })
    );
});
