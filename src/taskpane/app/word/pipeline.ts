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

export type OoxmlConvertResult = ReturnType<typeof convertOoxml>;

export async function applyRangeWithOoxmlConversion(
    context: Word.RequestContext,
    range: Word.Range,
    opts: OoxmlOptions
): Promise<OoxmlConvertResult | null> {
    setStatus("Obrada u toku...", "info");

    const ooxml = range.getOoxml();
    await context.sync();

    const result = convertOoxml(ooxml.value, opts);
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
    if (scope === "selection") {
        const range = context.document.getSelection();
        range.load("text");
        await context.sync();

        const info = analyzeSelectionText(range.text);

        if (!info.hasText) {
            showModalInfo("Gre�ka", unsafeHtml("Nema selekcije za preslovljavanje."));
            return { result: null, extras: emptyExtrasSummary() };
        }
        if (info.isJustWhitespace) {
            showModalInfo("Gre�ka", unsafeHtml("Selektovan je samo prazan prostor (razmaci)."));
            return { result: null, extras: emptyExtrasSummary() };
        }

        const result = await applyRangeWithOoxmlConversion(context, range, opts);
        return { result, extras: emptyExtrasSummary() };
    }

    const extras = await applyExtrasIfEnabled(context, ui, opts);

    const bodyRange = context.document.body.getRange("Whole");
    const result = await applyRangeWithOoxmlConversion(context, bodyRange, opts);
    return { result, extras };
}
