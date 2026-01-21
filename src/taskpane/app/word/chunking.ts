// src/taskpane/app/word/chunking.ts
/* global Word */

import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";
import { setStatus } from "../status";
import { t } from "../../../shared/i18n";

// Smanjeno sa 50 na 25 radi veće stabilnosti na slabijim mašinama
const BATCH_SIZE = 25;
// Pauza između betčeva da UI "prodiše" (sprečava "Add-in is unresponsive" upozorenje)
const YIELD_DELAY_MS = 20;

/**
 * Obrađuje dokument deo po deo (chunking) kako bi se izbegao 5MB limit
 * i UI freeze na velikim dokumentima.
 */
export async function processDocumentInChunks(
    context: Word.RequestContext,
    opts: OoxmlOptions
): Promise<number> {
    // 1. Učitaj reference na sve paragrafe (ovo je metadata, ne ceo tekst)
    const paragraphs = context.document.body.paragraphs;
    // eslint-disable-next-line office-addins/no-context-sync-in-loop
    paragraphs.load("items");
    await context.sync();

    const totalParagraphs = paragraphs.items.length;
    let processedCount = 0;
    let changedNodesTotal = 0;

    // Ako je dokument prazan
    if (totalParagraphs === 0) return 0;

    const initialMsg = t("status_processing") + ` (0/${totalParagraphs})`;
    setStatus(initialMsg, "info");

    // 2. Iteracija kroz "batch-eve"
    for (let i = 0; i < totalParagraphs; i += BATCH_SIZE) {
        // Uzmi pod-niz paragrafa za trenutni batch
        // (Word API objekti su validni dokle god je context živ)
        const batchItems = paragraphs.items.slice(i, i + BATCH_SIZE);

        if (batchItems.length === 0) continue;

        // Kreiraj Range koji obuhvata ceo batch (od početka prvog do kraja poslednjeg)
        const firstPara = batchItems[0];
        const lastPara = batchItems[batchItems.length - 1];

        // expandTo radi spajanje opsega
        const batchRange = firstPara.getRange("Whole").expandTo(lastPara.getRange("Whole"));

        // 3. Učitaj "teški" OOXML samo za ovaj batch
        const ooxmlRes = batchRange.getOoxml();

        // eslint-disable-next-line office-addins/no-context-sync-in-loop
        await context.sync();

        const rawXml = ooxmlRes.value;
        if (!rawXml) continue;

        // 4. Konverzija (Sync operacija u JS-u, ne blokira Word)
        const result = convertOoxml(rawXml, opts);

        // 5. Ako ima promena, vrati nazad u Word
        if (result.type !== "Nema teksta") {
            batchRange.insertOoxml(result.xml, Word.InsertLocation.replace);
            changedNodesTotal += result.stats.textNodes;
        }

        // 6. Osveži UI status
        processedCount += batchItems.length;
        const progress = Math.round((processedCount / totalParagraphs) * 100);

        const statusMsg = `${t("status_processing")} ${progress}% (${processedCount}/${totalParagraphs})`;
        setStatus(statusMsg, "info");

        // 7. Sync + Yield (Ključna promena: čekamo malo da UI ne blokira)
        // eslint-disable-next-line office-addins/no-context-sync-in-loop
        await context.sync();
        await new Promise((resolve) => setTimeout(resolve, YIELD_DELAY_MS));
    }

    return changedNodesTotal;
}
