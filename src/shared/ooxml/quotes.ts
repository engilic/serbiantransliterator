import { createInitialCodeState, transformQuotesRespectingCode } from "./code";

const QUOTE_VARIANTS_RE =
    /[\u201C\u201D\u2018\u2019\u00AB\u00BB\u201E\u201F\u201A\u201B\u2039\u203A]/g;

const OPEN_QUOTE = "\u201E";  // „
const CLOSE_QUOTE = "\u201D"; // ”

export function applySerbianQuotesAcrossNodes(textNodes: Element[], preserveCodeBlocks: boolean) {
    if (!preserveCodeBlocks) {
        let open = false;

        for (const node of textNodes) {
            const raw = node.textContent ?? "";
            if (!raw) continue;

            const normalized = raw.replace(QUOTE_VARIANTS_RE, `"`);
            let out = "";
            for (const ch of normalized) {
                if (ch === `"`) {
                    out += open ? CLOSE_QUOTE : OPEN_QUOTE;
                    open = !open;
                } else {
                    out += ch;
                }
            }
            node.textContent = out;
        }
        return;
    }

    const codeState = createInitialCodeState();
    const quoteState = { open: false };

    for (const node of textNodes) {
        const raw = node.textContent ?? "";
        if (!raw) continue;
        node.textContent = transformQuotesRespectingCode(raw, codeState, quoteState);
    }
}