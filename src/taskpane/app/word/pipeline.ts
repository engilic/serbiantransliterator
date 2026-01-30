// src/taskpane/app/word/pipeline.ts
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
import { processDocumentInChunks } from "./chunking";
import { workerClient } from "../../worker/client"; // Dodato za Worker podršku

/**
 * Maksimalna veličina OOXML-a za selekciju koju dozvoljavamo.
 * 5MB OOXML-a može sadržati ogroman broj stranica teksta.
 */
const MAX_SELECTION_OOXML_SIZE = 5 * 1024 * 1024;

export type OoxmlConvertResult = ReturnType<typeof convertOoxml>;

/**
 * Obrađuje određeni opseg (range) teksta koristeći OOXML konverziju.
 * U v1.0.0 God Mode verziji, ovo se izvršava u Workeru kako bi UI ostao fluidan.
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

    // GOD MODE: Umesto blokiranja glavne niti sa convertOoxml, šaljemo u Worker.
    // workerClient.convert automatski koristi Zero-Copy Transfer (Uint8Array).
    const result = await workerClient.convert(rawXml, opts);

    if (result.type === "Nema teksta") return null;

    // Upisujemo nazad obrađeni OOXML
    range.insertOoxml(result.xml, Word.InsertLocation.replace);

    // Čuvamo selekciju korisnika radi boljeg UX-a
    range.select();

    await context.sync();

    return result;
}

/**
 * Glavni pipeline koji odlučuje da li se obrađuje selekcija ili ceo dokument.
 */
export async function applyPipeline(
    context: Word.RequestContext,
    scope: "selection" | "document",
    ui: UiSettings,
    opts: OoxmlOptions
): Promise<{ result: OoxmlConvertResult | null; extras: ExtrasSummary }> {
    // Inicijalizujemo worker pre nego što nam zatreba
    await workerClient.init();

    if (scope === "selection") {
        const range = context.document.getSelection();
        range.load("text");
        await context.sync();

        const info = analyzeSelectionText(range.text);

        // Validacija selekcije
        if (!info.hasText) {
            showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_no_selection")));
            return { result: null, extras: emptyExtrasSummary() };
        }
        if (info.isJustWhitespace) {
            showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_empty_selection")));
            return { result: null, extras: emptyExtrasSummary() };
        }

        // Pokrećemo konverziju selekcije (Worker-based)
        const result = await applyRangeWithOoxmlConversion(context, range, opts);
        return { result, extras: emptyExtrasSummary() };
    }

    /**
     * DOCUMENT SCOPE
     * Obrađuje ceo dokument koristeći Adaptive Chunking logiku.
     */

    // 1. Obrađujemo "Extras" (Headers, Footers, Notes) ako su uključeni
    const extras = await applyExtrasIfEnabled(context, ui, opts);

    // 2. Pokrećemo procesiranje tela dokumenta u delovima (chunks)
    // processDocumentInChunks interno komunicira sa workerClient-om
    const chunk = await processDocumentInChunks(context, opts);

    const result: OoxmlConvertResult = {
        xml: "", // XML ovde nije bitan jer je dokument već izmenjen chunk po chunk
        type: chunk.type,
        stats: chunk.stats,
    };

    return { result, extras };
}

/* global Word */
