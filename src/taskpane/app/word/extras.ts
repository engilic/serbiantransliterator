// src/taskpane/app/word/extras.ts
import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import type { UiSettings, ExtrasSummary } from "../types";
import { emptyExtrasSummary } from "../types";
import { setStatus } from "../status";
import { processHeadersFooters } from "./headersFooters";
import { processNotes } from "./notes";
import { t } from "../../../shared/i18n";

export async function applyExtrasIfEnabled(
    context: Word.RequestContext,
    ui: UiSettings,
    opts: OoxmlOptions
): Promise<ExtrasSummary> {
    const summary = emptyExtrasSummary();

    if (ui.includeHeadersFooters) {
        try {
            setStatus(t("status_processing_headers_footers"), "info");
            summary.headersFootersProcessed = await processHeadersFooters(context, opts);
        } catch (e) {
            console.warn("Header/Footer obrada nije uspela:", e);
        }
    }

    if (ui.includeFootnotes) {
        try {
            setStatus(t("status_processing_footnotes"), "info");
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
            setStatus(t("status_processing_endnotes"), "info");
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
