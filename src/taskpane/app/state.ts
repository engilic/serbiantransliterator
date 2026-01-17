// src/taskpane/app/state.ts

import type { PreviewState, ProfilePreset } from "./types";

export const PREVIEW_CACHE_TTL_MS = 30_000;

const preview: PreviewState = {
    scope: "selection",
    settingsSnap: null,

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
};

export const state = {
    customWordsSet: new Set<string>(),
    presetWordsSet: new Set<string>(),

    currentProfile: "custom" as ProfilePreset,

    // No hardcoded language here. status.ts will fallback using i18n keys.
    lastStatsTitle: "",
    lastStatsText: "",

    selectionTimeout: null as ReturnType<typeof setTimeout> | null,
    isApplyingProfile: false,

    selectionChangeHandler: null as (() => void) | null,

    preview,
};
