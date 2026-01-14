// src/taskpane/app/settings/ui.ts
/* global document, window, Blob, URL, FileReader */

import type { UiSettings, ProfilePreset } from "../types";
import { state } from "../state";

import { setStatus, refreshStats } from "../status";
import { invalidatePreviewCache } from "../preview/cache";
import { confirmInPanel } from "../modal/modal";
import { unsafeHtml, escapeHtml } from "../../../shared/safeHtml";

import { runWithUiLock } from "../uiLock";
import { runSmart } from "../word/apply";
import { runPreview } from "../preview/runPreview";

import { getSettingsFromUi } from "./getters";

/* =========================
   SETTINGS CONSTANTS
   ========================= */

const SETTINGS_KEY = "serbiantransliterator.settings.v2";

const DEFAULT_SETTINGS: UiSettings = {
    schemaVersion: 2,

    profile: "custom",
    userWordsCustom: [],

    confirmWholeDoc: true,
    includeHeadersFooters: false,
    includeFootnotes: false,
    includeEndnotes: false,

    direction: "auto",

    protectBrands: true,
    preserveCodeBlocks: true,
    protectRomans: true,

    applySerbianQuotes: true,
    fixDoubleSpaces: true,
    formatDates: true,

    setProofingLanguage: true,

    showStats: false,
};

const PROFILE_NAMES: Record<string, string> = {
    custom: "Ručno",
    it: "IT / Tehnologija",
    finance: "Finansije / Bankarstvo",
    medical: "Medicina / Farmacija",
    legal: "Pravo / Administracija",
    marketing: "Marketing / Društvene mreže",
    journalism: "Novinarstvo / Mediji",
};

const PRESETS: Record<string, Partial<UiSettings> & { userWords: string[] }> = {
    it: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: false,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: false,
        formatDates: true,
        confirmWholeDoc: true,
        userWords: [
            "Git",
            "GitHub",
            "GitLab",
            "Azure",
            "AWS",
            "GCP",
            "DevOps",
            "Docker",
            "Kubernetes",
            "CI/CD",
            "YAML",
            "REST",
            "GraphQL",
            "PowerShell",
            "VS Code",
            "Visual Studio",
            "Windows Server",
            "Linux",
            "SerbianTransliterator",
            "Python",
            "JavaScript",
            "Typescript",
            "Node.js",
            "React",
            "Angular",
            "Vue",
            "Frontend",
            "Backend",
            "Fullstack",
            "Database",
            "Cache",
            "Cookie",
            "Token",
            "API",
            "Endpoint",
        ],
    },
    finance: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: true,
        confirmWholeDoc: true,
        userWords: [
            "SWIFT",
            "IBAN",
            "EUR",
            "USD",
            "RSD",
            "CHF",
            "GBP",
            "MasterCard",
            "Visa",
            "PayPal",
            "Intesa",
            "Raiffeisen",
            "OTP",
            "NLB",
            "AIK",
            "Erste",
            "UniCredit",
            "Western Union",
            "E-banking",
            "M-banking",
            "Leasing",
            "Factoring",
            "Equity",
            "Forex",
        ],
    },
    medical: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: false,
        formatDates: true,
        confirmWholeDoc: true,
        userWords: [
            "mg",
            "ml",
            "kg",
            "Covid",
            "SARS",
            "Hemofarm",
            "Galenika",
            "Pfizer",
            "Actavis",
            "Alkaloid",
            "Bayer",
            "Roche",
            "Stada",
            "Anamnesis",
            "Diagnosis",
            "Therapia",
            "CT",
            "MRI",
            "EKG",
            "EEG",
            "In vitro",
            "In vivo",
        ],
    },
    marketing: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: false,
        confirmWholeDoc: true,
        userWords: [
            "Facebook",
            "Instagram",
            "LinkedIn",
            "TikTok",
            "Twitter",
            "X",
            "YouTube",
            "Google",
            "SEO",
            "PR",
            "Copywriter",
            "Content",
            "Ads",
            "Influencer",
            "Giveaway",
            "Hashtag",
            "Story",
            "Reel",
            "Post",
            "Follow",
            "Like",
            "Share",
            "Subscribe",
            "Timeline",
            "Feed",
        ],
    },
    legal: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: true,
        confirmWholeDoc: true,
        userWords: [
            "Ustav Republike Srbije",
            "Zakon o obligacionim odnosima",
            "Zakon o radu",
            "Ministarstvo pravde",
            "Privredni sud",
            "Advokatska komora Srbije",
            "Službeni glasnik",
            "Bona fide",
            "De facto",
            "Ex officio",
            "Copyright",
            "Trademark",
            "Disclaimer",
            "Policy",
            "Terms",
            "Conditions",
            "GDPR",
        ],
    },
    journalism: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: true,
        confirmWholeDoc: true,
        userWords: [
            "Reuters",
            "Associated Press",
            "BBC",
            "CNN",
            "Euronews",
            "N1",
            "RTS",
            "Tanjug",
            "NBA",
            "UEFA",
            "FIFA",
            "FIBA",
            "ATP",
            "WTA",
            "Olimpijske igre",
        ],
    },
};

/* =========================
   Public: initUi()
   ========================= */

export function initUi() {
    const settings = loadSettings() || DEFAULT_SETTINGS;

    state.customWordsSet = new Set(settings.userWordsCustom);
    state.presetWordsSet =
        settings.profile !== "custom" && PRESETS[settings.profile]
            ? new Set(PRESETS[settings.profile]!.userWords)
            : new Set();

    state.currentProfile = settings.profile;

    state.isApplyingProfile = true;
    applySettingsToUi(settings);
    state.isApplyingProfile = false;

    renderTags();
    updateResetButtonState();

    (document.getElementById("runBtn") as HTMLButtonElement).onclick = () => runWithUiLock(runSmart);
    (document.getElementById("previewBtn") as HTMLButtonElement).onclick = () => runWithUiLock(runPreview);

    (document.getElementById("exportBtn") as HTMLButtonElement).onclick = exportSettingsAsDownload;
    (document.getElementById("importBtn") as HTMLButtonElement).onclick = () =>
        (document.getElementById("fileInput") as HTMLInputElement).click();
    (document.getElementById("fileInput") as HTMLInputElement).onchange = handleFileImport;

    (document.getElementById("resetBtn") as HTMLButtonElement).onclick = async () => {
        const ok = await confirmInPanel(
            unsafeHtml(
                "Ovo će vratiti opcije na fabričke vrednosti.<br><br>Vaše zaštićene reči <b>neće</b> biti obrisane.<br><br>Da li želite da nastavite?"
            )
        );
        if (ok) resetSettings();
    };

    setupTagEvents();
    setupInputListeners();

    (document.getElementById("profilePreset") as HTMLSelectElement).onchange = (e) => {
        const val = (e.target as HTMLSelectElement).value as ProfilePreset;
        changeProfile(val);
    };

    refreshStats();
    setStatus("Spreman za rad.", "neutral");
}

/* =========================
   Settings load/save
   ========================= */

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
        const merged: UiSettings = { ...DEFAULT_SETTINGS, ...parsed, schemaVersion: 2 };
        return merged.schemaVersion === 2 ? merged : null;
    } catch {
        return null;
    }
}

function resetSettings() {
    const currentWords = Array.from(state.customWordsSet);

    const newSettings: UiSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    newSettings.userWordsCustom = currentWords;
    newSettings.profile = "custom";

    state.isApplyingProfile = true;
    applySettingsToUi(newSettings);
    changeProfile("custom");
    state.isApplyingProfile = false;

    state.presetWordsSet.clear();
    renderTags();

    saveSettings();
    refreshStats();
    updateResetButtonState();
    setStatus("Podešavanja vraćena (reči sačuvane).", "success");
}

/* =========================
   Apply settings to UI
   ========================= */

function applySettingsToUi(s: UiSettings) {
    (document.getElementById("profilePreset") as HTMLSelectElement).value = s.profile;

    setCheckValue("optConfirmWholeDoc", s.confirmWholeDoc);
    setCheckValue("optProtectBrands", s.protectBrands);
    setCheckValue("optSerbianQuotes", s.applySerbianQuotes);
    setCheckValue("optPreserveCodeBlocks", s.preserveCodeBlocks);
    setCheckValue("optProtectRomans", s.protectRomans);
    setCheckValue("optSetProofingLanguage", s.setProofingLanguage);

    setCheckValue("optShowStats", s.showStats);
    setCheckValue("optFixDoubleSpaces", s.fixDoubleSpaces);
    setCheckValue("optFormatDates", s.formatDates);

    setRadioValue("direction", s.direction);

    setCheckValue("optIncludeHeadersFooters", s.includeHeadersFooters);
    setCheckValue("optIncludeFootnotes", s.includeFootnotes);
    setCheckValue("optIncludeEndnotes", s.includeEndnotes);

    refreshStats();
    updateResetButtonState();
}

function updateResetButtonState() {
    const current = getSettingsFromUi();

    const keys: Array<keyof UiSettings> = [
        "profile",
        "direction",
        "confirmWholeDoc",
        "includeHeadersFooters",
        "includeFootnotes",
        "includeEndnotes",
        "protectBrands",
        "applySerbianQuotes",
        "preserveCodeBlocks",
        "protectRomans",
        "setProofingLanguage",
        "fixDoubleSpaces",
        "formatDates",
        "showStats",
    ];

    const mismatches = keys.filter((k) => current[k] !== DEFAULT_SETTINGS[k]);
    const isSame = mismatches.length === 0;

    const btn = document.getElementById("resetBtn") as HTMLButtonElement | null;
    if (!btn) return;

    btn.disabled = isSame;
}

function switchToCustomIfManual() {
    if (state.isApplyingProfile) return;

    if (state.currentProfile === "custom") {
        saveSettings();
        return;
    }

    state.currentProfile = "custom";
    const select = document.getElementById("profilePreset") as HTMLSelectElement;
    if (select) select.value = "custom";

    saveSettings();
}

/* =========================
   Profile changes
   ========================= */

function changeProfile(profile: ProfilePreset) {
    state.currentProfile = profile;
    state.isApplyingProfile = true;

    if (profile === "custom") {
        state.presetWordsSet.clear();
    } else {
        const data = PRESETS[profile];
        if (data) {
            state.presetWordsSet = new Set(data.userWords);

            if (data.direction) setRadioValue("direction", data.direction);
            if (data.protectBrands !== undefined) setCheckValue("optProtectBrands", data.protectBrands);
            if (data.applySerbianQuotes !== undefined) setCheckValue("optSerbianQuotes", data.applySerbianQuotes);
            if (data.preserveCodeBlocks !== undefined) setCheckValue("optPreserveCodeBlocks", data.preserveCodeBlocks);
            if (data.protectRomans !== undefined) setCheckValue("optProtectRomans", data.protectRomans);
            if (data.setProofingLanguage !== undefined) setCheckValue("optSetProofingLanguage", data.setProofingLanguage);
            if (data.fixDoubleSpaces !== undefined) setCheckValue("optFixDoubleSpaces", data.fixDoubleSpaces);
            if (data.formatDates !== undefined) setCheckValue("optFormatDates", data.formatDates);
            if (data.confirmWholeDoc !== undefined) setCheckValue("optConfirmWholeDoc", data.confirmWholeDoc);
        }
    }

    renderTags();
    saveSettings();
    invalidatePreviewCache();

    const displayName = PROFILE_NAMES[profile] || profile;
    setStatus(`Profil promenjen na: ${displayName}`, "info");

    state.isApplyingProfile = false;
}

/* =========================
   Input listeners
   ========================= */

function setupInputListeners() {
    const ids = [
        "optConfirmWholeDoc",
        "optProtectBrands",
        "optSerbianQuotes",
        "optPreserveCodeBlocks",
        "optProtectRomans",
        "optSetProofingLanguage",
        "optShowStats",
        "optFixDoubleSpaces",
        "optFormatDates",
        "optIncludeHeadersFooters",
        "optIncludeFootnotes",
        "optIncludeEndnotes",
        "dirAuto",
        "dirLatToCyr",
        "dirCyrToLat",
        "dirToAscii",
    ];

    ids.forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement | null;
        if (!el) return;

        el.onchange = () => {
            const affectsConversion = id !== "optShowStats";
            if (affectsConversion) invalidatePreviewCache();

            if (!state.isApplyingProfile) switchToCustomIfManual();
            else saveSettings();

            if (id === "optShowStats") refreshStats();
        };
    });
}

/* =========================
   Import / Export settings
   ========================= */

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
    reader.onload = (_evt) => {
        try {
            const json = reader.result as string;
            const parsed = JSON.parse(json);

            if (typeof parsed.profile !== "string" || !Array.isArray(parsed.userWordsCustom)) {
                throw new Error("Invalid format");
            }

            const newSettings: UiSettings = { ...DEFAULT_SETTINGS, ...parsed, schemaVersion: 2 };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

            initUi();
            invalidatePreviewCache();
            setStatus("Podešavanja uspešno učitana.", "success");
        } catch {
            setStatus("Greška: Neispravan fajl.", "error");
        }
        input.value = "";
    };
    reader.readAsText(input.files[0]);
}

/* =========================
   Tags UI
   ========================= */

function setupTagEvents() {
    const input = document.getElementById("tagInput") as HTMLInputElement;
    const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;
    const container = document.getElementById("tagsContainer") as HTMLDivElement;
    const tagsList = document.getElementById("tagsList") as HTMLDivElement;

    addBtn.disabled = true;

    container.onclick = (e) => {
        if (e.target === container || e.target === tagsList) input.focus();
    };

    input.onkeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    };

    addBtn.onclick = () => {
        addTag();
        input.focus();
    };

    input.oninput = () => {
        const val = input.value.trim();
        const exists = state.customWordsSet.has(val) || state.presetWordsSet.has(val);
        addBtn.disabled = val.length === 0 || exists;
    };

    (document.getElementById("clearCustomBtn") as HTMLButtonElement).onclick = () => clearTags("custom");
    (document.getElementById("clearPresetBtn") as HTMLButtonElement).onclick = () => clearTags("preset");
    (document.getElementById("clearAllBtn") as HTMLButtonElement).onclick = () => clearTags("all");
}

function addTag() {
    const input = document.getElementById("tagInput") as HTMLInputElement;
    const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;
    const val = input.value.trim();
    if (!val) return;

    if (state.presetWordsSet.has(val)) {
        input.value = "";
        addBtn.disabled = true;
        return;
    }

    state.customWordsSet.add(val);
    invalidatePreviewCache();
    input.value = "";
    addBtn.disabled = true;

    renderTags();
    switchToCustomIfManual();
    updateTagsButtonsState();
}

function removeTag(word: string, type: "custom" | "preset") {
    if (type === "custom") state.customWordsSet.delete(word);
    else state.presetWordsSet.delete(word);

    invalidatePreviewCache();

    renderTags();
    switchToCustomIfManual();
    updateTagsButtonsState();
}

function clearTags(scope: "custom" | "preset" | "all") {
    if (scope === "custom" || scope === "all") state.customWordsSet.clear();
    if (scope === "preset" || scope === "all") state.presetWordsSet.clear();

    invalidatePreviewCache();

    renderTags();
    switchToCustomIfManual();
    updateTagsButtonsState();
}

function renderTags() {
    const container = document.getElementById("tagsList") as HTMLDivElement;
    container.innerHTML = "";

    const customSorted = Array.from(state.customWordsSet).sort();
    const presetSorted = Array.from(state.presetWordsSet).sort();

    customSorted.forEach((word) => container.appendChild(createTagEl(word, "custom")));
    presetSorted.forEach((word) => container.appendChild(createTagEl(word, "preset")));

    updateTagsButtonsState();
}

function createTagEl(text: string, type: "custom" | "preset"): HTMLElement {
    const div = document.createElement("div");
    div.className = `tag ${type}`;
    div.innerHTML = `<span>${escapeHtml(text)}</span><span class="tag-remove" title="Ukloni">&times;</span>`;

    div.querySelector(".tag-remove")!.addEventListener("click", (e) => {
        e.stopPropagation();
        removeTag(text, type);
    });

    return div;
}

function updateTagsButtonsState() {
    (document.getElementById("clearCustomBtn") as HTMLButtonElement).disabled = state.customWordsSet.size === 0;
    (document.getElementById("clearPresetBtn") as HTMLButtonElement).disabled = state.presetWordsSet.size === 0;
    (document.getElementById("clearAllBtn") as HTMLButtonElement).disabled =
        state.customWordsSet.size === 0 && state.presetWordsSet.size === 0;
}

/* =========================
   Basic UI helpers
   ========================= */

function setCheckValue(id: string, val: boolean) {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.checked = val;
}

function setRadioValue(name: string, val: string) {
    const els = document.getElementsByName(name);
    for (let i = 0; i < els.length; i++) {
        if ((els[i] as HTMLInputElement).value === val) (els[i] as HTMLInputElement).checked = true;
    }
}