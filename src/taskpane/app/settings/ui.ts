// src/taskpane/app/settings/ui.ts
/* global document, Blob, URL, FileReader */

import type { UiSettings, ProfilePreset, AppTheme, DialectUi } from "../types";
import { state } from "../state";
import { asCurlyProtectionUi } from "../word/curlyProtection";

import { setStatus, refreshStats } from "../status";
import { invalidatePreviewCache } from "../preview/cache";
import { confirmInPanel } from "../modal/modal";
import { unsafeHtml, escapeHtml } from "../../../shared/safeHtml";
import { t } from "../../../shared/i18n";

import { runWithUiLock } from "../uiLock";
import { runSmart } from "../word/apply";
import { runPreview } from "../preview/runPreview";

import { getSettingsFromUi, getOoxmlOptionsFromUi, getSelectValue } from "./getters";
import { loadSettingsFromStorage, saveSettingsToStorage } from "./store";
import { DEFAULT_SETTINGS, PRESETS, SETTINGS_KEY } from "./defaults";

import { renderTags, setupTagEvents } from "./tags";
import { initAdvancedSettingsToggle } from "./advanced";

import { initUiI18n, getUiLanguagePreference, setUiLanguagePreference, asUiLangPref } from "../i18n/uiI18n";
import { checkSelectionAndUpdateButtons } from "../selection";

function applyTheme(theme: AppTheme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "auto") {
        document.documentElement.removeAttribute("data-theme");
    }
}

// NEW: Custom Subs Logic
function renderSubsList() {
    const area = document.getElementById("optCustomSubstitutions") as HTMLTextAreaElement;
    const container = document.getElementById("subsContainer") as HTMLDivElement;

    const raw = area.value.trim();
    const lines = raw ? raw.split("\n") : [];

    container.innerHTML = "";

    if (lines.length === 0) {
        container.innerHTML = `<div class="subs-empty hint" data-i18n="subs_list_empty">${t("subs_list_empty")}</div>`;
        return;
    }

    lines.forEach((line) => {
        if (!line.includes("->")) return;
        const [src, dest] = line.split("->").map((s) => s.trim());

        const item = document.createElement("div");
        item.className = "sub-item";
        item.innerHTML = `
            <span class="sub-text"><b>${escapeHtml(src)}</b> &rarr; ${escapeHtml(dest)}</span>
            <span class="sub-remove" title="${t("ui_tag_remove")}">&times;</span>
        `;

        item.querySelector(".sub-remove")!.addEventListener("click", () => {
            removeSub(line);
        });

        container.appendChild(item);
    });
}

function addSub() {
    const srcInput = document.getElementById("subSrc") as HTMLInputElement;
    const destInput = document.getElementById("subDest") as HTMLInputElement;
    const area = document.getElementById("optCustomSubstitutions") as HTMLTextAreaElement;

    const src = srcInput.value.trim();
    const dest = destInput.value.trim();

    if (!src || !dest) return;

    const newLine = `${src} -> ${dest}`;
    const current = area.value.trim();
    area.value = current ? current + "\n" + newLine : newLine;

    area.dispatchEvent(new Event("change")); // Trigger save

    srcInput.value = "";
    destInput.value = "";
    srcInput.focus();

    renderSubsList();
}

function removeSub(lineToRemove: string) {
    const area = document.getElementById("optCustomSubstitutions") as HTMLTextAreaElement;
    const lines = area.value
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s !== lineToRemove && s);
    area.value = lines.join("\n");

    area.dispatchEvent(new Event("change"));
    renderSubsList();
}

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

    initAdvancedSettingsToggle();
    renderTags();
    updateResetButtonState();

    bindButtons();
    setupInputListeners();

    // Bind Subs UI
    (document.getElementById("addSubBtn") as HTMLButtonElement).onclick = addSub;
    renderSubsList();

    (document.getElementById("profilePreset") as HTMLSelectElement).onchange = (e) => {
        const val = (e.target as HTMLSelectElement).value as ProfilePreset;
        changeProfile(val);
    };

    const themeSel = document.getElementById("optTheme") as HTMLSelectElement | null;
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
    const sel = document.getElementById("optUiLanguage") as HTMLSelectElement | null;
    if (!sel) return;

    sel.value = getUiLanguagePreference();

    sel.onchange = () => {
        const pref = asUiLangPref(sel.value);
        setUiLanguagePreference(pref);
        renderTags();
        renderSubsList(); // Re-render subs to update empty text
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

    // Theme
    const themeSel = document.getElementById("optTheme") as HTMLSelectElement | null;
    if (themeSel) themeSel.value = s.theme || "auto";
    applyTheme(s.theme || "auto");

    // Custom Subs
    const subArea = document.getElementById("optCustomSubstitutions") as HTMLTextAreaElement | null;
    if (subArea) subArea.value = s.customSubstitutions || "";
    renderSubsList(); // Update UI list

    // NEW: Dialect
    const dialectSel = document.getElementById("optDialect") as HTMLSelectElement | null;
    if (dialectSel) dialectSel.value = s.dialect || "none";

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
        "theme",
        "customSubstitutions",
        "dialect",
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
            if (data.dialect !== undefined) {
                const dSel = document.getElementById("optDialect") as HTMLSelectElement | null;
                if (dSel) dSel.value = data.dialect;
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
        "optCustomSubstitutions",
        "optDialect",
    ];

    ids.forEach((id) => {
        const el = document.getElementById(id) as
            | HTMLInputElement
            | HTMLSelectElement
            | HTMLTextAreaElement
            | null;
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
