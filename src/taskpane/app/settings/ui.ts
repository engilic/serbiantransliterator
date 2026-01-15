// src/taskpane/app/settings/ui.ts
/* global document, window, Blob, URL, FileReader */

import type { UiSettings, ProfilePreset } from "../types";
import { state } from "../state";
import { asCurlyProtectionUi } from "../word/curlyProtection";

import { setStatus, refreshStats } from "../status";
import { invalidatePreviewCache } from "../preview/cache";
import { confirmInPanel } from "../modal/modal";
import { unsafeHtml } from "../../../shared/safeHtml";

import { runWithUiLock } from "../uiLock";
import { runSmart } from "../word/apply";
import { runPreview } from "../preview/runPreview";

import { getSettingsFromUi } from "./getters";
import { loadSettingsFromStorage, saveSettingsToStorage } from "./store";
import { DEFAULT_SETTINGS, PROFILE_NAMES, PRESETS, SETTINGS_KEY } from "./defaults";

import { renderTags, setupTagEvents } from "./tags";

import { initAdvancedSettingsToggle } from "./advanced";

/* =========================
   Public: initUi()
   ========================= */

export function initUi() {
    const settings = loadSettingsFromStorage(SETTINGS_KEY, DEFAULT_SETTINGS) || DEFAULT_SETTINGS;

    state.customWordsSet = new Set(settings.userWordsCustom);
    state.presetWordsSet =
        settings.profile !== "custom" && PRESETS[settings.profile]
            ? new Set(PRESETS[settings.profile]!.userWords)
            : new Set();

    state.currentProfile = settings.profile;

    // Tag events (callbacks) – mora pre korisničke interakcije
    setupTagEvents({
        invalidatePreviewCache,
        switchToCustomIfManual,
        saveSettings,
        updateResetButtonState,
    });

    state.isApplyingProfile = true;
    applySettingsToUi(settings);
    state.isApplyingProfile = false;
    initAdvancedSettingsToggle();

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
    saveSettingsToStorage(SETTINGS_KEY, s);
    updateResetButtonState();
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

    // NEW:
    const curlySel = document.getElementById("optCurlyProtection") as HTMLSelectElement | null;
    if (curlySel) curlySel.value = s.curlyProtection;

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

        // NEW:
        "curlyProtection",

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

            // NEW: uvek postavi curlyProtection na preset ili default
            const curlySel = document.getElementById("optCurlyProtection") as HTMLSelectElement | null;
            if (curlySel) {
                curlySel.value = asCurlyProtectionUi(data.curlyProtection ?? DEFAULT_SETTINGS.curlyProtection);
            }
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

        // NEW (select):
        "optCurlyProtection",

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
        const el = document.getElementById(id) as (HTMLInputElement | HTMLSelectElement | null);
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
            saveSettingsToStorage(SETTINGS_KEY, newSettings);

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