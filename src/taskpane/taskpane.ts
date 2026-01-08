/* global Office, Word, navigator, DOMParser, Blob, URL, FileReader */
import { convertOoxml } from "../shared/transliterator";
// IMPORTUJEMO LISTU BRENDOVA
import { ALWAYS_LATIN_PHRASES } from "../../core/rules";

type DirectionUi = "auto" | "lat-to-cyr" | "cyr-to-lat" | "to-ascii";
type ProfilePreset = "custom" | "it" | "finance" | "medical" | "legal" | "journalism" | "marketing";
type ConvertStatsLike = any;

interface UiSettings {
    schemaVersion: 2;
    profile: ProfilePreset;
    userWordsCustom: string;
    userWordsPreset: string;
    userWords?: string;
    protectBrands: boolean;
    applySerbianQuotes: boolean;
    preserveCodeBlocks: boolean;
    setProofingLanguage: boolean;
    protectRomans: boolean;
    fixDoubleSpaces: boolean;
    formatDates: boolean;
    confirmWholeDoc: boolean;
    showStats: boolean;
    direction: DirectionUi;
}

const SETTINGS_KEY = "serbiantransliterator.settings.v2";

const DEFAULT_SETTINGS: UiSettings = {
    schemaVersion: 2,
    profile: "custom",
    userWordsCustom: "",
    userWordsPreset: "",
    userWords: "",
    protectBrands: true,
    applySerbianQuotes: true,
    preserveCodeBlocks: true,
    setProofingLanguage: true,
    protectRomans: true,
    fixDoubleSpaces: true,
    formatDates: true,
    confirmWholeDoc: true,
    showStats: false,
    direction: "auto"
};

const PRESETS: Record<string, any> = {
    it: {
        direction: "auto", protectBrands: true, applySerbianQuotes: false, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: false, formatDates: true, confirmWholeDoc: true, showStats: false,
        userWords: ["Git", "GitHub", "GitLab", "Azure", "AWS", "GCP", "DevOps", "Docker", "Kubernetes", "CI/CD", "YAML", "REST", "GraphQL", "PowerShell", "VS Code", "Visual Studio", "Windows Server", "Linux", "SerbianTransliterator", "Python", "JavaScript"].join("\n")
    },
    finance: {
        direction: "auto", protectBrands: true, applySerbianQuotes: true, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: true, formatDates: true, confirmWholeDoc: true, showStats: false,
        userWords: ["SWIFT", "IBAN", "EUR", "USD", "RSD", "CHF", "GBP", "MasterCard", "Visa", "PayPal", "Intesa", "Raiffeisen", "OTP", "NLB", "AIK", "Erste", "UniCredit", "Western Union", "E-banking", "M-banking"].join("\n")
    },
    medical: {
        direction: "auto", protectBrands: true, applySerbianQuotes: true, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: false, formatDates: true, confirmWholeDoc: true, showStats: false,
        userWords: ["mg", "ml", "kg", "Covid", "SARS", "Hemofarm", "Galenika", "Pfizer", "Actavis", "Alkaloid", "Bayer", "Roche", "Stada", "Anamnesis", "Diagnosis", "Therapia"].join("\n")
    },
    marketing: {
        direction: "auto", protectBrands: true, applySerbianQuotes: true, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: true, formatDates: false, confirmWholeDoc: true, showStats: false,
        userWords: ["Facebook", "Instagram", "LinkedIn", "TikTok", "Twitter", "X", "YouTube", "Google", "SEO", "PR", "Copywriter", "Content", "Ads", "Influencer", "Giveaway", "Hashtag", "Story", "Reel", "Post", "Follow"].join("\n")
    },
    legal: {
        direction: "auto", protectBrands: true, applySerbianQuotes: true, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: true, formatDates: true, confirmWholeDoc: true, showStats: false,
        userWords: ["Ustav Republike Srbije", "Zakon o obligacionim odnosima", "Zakon o radu", "Ministarstvo pravde", "Privredni sud", "Advokatska komora Srbije", "Službeni glasnik", "Bona fide", "De facto", "Ex officio"].join("\n")
    },
    journalism: {
        direction: "auto", protectBrands: true, applySerbianQuotes: true, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: true, formatDates: true, confirmWholeDoc: true, showStats: false,
        userWords: ["Reuters", "Associated Press", "BBC", "CNN", "Euronews", "N1", "RTS", "Tanjug", "NBA", "UEFA", "FIFA", "FIBA", "ATP", "WTA"].join("\n")
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
    const infoBrandsBtn = document.getElementById("infoBrandsBtn") as HTMLButtonElement | null; // NOVO

    if (runBtn) runBtn.onclick = () => runWithUiLock(runSmart);
    if (previewBtn) previewBtn.onclick = () => runWithUiLock(runPreview);
    if (exportBtn) exportBtn.onclick = () => runWithUiLock(exportSettingsAsDownload);

    if (importBtn && fileInput) {
        importBtn.onclick = () => fileInput.click();
        fileInput.onchange = (e) => handleFileImport(e);
    }

    if (resetBtn) {
        resetBtn.onclick = () => {
            confirmInPanel("Ovo će obrisati sve tvoje izmene i vratiti podrazumevana podešavanja. Da li želiš da nastaviš?").then((ok) => {
                if (ok) {
                    resetSettings();
                }
            });
        };
    }

    // LOGIKA ZA INFO DUGME
    if (infoBrandsBtn) {
        infoBrandsBtn.onclick = () => {
            // Formatiramo listu kao tagove za lep prikaz
            // Sortiramo abecedno
            const sorted = [...ALWAYS_LATIN_PHRASES].sort();
            const html = sorted.map(word =>
                `<span class="tag preset" style="display:inline-block; margin:2px;">${word}</span>`
            ).join("");

            showDiffModal("Zaštićeni brendovi (Ugrađeno)", `<div style="line-height:1.8;">${html}</div>`);
        };
    }

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
            document.getElementById("userWordsCustom")?.dispatchEvent(new Event("input"));
        });
    }

    const inputs = [
        "userWordsCustom", "userWordsPreset",
        "optProtectBrands", "optSerbianQuotes", "optPreserveCodeBlocks",
        "optSetProofingLanguage", "optProtectRomans", "optFixDoubleSpaces", "optFormatDates",
        "optConfirmWholeDoc", "dirAuto", "dirLatToCyr", "dirCyrToLat", "dirToAscii"
    ];
    inputs.forEach(id => {
        document.getElementById(id)?.addEventListener(id.includes("userWords") ? "input" : "change", () => {
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
        current.userWordsCustom === DEFAULT_SETTINGS.userWordsCustom &&
        current.protectBrands === DEFAULT_SETTINGS.protectBrands &&
        current.applySerbianQuotes === DEFAULT_SETTINGS.applySerbianQuotes &&
        current.preserveCodeBlocks === DEFAULT_SETTINGS.preserveCodeBlocks &&
        current.setProofingLanguage === DEFAULT_SETTINGS.setProofingLanguage &&
        current.protectRomans === DEFAULT_SETTINGS.protectRomans &&
        current.fixDoubleSpaces === DEFAULT_SETTINGS.fixDoubleSpaces &&
        current.formatDates === DEFAULT_SETTINGS.formatDates &&
        current.confirmWholeDoc === DEFAULT_SETTINGS.confirmWholeDoc &&
        current.showStats === DEFAULT_SETTINGS.showStats &&
        current.direction === DEFAULT_SETTINGS.direction;

    resetBtn.disabled = isClean;
}

function initTagsInput() {
    const container = document.getElementById("tagsContainer");
    const list = document.getElementById("tagsList");
    const input = document.getElementById("tagInput") as HTMLInputElement;

    const customTextarea = document.getElementById("userWordsCustom") as HTMLTextAreaElement;
    const presetTextarea = document.getElementById("userWordsPreset") as HTMLTextAreaElement;

    const clearBtn = document.getElementById("clearTagsBtn") as HTMLButtonElement;
    const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;

    if (!container || !list || !input || !customTextarea || !presetTextarea) return;

    container.addEventListener("click", (e) => {
        if (e.target !== input && e.target !== addBtn) input.focus();
    });

    function renderTags() {
        list!.innerHTML = "";

        const customWords = customTextarea.value.split("\n").filter(w => w.trim() !== "");
        const presetWords = presetTextarea.value.split("\n").filter(w => w.trim() !== "");

        customWords.forEach(word => {
            const tag = document.createElement("div");
            tag.className = "tag custom";
            tag.innerHTML = `<span>${word}</span><span class="tag-remove" data-type="custom" data-word="${word}">×</span>`;
            list!.appendChild(tag);
        });

        presetWords.forEach(word => {
            const tag = document.createElement("div");
            tag.className = "tag preset";
            tag.innerHTML = `<span>${word}</span><span class="tag-remove" data-type="preset" data-word="${word}">×</span>`;
            list!.appendChild(tag);
        });

        if (clearBtn) {
            clearBtn.disabled = (customWords.length + presetWords.length) === 0;
        }

        validateAddButton();
    }

    function removeWord(word: string, type: "custom" | "preset") {
        const targetArea = type === "custom" ? customTextarea : presetTextarea;
        const words = targetArea.value.split("\n").filter(w => w.trim() !== "");
        const newWords = words.filter(w => w !== word);
        targetArea.value = newWords.join("\n");
        targetArea.dispatchEvent(new Event("input"));
    }

    function addWord(word: string) {
        const words = customTextarea.value.split("\n").filter(w => w.trim() !== "");
        if (!words.includes(word)) {
            words.push(word);
            customTextarea.value = words.join("\n");
            customTextarea.dispatchEvent(new Event("input"));
        }
    }

    function validateAddButton() {
        if (!addBtn) return;
        const val = input.value.trim();
        const customWords = customTextarea.value.split("\n");
        const presetWords = presetTextarea.value.split("\n");
        const allWords = [...customWords, ...presetWords];

        const isInvalid = val.length === 0 || allWords.includes(val);
        addBtn.disabled = isInvalid;
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            confirmInPanel("Da li sigurno želiš da obrišeš sve zaštićene reči?").then((ok) => {
                if (ok) {
                    customTextarea.value = "";
                    presetTextarea.value = "";
                    customTextarea.dispatchEvent(new Event("input"));
                    presetTextarea.dispatchEvent(new Event("input"));
                }
            });
        });
    }

    if (addBtn) {
        addBtn.onclick = () => {
            const val = input.value.trim();
            if (val) {
                addWord(val);
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
            const customWords = customTextarea.value.split("\n").filter(w => w.trim() !== "");
            if (customWords.length > 0) {
                customWords.pop();
                customTextarea.value = customWords.join("\n");
                customTextarea.dispatchEvent(new Event("input"));
            }
        }
    });

    list.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("tag-remove")) {
            const word = target.getAttribute("data-word") || "";
            const type = target.getAttribute("data-type") as "custom" | "preset";
            removeWord(word, type);
        }
    });

    customTextarea.addEventListener("input", renderTags);
    presetTextarea.addEventListener("input", renderTags);
    renderTags();
}

function getAllUserWords(): string[] {
    const c = getTextareaValue("userWordsCustom").split("\n");
    const p = getTextareaValue("userWordsPreset").split("\n");
    return [...c, ...p].map(w => w.trim()).filter(w => w.length > 0);
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

    setPresetSelectValue(profile);
    setTextareaValue("userWordsPreset", preset.userWords);
    document.getElementById("userWordsPreset")?.dispatchEvent(new Event("input"));

    setCheckboxValue("optProtectBrands", preset.protectBrands);
    setCheckboxValue("optSerbianQuotes", preset.applySerbianQuotes);
    setCheckboxValue("optPreserveCodeBlocks", preset.preserveCodeBlocks);
    setCheckboxValue("optSetProofingLanguage", preset.setProofingLanguage);
    setCheckboxValue("optProtectRomans", preset.protectRomans);
    setCheckboxValue("optFixDoubleSpaces", preset.fixDoubleSpaces);
    setCheckboxValue("optFormatDates", preset.formatDates);
    setCheckboxValue("optConfirmWholeDoc", preset.confirmWholeDoc);
    setCheckboxValue("optShowStats", preset.showStats);
    setDirectionUi(preset.direction);

    lastStatsTitle = "Statistika poslednje akcije";
    lastStatsText = `Profil: ${profile} primenjen.`;
    refreshStatsVisibilityAndContent();

    setStatus(`Profil: ${profile} primenjen.`);
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

            const newRange = range.insertOoxml(result.xml, Word.InsertLocation.replace);

            if (getCheckboxValue("optSetProofingLanguage", true)) {
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

            showDiffModal("Pregled", diffHtml);

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
                schemaVersion: 2,
                profile: parsed.profile || "custom",
                userWordsCustom: parsed.userWordsCustom || parsed.userWords || "",
                userWordsPreset: parsed.userWordsPreset || "",
                protectBrands: parsed.protectBrands ?? true,
                applySerbianQuotes: parsed.applySerbianQuotes ?? true,
                preserveCodeBlocks: parsed.preserveCodeBlocks ?? true,
                setProofingLanguage: parsed.setProofingLanguage ?? true,
                protectRomans: parsed.protectRomans ?? true,
                fixDoubleSpaces: parsed.fixDoubleSpaces ?? false,
                formatDates: parsed.formatDates ?? false,
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
        userProtected: getAllUserWords(), // Koristi helper
        protectBrands: getCheckboxValue("optProtectBrands", true),
        applySerbianQuotes: getCheckboxValue("optSerbianQuotes", true),
        preserveCodeBlocks: getCheckboxValue("optPreserveCodeBlocks", true),
        setProofingLanguage: getCheckboxValue("optSetProofingLanguage", true),
        protectRomans: true, // Always true
        fixDoubleSpaces: getCheckboxValue("optFixDoubleSpaces", false),
        formatDates: getCheckboxValue("optFormatDates", false),
        confirmWholeDoc: getCheckboxValue("optConfirmWholeDoc", true),
        showStats: getCheckboxValue("optShowStats", false),
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
    setTextareaValue("userWordsCustom", settings.userWordsCustom || settings.userWords || "");
    setTextareaValue("userWordsPreset", settings.userWordsPreset || "");

    document.getElementById("userWordsCustom")?.dispatchEvent(new Event("input"));
    document.getElementById("userWordsPreset")?.dispatchEvent(new Event("input"));

    setCheckboxValue("optProtectBrands", settings.protectBrands);
    setCheckboxValue("optSerbianQuotes", settings.applySerbianQuotes);
    setCheckboxValue("optPreserveCodeBlocks", settings.preserveCodeBlocks);
    setCheckboxValue("optSetProofingLanguage", settings.setProofingLanguage ?? true);
    setCheckboxValue("optFixDoubleSpaces", settings.fixDoubleSpaces ?? false);
    setCheckboxValue("optFormatDates", settings.formatDates ?? false);
    // confirmWholeDoc se ne postavlja u UI jer nema checkboxa, ali se koristi u logici
    setCheckboxValue("optShowStats", settings.showStats);
    setDirectionUi(settings.direction || "auto");

    refreshStatsVisibilityAndContent();
    checkIfDirty();
}

function readSettingsFromUi(): UiSettings {
    const presetEl = document.getElementById("profilePreset") as HTMLSelectElement | null;
    return {
        schemaVersion: 2,
        profile: ((presetEl?.value as ProfilePreset) ?? "custom"),
        userWords: "", // Deprecated field
        userWordsCustom: getTextareaValue("userWordsCustom"),
        userWordsPreset: getTextareaValue("userWordsPreset"),
        protectBrands: getCheckboxValue("optProtectBrands", true),
        applySerbianQuotes: getCheckboxValue("optSerbianQuotes", true),
        preserveCodeBlocks: getCheckboxValue("optPreserveCodeBlocks", true),
        setProofingLanguage: getCheckboxValue("optSetProofingLanguage", true),
        protectRomans: true, // Hardcoded
        fixDoubleSpaces: getCheckboxValue("optFixDoubleSpaces", false),
        formatDates: getCheckboxValue("optFormatDates", false),
        confirmWholeDoc: true, // Hardcoded
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