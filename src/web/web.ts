// src/web/web.ts

import "./web.css";

import pkg from "../../package.json";
import { initWasm } from "../core/textCore";
import { mountWebApp } from "./app/mount";

function registerServiceWorker() {
    // ✅ Prevent SW caching issues during local development (hashed assets)
    const isLocal =
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1" ||
        location.hostname === "[::1]";
    if (isLocal) return;

    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;

    // When SW takes control (after skipWaiting), refresh
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });

    window.addEventListener("load", async () => {
        try {
            await navigator.serviceWorker.register("./sw.js");
        } catch (err) {
            console.error("SW registration failed:", err);
        }
    });
}

async function main() {
    // Version in header
    const ver = document.getElementById("ver");
    if (ver) ver.textContent = `v${pkg.version}`;

    // SW (prod only)
    registerServiceWorker();

    // Init WASM for plain text fallback path (main thread). Worker does its own init.
    await initWasm();

    const root = document.getElementById("app");
    if (!root) throw new Error("Missing #app root");

    mountWebApp(root, { version: pkg.version });
}

main().catch((e) => {
    console.error(e);
});
