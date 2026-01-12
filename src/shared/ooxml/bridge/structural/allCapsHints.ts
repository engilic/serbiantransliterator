import {
    findNextNodeWithText,
    firstCp,
    lastCp,
    isUpperCyrillicLetter,
} from "../../common";

export const CYR_ALLCAPS_HINT = "А";
export const LAT_ALLCAPS_HINT = "A";

export function markCyrAllCapsDigraphHints(
    textNodes: Element[],
    skipExactTokens?: Set<string>
): { hinted: WeakSet<Element>; count: number } {
    const hinted = new WeakSet<Element>();
    let count = 0;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;
        const aRaw = ((aNode.textContent ?? "")).normalize("NFC");
        if (!aRaw) continue;

        if (skipExactTokens?.has(aRaw)) continue;
        if (aRaw.trimEnd() !== aRaw) continue;

        const last = lastCp(aRaw);
        if (last !== "Љ" && last !== "Њ" && last !== "Џ") continue;

        const j = findNextNodeWithText(textNodes, i + 1);
        if (j == null) continue;

        const bNode = textNodes[j];
        if (!bNode) continue;
        const bRaw = ((bNode.textContent ?? "")).normalize("NFC");
        if (!bRaw) continue;

        if (bRaw.trimStart() !== bRaw) continue;

        const bFirst = firstCp(bRaw);
        if (!bFirst) continue;

        if (!isUpperCyrillicLetter(bFirst)) continue;

        aNode.textContent = aRaw + CYR_ALLCAPS_HINT;
        hinted.add(aNode);
        count++;
    }

    return { hinted, count };
}