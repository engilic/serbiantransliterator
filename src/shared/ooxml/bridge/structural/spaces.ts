// src/shared/ooxml/bridge/structural/spaces.ts

/**
 * Spaja višestruke space koji su razbijeni preko više <w:t> čvorova.
 * Primer: "između" + "  " + "reči" → "između" + " " + "reči"
 *
 * NEW: tretira i NBSP (\u00A0) kao “space” u smislu bridging-a.
 */

import { areNodesAdjacent } from "../../common";

export function bridgeSpacesAcrossTextNodes(textNodes: Element[]): number {
    const NBSP = "\u00A0";

    let changed = 0;
    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;
        const bNode = textNodes[i + 1];
        if (!bNode) continue;

        const aText = aNode.textContent ?? "";
        let bText = bNode.textContent ?? "";

        const aEndsWithSpaceLike = aText.endsWith(" ") || aText.endsWith(NBSP);
        const bStartsWithSpaceLike = bText.startsWith(" ") || bText.startsWith(NBSP);

        // Ako a završava space-like, a b počinje space-like
        if (aEndsWithSpaceLike && bStartsWithSpaceLike && areNodesAdjacent(aNode, bNode)) {
            // Ukloni sve vodeće space/NBSP iz b
            bText = bText.replace(/^[ \u00A0]+/g, "");
            // Ako bText je sada prazan, preskoči na sledeći čvor
            if (bText.length === 0) {
                bNode.textContent = "";
                changed++;
                continue;
            }

            // Obezbedi da između a i b ostane tačno jedan space-like.
            // Ako je u a bio NBSP, čuvamo NBSP; inače čuvamo regularan space.
            const keep = aText.endsWith(NBSP) ? NBSP : " ";

            aNode.textContent = aText.replace(/[ \u00A0]+$/g, keep);
            bNode.textContent = bText;
            changed++;
        }
    }
    return changed;
}
