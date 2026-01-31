// src/taskpane/app/types.ts
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
    return {
        headersFootersProcessed: 0,
        footnotesProcessed: 0,
        endnotesProcessed: 0,
        footnotesSupported: true,
        endnotesSupported: true,
    };
}
