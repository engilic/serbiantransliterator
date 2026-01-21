// src/taskpane/app/word/chunking.ts
/* global Word */

import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";
import { setStatus, setProgress } from "../status"; // IMPORTUJ setProgress
import { t } from "../../../shared/i18n";

const BATCH_SIZE = 25;
const YIELD_DELAY_MS = 20;

export async function processDocumentInChunks(
    context: Word.RequestContext,
    opts: OoxmlOptions
): Promise<number> {
    const paragraphs = context.document.body.paragraphs;
    // eslint-disable-next-line office-addins/no-context-sync-in-loop
    paragraphs.load("items");
    await context.sync();

    const totalParagraphs = paragraphs.items.length;
    let processedCount = 0;
    let changedNodesTotal = 0;

    if (totalParagraphs === 0) return 0;

    // Reset progress start
    setProgress(0);
    const initialMsg = t("status_processing") + ` (0/${totalParagraphs})`;
    setStatus(initialMsg, "info");

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

        // === UPDATE PROGRESS BAR ===
        const progressPercent = Math.round((processedCount / totalParagraphs) * 100);
        setProgress(progressPercent);

        const statusMsg = `${t("status_processing")} ${progressPercent}% (${processedCount}/${totalParagraphs})`;
        setStatus(statusMsg, "info");

        // eslint-disable-next-line office-addins/no-context-sync-in-loop
        await context.sync();
        await new Promise((resolve) => setTimeout(resolve, YIELD_DELAY_MS));
    }

    // Hide progress bar when done
    setTimeout(() => setProgress(null), 500);

    return changedNodesTotal;
}
