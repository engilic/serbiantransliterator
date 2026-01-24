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
        // Mock da baci grešku
        (processHeadersFooters as any).mockRejectedValue(new Error("Header Boom"));

        const ui: any = { includeHeadersFooters: true };
        const ctx: any = {};

        // Should not throw
        const res = await applyExtrasIfEnabled(ctx, ui, {} as any);

        // Ali headers count treba da bude 0
        expect(res.headersFootersProcessed).toBe(0);
    });
});
