// src/shared/ooxml/quotes.ts

import { createInitialCodeState, transformQuotesRespectingCode } from "./code";

export function applySerbianQuotesAcrossNodes(textNodes: Element[], preserveCodeBlocks: boolean) {
  if (!preserveCodeBlocks) {
    let open = false;

    for (const node of textNodes) {
      const raw = node.textContent ?? "";
      if (!raw) continue;

      const normalized = raw.replace(/[“”‘’«»„‟‚‛‹›]/g, `"`);
      let out = "";
      for (const ch of normalized) {
        if (ch === `"`) {
          out += open ? "”" : "„";
          open = !open;
        } else out += ch;
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