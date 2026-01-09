import {
    findNextNodeWithText,
    firstCp,
    lastCp,
    dropFirstCp,
    latinLetterSr,
} from "../common";

export function bridgeDigraphsAcrossTextNodes(textNodes: Element[]): number {
    let changed = 0;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i]!;
        const aRaw = ((aNode.textContent ?? "")).normalize("NFC");
        if (!aRaw) continue;

        const j = findNextNodeWithText(textNodes, i + 1);
        if (j == null) continue;

        const bNode = textNodes[j]!;
        const bRaw = ((bNode.textContent ?? "")).normalize("NFC");
        if (!bRaw) continue;

        if (/\s$/.test(aRaw)) continue;
        if (/^\s/.test(bRaw)) continue;

        const aLast = lastCp(aRaw);
        const bFirst = firstCp(bRaw);
        if (!aLast || !bFirst) continue;

        if (!latinLetterSr(aLast) || !latinLetterSr(bFirst)) continue;

        const pair = (aLast + bFirst).toLowerCase();
        if (pair === "lj" || pair === "nj" || pair === "dž") {
            aNode.textContent = aRaw + bFirst;
            bNode.textContent = dropFirstCp(bRaw);
            changed++;
        }
    }

    return changed;
}