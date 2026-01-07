// src/shared/ooxml/bridge/bridgeAlwaysLatinTokens.ts

import { ALWAYS_LATIN_TOKENS } from "../../../core/rules";
import {
  findNextNodeWithText,
  trailingTokenFragment,
  isTokenChar,
  normKey,
} from "../common";

type TokenLowerCps = { s: string; cps: string[]; len: number };

const ALWAYS_TOKENS_LIST: TokenLowerCps[] = Array.from(ALWAYS_LATIN_TOKENS)
  .map((s) => ({ s, cps: Array.from(s), len: Array.from(s).length }))
  .sort((a, b) => b.len - a.len);

export function bridgeAlwaysLatinTokensAcrossTextNodes(textNodes: Element[]): number {
  let changed = 0;

  for (let i = 0; i < textNodes.length - 1; i++) {
    const aNode = textNodes[i]!;
    let aRaw = ((aNode.textContent ?? "")).normalize("NFC");
    if (!aRaw) continue;

    if (aRaw.trimEnd() !== aRaw) continue;

    const fragInfo = trailingTokenFragment(aRaw);
    if (!fragInfo) continue;

    const { frag, startCpIndex } = fragInfo;

    const aCps = Array.from(aRaw);
    const prevChar = startCpIndex > 0 ? aCps[startCpIndex - 1]! : "";
    if (prevChar && isTokenChar(prevChar)) continue;

    const fragLower = normKey(frag);
    if (!fragLower) continue;

    if (ALWAYS_LATIN_TOKENS.has(fragLower)) continue;

    const j0 = findNextNodeWithText(textNodes, i + 1);
    if (j0 == null) continue;

    const fragLowerCps = Array.from(fragLower);
    const candidates = ALWAYS_TOKENS_LIST.filter(
      (t) =>
        t.cps.length > fragLowerCps.length &&
        t.cps.slice(0, fragLowerCps.length).join("") === fragLower
    );
    if (candidates.length === 0) continue;

    for (const cand of candidates) {
      const rem = cand.cps.slice(fragLowerCps.length);

      let remainingIdx = 0;
      const consumePlan: Array<{ nodeIndex: number; takeCount: number }> = [];

      let j: number | null = j0;

      while (remainingIdx < rem.length) {
        if (j == null) break;

        const bNode = textNodes[j]!;
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
          const ch = bCps[take]!;
          if (!isTokenChar(ch)) break;

          const chLower = normKey(ch);
          if (chLower !== rem[remainingIdx]) break;

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
        const bNode = textNodes[step.nodeIndex]!;
        const bRaw = ((bNode.textContent ?? "")).normalize("NFC");
        const bCps = Array.from(bRaw);
        moved += bCps.slice(0, step.takeCount).join("");
      }

      aNode.textContent = aRaw + moved;

      for (const step of consumePlan) {
        const bNode = textNodes[step.nodeIndex]!;
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