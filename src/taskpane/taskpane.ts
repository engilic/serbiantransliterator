/* global Word, Office, document, window, console, Blob, URL, FileReader, DOMParser */

import { convertOoxml, OoxmlOptions } from "../shared/ooxml/convertOoxml";
import { ALWAYS_LATIN_PHRASES } from "../core/rules";

// --- TIPOVI ---

type DirectionUi = "auto" | "lat-to-cyr" | "cyr-to-lat" | "to-ascii";
type ProfilePreset = "custom" | "it" | "finance" | "medical" | "legal" | "journalism" | "marketing";

interface UiSettings {
    schemaVersion: 2;
    profile: ProfilePreset;
    userWordsCustom: string[];
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

// --- KONSTANTE ---

const SETTINGS_KEY = "serbiantransliterator.settings.v2";

const DEFAULT_SETTINGS: UiSettings = {
    schemaVersion: 2,
    profile: "custom",
    userWordsCustom: [],
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

const PROFILE_NAMES: Record<string, string> = {
    "custom": "Ručno",
    "it": "IT / Tehnologija",
    "finance": "Finansije / Bankarstvo",
    "medical": "Medicina / Farmacija",
    "legal": "Pravo / Administracija",
    "marketing": "Marketing / Društvene mreže",
    "journalism": "Novinarstvo / Mediji"
};

const PRESETS: Record<string, Partial<UiSettings> & { userWords: string[] }> = {
    it: {
        direction: "auto", protectBrands: true, applySerbianQuotes: false, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: false, formatDates: true,
        userWords: ["Git", "GitHub", "GitLab", "Azure", "AWS", "GCP", "DevOps", "Docker", "Kubernetes", "CI/CD", "YAML", "REST", "GraphQL", "PowerShell", "VS Code", "Visual Studio", "Windows Server", "Linux", "SerbianTransliterator", "Python", "JavaScript", "Typescript", "Node.js", "React", "Angular", "Vue", "Frontend", "Backend", "Fullstack", "Database", "Cache", "Cookie", "Token", "API", "Endpoint"]
    },
    finance: {
        direction: "auto", protectBrands: true, applySerbianQuotes: true, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: true, formatDates: true,
        userWords: ["SWIFT", "IBAN", "EUR", "USD", "RSD", "CHF", "GBP", "MasterCard", "Visa", "PayPal", "Intesa", "Raiffeisen", "OTP", "NLB", "AIK", "Erste", "UniCredit", "Western Union", "E-banking", "M-banking", "Leasing", "Factoring", "Equity", "Forex"]
    },
    medical: {
        direction: "auto", protectBrands: true, applySerbianQuotes: true, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: false, formatDates: true,
        userWords: ["mg", "ml", "kg", "Covid", "SARS", "Hemofarm", "Galenika", "Pfizer", "Actavis", "Alkaloid", "Bayer", "Roche", "Stada", "Anamnesis", "Diagnosis", "Therapia", "CT", "MRI", "EKG", "EEG", "In vitro", "In vivo"]
    },
    marketing: {
        direction: "auto", protectBrands: true, applySerbianQuotes: true, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: true, formatDates: false,
        userWords: ["Facebook", "Instagram", "LinkedIn", "TikTok", "Twitter", "X", "YouTube", "Google", "SEO", "PR", "Copywriter", "Content", "Ads", "Influencer", "Giveaway", "Hashtag", "Story", "Reel", "Post", "Follow", "Like", "Share", "Subscribe", "Timeline", "Feed"]
    },
    legal: {
        direction: "auto", protectBrands: true, applySerbianQuotes: true, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: true, formatDates: true,
        userWords: ["Ustav Republike Srbije", "Zakon o obligacionim odnosima", "Zakon o radu", "Ministarstvo pravde", "Privredni sud", "Advokatska komora Srbije", "Službeni glasnik", "Bona fide", "De facto", "Ex officio", "Copyright", "Trademark", "Disclaimer", "Policy", "Terms", "Conditions", "GDPR"]
    },
    journalism: {
        direction: "auto", protectBrands: true, applySerbianQuotes: true, preserveCodeBlocks: true, setProofingLanguage: true, protectRomans: true, fixDoubleSpaces: true, formatDates: true,
        userWords: ["Reuters", "Associated Press", "BBC", "CNN", "Euronews", "N1", "RTS", "Tanjug", "NBA", "UEFA", "FIFA", "FIBA", "ATP", "WTA", "Olimpijske igre"]
    }
};

// --- GLOBALNO STANJE ---

let customWordsSet: Set<string> = new Set();
let presetWordsSet: Set<string> = new Set();
let currentProfile: ProfilePreset = "custom";
let lastStatsTitle = "Statistika poslednje akcije";
let lastStatsText = "(Nema statistike još)";
let selectionTimeout: any = null; // Za praćenje selekcije
let isApplyingProfile = false; // Zastavica da znamo kad programski menjamo profil

// --- INIT ---

Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        initUi();

        // Dodajemo slušač događaja za promenu selekcije
        Office.context.document.addHandlerAsync(
            Office.EventType.DocumentSelectionChanged,
            onSelectionChange
        );
        // Proveri odmah na startu
        checkSelectionAndUpdateButtons();
    }
});

function initUi() {
    const settings = loadSettings() || DEFAULT_SETTINGS;

    customWordsSet = new Set(settings.userWordsCustom);
    if (settings.profile !== "custom" && PRESETS[settings.profile]) {
        presetWordsSet = new Set(PRESETS[settings.profile]!.userWords);
    }
    currentProfile = settings.profile;

    isApplyingProfile = true;
    applySettingsToUi(settings);
    isApplyingProfile = false;

    renderTags();

    updateResetButtonState();

    document.getElementById("runBtn")!.onclick = () => runWithUiLock(runSmart);
    document.getElementById("previewBtn")!.onclick = () => runWithUiLock(runPreview);
    document.getElementById("exportBtn")!.onclick = exportSettingsAsDownload;
    document.getElementById("importBtn")!.onclick = () => document.getElementById("fileInput")!.click();
    document.getElementById("fileInput")!.onchange = handleFileImport;

    document.getElementById("resetBtn")!.onclick = async () => {
        const ok = await confirmInPanel("Ovo će vratiti sve opcije na podrazumevane vrednosti.<br><br>Vaše zaštićene reči <b>neće</b> biti obrisane.<br><br>Da li želite da nastavite?");
        if (ok) resetSettings();
    };

    setupTagEvents();
    setupInputListeners();

    document.getElementById("profilePreset")!.addEventListener("change", (e) => {
        const val = (e.target as HTMLSelectElement).value as ProfilePreset;
        changeProfile(val);
    });

    document.getElementById("modalOk")!.onclick = handleModalOk;
    document.getElementById("modalCancel")!.onclick = closeModal;

    refreshStats();
}

// --- SELECTION HANDLING (PAMETNA DUGMAD) ---

function onSelectionChange() {
    if (selectionTimeout) clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
        checkSelectionAndUpdateButtons();
    }, 50);
}

async function checkSelectionAndUpdateButtons() {
    await Word.run(async (context) => {
        const range = context.document.getSelection();
        range.load("text");
        await context.sync();

        const runBtn = document.getElementById("runBtn") as HTMLButtonElement;
        const prevBtn = document.getElementById("previewBtn") as HTMLButtonElement;

        if (!runBtn || !prevBtn) return;

        const rawText = range.text;
        const hasContent = rawText.trim().length > 0;
        const isJustWhitespace = rawText.length > 0 && !hasContent;

        if (isJustWhitespace) {
            // Slučaj 1: Prazan prostor
            const htmlRun = `PRESLOVI<br><span class="btn-subtitle"><b>NEMA TEKSTA</b></span>`;
            const htmlPrev = `PREGLED<br><span class="btn-subtitle"><b>NEMA TEKSTA</b></span>`;

            runBtn.innerHTML = htmlRun;
            runBtn.disabled = true;

            prevBtn.innerHTML = htmlPrev;
            prevBtn.disabled = true;
        } else if (hasContent) {
            // Slučaj 2: Ima teksta
            const htmlRun = `PRESLOVI<br><span class="btn-subtitle"><b>selekciju</b></span>`;
            const htmlPrev = `PREGLED<br><span class="btn-subtitle"><b>selekcije</b></span>`; // ISPRAVLJENO

            runBtn.innerHTML = htmlRun;
            runBtn.disabled = false;

            prevBtn.innerHTML = htmlPrev;
            prevBtn.disabled = false;
        } else {
            // Slučaj 3: Nema selekcije (ceo dokument)
            const htmlRun = `PRESLOVI<br><span class="btn-subtitle"><b>ceo dokument</b></span>`;
            const htmlPrev = `PREGLED<br><span class="btn-subtitle"><b>celog dokumenta</b></span>`; // ISPRAVLJENO

            runBtn.innerHTML = htmlRun;
            runBtn.disabled = false;

            prevBtn.innerHTML = htmlPrev;
            prevBtn.disabled = false;
        }
    });
}

// --- CORE LOGIC ---

async function runSmart() {
    try {
        await Word.run(async (context) => {
            let range = context.document.getSelection();
            range.load("text");
            await context.sync();

            const rawText = range.text;
            const hasText = rawText.trim().length > 0;
            const isJustWhitespace = rawText.length > 0 && !hasText;

            if (isJustWhitespace) {
                showModalInfo("Greška", "Selektovan je samo prazan prostor (razmaci).<br>Molimo selektujte tekst ili ne selektujte ništa za ceo dokument.");
                setStatus("Greška: Prazna selekcija.", "error");
                return;
            }

            if (!hasText) {
                if (getCheckValue("optConfirmWholeDoc")) {
                    const ok = await confirmInPanel("Nije selektovan tekst.<br/>Da li želite da preslovite <b>CEO dokument</b>?");
                    if (!ok) {
                        setStatus("Otkazano.", "neutral");
                        return;
                    }
                }
                range = context.document.body.getRange("Whole");
            }

            setStatus("Obrada u toku...", "info");

            const ooxml = range.getOoxml();
            await context.sync();

            // Provera da li je dokument prazan
            if (!ooxml.value || ooxml.value.length < 500) {
                range.load("text");
                await context.sync();
                if (!range.text.trim()) {
                    setStatus("Dokument je prazan.", "neutral");
                    return;
                }
            }

            const opts = getOoxmlOptionsFromUi();
            const result = convertOoxml(ooxml.value, opts);

            if (result.type === "Nema teksta") {
                setStatus("Nije pronađen tekst za obradu.", "neutral");
                return;
            }

            range.insertOoxml(result.xml, Word.InsertLocation.replace);
            await context.sync();

            const scope = hasText ? "Selekcija" : "Ceo dokument";
            const time = result.stats.timingMs.toFixed(0);

            setStatus(`Završeno: ${result.type} (${time}ms)`, "success");

            lastStatsTitle = `Statistika: ${result.type}`;
            lastStatsText = `Opseg: ${scope}\nPromenjeno čvorova: ${result.stats.textNodes}\nVreme: ${time}ms`;
            if (result.stats.bridges.links > 0) lastStatsText += `\nZaštićeno linkova: ${result.stats.bridges.links}`;
            if (result.stats.bridges.userTokens > 0) lastStatsText += `\nZaštićeno tvojih reči: ${result.stats.bridges.userTokens}`;

            refreshStats();
        });
    } catch (e) {
        console.error(e);
        setStatus("Greška: " + (e as Error).message, "error");
    }
}

async function runPreview() {
    setStatus("Generišem pregled...", "info");
    try {
        await Word.run(async (context) => {
            let range = context.document.getSelection();
            range.load("text");
            await context.sync();

            let textToPreview = range.text;
            let label = "Pregled selekcije";

            const hasText = textToPreview.trim().length > 0;
            const isJustWhitespace = textToPreview.length > 0 && !hasText;

            if (isJustWhitespace) {
                showModalInfo("Greška", "Selektovan je samo prazan prostor.");
                setStatus("Greška: Prazna selekcija.", "error");
                return;
            }

            if (!hasText) {
                const body = context.document.body;
                body.load("text");
                await context.sync();
                textToPreview = body.text.substring(0, 2000);
                label = "Pregled (Početak dokumenta)";

                if (!textToPreview.trim()) {
                    setStatus("Dokument je prazan.", "neutral");
                    return;
                }
            }

            const opts = getOoxmlOptionsFromUi();
            const dummyOoxml = `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${escapeXml(textToPreview)}</w:t></w:r></w:p></w:body></w:document>`;

            const result = convertOoxml(dummyOoxml, opts);

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(result.xml, "application/xml");
            const finalText = xmlDoc.getElementsByTagName("w:t")[0]?.textContent || "";

            if (textToPreview === finalText) {
                showModalInfo("Nema izmena", "Tekst je već u traženom pismu ili nema šta da se menja.");
                setStatus("Nema izmena.", "neutral");
            } else {
                showPreviewModal(label, textToPreview, finalText);
                setStatus(`Prikazan pregled (${result.type})`, "success");
            }
        });
    } catch (e) {
        setStatus("Greška pri pregledu: " + (e as Error).message, "error");
    }
}

// --- AUTOMATSKO PREBACIVANJE NA 'RUČNO' ---

function switchToCustomIfManual() {
    if (isApplyingProfile) return;

    if (currentProfile === 'custom') {
        saveSettings();
        return;
    }

    currentProfile = 'custom';
    const select = document.getElementById("profilePreset") as HTMLSelectElement;
    if (select) select.value = 'custom';

    saveSettings();
}

// --- TAGOVI ---

function setupTagEvents() {
    const input = document.getElementById("tagInput") as HTMLInputElement;
    const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;
    const container = document.getElementById("tagsContainer")!;

    // INICIJALNO STANJE: Dugme je onemogućeno
    addBtn.disabled = true;

    container.onclick = (e) => {
        if (e.target === container || e.target === document.getElementById("tagsList")) {
            input.focus();
        }
    };

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    });

    addBtn.onclick = () => {
        addTag();
        input.focus();
    };

    input.addEventListener("input", () => {
        const val = input.value.trim();
        const exists = customWordsSet.has(val) || presetWordsSet.has(val);
        addBtn.disabled = val.length === 0 || exists;
    });

    document.getElementById("clearCustomBtn")!.onclick = () => clearTags("custom");
    document.getElementById("clearPresetBtn")!.onclick = () => clearTags("preset");
    document.getElementById("clearAllBtn")!.onclick = () => clearTags("all");
}

function addTag() {
    const input = document.getElementById("tagInput") as HTMLInputElement;
    const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;
    const val = input.value.trim();
    if (!val) return;

    if (presetWordsSet.has(val)) {
        input.value = "";
        addBtn.disabled = true;
        return;
    }

    customWordsSet.add(val);
    input.value = "";
    addBtn.disabled = true;

    renderTags();
    switchToCustomIfManual();
    updateUiState();
}

function removeTag(word: string, type: "custom" | "preset") {
    if (type === "custom") {
        customWordsSet.delete(word);
    } else {
        presetWordsSet.delete(word);
    }
    renderTags();
    switchToCustomIfManual();
    updateUiState();
}

function clearTags(scope: "custom" | "preset" | "all") {
    if (scope === "custom" || scope === "all") customWordsSet.clear();
    if (scope === "preset" || scope === "all") presetWordsSet.clear();
    renderTags();
    switchToCustomIfManual();
    updateUiState();
}

function renderTags() {
    const container = document.getElementById("tagsList")!;
    container.innerHTML = "";

    const customSorted = Array.from(customWordsSet).sort();
    const presetSorted = Array.from(presetWordsSet).sort();

    customSorted.forEach(word => {
        const tag = createTagEl(word, "custom");
        container.appendChild(tag);
    });

    presetSorted.forEach(word => {
        const tag = createTagEl(word, "preset");
        container.appendChild(tag);
    });

    updateUiState();
}

function createTagEl(text: string, type: "custom" | "preset"): HTMLElement {
    const div = document.createElement("div");
    div.className = `tag ${type}`;
    div.innerHTML = `<span>${text}</span><span class="tag-remove" title="Ukloni">&times;</span>`;

    div.querySelector(".tag-remove")!.addEventListener("click", (e) => {
        e.stopPropagation();
        removeTag(text, type);
    });

    return div;
}

function updateUiState() {
    (document.getElementById("clearCustomBtn") as HTMLButtonElement).disabled = customWordsSet.size === 0;
    (document.getElementById("clearPresetBtn") as HTMLButtonElement).disabled = presetWordsSet.size === 0;
    (document.getElementById("clearAllBtn") as HTMLButtonElement).disabled = (customWordsSet.size === 0 && presetWordsSet.size === 0);
}

// --- PODEŠAVANJA ---

function changeProfile(profile: ProfilePreset) {
    currentProfile = profile;

    isApplyingProfile = true;

    if (profile === "custom") {
        presetWordsSet.clear();
    } else {
        const data = PRESETS[profile];
        if (data) {
            presetWordsSet = new Set(data.userWords);
            if (data.direction) setRadioValue("direction", data.direction);
            if (data.protectBrands !== undefined) setCheckValue("optProtectBrands", data.protectBrands);
            if (data.applySerbianQuotes !== undefined) setCheckValue("optSerbianQuotes", data.applySerbianQuotes);
            if (data.preserveCodeBlocks !== undefined) setCheckValue("optPreserveCodeBlocks", data.preserveCodeBlocks);
            if (data.protectRomans !== undefined) setCheckValue("optProtectRomans", data.protectRomans);
            if (data.setProofingLanguage !== undefined) setCheckValue("optSetProofingLanguage", data.setProofingLanguage);
            if (data.fixDoubleSpaces !== undefined) setCheckValue("optFixDoubleSpaces", data.fixDoubleSpaces);
            if (data.formatDates !== undefined) setCheckValue("optFormatDates", data.formatDates);
        }
    }

    renderTags();
    saveSettings();
    const displayName = PROFILE_NAMES[profile] || profile;
    setStatus(`Profil promenjen na: ${displayName}`, "info");

    isApplyingProfile = false;
}

function setupInputListeners() {
    const inputs = [
        "optProtectBrands", "optSerbianQuotes", "optPreserveCodeBlocks",
        "optProtectRomans", "optSetProofingLanguage",
        "optShowStats",
        "optFixDoubleSpaces", "optFormatDates",
        "dirAuto", "dirLatToCyr", "dirCyrToLat", "dirToAscii"
    ];

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("change", () => {
                if (!isApplyingProfile) {
                    switchToCustomIfManual();
                } else {
                    saveSettings();
                }

                if (id === "optShowStats") refreshStats();
            });
        }
    });
}

function getSettingsFromUi(): UiSettings {
    return {
        schemaVersion: 2,
        profile: (document.getElementById("profilePreset") as HTMLSelectElement).value as ProfilePreset,
        userWordsCustom: Array.from(customWordsSet),
        protectBrands: getCheckValue("optProtectBrands"),
        applySerbianQuotes: getCheckValue("optSerbianQuotes"),
        preserveCodeBlocks: getCheckValue("optPreserveCodeBlocks"),
        setProofingLanguage: getCheckValue("optSetProofingLanguage"),
        protectRomans: true, // HARDCODED (nema u UI)
        fixDoubleSpaces: getCheckValue("optFixDoubleSpaces"),
        formatDates: getCheckValue("optFormatDates"),
        confirmWholeDoc: true, // HARDCODED
        showStats: getCheckValue("optShowStats"),
        direction: getRadioValue("direction") as DirectionUi
    };
}

function applySettingsToUi(s: UiSettings) {
    (document.getElementById("profilePreset") as HTMLSelectElement).value = s.profile;
    setCheckValue("optProtectBrands", s.protectBrands);
    setCheckValue("optSerbianQuotes", s.applySerbianQuotes);
    setCheckValue("optPreserveCodeBlocks", s.preserveCodeBlocks);
    setCheckValue("optSetProofingLanguage", s.setProofingLanguage);
    setCheckValue("optShowStats", s.showStats);
    setCheckValue("optFixDoubleSpaces", s.fixDoubleSpaces);
    setCheckValue("optFormatDates", s.formatDates);
    setRadioValue("direction", s.direction);
}

function updateResetButtonState() {
    const current = getSettingsFromUi();

    const def = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    const curCopy = JSON.parse(JSON.stringify(current));

    curCopy.userWordsCustom = [];
    def.userWordsCustom = [];

    // Obe strane moraju imati iste hardkodovane vrednosti
    curCopy.confirmWholeDoc = true;
    def.confirmWholeDoc = true;
    curCopy.protectRomans = true;
    def.protectRomans = true;

    const isSame = JSON.stringify(curCopy) === JSON.stringify(def);

    const btn = document.getElementById("resetBtn") as HTMLButtonElement;
    if (btn) btn.disabled = isSame;
}

function saveSettings() {
    const s = getSettingsFromUi();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    updateResetButtonState();
}

function loadSettings(): UiSettings | null {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (parsed.schemaVersion === 2) return parsed;
        return null;
    } catch {
        return null;
    }
}

function resetSettings() {
    const currentWords = Array.from(customWordsSet);
    const newSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    newSettings.userWordsCustom = currentWords;

    isApplyingProfile = true;
    applySettingsToUi(newSettings);
    changeProfile("custom");
    isApplyingProfile = false;

    presetWordsSet.clear();
    renderTags();

    saveSettings();
    setStatus("Podešavanja vraćena (reči sačuvane).", "success");
}

function getOoxmlOptionsFromUi(): OoxmlOptions & { showStats: boolean } {
    const s = getSettingsFromUi();

    let dir: OoxmlOptions["direction"] = "auto";
    if (s.direction === "lat-to-cyr") dir = "lat-to-cyr";
    if (s.direction === "cyr-to-lat") dir = "cyr-to-lat";
    if (s.direction === "to-ascii") dir = "to-ascii";

    return {
        direction: dir,
        protectBrands: s.protectBrands,
        applySerbianQuotes: s.applySerbianQuotes,
        preserveCodeBlocks: s.preserveCodeBlocks,
        setProofingLanguage: false,
        fixDoubleSpaces: s.fixDoubleSpaces,
        formatDates: s.formatDates,
        protectRomans: true,
        userProtected: [...Array.from(customWordsSet), ...Array.from(presetWordsSet)],
        // @ts-ignore
        showStats: s.showStats
    };
}

// --- IMPORT / EXPORT ---

function exportSettingsAsDownload() {
    saveSettings();
    const s = getSettingsFromUi();
    const json = JSON.stringify(s, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "serbian-transliterator-settings.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleFileImport(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const json = evt.target?.result as string;
            const parsed = JSON.parse(json);

            if (typeof parsed.profile !== "string" || !Array.isArray(parsed.userWordsCustom)) {
                throw new Error("Invalid format");
            }

            const newSettings: UiSettings = { ...DEFAULT_SETTINGS, ...parsed, schemaVersion: 2 };

            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            initUi();
            setStatus("Podešavanja uspešno učitana.", "success");
        } catch (err) {
            setStatus("Greška: Neispravan fajl.", "error");
        }
        input.value = "";
    };
    reader.readAsText(input.files[0]);
}

// --- HELPERS ---

async function runWithUiLock(fn: () => Promise<void>) {
    const runBtn = document.getElementById("runBtn") as HTMLButtonElement;
    const previewBtn = document.getElementById("previewBtn") as HTMLButtonElement;

    runBtn.disabled = true;
    previewBtn.disabled = true;
    document.body.style.cursor = "wait";

    try {
        await fn();
    } finally {
        runBtn.disabled = false;
        previewBtn.disabled = false;
        document.body.style.cursor = "default";
    }
}

function setStatus(msg: string, type: "info" | "success" | "error" | "neutral") {
    const el = document.getElementById("msg")!;
    el.innerText = msg;
    el.style.color = type === "error" ? "var(--error-color)" : (type === "success" ? "var(--success-color)" : "var(--text-color)");
}

function refreshStats() {
    const box = document.getElementById("statsBox")!;
    const show = getCheckValue("optShowStats");

    box.style.display = show ? "block" : "none";
    if (show) {
        document.getElementById("statsTitle")!.innerText = lastStatsTitle;
        document.getElementById("statsText")!.innerText = lastStatsText;
    }
}

function getCheckValue(id: string): boolean {
    const el = document.getElementById(id) as HTMLInputElement;
    return el && el.checked;
}

function setCheckValue(id: string, val: boolean) {
    const el = document.getElementById(id) as HTMLInputElement;
    if (el) el.checked = val;
}

function getRadioValue(name: string): string {
    const els = document.getElementsByName(name);
    for (let i = 0; i < els.length; i++) {
        if ((els[i] as HTMLInputElement).checked) return (els[i] as HTMLInputElement).value;
    }
    return "";
}

function setRadioValue(name: string, val: string) {
    const els = document.getElementsByName(name);
    for (let i = 0; i < els.length; i++) {
        if ((els[i] as HTMLInputElement).value === val) (els[i] as HTMLInputElement).checked = true;
    }
}

function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
        return c;
    });
}

function escapeHtml(unsafe: string) {
    return escapeXml(unsafe);
}

// --- MODAL SYSTEM ---

let modalPromiseResolver: ((val: boolean) => void) | null = null;

function confirmInPanel(htmlMsg: string): Promise<boolean> {
    const overlay = document.getElementById("modalOverlay")!;
    const title = document.getElementById("modalTitle")!;
    const text = document.getElementById("modalText")!;
    const input = document.getElementById("modalInput")!;
    const okBtn = document.getElementById("modalOk")!;

    title.innerText = "Potvrda";
    text.innerHTML = htmlMsg;
    input.style.display = "none";

    // Za potvrdu nam treba OK dugme
    okBtn.style.display = "inline-flex";
    okBtn.innerText = "OK";

    document.getElementById("modal")!.classList.remove("wide");
    overlay.style.display = "flex";

    return new Promise((resolve) => {
        modalPromiseResolver = resolve;
    });
}

function showModalInfo(titleStr: string, msg: string) {
    const overlay = document.getElementById("modalOverlay")!;
    const title = document.getElementById("modalTitle")!;
    const text = document.getElementById("modalText")!;
    const input = document.getElementById("modalInput")!;
    const okBtn = document.getElementById("modalOk")!;
    const cancelBtn = document.getElementById("modalCancel")!;

    title.innerText = titleStr;
    text.innerHTML = msg;
    input.style.display = "none";

    // Za info nam treba SAMO Zatvori dugme (plavo)
    okBtn.style.display = "none";

    // Menjamo stil "Cancel" dugmeta da izgleda kao "Zatvori" (plavo)
    cancelBtn.innerText = "Zatvori";
    cancelBtn.style.backgroundColor = "var(--primary-color)";
    cancelBtn.style.color = "white";
    cancelBtn.style.border = "none";

    document.getElementById("modal")!.classList.remove("wide");
    overlay.style.display = "flex";

    modalPromiseResolver = null;
}

function showPreviewModal(titleStr: string, original: string, converted: string) {
    const overlay = document.getElementById("modalOverlay")!;
    const title = document.getElementById("modalTitle")!;
    const text = document.getElementById("modalText")!;
    const input = document.getElementById("modalInput")!;
    const okBtn = document.getElementById("modalOk")!;
    const cancelBtn = document.getElementById("modalCancel")!;

    title.innerText = titleStr;
    input.style.display = "none";
    document.getElementById("modal")!.classList.add("wide");

    text.innerHTML = generateDiffHtml(original, converted);

    // Za preview takođe samo plavo "Zatvori"
    okBtn.style.display = "none";
    cancelBtn.innerText = "Zatvori";
    cancelBtn.style.backgroundColor = "var(--primary-color)";
    cancelBtn.style.color = "white";
    cancelBtn.style.border = "none";

    overlay.style.display = "flex";
    modalPromiseResolver = null;
}

function handleModalOk() {
    document.getElementById("modalOverlay")!.style.display = "none";

    // Resetuj stil Cancel dugmeta za sledeći put
    resetModalButtons();

    if (modalPromiseResolver) modalPromiseResolver(true);
}

function closeModal() {
    document.getElementById("modalOverlay")!.style.display = "none";

    // Resetuj stil Cancel dugmeta za sledeći put
    resetModalButtons();

    if (modalPromiseResolver) modalPromiseResolver(false);
}

function resetModalButtons() {
    const cancelBtn = document.getElementById("modalCancel")!;
    const okBtn = document.getElementById("modalOk")!;

    // Vrati Cancel na default (sivo, "Otkaži")
    cancelBtn.innerText = "Otkaži";
    cancelBtn.style.backgroundColor = ""; // Vraća na CSS default
    cancelBtn.style.color = "";
    cancelBtn.style.border = "";

    // Vrati OK dugme da bude vidljivo
    okBtn.style.display = "inline-flex";
}

function generateDiffHtml(oldText: string, newText: string): string {
    if (oldText === newText) {
        return `<div class="preview-single-pane" style="text-align:center; padding:20px;">Nema izmena u tekstu.</div>`;
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
            html += `<span class="diff-changed" title="Original: ${escapeHtml(o)}">${escapeHtml(n)}</span>`;
        }
    }

    return `<div class="preview-single-pane">${html}</div>`;
}