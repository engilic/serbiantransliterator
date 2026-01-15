// src/taskpane/app/word/statsText.ts

import type { ConvertStats } from "../../../shared/ooxml/convertOoxml";
import type { ExtrasSummary } from "../types";

export type ApplyScope = "selection" | "document";

export type ResultLike = {
    type: string;
    stats: ConvertStats;
};

function scopeLabel(scope: ApplyScope): string {
    return scope === "selection" ? "Selekcija" : "Ceo dokument";
}

function ms0(n: number): string {
    return Number.isFinite(n) ? n.toFixed(0) : "0";
}

export function buildApplyStatsTitle(result: ResultLike): string {
    return `Statistika: ${result.type}`;
}

export function buildApplyStatsText(result: ResultLike, scope: ApplyScope, extras?: ExtrasSummary): string {
    const time = ms0(result.stats.timingMs);

    const bridges = result.stats.bridges;

    let out =
        `Opseg: ${scopeLabel(scope)}\n` +
        `Promenjeno čvorova: ${result.stats.textNodes}\n` +
        `Vreme: ${time}ms` +
        `\nBridges:` +
        `\n- links: ${bridges.links}` +
        `\n- placeholders: ${bridges.placeholders}` +
        `\n- brandPhrases: ${bridges.brandPhrases}` +
        `\n- brandTokens: ${bridges.brandTokens}` +
        `\n- ambiguousBrandSuffix: ${bridges.ambiguousBrandSuffix}` +
        `\n- digraphs: ${bridges.digraphs}` +
        `\n- userPhrases: ${bridges.userPhrases}` +
        `\n- userTokens: ${bridges.userTokens}` +
        `\n- allCapsHints: ${bridges.allCapsHints}` +
        `\n- spaces: ${bridges.spaces}`;

    const proof = result.stats.proofing;
    if (proof?.enabled) {
        out +=
            `\nProofing language:` +
            `\n- target: ${proof.targetLang ?? "N/A"}` +
            `\n- changedRuns: ${proof.changedRuns}` +
            `\n- skippedRuns: ${proof.skippedRuns}`;

        const reasons = Object.entries(proof.skippedByReason ?? {})
            .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
            .filter(([, n]) => (n ?? 0) > 0)
            .slice(0, 6);

        if (reasons.length) {
            out += `\n- skippedByReason:`;
            for (const [k, n] of reasons) out += `\n  - ${k}: ${n}`;
        }
    }

    if (scope === "document" && extras) {
        out +=
            `\nHeader/Footer: ${extras.headersFootersProcessed}` +
            `\nFusnote: ${extras.footnotesProcessed}` +
            `\nEndnote: ${extras.endnotesProcessed}`;

        if (extras.footnotesSupported === false) {
            out += `\nFusnote podržane: NE`;
        }
        if (extras.endnotesSupported === false) {
            out += `\nEndnote podržane: NE`;
        }
    }

    return out;
}

export function buildPreviewAppliedStats(): { title: string; text: string } {
    return {
        title: "Statistika: primenjen preview",
        text: `Opseg: Selekcija\n` + `Napomena: primenjen je OOXML iz pregleda (bez ponovne konverzije).`,
    };
}
