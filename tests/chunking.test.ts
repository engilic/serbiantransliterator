import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { processDocumentInChunks } from "../src/taskpane/app/word/chunking";
import { workerClient } from "../src/taskpane/worker/client";
import { setStatus, setProgress } from "../src/taskpane/app/status";

vi.mock("../src/taskpane/worker/client", () => ({
    workerClient: {
        init: vi.fn(async () => {}),
        convert: vi.fn(async (_xml: string) => ({
            xml: "<out/>",
            type: "Lat → Ćir",
            stats: { direction: "lat-to-cyr", textNodes: 1 },
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

describe("chunking.ts - Smart Chunking Logic", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // [FIX] Mock Word global object
        (globalThis as any).Word = {
            InsertLocation: { replace: "replace" },
        };
    });

    afterEach(() => {
        delete (globalThis as any).Word;
    });

    it("processes document in batches (simulated)", async () => {
        const ctx = makeMockContext(150);
        const result = await processDocumentInChunks(ctx, { direction: "lat-to-cyr" } as any);

        expect(workerClient.init).toHaveBeenCalled();
        expect(workerClient.convert).toHaveBeenCalled();
        expect(result.type).toBe("Lat → Ćir");
        expect(setProgress).toHaveBeenCalled();
    });

    it("handles empty document gracefully", async () => {
        const ctx = makeMockContext(0);
        const result = await processDocumentInChunks(ctx, { direction: "lat-to-cyr" } as any);
        expect(result.stats.textNodes).toBe(0);
    });
});
