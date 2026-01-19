// src/taskpane/app/word/statsText.ts

import type { ConvertStats } from "../../../shared/ooxml/convertOoxml";
import type { ExtrasSummary } from "../types";
import { t, tPlural } from "../../../shared/i18n";

export type ApplyScope = "selection" | "document";

export type ResultLike = {
    type: string;
    stats: ConvertStats;
};

function scopeLabel(scope: ApplyScope): string {
    return scope === "selection" ? t("stats_scope_selection") : t("stats_scope_document");
}

function ms0(n: number): string {
    return Number.isFinite(n) ? n.toFixed(0) : "0";
}

export function buildApplyStatsTitle(result: ResultLike): string {
    return t("stats_header_apply", result.type);
}

export function buildApplyStatsText(result: ResultLike, scope: ApplyScope, extras?: ExtrasSummary): string {
    const time = ms0(result.stats.timingMs);
    const bridges = result.stats.bridges;
    // NEW: Character count
    const chars = result.stats.charsBefore || 0;

    let out =
        `${t("stats_line_scope", scopeLabel(scope))}\n` +
        `${tPlural("stats_line_nodes_changed", result.stats.textNodes)}\n` +
        // Manual simple string for now, or add to i18n
        `Chars: ${chars}\n` +
        `${t("stats_line_time_ms", time)}\n` +
        `${t("stats_section_bridges")}\n` +
        `${t("stats_bridge_line", "links", bridges.links)}\n` +
        `${t("stats_bridge_line", "placeholders", bridges.placeholders)}\n` +
        `${t("stats_bridge_line", "brandPhrases", bridges.brandPhrases)}\n` +
        `${t("stats_bridge_line", "brandTokens", bridges.brandTokens)}\n` +
        `${t("stats_bridge_line", "ambiguousBrandSuffix", bridges.ambiguousBrandSuffix)}\n` +
        `${t("stats_bridge_line", "digraphs", bridges.digraphs)}\n` +
        `${t("stats_bridge_line", "userPhrases", bridges.userPhrases)}\n` +
        `${t("stats_bridge_line", "userTokens", bridges.userTokens)}\n` +
        `${t("stats_bridge_line", "allCapsHints", bridges.allCapsHints)}\n` +
        `${t("stats_bridge_line", "spaces", bridges.spaces)}`;

    const proof = result.stats.proofing;
    if (proof?.enabled) {
        out +=
            `\n${t("stats_section_proofing")}` +
            `\n${t("stats_proof_target", proof.targetLang ?? "N/A")}` +
            `\n${t("stats_proof_changed_runs", proof.changedRuns)}` +
            `\n${t("stats_proof_skipped_runs", proof.skippedRuns)}`;

        const skipped = (proof.skippedByReason ?? {}) as Record<string, number>;

        const reasons = Object.entries(skipped)
            .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
            .filter(([, n]) => (n ?? 0) > 0)
            .slice(0, 6);

        if (reasons.length) {
            out += `\n${t("stats_proof_skipped_by_reason")}`;
            for (const [k, n] of reasons) out += `\n${t("stats_proof_reason_line", k, n)}`;
        }
    }

    if (scope === "document" && extras) {
        out +=
            `\n${t("stats_line_headers_footers", extras.headersFootersProcessed)}` +
            `\n${t("stats_line_footnotes", extras.footnotesProcessed)}` +
            `\n${t("stats_line_endnotes", extras.endnotesProcessed)}`;

        if (extras.footnotesSupported === false) out += `\n${t("stats_footnotes_na")}`;
        if (extras.endnotesSupported === false) out += `\n${t("stats_endnotes_na")}`;
    }

    return out;
}

export function buildPreviewAppliedStats(): { title: string; text: string } {
    return {
        title: t("stats_header_preview"),
        text: `${t("stats_line_scope", t("stats_scope_selection"))}\n${t("stats_note_preview")}`,
    };
}
