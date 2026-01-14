import { ALWAYS_LATIN_TOKENS } from "../../../../core/rules";
import {
    findNextNodeWithText,
    trailingTokenFragment,
    isTokenChar,
    normKey,
} from "../../common";

type TokenLowerCps = { s: string; cps: string[]; len: number };

const TOKENS_CACHE_MAX = 120;
const tokensCache = new Map<string, TokenLowerCps[]>();

function tokensCacheKey(tokensSource: Set<string> | string[], caseSensitive: boolean): string {
    const arr = Array.isArray(tokensSource) ? tokensSource : Array.from(tokensSource);

    const norm = arr
        .map((s) => (s ?? "").normalize("NFC"))
        .filter((s) => s.length > 0)
        .map((s) => (caseSensitive ? s : normKey(s)));

    const uniqSorted = Array.from(new Set(norm)).sort();
    return (caseSensitive ? "CS:" : "CI:") + uniqSorted.join("\n");
}

function getCachedTokenList(tokensSource: Set<string> | string[], caseSensitive: boolean): TokenLowerCps[] {
    const key = tokensCacheKey(tokensSource, caseSensitive);
    const hit = tokensCache.get(key);
    if (hit) return hit;

    const tokens: TokenLowerCps[] = (
        Array.isArray(tokensSource) ? tokensSource : Array.from(tokensSource)
    )
        .map((s) => s.normalize("NFC"))
        .filter((s) => s.length > 0)
        .map((token) => {
            const normalized = caseSensitive ? token : normKey(token);
            const cps = Array.from(normalized);
            return { s: normalized, cps, len: cps.length };
        })
        .sort((a, b) => b.len - a.len);

    tokensCache.set(key, tokens);

    if (tokensCache.size > TOKENS_CACHE_MAX) {
        const firstKey = tokensCache.keys().next().value as string | undefined;
        if (firstKey) tokensCache.delete(firstKey);
    }

    return tokens;
}

/**
 * Generički bridging funkcija za tokene (case-sensitive ili insensitive).
 */
function bridgeTokensAcrossTextNodes(
    textNodes: Element[],
    tokensSource: Set<string> | string[],
    caseSensitive = false
): number {
    const tokens = getCachedTokenList(tokensSource, caseSensitive);

    if (tokens.length === 0) return 0;

    let changed = 0;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;
        const aRaw = ((aNode.textContent ?? "")).normalize("NFC");
        if (!aRaw || aRaw.trimEnd() !== aRaw) continue;

        const fragInfo = trailingTokenFragment(aRaw);
        if (!fragInfo) continue;

        const { frag, startCpIndex } = fragInfo;

        const aCps = Array.from(aRaw);
        const prevChar = startCpIndex > 0 ? (aCps[startCpIndex - 1] ?? "") : "";
        if (prevChar && isTokenChar(prevChar)) continue;

        const fragKey = caseSensitive ? frag : normKey(frag);
        if (!fragKey) continue;

        const fragCps = Array.from(fragKey);
        const candidates = tokens.filter(
            (t) => t.len > fragCps.length && t.cps.slice(0, fragCps.length).join("") === fragKey
        );

        if (candidates.length === 0) continue;

        const j0 = findNextNodeWithText(textNodes, i + 1);
        if (j0 == null) continue;

        for (const cand of candidates) {
            const rem = cand.cps.slice(fragCps.length);

            let remainingIdx = 0;
            const consumePlan: Array<{ nodeIndex: number; takeCount: number }> = [];

            let j: number | null = j0;

            while (remainingIdx < rem.length) {
                if (j == null) break;

                const bNode = textNodes[j];
                if (!bNode) break;
                const bRaw = ((bNode.textContent ?? "")).normalize("NFC");
                if (!bRaw) {
                    j = findNextNodeWithText(textNodes, j + 1);
                    continue;
                }

                if (bRaw.trimStart() !== bRaw) {
                    remainingIdx = -1;
                    break;
                }

                const bCps = Array.from(bRaw);

                let take = 0;
                while (take < bCps.length && remainingIdx < rem.length) {
                    const ch = bCps[take];
                    if (!ch) break;
                    if (!isTokenChar(ch)) break;

                    const chKey = caseSensitive ? ch : normKey(ch);
                    if (chKey !== rem[remainingIdx]) break;

                    take++;
                    remainingIdx++;
                }

                if (take === 0) {
                    remainingIdx = -1;
                    break;
                }

                consumePlan.push({ nodeIndex: j, takeCount: take });

                if (remainingIdx >= rem.length) {
                    const nextChar = bCps[take] ?? "";
                    if (nextChar && isTokenChar(nextChar)) {
                        remainingIdx = -1;
                    }
                    break;
                }

                j = findNextNodeWithText(textNodes, j + 1);
            }

            if (remainingIdx !== rem.length) continue;

            let moved = "";
            for (const step of consumePlan) {
                const bNode = textNodes[step.nodeIndex];
                if (!bNode) continue;
                const bRaw = ((bNode.textContent ?? "")).normalize("NFC");
                const bCps = Array.from(bRaw);
                moved += bCps.slice(0, step.takeCount).join("");
            }

            aNode.textContent = aRaw + moved;

            for (const step of consumePlan) {
                const bNode = textNodes[step.nodeIndex];
                if (!bNode) continue;
                const bRaw = ((bNode.textContent ?? "")).normalize("NFC");
                const bCps = Array.from(bRaw);
                bNode.textContent = bCps.slice(step.takeCount).join("");
            }

            changed++;
            break;
        }
    }

    return changed;
}

/**
 * Bridge ALWAYS_LATIN tokens (case-insensitive).
 */
export function bridgeAlwaysLatinTokensAcrossTextNodes(textNodes: Element[]): number {
    return bridgeTokensAcrossTextNodes(textNodes, ALWAYS_LATIN_TOKENS, false);
}

/**
 * Bridge exact user-provided tokens (case-sensitive).
 */
export function bridgeExactTokensAcrossTextNodes(textNodes: Element[], tokens: string[]): number {
    return bridgeTokensAcrossTextNodes(textNodes, tokens, true);
}