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
];

// Koristimo "Local" prefix da izbegnemo konflikt sa globalnim DOM tipovima
interface LocalExtendableEvent extends Event {
    waitUntil(fn: Promise<unknown>): void;
}

interface LocalFetchEvent extends Event {
    request: Request;
    respondWith(response: Promise<Response> | Response): void;
}

self.addEventListener("install", (event: Event) => {
    const e = event as LocalExtendableEvent;
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[SW] Caching assets");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener("activate", (event: Event) => {
    const e = event as LocalExtendableEvent;
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log("[SW] Removing old cache", key);
                        return caches.delete(key);
                    }
                    return Promise.resolve();
                })
            );
        })
    );
});

self.addEventListener("fetch", (event: Event) => {
    const e = event as LocalFetchEvent;
    e.respondWith(
        caches.match(e.request).then((response) => {
            // Vrati iz keša ako postoji, inače idi na mrežu
            return response || fetch(e.request);
        })
    );
});
