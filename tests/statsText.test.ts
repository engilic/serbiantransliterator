import { describe, it, expect, beforeEach } from "vitest";
import {
    buildApplyStatsText,
    buildApplyStatsTitle,
    buildPreviewAppliedStats,
} from "../src/taskpane/app/word/statsText";
import type { ConvertStats } from "../src/shared/ooxml/convertOoxml";
import { setLanguage } from "../src/shared/i18n";

function makeStats(textNodes: number): ConvertStats {
    return {
        direction: "lat-to-cyr",
        textNodes,
        charsBefore: 0,
        charsAfter: 0,
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
        proofing: { enabled: false, targetLang: null, changedRuns: 0, skippedRuns: 0, skippedByReason: {} },
        timingMs: 123.4,
    };
}

describe("word/statsText", () => {
    beforeEach(() => setLanguage("sr"));

    it("buildApplyStatsTitle", () => {
        const title = buildApplyStatsTitle({ type: "Lat → Ćir", stats: makeStats(7) });
        expect(title).toBe("Statistika: Lat → Ćir");
    });

    it("buildPreviewAppliedStats (smoke)", () => {
        const s = buildPreviewAppliedStats();
        expect(s.title).toBeTruthy();
        expect(s.text).toBeTruthy();
    });

    // --- NEW: Coverage for Proofing branches ---
    it("uključuje proofing statistiku kada je enabled", () => {
        const stats = makeStats(10);
        stats.proofing = {
            enabled: true,
            targetLang: "sr-Cyrl-RS",
            changedRuns: 5,
            skippedRuns: 2,
            skippedByReason: { noWordSpans: 1, missingOriginal: 1 },
        };

        const text = buildApplyStatsText({ type: "Lat → Ćir", stats }, "selection");

        expect(text).toContain("Proofing language:");
        expect(text).toContain("target: sr-Cyrl-RS");
        expect(text).toContain("noWordSpans: 1");
    });

    // --- NEW: Coverage for Document Extras branches ---
    it("uključuje extras statistiku za document scope (H/F, Fusnote)", () => {
        const stats = makeStats(100);
        const extras = {
            headersFootersProcessed: 5,
            footnotesProcessed: 3,
            endnotesProcessed: 0,
            footnotesSupported: true,
            endnotesSupported: false, // Target branch: endnotes not supported
        };

        const text = buildApplyStatsText({ type: "Lat → Ćir", stats }, "document", extras);

        expect(text).toContain("Header/Footer: 5");
        expect(text).toContain("Fusnote: 3");
        // Endnotes supported: false branch
        expect(text).toContain("Endnote podržane: NE");
    });

    it("pokazuje 'Fusnote podržane: NE' ako nisu podržane", () => {
        const stats = makeStats(100);
        const extras = {
            headersFootersProcessed: 0,
            footnotesProcessed: 0,
            endnotesProcessed: 0,
            footnotesSupported: false, // Target branch
            endnotesSupported: true,
        };

        const text = buildApplyStatsText({ type: "Lat → Ćir", stats }, "document", extras);
        expect(text).toContain("Fusnote podržane: NE");
    });

    // ---- pluralization SR ----

    it("pluralization (sr): 1", () => {
        const text = buildApplyStatsText({ type: "Lat → Ćir", stats: makeStats(1) }, "selection");
        expect(text).toContain("Promenjen 1 čvor");
    });

    it("pluralization (sr): 2", () => {
        const text = buildApplyStatsText({ type: "Lat → Ćir", stats: makeStats(2) }, "selection");
        expect(text).toContain("Promenjena 2 čvora");
    });

    it("pluralization (sr): 5", () => {
        const text = buildApplyStatsText({ type: "Lat → Ćir", stats: makeStats(5) }, "selection");
        expect(text).toContain("Promenjeno 5 čvorova");
    });

    it("pluralization (sr): 21", () => {
        const text = buildApplyStatsText({ type: "Lat → Ćir", stats: makeStats(21) }, "selection");
        expect(text).toContain("Promenjen 21 čvor");
    });

    it("pluralization (sr): 22", () => {
        const text = buildApplyStatsText({ type: "Lat → Ćir", stats: makeStats(22) }, "selection");
        expect(text).toContain("Promenjena 22 čvora");
    });

    // ---- pluralization EN (tight checks) ----

    it("pluralization (en): 1", () => {
        setLanguage("en");
        const text = buildApplyStatsText({ type: "Lat → Ćir", stats: makeStats(1) }, "selection");
        expect(text).toMatch(/\bChanged 1 node\b/);
    });

    it("pluralization (en): 2", () => {
        setLanguage("en");
        const text = buildApplyStatsText({ type: "Lat → Ćir", stats: makeStats(2) }, "selection");
        expect(text).toMatch(/\bChanged 2 nodes\b/);
    });
});
