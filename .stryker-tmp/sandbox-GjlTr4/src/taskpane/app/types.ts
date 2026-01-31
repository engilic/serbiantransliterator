// @ts-nocheck
// src/taskpane/app/types.ts
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
import type { CurlyProtectionUi } from "./word/curlyProtection";
import type { InteractiveDiff } from "../../shared/diff/interactive";
export type DirectionUi = "auto" | "lat-to-cyr" | "cyr-to-lat" | "to-ascii";
export type ProfilePreset = "custom" | "it" | "finance" | "medical" | "legal" | "journalism" | "marketing";
export type AppTheme = "auto" | "light" | "dark";
export type DialectUi = "none" | "ekavica_to_ijekavica" | "ijekavica_to_ekavica";
export interface UiSettings {
    schemaVersion: 2;
    profile: ProfilePreset;
    userWordsCustom: string[];
    theme: AppTheme;
    customSubstitutions: string;
    dialect: DialectUi;

    // [NEW]
    ignoredStyles: string[];
    protectBrands: boolean;
    applySerbianQuotes: boolean;
    preserveCodeBlocks: boolean;
    setProofingLanguage: boolean;
    protectRomans: boolean;
    curlyProtection: CurlyProtectionUi;
    confirmWholeDoc: boolean;
    includeHeadersFooters: boolean;
    includeFootnotes: boolean;
    includeEndnotes: boolean;
    direction: DirectionUi;
}
export type PreviewScope = "selection" | "document";
export type PreviewMode = "diff" | "plain" | "side";
export interface PreviewState {
    scope: PreviewScope;
    settingsSnap: UiSettings | null;
    mode: PreviewMode;
    typeText: string;
    titleText: string;
    original: string;
    converted: string;
    allParagraphs: string[];
    shownCount: number;
    canLoadMore: boolean;
    toastTimer: ReturnType<typeof setTimeout> | null;
    convertedOoxml: string | null;
    ooxmlOptsSnapJson: string | null;
    selectionTextHash: string | null;
    selectionOoxmlHash: string | null;
    cacheTimestamp: number | null;
    interactiveDiff: InteractiveDiff | null;
    renderSession?: number;
}
export type ExtrasSummary = {
    headersFootersProcessed: number;
    footnotesProcessed: number;
    endnotesProcessed: number;
    footnotesSupported: boolean;
    endnotesSupported: boolean;
};
export function emptyExtrasSummary(): ExtrasSummary {
    if (stryMutAct_9fa48("7712")) {
        {
        }
    } else {
        stryCov_9fa48("7712");
        return stryMutAct_9fa48("7713")
            ? {}
            : (stryCov_9fa48("7713"),
              {
                  headersFootersProcessed: 0,
                  footnotesProcessed: 0,
                  endnotesProcessed: 0,
                  footnotesSupported: stryMutAct_9fa48("7714") ? false : (stryCov_9fa48("7714"), true),
                  endnotesSupported: stryMutAct_9fa48("7715") ? false : (stryCov_9fa48("7715"), true),
              });
    }
}
