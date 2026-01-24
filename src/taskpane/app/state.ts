// src/taskpane/app/state.ts

import type { UiSettings, PreviewState, ProfilePreset } from "./types";
import { DEFAULT_SETTINGS } from "./settings/defaults";
import type { InteractiveDiff } from "../../shared/diff/interactive";

export const PREVIEW_CACHE_TTL_MS = 60_000; // 1 minut

export interface ExtendedPreviewState extends PreviewState {
    interactiveDiff: InteractiveDiff | null;

    // PR1/PR2/PR3 may already have something similar; keep it simple:
    // Used to cancel async preview render loops if present in your codebase.
    renderSession?: number;
}

interface AppState {
    currentProfile: ProfilePreset;
    isApplyingProfile: boolean;
    customWordsSet: Set<string>;
    presetWordsSet: Set<string>;

    lastStatsTitle: string;
    lastStatsText: string;

    selectionChangeHandler: ((args: unknown) => void) | null;
    selectionTimeout: ReturnType<typeof setTimeout> | null;

    preview: ExtendedPreviewState;

    // PR4: global cancellation (Escape cancels long operations)
    activeAbortController: AbortController | null;
    activeOperation: string | null; // e.g. "runSmart", "runPreview", "webBatch"
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

        // ok if unused elsewhere
        renderSession: 0,
    },

    activeAbortController: null,
    activeOperation: null,
};
