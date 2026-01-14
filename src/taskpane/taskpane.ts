/* global Office */

import "./taskpane.css";
import { initTaskpane } from "./app";

Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        initTaskpane();
    }
});