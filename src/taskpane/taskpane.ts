/* global Office, Word, navigator, DOMParser, Blob, URL, FileReader */
import { convertOoxml } from "../shared/transliterator";

// DODATO: to-ascii
type DirectionUi = "auto" | "lat-to-cyr" | "cyr-to-lat" | "to-ascii";
type ProfilePreset = "custom" | "it" | "legal" | "journalism";
type ConvertStatsLike = any;

interface UiSettings {
    schemaVersion: 1;
    profile: ProfilePreset;
    userWords: string;
    protectBrands: boolean;
    applySerbianQuotes: boolean;
    preserveCodeBlocks: boolean;
    setProofingLanguage: boolean;
    confirmWholeDoc: boolean;
    showStats: boolean;
    direction: DirectionUi;
}

const SETTINGS_KEY = "serbiantransliterator.settings.v2";

const DEFAULT_SETTINGS: UiSettings = {
    schemaVersion: 1,
    profile: "custom",
    userWords: "",
    protectBrands: true,
    applySerbianQuotes: true,
    preserveCodeBlocks: true,
    setProofingLanguage: true,
    confirmWholeDoc: true,
    showStats: false,
    direction: "auto"
};

const PRESETS: Record<Exclude<ProfilePreset, "custom">, Omit<UiSettings, "profile" | "schemaVersion">> = {
    it: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: false,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        confirmWholeDoc: true,
        showStats: false,
        userWords: [
            "Git", "GitHub", "GitLab", "Azure", "AWS", "GCP", "DevOps", "Docker", "Kubernetes",
            "CI/CD", "YAML", "REST", "GraphQL", "PowerShell", "VS Code", "Visual Studio",
            "Windows Server", "Linux", "SerbianTransliterator"
        ].join("\n"),
    },
    legal: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        confirmWholeDoc: true,
        showStats: false,
        userWords: [
            "Ustav Republike Srbije", "Zakon o obligacionim odnosima", "Zakon o radu",
            "Ministarstvo pravde", "Privredni sud", "Advokatska komora Srbije"
        ].join("\n"),
    },
    journalism: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        confirmWholeDoc: true,
        showStats: false,
        userWords: [
            "Reuters", "Associated Press", "BBC", "CNN", "Euronews", "N1", "RTS",
            "Tanjug", "NBA", "UEFA", "FIFA"
        ].join("\n"),
    },
};

type ModalMode = "confirm" | "text";
let modalOpen = false;
let lastStatsText = "(Nema statistike još)";
let lastStatsTitle = "Statistika poslednje akcije";

Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        initUi();
    }
});

function initUi() {
    const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
    const previewBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;
    const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement | null;
    const importBtn = document.getElementById("importBtn") as HTMLButtonElement | null;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement | null;
    const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;

    if (runBtn) runBtn.onclick = () => runWithUiLock(runSmart);
    if (previewBtn) previewBtn.onclick = () => runWithUiLock(runPreview);
    if (exportBtn) exportBtn.onclick = () => runWithUiLock(exportSettingsAsDownload);

    if (importBtn && fileInput) {
        importBtn.onclick = () => fileInput.click();
        fileInput.onchange = (e) => handleFileImport(e);
    }

    if (resetBtn) resetBtn.onclick = () => resetSettings();

    const settings = loadSettings();
    if (settings) {
        applySettingsToUi(settings);
    } else {
        applySettingsToUi(DEFAULT_SETTINGS);
        saveSettings();
    }

    const presetEl = document.getElementById("profilePreset") as HTMLSelectElement | null;
    if (presetEl) {
        presetEl.addEventListener("change", () => {
            const profile = (presetEl.value as ProfilePreset) ?? "custom";
            if (profile !== "custom") {
                applyPresetSmart(profile);
            } else {
                setPresetSelectValue("custom");
                setStatus("Profil: custom");
            }
            saveSettings();
            checkIfDirty();
        });
    }

    // DODAT: dirToAscii
    const inputs = ["userWords", "optProtectBrands", "optSerbianQuotes", "optPreserveCodeBlocks", "optSetProofingLanguage", "optConfirmWholeDoc", "dirAuto", "dirLatToCyr", "dirCyrToLat", "dirToAscii"];
    inputs.forEach(id => {
        document.getElementById(id)?.addEventListener(id === "userWords" ? "input" : "change", () => {
            saveSettings();
            checkIfDirty();
        });
    });

    const showStatsEl = document.getElementById("optShowStats") as HTMLInputElement | null;
    if (showStatsEl) {
        showStatsEl.addEventListener("change", () => {
            saveSettings();
            refreshStatsVisibilityAndContent();
            checkIfDirty();
        });
    }

    initTagsInput();
    refreshStatsVisibilityAndContent();
    checkIfDirty();
}

function checkIfDirty() {
    const current = readSettingsFromUi();
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    if (!resetBtn) return;

    const isClean =
        current.profile === DEFAULT_SETTINGS.profile &&
        current.userWords === DEFAULT_SETTINGS.userWords &&
        current.protectBrands === DEFAULT_SETTINGS.protectBrands &&
        current.applySerbianQuotes === DEFAULT_SETTINGS.applySerbianQuotes &&
        current.preserveCodeBlocks === DEFAULT_SETTINGS.preserveCodeBlocks &&
        current.setProofingLanguage === DEFAULT_SETTINGS.setProofingLanguage &&
        current.confirmWholeDoc === DEFAULT_SETTINGS.confirmWholeDoc &&
        current.showStats === DEFAULT_SETTINGS.showStats &&
        current.direction === DEFAULT_SETTINGS.direction;

    resetBtn.disabled = isClean;
}

function initTagsInput() {
    const container = document.getElementById("tagsContainer");
    const list = document.getElementById("tagsList");
    const input = document.getElementById("tagInput") as HTMLInputElement;
    const hiddenTextarea = document.getElementById("userWords") as HTMLTextAreaElement;
    const clearBtn = document.getElementById("clearTagsBtn") as HTMLButtonElement;
    const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;

    if (!container || !list || !input || !hiddenTextarea) return;

    container.addEventListener("click", (e) => {
        if (e.target !== input && e.target !== addBtn) input.focus();
    });

    function renderTags() {
        list!.innerHTML = "";
        const words = hiddenTextarea.value.split("\n").filter(w => w.trim() !== "");

        if (clearBtn) {
            clearBtn.disabled = words.length === 0;
        }

        validateAddButton();

        words.forEach(word => {
            const tag = document.createElement("div");
            tag.className = "tag";
            tag.innerHTML = `<span>${word}</span><span class="tag-remove" data-word="${word}">×</span>`;
            list!.appendChild(tag);
        });
    }

    function updateTextarea(words: string[]) {
        hiddenTextarea.value = words.join("\n");
        const event = new Event("input", { bubbles: true });
        hiddenTextarea.dispatchEvent(event);
    }

    function validateAddButton() {
        if (!addBtn) return;
        const val = input.value.trim();
        const currentWords = hiddenTextarea.value.split("\n").filter(w => w.trim() !== "");
        const isInvalid = val.length === 0 || currentWords.includes(val);
        addBtn.disabled = isInvalid;
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            confirmInPanel("Da li sigurno želiš da obrišeš sve zaštićene reči?").then((ok) => {
                if (ok) {
                    updateTextarea([]);
                    renderTags();
                }
            });
        });
    }

    if (addBtn) {
        addBtn.onclick = () => {
            const val = input.value.trim();
            if (val) {
                const current = hiddenTextarea.value.split("\n").filter(w => w.trim() !== "");
                if (!current.includes(val)) {
                    current.push(val);
                    updateTextarea(current);
                    renderTags();
                }
                input.value = "";
                validateAddButton();
            }
            input.focus();
        };
    }

    input.addEventListener("input", validateAddButton);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (addBtn && !addBtn.disabled) {
                addBtn.click();
            }
        }
        if (e.key === "Backspace" && input.value === "") {
            const current = hiddenTextarea.value.split("\n").filter(w => w.trim() !== "");
            if (current.length > 0) {
                current.pop();
                updateTextarea(current);
                renderTags();
            }
        }
    });

    list.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("tag-remove")) {
            const wordToRemove = target.getAttribute("data-word");
            const current = hiddenTextarea.value.split("\n").filter(w => w.trim() !== "");
            const newWords = current.filter(w => w !== wordToRemove);
            updateTextarea(newWords);
            renderTags();
        }
    });

    renderTags();
    hiddenTextarea.addEventListener("input", renderTags);
}

function refreshStatsVisibilityAndContent() {
    const show = getCheckboxValue("optShowStats", false);
    const box = document.getElementById("statsBox") as HTMLDivElement | null;
    const title = document.getElementById("statsTitle") as HTMLDivElement | null;
    const text = document.getElementById("statsText") as HTMLPreElement | null;

    if (!box || !title || !text) return;

    box.style.display = show ? "block" : "none";
    title.textContent = lastStatsTitle;
    text.textContent = lastStatsText;
}

async function runWithUiLock(fn: () => Promise<void>) {
    const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
    const previewBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;

    try {
        if (runBtn) runBtn.disabled = true;
        if (previewBtn) previewBtn.disabled = true;
        await fn();
    } finally {
        if (runBtn) runBtn.disabled = false;
        if (previewBtn) previewBtn.disabled = false;
    }
}

function applyPresetSmart(profile: Exclude<ProfilePreset, "custom">) {
    const preset = PRESETS[profile];
    const current = getTextareaValue("userWords");
    const { mergedText, addedCount } = mergeWordLists(current, preset.userWords);

    setPresetSelectValue(profile);
    setTextareaValue("userWords", mergedText);
    document.getElementById("userWords")?.dispatchEvent(new Event("input"));

    setCheckboxValue("optProtectBrands", preset.protectBrands);
    setCheckboxValue("optSerbianQuotes", preset.applySerbianQuotes);
    setCheckboxValue("optPreserveCodeBlocks", preset.preserveCodeBlocks);
    setCheckboxValue("optSetProofingLanguage", preset.setProofingLanguage);
    setCheckboxValue("optConfirmWholeDoc", preset.confirmWholeDoc);
    setCheckboxValue("optShowStats", preset.showStats);
    setDirectionUi(preset.direction);

    lastStatsTitle = "Statistika poslednje akcije";
    lastStatsText = `Profil: ${profile}\nDodato novih stavki: ${addedCount}`;
    refreshStatsVisibilityAndContent();

    setStatus(`Profil: ${profile}. Dodato novih stavki: ${addedCount}.`);
}

function mergeWordLists(existingText: string, incomingText: string): { mergedText: string; addedCount: number } {
    const normLine = (s: string) => s.normalize("NFC").trim().replace(/\s+/g, " ");
    const existingLines = [];
    const set = new Set<string>();

    for (const line of existingText.split(/\r?\n/)) {
        const key = normLine(line);
        if (!key) continue;
        if (set.has(key)) continue;
        set.add(key);
        existingLines.push(key);
    }

    let added = 0;
    const additions = [];
    for (const line of incomingText.split(/\r?\n/)) {
        const key = normLine(line);
        if (!key) continue;
        if (set.has(key)) continue;
        set.add(key);
        additions.push(key);
        added++;
    }

    return { mergedText: existingLines.concat(additions).join("\n"), addedCount: added };
}

function showModal(opts: {
    title: string;
    message: string;
    mode: ModalMode;
    okText?: string;
    cancelText?: string;
    value?: string;
    readOnly?: boolean;
    isHtml?: boolean;
    className?: string;
}): Promise<{ ok: boolean; value?: string }> {
    if (modalOpen) return Promise.resolve({ ok: false });
    modalOpen = true;

    const overlay = document.getElementById("modalOverlay") as HTMLDivElement | null;
    const modalBox = document.getElementById("modal") as HTMLDivElement | null;
    const titleEl = document.getElementById("modalTitle") as HTMLDivElement | null;
    const textEl = document.getElementById("modalText") as HTMLDivElement | null;
    const inputEl = document.getElementById("modalInput") as HTMLTextAreaElement | null;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement | null;
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement | null;

    if (!overlay || !modalBox || !titleEl || !textEl || !inputEl || !okBtn || !cancelBtn) {
        modalOpen = false;
        return Promise.resolve({ ok: false });
    }

    modalBox.className = "modal";
    if (opts.className) modalBox.classList.add(opts.className);

    titleEl.textContent = opts.title;

    if (opts.isHtml) {
        textEl.innerHTML = opts.message;
    } else {
        textEl.textContent = opts.message;
    }

    okBtn.textContent = opts.okText ?? "OK";
    cancelBtn.textContent = opts.cancelText ?? "Cancel";

    if (opts.mode === "text") {
        inputEl.style.display = "block";
        inputEl.value = opts.value ?? "";
        inputEl.readOnly = !!opts.readOnly;
    } else {
        inputEl.style.display = "none";
        inputEl.value = "";
        inputEl.readOnly = false;
    }

    if (opts.cancelText === "NONE") {
        cancelBtn.style.display = "none";
    } else {
        cancelBtn.style.display = "inline-flex";
    }

    overlay.style.display = "flex";

    return new Promise((resolve) => {
        const cleanup = (result: { ok: boolean; value?: string }) => {
            overlay.style.display = "none";
            okBtn.onclick = null;
            cancelBtn.onclick = null;
            modalOpen = false;
            resolve(result);
        };
        okBtn.onclick = () => {
            if (opts.mode === "text") cleanup({ ok: true, value: inputEl.value });
            else cleanup({ ok: true });
        };
        cancelBtn.onclick = () => cleanup({ ok: false });
    });
}

async function confirmInPanel(message: string): Promise<boolean> {
    const res = await showModal({
        title: "Potvrda",
        message,
        mode: "confirm",
        okText: "Da",
        cancelText: "Ne",
    });
    return res.ok;
}

async function showTextDialog(title: string, message: string, value: string, readOnly: boolean): Promise<string | null> {
    const cancelTxt = readOnly ? "NONE" : "Otkaži";
    const okTxt = readOnly ? "U redu" : "OK";

    const res = await showModal({
        title,
        message,
        mode: "text",
        okText: okTxt,
        cancelText: cancelTxt,
        value,
        readOnly,
    });

    if (!res.ok && !readOnly) return null;
    return res.value ?? "";
}

function showDiffModal(title: string, htmlContent: string) {
    showModal({
        title,
        message: htmlContent,
        mode: "confirm",
        okText: "Zatvori",
        cancelText: "NONE",
        isHtml: true,
        className: "wide"
    });
}

/* ─────────────────────────────
   Main Logic
   ───────────────────────────── */

async function runSmart() {
    setStatus("Radim preslovljavanje...");

    try {
        await Word.run(async (context) => {
            let range = context.document.getSelection();
            range.load("text");
            await context.sync();

            const selectionText = range.text ?? "";
            const hasSelection = selectionText.trim().length > 0;

            const confirmWholeDoc = getCheckboxValue("optConfirmWholeDoc", true);
            if (!hasSelection) {
                if (confirmWholeDoc) {
                    const ok = await confirmInPanel("Nema selekcije. Da li želiš da presloviš CEO dokument?");
                    if (!ok) {
                        setStatus("Otkazano (nema selekcije).");
                        return;
                    }
                }
                range = context.document.body.getRange("Whole");
            }

            const ooxml = range.getOoxml();
            await context.sync();

            const opts = readOptionsFromUi();
            saveSettings();

            const result = convertOoxml(ooxml.value, opts as any) as any as { xml: string; type: string; stats?: ConvertStatsLike };

            if (result.type === "Nema teksta") {
                setStatus("Nema teksta za konverziju.");
                return;
            }

            // 1. Ubacujemo novi tekst
            const newRange = range.insertOoxml(result.xml, Word.InsertLocation.replace);

            // 2. Menjamo jezik
            // Za ASCII opciju ne diramo jezik (ostavljamo šta je bilo)
            if (getCheckboxValue("optSetProofingLanguage", true) && result.stats.direction !== "to-ascii" as any) {
                if (result.stats.direction === "lat-to-cyr") {
                    (newRange.font as any).localeId = "sr-Cyrl-RS";
                } else if (result.stats.direction === "cyr-to-lat") {
                    (newRange.font as any).localeId = "sr-Latn-RS";
                }
            }

            await context.sync();

            setStatus(`Uspeh: ${result.type}\n(Undo sa Ctrl+Z)`);

            const scope = hasSelection ? "Selekcija" : "Ceo dokument";
            lastStatsTitle = `Statistika: ${result.type}`;
            lastStatsText = formatStatsFriendly(result.stats, scope);
            refreshStatsVisibilityAndContent();
        });
    } catch (error) {
        console.error(error);
        setStatus("Greška: " + error);
    }
}

async function runPreview() {
    setStatus("Generišem preview...");
    try {
        await Word.run(async (context) => {
            let range = context.document.getSelection();
            range.load("text");
            await context.sync();

            const selectionText = range.text ?? "";
            const hasSelection = selectionText.trim().length > 0;

            const confirmWholeDoc = getCheckboxValue("optConfirmWholeDoc", true);
            if (!hasSelection) {
                if (confirmWholeDoc) {
                    const ok = await confirmInPanel("Nema selekcije. Da li želiš Preview za CEO dokument?\n(Ovo može potrajati za velike fajlove).");
                    if (!ok) {
                        setStatus("Otkazano preview.");
                        return;
                    }
                }
                range = context.document.body.getRange("Whole");
            }

            range.load("text");
            const ooxml = range.getOoxml();
            await context.sync();

            const originalText = range.text;

            const opts = readOptionsFromUi();
            const result = convertOoxml(ooxml.value, opts as any) as any as { xml: string; type: string; stats?: ConvertStatsLike };

            const newText = extractTextFromOoxml(result.xml);

            const diffHtml = generateHighlightHtml(originalText, newText);

            showDiffModal("Preview Rezultata", diffHtml);

            setStatus(`Preview završen. (${result.type})`);
        });
    } catch (error) {
        console.error(error);
        setStatus("Greška (preview): " + error);
    }
}

function generateHighlightHtml(oldText: string, newText: string): string {
    if (oldText === newText) {
        return `<div class="preview-single-pane" style="text-align:center;">Nema izmena u tekstu.</div>`;
    }

    const splitRegex = /([^\s\w\u0400-\u04FF\u0100-\u017F]+|\s+)/;
    const oldParts = oldText.split(splitRegex).filter(Boolean);
    const newParts = newText.split(splitRegex).filter(Boolean);

    let html = "";

    const maxLen = Math.max(oldParts.length, newParts.length);

    for (let k = 0; k < maxLen; k++) {
        const o = oldParts[k] || "";
        const n = newParts[k] || "";

        if (o === n) {
            html += escapeHtml(n);
        } else {
            html += `<span class="diff-changed">${escapeHtml(n)}</span>`;
        }
    }

    return `<div class="preview-single-pane">${html}</div>`;
}

function escapeHtml(text: string): string {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatStatsFriendly(stats: ConvertStatsLike | undefined, scope: string): string {
    if (!stats) return `Opseg: ${scope}\nStatistika nije dostupna.`;
    const time = typeof stats.timingMs === "number" ? `${stats.timingMs.toFixed(1)} ms` : "n/a";
    const charsBefore = stats.charsBefore ?? 0;
    const charsAfter = stats.charsAfter ?? 0;
    return `Opseg: ${scope}\nKaraktera: ${charsBefore} -> ${charsAfter}\nVreme: ${time}`;
}

function extractTextFromOoxml(ooxml: string): string {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(ooxml, "application/xml");
        let nodes = doc.getElementsByTagName("w:t");
        if (nodes.length === 0) nodes = doc.getElementsByTagName("t");
        let out = "";
        for (let i = 0; i < nodes.length; i++) out += nodes[i].textContent ?? "";
        return out;
    } catch { return ""; }
}

async function exportSettingsAsDownload() {
    const settings = readSettingsFromUi();
    const json = JSON.stringify(settings, null, 2);

    try {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "serbian-transliterator-settings.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus("Fajl sa podešavanjima je preuzet.");
    } catch (e) {
        await showTextDialog("Izvezi podešavanja", "Kopiraj ručno:", json, true);
    }
}

// NOVO: Handle File Import
async function handleFileImport(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const json = event.target?.result as string;
            const parsed = JSON.parse(json) as Partial<UiSettings>;

            // Normalizacija i primena
            const normalized: UiSettings = {
                schemaVersion: 1,
                profile: parsed.profile || "custom",
                userWords: parsed.userWords || "",
                protectBrands: parsed.protectBrands ?? true,
                applySerbianQuotes: parsed.applySerbianQuotes ?? true,
                preserveCodeBlocks: parsed.preserveCodeBlocks ?? true,
                setProofingLanguage: parsed.setProofingLanguage ?? true,
                confirmWholeDoc: parsed.confirmWholeDoc ?? true,
                showStats: parsed.showStats ?? false,
                direction: parsed.direction || "auto"
            };

            applySettingsToUi(normalized);
            saveSettings();
            checkIfDirty();
            setStatus("Podešavanja su uspešno učitana.");
        } catch (err) {
            setStatus("Greška: Fajl nije validan JSON.");
        }
        // Reset input da bi mogao isti fajl opet
        input.value = "";
    };

    reader.readAsText(file);
}

// Legacy import (ako neko pozove ručno, mada se više ne koristi)
async function importSettings() {
    // Ova funkcija je sada redundantna jer imamo file input, 
    // ali je ostavljam ako želiš da zadržiš fallback.
    // U initUi je već vezana za fileInput.click()
}

function resetSettings() {
    try { localStorage.removeItem(SETTINGS_KEY); } catch { }
    applySettingsToUi(DEFAULT_SETTINGS);
    saveSettings();
    setStatus("Resetovano.");
    checkIfDirty();
}

function readOptionsFromUi() {
    return {
        userProtected: getUserProtectedWords(),
        protectBrands: getCheckboxValue("optProtectBrands", true),
        applySerbianQuotes: getCheckboxValue("optSerbianQuotes", true),
        preserveCodeBlocks: getCheckboxValue("optPreserveCodeBlocks", true),
        setProofingLanguage: getCheckboxValue("optSetProofingLanguage", true),
        direction: getDirectionFromUi(),
    };
}

function setStatus(text: string) {
    const el = document.getElementById("msg");
    if (el) el.textContent = text;
}

function getUserProtectedWords(): string[] {
    const el = document.getElementById("userWords") as HTMLTextAreaElement | null;
    if (!el) return [];
    return el.value.split(/\r?\n/).map((w) => w.trim()).filter((w) => w.length > 0);
}

function getTextareaValue(id: string): string {
    const el = document.getElementById(id) as HTMLTextAreaElement | null;
    return el?.value ?? "";
}

function getCheckboxValue(id: string, defaultValue: boolean): boolean {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return defaultValue;
    return !!el.checked;
}

function setCheckboxValue(id: string, value: boolean) {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.checked = value;
}

function setTextareaValue(id: string, value: string) {
    const el = document.getElementById(id) as HTMLTextAreaElement | null;
    if (el) el.value = value;
}

function setPresetSelectValue(value: string) {
    const el = document.getElementById("profilePreset") as HTMLSelectElement | null;
    if (el) el.value = value;
}

function setDirectionUi(dir: DirectionUi) {
    const dirAuto = document.getElementById("dirAuto") as HTMLInputElement | null;
    const dirLatToCyr = document.getElementById("dirLatToCyr") as HTMLInputElement | null;
    const dirCyrToLat = document.getElementById("dirCyrToLat") as HTMLInputElement | null;
    // DODATO:
    const dirToAscii = document.getElementById("dirToAscii") as HTMLInputElement | null;

    if (dir === "lat-to-cyr") dirLatToCyr && (dirLatToCyr.checked = true);
    else if (dir === "cyr-to-lat") dirCyrToLat && (dirCyrToLat.checked = true);
    else if (dir === "to-ascii") dirToAscii && (dirToAscii.checked = true);
    else dirAuto && (dirAuto.checked = true);
}

function getDirectionFromUi(): DirectionUi {
    const latToCyr = document.getElementById("dirLatToCyr") as HTMLInputElement | null;
    const cyrToLat = document.getElementById("dirCyrToLat") as HTMLInputElement | null;
    const toAscii = document.getElementById("dirToAscii") as HTMLInputElement | null;

    if (latToCyr?.checked) return "lat-to-cyr";
    if (cyrToLat?.checked) return "cyr-to-lat";
    if (toAscii?.checked) return "to-ascii";
    return "auto";
}

function loadSettings(): UiSettings | null {
    try {
        if (typeof localStorage === "undefined") return null;
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as Partial<UiSettings> as UiSettings;
    } catch {
        return null;
    }
}

function applySettingsToUi(settings: UiSettings) {
    setPresetSelectValue(settings.profile || "custom");
    setTextareaValue("userWords", settings.userWords || "");
    document.getElementById("userWords")?.dispatchEvent(new Event("input"));

    setCheckboxValue("optProtectBrands", settings.protectBrands);
    setCheckboxValue("optSerbianQuotes", settings.applySerbianQuotes);
    setCheckboxValue("optPreserveCodeBlocks", settings.preserveCodeBlocks);
    setCheckboxValue("optSetProofingLanguage", settings.setProofingLanguage ?? true);
    setCheckboxValue("optConfirmWholeDoc", settings.confirmWholeDoc);
    setCheckboxValue("optShowStats", settings.showStats);
    setDirectionUi(settings.direction || "auto");

    refreshStatsVisibilityAndContent();
    checkIfDirty();
}

function readSettingsFromUi(): UiSettings {
    const presetEl = document.getElementById("profilePreset") as HTMLSelectElement | null;
    return {
        schemaVersion: 1,
        profile: ((presetEl?.value as ProfilePreset) ?? "custom"),
        userWords: getTextareaValue("userWords"),
        protectBrands: getCheckboxValue("optProtectBrands", true),
        applySerbianQuotes: getCheckboxValue("optSerbianQuotes", true),
        preserveCodeBlocks: getCheckboxValue("optPreserveCodeBlocks", true),
        setProofingLanguage: getCheckboxValue("optSetProofingLanguage", true),
        confirmWholeDoc: getCheckboxValue("optConfirmWholeDoc", true),
        showStats: getCheckboxValue("optShowStats", false),
        direction: getDirectionFromUi(),
    };
}

function saveSettings() {
    try {
        if (typeof localStorage === "undefined") return;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(readSettingsFromUi()));
    } catch { }
}