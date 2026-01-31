// tests/wordExtras.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/taskpane/app/status", () => ({
    setStatus: vi.fn(),
}));

vi.mock("../src/taskpane/app/word/headersFooters", () => ({
    processHeadersFooters: vi.fn(async () => 3),
}));

vi.mock("../src/taskpane/app/word/notes", () => ({
    processNotes: vi.fn(async (_ctx: any, _opts: any, kind: "footnotes" | "endnotes") => {
        if (kind === "footnotes") return { processed: 5, supported: true };
        return { processed: 2, supported: false };
    }),
}));

import { applyExtrasIfEnabled } from "../src/taskpane/app/word/extras";
import { processHeadersFooters } from "../src/taskpane/app/word/headersFooters";
import { processNotes } from "../src/taskpane/app/word/notes";

beforeEach(() => {
    vi.resetAllMocks();

    // restore default mock impls after reset
    (processHeadersFooters as any).mockImplementation(async () => 3);
    (processNotes as any).mockImplementation(
        async (_ctx: any, _opts: any, kind: "footnotes" | "endnotes") => {
            if (kind === "footnotes") return { processed: 5, supported: true };
            return { processed: 2, supported: false };
        }
    );
});

describe("word/extras.applyExtrasIfEnabled (stubbed processors)", () => {
    it("runs enabled extras and fills summary", async () => {
        const ui: any = {
            includeHeadersFooters: true,
            includeFootnotes: true,
            includeEndnotes: true,
        };

        const opts: any = { direction: "lat-to-cyr" };
        const ctx: any = {};

        const res = await applyExtrasIfEnabled(ctx, ui, opts);

        expect(processHeadersFooters).toHaveBeenCalledTimes(1);
        expect(processNotes).toHaveBeenCalledTimes(2);

        expect(res.headersFootersProcessed).toBe(3);
        expect(res.footnotesProcessed).toBe(5);
        expect(res.endnotesProcessed).toBe(2);

        expect(res.footnotesSupported).toBe(true);
        expect(res.endnotesSupported).toBe(false);
    });

    it("skips all extras when all flags are false", async () => {
        const ui: any = {
            includeHeadersFooters: false,
            includeFootnotes: false,
            includeEndnotes: false,
        };

        const opts: any = { direction: "lat-to-cyr" };
        const ctx: any = {};

        const res = await applyExtrasIfEnabled(ctx, ui, opts);

        expect(processHeadersFooters).not.toHaveBeenCalled();
        expect(processNotes).not.toHaveBeenCalled();

        expect(res.headersFootersProcessed).toBe(0);
        expect(res.footnotesProcessed).toBe(0);
        expect(res.endnotesProcessed).toBe(0);
    });

    it("does not throw if a processor throws (best-effort) and does not spam console.warn", async () => {
        // Silence expected warnings in CI output for this test only
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        (processHeadersFooters as any).mockRejectedValueOnce(new Error("boom"));

        const ui: any = {
            includeHeadersFooters: true,
            includeFootnotes: false,
            includeEndnotes: false,
        };

        const opts: any = { direction: "lat-to-cyr" };
        const ctx: any = {};

        const res = await applyExtrasIfEnabled(ctx, ui, opts);

        // should not throw; summary stays 0 for the failed part
        expect(res.headersFootersProcessed).toBe(0);

        warnSpy.mockRestore();
    });
});
