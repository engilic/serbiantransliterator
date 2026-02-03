// src/sw.ts

/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

declare const self: ServiceWorkerGlobalScope;

// 1. Force immediate update (opciono, ali dobro za brze fixeve)
self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", () => {
    self.clients.claim();
});

// 2. Očisti stare verzije keša (automatski briše stare hash fajlove)
cleanupOutdatedCaches();

// 3. Precache - Ovde Webpack ubacuje listu svih fajlova!
// (JS, CSS, HTML, Icons, WASM - sve što je Webpack napravio)
precacheAndRoute(self.__WB_MANIFEST);

// 4. Runtime Caching Strategies

// A. Navigacija (HTML) -> Network First, fallback to Offline Cache
// Ako server ima noviju verziju, uzmi nju. Ako nema neta, uzmi keš.
const navigationRoute = new NavigationRoute(
    new NetworkFirst({
        cacheName: "pages-cache",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);
registerRoute(navigationRoute);

// B. Google Fonts (ako koristiš) ili eksterni CDN
registerRoute(
    ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
    new StaleWhileRevalidate({
        cacheName: "google-fonts",
        plugins: [new ExpirationPlugin({ maxEntries: 20 })],
    })
);

// C. Slike koje nisu u Webpacku (ako ih ima)
registerRoute(
    ({ request }) => request.destination === "image",
    new CacheFirst({
        cacheName: "images-cache",
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dana
            }),
        ],
    })
);

// 5. Fallback za offline ako navigacija pukne skroz
// (Workbox precache obično ovo rešava, ali za svaki slučaj)
self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(
            (async () => {
                try {
                    // Probaj mrežu ili keširanu navigaciju
                    const preloadResponse = await event.preloadResponse;
                    if (preloadResponse) {
                        return preloadResponse;
                    }
                    return await fetch(event.request);
                } catch (error) {
                    // Ako nema neta, vrati keširani index.html ili web.html
                    // Workbox precache je već to keširao pod ključem koji se poklapa sa URL-om
                    const cache = await caches.open(self.registration.scope);
                    // Pokušaj da nađeš tačan URL ili fallback
                    const cachedResponse = await cache.match(event.request.url);
                    if (cachedResponse) return cachedResponse;

                    return (await cache.match("/web.html")) || (await cache.match("./web.html"));
                }
            })()
        );
    }
});
