// src/shared/ooxml/bridge/lexical/digraphs.ts

import { findNextNodeWithText, firstCp, lastCp, dropFirstCp, areNodesAdjacent } from "../../common";

export function bridgeDigraphsAcrossTextNodes(textNodes: Element[]): number {
    let changed = 0;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;

        const j = findNextNodeWithText(textNodes, i + 1);
        if (j == null) continue;

        const bNode = textNodes[j];
        if (!bNode) continue;

        // [MAX1 FIX] Spajaj samo ako su čvorovi fizički jedan do drugog (bez tabova/br izmedju)
        if (!areNodesAdjacent(aNode, bNode)) continue;

        const aRaw = aNode.textContent ?? "";
        const bRaw = bNode.textContent ?? "";
        if (!aRaw || !bRaw || /\s$/.test(aRaw) || /^\s/.test(bRaw)) continue;

        const pair = (lastCp(aRaw) + firstCp(bRaw)).toLowerCase();

        // [MAX1 Structural] Samo prebacujemo JEDAN karakter da engine dobije kontekst
        if (pair === "nj" || pair === "lj" || pair === "dž") {
            const charToMove = firstCp(bRaw);
            if (charToMove == null) continue;

            aNode.textContent = aRaw + charToMove;
            bNode.textContent = dropFirstCp(bRaw);
            changed++;
        }
    }

    return changed;
}
