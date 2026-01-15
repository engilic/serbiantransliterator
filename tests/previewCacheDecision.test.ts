import { describe, it, expect } from "vitest";
import { decidePreviewCacheReuse } from "../src/taskpane/app/word/previewCacheDecision";

describe("word/previewCacheDecision.decidePreviewCacheReuse", () => {
    const now = 1_000_000;
    const ttl = 30_000;

    const baseSnapshot = {
        convertedOoxml: "<xml/>",
        ooxmlOptsSnapJson: '{"direction":"lat-to-cyr"}',
        selectionTextHash: "t1",
        selectionOoxmlHash: "o1",
        cacheTimestamp: now - 10_000,
    };

    const baseCurrent = {
        currentOptsJson: '{"direction":"lat-to-cyr"}',
        currentSelectionTextHash: "t1",
        currentSelectionOoxmlHash: "o1",
    };

    it("ok when everything matches and within TTL", () => {
        const r = decidePreviewCacheReuse({
            snapshot: baseSnapshot,
            current: baseCurrent,
            nowMs: now,
            ttlMs: ttl,
        });
        expect(r.ok).toBe(true);
        expect(r.reason).toBe("ok");
    });

    it("missing when any required field is missing", () => {
        const r = decidePreviewCacheReuse({
            snapshot: { ...baseSnapshot, convertedOoxml: null },
            current: baseCurrent,
            nowMs: now,
            ttlMs: ttl,
        });
        expect(r.ok).toBe(false);
        expect(r.reason).toBe("missing");
    });

    it("optsChanged when opts json differs", () => {
        const r = decidePreviewCacheReuse({
            snapshot: baseSnapshot,
            current: { ...baseCurrent, currentOptsJson: '{"direction":"cyr-to-lat"}' },
            nowMs: now,
            ttlMs: ttl,
        });
        expect(r.ok).toBe(false);
        expect(r.reason).toBe("optsChanged");
    });

    it("expired when TTL exceeded", () => {
        const r = decidePreviewCacheReuse({
            snapshot: { ...baseSnapshot, cacheTimestamp: now - (ttl + 1) },
            current: baseCurrent,
            nowMs: now,
            ttlMs: ttl,
        });
        expect(r.ok).toBe(false);
        expect(r.reason).toBe("expired");
    });

    it("selectionTextChanged when text hash differs", () => {
        const r = decidePreviewCacheReuse({
            snapshot: baseSnapshot,
            current: { ...baseCurrent, currentSelectionTextHash: "t2" },
            nowMs: now,
            ttlMs: ttl,
        });
        expect(r.ok).toBe(false);
        expect(r.reason).toBe("selectionTextChanged");
    });

    it("selectionOoxmlChanged when OOXML hash differs", () => {
        const r = decidePreviewCacheReuse({
            snapshot: baseSnapshot,
            current: { ...baseCurrent, currentSelectionOoxmlHash: "o2" },
            nowMs: now,
            ttlMs: ttl,
        });
        expect(r.ok).toBe(false);
        expect(r.reason).toBe("selectionOoxmlChanged");
    });
});