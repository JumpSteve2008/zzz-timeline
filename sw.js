var CACHE = "zzz-v1";
var ASSETS = [
    "/index.html",
    "/css/style.css",
    "/js/main.js",
    "/manifest.json"
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
