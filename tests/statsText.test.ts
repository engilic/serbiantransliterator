import { describe, it, expect } from "vitest";
import { buildApplyStatsText, buildApplyStatsTitle, buildPreviewAppliedStats } from "../src/taskpane/app/word/statsText";
import type { ConvertStats } from "../src/shared/ooxml/convertOoxml";
import type { ExtrasSummary } from "../src/taskpane/app/types";

function makeStats(): ConvertStats {
    return {
        direction: "lat-to-cyr",
        textNodes: 7,
        charsBefore: 100,
        charsAfter: 120,
        detected: { urls: 1, emails: 2 },
        code: { fenceMarkersSeen: 0, inlineTicksSeen: 0, endedInFence: false, endedInInline: false },
        bridges: {
            links: 1,
            placeholders: 2,
            brandPhrases: 3,
            brandTokens: 4,
            ambiguousBrandSuffix: 5,
            digraphs: 6,
            userPhrases: 7,
            userTokens: 8,
            allCapsHints: 9,
            spaces: 10,
        },
        timingMs: 123.4,
    };
}

describe("word/statsText", () => {
    it("buildApplyStatsTitle", () => {
        const title = buildApplyStatsTitle({ type: "Lat → Ćir", stats: makeStats() });
        expect(title).toBe("Statistika: Lat → Ćir");
    });

    it("buildApplyStatsText (selection) does not include extras lines", () => {
        const text = buildApplyStatsText({ type: "Lat → Ćir", stats: makeStats() }, "selection");
        expect(text).toContain("Opseg: Selekcija");
        expect(text).toContain("Bridges:");
        expect(text).toContain("- links: 1");
        expect(text).not.toContain("Header/Footer:");
    });

    it("buildApplyStatsText (document) includes extras lines", () => {
        const extras: ExtrasSummary = {
            headersFootersProcessed: 2,
            footnotesProcessed: 3,
            endnotesProcessed: 4,
            footnotesSupported: true,
            endnotesSupported: true,
        };

        const text = buildApplyStatsText({ type: "Lat → Ćir", stats: makeStats() }, "document", extras);

        expect(text).toContain("Opseg: Ceo dokument");
        expect(text).toContain("Header/Footer: 2");
        expect(text).toContain("Fusnote: 3");
        expect(text).toContain("Endnote: 4");
    });

    it("buildPreviewAppliedStats", () => {
        const s = buildPreviewAppliedStats();
        expect(s.title).toBe("Statistika: primenjen preview");
        expect(s.text).toContain("Opseg: Selekcija");
        expect(s.text).toContain("bez ponovne konverzije");
    });
});