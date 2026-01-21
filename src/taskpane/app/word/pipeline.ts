// src/taskpane/app/word/pipeline.ts
/* global Word */

import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";
import type { UiSettings, ExtrasSummary } from "../types";
import { emptyExtrasSummary } from "../types";
import { showModalInfo } from "../modal/modal";
import { unsafeHtml } from "../../../shared/safeHtml";
import { applyExtrasIfEnabled } from "./extras";
import { setStatus } from "../status";
import { analyzeSelectionText } from "./selectionText";
import { t } from "../../../shared/i18n";
// IMPORTUJ NOVU FUNKCIJU
import { processDocumentInChunks } from "./chunking";

// Limit za SELEKCIJU ostaje (da spreči korisnika da selektuje previše odjednom ručno)
const MAX_SELECTION_OOXML_SIZE = 5 * 1024 * 1024;

export type OoxmlConvertResult = ReturnType<typeof convertOoxml>;

/**
 * Helper za obradu jednog Range-a (za Selekciju).
 */
async function applyRangeWithOoxmlConversion(
    context: Word.RequestContext,
    range: Word.Range,
    opts: OoxmlOptions
): Promise<OoxmlConvertResult | null> {
    setStatus(t("status_processing"), "info");

    const ooxml = range.getOoxml();
    await context.sync();

    const rawXml = ooxml.value ?? "";

    if (rawXml.length > MAX_SELECTION_OOXML_SIZE) {
        showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_doc_too_large")));
        setStatus(t("status_error_prefix", t("status_doc_too_large_short")), "error");
        return null;
    }

    const result = convertOoxml(rawXml, opts);
    if (result.type === "Nema teksta") return null;

    range.insertOoxml(result.xml, Word.InsertLocation.replace);
    await context.sync();

    return result;
}

export async function applyPipeline(
    context: Word.RequestContext,
    scope: "selection" | "document",
    ui: UiSettings,
    opts: OoxmlOptions
): Promise<{ result: OoxmlConvertResult | null; extras: ExtrasSummary }> {
    // --- 1. SELEKCIJA (Stari način, sve odjednom) ---
    if (scope === "selection") {
        const range = context.document.getSelection();
        range.load("text");
        await context.sync();

        const info = analyzeSelectionText(range.text);

        if (!info.hasText) {
            showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_no_selection")));
            return { result: null, extras: emptyExtrasSummary() };
        }
        if (info.isJustWhitespace) {
            showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_empty_selection")));
            return { result: null, extras: emptyExtrasSummary() };
        }

        const result = await applyRangeWithOoxmlConversion(context, range, opts);
        return { result, extras: emptyExtrasSummary() };
    }

    // --- 2. CEO DOKUMENT (Novi način: Chunking + Extras) ---

    // Prvo obradi extras (Header/Footer/Fusnote) - oni su manji, idu brzo
    const extras = await applyExtrasIfEnabled(context, ui, opts);

    // Zatim glavni body kroz chunking
    const nodesChanged = await processDocumentInChunks(context, opts);

    // Konstruišemo "lažni" result objekat za statistiku
    // (pošto ne možemo da vratimo jedan XML za ceo dokument, vraćamo sumu)
    const result: OoxmlConvertResult = {
        xml: "", // Nije relevantno za document scope
        type:
            opts.direction === "lat-to-cyr"
                ? "Lat → Ćir"
                : opts.direction === "cyr-to-lat"
                  ? "Ćir → Lat"
                  : "Ošišana",
        stats: {
            // Popunjavamo samo ono što možemo da sumiramo ili je bitno za UI
            direction: opts.direction || "auto",
            textNodes: nodesChanged,
            timingMs: 0, // Vreme meri spoljni wrapper
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
        },
    };

    return { result, extras };
}
