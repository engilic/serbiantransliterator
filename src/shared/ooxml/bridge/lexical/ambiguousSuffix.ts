// src/shared/ooxml/bridge/lexical/ambiguousSuffix.ts

import {
    findNextNodeWithText,
    trailingTokenFragment,
    isTokenChar,
    normKey,
    getCpArray,
} from "../../common";

import {
    ALWAYS_LATIN_TOKENS_STRICT,
    ALWAYS_LATIN_TOKENS_AMBIGUOUS,
} from "../../../../core/rules";

/**
 * U Word OOXML-u često: <w:t>iPhone</w:t> + <w:t> Pro</w:t>
 * Pošto convertOoxml preslovljava po node-u, "Pro" bi izgubio kontekst.
 *
 * Ovaj bridge spaja " <AMBIG>" iz sledećeg node-a uz STRICT brend token u prethodnom node-u,
 * da bi core (textCore) mogao kontekstualno da zaštiti "Pro/Air/..." uz brend.
 */
function takeLeadingSpaceAndAmbiguousToken(bRaw: string): { moved: string; remaining: string } | null {
    const cps = getCpArray(bRaw);

    // uzmi bar jedan whitespace na početku (normalno razdvajanje reči)
    let i = 0;
    while (i < cps.length && /\s/u.test(cps[i] ?? "")) i++;
    if (i === 0) return null;

    // sada uzmi token-charove kao “reč” (Pro/Air/...)
    let j = i;
    while (j < cps.length && isTokenChar(cps[j] ?? "")) j++;
    if (j === i) return null;

    const token = cps.slice(i, j).join("");
    const tokenLower = normKey(token);

    if (!ALWAYS_LATIN_TOKENS_AMBIGUOUS.has(tokenLower)) return null;

    // boundary posle tokena: sledeći char ne sme biti token-char
    const nextChar = cps[j] ?? "";
    if (nextChar && isTokenChar(nextChar)) return null;

    const moved = cps.slice(0, j).join("");      // whitespace + token
    const remaining = cps.slice(j).join("");     // ostatak teksta u bNode-u

    return { moved, remaining };
}

export function bridgeAmbiguousBrandSuffixAcrossTextNodes(textNodes: Element[]): number {
    let changed = 0;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;

        const aRaw = ((aNode.textContent ?? "")).normalize("NFC");
        if (!aRaw) continue;

        // treba da se završava na token (ne whitespace)
        if (aRaw.trimEnd() !== aRaw) continue;

        const fragInfo = trailingTokenFragment(aRaw);
        if (!fragInfo) continue;

        const { frag, startCpIndex } = fragInfo;

        // boundary guard: pre strict tokena ne sme biti token-char (da ne hvatamo "xWindows")
        const aCps = getCpArray(aRaw);
        const prevChar = startCpIndex > 0 ? (aCps[startCpIndex - 1] ?? "") : "";
        if (prevChar && isTokenChar(prevChar)) continue;

        // strict brend na kraju node-a
        const fragLower = normKey(frag);
        if (!ALWAYS_LATIN_TOKENS_STRICT.has(fragLower)) continue;

        const j = findNextNodeWithText(textNodes, i + 1);
        if (j == null) continue;

        const bNode = textNodes[j];
        if (!bNode) continue;

        const bRaw = ((bNode.textContent ?? "")).normalize("NFC");
        if (!bRaw) continue;

        const movedInfo = takeLeadingSpaceAndAmbiguousToken(bRaw);
        if (!movedInfo) continue;

        aNode.textContent = aRaw + movedInfo.moved;
        bNode.textContent = movedInfo.remaining;
        changed++;
    }

    return changed;
}