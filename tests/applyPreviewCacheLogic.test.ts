import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyFromPreview } from "../src/taskpane/app/word/apply";
import { state } from "../src/taskpane/app/state";
import { setStatus } from "../src/taskpane/app/status";
import { decidePreviewCacheReuse } from "../src/taskpane/app/word/previewCacheDecision";
import { invalidatePreviewCache } from "../src/taskpane/app/preview/cache";

// Mocks
vi.mock("../src/taskpane/app/status", () => ({ setStatus: vi.fn(), refreshStats: vi.fn() }));
vi.mock("../src/taskpane/app/modal/modal", () => ({ showModalInfo: vi.fn(), confirmInPanel: vi.fn() }));

// FIX 1: Mock return value for applyPipeline
vi.mock("../src/taskpane/app/word/pipeline", () => ({
    applyPipeline: vi.fn(async () => ({
        result: { type: "Lat -> Cyr", stats: { timingMs: 0 } },
        extras: {},
    })),
}));

vi.mock("../src/taskpane/app/settings/getters", () => ({
    getSettingsFromUi: () => ({ confirmWholeDoc: false }),
    getOoxmlOptionsFromUi: () => ({}),
}));
vi.mock("../src/taskpane/app/preview/cache", () => ({ invalidatePreviewCache: vi.fn() }));
vi.mock("../src/taskpane/app/selection", () => ({
    normalizeForSelectionHash: (s: string) => s,
    sha256Hex: async (s: string) => "hash_" + s,
    analyzeSelectionText: () => ({ hasText: true, isJustWhitespace: false, raw: "Text" }),
}));
vi.mock("../src/taskpane/app/word/statsText", () => ({
    buildPreviewAppliedStats: () => ({ text: "Stats" }),
    buildApplyStatsText: () => "Stats",
}));

// FIX 2: Mock DB to prevent ReferenceError: indexedDB is not defined
vi.mock("../src/taskpane/app/telemetry/db", () => ({
    addLog: vi.fn(),
    initDB: vi.fn(),
}));

// Mock logger to avoid console spam
vi.mock("../src/taskpane/app/telemetry/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock decision logic to force paths
vi.mock("../src/taskpane/app/word/previewCacheDecision", () => ({
    decidePreviewCacheReuse: vi.fn(),
}));

describe("word/apply.ts - Preview Cache Logic", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        (globalThis as any).Word = {
            run: async (cb: any) =>
                cb({
                    document: {
                        getSelection: () => ({
                            text: "Text",
                            load: () => {},
                            getOoxml: () => ({ value: "<xml/>" }),
                            insertOoxml: vi.fn(),
                        }),
                    },
                    sync: async () => {},
                }),
            InsertLocation: { replace: "replace" },
        };

        state.preview.interactiveDiff = null;
        state.preview.convertedOoxml = "<cached/>";
    });

    it("Applies cached OOXML when decision is OK", async () => {
        (decidePreviewCacheReuse as any).mockReturnValue({ ok: true, reason: "ok" });

        await applyFromPreview("selection");

        expect(setStatus).toHaveBeenLastCalledWith(expect.stringContaining("Završeno"), "success");
        expect(invalidatePreviewCache).not.toHaveBeenCalled();
    });

    it("Invalidates cache and re-runs pipeline when decision is NOT OK (expired)", async () => {
        (decidePreviewCacheReuse as any).mockReturnValue({ ok: false, reason: "expired" });

        await applyFromPreview("selection");

        expect(invalidatePreviewCache).toHaveBeenCalled();
        expect(setStatus).toHaveBeenCalledWith(expect.stringContaining("cache"), "info");
        // Pipeline should be called (mocked)
    });

    it("Invalidates cache and re-runs pipeline when decision is NOT OK (optsChanged)", async () => {
        (decidePreviewCacheReuse as any).mockReturnValue({ ok: false, reason: "optsChanged" });

        await applyFromPreview("selection");

        expect(invalidatePreviewCache).toHaveBeenCalled();
        expect(setStatus).toHaveBeenCalledWith(expect.stringContaining("podešavanja"), "info");
    });
});
