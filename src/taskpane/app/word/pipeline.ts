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

// ✅ koristimo isti detectScript kao convertOoxml da bude 100% konzistentno
import { detectScript } from "../../../core/textCore";

const MAX_SELECTION_OOXML_SIZE = 5 * 1024 * 1024;

export type OoxmlConvertResult = ReturnType<typeof convertOoxml>;

async function resolveAutoDirectionForWholeDocument(
    context: Word.RequestContext,
    opts: OoxmlOptions
): Promise<OoxmlOptions> {
    const dir = opts.direction ?? "auto";

    // ako je korisnik eksplicitno izabrao smer (ili to-ascii), ne diramo
    if (dir !== "auto") return opts;

    // Ako je auto: uzmi tekst dokumenta i odluči smer jednom, pa prosledi worker-u.
    const body = context.document.body;
    body.load("text");
    await context.sync();

    const text = body.text ?? "";
    const script = detectScript(text);
    const resolved = script === "latin" ? "lat-to-cyr" : "cyr-to-lat";

    return { ...opts, direction: resolved };
}

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

    // PR1: preserve selection UX (same as previous runSmart selection flow)
    range.select();

    await context.sync();

    return result;
}

export async function applyPipeline(
    context: Word.RequestContext,
    scope: "selection" | "document",
    ui: UiSettings,
    opts: OoxmlOptions
): Promise<{ result: OoxmlConvertResult | null; extras: ExtrasSummary }> {
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

    // DOCUMENT scope
    // ✅ KLJUČNO: "auto" razreši unapred (worker chunking često ne radi ništa sa auto)
    const effectiveOpts = await resolveAutoDirectionForWholeDocument(context, opts);

    const extras = await applyExtrasIfEnabled(context, ui, effectiveOpts);

    const chunk = await processDocumentInChunks(context, effectiveOpts);

    const result: OoxmlConvertResult = {
        xml: "", // not relevant for whole doc (we apply by chunks)
        type: chunk.type,
        stats: chunk.stats,
    };

    return { result, extras };
}
