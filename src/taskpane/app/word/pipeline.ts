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
import { workerClient } from "../../worker/client";

const MAX_SELECTION_OOXML_SIZE = 5 * 1024 * 1024;
export type OoxmlConvertResult = ReturnType<typeof convertOoxml>;

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
        return null;
    }

    const result = await workerClient.convert(rawXml, opts);
    if (result.type === "Nema teksta") return null;

    range.insertOoxml(result.xml, Word.InsertLocation.replace);
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
    await workerClient.init();

    if (scope === "selection") {
        const range = context.document.getSelection();
        range.load("text");
        await context.sync();
        const info = analyzeSelectionText(range.text);
        if (!info.hasText || info.isJustWhitespace) {
            showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_no_selection")));
            return { result: null, extras: emptyExtrasSummary() };
        }
        const result = await applyRangeWithOoxmlConversion(context, range, opts);
        return { result, extras: emptyExtrasSummary() };
    }

    const extras = await applyExtrasIfEnabled(context, ui, opts);
    const chunk = await processDocumentInChunks(context, opts);
    return { result: { xml: "", type: chunk.type, stats: chunk.stats }, extras };
}
