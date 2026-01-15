// src/taskpane/app/word/extras.ts
/* global console */

import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import type { UiSettings, ExtrasSummary } from "../types";
import { emptyExtrasSummary } from "../types";
import { setStatus } from "../status";
import { processHeadersFooters } from "./headersFooters";
import { processNotes } from "./notes";

export async function applyExtrasIfEnabled(
    context: Word.RequestContext,
    ui: UiSettings,
    opts: OoxmlOptions
): Promise<ExtrasSummary> {
    const summary = emptyExtrasSummary();

    if (ui.includeHeadersFooters) {
        try {
            setStatus("Obrada: zaglavlja/podno�ja...", "info");
            summary.headersFootersProcessed = await processHeadersFooters(context, opts);
        } catch (e) {
            console.warn("Header/Footer obrada nije uspela:", e);
            // best-effort: leave processed = 0
        }
    }

    if (ui.includeFootnotes) {
        try {
            setStatus("Obrada: fusnote...", "info");
            const r = await processNotes(context, opts, "footnotes");
            summary.footnotesProcessed = r.processed;
            summary.footnotesSupported = r.supported;
        } catch (e) {
            console.warn("Footnotes obrada nije uspela:", e);
            summary.footnotesProcessed = 0;
            summary.footnotesSupported = false;
        }
    }

    if (ui.includeEndnotes) {
        try {
            setStatus("Obrada: endnote...", "info");
            const r = await processNotes(context, opts, "endnotes");
            summary.endnotesProcessed = r.processed;
            summary.endnotesSupported = r.supported;
        } catch (e) {
            console.warn("Endnotes obrada nije uspela:", e);
            summary.endnotesProcessed = 0;
            summary.endnotesSupported = false;
        }
    }

    return summary;
}
