// src/taskpane/app/word/chunking.ts
/* global Word */

import type { OoxmlOptions, ConvertStats } from "../../../shared/ooxml/convertOoxml";
import { setStatus, setProgress } from "../status";
import { t } from "../../../shared/i18n";
import { workerClient } from "../../worker/client";

const BATCH_SIZE = 50;
const YIELD_DELAY_MS = 5;

export type ChunkingResult = {
    type: string;
    stats: ConvertStats;
};

function nowMs(): number {
    return typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
}

function labelForDirection(dir: ConvertStats["direction"]): string {
    if (dir === "lat-to-cyr") return "Lat → Ćir";
    if (dir === "cyr-to-lat") return "Ćir → Lat";
    if (dir === "to-ascii") return "Ošišana latinica";
    return "Auto";
}

function emptyStats(direction: ConvertStats["direction"]): ConvertStats {
    return {
        direction,
        textNodes: 0,
        charsBefore: 0,
        charsAfter: 0,
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
        proofing: {
            enabled: false,
            targetLang: null,
            changedRuns: 0,
            skippedRuns: 0,
            skippedByReason: {},
        },
        timingMs: 0,
    };
}

function addSkippedByReason(
    into: Record<string, number>,
    from: Record<string, number> | undefined
): Record<string, number> {
    if (!from) return into;
    for (const [k, v] of Object.entries(from)) {
        into[k] = (into[k] ?? 0) + (v ?? 0);
    }
    return into;
}

/**
 * Obrađuje dokument deo po deo (chunking), a samu konverziju delegira Web Worker-u.
 * PR1 hardening:
 * - garantovan finalni flush (context.sync) nakon poslednjeg batch insert-a
 * - progress cleanup u finally (da bar ne ostane "zalijepljen")
 * - vraća agregirane ConvertStats (real stats za document scope)
 */
export async function processDocumentInChunks(
    context: Word.RequestContext,
    opts: OoxmlOptions
): Promise<ChunkingResult> {
    const t0 = nowMs();

    // Ensure worker ready (idempotent)
    setStatus(t("status_processing") + " (Inicijalizacija Workera...)", "info");
    await workerClient.init();

    const paragraphs = context.document.body.paragraphs;
    // eslint-disable-next-line office-addins/no-context-sync-in-loop
    paragraphs.load("items");
    await context.sync();

    const totalParagraphs = paragraphs.items.length;

    // progress init
    setProgress(0);

    // Prepare aggregator
    let agg: ConvertStats | null = null;
    let aggType: string | null = null;

    // Track whether we queued any insertOoxml operations (so we can flush at the end)
    let didInsert = false;

    try {
        if (totalParagraphs === 0) {
            const direction = (opts.direction ?? "auto") as ConvertStats["direction"];
            const stats = emptyStats(direction);
            stats.timingMs = Math.max(0, nowMs() - t0);
            return { type: labelForDirection(direction), stats };
        }

        const initialMsg = t("status_processing") + " (0/" + totalParagraphs + ")";
        setStatus(initialMsg, "info");

        let processedCount = 0;

        for (let i = 0; i < totalParagraphs; i += BATCH_SIZE) {
            const batchItems = paragraphs.items.slice(i, i + BATCH_SIZE);
            if (batchItems.length === 0) continue;

            const firstPara = batchItems[0];
            const lastPara = batchItems[batchItems.length - 1];

            const batchRange = firstPara.getRange("Whole").expandTo(lastPara.getRange("Whole"));

            // Load OOXML for this batch (this context.sync also flushes previous batch inserts)
            const ooxmlRes = batchRange.getOoxml();
            // eslint-disable-next-line office-addins/no-context-sync-in-loop
            await context.sync();

            const rawXml = ooxmlRes.value;
            if (!rawXml) {
                processedCount += batchItems.length;
                const progress = Math.round((processedCount / totalParagraphs) * 100);
                setProgress(progress);
                const statusMsg =
                    t("status_processing") +
                    " " +
                    progress +
                    "% (" +
                    processedCount +
                    "/" +
                    totalParagraphs +
                    ")";
                setStatus(statusMsg, "info");
                continue;
            }

            // Convert in worker
            const result = await workerClient.convert(rawXml, opts);

            // If any type other than Nema teksta, insert back (existing behavior)
            if (result.type !== "Nema teksta") {
                batchRange.insertOoxml(result.xml, Word.InsertLocation.replace);
                didInsert = true;
            }

            // Init aggregator from first meaningful batch (or from first batch in general)
            if (!agg) {
                agg = emptyStats(result.stats.direction);
                aggType = result.type || labelForDirection(result.stats.direction);
            }

            // Aggregate stats (only if we treated batch as processed; for Nema teksta batch, keep minimal)
            if (agg && result.type !== "Nema teksta") {
                agg.textNodes += result.stats.textNodes || 0;
                agg.charsBefore += result.stats.charsBefore || 0;
                agg.charsAfter += result.stats.charsAfter || 0;

                agg.detected.urls += result.stats.detected?.urls || 0;
                agg.detected.emails += result.stats.detected?.emails || 0;

                agg.code.fenceMarkersSeen += result.stats.code?.fenceMarkersSeen || 0;
                agg.code.inlineTicksSeen += result.stats.code?.inlineTicksSeen || 0;
                // endedInFence/endedInInline across chunk boundaries is not meaningful; keep false.

                // Bridges
                const b = result.stats.bridges;
                if (b) {
                    agg.bridges.links += b.links || 0;
                    agg.bridges.placeholders += b.placeholders || 0;
                    agg.bridges.brandPhrases += b.brandPhrases || 0;
                    agg.bridges.brandTokens += b.brandTokens || 0;
                    agg.bridges.ambiguousBrandSuffix += b.ambiguousBrandSuffix || 0;
                    agg.bridges.digraphs += b.digraphs || 0;
                    agg.bridges.userPhrases += b.userPhrases || 0;
                    agg.bridges.userTokens += b.userTokens || 0;
                    agg.bridges.allCapsHints += b.allCapsHints || 0;
                    agg.bridges.spaces += b.spaces || 0;
                }

                // Proofing
                const p = result.stats.proofing;
                if (p?.enabled) {
                    agg.proofing.enabled = true;
                    agg.proofing.targetLang = p.targetLang ?? agg.proofing.targetLang;
                    agg.proofing.changedRuns += p.changedRuns || 0;
                    agg.proofing.skippedRuns += p.skippedRuns || 0;
                    addSkippedByReason(agg.proofing.skippedByReason, p.skippedByReason);
                }
            }

            // UI progress update
            processedCount += batchItems.length;
            const progress = Math.round((processedCount / totalParagraphs) * 100);
            setProgress(progress);
            const statusMsg =
                t("status_processing") +
                " " +
                progress +
                "% (" +
                processedCount +
                "/" +
                totalParagraphs +
                ")";
            setStatus(statusMsg, "info");

            // Yield
            await new Promise((resolve) => setTimeout(resolve, YIELD_DELAY_MS));
        }

        // PR1 critical: flush the *final* queued insertOoxml
        if (didInsert) {
            await context.sync();
        }

        // finalize stats
        const outStats = agg ?? emptyStats((opts.direction ?? "auto") as ConvertStats["direction"]);
        outStats.timingMs = Math.max(0, nowMs() - t0);

        const outType =
            aggType ??
            labelForDirection(
                outStats.direction || ((opts.direction ?? "auto") as ConvertStats["direction"])
            );

        return { type: outType, stats: outStats };
    } finally {
        // Always clear progress bar
        setProgress(null);
    }
}
