// src/app/engine/serbianEngine.ts

import type { Engine, EngineConvertInput, EngineConvertOutput } from "../ports/engine";
import type { DiffOp, DocumentSelection } from "../types";

import { convertPlainText, type Direction as CoreDirection } from "../../core/textCore";
import { convertOoxml, type OoxmlOptions } from "../../shared/ooxml/convertOoxml";
import { parseSafeOoxml } from "../../shared/ooxml/xmlParser";
import { myersDiff } from "../../shared/diff";
import { toAscii } from "../../shared/ooxml/converterUtils";

const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

type PlainConvertOpts = Parameters<typeof convertPlainText>[2];

function tokenizeForDiff(text: string): string[] {
    return String(text || "")
        .split(/([ \t\n\r]+)/)
        .filter((x) => x);
}

export function extractTextFromWordOoxml(xml: string): string | null {
    const doc = parseSafeOoxml(xml);
    if (!doc) return null;

    const paras = Array.from(doc.getElementsByTagNameNS(WORD_NS, "p"));

    if (paras.length === 0) {
        return Array.from(doc.getElementsByTagNameNS(WORD_NS, "t"))
            .map((n) => n.textContent ?? "")
            .join("");
    }

    const walk = (node: Node): string => {
        const nodeType = (node as unknown as { nodeType?: number }).nodeType ?? 0;
        if (nodeType === 3) return ""; // TEXT_NODE

        const el = node as Element;
        const ln = (el as unknown as { localName?: string }).localName ?? "";
        if (!ln) return "";

        if (ln === "t") return el.textContent ?? "";
        if (ln === "tab") return "\t";
        if (ln === "br" || ln === "cr") return "\n";

        let out = "";
        const kids = Array.from(el.childNodes ?? []);
        for (const ch of kids) out += walk(ch);
        return out;
    };

    return paras.map(walk).join("\n");
}

export function createSerbianEngine(): Engine {
    return {
        async convert(input: EngineConvertInput): Promise<EngineConvertOutput> {
            if (input.kind === "plainText") {
                const dir = input.direction;

                const optsObj = input.options && typeof input.options === "object" ? input.options : {};
                const plainOpts = optsObj as unknown as PlainConvertOpts;

                if (dir === "to-ascii") {
                    const lat = convertPlainText(input.text, "cyr-to-lat", {
                        ...plainOpts,
                        applySerbianQuotes: false,
                        ignoredStyles: [],
                    });
                    return { kind: "plainText", text: toAscii(lat.text), typeLabel: "Ošišana latinica" };
                }

                const res = convertPlainText(input.text, dir as CoreDirection, {
                    ...plainOpts,
                    ignoredStyles: [],
                });

                return { kind: "plainText", text: res.text, typeLabel: res.type };
            }

            const opts = (input.options || {}) as OoxmlOptions;
            const out = convertOoxml(input.xml, {
                ...opts,
                direction: input.direction,
            });

            return { kind: "ooxml", xml: out.xml, typeLabel: out.type, stats: out.stats };
        },

        async diffText(before: string, after: string): Promise<DiffOp[]> {
            const a = tokenizeForDiff(before);
            const b = tokenizeForDiff(after);
            return myersDiff(a, b); // već je {type,value}
        },

        countChanges(diff: DiffOp[]): number {
            let c = 0;
            for (const op of diff) {
                if (!op) continue;
                if (op.type === "equal") continue;
                if (!String(op.value || "").trim()) continue;
                c++;
            }
            return c;
        },

        async selectionToPreviewText(selection: DocumentSelection): Promise<string> {
            if (selection.kind === "plainText") return String(selection.text || "");
            const txt = extractTextFromWordOoxml(selection.xml);
            return txt ?? "";
        },

        async convertedToPreviewText(converted: EngineConvertOutput): Promise<string> {
            if (converted.kind === "plainText") return String(converted.text || "");
            const txt = extractTextFromWordOoxml(converted.xml);
            return txt ?? "";
        },
    };
}
