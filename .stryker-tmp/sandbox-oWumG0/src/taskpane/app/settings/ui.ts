// @ts-nocheck
// src/taskpane/app/settings/ui.ts
function stryNS_9fa48() {
    var g =
        (typeof globalThis === "object" && globalThis && globalThis.Math === Math && globalThis) ||
        new Function("return this")();
    var ns = g.__stryker__ || (g.__stryker__ = {});
    if (
        ns.activeMutant === undefined &&
        g.process &&
        g.process.env &&
        g.process.env.__STRYKER_ACTIVE_MUTANT__
    ) {
        ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
    }
    function retrieveNS() {
        return ns;
    }
    stryNS_9fa48 = retrieveNS;
    return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
    var ns = stryNS_9fa48();
    var cov =
        ns.mutantCoverage ||
        (ns.mutantCoverage = {
            static: {},
            perTest: {},
        });
    function cover() {
        var c = cov.static;
        if (ns.currentTestId) {
            c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
        }
        var a = arguments;
        for (var i = 0; i < a.length; i++) {
            c[a[i]] = (c[a[i]] || 0) + 1;
        }
    }
    stryCov_9fa48 = cover;
    cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
    var ns = stryNS_9fa48();
    function isActive(id) {
        if (ns.activeMutant === id) {
            if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
                throw new Error("Stryker: Hit count limit reached (" + ns.hitCount + ")");
            }
            return true;
        }
        return false;
    }
    stryMutAct_9fa48 = isActive;
    return isActive(id);
}
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
    if (stryMutAct_9fa48("7087")) {
        {
        }
    } else {
        stryCov_9fa48("7087");
        const root = document.documentElement;
        if (
            stryMutAct_9fa48("7090")
                ? autoThemeQuery || autoThemeHandler
                : stryMutAct_9fa48("7089")
                  ? false
                  : stryMutAct_9fa48("7088")
                    ? true
                    : (stryCov_9fa48("7088", "7089", "7090"), autoThemeQuery && autoThemeHandler)
        ) {
            if (stryMutAct_9fa48("7091")) {
                {
                }
            } else {
                stryCov_9fa48("7091");
                autoThemeQuery.removeEventListener(
                    stryMutAct_9fa48("7092") ? "" : (stryCov_9fa48("7092"), "change"),
                    autoThemeHandler
                );
                autoThemeQuery = null;
                autoThemeHandler = null;
            }
        }
        if (
            stryMutAct_9fa48("7095")
                ? theme !== "auto"
                : stryMutAct_9fa48("7094")
                  ? false
                  : stryMutAct_9fa48("7093")
                    ? true
                    : (stryCov_9fa48("7093", "7094", "7095"),
                      theme === (stryMutAct_9fa48("7096") ? "" : (stryCov_9fa48("7096"), "auto")))
        ) {
            if (stryMutAct_9fa48("7097")) {
                {
                }
            } else {
                stryCov_9fa48("7097");
                const query = window.matchMedia(
                    stryMutAct_9fa48("7098") ? "" : (stryCov_9fa48("7098"), "(prefers-color-scheme: dark)")
                );
                const updateAuto = () => {
                    if (stryMutAct_9fa48("7099")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7099");
                        const isDark = query.matches;
                        root.setAttribute(
                            stryMutAct_9fa48("7100") ? "" : (stryCov_9fa48("7100"), "data-theme"),
                            isDark
                                ? stryMutAct_9fa48("7101")
                                    ? ""
                                    : (stryCov_9fa48("7101"), "dark")
                                : stryMutAct_9fa48("7102")
                                  ? ""
                                  : (stryCov_9fa48("7102"), "light")
                        );
                    }
                };
                updateAuto();
                autoThemeHandler = (e: MediaQueryListEvent) => {
                    if (stryMutAct_9fa48("7103")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7103");
                        root.setAttribute(
                            stryMutAct_9fa48("7104") ? "" : (stryCov_9fa48("7104"), "data-theme"),
                            e.matches
                                ? stryMutAct_9fa48("7105")
                                    ? ""
                                    : (stryCov_9fa48("7105"), "dark")
                                : stryMutAct_9fa48("7106")
                                  ? ""
                                  : (stryCov_9fa48("7106"), "light")
                        );
                    }
                };
                query.addEventListener(
                    stryMutAct_9fa48("7107") ? "" : (stryCov_9fa48("7107"), "change"),
                    autoThemeHandler
                );
                autoThemeQuery = query;
            }
        } else {
            if (stryMutAct_9fa48("7108")) {
                {
                }
            } else {
                stryCov_9fa48("7108");
                root.setAttribute(
                    stryMutAct_9fa48("7109") ? "" : (stryCov_9fa48("7109"), "data-theme"),
                    theme
                );
            }
        }
    }
}

// [REMOVED] renderSubsList, addSub, highlightError, removeSub

export function initUi() {
    if (stryMutAct_9fa48("7110")) {
        {
        }
    } else {
        stryCov_9fa48("7110");
        initUiI18n();
        initLanguagePicker();
        const settings = stryMutAct_9fa48("7113")
            ? loadSettingsFromStorage(SETTINGS_KEY, DEFAULT_SETTINGS) && DEFAULT_SETTINGS
            : stryMutAct_9fa48("7112")
              ? false
              : stryMutAct_9fa48("7111")
                ? true
                : (stryCov_9fa48("7111", "7112", "7113"),
                  loadSettingsFromStorage(SETTINGS_KEY, DEFAULT_SETTINGS) || DEFAULT_SETTINGS);
        state.customWordsSet = new Set(settings.userWordsCustom);
        state.presetWordsSet = (
            stryMutAct_9fa48("7116")
                ? settings.profile !== "custom" || PRESETS[settings.profile]
                : stryMutAct_9fa48("7115")
                  ? false
                  : stryMutAct_9fa48("7114")
                    ? true
                    : (stryCov_9fa48("7114", "7115", "7116"),
                      (stryMutAct_9fa48("7118")
                          ? settings.profile === "custom"
                          : stryMutAct_9fa48("7117")
                            ? true
                            : (stryCov_9fa48("7117", "7118"),
                              settings.profile !==
                                  (stryMutAct_9fa48("7119") ? "" : (stryCov_9fa48("7119"), "custom")))) &&
                          PRESETS[settings.profile])
        )
            ? new Set(PRESETS[settings.profile]!.userWords)
            : new Set();
        state.currentProfile = settings.profile;
        setupTagEvents(
            stryMutAct_9fa48("7120")
                ? {}
                : (stryCov_9fa48("7120"),
                  {
                      invalidatePreviewCache,
                      switchToCustomIfManual,
                      saveSettings,
                      updateResetButtonState,
                  })
        );
        state.isApplyingProfile = stryMutAct_9fa48("7121") ? false : (stryCov_9fa48("7121"), true);
        applySettingsToUi(settings);
        state.isApplyingProfile = stryMutAct_9fa48("7122") ? true : (stryCov_9fa48("7122"), false);
        renderTags();
        updateResetButtonState();
        bindButtons();
        setupInputListeners();

        // [ADDED] Init subs UI
        initSubsUi();
        get<HTMLSelectElement>(
            stryMutAct_9fa48("7123") ? "" : (stryCov_9fa48("7123"), "profilePreset")
        ).onchange = (e) => {
            if (stryMutAct_9fa48("7124")) {
                {
                }
            } else {
                stryCov_9fa48("7124");
                const val = (e.target as HTMLSelectElement).value as ProfilePreset;
                changeProfile(val);
            }
        };
        const themeSel = getOptional<HTMLSelectElement>(
            stryMutAct_9fa48("7125") ? "" : (stryCov_9fa48("7125"), "optTheme")
        );
        if (
            stryMutAct_9fa48("7127")
                ? false
                : stryMutAct_9fa48("7126")
                  ? true
                  : (stryCov_9fa48("7126", "7127"), themeSel)
        ) {
            if (stryMutAct_9fa48("7128")) {
                {
                }
            } else {
                stryCov_9fa48("7128");
                themeSel.onchange = () => {
                    if (stryMutAct_9fa48("7129")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7129");
                        const val = themeSel.value as AppTheme;
                        applyTheme(val);
                        saveSettings();
                    }
                };
            }
        }
        refreshStats();
        setStatus(
            t(stryMutAct_9fa48("7130") ? "" : (stryCov_9fa48("7130"), "status_ready")),
            stryMutAct_9fa48("7131") ? "" : (stryCov_9fa48("7131"), "neutral")
        );
    }
}
function initLanguagePicker() {
    if (stryMutAct_9fa48("7132")) {
        {
        }
    } else {
        stryCov_9fa48("7132");
        const sel = getOptional<HTMLSelectElement>(
            stryMutAct_9fa48("7133") ? "" : (stryCov_9fa48("7133"), "optUiLanguage")
        );
        if (
            stryMutAct_9fa48("7136")
                ? false
                : stryMutAct_9fa48("7135")
                  ? true
                  : stryMutAct_9fa48("7134")
                    ? sel
                    : (stryCov_9fa48("7134", "7135", "7136"), !sel)
        )
            return;
        sel.value = getUiLanguagePreference();
        sel.onchange = () => {
            if (stryMutAct_9fa48("7137")) {
                {
                }
            } else {
                stryCov_9fa48("7137");
                const pref = asUiLangPref(sel.value);
                setUiLanguagePreference(pref);
                renderTags();

                // Re-render subs list
                const area = getOptional<HTMLTextAreaElement>(
                    stryMutAct_9fa48("7138") ? "" : (stryCov_9fa48("7138"), "optCustomSubstitutions")
                );
                if (
                    stryMutAct_9fa48("7140")
                        ? false
                        : stryMutAct_9fa48("7139")
                          ? true
                          : (stryCov_9fa48("7139", "7140"), area)
                )
                    renderSubsList(area);
                refreshStats();
                setStatus(
                    t(stryMutAct_9fa48("7141") ? "" : (stryCov_9fa48("7141"), "status_ready")),
                    stryMutAct_9fa48("7142") ? "" : (stryCov_9fa48("7142"), "neutral")
                );
                try {
                    if (stryMutAct_9fa48("7143")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7143");
                        void checkSelectionAndUpdateButtons();
                    }
                } catch {
                    // best-effort
                }
            }
        };
    }
}
function bindButtons() {
    if (stryMutAct_9fa48("7144")) {
        {
        }
    } else {
        stryCov_9fa48("7144");
        get<HTMLButtonElement>(stryMutAct_9fa48("7145") ? "" : (stryCov_9fa48("7145"), "runBtn")).onclick =
            stryMutAct_9fa48("7146")
                ? () => undefined
                : (stryCov_9fa48("7146"), () => runWithUiLock(runSmart));
        get<HTMLButtonElement>(
            stryMutAct_9fa48("7147") ? "" : (stryCov_9fa48("7147"), "previewBtn")
        ).onclick = stryMutAct_9fa48("7148")
            ? () => undefined
            : (stryCov_9fa48("7148"), () => runWithUiLock(runPreview));
        const exportBtn = getOptional<HTMLButtonElement>(
            stryMutAct_9fa48("7149") ? "" : (stryCov_9fa48("7149"), "exportBtn")
        );
        if (
            stryMutAct_9fa48("7151")
                ? false
                : stryMutAct_9fa48("7150")
                  ? true
                  : (stryCov_9fa48("7150", "7151"), exportBtn)
        )
            exportBtn.onclick = exportSettingsAsDownload;
        const fileInput = get<HTMLInputElement>(
            stryMutAct_9fa48("7152") ? "" : (stryCov_9fa48("7152"), "fileInput")
        );
        const importBtn = getOptional<HTMLButtonElement>(
            stryMutAct_9fa48("7153") ? "" : (stryCov_9fa48("7153"), "importBtn")
        );
        if (
            stryMutAct_9fa48("7155")
                ? false
                : stryMutAct_9fa48("7154")
                  ? true
                  : (stryCov_9fa48("7154", "7155"), importBtn)
        )
            importBtn.onclick = stryMutAct_9fa48("7156")
                ? () => undefined
                : (stryCov_9fa48("7156"), () => fileInput.click());
        fileInput.onchange = handleFileImport;
        get<HTMLButtonElement>(stryMutAct_9fa48("7157") ? "" : (stryCov_9fa48("7157"), "resetBtn")).onclick =
            async () => {
                if (stryMutAct_9fa48("7158")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7158");
                    const ok = await confirmInPanel(
                        unsafeHtml(
                            t(stryMutAct_9fa48("7159") ? "" : (stryCov_9fa48("7159"), "msg_reset_confirm"))
                        )
                    );
                    if (
                        stryMutAct_9fa48("7161")
                            ? false
                            : stryMutAct_9fa48("7160")
                              ? true
                              : (stryCov_9fa48("7160", "7161"), ok)
                    )
                        resetSettings();
                }
            };
        const exportLogsBtn = getOptional<HTMLButtonElement>(
            stryMutAct_9fa48("7162") ? "" : (stryCov_9fa48("7162"), "exportLogsBtn")
        );
        if (
            stryMutAct_9fa48("7164")
                ? false
                : stryMutAct_9fa48("7163")
                  ? true
                  : (stryCov_9fa48("7163", "7164"), exportLogsBtn)
        ) {
            if (stryMutAct_9fa48("7165")) {
                {
                }
            } else {
                stryCov_9fa48("7165");
                exportLogsBtn.onclick = async () => {
                    if (stryMutAct_9fa48("7166")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7166");
                        try {
                            if (stryMutAct_9fa48("7167")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7167");
                                const logs = await logger.exportLogsFull();
                                const blob = new Blob(
                                    stryMutAct_9fa48("7168") ? [] : (stryCov_9fa48("7168"), [logs]),
                                    stryMutAct_9fa48("7169")
                                        ? {}
                                        : (stryCov_9fa48("7169"),
                                          {
                                              type: stryMutAct_9fa48("7170")
                                                  ? ""
                                                  : (stryCov_9fa48("7170"), "text/plain"),
                                          })
                                );
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement(
                                    stryMutAct_9fa48("7171") ? "" : (stryCov_9fa48("7171"), "a")
                                );
                                a.href = url;
                                a.download = stryMutAct_9fa48("7172")
                                    ? ``
                                    : (stryCov_9fa48("7172"),
                                      `serbian-transliterator-logs-${stryMutAct_9fa48("7173") ? new Date().toISOString() : (stryCov_9fa48("7173"), new Date().toISOString().slice(0, 10))}.txt`);
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }
                        } catch (e) {
                            if (stryMutAct_9fa48("7174")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7174");
                                console.error(
                                    stryMutAct_9fa48("7175") ? "" : (stryCov_9fa48("7175"), "Export failed"),
                                    e
                                );
                                alert(
                                    (stryMutAct_9fa48("7176")
                                        ? ""
                                        : (stryCov_9fa48("7176"), "Export error: ")) + e
                                );
                            }
                        }
                    }
                };
            }
        }
    }
}
function saveSettings() {
    if (stryMutAct_9fa48("7177")) {
        {
        }
    } else {
        stryCov_9fa48("7177");
        const s = getSettingsFromUi();
        saveSettingsToStorage(SETTINGS_KEY, s);
        updateResetButtonState();
    }
}
function resetSettings() {
    if (stryMutAct_9fa48("7178")) {
        {
        }
    } else {
        stryCov_9fa48("7178");
        const currentWords = Array.from(state.customWordsSet);
        const newSettings: UiSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        newSettings.userWordsCustom = currentWords;
        newSettings.profile = stryMutAct_9fa48("7179") ? "" : (stryCov_9fa48("7179"), "custom");
        state.isApplyingProfile = stryMutAct_9fa48("7180") ? false : (stryCov_9fa48("7180"), true);
        applySettingsToUi(newSettings);
        changeProfile(stryMutAct_9fa48("7181") ? "" : (stryCov_9fa48("7181"), "custom"));
        state.isApplyingProfile = stryMutAct_9fa48("7182") ? true : (stryCov_9fa48("7182"), false);
        saveSettings();
        refreshStats();
        updateResetButtonState();
        setStatus(
            t(stryMutAct_9fa48("7183") ? "" : (stryCov_9fa48("7183"), "status_settings_saved")),
            stryMutAct_9fa48("7184") ? "" : (stryCov_9fa48("7184"), "success")
        );
    }
}
function applySettingsToUi(s: UiSettings) {
    if (stryMutAct_9fa48("7185")) {
        {
        }
    } else {
        stryCov_9fa48("7185");
        get<HTMLSelectElement>(
            stryMutAct_9fa48("7186") ? "" : (stryCov_9fa48("7186"), "profilePreset")
        ).value = s.profile;
        setCheckValue(
            stryMutAct_9fa48("7187") ? "" : (stryCov_9fa48("7187"), "optConfirmWholeDoc"),
            s.confirmWholeDoc
        );
        setCheckValue(
            stryMutAct_9fa48("7188") ? "" : (stryCov_9fa48("7188"), "optProtectBrands"),
            s.protectBrands
        );
        setCheckValue(
            stryMutAct_9fa48("7189") ? "" : (stryCov_9fa48("7189"), "optSerbianQuotes"),
            s.applySerbianQuotes
        );
        setCheckValue(
            stryMutAct_9fa48("7190") ? "" : (stryCov_9fa48("7190"), "optPreserveCodeBlocks"),
            s.preserveCodeBlocks
        );
        setCheckValue(
            stryMutAct_9fa48("7191") ? "" : (stryCov_9fa48("7191"), "optProtectRomans"),
            s.protectRomans
        );
        setCheckValue(
            stryMutAct_9fa48("7192") ? "" : (stryCov_9fa48("7192"), "optSetProofingLanguage"),
            s.setProofingLanguage
        );
        const curlySel = getOptional<HTMLSelectElement>(
            stryMutAct_9fa48("7193") ? "" : (stryCov_9fa48("7193"), "optCurlyProtection")
        );
        if (
            stryMutAct_9fa48("7195")
                ? false
                : stryMutAct_9fa48("7194")
                  ? true
                  : (stryCov_9fa48("7194", "7195"), curlySel)
        )
            curlySel.value = s.curlyProtection;
        setRadioValue(stryMutAct_9fa48("7196") ? "" : (stryCov_9fa48("7196"), "direction"), s.direction);
        setCheckValue(
            stryMutAct_9fa48("7197") ? "" : (stryCov_9fa48("7197"), "optIncludeHeadersFooters"),
            s.includeHeadersFooters
        );
        setCheckValue(
            stryMutAct_9fa48("7198") ? "" : (stryCov_9fa48("7198"), "optIncludeFootnotes"),
            s.includeFootnotes
        );
        setCheckValue(
            stryMutAct_9fa48("7199") ? "" : (stryCov_9fa48("7199"), "optIncludeEndnotes"),
            s.includeEndnotes
        );
        const themeSel = getOptional<HTMLSelectElement>(
            stryMutAct_9fa48("7200") ? "" : (stryCov_9fa48("7200"), "optTheme")
        );
        if (
            stryMutAct_9fa48("7202")
                ? false
                : stryMutAct_9fa48("7201")
                  ? true
                  : (stryCov_9fa48("7201", "7202"), themeSel)
        )
            themeSel.value = stryMutAct_9fa48("7205")
                ? s.theme && "auto"
                : stryMutAct_9fa48("7204")
                  ? false
                  : stryMutAct_9fa48("7203")
                    ? true
                    : (stryCov_9fa48("7203", "7204", "7205"),
                      s.theme || (stryMutAct_9fa48("7206") ? "" : (stryCov_9fa48("7206"), "auto")));
        applyTheme(
            stryMutAct_9fa48("7209")
                ? s.theme && "auto"
                : stryMutAct_9fa48("7208")
                  ? false
                  : stryMutAct_9fa48("7207")
                    ? true
                    : (stryCov_9fa48("7207", "7208", "7209"),
                      s.theme || (stryMutAct_9fa48("7210") ? "" : (stryCov_9fa48("7210"), "auto")))
        );
        const subArea = getOptional<HTMLTextAreaElement>(
            stryMutAct_9fa48("7211") ? "" : (stryCov_9fa48("7211"), "optCustomSubstitutions")
        );
        if (
            stryMutAct_9fa48("7213")
                ? false
                : stryMutAct_9fa48("7212")
                  ? true
                  : (stryCov_9fa48("7212", "7213"), subArea)
        ) {
            if (stryMutAct_9fa48("7214")) {
                {
                }
            } else {
                stryCov_9fa48("7214");
                subArea.value = stryMutAct_9fa48("7217")
                    ? s.customSubstitutions && ""
                    : stryMutAct_9fa48("7216")
                      ? false
                      : stryMutAct_9fa48("7215")
                        ? true
                        : (stryCov_9fa48("7215", "7216", "7217"),
                          s.customSubstitutions ||
                              (stryMutAct_9fa48("7218") ? "Stryker was here!" : (stryCov_9fa48("7218"), "")));
                renderSubsList(subArea); // [CHANGED] Use module
            }
        }
        const dialectSel = getOptional<HTMLSelectElement>(
            stryMutAct_9fa48("7219") ? "" : (stryCov_9fa48("7219"), "optDialect")
        );
        if (
            stryMutAct_9fa48("7221")
                ? false
                : stryMutAct_9fa48("7220")
                  ? true
                  : (stryCov_9fa48("7220", "7221"), dialectSel)
        )
            dialectSel.value = stryMutAct_9fa48("7224")
                ? s.dialect && "none"
                : stryMutAct_9fa48("7223")
                  ? false
                  : stryMutAct_9fa48("7222")
                    ? true
                    : (stryCov_9fa48("7222", "7223", "7224"),
                      s.dialect || (stryMutAct_9fa48("7225") ? "" : (stryCov_9fa48("7225"), "none")));
        const styleArea = getOptional<HTMLTextAreaElement>(
            stryMutAct_9fa48("7226") ? "" : (stryCov_9fa48("7226"), "optIgnoredStyles")
        );
        if (
            stryMutAct_9fa48("7228")
                ? false
                : stryMutAct_9fa48("7227")
                  ? true
                  : (stryCov_9fa48("7227", "7228"), styleArea)
        )
            styleArea.value = (
                stryMutAct_9fa48("7231")
                    ? s.ignoredStyles && []
                    : stryMutAct_9fa48("7230")
                      ? false
                      : stryMutAct_9fa48("7229")
                        ? true
                        : (stryCov_9fa48("7229", "7230", "7231"),
                          s.ignoredStyles ||
                              (stryMutAct_9fa48("7232") ? ["Stryker was here"] : (stryCov_9fa48("7232"), [])))
            ).join(stryMutAct_9fa48("7233") ? "" : (stryCov_9fa48("7233"), "\n"));
        refreshStats();
        updateResetButtonState();
    }
}
function updateResetButtonState() {
    if (stryMutAct_9fa48("7234")) {
        {
        }
    } else {
        stryCov_9fa48("7234");
        const current = getSettingsFromUi();
        const keys: Array<keyof UiSettings> = stryMutAct_9fa48("7235")
            ? []
            : (stryCov_9fa48("7235"),
              [
                  stryMutAct_9fa48("7236") ? "" : (stryCov_9fa48("7236"), "profile"),
                  stryMutAct_9fa48("7237") ? "" : (stryCov_9fa48("7237"), "direction"),
                  stryMutAct_9fa48("7238") ? "" : (stryCov_9fa48("7238"), "confirmWholeDoc"),
                  stryMutAct_9fa48("7239") ? "" : (stryCov_9fa48("7239"), "includeHeadersFooters"),
                  stryMutAct_9fa48("7240") ? "" : (stryCov_9fa48("7240"), "includeFootnotes"),
                  stryMutAct_9fa48("7241") ? "" : (stryCov_9fa48("7241"), "includeEndnotes"),
                  stryMutAct_9fa48("7242") ? "" : (stryCov_9fa48("7242"), "protectBrands"),
                  stryMutAct_9fa48("7243") ? "" : (stryCov_9fa48("7243"), "applySerbianQuotes"),
                  stryMutAct_9fa48("7244") ? "" : (stryCov_9fa48("7244"), "preserveCodeBlocks"),
                  stryMutAct_9fa48("7245") ? "" : (stryCov_9fa48("7245"), "protectRomans"),
                  stryMutAct_9fa48("7246") ? "" : (stryCov_9fa48("7246"), "setProofingLanguage"),
                  stryMutAct_9fa48("7247") ? "" : (stryCov_9fa48("7247"), "curlyProtection"),
                  stryMutAct_9fa48("7248") ? "" : (stryCov_9fa48("7248"), "theme"),
                  stryMutAct_9fa48("7249") ? "" : (stryCov_9fa48("7249"), "customSubstitutions"),
                  stryMutAct_9fa48("7250") ? "" : (stryCov_9fa48("7250"), "dialect"),
              ]);
        const mismatches = stryMutAct_9fa48("7251")
            ? keys
            : (stryCov_9fa48("7251"),
              keys.filter(
                  stryMutAct_9fa48("7252")
                      ? () => undefined
                      : (stryCov_9fa48("7252"),
                        (k) =>
                            stryMutAct_9fa48("7255")
                                ? current[k] === DEFAULT_SETTINGS[k]
                                : stryMutAct_9fa48("7254")
                                  ? false
                                  : stryMutAct_9fa48("7253")
                                    ? true
                                    : (stryCov_9fa48("7253", "7254", "7255"),
                                      current[k] !== DEFAULT_SETTINGS[k]))
              ));
        const defStyles = DEFAULT_SETTINGS.ignoredStyles.join(
            stryMutAct_9fa48("7256") ? "" : (stryCov_9fa48("7256"), "\n")
        );
        const curStyles = current.ignoredStyles.join(
            stryMutAct_9fa48("7257") ? "" : (stryCov_9fa48("7257"), "\n")
        );
        const hasStyleDiff = stryMutAct_9fa48("7260")
            ? defStyles === curStyles
            : stryMutAct_9fa48("7259")
              ? false
              : stryMutAct_9fa48("7258")
                ? true
                : (stryCov_9fa48("7258", "7259", "7260"), defStyles !== curStyles);
        const btn = getOptional<HTMLButtonElement>(
            stryMutAct_9fa48("7261") ? "" : (stryCov_9fa48("7261"), "resetBtn")
        );
        if (
            stryMutAct_9fa48("7263")
                ? false
                : stryMutAct_9fa48("7262")
                  ? true
                  : (stryCov_9fa48("7262", "7263"), btn)
        )
            btn.disabled = stryMutAct_9fa48("7266")
                ? mismatches.length === 0 || !hasStyleDiff
                : stryMutAct_9fa48("7265")
                  ? false
                  : stryMutAct_9fa48("7264")
                    ? true
                    : (stryCov_9fa48("7264", "7265", "7266"),
                      (stryMutAct_9fa48("7268")
                          ? mismatches.length !== 0
                          : stryMutAct_9fa48("7267")
                            ? true
                            : (stryCov_9fa48("7267", "7268"), mismatches.length === 0)) &&
                          (stryMutAct_9fa48("7269") ? hasStyleDiff : (stryCov_9fa48("7269"), !hasStyleDiff)));
    }
}
function switchToCustomIfManual() {
    if (stryMutAct_9fa48("7270")) {
        {
        }
    } else {
        stryCov_9fa48("7270");
        if (
            stryMutAct_9fa48("7272")
                ? false
                : stryMutAct_9fa48("7271")
                  ? true
                  : (stryCov_9fa48("7271", "7272"), state.isApplyingProfile)
        )
            return;
        if (
            stryMutAct_9fa48("7275")
                ? state.currentProfile !== "custom"
                : stryMutAct_9fa48("7274")
                  ? false
                  : stryMutAct_9fa48("7273")
                    ? true
                    : (stryCov_9fa48("7273", "7274", "7275"),
                      state.currentProfile ===
                          (stryMutAct_9fa48("7276") ? "" : (stryCov_9fa48("7276"), "custom")))
        ) {
            if (stryMutAct_9fa48("7277")) {
                {
                }
            } else {
                stryCov_9fa48("7277");
                saveSettings();
                return;
            }
        }
        state.currentProfile = stryMutAct_9fa48("7278") ? "" : (stryCov_9fa48("7278"), "custom");
        const select = getOptional<HTMLSelectElement>(
            stryMutAct_9fa48("7279") ? "" : (stryCov_9fa48("7279"), "profilePreset")
        );
        if (
            stryMutAct_9fa48("7281")
                ? false
                : stryMutAct_9fa48("7280")
                  ? true
                  : (stryCov_9fa48("7280", "7281"), select)
        )
            select.value = stryMutAct_9fa48("7282") ? "" : (stryCov_9fa48("7282"), "custom");
        saveSettings();
    }
}
function changeProfile(profile: ProfilePreset) {
    if (stryMutAct_9fa48("7283")) {
        {
        }
    } else {
        stryCov_9fa48("7283");
        state.currentProfile = profile;
        state.isApplyingProfile = stryMutAct_9fa48("7284") ? false : (stryCov_9fa48("7284"), true);
        if (
            stryMutAct_9fa48("7287")
                ? profile !== "custom"
                : stryMutAct_9fa48("7286")
                  ? false
                  : stryMutAct_9fa48("7285")
                    ? true
                    : (stryCov_9fa48("7285", "7286", "7287"),
                      profile === (stryMutAct_9fa48("7288") ? "" : (stryCov_9fa48("7288"), "custom")))
        ) {
            if (stryMutAct_9fa48("7289")) {
                {
                }
            } else {
                stryCov_9fa48("7289");
                state.presetWordsSet.clear();
            }
        } else {
            if (stryMutAct_9fa48("7290")) {
                {
                }
            } else {
                stryCov_9fa48("7290");
                const data = PRESETS[profile];
                if (
                    stryMutAct_9fa48("7292")
                        ? false
                        : stryMutAct_9fa48("7291")
                          ? true
                          : (stryCov_9fa48("7291", "7292"), data)
                ) {
                    if (stryMutAct_9fa48("7293")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7293");
                        state.presetWordsSet = new Set(data.userWords);
                        if (
                            stryMutAct_9fa48("7295")
                                ? false
                                : stryMutAct_9fa48("7294")
                                  ? true
                                  : (stryCov_9fa48("7294", "7295"), data.direction)
                        )
                            setRadioValue(
                                stryMutAct_9fa48("7296") ? "" : (stryCov_9fa48("7296"), "direction"),
                                data.direction
                            );
                        if (
                            stryMutAct_9fa48("7299")
                                ? data.protectBrands === undefined
                                : stryMutAct_9fa48("7298")
                                  ? false
                                  : stryMutAct_9fa48("7297")
                                    ? true
                                    : (stryCov_9fa48("7297", "7298", "7299"),
                                      data.protectBrands !== undefined)
                        )
                            setCheckValue(
                                stryMutAct_9fa48("7300") ? "" : (stryCov_9fa48("7300"), "optProtectBrands"),
                                data.protectBrands
                            );
                        if (
                            stryMutAct_9fa48("7303")
                                ? data.applySerbianQuotes === undefined
                                : stryMutAct_9fa48("7302")
                                  ? false
                                  : stryMutAct_9fa48("7301")
                                    ? true
                                    : (stryCov_9fa48("7301", "7302", "7303"),
                                      data.applySerbianQuotes !== undefined)
                        )
                            setCheckValue(
                                stryMutAct_9fa48("7304") ? "" : (stryCov_9fa48("7304"), "optSerbianQuotes"),
                                data.applySerbianQuotes
                            );
                        if (
                            stryMutAct_9fa48("7307")
                                ? data.preserveCodeBlocks === undefined
                                : stryMutAct_9fa48("7306")
                                  ? false
                                  : stryMutAct_9fa48("7305")
                                    ? true
                                    : (stryCov_9fa48("7305", "7306", "7307"),
                                      data.preserveCodeBlocks !== undefined)
                        )
                            setCheckValue(
                                stryMutAct_9fa48("7308")
                                    ? ""
                                    : (stryCov_9fa48("7308"), "optPreserveCodeBlocks"),
                                data.preserveCodeBlocks
                            );
                        if (
                            stryMutAct_9fa48("7311")
                                ? data.protectRomans === undefined
                                : stryMutAct_9fa48("7310")
                                  ? false
                                  : stryMutAct_9fa48("7309")
                                    ? true
                                    : (stryCov_9fa48("7309", "7310", "7311"),
                                      data.protectRomans !== undefined)
                        )
                            setCheckValue(
                                stryMutAct_9fa48("7312") ? "" : (stryCov_9fa48("7312"), "optProtectRomans"),
                                data.protectRomans
                            );
                        if (
                            stryMutAct_9fa48("7315")
                                ? data.setProofingLanguage === undefined
                                : stryMutAct_9fa48("7314")
                                  ? false
                                  : stryMutAct_9fa48("7313")
                                    ? true
                                    : (stryCov_9fa48("7313", "7314", "7315"),
                                      data.setProofingLanguage !== undefined)
                        )
                            setCheckValue(
                                stryMutAct_9fa48("7316")
                                    ? ""
                                    : (stryCov_9fa48("7316"), "optSetProofingLanguage"),
                                data.setProofingLanguage
                            );
                        if (
                            stryMutAct_9fa48("7319")
                                ? data.confirmWholeDoc === undefined
                                : stryMutAct_9fa48("7318")
                                  ? false
                                  : stryMutAct_9fa48("7317")
                                    ? true
                                    : (stryCov_9fa48("7317", "7318", "7319"),
                                      data.confirmWholeDoc !== undefined)
                        )
                            setCheckValue(
                                stryMutAct_9fa48("7320") ? "" : (stryCov_9fa48("7320"), "optConfirmWholeDoc"),
                                data.confirmWholeDoc
                            );
                        const curlySel = getOptional<HTMLSelectElement>(
                            stryMutAct_9fa48("7321") ? "" : (stryCov_9fa48("7321"), "optCurlyProtection")
                        );
                        if (
                            stryMutAct_9fa48("7323")
                                ? false
                                : stryMutAct_9fa48("7322")
                                  ? true
                                  : (stryCov_9fa48("7322", "7323"), curlySel)
                        ) {
                            if (stryMutAct_9fa48("7324")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7324");
                                curlySel.value = asCurlyProtectionUi(
                                    stryMutAct_9fa48("7325")
                                        ? data.curlyProtection && DEFAULT_SETTINGS.curlyProtection
                                        : (stryCov_9fa48("7325"),
                                          data.curlyProtection ?? DEFAULT_SETTINGS.curlyProtection)
                                );
                            }
                        }
                        if (
                            stryMutAct_9fa48("7328")
                                ? data.dialect === undefined
                                : stryMutAct_9fa48("7327")
                                  ? false
                                  : stryMutAct_9fa48("7326")
                                    ? true
                                    : (stryCov_9fa48("7326", "7327", "7328"), data.dialect !== undefined)
                        ) {
                            if (stryMutAct_9fa48("7329")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7329");
                                const dSel = getOptional<HTMLSelectElement>(
                                    stryMutAct_9fa48("7330") ? "" : (stryCov_9fa48("7330"), "optDialect")
                                );
                                if (
                                    stryMutAct_9fa48("7332")
                                        ? false
                                        : stryMutAct_9fa48("7331")
                                          ? true
                                          : (stryCov_9fa48("7331", "7332"), dSel)
                                )
                                    dSel.value = data.dialect;
                            }
                        }
                        const styleArea = getOptional<HTMLTextAreaElement>(
                            stryMutAct_9fa48("7333") ? "" : (stryCov_9fa48("7333"), "optIgnoredStyles")
                        );
                        if (
                            stryMutAct_9fa48("7335")
                                ? false
                                : stryMutAct_9fa48("7334")
                                  ? true
                                  : (stryCov_9fa48("7334", "7335"), styleArea)
                        ) {
                            if (stryMutAct_9fa48("7336")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7336");
                                const styles = stryMutAct_9fa48("7339")
                                    ? data.ignoredStyles && DEFAULT_SETTINGS.ignoredStyles
                                    : stryMutAct_9fa48("7338")
                                      ? false
                                      : stryMutAct_9fa48("7337")
                                        ? true
                                        : (stryCov_9fa48("7337", "7338", "7339"),
                                          data.ignoredStyles || DEFAULT_SETTINGS.ignoredStyles);
                                styleArea.value = styles.join(
                                    stryMutAct_9fa48("7340") ? "" : (stryCov_9fa48("7340"), "\n")
                                );
                            }
                        }
                    }
                }
            }
        }
        renderTags();
        saveSettings();
        invalidatePreviewCache();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profileKey = `profile_${profile}` as any;
        const displayName = (
            stryMutAct_9fa48("7343")
                ? t(profileKey) === profileKey
                : stryMutAct_9fa48("7342")
                  ? false
                  : stryMutAct_9fa48("7341")
                    ? true
                    : (stryCov_9fa48("7341", "7342", "7343"), t(profileKey) !== profileKey)
        )
            ? t(profileKey)
            : profile;
        setStatus(
            t(stryMutAct_9fa48("7344") ? "" : (stryCov_9fa48("7344"), "status_profile_changed"), displayName),
            stryMutAct_9fa48("7345") ? "" : (stryCov_9fa48("7345"), "info")
        );
        state.isApplyingProfile = stryMutAct_9fa48("7346") ? true : (stryCov_9fa48("7346"), false);
    }
}
function setupInputListeners() {
    if (stryMutAct_9fa48("7347")) {
        {
        }
    } else {
        stryCov_9fa48("7347");
        const ids = stryMutAct_9fa48("7348")
            ? []
            : (stryCov_9fa48("7348"),
              [
                  stryMutAct_9fa48("7349") ? "" : (stryCov_9fa48("7349"), "optConfirmWholeDoc"),
                  stryMutAct_9fa48("7350") ? "" : (stryCov_9fa48("7350"), "optProtectBrands"),
                  stryMutAct_9fa48("7351") ? "" : (stryCov_9fa48("7351"), "optSerbianQuotes"),
                  stryMutAct_9fa48("7352") ? "" : (stryCov_9fa48("7352"), "optPreserveCodeBlocks"),
                  stryMutAct_9fa48("7353") ? "" : (stryCov_9fa48("7353"), "optProtectRomans"),
                  stryMutAct_9fa48("7354") ? "" : (stryCov_9fa48("7354"), "optSetProofingLanguage"),
                  stryMutAct_9fa48("7355") ? "" : (stryCov_9fa48("7355"), "optCurlyProtection"),
                  stryMutAct_9fa48("7356") ? "" : (stryCov_9fa48("7356"), "optIncludeHeadersFooters"),
                  stryMutAct_9fa48("7357") ? "" : (stryCov_9fa48("7357"), "optIncludeFootnotes"),
                  stryMutAct_9fa48("7358") ? "" : (stryCov_9fa48("7358"), "optIncludeEndnotes"),
                  stryMutAct_9fa48("7359") ? "" : (stryCov_9fa48("7359"), "dirAuto"),
                  stryMutAct_9fa48("7360") ? "" : (stryCov_9fa48("7360"), "dirLatToCyr"),
                  stryMutAct_9fa48("7361") ? "" : (stryCov_9fa48("7361"), "dirCyrToLat"),
                  stryMutAct_9fa48("7362") ? "" : (stryCov_9fa48("7362"), "dirToAscii"),
                  stryMutAct_9fa48("7363") ? "" : (stryCov_9fa48("7363"), "optCustomSubstitutions"),
                  stryMutAct_9fa48("7364") ? "" : (stryCov_9fa48("7364"), "optDialect"),
                  stryMutAct_9fa48("7365") ? "" : (stryCov_9fa48("7365"), "optIgnoredStyles"),
              ]);
        ids.forEach((id) => {
            if (stryMutAct_9fa48("7366")) {
                {
                }
            } else {
                stryCov_9fa48("7366");
                const el = getOptional<HTMLElement>(id);
                if (
                    stryMutAct_9fa48("7369")
                        ? false
                        : stryMutAct_9fa48("7368")
                          ? true
                          : stryMutAct_9fa48("7367")
                            ? el
                            : (stryCov_9fa48("7367", "7368", "7369"), !el)
                )
                    return;
                (el as GlobalEventHandlers).onchange = () => {
                    if (stryMutAct_9fa48("7370")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7370");
                        if (
                            stryMutAct_9fa48("7373")
                                ? id === "optShowStats"
                                : stryMutAct_9fa48("7372")
                                  ? false
                                  : stryMutAct_9fa48("7371")
                                    ? true
                                    : (stryCov_9fa48("7371", "7372", "7373"),
                                      id !==
                                          (stryMutAct_9fa48("7374")
                                              ? ""
                                              : (stryCov_9fa48("7374"), "optShowStats")))
                        )
                            invalidatePreviewCache();
                        if (
                            stryMutAct_9fa48("7377")
                                ? false
                                : stryMutAct_9fa48("7376")
                                  ? true
                                  : stryMutAct_9fa48("7375")
                                    ? state.isApplyingProfile
                                    : (stryCov_9fa48("7375", "7376", "7377"), !state.isApplyingProfile)
                        )
                            switchToCustomIfManual();
                        else saveSettings();
                        if (
                            stryMutAct_9fa48("7380")
                                ? id.endsWith("dir")
                                : stryMutAct_9fa48("7379")
                                  ? false
                                  : stryMutAct_9fa48("7378")
                                    ? true
                                    : (stryCov_9fa48("7378", "7379", "7380"),
                                      id.startsWith(
                                          stryMutAct_9fa48("7381") ? "" : (stryCov_9fa48("7381"), "dir")
                                      ))
                        ) {
                            if (stryMutAct_9fa48("7382")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7382");
                                void checkSelectionAndUpdateButtons();
                            }
                        }
                    }
                };
            }
        });
    }
}
function exportSettingsAsDownload() {
    if (stryMutAct_9fa48("7383")) {
        {
        }
    } else {
        stryCov_9fa48("7383");
        saveSettings();
        const s = getSettingsFromUi();
        const json = JSON.stringify(s, null, 2);
        const blob = new Blob(
            stryMutAct_9fa48("7384") ? [] : (stryCov_9fa48("7384"), [json]),
            stryMutAct_9fa48("7385")
                ? {}
                : (stryCov_9fa48("7385"),
                  {
                      type: stryMutAct_9fa48("7386") ? "" : (stryCov_9fa48("7386"), "application/json"),
                  })
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement(stryMutAct_9fa48("7387") ? "" : (stryCov_9fa48("7387"), "a"));
        a.href = url;
        a.download = stryMutAct_9fa48("7388")
            ? ""
            : (stryCov_9fa48("7388"), "serbian-transliterator-settings.json");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
function handleFileImport(e: Event) {
    if (stryMutAct_9fa48("7389")) {
        {
        }
    } else {
        stryCov_9fa48("7389");
        const input = e.target as HTMLInputElement;
        if (
            stryMutAct_9fa48("7392")
                ? false
                : stryMutAct_9fa48("7391")
                  ? true
                  : stryMutAct_9fa48("7390")
                    ? input.files?.[0]
                    : (stryCov_9fa48("7390", "7391", "7392"),
                      !(stryMutAct_9fa48("7393")
                          ? input.files[0]
                          : (stryCov_9fa48("7393"), input.files?.[0])))
        )
            return;
        const reader = new FileReader();
        reader.onload = (_evt) => {
            if (stryMutAct_9fa48("7394")) {
                {
                }
            } else {
                stryCov_9fa48("7394");
                try {
                    if (stryMutAct_9fa48("7395")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7395");
                        const json = reader.result as string;
                        const parsed = JSON.parse(json);
                        if (
                            stryMutAct_9fa48("7398")
                                ? typeof parsed.profile !== "string" && !Array.isArray(parsed.userWordsCustom)
                                : stryMutAct_9fa48("7397")
                                  ? false
                                  : stryMutAct_9fa48("7396")
                                    ? true
                                    : (stryCov_9fa48("7396", "7397", "7398"),
                                      (stryMutAct_9fa48("7400")
                                          ? typeof parsed.profile === "string"
                                          : stryMutAct_9fa48("7399")
                                            ? false
                                            : (stryCov_9fa48("7399", "7400"),
                                              typeof parsed.profile !==
                                                  (stryMutAct_9fa48("7401")
                                                      ? ""
                                                      : (stryCov_9fa48("7401"), "string")))) ||
                                          (stryMutAct_9fa48("7402")
                                              ? Array.isArray(parsed.userWordsCustom)
                                              : (stryCov_9fa48("7402"),
                                                !Array.isArray(parsed.userWordsCustom))))
                        )
                            throw new Error();
                        const newSettings: UiSettings = stryMutAct_9fa48("7403")
                            ? {}
                            : (stryCov_9fa48("7403"),
                              {
                                  ...DEFAULT_SETTINGS,
                                  ...parsed,
                                  schemaVersion: 2,
                              });
                        saveSettingsToStorage(SETTINGS_KEY, newSettings);
                        initUi();
                        invalidatePreviewCache();
                        setStatus(
                            t(
                                stryMutAct_9fa48("7404")
                                    ? ""
                                    : (stryCov_9fa48("7404"), "status_settings_loaded")
                            ),
                            stryMutAct_9fa48("7405") ? "" : (stryCov_9fa48("7405"), "success")
                        );
                    }
                } catch {
                    if (stryMutAct_9fa48("7406")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7406");
                        setStatus(
                            t(
                                stryMutAct_9fa48("7407")
                                    ? ""
                                    : (stryCov_9fa48("7407"), "status_settings_error")
                            ),
                            stryMutAct_9fa48("7408") ? "" : (stryCov_9fa48("7408"), "error")
                        );
                    }
                }
                input.value = stryMutAct_9fa48("7409") ? "Stryker was here!" : (stryCov_9fa48("7409"), "");
            }
        };
        reader.readAsText(input.files[0]);
    }
}
function setCheckValue(id: string, val: boolean) {
    if (stryMutAct_9fa48("7410")) {
        {
        }
    } else {
        stryCov_9fa48("7410");
        const el = getOptional<HTMLInputElement>(id);
        if (
            stryMutAct_9fa48("7412")
                ? false
                : stryMutAct_9fa48("7411")
                  ? true
                  : (stryCov_9fa48("7411", "7412"), el)
        )
            el.checked = val;
    }
}
function setRadioValue(name: string, val: string) {
    if (stryMutAct_9fa48("7413")) {
        {
        }
    } else {
        stryCov_9fa48("7413");
        const els = document.getElementsByName(name);
        for (
            let i = 0;
            stryMutAct_9fa48("7416")
                ? i >= els.length
                : stryMutAct_9fa48("7415")
                  ? i <= els.length
                  : stryMutAct_9fa48("7414")
                    ? false
                    : (stryCov_9fa48("7414", "7415", "7416"), i < els.length);
            stryMutAct_9fa48("7417") ? i-- : (stryCov_9fa48("7417"), i++)
        ) {
            if (stryMutAct_9fa48("7418")) {
                {
                }
            } else {
                stryCov_9fa48("7418");
                const el = els[i] as HTMLInputElement;
                if (
                    stryMutAct_9fa48("7421")
                        ? el.value !== val
                        : stryMutAct_9fa48("7420")
                          ? false
                          : stryMutAct_9fa48("7419")
                            ? true
                            : (stryCov_9fa48("7419", "7420", "7421"), el.value === val)
                )
                    el.checked = stryMutAct_9fa48("7422") ? false : (stryCov_9fa48("7422"), true);
            }
        }
    }
}
