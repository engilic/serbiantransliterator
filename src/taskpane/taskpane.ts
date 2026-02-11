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

function hideSkeleton() {
    const skeleton = document.getElementById("skeleton");
    const main = document.getElementById("appMain");
    if (skeleton) {
        skeleton.style.display = "none";
        skeleton.setAttribute("aria-hidden", "true");
    }
    if (main) {
        main.style.display = "flex";
    }
}

function showNotInOfficeMessage() {
    hideSkeleton();
    const msgEl = document.getElementById("msg");
    if (msgEl) {
        msgEl.textContent = "Ovo je Word add-in UI. Za web verziju otvori web.html.";
        msgEl.style.color = "var(--colorStatusWarningForeground, #8a4b00)";
    }
}

function showFatalError(e: unknown) {
    hideSkeleton();
    // eslint-disable-next-line no-console
    console.error("FATAL ERROR in taskpane.ts:", e);
    const msgEl = document.getElementById("msg");
    if (msgEl) {
        msgEl.textContent = "Greška pri učitavanju: " + String(e);
        msgEl.style.color = "red";
    }
}

async function startAddin(isWebMode = false) {
    const verEl = document.getElementById("footerVersion");
    if (verEl) verEl.textContent = `v${pkg.version}`;

    // eslint-disable-next-line no-console
    console.log(`🚀 Serbian Transliterator v${pkg.version} starting (${isWebMode ? "Web" : "Add-in"})...`);

    try {
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

        initTaskpane(isWebMode);

        // ✅ Markiraj da je uspešno pokrenuto
        return true;
    } catch (error) {
        showFatalError(error);
        return false;
    }
}

// Track initialization state
let appInitialized = false;
let officeDetected = false;

// Robust Office detection
const office = getOfficeRuntime();

if (!office) {
    console.log("[Taskpane] No Office runtime detected");
    showNotInOfficeMessage();
} else {
    officeDetected = true;
    console.log("[Taskpane] Office runtime detected, waiting for onReady...");

    // ✅ FIX: Promise.resolve osigurava da je 'then' dostupan čak i ako office.onReady vrati undefined
    Promise.resolve(office.onReady())
        .then((info) => {
            console.log("[Taskpane] Office.onReady resolved:", info);

            setTimeout(async () => {
                try {
                    const success = await startAddin(false);
                    if (success) {
                        appInitialized = true;
                        hideSkeleton(); // ✅ Osiguraj skidanje skeletona ovde
                    }
                } catch (err) {
                    showFatalError(err);
                }
            }, 0);
        })
        .catch((error: unknown) => {
            console.error("[Taskpane] Office.onReady failed:", error);
            showFatalError(error);
        });
}
// ✅ FAILSAFE za E2E testove i spore Office inicijalizacije
// Ovo garantuje da će skeleton nestane nakon max 5 sekundi
setTimeout(() => {
    const skeleton = document.getElementById("skeleton");

    if (skeleton && skeleton.style.display !== "none") {
        // eslint-disable-next-line no-console
        console.warn("[Taskpane Failsafe] Hiding skeleton after 5s timeout");

        if (!appInitialized) {
            // eslint-disable-next-line no-console
            console.warn("[Taskpane Failsafe] App not initialized, starting in web mode");

            // Pokušaj da pokreneš aplikaciju u web modu
            void startAddin(true).then((success) => {
                if (success) {
                    appInitialized = true;
                    hideSkeleton();
                } else {
                    // Ako ni to ne uspe, samo sakri skeleton i prikaži poruku
                    hideSkeleton();
                    const msgEl = document.getElementById("msg");
                    if (msgEl) {
                        msgEl.textContent = officeDetected
                            ? "Office add-in učitavanje je isteklo. Osvežite stranicu."
                            : "Web mode aktivan (E2E test environment)";
                        msgEl.style.color = "var(--colorNeutralForeground1)";
                    }
                }
            });
        } else {
            // App je inicijalizovan ali skeleton još uvek vidljiv
            hideSkeleton();
        }
    }
}, 5000);

// ✅ Dodatni failsafe specifično za E2E testove
// Ako posle 1 sekunde nema Office-a, pokreni web mode
if (!officeDetected) {
    setTimeout(() => {
        if (!appInitialized) {
            // eslint-disable-next-line no-console
            console.log("[Taskpane Fast Failsafe] Starting in web mode (no Office detected)");
            void startAddin(true).then((success) => {
                if (success) {
                    appInitialized = true;
                    hideSkeleton();
                }
            });
        }
    }, 1000);
}
