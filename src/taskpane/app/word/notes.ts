// src/taskpane/app/word/notes.ts
/* global Word */

import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";

export async function processNotes(
    context: Word.RequestContext,
    opts: OoxmlOptions,
    kind: "footnotes" | "endnotes"
): Promise<{ processed: number; supported: boolean }> {
    let processed = 0;

    const docAny = context.document as {
        footnotes?: { load: (props: string) => void; items: unknown[] };
        endnotes?: { load: (props: string) => void; items: unknown[] };
    };
    const bodyAny = context.document.body as {
        footnotes?: { load: (props: string) => void; items: unknown[] };
        endnotes?: { load: (props: string) => void; items: unknown[] };
    };

    const coll = bodyAny?.[kind] ?? docAny?.[kind];
    if (!coll || typeof coll.load !== "function") {
        return { processed: 0, supported: false };
    }

    coll.load("items");
    await context.sync();

    type OoxmlResult = ReturnType<Word.Range["getOoxml"]>;
    type Req = { range: Word.Range; ooxml: OoxmlResult };
    const reqs: Req[] = [];

    const items: unknown[] = coll.items ?? [];
    for (const item of items) {
        let r: Word.Range | null = null;

        try {
            const itemWithRange = item as {
                getRange?: () => Word.Range;
                body?: { getRange?: (type: string) => Word.Range };
                contentRange?: Word.Range;
            };

            if (typeof itemWithRange.getRange === "function") {
                r = itemWithRange.getRange();
            } else if (itemWithRange.body && typeof itemWithRange.body.getRange === "function") {
                r = itemWithRange.body.getRange("Whole");
            } else if (itemWithRange.contentRange) {
                r = itemWithRange.contentRange;
            }
        } catch {
            // ignore (some note items might not expose range in this context)
            r = null;
        }

        if (!r) continue;

        try {
            const o = r.getOoxml();
            reqs.push({ range: r, ooxml: o });
        } catch {
            // ignore
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

    return { processed, supported: true };
}
