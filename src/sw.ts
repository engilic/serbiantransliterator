// src/sw.ts

/* eslint-disable no-restricted-globals */
/// <reference lib="webworker" />

declare const __BUILD_ID__: string;

// Force correct SW typing (prevents TS thinking `self` is Window)
const sw = self as unknown as ServiceWorkerGlobalScope;

const BUILD_ID = typeof __BUILD_ID__ === "string" && __BUILD_ID__.length > 0 ? __BUILD_ID__ : "dev";
const CACHE_NAME = `serbian-trans:${BUILD_ID}`;

// Minimal core URLs (HTML must stay update-safe via network-first fetch logic)
const CORE_URLS: string[] = ["./", "./index.html", "./taskpane.html", "./manifest.webmanifest"];

async function safeAdd(cache: Cache, url: string): Promise<void> {
    try {
        await cache.add(new Request(url, { cache: "reload" }));
    } catch {
        // SW install must never fail because of a single asset
    }
}

function isSameOriginRequest(req: Request): boolean {
    try {
        const url = new URL(req.url);
        return url.origin === sw.location.origin;
    } catch {
        return false;
    }
}

function isHtmlRequest(req: Request): boolean {
    if (req.mode === "navigate") return true;
    const accept = req.headers.get("accept") || "";
    return accept.includes("text/html");
}

function isAssetRequest(req: Request): boolean {
    try {
        const url = new URL(req.url);
        const p = url.pathname.toLowerCase();
        return (
            p.endsWith(".js") ||
            p.endsWith(".css") ||
            p.endsWith(".wasm") ||
            p.endsWith(".png") ||
            p.endsWith(".jpg") ||
            p.endsWith(".jpeg") ||
            p.endsWith(".gif") ||
            p.endsWith(".svg") ||
            p.endsWith(".ico") ||
            p.endsWith(".webp") ||
            p.endsWith(".woff") ||
            p.endsWith(".woff2") ||
            p.endsWith(".ttf")
        );
    } catch {
        return false;
    }
}

sw.addEventListener("install", (event: Event) => {
    const e = event as ExtendableEvent;
    e.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            for (const url of CORE_URLS) {
                await safeAdd(cache, url);
            }
            await sw.skipWaiting();
        })()
    );
});

sw.addEventListener("activate", (event: Event) => {
    const e = event as ExtendableEvent;
    e.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
            await sw.clients.claim();
        })()
    );
});

sw.addEventListener("fetch", (event: Event) => {
    const e = event as FetchEvent;
    const req = e.request;

    if (req.method !== "GET") return;
    if (!isSameOriginRequest(req)) return;

    // never cache sw.js
    try {
        const u = new URL(req.url);
        if (u.pathname.endsWith("/sw.js")) return;
    } catch {
        // ignore
    }

    // HTML: network-first (update safety)
    if (isHtmlRequest(req)) {
        e.respondWith(
            (async () => {
                const cache = await caches.open(CACHE_NAME);
                try {
                    const fresh = await fetch(req);
                    try {
                        await cache.put(req, fresh.clone());
                    } catch {
                        // ignore
                    }
                    return fresh;
                } catch {
                    const cached = await cache.match(req);
                    if (cached) return cached;

                    const indexCached = await cache.match("./index.html");
                    if (indexCached) return indexCached;

                    return new Response("Offline", { status: 503, statusText: "Offline" });
                }
            })()
        );
        return;
    }

    // Assets: cache-first, then refresh cache in background
    if (isAssetRequest(req)) {
        e.respondWith(
            (async () => {
                const cache = await caches.open(CACHE_NAME);
                const cached = await cache.match(req);
                if (cached) {
                    e.waitUntil(
                        (async () => {
                            try {
                                const fresh = await fetch(req);
                                await cache.put(req, fresh.clone());
                            } catch {
                                // ignore
                            }
                        })()
                    );
                    return cached;
                }

                const fresh = await fetch(req);
                try {
                    await cache.put(req, fresh.clone());
                } catch {
                    // ignore
                }
                return fresh;
            })()
        );
    }
});
