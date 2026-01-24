// src/taskpane/app/web/ui.ts
/* global document, navigator */

import { processDocxFile } from "./batch";
import { t } from "../../../shared/i18n";
import { showModalInfo } from "../modal/modal";
import { html } from "../../../shared/safeHtml";
import { convertPlainText } from "../../../core/textCore";
import { getSettingsFromUi } from "../settings/getters";
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

    if (!document.querySelector(".drop-zone")) {
        const dropZone = document.createElement("div");
        dropZone.className = "drop-zone fade-in";
        dropZone.innerHTML = `
            <div class="drop-icon">📂</div>
            <div class="drop-text">${t("web_drop_title")}<br>${t("web_drop_subtitle")}</div>
            <input type="file" id="webFileInput" accept=".docx" style="display:none">
        `;

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

        firstSection.insertBefore(dropZone, firstSection.firstChild);
        firstSection.insertBefore(clipboardSection, firstSection.firstChild);

        // --- Event Listeners ---
        const input = dropZone.querySelector("#webFileInput") as HTMLInputElement;
        dropZone.onclick = () => input.click();
        input.onchange = () => {
            if (input.files?.length) processDocxFile(input.files[0]);
        };

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

        const textArea = clipboardSection.querySelector("#webTextInput") as HTMLTextAreaElement;
        const convertBtn = clipboardSection.querySelector("#webConvertBtn") as HTMLButtonElement;
        const copyBtn = clipboardSection.querySelector("#webCopyBtn") as HTMLButtonElement;

        convertBtn.onclick = () => {
            const text = textArea.value;
            if (!text.trim()) {
                showModalInfo(t("modal_title_error"), html`${t("msg_enter_text")}`);
                return;
            }

            const uiSettings = getSettingsFromUi();
            const userProtected = [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)];

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
                const { text: result } = convertPlainText(text, dir as any, coreOpts);
                textArea.value = result;

                textArea.style.borderColor = "var(--colorStatusSuccessForeground)";
                setTimeout(() => (textArea.style.borderColor = ""), 500);

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
                copyBtn.innerText = t("web_clipboard_copy");
                textArea.setAttribute("placeholder", t("web_clipboard_ready"));
            }, 1500);
        };
    }

    // [GOD MODE] PWA File Handling API (Launch with file)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ("launchQueue" in window && "files" in (window as any).launchQueue) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).launchQueue.setConsumer(async (launchParams: any) => {
            if (!launchParams.files.length) return;
            const fileHandle = launchParams.files[0];
            const file = await fileHandle.getFile();
            if (file.name.endsWith(".docx")) {
                processDocxFile(file);
            }
        });
    }

    // [GOD MODE] Live Character Count za Clipboard
    const textArea = document.getElementById("webTextInput") as HTMLTextAreaElement | null;
    const titleEl = document.querySelector(".section-title");
    if (textArea && titleEl) {
        const baseTitle = titleEl.textContent;
        textArea.addEventListener("input", () => {
            const len = textArea.value.length;
            if (len > 0) {
                titleEl.textContent = `${baseTitle} (${len} chars)`;
            } else {
                titleEl.textContent = baseTitle;
            }
        });
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
