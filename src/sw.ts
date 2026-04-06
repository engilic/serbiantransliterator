/// <reference lib="webworker" />
// src/sw.ts

import { cleanupOutdatedCaches, precacheAndRoute, matchPrecache } from "workbox-precaching";
import { registerRoute, NavigationRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

declare const self: ServiceWorkerGlobalScope & {
    __WB_MANIFEST: Array<{ url: string; revision?: string | null }>;
};

declare const __APP_VERSION__: string;
const SW_APP_VERSION = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "unknown";

// UI-triggered activation for updates
self.addEventListener("message", (event) => {
    const data = event.data as { type?: string } | null;

    // ✅ NEW: respond to GET_VERSION via MessageChannel port
    if (data?.type === "GET_VERSION") {
        const port = (event as unknown as { ports?: MessagePort[] }).ports?.[0];
        if (port) {
            port.postMessage({ type: "VERSION", version: SW_APP_VERSION });
        }
        return;
    }

    // Existing: activate update on demand
    if (data?.type === "SKIP_WAITING") {
        void self.skipWaiting();
    }
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            await self.clients.claim();

            // navigationPreload typing differs across TS libs -> narrow safely without `any`
            const reg = self.registration as unknown as {
                navigationPreload?: { enable?: () => Promise<void> };
            };

            if (typeof reg.navigationPreload?.enable === "function") {
                try {
                    await reg.navigationPreload.enable();
                } catch {
                    void 0;
                }
            }
        })()
    );
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Navigations -> NetworkFirst, but ignore "file-like" urls (/x.ext)
const navigationRoute = new NavigationRoute(
    new NetworkFirst({
        cacheName: "pages-cache",
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 }),
        ],
    }),
    { denylist: [/\/[^/?]+\.[^/]+$/] }
);
registerRoute(navigationRoute);

// Google Fonts
registerRoute(
    ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
    new StaleWhileRevalidate({
        cacheName: "google-fonts",
        plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 })],
    })
);

// Images
registerRoute(
    ({ request }) => request.destination === "image",
    new CacheFirst({
        cacheName: "images-cache",
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        ],
    })
);

// Static assets
registerRoute(
    ({ request, url }) =>
        request.destination === "script" ||
        request.destination === "style" ||
        request.destination === "worker" ||
        url.pathname.endsWith(".wasm") ||
        url.pathname.endsWith(".bin") ||
        url.pathname.endsWith(".json") ||
        url.pathname.endsWith(".md"),
    new StaleWhileRevalidate({
        cacheName: "static-assets",
        plugins: [new ExpirationPlugin({ maxEntries: 250 })],
    })
);

// Offline fallback for navigations
setCatchHandler(async ({ event }) => {
    const req = (event as unknown as FetchEvent).request;
    if (req && req.mode === "navigate") {
        return (
            (await matchPrecache("/web.html")) ||
            (await matchPrecache("web.html")) ||
            (await matchPrecache("/index.html")) ||
            (await matchPrecache("index.html")) ||
            Response.error()
        );
    }
    return Response.error();
});
