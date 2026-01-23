// src/sw.ts
const CACHE_NAME = "serbian-trans-v1";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./taskpane.html",
    "./taskpane.js",
    "./taskpane.css",
    "./assets/dict_e2i.bin",
    "./assets/dict_i2e.bin",
    // Dodaj i ikonice ovde kad ih napraviš
];

self.addEventListener("install", (event: any) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[SW] Caching assets");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener("activate", (event: any) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log("[SW] Removing old cache", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event: any) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Vrati iz keša ako postoji, inače idi na mrežu
            return response || fetch(event.request);
        })
    );
});
