// tests/notesProcessing.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// mock convertOoxml used inside notes.ts
vi.mock("../src/shared/ooxml/convertOoxml", () => ({
    convertOoxml: vi.fn((_xmlIn: string) => ({
        xml: "<out/>",
        type: "Lat → Ćir",
        stats: { timingMs: 1, textNodes: 1 },
    })),
}));

import { processNotes } from "../src/taskpane/app/word/notes";

beforeEach(() => {
    vi.clearAllMocks();

    (globalThis as any).Word = {
        InsertLocation: { replace: "replace" },
    };
});

afterEach(() => {
    delete (globalThis as any).Word;
});

function makeRange(xmlValue: string, throwOnGetOoxml = false) {
    return {
        getOoxml: vi.fn(() => {
            if (throwOnGetOoxml) throw new Error("getOoxml boom");
            return { value: xmlValue };
        }),
        insertOoxml: vi.fn(),
    };
}

describe("word/notes.processNotes (stubbed)", () => {
    it("supported=false when collection missing", async () => {
        const ctx: any = { document: { body: {} }, sync: vi.fn(async () => undefined) };
        const r = await processNotes(ctx, { direction: "lat-to-cyr" } as any, "footnotes");
        expect(r.supported).toBe(false);
        expect(r.processed).toBe(0);
    });

    it("supported=true: processes items with getRange / body.getRange / contentRange and skips failing getOoxml", async () => {
        const r1 = makeRange("<in>1</in>");
        const r2 = makeRange("<in>2</in>");
        const r3 = makeRange("<in>3</in>");
        const rBad = makeRange("<in>BAD</in>", true);

        const items = [
            { getRange: () => r1 },
            { body: { getRange: (_t: string) => r2 } },
            { contentRange: r3 },
            { getRange: () => rBad }, // getOoxml throws => should be ignored
        ];

        const coll = {
            items,
            load: vi.fn(),
        };

        const ctx: any = {
            document: { body: { footnotes: coll } },
            sync: vi.fn(async () => undefined),
        };

        const res = await processNotes(ctx, { direction: "lat-to-cyr" } as any, "footnotes");

        expect(res.supported).toBe(true);
        // 3 successful (bad one skipped)
        expect(res.processed).toBe(3);

        expect(r1.insertOoxml).toHaveBeenCalledTimes(1);
        expect(r2.insertOoxml).toHaveBeenCalledTimes(1);
        expect(r3.insertOoxml).toHaveBeenCalledTimes(1);
        expect(rBad.insertOoxml).toHaveBeenCalledTimes(0);
    });
});
