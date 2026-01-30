// tests/wordPipeline.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../src/taskpane/app/status", () => ({
    setStatus: vi.fn(),
}));

vi.mock("../src/taskpane/app/modal/modal", () => ({
    showModalInfo: vi.fn(),
}));

vi.mock("../src/taskpane/app/word/extras", () => ({
    applyExtrasIfEnabled: vi.fn(async () => ({
        headersFootersProcessed: 0,
        footnotesProcessed: 0,
        endnotesProcessed: 0,
        footnotesSupported: true,
        endnotesSupported: true,
    })),
}));

// PR1: processDocumentInChunks now returns { type, stats }
vi.mock("../src/taskpane/app/word/chunking", () => ({
    processDocumentInChunks: vi.fn(async () => ({
        type: "Lat → Ćir",
        stats: {
            direction: "lat-to-cyr",
            textNodes: 100,
            charsBefore: 1000,
            charsAfter: 1000,
            detected: { urls: 0, emails: 0 },
            code: { fenceMarkersSeen: 0, inlineTicksSeen: 0, endedInFence: false, endedInInline: false },
            bridges: {
                links: 0,
                placeholders: 0,
                brandPhrases: 0,
                brandTokens: 0,
                ambiguousBrandSuffix: 0,
                digraphs: 0,
                userPhrases: 0,
                userTokens: 0,
                allCapsHints: 0,
                spaces: 0,
            },
            proofing: {
                enabled: false,
                targetLang: null,
                changedRuns: 0,
                skippedRuns: 0,
                skippedByReason: {},
            },
            timingMs: 123,
        },
    })),
}));

import { applyPipeline } from "../src/taskpane/app/word/pipeline";
import { showModalInfo } from "../src/taskpane/app/modal/modal";
import { applyExtrasIfEnabled } from "../src/taskpane/app/word/extras";
import { processDocumentInChunks } from "../src/taskpane/app/word/chunking";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function makeSimpleLatinOoxml(text: string) {
    return `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p><w:r><w:t>${text}</w:t></w:r></w:p>
  </w:body>
</w:document>`;
}

function makeContextWithSelectionText(selectionText: string) {
    const selectionRange = {
        text: selectionText,
        load: vi.fn(),
        getOoxml: vi.fn(() => ({ value: makeSimpleLatinOoxml("Zdravo") })),
        insertOoxml: vi.fn(),
        select: vi.fn(),
    };

    const bodyRange = {
        getOoxml: vi.fn(() => ({ value: makeSimpleLatinOoxml("Zdravo") })),
        insertOoxml: vi.fn(),
    };

    const context = {
        document: {
            getSelection: () => selectionRange,
            body: {
                getRange: (_type: string) => bodyRange,
                paragraphs: {
                    load: vi.fn(),
                    items: [],
                },
            },
        },
        sync: vi.fn(async () => undefined),
    };

    return { context, selectionRange, bodyRange };
}

beforeEach(() => {
    vi.resetAllMocks();

    (globalThis as any).Word = {
        InsertLocation: { replace: "replace" },
    };
});

afterEach(() => {
    delete (globalThis as any).Word;
});

describe("word/pipeline.applyPipeline (stubbed)", () => {
    it("selection: whitespace-only => showModalInfo + result=null", async () => {
        const { context } = makeContextWithSelectionText("   \n\t  ");

        const ui: any = { includeHeadersFooters: false, includeFootnotes: false, includeEndnotes: false };
        const opts: any = { direction: "lat-to-cyr" };

        const r = await applyPipeline(context as any, "selection", ui, opts);

        expect(showModalInfo).toHaveBeenCalledTimes(1);
        expect(r.result).toBeNull();
    });

    it("selection: valid => converts and calls insertOoxml + select()", async () => {
        const { context, selectionRange } = makeContextWithSelectionText("Zdravo");

        const ui: any = { includeHeadersFooters: false, includeFootnotes: false, includeEndnotes: false };
        const opts: any = { direction: "lat-to-cyr" };

        const r = await applyPipeline(context as any, "selection", ui, opts);

        expect(r.result).not.toBeNull();
        expect(r.result!.type).toBe("Lat → Ćir");

        expect(selectionRange.insertOoxml).toHaveBeenCalledTimes(1);
        expect(selectionRange.select).toHaveBeenCalledTimes(1);

        const args = (selectionRange.insertOoxml as any).mock.calls[0];
        expect(args[1]).toBe("replace");
    });

    it("document: calls extras then calls processDocumentInChunks and returns aggregated stats", async () => {
        const { context } = makeContextWithSelectionText("");

        const ui: any = { includeHeadersFooters: true, includeFootnotes: true, includeEndnotes: true };
        const opts: any = { direction: "lat-to-cyr" };

        const r = await applyPipeline(context as any, "document", ui, opts);

        expect(applyExtrasIfEnabled).toHaveBeenCalledTimes(1);
        expect(processDocumentInChunks).toHaveBeenCalledTimes(1);
        expect(processDocumentInChunks).toHaveBeenCalledWith(context, opts);

        expect(r.result).not.toBeNull();
        expect(r.result!.type).toBe("Lat → Ćir");
        expect(r.result!.stats.textNodes).toBe(100);
        expect(r.result!.stats.timingMs).toBe(123);
    });
});
