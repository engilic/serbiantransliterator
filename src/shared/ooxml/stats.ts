// src/shared/ooxml/stats.ts
import type { Direction } from "../../core/textCore";
import type { ProofingApplyResult } from "./proofing";

export type ProofingStats = {
    enabled: boolean;
    targetLang: "sr-Cyrl-RS" | "sr-Latn-RS" | null;
} & ProofingApplyResult;

export type ConvertStats = {
    direction: Direction | "to-ascii";
    textNodes: number;
    charsBefore: number;
    charsAfter: number;
    detected: { urls: number; emails: number };
    code: {
        fenceMarkersSeen: number;
        inlineTicksSeen: number;
        endedInFence: boolean;
        endedInInline: boolean;
    };
    bridges: {
        links: number;
        placeholders: number;
        brandPhrases: number;
        brandTokens: number;
        digraphs: number;
        userPhrases: number;
        userTokens: number;
        allCapsHints: number;
        spaces: number;
        ambiguousBrandSuffix: number;
    };
    proofing: ProofingStats;
    timingMs: number;
};

export function createEmptyStats(direction?: string, textNodes = 0, chars = 0): ConvertStats {
    return {
        direction: (direction as ConvertStats["direction"]) || "auto",
        textNodes,
        charsBefore: chars,
        charsAfter: chars,
        detected: { urls: 0, emails: 0 },
        code: { fenceMarkersSeen: 0, inlineTicksSeen: 0, endedInFence: false, endedInInline: false },
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
        proofing: { enabled: false, targetLang: null, changedRuns: 0, skippedRuns: 0, skippedByReason: {} },
        timingMs: 0,
    };
}
