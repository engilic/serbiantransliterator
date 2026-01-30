// src/taskpane/app/word/previewCacheDecision.ts

export type PreviewCacheDecisionReason =
    | "ok"
    | "missing"
    | "optsChanged"
    | "expired"
    | "selectionTextChanged"
    | "selectionOoxmlChanged";

export type PreviewCacheSnapshot = {
    convertedOoxml: string | null;
    ooxmlOptsSnapJson: string | null;
    selectionTextHash: string | null;
    selectionOoxmlHash: string | null;
    cacheTimestamp: number | null;
};

export type PreviewCacheCurrent = {
    currentOptsJson: string;
    currentSelectionTextHash: string;
    currentSelectionOoxmlHash: string;
};

export function decidePreviewCacheReuse(params: {
    snapshot: PreviewCacheSnapshot;
    current: PreviewCacheCurrent;
    nowMs: number;
    ttlMs: number;
}): { ok: boolean; reason: PreviewCacheDecisionReason } {
    const { snapshot, current, nowMs, ttlMs } = params;

    if (
        !snapshot.convertedOoxml ||
        !snapshot.ooxmlOptsSnapJson ||
        !snapshot.selectionTextHash ||
        !snapshot.selectionOoxmlHash ||
        !snapshot.cacheTimestamp
    ) {
        return { ok: false, reason: "missing" };
    }

    if (current.currentOptsJson !== snapshot.ooxmlOptsSnapJson) {
        return { ok: false, reason: "optsChanged" };
    }

    const age = nowMs - snapshot.cacheTimestamp;
    if (!(age >= 0 && age < ttlMs)) {
        return { ok: false, reason: "expired" };
    }

    if (current.currentSelectionTextHash !== snapshot.selectionTextHash) {
        return { ok: false, reason: "selectionTextChanged" };
    }

    if (current.currentSelectionOoxmlHash !== snapshot.selectionOoxmlHash) {
        return { ok: false, reason: "selectionOoxmlChanged" };
    }

    return { ok: true, reason: "ok" };
}
