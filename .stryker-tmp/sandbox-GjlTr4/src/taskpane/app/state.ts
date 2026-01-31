// @ts-nocheck
// src/taskpane/app/state.ts
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
import type { UiSettings, PreviewState, ProfilePreset } from "./types";
import { DEFAULT_SETTINGS } from "./settings/defaults";
import type { InteractiveDiff } from "../../shared/diff/interactive";
export const PREVIEW_CACHE_TTL_MS = 60_000;
export interface ExtendedPreviewState extends PreviewState {
    interactiveDiff: InteractiveDiff | null;
    renderSession?: number;
}
interface AppState {
    currentProfile: ProfilePreset;
    isApplyingProfile: boolean;
    customWordsSet: Set<string>;
    presetWordsSet: Set<string>;
    lastStatsText: string;
    selectionChangeHandler: ((args: unknown) => void) | null;
    selectionTimeout: ReturnType<typeof setTimeout> | null;
    preview: ExtendedPreviewState;
    activeAbortController: AbortController | null;
    activeOperation: string | null;
}
export const state: AppState = stryMutAct_9fa48("7423")
    ? {}
    : (stryCov_9fa48("7423"),
      {
          currentProfile: stryMutAct_9fa48("7424") ? "" : (stryCov_9fa48("7424"), "custom"),
          isApplyingProfile: stryMutAct_9fa48("7425") ? true : (stryCov_9fa48("7425"), false),
          customWordsSet: new Set(),
          presetWordsSet: new Set(),
          lastStatsText: stryMutAct_9fa48("7426") ? "Stryker was here!" : (stryCov_9fa48("7426"), ""),
          selectionChangeHandler: null,
          selectionTimeout: null,
          preview: stryMutAct_9fa48("7427")
              ? {}
              : (stryCov_9fa48("7427"),
                {
                    scope: stryMutAct_9fa48("7428") ? "" : (stryCov_9fa48("7428"), "selection"),
                    settingsSnap: stryMutAct_9fa48("7429")
                        ? {}
                        : (stryCov_9fa48("7429"),
                          {
                              ...DEFAULT_SETTINGS,
                          }),
                    mode: stryMutAct_9fa48("7430") ? "" : (stryCov_9fa48("7430"), "diff"),
                    typeText: stryMutAct_9fa48("7431") ? "Stryker was here!" : (stryCov_9fa48("7431"), ""),
                    titleText: stryMutAct_9fa48("7432") ? "Stryker was here!" : (stryCov_9fa48("7432"), ""),
                    original: stryMutAct_9fa48("7433") ? "Stryker was here!" : (stryCov_9fa48("7433"), ""),
                    converted: stryMutAct_9fa48("7434") ? "Stryker was here!" : (stryCov_9fa48("7434"), ""),
                    allParagraphs: stryMutAct_9fa48("7435")
                        ? ["Stryker was here"]
                        : (stryCov_9fa48("7435"), []),
                    shownCount: 0,
                    canLoadMore: stryMutAct_9fa48("7436") ? true : (stryCov_9fa48("7436"), false),
                    toastTimer: null,
                    convertedOoxml: null,
                    ooxmlOptsSnapJson: null,
                    selectionTextHash: null,
                    selectionOoxmlHash: null,
                    cacheTimestamp: null,
                    interactiveDiff: null,
                    renderSession: 0,
                }),
          activeAbortController: null,
          activeOperation: null,
      });
