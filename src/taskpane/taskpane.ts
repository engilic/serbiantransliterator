/* global Office, window, document */

// HITNO: Polyfills za starije Word engine (IE11/Edge Legacy)
import "core-js/stable";
import "regenerator-runtime/runtime";

// --- GLOBALNI POLYFILL: Ako normalize ne postoji, napravi ga ---
// Ovo mora biti PRE bilo kog drugog koda!
if (!String.prototype.normalize) {
    console.warn("String.prototype.normalize missing, applying fallback polyfill.");
    String.prototype.normalize = function (_form?: string) {
        // Najprostiji fallback: vrati string kakav jeste.
        // Za srpski jezik ovo je prihvatljivo (99.9% slučajeva).
        return this.toString();
    };
}
// -----------------------------------------------------------

import "./global.css";
import "./components/settings/settings.css";
import "./components/advanced/advanced.css";
import "./components/modals/modals.css";
import "./components/footer/footer.css";

import pkg from "../../package.json";
import { initTaskpane } from "./app";
import { initWebModeUi } from "./app/web/ui";
import { workerClient } from "./worker/client";

Office.onReady(async (info) => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const forceWeb = urlParams.get("mode") === "web";
        const isWebMode = forceWeb || !info.host || (info.host && info.host !== Office.HostType.Word);

        const verEl = document.getElementById("footerVersion");
        if (verEl) {
            verEl.textContent = `v${pkg.version}`;
        }

        console.log(`🚀 Serbian Transliterator v${pkg.version} starting...`);

        console.log("🚀 Spawning Worker Pool...");
        workerClient.init().catch((err) => {
            console.warn("⚠️ Worker Pool failed, using Fallback.", err);
        });

        if (isWebMode) {
            initTaskpane(true);
            initWebModeUi();
        } else {
            initTaskpane(false);
        }
    } catch (e) {
        console.error("FATAL ERROR in taskpane.ts:", e);
        const msgEl = document.getElementById("msg");
        if (msgEl) {
            msgEl.textContent = "Greška pri učitavanju: " + String(e);
            msgEl.style.color = "red";
        }
    }
});
