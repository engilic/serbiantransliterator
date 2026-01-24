// src/taskpane/app/web/ui.ts
/* global document */

import { processDocxFile } from "./batch";
import { t } from "../../../shared/i18n";
import { showModalInfo } from "../modal/modal";
import { html } from "../../../shared/safeHtml";

export function initWebModeUi() {
    console.log("🚀 Initializing Web Mode UI...");

    const main = document.querySelector("main");
    if (!main) {
        console.error("WebUI: <main> tag not found!");
        return;
    }

    const firstSection = main.querySelector(".section");
    if (!firstSection) {
        console.error("WebUI: .section not found!");
        return;
    }

    const btnGroup = firstSection.querySelector(".button-group") as HTMLElement | null;
    if (btnGroup) {
        btnGroup.style.display = "none";
    } else {
        console.warn("WebUI: .button-group not found, skipping hide.");
    }

    if (document.querySelector(".drop-zone")) {
        console.log("WebUI: Drop zone already exists.");
        return;
    }

    const dropZone = document.createElement("div");
    dropZone.className = "drop-zone";
    dropZone.innerHTML = `
        <div class="drop-icon">📂</div>
        <div class="drop-text">${t("web_drop_title")}<br>${t("web_drop_subtitle")}</div>
        <input type="file" id="webFileInput" accept=".docx" style="display:none">
    `;

    firstSection.insertBefore(dropZone, firstSection.firstChild);

    console.log("✅ Web Mode UI injected successfully.");

    const input = dropZone.querySelector("#webFileInput") as HTMLInputElement | null;
    if (!input) return;

    dropZone.onclick = () => input.click();

    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.classList.add("hover");
    };

    dropZone.ondragleave = () => {
        dropZone.classList.remove("hover");
    };

    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove("hover");

        if (e.dataTransfer?.files?.length) {
            handleFiles(e.dataTransfer.files);
        }
    };

    input.onchange = () => {
        if (input.files?.length) {
            handleFiles(input.files);
        }
    };
}

function handleFiles(files: FileList) {
    const file = files[0];
    if (!file) return;

    if (!file.name.endsWith(".docx")) {
        showModalInfo(t("modal_title_error"), html`${t("web_drop_invalid_file")}`);
        return;
    }

    processDocxFile(file);
}
