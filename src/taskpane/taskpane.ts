/* global Office, window, document */

// UI Components
import "./global.css";
import "./components/settings/settings.css";
import "./components/advanced/advanced.css";
import "./components/modals/modals.css";
import "./components/footer/footer.css";

// Import version directly from package.json
import pkg from "../../package.json";

import { initTaskpane } from "./app";
import { initWebModeUi } from "./app/web/ui";
import { workerClient } from "./worker/client";

Office.onReady(async (info) => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const forceWeb = urlParams.get("mode") === "web";

        const isWebMode = forceWeb || !info.host || (info.host && info.host !== Office.HostType.Word);

        // Dynamically inject version into FOOTER only (id="footerVersion")
        const verEl = document.getElementById("footerVersion");
        if (verEl) {
            verEl.textContent = `v${pkg.version}`;
        }

        console.log(`🚀 Serbian Transliterator v${pkg.version} starting...`);

        console.log("🚀 Spawning Worker Pool...");
        workerClient.init().catch((err) => console.error("Worker Init Failed:", err));

        if (isWebMode) {
            console.log("🌍 Web Mode Activated");
            initTaskpane(true);
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
