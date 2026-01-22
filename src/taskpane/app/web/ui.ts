// src/taskpane/app/web/ui.ts
/* global document */

import { processDocxFile } from "./batch";

export function initWebModeUi() {
    console.log("🚀 Initializing Web Mode UI...");

    // 1. Nađi GLAVNU sekciju (prva sekcija u main-u)
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

    // 2. Probaj da sakriješ dugmad, ali nemoj da pukneš ako ih nema
    const btnGroup = firstSection.querySelector(".button-group") as HTMLElement | null;
    if (btnGroup) {
        btnGroup.style.display = "none";
    } else {
        console.warn("WebUI: .button-group not found, skipping hide.");
    }

    // 3. Proveri da li smo već ubacili drop zone (da ne dupliramo)
    if (document.querySelector(".drop-zone")) {
        console.log("WebUI: Drop zone already exists.");
        return;
    }

    // 4. Kreiraj Drop Zone
    const dropZone = document.createElement("div");
    dropZone.className = "drop-zone";
    dropZone.innerHTML = `
        <div class="drop-icon">📂</div>
        <div class="drop-text">Prevucite .docx fajl ovde<br>ili kliknite za izbor</div>
        <input type="file" id="webFileInput" accept=".docx" style="display:none">
    `;

    // 5. Ubaci Drop Zone NA POČETAK prve sekcije
    firstSection.insertBefore(dropZone, firstSection.firstChild);

    console.log("✅ Web Mode UI injected successfully.");

    // 6. Event Listeners (sa proverom da input postoji)
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
        alert("Samo .docx fajlovi su podržani!");
        return;
    }

    processDocxFile(file);
}
