// @ts-nocheck
// src/taskpane/app/index.ts

export { initTaskpane } from "./init";

// Optional convenience exports
export { state, PREVIEW_CACHE_TTL_MS } from "./state";
export type { UiSettings, PreviewState, ProfilePreset, DirectionUi } from "./types";

export { setStatus, refreshStats } from "./status";
export { runWithUiLock } from "./uiLock";
