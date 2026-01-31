/* global Word */
// src/taskpane/app/word/chunking.ts

import { type OoxmlOptions, type ConvertStats } from "../../../shared/ooxml/convertOoxml";
import { setStatus, setProgress } from "../status";
import { t } from "../../../shared/i18n";
import { workerClient } from "../../worker/client";
import { state } from "../state";
import { perfMonitor } from "../telemetry/performanceMonitor";

const BATCH_SIZE_START = 50;
const MIN_BATCH = 10;
const MAX_BATCH = 150;
const TARGET_TIME_MS = 800;
const YIELD_DELAY_MS = 5;

export type ChunkingResult = {
    type: string;
    stats: ConvertStats;
};

function nowMs(): number {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
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
        proofing: { enabled: false, targetLang: null, changedRuns: 0, skippedRuns: 0, skippedByReason: {} },
        timingMs: 0,
    };
}

function mergeStats(into: ConvertStats, from: ConvertStats) {
    into.textNodes += from.textNodes;
    into.charsBefore += from.charsBefore;
    into.charsAfter += from.charsAfter;
    into.detected.urls += from.detected.urls;
    into.detected.emails += from.detected.emails;
    into.code.fenceMarkersSeen += from.code.fenceMarkersSeen;
    into.code.inlineTicksSeen += from.code.inlineTicksSeen;
    into.code.endedInFence = from.code.endedInFence;
    into.code.endedInInline = from.code.endedInInline;

    for (const key in into.bridges) {
        const k = key as keyof typeof into.bridges;
        into.bridges[k] += from.bridges[k];
    }

    if (from.proofing.enabled) {
        into.proofing.enabled = true;
        into.proofing.targetLang = from.proofing.targetLang;
        into.proofing.changedRuns += from.proofing.changedRuns;
        into.proofing.skippedRuns += from.proofing.skippedRuns;
        for (const r in from.proofing.skippedByReason) {
            into.proofing.skippedByReason[r] =
                (into.proofing.skippedByReason[r] || 0) + from.proofing.skippedByReason[r];
        }
    }
}

export async function processDocumentInChunks(
    context: Word.RequestContext,
    opts: OoxmlOptions
): Promise<ChunkingResult> {
    const t0 = nowMs();
    await workerClient.init();

    const paragraphs = context.document.body.paragraphs;
    paragraphs.load("items");

    // eslint-disable-next-line office-addins/no-context-sync-in-loop
    await context.sync();

    const totalParagraphs = paragraphs.items.length;
    let agg: ConvertStats | null = null;
    let i = 0;
    let batchSize = BATCH_SIZE_START;

    while (i < totalParagraphs) {
        if (state.activeAbortController?.signal.aborted) break;

        const batchStart = nowMs();
        const batchItems = paragraphs.items.slice(i, i + batchSize);
        if (batchItems.length === 0) break;

        const batchRange = batchItems[0]
            .getRange("Whole")
            .expandTo(batchItems[batchItems.length - 1].getRange("Whole"));
        const ooxmlRes = batchRange.getOoxml();

        /**
         * ARHITEKTONSKO OBRAZLOŽENJE: context.sync() unutar petlje je neophodan
         * za "Adaptive Smart Chunking". On omogućava Word hostu da oslobodi UI nit
         * i obradi OOXML u delovima, sprečavajući Out-of-Memory greške kod 1000+ strana.
         */
        // eslint-disable-next-line office-addins/no-context-sync-in-loop
        await context.sync();

        const result = await workerClient.convert(ooxmlRes.value, opts);

        if (!agg) agg = emptyStats(result.stats.direction);
        mergeStats(agg, result.stats);

        if (result.xml !== ooxmlRes.value) {
            batchRange.insertOoxml(result.xml, Word.InsertLocation.replace);
        }

        i += batchSize;
        const progress = Math.round((i / totalParagraphs) * 100);
        setProgress(progress);
        setStatus(t("status_processing") + ` ${progress}%`, "info");

        await new Promise((r) => setTimeout(r, YIELD_DELAY_MS));

        // Adaptive batching logic
        const dur = nowMs() - batchStart;
        perfMonitor.record("processChunk", batchItems.length, dur, { batchSize: batchItems.length });

        const msPerPara = dur / batchItems.length;
        const idealBatch = Math.floor(TARGET_TIME_MS / msPerPara);
        batchSize = Math.max(MIN_BATCH, Math.min(MAX_BATCH, Math.floor((batchSize + idealBatch) / 2)));
    }

    // Finalni sync nakon izmena
    // eslint-disable-next-line office-addins/no-context-sync-in-loop
    await context.sync();

    const finalStats = agg || emptyStats((opts.direction as ConvertStats["direction"]) || "auto");
    finalStats.timingMs = nowMs() - t0;

    return { type: labelForDirection(finalStats.direction), stats: finalStats };
}
