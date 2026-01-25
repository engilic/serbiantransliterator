/* global Office, window, document */

// UI Components
import "./global.css";
import "./components/header/header.css";
import "./components/settings/settings.css";
import "./components/advanced/advanced.css";
import "./components/modals/modals.css";
import "./components/footer/footer.css";

// Import version directly from package.json
import pkg from "../../package.json";

import { initTaskpane } from "./app";
import { initWebModeUi } from "./app/web/ui";
// NEW: Importujemo klijenta za workere
import { workerClient } from "./worker/client";

Office.onReady(async (info) => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const forceWeb = urlParams.get("mode") === "web";

        // Detektuj Web Mode PRE inicijalizacije
        const isWebMode = forceWeb || !info.host || (info.host && info.host !== Office.HostType.Word);

        // Dynamically inject version into header
        const verEl = document.getElementById("appVersionDisplay");
        if (verEl) {
            verEl.textContent = pkg.version;
        }

        // [MAX3] Log Version for Debugging
        console.log(`🚀 Serbian Transliterator v${pkg.version} starting...`);

        // NEW: Preload Worker in background (Startuje thread, učitava WASM i rečnike)
        // Ovo radimo odmah da bi sve bilo spremno kad korisnik klikne na dugme.
        console.log("🚀 Spawning Worker Pool...");
        workerClient.init().catch((err) => console.error("Worker Init Failed:", err));

        if (isWebMode) {
            console.log("🌍 Web Mode Activated");
            // Prosledi true da initTaskpane ne dira Office API
            initTaskpane(true);
            // Inicijalizuj Web UI (Drop Zone)
            initWebModeUi();
        } else {
            console.log("📝 Word Mode Activated");
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
