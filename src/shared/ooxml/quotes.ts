import { createInitialCodeState, transformQuotesRespectingCode } from "./code";
import { QUOTE_VARIANTS_RE, OPEN_QUOTE, CLOSE_QUOTE } from "./quoteConstants";

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
