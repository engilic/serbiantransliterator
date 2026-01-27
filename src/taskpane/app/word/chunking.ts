// src/taskpane/app/word/chunking.ts
/* global Word */

import type { OoxmlOptions, ConvertStats } from "../../../shared/ooxml/convertOoxml";
import { setStatus, setProgress } from "../status";
import { t } from "../../../shared/i18n";
import { workerClient } from "../../worker/client";
import { state } from "../state";
import { perfMonitor } from "../telemetry/performanceMonitor"; // [MAX20] Import monitor

// [MAX20] Adaptive limits
const BATCH_SIZE_START = 50;
const MIN_BATCH = 10;
const MAX_BATCH = 150;
const TARGET_TIME_MS = 800; // Cilj: ~800ms po ciklusu (brz UI response)
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

function mergeStats(into: ConvertStats, from: ConvertStats) {
    into.textNodes += from.textNodes || 0;
    into.charsBefore += from.charsBefore || 0;
    into.charsAfter += from.charsAfter || 0;

    into.detected.urls += from.detected?.urls || 0;
    into.detected.emails += from.detected?.emails || 0;

    into.code.fenceMarkersSeen += from.code?.fenceMarkersSeen || 0;
    into.code.inlineTicksSeen += from.code?.inlineTicksSeen || 0;
    into.code.endedInFence = into.code.endedInFence || !!from.code?.endedInFence;
    into.code.endedInInline = into.code.endedInInline || !!from.code?.endedInInline;

    into.bridges.links += from.bridges?.links || 0;
    into.bridges.placeholders += from.bridges?.placeholders || 0;
    into.bridges.brandPhrases += from.bridges?.brandPhrases || 0;
    into.bridges.brandTokens += from.bridges?.brandTokens || 0;
    into.bridges.ambiguousBrandSuffix += from.bridges?.ambiguousBrandSuffix || 0;
    into.bridges.digraphs += from.bridges?.digraphs || 0;
    into.bridges.userPhrases += from.bridges?.userPhrases || 0;
    into.bridges.userTokens += from.bridges?.userTokens || 0;
    into.bridges.allCapsHints += from.bridges?.allCapsHints || 0;
    into.bridges.spaces += from.bridges?.spaces || 0;

    if (from.proofing?.enabled) into.proofing.enabled = true;
    if (!into.proofing.targetLang && from.proofing?.targetLang)
        into.proofing.targetLang = from.proofing.targetLang;

    into.proofing.changedRuns += from.proofing?.changedRuns || 0;
    into.proofing.skippedRuns += from.proofing?.skippedRuns || 0;

    addSkippedByReason(into.proofing.skippedByReason, from.proofing?.skippedByReason);
}

function isCancelled(): boolean {
    return !!state.activeAbortController?.signal.aborted;
}

/**
 * PR4: ESC cancels long operation by aborting state.activeAbortController.
 * PR5: Adaptive Chunking + Dirty Check (Smart Write)
 */
export async function processDocumentInChunks(
    context: Word.RequestContext,
    opts: OoxmlOptions
): Promise<ChunkingResult> {
    const t0 = nowMs();

    setStatus(t("status_processing") + " (Inicijalizacija...)", "info");
    await workerClient.init();

    const paragraphs = context.document.body.paragraphs;
    // eslint-disable-next-line office-addins/no-context-sync-in-loop
    paragraphs.load("items");
    await context.sync();

    const totalParagraphs = paragraphs.items.length;
    setProgress(0);

    let agg: ConvertStats | null = null;
    let aggType: string | null = null;

    let didInsert = false;

    try {
        if (totalParagraphs === 0) {
            const direction = (opts.direction ?? "auto") as ConvertStats["direction"];
            const stats = emptyStats(direction);
            stats.timingMs = Math.max(0, nowMs() - t0);
            return { type: labelForDirection(direction), stats };
        }

        setStatus(t("status_processing") + " (0/" + totalParagraphs + ")", "info");

        let processedCount = 0;
        let i = 0;

        // [MAX20] Adaptive Start
        let batchSize = BATCH_SIZE_START;

        while (i < totalParagraphs) {
            if (isCancelled()) break;

            const batchStart = nowMs();
            const batchItems = paragraphs.items.slice(i, i + batchSize);
            if (batchItems.length === 0) break;

            const firstPara = batchItems[0];
            const lastPara = batchItems[batchItems.length - 1];
            if (!firstPara || !lastPara) break;

            const batchRange = firstPara.getRange("Whole").expandTo(lastPara.getRange("Whole"));

            const ooxmlRes = batchRange.getOoxml();
            // eslint-disable-next-line office-addins/no-context-sync-in-loop
            await context.sync();

            if (isCancelled()) break;

            const rawXml = ooxmlRes.value;
            if (!rawXml) {
                // Empty range, skip processing but advance counter
                processedCount += batchItems.length;
                i += batchItems.length;
                const progress = Math.round((processedCount / totalParagraphs) * 100);
                setProgress(progress);
                setStatus(
                    t("status_processing") +
                        " " +
                        progress +
                        "% (" +
                        processedCount +
                        "/" +
                        totalParagraphs +
                        ")",
                    "info"
                );
                await new Promise((resolve) => setTimeout(resolve, YIELD_DELAY_MS));
                continue;
            }

            const result = await workerClient.convert(rawXml, opts);

            if (!agg) {
                agg = emptyStats(result.stats.direction);
                aggType = result.type;
            } else if (!aggType && result.type) {
                aggType = result.type;
            }

            if (agg) mergeStats(agg, result.stats);

            if (isCancelled()) break;

            // [MAX20] Dirty Check: Write ONLY if changed
            let skippedWrite = false;
            if (result.type !== "Nema teksta" && result.xml !== rawXml) {
                batchRange.insertOoxml(result.xml, Word.InsertLocation.replace);
                didInsert = true;
            } else {
                skippedWrite = true;
            }

            processedCount += batchItems.length;
            i += batchItems.length;

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

            // [MAX20] Measure & Adapt
            // Sync is needed for UI refresh and Word queue flush
            await new Promise((resolve) => setTimeout(resolve, YIELD_DELAY_MS));

            // Sync after insert (implicitly handled by next read or loop end, but we measure full cycle)

            const dur = Math.max(0, nowMs() - batchStart);

            // [MAX20] TELEMETRY RECORDING
            if (typeof perfMonitor !== "undefined") {
                perfMonitor.record("processChunk", batchItems.length, dur, {
                    batchSize: batchItems.length,
                    skippedWrite: skippedWrite,
                });
            }

            // [MAX20] Adaptive Logic
            if (dur > 0) {
                const msPerPara = dur / batchItems.length;
                const idealBatch = Math.floor(TARGET_TIME_MS / msPerPara);

                // Smoothing: (old + ideal) / 2
                let newBatch = Math.floor((batchSize + idealBatch) / 2);

                // Clamp
                newBatch = Math.max(MIN_BATCH, Math.min(newBatch, MAX_BATCH));
                batchSize = newBatch;
            }
        }

        // flush only if we inserted and not cancelled mid-batch
        if (didInsert) {
            await context.sync();
        }

        const outStats = agg ?? emptyStats((opts.direction ?? "auto") as ConvertStats["direction"]);
        outStats.timingMs = Math.max(0, nowMs() - t0);

        const outType =
            aggType ??
            labelForDirection(
                outStats.direction || ((opts.direction ?? "auto") as ConvertStats["direction"])
            );

        return { type: outType, stats: outStats };
    } finally {
        setProgress(null);
    }
}
