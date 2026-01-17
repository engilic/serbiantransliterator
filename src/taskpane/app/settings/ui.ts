// src/taskpane/app/settings/ui.ts
/* global document, Blob, URL, FileReader */

import type { UiSettings, ProfilePreset } from "../types";
import { state } from "../state";
import { asCurlyProtectionUi } from "../word/curlyProtection";

import { setStatus, refreshStats } from "../status";
import { invalidatePreviewCache } from "../preview/cache";
import { confirmInPanel } from "../modal/modal";
import { unsafeHtml } from "../../../shared/safeHtml";
import { t } from "../../../shared/i18n";

import { runWithUiLock } from "../uiLock";
import { runSmart } from "../word/apply";
import { runPreview } from "../preview/runPreview";

import { getSettingsFromUi } from "./getters";
import { loadSettingsFromStorage, saveSettingsToStorage } from "./store";
import { DEFAULT_SETTINGS, PRESETS, SETTINGS_KEY } from "./defaults";

import { renderTags, setupTagEvents } from "./tags";
import { initAdvancedSettingsToggle } from "./advanced";

import { initUiI18n, getUiLanguagePreference, setUiLanguagePreference, asUiLangPref } from "../i18n/uiI18n";
import { checkSelectionAndUpdateButtons } from "../selection";

export function initUi() {
    // 1) Init i18n (DEFAULT: sr, unless user selects otherwise)
    initUiI18n();

    // 2) Language picker init (defensive if DOM doesn't have it)
    initLanguagePicker();

    const settings = loadSettingsFromStorage(SETTINGS_KEY, DEFAULT_SETTINGS) || DEFAULT_SETTINGS;

    state.customWordsSet = new Set(settings.userWordsCustom);
    state.presetWordsSet =
        settings.profile !== "custom" && PRESETS[settings.profile]
            ? new Set(PRESETS[settings.profile]!.userWords)
            : new Set();

    state.currentProfile = settings.profile;

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

    bindButtons();
    setupInputListeners();

    (document.getElementById("profilePreset") as HTMLSelectElement).onchange = (e) => {
        const val = (e.target as HTMLSelectElement).value as ProfilePreset;
        changeProfile(val);
    };

    refreshStats();
    setStatus(t("status_ready"), "neutral");
}

function initLanguagePicker() {
    const sel = document.getElementById("optUiLanguage") as HTMLSelectElement | null;
    if (!sel) return;

    sel.value = getUiLanguagePreference();

    sel.onchange = () => {
        const pref = asUiLangPref(sel.value);
        setUiLanguagePreference(pref);

        // Update dynamic UI (best-effort):
        // - run/preview button labels depend on t()
        // - tags tooltips depend on t()
        // - stats box fallback depends on t()
        renderTags();
        refreshStats();
        setStatus(t("status_ready"), "neutral");
        try {
            void checkSelectionAndUpdateButtons();
        } catch {
            // best-effort
        }
    };
}

function bindButtons() {
    (document.getElementById("runBtn") as HTMLButtonElement).onclick = () => runWithUiLock(runSmart);
    (document.getElementById("previewBtn") as HTMLButtonElement).onclick = () => runWithUiLock(runPreview);
    (document.getElementById("exportBtn") as HTMLButtonElement).onclick = exportSettingsAsDownload;

    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    (document.getElementById("importBtn") as HTMLButtonElement).onclick = () => fileInput.click();
    fileInput.onchange = handleFileImport;

    (document.getElementById("resetBtn") as HTMLButtonElement).onclick = async () => {
        const ok = await confirmInPanel(unsafeHtml(t("msg_reset_confirm")));
        if (ok) resetSettings();
    };
}

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
    setStatus(t("status_settings_saved"), "success");
}

function applySettingsToUi(s: UiSettings) {
    (document.getElementById("profilePreset") as HTMLSelectElement).value = s.profile;

    setCheckValue("optConfirmWholeDoc", s.confirmWholeDoc);
    setCheckValue("optProtectBrands", s.protectBrands);
    setCheckValue("optSerbianQuotes", s.applySerbianQuotes);
    setCheckValue("optPreserveCodeBlocks", s.preserveCodeBlocks);
    setCheckValue("optProtectRomans", s.protectRomans);
    setCheckValue("optSetProofingLanguage", s.setProofingLanguage);

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
        "curlyProtection",
        "fixDoubleSpaces",
        "formatDates",
        "showStats",
    ];

    const mismatches = keys.filter((k) => current[k] !== DEFAULT_SETTINGS[k]);
    const btn = document.getElementById("resetBtn") as HTMLButtonElement | null;
    if (btn) btn.disabled = mismatches.length === 0;
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
            if (data.applySerbianQuotes !== undefined)
                setCheckValue("optSerbianQuotes", data.applySerbianQuotes);
            if (data.preserveCodeBlocks !== undefined)
                setCheckValue("optPreserveCodeBlocks", data.preserveCodeBlocks);
            if (data.protectRomans !== undefined) setCheckValue("optProtectRomans", data.protectRomans);
            if (data.setProofingLanguage !== undefined)
                setCheckValue("optSetProofingLanguage", data.setProofingLanguage);
            if (data.fixDoubleSpaces !== undefined) setCheckValue("optFixDoubleSpaces", data.fixDoubleSpaces);
            if (data.formatDates !== undefined) setCheckValue("optFormatDates", data.formatDates);
            if (data.confirmWholeDoc !== undefined) setCheckValue("optConfirmWholeDoc", data.confirmWholeDoc);

            const curlySel = document.getElementById("optCurlyProtection") as HTMLSelectElement | null;
            if (curlySel) {
                curlySel.value = asCurlyProtectionUi(
                    data.curlyProtection ?? DEFAULT_SETTINGS.curlyProtection
                );
            }
        }
    }

    renderTags();
    saveSettings();
    invalidatePreviewCache();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileKey = `profile_${profile}` as any;
    const displayName = t(profileKey) !== profileKey ? t(profileKey) : profile;

    setStatus(t("status_profile_changed", displayName), "info");
    state.isApplyingProfile = false;
}

function setupInputListeners() {
    const ids = [
        "optConfirmWholeDoc",
        "optProtectBrands",
        "optSerbianQuotes",
        "optPreserveCodeBlocks",
        "optProtectRomans",
        "optSetProofingLanguage",
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
        const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
        if (!el) return;
        el.onchange = () => {
            if (id !== "optShowStats") invalidatePreviewCache();
            if (!state.isApplyingProfile) switchToCustomIfManual();
            else saveSettings();
            if (id === "optShowStats") refreshStats();
        };
    });
}

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
            if (typeof parsed.profile !== "string" || !Array.isArray(parsed.userWordsCustom))
                throw new Error();

            const newSettings: UiSettings = { ...DEFAULT_SETTINGS, ...parsed, schemaVersion: 2 };
            saveSettingsToStorage(SETTINGS_KEY, newSettings);

            initUi();
            invalidatePreviewCache();
            setStatus(t("status_settings_loaded"), "success");
        } catch {
            setStatus(t("status_settings_error"), "error");
        }
        input.value = "";
    };
    reader.readAsText(input.files[0]);
}

function setCheckValue(id: string, val: boolean) {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.checked = val;
}

function setRadioValue(name: string, val: string) {
    const els = document.getElementsByName(name);
    for (let i = 0; i < els.length; i++) {
        const el = els[i] as HTMLInputElement;
        if (el.value === val) el.checked = true;
    }
}
