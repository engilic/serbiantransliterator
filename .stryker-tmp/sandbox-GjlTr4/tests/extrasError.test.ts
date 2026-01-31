// @ts-nocheck
// tests/extrasError.test.ts

import { describe, it, expect, vi } from "vitest";
import { applyExtrasIfEnabled } from "../src/taskpane/app/word/extras";
import { processHeadersFooters } from "../src/taskpane/app/word/headersFooters";

vi.mock("../src/taskpane/app/status", () => ({ setStatus: vi.fn() }));
vi.mock("../src/taskpane/app/word/headersFooters", () => ({ processHeadersFooters: vi.fn() }));
vi.mock("../src/taskpane/app/word/notes", () => ({
    processNotes: vi.fn(async () => ({ processed: 0, supported: true })),
}));

describe("word/extras Error Handling", () => {
    it("catches errors in headers processing and continues", async () => {
        // [FIX] Silence console.warn for this test
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        (processHeadersFooters as any).mockRejectedValue(new Error("Header Boom"));

        const ui: any = { includeHeadersFooters: true };
        const ctx: any = {};

        const res = await applyExtrasIfEnabled(ctx, ui, {} as any);

        expect(res.headersFootersProcessed).toBe(0);

        // [FIX] Restore console
        warnSpy.mockRestore();
    });
});
