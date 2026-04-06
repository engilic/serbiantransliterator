// src/taskpane/app/settings/ui.ts

import type { UiSettings, ProfilePreset, AppTheme } from "../types";
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
import { initSubsUi, renderSubsList } from "./subsUi"; // <--- IMPORTED

import { initUiI18n, getUiLanguagePreference, setUiLanguagePreference, asUiLangPref } from "../i18n/uiI18n";
import { checkSelectionAndUpdateButtons } from "../selection";
import { get, getOptional } from "../utils/dom";

import { logger } from "../telemetry/logger";

let autoThemeQuery: MediaQueryList | null = null;
let autoThemeHandler: ((e: MediaQueryListEvent) => void) | null = null;

function applyTheme(theme: AppTheme) {
    const root = document.documentElement;

    if (autoThemeQuery && autoThemeHandler) {
        autoThemeQuery.removeEventListener("change", autoThemeHandler);
        autoThemeQuery = null;
        autoThemeHandler = null;
    }

    if (theme === "auto") {
        const query = window.matchMedia("(prefers-color-scheme: dark)");
        const updateAuto = () => {
            const isDark = query.matches;
            root.setAttribute("data-theme", isDark ? "dark" : "light");
        };
        updateAuto();
        autoThemeHandler = (e: MediaQueryListEvent) => {
            root.setAttribute("data-theme", e.matches ? "dark" : "light");
        };
        query.addEventListener("change", autoThemeHandler);
        autoThemeQuery = query;
    } else {
        root.setAttribute("data-theme", theme);
    }
}

// [REMOVED] renderSubsList, addSub, highlightError, removeSub

export function initUi() {
    initUiI18n();
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

    renderTags();
    updateResetButtonState();

    bindButtons();
    setupInputListeners();

    // [ADDED] Init subs UI
    initSubsUi();

    get<HTMLSelectElement>("profilePreset").onchange = (e) => {
        const val = (e.target as HTMLSelectElement).value as ProfilePreset;
        changeProfile(val);
    };

    const themeSel = getOptional<HTMLSelectElement>("optTheme");
    if (themeSel) {
        themeSel.onchange = () => {
            const val = themeSel.value as AppTheme;
            applyTheme(val);
            saveSettings();
        };
    }

    refreshStats();
    setStatus(t("status_ready"), "neutral");
}

function initLanguagePicker() {
    const sel = getOptional<HTMLSelectElement>("optUiLanguage");
    if (!sel) return;

    sel.value = getUiLanguagePreference();

    sel.onchange = () => {
        const pref = asUiLangPref(sel.value);
        setUiLanguagePreference(pref);
        renderTags();

        // Re-render subs list
        const area = getOptional<HTMLTextAreaElement>("optCustomSubstitutions");
        if (area) renderSubsList(area);

        refreshStats();
        setStatus(t("status_ready"), "neutral");
        try {
            void checkSelectionAndUpdateButtons();
        } catch {
            void 0;
        }
    };
}

function bindButtons() {
    get<HTMLButtonElement>("runBtn").onclick = () => runWithUiLock(runSmart);
    get<HTMLButtonElement>("previewBtn").onclick = () => runWithUiLock(runPreview);

    const exportBtn = getOptional<HTMLButtonElement>("exportBtn");
    if (exportBtn) exportBtn.onclick = exportSettingsAsDownload;

    const fileInput = get<HTMLInputElement>("fileInput");
    const importBtn = getOptional<HTMLButtonElement>("importBtn");
    if (importBtn) importBtn.onclick = () => fileInput.click();
    fileInput.onchange = handleFileImport;

    get<HTMLButtonElement>("resetBtn").onclick = async () => {
        const ok = await confirmInPanel(unsafeHtml(t("msg_reset_confirm")));
        if (ok) resetSettings();
    };

    const exportLogsBtn = getOptional<HTMLButtonElement>("exportLogsBtn");
    if (exportLogsBtn) {
        exportLogsBtn.onclick = async () => {
            try {
                const logs = await logger.exportLogsFull();
                const blob = new Blob([logs], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `serbian-transliterator-logs-${new Date().toISOString().slice(0, 10)}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (e) {
                console.error("Export failed", e);
                alert("Export error: " + e);
            }
        };
    }
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

    saveSettings();
    refreshStats();
    updateResetButtonState();
    setStatus(t("status_settings_saved"), "success");
}

function applySettingsToUi(s: UiSettings) {
    get<HTMLSelectElement>("profilePreset").value = s.profile;

    setCheckValue("optConfirmWholeDoc", s.confirmWholeDoc);
    setCheckValue("optProtectBrands", s.protectBrands);
    setCheckValue("optSerbianQuotes", s.applySerbianQuotes);
    setCheckValue("optPreserveCodeBlocks", s.preserveCodeBlocks);
    setCheckValue("optProtectRomans", s.protectRomans);
    setCheckValue("optSetProofingLanguage", s.setProofingLanguage);

    const curlySel = getOptional<HTMLSelectElement>("optCurlyProtection");
    if (curlySel) curlySel.value = s.curlyProtection;

    setRadioValue("direction", s.direction);

    setCheckValue("optIncludeHeadersFooters", s.includeHeadersFooters);
    setCheckValue("optIncludeFootnotes", s.includeFootnotes);
    setCheckValue("optIncludeEndnotes", s.includeEndnotes);

    const themeSel = getOptional<HTMLSelectElement>("optTheme");
    if (themeSel) themeSel.value = s.theme || "auto";
    applyTheme(s.theme || "auto");

    const subArea = getOptional<HTMLTextAreaElement>("optCustomSubstitutions");
    if (subArea) {
        subArea.value = s.customSubstitutions || "";
        renderSubsList(subArea); // [CHANGED] Use module
    }

    const dialectSel = getOptional<HTMLSelectElement>("optDialect");
    if (dialectSel) dialectSel.value = s.dialect || "none";

    const styleArea = getOptional<HTMLTextAreaElement>("optIgnoredStyles");
    if (styleArea) styleArea.value = (s.ignoredStyles || []).join("\n");

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
        "theme",
        "customSubstitutions",
        "dialect",
    ];

    const mismatches = keys.filter((k) => current[k] !== DEFAULT_SETTINGS[k]);

    const defStyles = DEFAULT_SETTINGS.ignoredStyles.join("\n");
    const curStyles = current.ignoredStyles.join("\n");
    const hasStyleDiff = defStyles !== curStyles;

    const btn = getOptional<HTMLButtonElement>("resetBtn");
    if (btn) btn.disabled = mismatches.length === 0 && !hasStyleDiff;
}

function switchToCustomIfManual() {
    if (state.isApplyingProfile) return;
    if (state.currentProfile === "custom") {
        saveSettings();
        return;
    }

    state.currentProfile = "custom";
    const select = getOptional<HTMLSelectElement>("profilePreset");
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
            if (data.confirmWholeDoc !== undefined) setCheckValue("optConfirmWholeDoc", data.confirmWholeDoc);

            const curlySel = getOptional<HTMLSelectElement>("optCurlyProtection");
            if (curlySel) {
                curlySel.value = asCurlyProtectionUi(
                    data.curlyProtection ?? DEFAULT_SETTINGS.curlyProtection
                );
            }
            if (data.dialect !== undefined) {
                const dSel = getOptional<HTMLSelectElement>("optDialect");
                if (dSel) dSel.value = data.dialect;
            }

            const styleArea = getOptional<HTMLTextAreaElement>("optIgnoredStyles");
            if (styleArea) {
                const styles = data.ignoredStyles || DEFAULT_SETTINGS.ignoredStyles;
                styleArea.value = styles.join("\n");
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
        "optIncludeHeadersFooters",
        "optIncludeFootnotes",
        "optIncludeEndnotes",
        "dirAuto",
        "dirLatToCyr",
        "dirCyrToLat",
        "dirToAscii",
        "optCustomSubstitutions",
        "optDialect",
        "optIgnoredStyles",
    ];

    ids.forEach((id) => {
        const el = getOptional<HTMLElement>(id);
        if (!el) return;

        (el as GlobalEventHandlers).onchange = () => {
            if (id !== "optShowStats") invalidatePreviewCache();
            if (!state.isApplyingProfile) switchToCustomIfManual();
            else saveSettings();
            if (id.startsWith("dir")) {
                void checkSelectionAndUpdateButtons();
            }
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
    const el = getOptional<HTMLInputElement>(id);
    if (el) el.checked = val;
}

function setRadioValue(name: string, val: string) {
    const els = document.getElementsByName(name);
    for (let i = 0; i < els.length; i++) {
        const el = els[i] as HTMLInputElement;
        if (el.value === val) el.checked = true;
    }
}
