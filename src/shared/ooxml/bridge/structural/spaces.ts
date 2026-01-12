// src/shared/ooxml/bridge/bridgeSpaces.ts

/**
 * Spaja višestruke space koji su razbijeni preko više <w:t> čvorova.
 * Primer: "između" + "  " + "reči" → "između" + " " + "reči"
 */
export function bridgeSpacesAcrossTextNodes(textNodes: Element[]): number {
    let changed = 0;
    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;
        const bNode = textNodes[i + 1];
        if (!bNode) continue;
        const aText = aNode.textContent ?? "";
        let bText = bNode.textContent ?? "";

        // Ako a završava sa space, a b počinje sa space
        if (aText.endsWith(" ") && bText.startsWith(" ")) {
            // Ukloni sve vodeće space iz b, ostavi samo jedan
            bText = bText.replace(/^ +/, "");
            // Ako bText je sada prazan, preskoči na sledeći čvor
            if (bText.length === 0) {
                bNode.textContent = "";
                changed++;
                continue;
            }
            // Obezbedi da između a i b ostane samo jedan space
            aNode.textContent = aText.replace(/ +$/, " ");
            bNode.textContent = bText;
            changed++;
        }
    }
    return changed;
}