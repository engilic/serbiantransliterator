import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyFromPreview } from "../src/taskpane/app/word/apply";
import { state } from "../src/taskpane/app/state";
import { setStatus } from "../src/taskpane/app/status";
import { InteractiveDiff } from "../src/shared/diff/interactive";
import { decidePreviewCacheReuse } from "../src/taskpane/app/word/previewCacheDecision";

// Mocks
vi.mock("../src/taskpane/app/status", () => ({ setStatus: vi.fn(), refreshStats: vi.fn() }));
vi.mock("../src/taskpane/app/modal/modal", () => ({ showModalInfo: vi.fn(), confirmInPanel: vi.fn() }));
vi.mock("../src/taskpane/app/word/pipeline", () => ({ applyPipeline: vi.fn() }));
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
}));

// Mock decidePreviewCacheReuse to control flow easily
vi.mock("../src/taskpane/app/word/previewCacheDecision", () => ({
    decidePreviewCacheReuse: vi.fn(),
}));

describe("word/apply.ts - Manual & Cache Flows", () => {
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
                            insertText: vi.fn(), // For manual changes
                        }),
                    },
                    sync: async () => {},
                }),
            InsertLocation: { replace: "replace" },
        };
    });

    it("applies MANUAL changes (insertText) when InteractiveDiff has rejections", async () => {
        // Setup state with manual changes
        const diff = new InteractiveDiff([{ type: "insert", value: "New" }]);
        diff.toggle(0); // Reject -> Manual change

        state.preview.interactiveDiff = diff;

        await applyFromPreview("selection");

        // Verify LAST call to setStatus (success message)
        // Ignoring the intermediate "Applying..." info status
        expect(setStatus).toHaveBeenLastCalledWith(
            expect.stringContaining("Završeno (primenjen preview)"),
            "success"
        );
    });

    it("applies CACHED OOXML when preview cache is valid (ok: true)", async () => {
        state.preview.interactiveDiff = null; // No manual changes
        state.preview.convertedOoxml = "<cached/>";

        // Force cache decision to be OK
        (decidePreviewCacheReuse as any).mockReturnValue({ ok: true, reason: "ok" });

        await applyFromPreview("selection");

        expect(setStatus).toHaveBeenLastCalledWith(
            expect.stringContaining("Završeno (primenjen preview)"),
            "success"
        );
    });
});
