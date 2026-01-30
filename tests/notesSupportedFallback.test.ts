// tests/notesSupportedFallback.test.ts

import { describe, it, expect } from "vitest";
import { processNotes } from "../src/taskpane/app/word/notes";

describe("word/notes.processNotes - supported=false branch", () => {
    it("returns supported=false when collection is missing", async () => {
        const ctx: any = {
            document: {
                body: {}, // no footnotes/endnotes here
            },
        };

        const opts: any = { direction: "lat-to-cyr" };

        const r1 = await processNotes(ctx, opts, "footnotes");
        expect(r1.supported).toBe(false);
        expect(r1.processed).toBe(0);

        const r2 = await processNotes(ctx, opts, "endnotes");
        expect(r2.supported).toBe(false);
        expect(r2.processed).toBe(0);
    });
});
