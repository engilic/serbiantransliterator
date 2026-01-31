// @ts-nocheck
// tests/chunking.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { processDocumentInChunks } from "../src/taskpane/app/word/chunking";
import { workerClient } from "../src/taskpane/worker/client";
import { setStatus, setProgress } from "../src/taskpane/app/status";

// Mock workerClient da ne bi pokretao pravog workera
vi.mock("../src/taskpane/worker/client", () => ({
    workerClient: {
        init: vi.fn(async () => {}),
        convert: vi.fn(async (_xml: string) => ({
            xml: "<out/>",
            type: "Lat → Ćir",
            stats: {
                direction: "lat-to-cyr",
                textNodes: 1,
                // Moramo dodati sve obavezne polja za stats da ne bi pukao mergeStats
                charsBefore: 0,
                charsAfter: 0,
                detected: { urls: 0, emails: 0 },
                code: { fenceMarkersSeen: 0, inlineTicksSeen: 0 },
                bridges: {
                    links: 0,
                    placeholders: 0,
                    brandPhrases: 0,
                    brandTokens: 0,
                    digraphs: 0,
                    userPhrases: 0,
                    userTokens: 0,
                    allCapsHints: 0,
                    spaces: 0,
                    ambiguousBrandSuffix: 0,
                },
                proofing: { enabled: false },
            },
        })),
    },
}));

vi.mock("../src/taskpane/app/status", () => ({
    setStatus: vi.fn(),
    setProgress: vi.fn(),
}));

function makeMockContext(paragraphsCount: number) {
    const items = Array.from({ length: paragraphsCount }, (_, i) => ({
        getRange: (_type: string) => ({
            expandTo: (_other: any) => ({
                getOoxml: vi.fn(() => ({ value: `<p>${i}</p>` })),
                insertOoxml: vi.fn(),
            }),
        }),
    }));

    return {
        document: {
            body: {
                paragraphs: {
                    items,
                    load: vi.fn(),
                },
            },
        },
        sync: vi.fn(async () => {}),
    } as any;
}

describe("chunking.ts - Smart Chunking Logic (Worker)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (globalThis as any).Word = {
            InsertLocation: { replace: "replace" },
        };
    });

    afterEach(() => {
        delete (globalThis as any).Word;
    });

    it("processes document in batches using workerClient", async () => {
        const ctx = makeMockContext(150); // Dovoljno da okine chunking (BATCH_SIZE_START = 50)

        const result = await processDocumentInChunks(ctx, { direction: "lat-to-cyr" } as any);

        expect(workerClient.init).toHaveBeenCalled();
        // Trebalo bi da se pozove više puta (150 / 50 = 3 puta)
        expect(workerClient.convert).toHaveBeenCalled();
        expect(result.type).toBe("Lat → Ćir");
        expect(setProgress).toHaveBeenCalled();
    });

    it("handles empty document gracefully", async () => {
        const ctx = makeMockContext(0);
        const result = await processDocumentInChunks(ctx, { direction: "lat-to-cyr" } as any);
        expect(result.stats.textNodes).toBe(0);
        expect(workerClient.convert).not.toHaveBeenCalled();
    });
});
