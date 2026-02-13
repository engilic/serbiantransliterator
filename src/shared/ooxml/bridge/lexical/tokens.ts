// src/shared/ooxml/bridge/lexical/tokens.ts

import { ALWAYS_LATIN_TOKENS_STRICT } from "../../../../core/rules";
import { findNextNodeWithText, areNodesAdjacent, isBoundaryChar, isAlphaNum } from "../../common";
import { cyrillicToLatin } from "../../../../core/serbian";

function findTokenSplits(
    aRaw: string,
    tokens: string[] | Set<string>
): Array<{ token: string; prefixLen: number; tokenNorm: string }> {
    const aNorm = cyrillicToLatin(aRaw.normalize("NFC")).toLowerCase();
    const out: Array<{ token: string; prefixLen: number; tokenNorm: string }> = [];

    for (const t of tokens) {
        const tNorm = cyrillicToLatin(t.normalize("NFC")).toLowerCase();

        // (opciono, ali preporučeno) uzmi samo NAJDUŽI prefiks koji se poklapa za ovaj token
        // da ne puniš out sa len=1,len=2,len=3...
        let bestLenForThisToken: number | null = null;

        for (let len = Math.min(tNorm.length - 1, aNorm.length); len >= 1; len--) {
            const prefix = tNorm.slice(0, len);
            if (!aNorm.endsWith(prefix)) continue;

            // granica pre reči (da 'i' u "Kupio sam i" bude reč, a ne kraj "taxii")
            const charBefore = aNorm.length > len ? aNorm[aNorm.length - len - 1] : undefined;
            if (charBefore != null && !isBoundaryChar(charBefore)) continue;

            bestLenForThisToken = len;
            break;
        }

        if (bestLenForThisToken != null) {
            out.push({ token: t, prefixLen: bestLenForThisToken, tokenNorm: tNorm });
        }
    }

    // prvo probaj “najspecifičnije”: veći prefixLen, pa duži token
    out.sort((a, b) => b.prefixLen - a.prefixLen || b.tokenNorm.length - a.tokenNorm.length);
    return out;
}

function bridgeGenericTokens(textNodes: Element[], tokenList: string[] | Set<string>): number {
    let totalChanged = 0;
    const tokens = Array.from(tokenList);

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;

        const aRaw = aNode.textContent ?? "";
        if (!aRaw) continue;

        // Umesto "najdužeg tokena", uzmi sve kandidate i probaj redom da ih kompletiraš
        const candidates = findTokenSplits(aRaw, tokens);
        if (!candidates.length) continue;

        let bridgedHere = false;

        for (const cand of candidates) {
            const neededNorm = cand.tokenNorm.slice(cand.prefixLen);
            if (!neededNorm) continue;

            let currentJ = i;
            let collectedFromNodes = "";
            const nodesToUpdate: Array<{ node: Element; take: number; original: string[] }> = [];
            let tempNeededNorm = neededNorm;

            while (tempNeededNorm.length > 0) {
                const nextJ = findNextNodeWithText(textNodes, currentJ + 1);
                if (nextJ == null) break;

                const currNode = textNodes[nextJ];
                // Koristimo novu areNodesAdjacent koja vidi kroz SDT/Paragrafe
                if (!currNode || !areNodesAdjacent(aNode, currNode)) break;

                const raw = currNode.textContent ?? "";
                const cps = Array.from(raw);
                const rawNorm = cyrillicToLatin(raw.normalize("NFC")).toLowerCase();

                if (rawNorm.startsWith(tempNeededNorm)) {
                    nodesToUpdate.push({ node: currNode, take: tempNeededNorm.length, original: cps });
                    collectedFromNodes += cps.slice(0, tempNeededNorm.length).join("");
                    tempNeededNorm = "";
                } else if (tempNeededNorm.startsWith(rawNorm)) {
                    nodesToUpdate.push({ node: currNode, take: cps.length, original: cps });
                    collectedFromNodes += raw;
                    tempNeededNorm = tempNeededNorm.slice(rawNorm.length);
                    currentJ = nextJ;
                } else {
                    break;
                }
            }

            if (tempNeededNorm.length !== 0) {
                // ovaj kandidat nije mogao da se kompletira -> probaj sledeći
                continue;
            }

            // [FIX ZA Node.jsX] Proveri da li se reč nastavlja slovom ili brojem
            const lastUpdate = nodesToUpdate[nodesToUpdate.length - 1];
            if (!lastUpdate) continue;

            const nextChar =
                lastUpdate.original.length > lastUpdate.take
                    ? lastUpdate.original[lastUpdate.take]
                    : undefined;

            // Ako je sledeći karakter slovo ili broj, to NIJE naš brend (npr. Node.jsX), ne spajaj!
            if (nextChar != null && isAlphaNum(nextChar)) {
                continue; // probaj sledećeg kandidata
            }

            // SUCCESS: primeni spajanje
            aNode.textContent = aRaw + collectedFromNodes;
            for (const step of nodesToUpdate) {
                step.node.textContent = step.original.slice(step.take).join("");
            }
            totalChanged++;
            i--; // Ponovi za isti čvor

            bridgedHere = true;
            break;
        }

        if (bridgedHere) continue;
    }

    return totalChanged;
}

export function bridgeAlwaysLatinTokensAcrossTextNodes(textNodes: Element[]): number {
    return bridgeGenericTokens(textNodes, ALWAYS_LATIN_TOKENS_STRICT);
}

export function bridgeExactTokensAcrossTextNodes(textNodes: Element[], tokens: string[]): number {
    return bridgeGenericTokens(textNodes, tokens);
}
