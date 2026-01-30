// src/shared/ooxml/bridge/lexical/ambiguousSuffix.ts

import { findNextNodeWithText, trailingTokenFragment, isTokenChar, normKey, getCpArray } from "../../common";

import { ALWAYS_LATIN_TOKENS_STRICT, ALWAYS_LATIN_TOKENS_AMBIGUOUS } from "../../../../core/rules";

function isPureNumberToken(s: string): boolean {
    return /^\d+$/u.test(s);
}

function isAlphaNumModelToken(s: string): boolean {
    return /\d/.test(s) && /\p{L}/u.test(s);
}

type PrefixTake = { moved: string; remaining: string; tokens: string[] };

function takeLeadingWsAndTokenSequence(raw: string, maxTokens: number): PrefixTake | null {
    const cps = getCpArray(raw);

    let i = 0;
    while (i < cps.length && /\s/u.test(cps[i] ?? "")) i++;
    if (i === 0) return null;

    const tokens: string[] = [];
    let cur = i;
    let movedEnd = 0;

    for (let t = 0; t < maxTokens; t++) {
        const startTok = cur;
        while (cur < cps.length && isTokenChar(cps[cur] ?? "")) cur++;
        if (cur === startTok) break;

        const tok = cps.slice(startTok, cur).join("");

        const afterTok = cps[cur] ?? "";
        if (afterTok && isTokenChar(afterTok)) return null;

        tokens.push(tok);
        movedEnd = cur;

        const wsStart = cur;
        while (cur < cps.length && /\s/u.test(cps[cur] ?? "")) cur++;
        if (cur === wsStart) break;
    }

    if (tokens.length === 0) return null;

    const moved = cps.slice(0, movedEnd).join("");
    const remaining = cps.slice(movedEnd).join("");
    return { moved, remaining, tokens };
}

export function bridgeAmbiguousBrandSuffixAcrossTextNodes(textNodes: Element[]): number {
    let changed = 0;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;

        const aRaw = (aNode.textContent ?? "").normalize("NFC");
        if (!aRaw) continue;
        if (aRaw.trimEnd() !== aRaw) continue;

        const fragInfo = trailingTokenFragment(aRaw);
        if (!fragInfo) continue;

        const { frag } = fragInfo;
        const fragLower = normKey(frag);

        if (!ALWAYS_LATIN_TOKENS_STRICT.has(fragLower)) continue;

        let j = findNextNodeWithText(textNodes, i + 1);
        if (j == null) continue;

        let movedTotal = "";
        let sawModel = false;
        let sawAmbiguous = false;

        while (j != null) {
            const bNode = textNodes[j];
            if (!bNode) break;

            const bRaw = (bNode.textContent ?? "").normalize("NFC");
            if (!bRaw) {
                j = findNextNodeWithText(textNodes, j + 1);
                continue;
            }

            const take = takeLeadingWsAndTokenSequence(bRaw, 3);
            if (!take) break;

            const t1 = take.tokens[0] ?? "";
            const t1Lower = normKey(t1);

            // Case 1: odmah ambiguous (" Pro", " Max", ...)
            if (ALWAYS_LATIN_TOKENS_AMBIGUOUS.has(t1Lower)) {
                movedTotal += take.moved;
                bNode.textContent = take.remaining;
                sawAmbiguous = true;
                changed++;
                j = findNextNodeWithText(textNodes, j + 1);
                continue;
            }

            // Case 2: model token ("14" ili "S23") – uzmi ga samo jednom, pre ambiguous-a
            const t1IsModel = isPureNumberToken(t1) || isAlphaNumModelToken(t1);
            if (t1IsModel && !sawModel && !sawAmbiguous) {
                movedTotal += take.moved;
                bNode.textContent = take.remaining;
                sawModel = true;
                changed++;
                j = findNextNodeWithText(textNodes, j + 1);
                continue;
            }

            break;
        }

        if (!sawAmbiguous || !movedTotal) continue;

        aNode.textContent = aRaw + movedTotal;
    }

    return changed;
}
