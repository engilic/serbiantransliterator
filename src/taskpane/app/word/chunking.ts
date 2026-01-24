// src/taskpane/app/word/chunking.ts
/* global Word */

import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { setStatus, setProgress } from "../status";
import { t } from "../../../shared/i18n";
// NEW: Importujemo klijenta
import { workerClient } from "../../worker/client";

// Povećan batch size jer procesiranje više ne blokira UI thread.
// Ranije je bilo 25, sada može 50 ili više (zavisi od Word API limita).
const BATCH_SIZE = 50;
const YIELD_DELAY_MS = 5;

/**
 * Obrađuje dokument deo po deo (chunking), ali samu konverziju
 * delegira Web Workeru (Off-Main-Thread).
 */
export async function processDocumentInChunks(
    context: Word.RequestContext,
    opts: OoxmlOptions
): Promise<number> {
    // 0. Osiguraj da je worker spreman (ako init nije prošao u pozadini)
    // Ovo je idempotentan poziv (ako je već ready, vraća odmah).
    setStatus(t("status_processing") + " (Inicijalizacija Workera...)", "info");
    await workerClient.init();

    // 1. Učitaj reference na sve paragrafe
    const paragraphs = context.document.body.paragraphs;
    // eslint-disable-next-line office-addins/no-context-sync-in-loop
    paragraphs.load("items");
    await context.sync();

    const totalParagraphs = paragraphs.items.length;
    let processedCount = 0;
    let changedNodesTotal = 0;

    // Ako je dokument prazan
    if (totalParagraphs === 0) return 0;

    // Reset progress start
    setProgress(0);
    const initialMsg = t("status_processing") + ` (0/${totalParagraphs})`;
    setStatus(initialMsg, "info");

    // 2. Iteracija kroz "batch-eve"
    for (let i = 0; i < totalParagraphs; i += BATCH_SIZE) {
        const batchItems = paragraphs.items.slice(i, i + BATCH_SIZE);

        if (batchItems.length === 0) continue;

        const firstPara = batchItems[0];
        const lastPara = batchItems[batchItems.length - 1];

        // expandTo radi spajanje opsega
        const batchRange = firstPara.getRange("Whole").expandTo(lastPara.getRange("Whole"));

        // 3. Učitaj "teški" OOXML samo za ovaj batch (Main Thread)
        const ooxmlRes = batchRange.getOoxml();

        // eslint-disable-next-line office-addins/no-context-sync-in-loop
        await context.sync();

        const rawXml = ooxmlRes.value;
        if (!rawXml) continue;

        // 4. KONVERZIJA U WORKERU (Off-Main-Thread) 🚀
        // Ovde šaljemo XML string workeru. UI thread ostaje slobodan.
        // `workerClient.convert` vraća Promise koji se resolve-uje kad worker završi.
        const result = await workerClient.convert(rawXml, opts);

        // 5. Ako ima promena, vrati nazad u Word (Main Thread)
        if (result.type !== "Nema teksta") {
            batchRange.insertOoxml(result.xml, Word.InsertLocation.replace);
            changedNodesTotal += result.stats.textNodes;
        }

        // 6. Osveži UI status
        processedCount += batchItems.length;
        const progress = Math.round((processedCount / totalParagraphs) * 100);
        setProgress(progress);

        const statusMsg = `${t("status_processing")} ${progress}% (${processedCount}/${totalParagraphs})`;
        setStatus(statusMsg, "info");

        // 7. Yield
        // Iako worker radi u pozadini, Word API (context.sync) i dalje troši CPU na main thread-u.
        // Kratka pauza dozvoljava Office-u da procesuira queue i sprečava "Unresponsive" poruke.
        await new Promise((resolve) => setTimeout(resolve, YIELD_DELAY_MS));
    }

    // Hide progress bar when done
    setTimeout(() => setProgress(null), 500);

    return changedNodesTotal;
}
