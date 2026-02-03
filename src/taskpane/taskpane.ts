// src/taskpane/taskpane.ts

import "core-js/stable";
import "regenerator-runtime/runtime";

// Global normalize fallback (Office stariji engine)
if (!String.prototype.normalize) {
    // eslint-disable-next-line no-console
    console.warn("String.prototype.normalize missing, applying fallback polyfill.");
    // eslint-disable-next-line no-extend-native
    String.prototype.normalize = function (_form?: string) {
        return this.toString();
    };
}

import "./global.css";
import "./components.css";
import "./components/modals/modals.css";

import pkg from "../../package.json";
import { initTaskpane } from "./app";
import { workerClient } from "./worker/client";

function showNotInOfficeMessage() {
    const msgEl = document.getElementById("msg");
    if (msgEl) {
        msgEl.textContent = "Ovo je Word add-in UI. Za web verziju otvori web.html.";
        msgEl.style.color = "var(--colorStatusWarningForeground, #8a4b00)";
    }
}

function startAddin() {
    const verEl = document.getElementById("footerVersion");
    if (verEl) verEl.textContent = `v${pkg.version}`;

    // eslint-disable-next-line no-console
    console.log(`🚀 Serbian Transliterator v${pkg.version} starting (Add-in)...`);

    // eslint-disable-next-line no-console
    console.log("🚀 Spawning Worker Pool...");
    workerClient.init().catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("⚠️ Worker Pool failed, using Fallback.", err);
    });

    initTaskpane(false);
}

// Guard: taskpane.html nije web app
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyWindow = window as any;
if (!anyWindow.Office || typeof anyWindow.Office.onReady !== "function") {
    showNotInOfficeMessage();
} else {
    Office.onReady(() => {
        try {
            startAddin();
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("FATAL ERROR in taskpane.ts:", e);
            const msgEl = document.getElementById("msg");
            if (msgEl) {
                msgEl.textContent = "Greška pri učitavanju: " + String(e);
                msgEl.style.color = "red";
            }
        }
    });
}
