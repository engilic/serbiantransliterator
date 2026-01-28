// src/taskpane/app/word/headersFooters.ts
import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";

export async function processHeadersFooters(
    context: Word.RequestContext,
    opts: OoxmlOptions
): Promise<number> {
    let processed = 0;

    const sections = context.document.sections;
    sections.load("items");
    await context.sync();

    const types: Word.HeaderFooterType[] = [
        Word.HeaderFooterType.primary,
        Word.HeaderFooterType.firstPage,
        Word.HeaderFooterType.evenPages,
    ];

    type OoxmlResult = ReturnType<Word.Range["getOoxml"]>;
    type Req = { range: Word.Range; ooxml: OoxmlResult };
    const reqs: Req[] = [];

    for (const sec of sections.items) {
        for (const t of types) {
            try {
                const r = sec.getHeader(t).getRange();
                const o = r.getOoxml();
                reqs.push({ range: r, ooxml: o });
            } catch {
                // ignore (header might not exist in this context)
            }

            try {
                const r = sec.getFooter(t).getRange();
                const o = r.getOoxml();
                reqs.push({ range: r, ooxml: o });
            } catch {
                // ignore (footer might not exist in this context)
            }
        }
    }

    await context.sync();

    for (const req of reqs) {
        const xmlIn = req.ooxml.value;
        if (!xmlIn) continue;

        const res = convertOoxml(xmlIn, opts);
        if (res.type === "Nema teksta") continue;

        req.range.insertOoxml(res.xml, Word.InsertLocation.replace);
        processed++;
    }

    if (processed > 0) await context.sync();

    return processed;
}
