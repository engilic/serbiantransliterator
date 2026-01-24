// src/taskpane/app/web/ui.ts
/* global document, navigator */

import { processDocxFile } from "./batch";
import { t } from "../../../shared/i18n";
import { showModalInfo } from "../modal/modal";
import { html } from "../../../shared/safeHtml";
import { convertPlainText } from "../../../core/textCore"; // Koristimo direktno core za tekst
import { getSettingsFromUi } from "../settings/getters"; // Da čita podešavanja iz UI-a
import { state } from "../state";

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
    }

    // 1. Drop Zone (ako već ne postoji)
    if (!document.querySelector(".drop-zone")) {
        const dropZone = document.createElement("div");
        dropZone.className = "drop-zone fade-in";
        dropZone.innerHTML = `
            <div class="drop-icon">📂</div>
            <div class="drop-text">${t("web_drop_title")}<br>${t("web_drop_subtitle")}</div>
            <input type="file" id="webFileInput" accept=".docx" style="display:none">
        `;

        // 2. [MAX FEATURE] Clipboard Area
        const clipboardSection = document.createElement("div");
        clipboardSection.className = "section fade-in";
        clipboardSection.style.marginTop = "16px";
        clipboardSection.innerHTML = `
            <div class="section-header">
                <div class="section-title">${t("web_clipboard_header")}</div>
            </div>
            <textarea id="webTextInput" class="web-clipboard-area" placeholder="${t("web_clipboard_placeholder")}"></textarea>
            <div class="web-actions">
                <button id="webConvertBtn" class="primary-btn" style="max-width: 200px;">${t("web_clipboard_convert")}</button>
                <button id="webCopyBtn" class="secondary-btn" style="max-width: 200px; display:none;">${t("web_clipboard_copy")}</button>
            </div>
        `;

        // Ubacujemo redom: Clipboard pa DropZone
        firstSection.insertBefore(dropZone, firstSection.firstChild);
        firstSection.insertBefore(clipboardSection, firstSection.firstChild);

        // --- Event Listeners ---

        // File Input
        const input = dropZone.querySelector("#webFileInput") as HTMLInputElement;
        dropZone.onclick = () => input.click();
        input.onchange = () => {
            if (input.files?.length) processDocxFile(input.files[0]);
        };

        // Drag & Drop
        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.classList.add("hover");
        };
        dropZone.ondragleave = () => dropZone.classList.remove("hover");
        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.classList.remove("hover");
            if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
        };

        // Clipboard Logic
        const textArea = clipboardSection.querySelector("#webTextInput") as HTMLTextAreaElement;
        const convertBtn = clipboardSection.querySelector("#webConvertBtn") as HTMLButtonElement;
        const copyBtn = clipboardSection.querySelector("#webCopyBtn") as HTMLButtonElement;

        convertBtn.onclick = () => {
            const text = textArea.value;
            if (!text.trim()) {
                showModalInfo(t("modal_title_error"), html`${t("msg_enter_text")}`);
                return;
            }

            // Čitaj podešavanja iz UI-a (smer, zaštita, itd.)
            const uiSettings = getSettingsFromUi();
            const userProtected = [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)];

            // Koristimo convertPlainText direktno (brže od workera za kratak tekst)
            // Ali moramo paziti na smer.
            let dir = uiSettings.direction;
            if (dir === "auto") dir = "auto";

            const coreOpts = {
                userProtected: userProtected,
                protectBrands: uiSettings.protectBrands,
                applySerbianQuotes: uiSettings.applySerbianQuotes,
                preserveCodeBlocks: uiSettings.preserveCodeBlocks,
                curlyProtection: uiSettings.curlyProtection,
            };

            try {
                // Pozivamo core direktno
                const { text: result } = convertPlainText(text, dir as any, coreOpts);
                textArea.value = result;

                // Vizuelna povratna informacija
                textArea.style.borderColor = "var(--colorStatusSuccessForeground)";
                setTimeout(() => (textArea.style.borderColor = ""), 500);

                // Prikaži copy dugme
                convertBtn.style.display = "none";
                copyBtn.style.display = "inline-flex";
                copyBtn.innerText = t("web_clipboard_copy");
            } catch (e) {
                console.error(e);
                alert(t("web_convert_error"));
            }
        };

        copyBtn.onclick = async () => {
            await navigator.clipboard.writeText(textArea.value);
            copyBtn.innerText = t("web_clipboard_copied");
            setTimeout(() => {
                copyBtn.style.display = "none";
                convertBtn.style.display = "inline-flex";
                // Opciono: ne čistimo tekst da korisnik može opet nešto da uradi
                // textArea.value = "";
                copyBtn.innerText = t("web_clipboard_copy");
                // Reset placeholder
                textArea.setAttribute("placeholder", t("web_clipboard_ready"));
            }, 1500);
        };
    }

    console.log("✅ Web Mode UI injected successfully.");
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
