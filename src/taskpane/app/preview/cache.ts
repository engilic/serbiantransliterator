// src/taskpane/app/preview/cache.ts
import { state, PREVIEW_CACHE_TTL_MS } from "../state";

export function invalidatePreviewCache() {
    state.preview.convertedOoxml = null;
    state.preview.ooxmlOptsSnapJson = null;
    state.preview.selectionTextHash = null;
    state.preview.selectionOoxmlHash = null;
    state.preview.cacheTimestamp = null;
}

export function isPreviewCacheValid(): boolean {
    if (!state.preview.convertedOoxml || !state.preview.cacheTimestamp) return false;

    const age = Date.now() - state.preview.cacheTimestamp;
    return age < PREVIEW_CACHE_TTL_MS;
}
