// tests/wordPipeline.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// 1. MOCKUJEMO workerClient pre svih importa
vi.mock("../src/taskpane/worker/client", () => ({
    workerClient: {
        init: vi.fn(async () => undefined),
        convert: vi.fn(async (xml) => ({
            xml: xml.includes("Zdravo") ? xml.replace("Zdravo", "Здраво") : "OK",
            type: "Lat → Ćir",
            stats: { direction: "lat-to-cyr", timingMs: 10 },
        })),
    },
}));

vi.mock("../src/taskpane/app/status", () => ({ setStatus: vi.fn() }));
vi.mock("../src/taskpane/app/modal/modal", () => ({ showModalInfo: vi.fn() }));
vi.mock("../src/taskpane/app/word/extras", () => ({
    applyExtrasIfEnabled: vi.fn(async () => ({
        headersFootersProcessed: 0,
        footnotesProcessed: 0,
        endnotesProcessed: 0,
        footnotesSupported: true,
        endnotesSupported: true,
    })),
}));
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
import { workerClient } from "../src/taskpane/worker/client";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function makeSimpleLatinOoxml(text: string) {
    return `<w:document xmlns:w="${W_NS}"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`;
}

function makeContextWithSelectionText(selectionText: string) {
    const selectionRange = {
        text: selectionText,
        load: vi.fn(),
        getOoxml: vi.fn(() => ({ value: makeSimpleLatinOoxml(selectionText) })),
        insertOoxml: vi.fn(),
        select: vi.fn(),
    };
    const bodyRange = { getOoxml: vi.fn(() => ({ value: "" })), insertOoxml: vi.fn() };
    const context = {
        document: {
            getSelection: () => selectionRange,
            body: { getRange: () => bodyRange, paragraphs: { load: vi.fn(), items: [] } },
        },
        sync: vi.fn(async () => undefined),
    };
    return { context, selectionRange, bodyRange };
}

describe("word/pipeline.applyPipeline (stubbed)", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (globalThis as any).Word = { InsertLocation: { replace: "replace" } };
    });

    it("selection: whitespace-only => showModalInfo + result=null", async () => {
        const { context } = makeContextWithSelectionText("   ");
        const r = await applyPipeline(context as any, "selection", {} as any, { direction: "lat-to-cyr" });
        expect(showModalInfo).toHaveBeenCalled();
        expect(r.result).toBeNull();
    });

    it("selection: valid => converts and calls insertOoxml + select()", async () => {
        const { context, selectionRange } = makeContextWithSelectionText("Zdravo");
        const r = await applyPipeline(context as any, "selection", {} as any, { direction: "lat-to-cyr" });

        expect(workerClient.convert).toHaveBeenCalled();
        expect(r.result).not.toBeNull();
        expect(selectionRange.insertOoxml).toHaveBeenCalled();
        expect(selectionRange.select).toHaveBeenCalled();
    });

    it("document: calls extras then calls processDocumentInChunks", async () => {
        const { context } = makeContextWithSelectionText("");
        const r = await applyPipeline(context as any, "document", { includeHeadersFooters: true } as any, {
            direction: "lat-to-cyr",
        });

        expect(applyExtrasIfEnabled).toHaveBeenCalled();
        expect(processDocumentInChunks).toHaveBeenCalled();
        expect(r.result!.stats.textNodes).toBe(100);
    });
});
