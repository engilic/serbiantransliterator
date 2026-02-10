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
import { getOfficeRuntime } from "./officeRuntime";

function showNotInOfficeMessage() {
    const msgEl = document.getElementById("msg");
    if (msgEl) {
        msgEl.textContent = "Ovo je Word add-in UI. Za web verziju otvori web.html.";
        msgEl.style.color = "var(--colorStatusWarningForeground, #8a4b00)";
    }
}

function showFatalError(e: unknown) {
    // eslint-disable-next-line no-console
    console.error("FATAL ERROR in taskpane.ts:", e);
    const msgEl = document.getElementById("msg");
    if (msgEl) {
        msgEl.textContent = "Greška pri učitavanju: " + String(e);
        msgEl.style.color = "red";
    }
}

async function startAddin() {
    const verEl = document.getElementById("footerVersion");
    if (verEl) verEl.textContent = `v${pkg.version}`;

    // eslint-disable-next-line no-console
    console.log(`🚀 Serbian Transliterator v${pkg.version} starting (Add-in)...`);

    // ✅ LAZY import: ne evaluira ./app i ./worker/client tokom import(taskpane.ts)
    const [{ initTaskpane }, { workerClient }] = await Promise.all([
        import("./app"),
        import("./worker/client"),
    ]);

    // eslint-disable-next-line no-console
    console.log("🚀 Spawning Worker Pool...");
    workerClient.init().catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.warn("⚠️ Worker Pool failed, using Fallback.", err);
    });

    initTaskpane(false);
}

// Robust Office detection (works in Vitest/JSDOM too)
const office = getOfficeRuntime();

if (!office) {
    showNotInOfficeMessage();
} else {
    void office
        .onReady()
        .then(() => {
            // ✅ odloži start da Office stub (u testu) ne “zaglavi” import-evaluaciju
            setTimeout(() => {
                void startAddin().catch(showFatalError);
            }, 0);
        })
        .catch(showFatalError);
}
