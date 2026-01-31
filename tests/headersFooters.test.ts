// tests/headersFooters.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// mock convertOoxml used inside headersFooters.ts
vi.mock("../src/shared/ooxml/convertOoxml", () => ({
    convertOoxml: vi.fn((xmlIn: string) => {
        if (xmlIn.includes("SKIP")) {
            return { xml: xmlIn, type: "Nema teksta", stats: { timingMs: 0, textNodes: 0 } };
        }
        return { xml: "<out/>", type: "Lat → Ćir", stats: { timingMs: 1, textNodes: 1 } };
    }),
}));

import { processHeadersFooters } from "../src/taskpane/app/word/headersFooters";

beforeEach(() => {
    vi.clearAllMocks();

    // Word enums used in headersFooters.ts
    (globalThis as any).Word = {
        HeaderFooterType: {
            primary: "primary",
            firstPage: "firstPage",
            evenPages: "evenPages",
        },
        InsertLocation: { replace: "replace" },
    };
});

afterEach(() => {
    delete (globalThis as any).Word;
});

function makeRange(xmlValue: string) {
    return {
        getOoxml: vi.fn(() => ({ value: xmlValue })),
        insertOoxml: vi.fn(),
    };
}

describe("word/headersFooters.processHeadersFooters (stubbed)", () => {
    it("processes existing headers/footers and returns processed count", async () => {
        const headerRange = makeRange("<in>HDR</in>");
        const footerRange = makeRange("<in>FTR</in>");
        const skipRange = makeRange("<in>SKIP</in>");

        const section = {
            getHeader: vi.fn((t: string) => {
                if (t === "primary") return { getRange: () => headerRange };
                // simulate missing header types
                throw new Error("no header");
            }),
            getFooter: vi.fn((t: string) => {
                if (t === "primary") return { getRange: () => footerRange };
                if (t === "firstPage") return { getRange: () => skipRange }; // should be skipped by convertOoxml type=Nema teksta
                throw new Error("no footer");
            }),
        };

        const sections = {
            items: [section],
            load: vi.fn(),
        };

        const ctx: any = {
            document: { sections },
            sync: vi.fn(async () => undefined),
        };

        const processed = await processHeadersFooters(ctx, { direction: "lat-to-cyr" } as any);

        // header primary + footer primary processed => 2
        // firstPage footer is "Nema teksta" => skipped
        expect(processed).toBe(2);

        expect(headerRange.insertOoxml).toHaveBeenCalledTimes(1);
        expect(footerRange.insertOoxml).toHaveBeenCalledTimes(1);
        expect(skipRange.insertOoxml).toHaveBeenCalledTimes(0);
    });

    it("does not throw when headers/footers are missing (try/catch paths)", async () => {
        const section = {
            getHeader: vi.fn(() => {
                throw new Error("missing header");
            }),
            getFooter: vi.fn(() => {
                throw new Error("missing footer");
            }),
        };

        const sections = { items: [section], load: vi.fn() };
        const ctx: any = { document: { sections }, sync: vi.fn(async () => undefined) };

        const processed = await processHeadersFooters(ctx, { direction: "lat-to-cyr" } as any);
        expect(processed).toBe(0);
    });
});
