// tests/wordApplyFromPreviewRouting.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Mocks must be declared before importing the module-under-test.
 */

vi.mock("../src/taskpane/app/status", () => ({
    setStatus: vi.fn(),
    refreshStats: vi.fn(),
}));

vi.mock("../src/taskpane/app/modal/modal", () => ({
    confirmInPanel: vi.fn(),
    showModalInfo: vi.fn(),
}));

vi.mock("../src/taskpane/app/word/pipeline", () => ({
    applyPipeline: vi.fn(),
}));

vi.mock("../src/taskpane/app/settings/getters", () => ({
    getSettingsFromUi: vi.fn(),
    getOoxmlOptionsFromUi: vi.fn(),
}));

vi.mock("../src/taskpane/app/word/statsText", () => ({
    buildApplyStatsTitle: vi.fn(() => "TITLE"),
    buildApplyStatsText: vi.fn(() => "TEXT"),
    buildPreviewAppliedStats: vi.fn(() => ({ title: "PREVIEW", text: "PREVIEW_TEXT" })),
}));

vi.mock("../src/taskpane/app/preview/cache", () => ({
    invalidatePreviewCache: vi.fn(),
}));

// Deterministic hashing so we can match cache keys easily
vi.mock("../src/taskpane/app/selection", () => ({
    normalizeForSelectionHash: (s: string) => String(s ?? ""),
    sha256Hex: vi.fn(async (s: string) => `H:${String(s ?? "")}`),
}));

// ---- imports after mocks ----
import { applyFromPreview } from "../src/taskpane/app/word/apply";
import { state, PREVIEW_CACHE_TTL_MS } from "../src/taskpane/app/state";

import { setStatus } from "../src/taskpane/app/status";
import { applyPipeline } from "../src/taskpane/app/word/pipeline";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../src/taskpane/app/settings/getters";
import { invalidatePreviewCache } from "../src/taskpane/app/preview/cache";

function makeWordStub(selectionText: string, selectionOoxml: string) {
    const range = {
        text: selectionText,
        load: vi.fn(),
        getOoxml: vi.fn(() => ({ value: selectionOoxml })),
        insertOoxml: vi.fn(),
    };

    const context = {
        document: {
            getSelection: () => range,
        },
        sync: vi.fn(async () => undefined),
    };

    (globalThis as any).Word = {
        run: async (cb: (ctx: any) => Promise<void>) => {
            await cb(context);
        },
        InsertLocation: { replace: "replace" },
    };

    return { context, range };
}

const NOW = 2_000_000;

beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(NOW);

    // minimal settings/options used by applyFromPreview
    (getSettingsFromUi as any).mockReturnValue({ confirmWholeDoc: true });
    (getOoxmlOptionsFromUi as any).mockReturnValue({
        direction: "lat-to-cyr",
        protectBrands: false,
        preserveCodeBlocks: true,
        applySerbianQuotes: false,
    });

    // reset preview cache to a known baseline
    state.preview.convertedOoxml = null;
    state.preview.ooxmlOptsSnapJson = null;
    state.preview.selectionTextHash = null;
    state.preview.selectionOoxmlHash = null;
    state.preview.cacheTimestamp = null;

    // default pipeline fallback result
    (applyPipeline as any).mockResolvedValue({
        result: { type: "Lat → Ćir", stats: { timingMs: 12.3, bridges: {} } },
        extras: {
            headersFootersProcessed: 0,
            footnotesProcessed: 0,
            endnotesProcessed: 0,
            footnotesSupported: true,
            endnotesSupported: true,
        },
    });
});

afterEach(() => {
    (Date.now as any).mockRestore?.();
    delete (globalThis as any).Word;
});

describe("word/apply.applyFromPreview(selection) - cache routing", () => {
    it("cache valid => inserts cached OOXML and does NOT call applyPipeline", async () => {
        const selectionText = "Zdravo";
        const selectionOoxml = "<ooxml>original</ooxml>";

        const { range } = makeWordStub(selectionText, selectionOoxml);

        const opts =
            (getOoxmlOptionsFromUi as any).mock.results[0]?.value ?? (getOoxmlOptionsFromUi as any)();
        const optsJson = JSON.stringify(opts);

        // hashes must match our mocked sha256Hex("H:"+input)
        state.preview.convertedOoxml = "<ooxml>converted</ooxml>";
        state.preview.ooxmlOptsSnapJson = optsJson;
        state.preview.selectionTextHash = `H:${selectionText}`;
        state.preview.selectionOoxmlHash = `H:${selectionOoxml}`;
        state.preview.cacheTimestamp = NOW - 1000; // within TTL

        await applyFromPreview("selection");

        expect(range.insertOoxml).toHaveBeenCalledTimes(1);
        expect(range.insertOoxml).toHaveBeenCalledWith("<ooxml>converted</ooxml>", "replace");

        expect(applyPipeline).not.toHaveBeenCalled();
        expect(invalidatePreviewCache).not.toHaveBeenCalled();

        // status messages include "Primena pregleda..." and success
        expect(setStatus).toHaveBeenCalled();
    });

    it("cache expired => invalidates cache and falls back to applyPipeline", async () => {
        const selectionText = "Zdravo";
        const selectionOoxml = "<ooxml>original</ooxml>";

        const { range } = makeWordStub(selectionText, selectionOoxml);

        const opts =
            (getOoxmlOptionsFromUi as any).mock.results[0]?.value ?? (getOoxmlOptionsFromUi as any)();
        const optsJson = JSON.stringify(opts);

        state.preview.convertedOoxml = "<ooxml>converted</ooxml>";
        state.preview.ooxmlOptsSnapJson = optsJson;
        state.preview.selectionTextHash = `H:${selectionText}`;
        state.preview.selectionOoxmlHash = `H:${selectionOoxml}`;
        state.preview.cacheTimestamp = NOW - (PREVIEW_CACHE_TTL_MS + 1); // expired

        await applyFromPreview("selection");

        expect(invalidatePreviewCache).toHaveBeenCalledTimes(1);
        expect(applyPipeline).toHaveBeenCalledTimes(1);
        expect(range.insertOoxml).not.toHaveBeenCalledWith("<ooxml>converted</ooxml>", "replace");
    });
});
