/* global Office */

import "./taskpane.css";
import { initTaskpane } from "./app";

Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        // Standardni Word mod
        initTaskpane();
    } else {
        // Web Browser mod (za demo i testiranje)
        console.log("⚠️ Nismo u Word-u (Host: " + info.host + "). Pokrećem u Web Modu.");
        initTaskpane();
    }
});
