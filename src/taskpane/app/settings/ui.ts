// src/taskpane/app/settings/ui.ts
/* global document, Blob, URL, FileReader */

import type { UiSettings, ProfilePreset, AppTheme } from "../types";
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

import { getSettingsFromUi, getOoxmlOptionsFromUi } from "./getters";
import { loadSettingsFromStorage, saveSettingsToStorage } from "./store";
import { DEFAULT_SETTINGS, PRESETS, SETTINGS_KEY } from "./defaults";

import { renderTags, setupTagEvents } from "./tags";
import { initAdvancedSettingsToggle } from "./advanced";

import { initUiI18n, getUiLanguagePreference, setUiLanguagePreference, asUiLangPref } from "../i18n/uiI18n";
import { checkSelectionAndUpdateButtons } from "../selection";
import { get, getOptional } from "../utils/dom";

function applyTheme(theme: AppTheme) {
    if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
    } else if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }
}

function renderSubsList() {
    const area = get<HTMLTextAreaElement>("optCustomSubstitutions");
    const container = get<HTMLDivElement>("subsContainer");

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
    const srcInput = get<HTMLInputElement>("subSrc");
    const destInput = get<HTMLInputElement>("subDest");
    const area = get<HTMLTextAreaElement>("optCustomSubstitutions");
    const addSubBtn = get<HTMLButtonElement>("addSubBtn");

    const src = srcInput.value.trim();
    const dest = destInput.value.trim();

    if (!src || !dest) {
        if (!src) highlightError(srcInput);
        if (!dest) highlightError(destInput);
        return;
    }

    if (src.includes("->") || dest.includes("->")) {
        alert("Simbol '->' je rezervisan za separator i ne može biti deo reči.");
        return;
    }

    const newLine = `${src} -> ${dest}`;
    const current = area.value.trim();

    if (current.includes(src + " ->")) {
        alert(`Pravilo za reč '${src}' već postoji. Obrišite staro pre dodavanja novog.`);
        return;
    }

    area.value = current ? current + "\n" + newLine : newLine;
    area.dispatchEvent(new Event("change"));

    srcInput.value = "";
    destInput.value = "";
    srcInput.focus();

    // Disable button again
    addSubBtn.disabled = true;

    renderSubsList();
}

function highlightError(el: HTMLElement) {
    const original = el.style.borderColor;
    el.style.borderColor = "var(--colorStatusDangerForeground)";
    setTimeout(() => {
        el.style.borderColor = original;
    }, 1000);
}

function removeSub(lineToRemove: string) {
    const area = get<HTMLTextAreaElement>("optCustomSubstitutions");
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

    // CUSTOM SUBS UI INIT
    const addSubBtn = get<HTMLButtonElement>("addSubBtn");
    addSubBtn.onclick = addSub;
    addSubBtn.disabled = true; // Initially disabled

    const subSrc = get<HTMLInputElement>("subSrc");
    const subDest = get<HTMLInputElement>("subDest");

    const checkSubInputs = () => {
        addSubBtn.disabled = !(subSrc.value.trim() && subDest.value.trim());
    };

    subSrc.oninput = checkSubInputs;
    subDest.oninput = checkSubInputs;

    renderSubsList();

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
        renderSubsList();
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
    get<HTMLButtonElement>("runBtn").onclick = () => runWithUiLock(runSmart);
    get<HTMLButtonElement>("previewBtn").onclick = () => runWithUiLock(runPreview);

    // Legacy export/import buttons might be hidden, but we bind them just in case
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

    // NOVO: Telemetry Export Button
    const exportLogsBtn = getOptional<HTMLButtonElement>("exportLogsBtn");
    if (exportLogsBtn) {
        exportLogsBtn.onclick = async () => {
            try {
                // Importujemo dinamički da izbegnemo kružne reference ako je logger heavy
                // Ali ovde je logger već importovan na vrhu fajla, pa koristimo direktno.
                // Uverite se da je: import { logger } from "../telemetry/logger"; na vrhu.
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

    setCheckValue("optShowStats", s.showStats);

    setRadioValue("direction", s.direction);

    setCheckValue("optIncludeHeadersFooters", s.includeHeadersFooters);
    setCheckValue("optIncludeFootnotes", s.includeFootnotes);
    setCheckValue("optIncludeEndnotes", s.includeEndnotes);

    const themeSel = getOptional<HTMLSelectElement>("optTheme");
    if (themeSel) themeSel.value = s.theme || "auto";
    applyTheme(s.theme || "auto");

    const subArea = getOptional<HTMLTextAreaElement>("optCustomSubstitutions");
    if (subArea) subArea.value = s.customSubstitutions || "";
    renderSubsList();

    const dialectSel = getOptional<HTMLSelectElement>("optDialect");
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
        "showStats",
        "theme",
        "customSubstitutions",
        "dialect",
    ];

    const mismatches = keys.filter((k) => current[k] !== DEFAULT_SETTINGS[k]);
    const btn = getOptional<HTMLButtonElement>("resetBtn");
    if (btn) btn.disabled = mismatches.length === 0;
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
        const el = getOptional<HTMLElement>(id);
        if (!el) return;

        (el as GlobalEventHandlers).onchange = () => {
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
