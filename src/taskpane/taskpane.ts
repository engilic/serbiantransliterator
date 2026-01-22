/* global Office, window */

import "./taskpane.css";
import { initTaskpane } from "./app";
import { initWebModeUi } from "./app/web/ui";

Office.onReady((info) => {
    const urlParams = new URLSearchParams(window.location.search);
    const forceWeb = urlParams.get("mode") === "web";

    // Detektuj Web Mode PRE inicijalizacije
    const isWebMode = forceWeb || (info.host && info.host !== Office.HostType.Word);

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
});
