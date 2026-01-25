// src/taskpane/app/web/ui.ts
/* global document, navigator, window */

import { processDocxFile } from "./batch";
import { t } from "../../../shared/i18n";
import { showModalInfo } from "../modal/modal";
import { html } from "../../../shared/safeHtml";
import { convertPlainText, type Direction, type CoreOptions } from "../../../core/textCore";
import { getSettingsFromUi } from "../settings/getters";
import { state } from "../state";
import { playSuccessSound } from "../audio"; // [GODLIKE]
import { checkIncognito } from "../incognito"; // [GODLIKE]

interface FileSystemFileHandle {
    kind: "file";
    name: string;
    getFile(): Promise<File>;
}
interface LaunchParams {
    files: FileSystemFileHandle[];
}
interface LaunchQueue {
    setConsumer(callback: (launchParams: LaunchParams) => Promise<void>): void;
}
interface WindowWithLaunchQueue extends Window {
    launchQueue?: LaunchQueue;
}

// [GALAXY MODE] Rekurzivna transliteracija
export function transliterateDomNode(node: Node, dir: Direction, coreOpts: CoreOptions) {
    if (node.nodeType === Node.TEXT_NODE) {
        const original = node.textContent || "";
        if (original.trim()) {
            const { text } = convertPlainText(original, dir, coreOpts);
            node.textContent = text;
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = (node as Element).tagName.toLowerCase();
        if (tagName !== "script" && tagName !== "style") {
            node.childNodes.forEach((child) => transliterateDomNode(child, dir, coreOpts));
        }
    }
}

export function initWebModeUi() {
    console.log("🚀 Initializing Web Mode UI...");

    // [GODLIKE] Check Incognito on start
    setTimeout(checkIncognito, 1000);

    const main = document.querySelector("main");
    if (!main) return;
    const firstSection = main.querySelector(".section");
    if (!firstSection) return;
    const btnGroup = firstSection.querySelector(".button-group") as HTMLElement | null;
    if (btnGroup) btnGroup.style.display = "none";

    if (!document.querySelector(".drop-zone")) {
        const dropZone = document.createElement("div");
        dropZone.className = "drop-zone fade-in";
        dropZone.innerHTML = `
            <div class="drop-icon">📂</div>
            <div class="drop-text">${t("web_drop_title")}<br>${t("web_drop_subtitle")}</div>
            <input type="file" id="webFileInput" accept=".docx" multiple style="display:none">
        `;

        const clipboardSection = document.createElement("div");
        clipboardSection.className = "section fade-in";
        clipboardSection.style.marginTop = "16px";

        clipboardSection.innerHTML = `
            <div class="section-header">
                <div class="section-title">${t("web_clipboard_header")}</div>
            </div>
            <div id="webRichInput" class="web-clipboard-area rich-input" contenteditable="true" 
                 data-placeholder="${t("web_clipboard_placeholder")}"></div>
            <div class="web-actions">
                <button id="webConvertBtn" class="primary-btn" style="max-width: 200px;">${t("web_clipboard_convert")}</button>
                <button id="webCopyBtn" class="secondary-btn" style="max-width: 200px; display:none;">${t("web_clipboard_copy")}</button>
            </div>
        `;

        firstSection.insertBefore(dropZone, firstSection.firstChild);
        firstSection.insertBefore(clipboardSection, firstSection.firstChild);

        const input = dropZone.querySelector("#webFileInput") as HTMLInputElement;
        dropZone.onclick = () => input.click();
        input.onchange = () => {
            if (input.files?.length) handleFiles(input.files);
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

        const richInput = clipboardSection.querySelector("#webRichInput") as HTMLDivElement;
        const convertBtn = clipboardSection.querySelector("#webConvertBtn") as HTMLButtonElement;
        const copyBtn = clipboardSection.querySelector("#webCopyBtn") as HTMLButtonElement;

        richInput.addEventListener("input", () => {
            const txt = richInput.innerText || richInput.textContent || "";
            if (txt.trim() === "") richInput.classList.add("empty");
            else richInput.classList.remove("empty");
        });
        richInput.classList.add("empty");

        // Helper za konverziju
        const doConvert = () => {
            const text = richInput.innerText || richInput.textContent || "";
            if (!text.trim()) {
                showModalInfo(t("modal_title_error"), html`${t("msg_enter_text")}`);
                return;
            }

            const uiSettings = getSettingsFromUi();
            const userProtected = [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)];
            let dir = uiSettings.direction;
            if (dir === "auto") dir = "auto";

            const coreOpts = {
                userProtected,
                protectBrands: uiSettings.protectBrands,
                applySerbianQuotes: uiSettings.applySerbianQuotes,
                preserveCodeBlocks: uiSettings.preserveCodeBlocks,
                curlyProtection: uiSettings.curlyProtection,
            };

            try {
                transliterateDomNode(richInput, dir as Direction, coreOpts);

                richInput.style.borderColor = "var(--colorStatusSuccessForeground)";
                setTimeout(() => (richInput.style.borderColor = ""), 500);

                convertBtn.style.display = "none";
                copyBtn.style.display = "inline-flex";
                copyBtn.innerText = t("web_clipboard_copy");

                // [GODLIKE] Sound!
                playSuccessSound();
            } catch (e) {
                console.error(e);
                showModalInfo(
                    t("modal_title_error"),
                    html`${t("web_convert_error")}<br /><small>${String(e)}</small>`
                );
            }
        };

        convertBtn.onclick = doConvert;

        copyBtn.onclick = async () => {
            try {
                const htmlBlob = new Blob([richInput.innerHTML], { type: "text/html" });
                const txt = richInput.innerText || richInput.textContent || "";
                const textBlob = new Blob([txt], { type: "text/plain" });
                const item = new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob });
                await navigator.clipboard.write([item]);

                copyBtn.innerText = t("web_clipboard_copied");
                setTimeout(() => {
                    copyBtn.style.display = "none";
                    convertBtn.style.display = "inline-flex";
                    copyBtn.innerText = t("web_clipboard_copy");
                }, 1500);
            } catch (e) {
                const txt = richInput.innerText || richInput.textContent || "";
                await navigator.clipboard.writeText(txt);
                copyBtn.innerText = t("web_clipboard_copied") + " (Plain)";
            }
        };

        // [GODLIKE] Global Auto-Paste
        document.addEventListener("paste", (e) => {
            // Ako fokus nije u inputu, uhvati paste i ubaci u nas editor
            const active = document.activeElement;
            const isInput =
                active instanceof HTMLInputElement ||
                active instanceof HTMLTextAreaElement ||
                (active as HTMLElement).isContentEditable;

            if (!isInput && e.clipboardData) {
                e.preventDefault();
                const text = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain");
                if (text) {
                    richInput.innerHTML = text; // ili textContent ako je plain
                    richInput.classList.remove("empty");
                    // Auto-scroll to editor
                    richInput.scrollIntoView({ behavior: "smooth", block: "center" });
                    // Flash effect
                    richInput.style.backgroundColor = "var(--colorNeutralBackground2)";
                    setTimeout(() => (richInput.style.backgroundColor = ""), 300);
                    // Odmah konvertuj? Ne, pusti korisnika da vidi.
                    // Ili... Auto-Convert ako je prazno bilo?
                    // Ne, bolje da korisnik klikne.
                }
            }
        });

        const titleEl = document.querySelector(".section-title");
        if (titleEl) {
            const baseTitle = titleEl.textContent;
            richInput.addEventListener("input", () => {
                const txt = richInput.innerText || richInput.textContent || "";
                const len = txt.length;
                if (len > 0) titleEl.textContent = `${baseTitle} (${len} chars)`;
                else titleEl.textContent = baseTitle;
            });
        }
    }

    const win = window as WindowWithLaunchQueue;
    if (win.launchQueue) {
        win.launchQueue.setConsumer(async (launchParams: LaunchParams) => {
            if (!launchParams.files.length) return;
            for (const fileHandle of launchParams.files) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const file = await (fileHandle as any).getFile();
                if (file.name.endsWith(".docx")) await processDocxFile(file);
            }
        });
    }

    console.log("✅ Web Mode UI injected successfully.");
}

async function handleFiles(files: FileList) {
    const fileArray = Array.from(files);
    let hasInvalid = false;
    for (const file of fileArray) {
        if (!file.name.endsWith(".docx")) {
            hasInvalid = true;
            continue;
        }
        await processDocxFile(file);
    }
    if (hasInvalid) showModalInfo(t("modal_title_error"), html`${t("web_drop_invalid_file")}`);
}
