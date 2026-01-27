// src/taskpane/app/state.ts

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

export const state: AppState = {
    currentProfile: "custom",
    isApplyingProfile: false,
    customWordsSet: new Set(),
    presetWordsSet: new Set(),

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
        renderSession: 0,
    },

    activeAbortController: null,
    activeOperation: null,
};
