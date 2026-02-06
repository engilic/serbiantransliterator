/* global Word */
// src/taskpane/app/word/chunking.ts

import {
    convertOoxml,
    type OoxmlOptions,
    type ConvertStats,
} from "../../../shared/ooxml/convertOoxml";
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

function isInvalidArgumentError(e: unknown): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyE = e as any;
    return anyE?.code === "InvalidArgument" || String(anyE?.message || "").includes("InvalidArgument");
}

type ConvertLike = { xml: string; stats: ConvertStats };

function normalizeWorkerResult(raw: unknown, xmlIn: string, fallbackDir: ConvertStats["direction"]): ConvertLike {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = raw as any;

    const xml = typeof r?.xml === "string" ? r.xml : "";
    const stats: ConvertStats =
        r?.stats && typeof r.stats === "object" ? (r.stats as ConvertStats) : emptyStats(fallbackDir);

    // nikad ne vraćaj prazan xml (to može da ubije insertOoxml)
    return { xml: xml.length > 0 ? xml : xmlIn, stats };
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

    // ✅ KRITIČNO: paragraphs.items može ponekad biti undefined → pravimo safe array
    const loadedItems = (paragraphs as unknown as { items?: Word.Paragraph[] }).items;
    const items: Word.Paragraph[] = Array.isArray(loadedItems) ? loadedItems : [];

    const totalParagraphs = items.length;

    let agg: ConvertStats | null = null;
    let i = 0;
    let batchSize = BATCH_SIZE_START;

    let skipped = 0;

    // Jedna “provera”: ako worker vrati no-op, proveri lokalno i pređi na local fallback
    let checkedWorkerOnce = false;
    let forceLocal = false;

    while (i < totalParagraphs) {
        if (state.activeAbortController?.signal.aborted) break;

        const batchStart = nowMs();
        const batchItems = items.slice(i, i + batchSize);
        if (batchItems.length === 0) break;

        // Guard za expandTo (tvoja izmena) ✅
        const first = batchItems[0].getRange("Whole");
        const last = batchItems[batchItems.length - 1].getRange("Whole");
        const batchRange = batchItems.length === 1 ? first : first.expandTo(last);

        const ooxmlRes = batchRange.getOoxml();

        // eslint-disable-next-line office-addins/no-context-sync-in-loop
        await context.sync();

        const xmlIn = String(ooxmlRes.value ?? "");
        if (xmlIn.length === 0) {
            i += batchItems.length;
            continue;
        }

        // 1) Konverzija: worker (default) ili local fallback
        let used: ConvertLike;

        if (forceLocal) {
            const local = convertOoxml(xmlIn, opts);
            used = { xml: local.xml, stats: local.stats };
        } else {
            const workerRaw = await workerClient.convert(xmlIn, opts);
            const worker = normalizeWorkerResult(
                workerRaw,
                xmlIn,
                (opts.direction as ConvertStats["direction"]) || "auto"
            );

            // Ako worker vraća identično, uradi jednu proveru lokalno.
            if (!checkedWorkerOnce && worker.xml === xmlIn) {
                checkedWorkerOnce = true;

                const local = convertOoxml(xmlIn, opts);
                if (local.xml !== xmlIn) {
                    console.warn(
                        "[chunking] Worker returned NO-OP, but local convert changes XML. Switching to LOCAL fallback for the rest of the run."
                    );
                    forceLocal = true;
                    used = { xml: local.xml, stats: local.stats };
                } else {
                    used = worker;
                }
            } else {
                used = worker;
            }
        }

        if (!agg) agg = emptyStats(used.stats.direction);
        mergeStats(agg, used.stats);

        // 2) Apply (OOXML insert) – samo ako se stvarno razlikuje
        try {
            if (typeof used.xml === "string" && used.xml.length > 0 && used.xml !== xmlIn) {
                batchRange.insertOoxml(used.xml, Word.InsertLocation.replace);

                // ✅ odmah sync posle inserta (stabilizuje state)
                // eslint-disable-next-line office-addins/no-context-sync-in-loop
                await context.sync();
            }
        } catch (e) {
            if (isInvalidArgumentError(e) && batchItems.length > 1) {
                const old = batchSize;
                batchSize = Math.max(1, Math.floor(batchSize / 2));
                skipped++;
                console.warn(
                    `[chunking] insertOoxml InvalidArgument. Reducing batch ${old} -> ${batchSize}. i=${i}`
                );
                continue;
            }

            if (isInvalidArgumentError(e) && batchItems.length === 1) {
                skipped++;
                console.warn(
                    `[chunking] insertOoxml InvalidArgument for single paragraph at i=${i}. Skipping.`,
                    e
                );
                i += 1;
                continue;
            }

            throw e;
        }

        // 3) Progress + adaptivni batch size
        i += batchItems.length;

        const progress = Math.round((i / totalParagraphs) * 100);
        setProgress(progress);

        const extra = skipped > 0 ? ` | skipped=${skipped}` : "";
        const mode = forceLocal ? " | local-fallback" : "";
        setStatus(t("status_processing") + ` ${progress}%` + extra + mode, "info");

        await new Promise((r) => setTimeout(r, YIELD_DELAY_MS));

        const dur = nowMs() - batchStart;
        perfMonitor.record("processChunk", batchItems.length, dur, { batchSize: batchItems.length });

        const msPerPara = dur / Math.max(1, batchItems.length);
        const idealBatch = Math.floor(TARGET_TIME_MS / Math.max(0.0001, msPerPara));
        batchSize = Math.max(MIN_BATCH, Math.min(MAX_BATCH, Math.floor((batchSize + idealBatch) / 2)));
    }

    // eslint-disable-next-line office-addins/no-context-sync-in-loop
    await context.sync();

    const finalStats = agg || emptyStats((opts.direction as ConvertStats["direction"]) || "auto");
    finalStats.timingMs = nowMs() - t0;

    return { type: labelForDirection(finalStats.direction), stats: finalStats };
}
