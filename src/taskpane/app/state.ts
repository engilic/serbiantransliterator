// src/taskpane/app/state.ts

import type { UiSettings, PreviewState, ProfilePreset } from "./types";
import { DEFAULT_SETTINGS } from "./settings/defaults";
import type { InteractiveDiff } from "../../shared/diff/interactive";

export const PREVIEW_CACHE_TTL_MS = 60_000; // 1 minut

export interface ExtendedPreviewState extends PreviewState {
    // NEW: Interactive Diff Instance
    interactiveDiff: InteractiveDiff | null;
}

interface AppState {
    currentProfile: ProfilePreset;
    isApplyingProfile: boolean;
    customWordsSet: Set<string>;
    presetWordsSet: Set<string>;

    lastStatsTitle: string;
    lastStatsText: string;

    selectionChangeHandler: ((args: any) => void) | null;
    selectionTimeout: ReturnType<typeof setTimeout> | null;

    preview: ExtendedPreviewState;
}

export const state: AppState = {
    currentProfile: "custom",
    isApplyingProfile: false,
    customWordsSet: new Set(),
    presetWordsSet: new Set(),

    lastStatsTitle: "",
    lastStatsText: "",

    selectionChangeHandler: null,
    selectionTimeout: null,

    preview: {
        scope: "selection",
        settingsSnap: { ...DEFAULT_SETTINGS },

        mode: "diff",
        typeText: "",
        titleText: "",
        original: "",
        converted: "",

        allParagraphs: [],
        shownCount: 0,
        canLoadMore: false,

        toastTimer: null,

        convertedOoxml: null,
        ooxmlOptsSnapJson: null,
        selectionTextHash: null,
        selectionOoxmlHash: null,

        cacheTimestamp: null,

        interactiveDiff: null,
    },
};
