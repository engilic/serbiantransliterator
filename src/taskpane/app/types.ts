// src/taskpane/app/types.ts

export type DirectionUi = "auto" | "lat-to-cyr" | "cyr-to-lat" | "to-ascii";
export type ProfilePreset = "custom" | "it" | "finance" | "medical" | "legal" | "journalism" | "marketing";

export interface UiSettings {
    schemaVersion: 2;

    profile: ProfilePreset;
    userWordsCustom: string[];

    protectBrands: boolean;
    applySerbianQuotes: boolean;
    preserveCodeBlocks: boolean;
    setProofingLanguage: boolean;
    protectRomans: boolean;

    fixDoubleSpaces: boolean;
    formatDates: boolean;

    confirmWholeDoc: boolean;
    includeHeadersFooters: boolean;
    includeFootnotes: boolean;
    includeEndnotes: boolean;

    showStats: boolean;
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

    // Cache (selection preview apply)
    convertedOoxml: string | null;
    ooxmlOptsSnapJson: string | null;
    selectionTextHash: string | null;

    // NEW: hash originalnog OOXML-a selekcije (hvata i formatiranje)
    selectionOoxmlHash: string | null;

    cacheTimestamp: number | null;
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