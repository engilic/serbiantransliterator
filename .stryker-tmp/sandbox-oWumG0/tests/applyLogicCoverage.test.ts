// @ts-nocheck
// tests/applyLogicCoverage.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyFromPreview } from "../src/taskpane/app/word/apply";
import { state } from "../src/taskpane/app/state";
import { setStatus } from "../src/taskpane/app/status";
import { invalidatePreviewCache } from "../src/taskpane/app/preview/cache";

// Mocks
vi.mock("../src/taskpane/app/status", () => ({ setStatus: vi.fn(), refreshStats: vi.fn() }));
vi.mock("../src/taskpane/app/modal/modal", () => ({ showModalInfo: vi.fn(), confirmInPanel: vi.fn() }));
vi.mock("../src/taskpane/app/word/pipeline", () => ({
    applyPipeline: vi.fn(async () => ({ result: null, extras: {} })), // Force null result path
}));
vi.mock("../src/taskpane/app/settings/getters", () => ({
    getSettingsFromUi: () => ({ confirmWholeDoc: false }),
    getOoxmlOptionsFromUi: () => ({}),
}));
vi.mock("../src/taskpane/app/preview/cache", () => ({ invalidatePreviewCache: vi.fn() }));
vi.mock("../src/taskpane/app/selection", () => ({
    normalizeForSelectionHash: (s: string) => s,
    sha256Hex: async (s: string) => "hash_" + s,
}));

// Mock i18n to behave predictably if needed, but here we assume it works
// We will match against the actual Serbian translation

describe("word/apply.ts coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock Word
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
    });

    it("handles invalid cache reason correctly (shows info status)", async () => {
        // Setup state to simulate expired cache
        state.preview.convertedOoxml = "<xml>OLD</xml>";
        state.preview.ooxmlOptsSnapJson = "{}";
        state.preview.selectionTextHash = "hash_Text";
        state.preview.selectionOoxmlHash = "hash_<xml/>";
        state.preview.cacheTimestamp = Date.now() - 1000000; // Expired

        await applyFromPreview("selection");

        expect(invalidatePreviewCache).toHaveBeenCalled();
        // "cache je istekao" or similar
        expect(setStatus).toHaveBeenCalledWith(expect.stringMatching(/cache/i), "info");
    });

    it("handles null result from pipeline (status_no_text_found)", async () => {
        // Cache missing -> pipeline called -> returns null (mocked)
        state.preview.convertedOoxml = null;

        await applyFromPreview("selection");

        // "Nije pronađen tekst za obradu."
        expect(setStatus).toHaveBeenCalledWith(expect.stringMatching(/Nije pronađen tekst/i), "neutral");
    });
});
