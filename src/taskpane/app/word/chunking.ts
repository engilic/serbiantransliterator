// src/taskpane/app/word/chunking.ts
/* global Word */

import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";

const BATCH_SIZE = 25;
const YIELD_DELAY_MS = 20;

// Interfejs za callback-ove (isto kao u applyRefactored)
export interface ChunkingCallbacks {
    onProgress: (percent: number) => void;
    onStatus: (msg: string) => void;
}

/**
 * Refaktorisana funkcija koja ne zavisi od DOM-a.
 * Prima callbacks za ažuriranje UI-a.
 */
export async function processDocumentInChunksRefactored(
    context: Word.RequestContext,
    opts: OoxmlOptions,
    callbacks: ChunkingCallbacks
): Promise<number> {
    const { onProgress, onStatus } = callbacks;

    const paragraphs = context.document.body.paragraphs;
    // eslint-disable-next-line office-addins/no-context-sync-in-loop
    paragraphs.load("items");
    await context.sync();

    const totalParagraphs = paragraphs.items.length;
    let processedCount = 0;
    let changedNodesTotal = 0;

    if (totalParagraphs === 0) return 0;

    onProgress(0);
    onStatus(`Početak obrade (0/${totalParagraphs})`);

    for (let i = 0; i < totalParagraphs; i += BATCH_SIZE) {
        const batchItems = paragraphs.items.slice(i, i + BATCH_SIZE);

        if (batchItems.length === 0) continue;

        const firstPara = batchItems[0];
        const lastPara = batchItems[batchItems.length - 1];
        const batchRange = firstPara.getRange("Whole").expandTo(lastPara.getRange("Whole"));

        const ooxmlRes = batchRange.getOoxml();

        // eslint-disable-next-line office-addins/no-context-sync-in-loop
        await context.sync();

        const rawXml = ooxmlRes.value;
        if (!rawXml) continue;

        const result = convertOoxml(rawXml, opts);

        if (result.type !== "Nema teksta") {
            batchRange.insertOoxml(result.xml, Word.InsertLocation.replace);
            changedNodesTotal += result.stats.textNodes;
        }

        processedCount += batchItems.length;

        // === UPDATE REACT STATE ===
        const progressPercent = Math.round((processedCount / totalParagraphs) * 100);
        onProgress(progressPercent);
        onStatus(`Obrada... ${progressPercent}% (${processedCount}/${totalParagraphs})`);

        // eslint-disable-next-line office-addins/no-context-sync-in-loop
        await context.sync();
        await new Promise((resolve) => setTimeout(resolve, YIELD_DELAY_MS));
    }

    return changedNodesTotal;
}
