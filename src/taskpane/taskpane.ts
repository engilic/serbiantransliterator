/* global Office, Word, navigator, DOMParser */
import { convertOoxml } from "../shared/transliterator";

type DirectionUi = "auto" | "lat-to-cyr" | "cyr-to-lat";
type ProfilePreset = "custom" | "it" | "legal" | "journalism";
type ConvertStatsLike = any;

interface UiSettings {
    schemaVersion: 1;
    profile: ProfilePreset;
    userWords: string;
    protectBrands: boolean;
    applySerbianQuotes: boolean;
    preserveCodeBlocks: boolean;
    confirmWholeDoc: boolean;
    showStats: boolean;
    direction: DirectionUi;
}

const SETTINGS_KEY = "serbiantransliterator.settings.v2";

const PRESETS: Record<Exclude<ProfilePreset, "custom">, Omit<UiSettings, "profile" | "schemaVersion">> = {
    it: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: false,
        preserveCodeBlocks: true,
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

    if (runBtn) runBtn.onclick = () => runWithUiLock(runSmart);
    if (previewBtn) previewBtn.onclick = () => runWithUiLock(runPreview);
    if (exportBtn) exportBtn.onclick = () => runWithUiLock(exportSettings);
    if (importBtn) importBtn.onclick = () => runWithUiLock(importSettings);
    if (resetBtn) resetBtn.onclick = () => resetSettings();

    const settings = loadSettings();
    if (settings) {
        applySettingsToUi(settings);
    } else {
        // Default settings
        setPresetSelectValue("custom");
        setTextareaValue("userWords", "");
        setCheckboxValue("optProtectBrands", true);
        setCheckboxValue("optSerbianQuotes", true);
        setCheckboxValue("optPreserveCodeBlocks", true);
        setCheckboxValue("optConfirmWholeDoc", true);
        setCheckboxValue("optShowStats", false);
        setDirectionUi("auto");
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
        });
    }

    // Auto-save listeners
    (document.getElementById("userWords") as HTMLTextAreaElement | null)?.addEventListener("input", saveSettings);
    (document.getElementById("optProtectBrands") as HTMLInputElement | null)?.addEventListener("change", saveSettings);
    (document.getElementById("optSerbianQuotes") as HTMLInputElement | null)?.addEventListener("change", saveSettings);
    (document.getElementById("optPreserveCodeBlocks") as HTMLInputElement | null)?.addEventListener("change", saveSettings);
    (document.getElementById("optConfirmWholeDoc") as HTMLInputElement | null)?.addEventListener("change", saveSettings);

    (document.getElementById("dirAuto") as HTMLInputElement | null)?.addEventListener("change", saveSettings);
    (document.getElementById("dirLatToCyr") as HTMLInputElement | null)?.addEventListener("change", saveSettings);
    (document.getElementById("dirCyrToLat") as HTMLInputElement | null)?.addEventListener("change", saveSettings);

    const showStatsEl = document.getElementById("optShowStats") as HTMLInputElement | null;
    if (showStatsEl) {
        showStatsEl.addEventListener("change", () => {
            saveSettings();
            refreshStatsVisibilityAndContent();
        });
    }

    initTagsInput();
    refreshStatsVisibilityAndContent();
}

function initTagsInput() {
    const container = document.getElementById("tagsContainer");
    const list = document.getElementById("tagsList");
    const input = document.getElementById("tagInput") as HTMLInputElement;
    const hiddenTextarea = document.getElementById("userWords") as HTMLTextAreaElement;
    const clearBtn = document.getElementById("clearTagsBtn") as HTMLButtonElement;

    if (!container || !list || !input || !hiddenTextarea) return;

    container.addEventListener("click", (e) => {
        if (e.target !== input) input.focus();
    });

    function renderTags() {
        list!.innerHTML = "";
        const words = hiddenTextarea.value.split("\n").filter(w => w.trim() !== "");

        if (clearBtn) {
            clearBtn.disabled = words.length === 0;
        }

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

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const val = input.value.trim();
            if (val) {
                const current = hiddenTextarea.value.split("\n").filter(w => w.trim() !== "");
                if (!current.includes(val)) {
                    current.push(val);
                    updateTextarea(current);
                    renderTags();
                }
                input.value = "";
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

/* ─────────────────────────────
   Logic Helper Functions
   ───────────────────────────── */

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

/* ─────────────────────────────
   Modal & Dialogs
   ───────────────────────────── */

interface ModalOpts {
    title: string;
    message: string;
    mode: ModalMode;
    okText?: string;
    cancelText?: string;
    value?: string;
    readOnly?: boolean;
    isHtml?: boolean; // NEW: Supports HTML injection
    className?: string; // NEW: Custom class for wider modal
}

function showModal(opts: ModalOpts): Promise<{ ok: boolean; value?: string }> {
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

    // Reset classes
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

    // Hide Cancel button if requested (e.g. for read-only backup view or diff)
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
    // Fix: If readOnly, hide Cancel button by passing "NONE"
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
        isHtml: true, // Inject HTML
        className: "wide" // Wide modal
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

            range.insertOoxml(result.xml, Word.InsertLocation.replace);
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
    setStatus("Generišem uporedni prikaz...");
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

            // DIFF SIDE-BY-SIDE
            const diffHtml = generateSideBySideHtml(originalText, newText);

            showDiffModal("Preview Izmena (Uporedni prikaz)", diffHtml);

            // Sync scroll with delay to ensure DOM is ready
            setTimeout(() => syncScroll(), 300);

            setStatus(`Preview završen. (${result.type})`);
        });
    } catch (error) {
        console.error(error);
        setStatus("Greška (preview): " + error);
    }
}

/* ─────────────────────────────
   Helpers & Diff
   ───────────────────────────── */

function generateSideBySideHtml(oldText: string, newText: string): string {
    if (oldText === newText) {
        return `<div style="padding:10px; text-align:center;">Nema izmena u tekstu.</div>`;
    }

    // Split regex keeps delimiters
    const splitRegex = /([^\s\w\u0400-\u04FF\u0100-\u017F]+|\s+)/;
    const oldParts = oldText.split(splitRegex).filter(Boolean);
    const newParts = newText.split(splitRegex).filter(Boolean);

    let leftHtml = "";
    let rightHtml = "";

    const maxLen = Math.max(oldParts.length, newParts.length);

    for (let k = 0; k < maxLen; k++) {
        const o = oldParts[k] || "";
        const n = newParts[k] || "";

        if (o === n) {
            const safe = escapeHtml(n);
            leftHtml += safe;
            rightHtml += safe;
        } else {
            // Changed: highlight ONLY right side
            leftHtml += `<span style="opacity:0.6">${escapeHtml(o)}</span>`;
            rightHtml += `<span class="diff-changed">${escapeHtml(n)}</span>`;
        }
    }

    return `
    <div class="diff-wrapper">
        <div class="diff-pane" id="diffLeft">
            <div class="diff-header">ORIGINAL</div>
            <div class="diff-content">${leftHtml}</div>
        </div>
        <div class="diff-pane" id="diffRight">
            <div class="diff-header">REZULTAT</div>
            <div class="diff-content">${rightHtml}</div>
        </div>
    </div>
    `;
}

function syncScroll() {
    // We scroll the content divs, not the wrapper
    const left = document.querySelector("#diffLeft .diff-content") as HTMLElement;
    const right = document.querySelector("#diffRight .diff-content") as HTMLElement;

    if (!left || !right) return;

    const onScroll = (e: Event) => {
        const target = e.target as HTMLElement;
        const other = target === left ? right : left;

        other.removeEventListener("scroll", onScroll);
        other.scrollTop = target.scrollTop;
        setTimeout(() => other.addEventListener("scroll", onScroll), 10);
    };

    left.addEventListener("scroll", onScroll);
    right.addEventListener("scroll", onScroll);
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

async function exportSettings() {
    const settings = readSettingsFromUi();
    const json = JSON.stringify(settings, null, 2);
    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try { await navigator.clipboard.writeText(json); copied = true; } catch { copied = false; }
    }
    const msg = copied ? "Kopirano u clipboard." : "Kopiraj ručno:";
    await showTextDialog("Izvezi (Export)", msg, json, true);
    setStatus("Export gotov.");
}

async function importSettings() {
    const pasted = await showTextDialog("Uvezi (Import)", "Nalepi JSON:", "", false);
    if (pasted == null) return;
    try {
        const parsed = JSON.parse(pasted) as Partial<UiSettings>;
        const normalized: UiSettings = {
            schemaVersion: 1,
            profile: parsed.profile || "custom",
            userWords: parsed.userWords || "",
            protectBrands: parsed.protectBrands ?? true,
            applySerbianQuotes: parsed.applySerbianQuotes ?? true,
            preserveCodeBlocks: parsed.preserveCodeBlocks ?? true,
            confirmWholeDoc: parsed.confirmWholeDoc ?? true,
            showStats: parsed.showStats ?? false,
            direction: parsed.direction || "auto"
        };
        applySettingsToUi(normalized);
        saveSettings();
        setStatus("Import uspešan.");
    } catch {
        setStatus("Greška pri importu JSON-a.");
    }
}

function resetSettings() {
    try { localStorage.removeItem(SETTINGS_KEY); } catch { }
    setPresetSelectValue("custom");
    setTextareaValue("userWords", "");
    document.getElementById("userWords")?.dispatchEvent(new Event("input"));
    setCheckboxValue("optProtectBrands", true);
    setCheckboxValue("optSerbianQuotes", true);
    setCheckboxValue("optPreserveCodeBlocks", true);
    setCheckboxValue("optConfirmWholeDoc", true);
    setCheckboxValue("optShowStats", false);
    setDirectionUi("auto");
    saveSettings();
    setStatus("Resetovano.");
}

/* ─────────────────────────────
   UI read/write helpers
   ───────────────────────────── */

function readOptionsFromUi() {
    return {
        userProtected: getUserProtectedWords(),
        protectBrands: getCheckboxValue("optProtectBrands", true),
        applySerbianQuotes: getCheckboxValue("optSerbianQuotes", true),
        preserveCodeBlocks: getCheckboxValue("optPreserveCodeBlocks", true),
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

    if (dir === "lat-to-cyr") dirLatToCyr && (dirLatToCyr.checked = true);
    else if (dir === "cyr-to-lat") dirCyrToLat && (dirCyrToLat.checked = true);
    else dirAuto && (dirAuto.checked = true);
}

function getDirectionFromUi(): DirectionUi {
    const latToCyr = document.getElementById("dirLatToCyr") as HTMLInputElement | null;
    const cyrToLat = document.getElementById("dirCyrToLat") as HTMLInputElement | null;

    if (latToCyr?.checked) return "lat-to-cyr";
    if (cyrToLat?.checked) return "cyr-to-lat";
    return "auto";
}

/* ─────────────────────────────
   Persistence
   ───────────────────────────── */

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
    setCheckboxValue("optConfirmWholeDoc", settings.confirmWholeDoc);
    setCheckboxValue("optShowStats", settings.showStats);
    setDirectionUi(settings.direction || "auto");

    refreshStatsVisibilityAndContent();
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