// src/shared/ooxml/bridge/bridgePhrases.ts

import {
  findNextNodeWithText,
  isBoundaryChar,
  normKey,
} from "../common";

export type PhraseInfo = { raw: string; lowerCps: string[]; len: number };

export function buildPhraseInfos(phrases: string[]): PhraseInfo[] {
  return phrases
    .map((p) => p.normalize("NFC").replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0)
    .map((raw) => {
      const lower = raw.toLowerCase();
      const lowerCps = Array.from(lower);
      return { raw, lowerCps, len: lowerCps.length };
    })
    .sort((a, b) => b.len - a.len);
}

function matchPhraseChar(expectedLower: string, actualChar: string): boolean {
  if (expectedLower === " ") return /\s/u.test(actualChar);
  return normKey(actualChar) === expectedLower;
}

function takePrefixAcrossNodes(
  textNodes: Element[],
  startIndex: number,
  countCp: number
): { plan: Array<{ nodeIndex: number; takeCp: number }>; taken: string } | null {
  let remaining = countCp;
  const plan: Array<{ nodeIndex: number; takeCp: number }> = [];
  let taken = "";

  let j: number | null = startIndex;

  while (remaining > 0) {
    if (j == null) return null;

    const node = textNodes[j]!;
    const raw = ((node.textContent ?? "")).normalize("NFC");
    if (!raw) {
      j = findNextNodeWithText(textNodes, j + 1);
      continue;
    }

    const cps = Array.from(raw);
    const take = Math.min(remaining, cps.length);

    taken += cps.slice(0, take).join("");
    plan.push({ nodeIndex: j, takeCp: take });
    remaining -= take;

    j = findNextNodeWithText(textNodes, j + 1);
  }

  return { plan, taken };
}

function peekCharAfterPlan(textNodes: Element[], plan: Array<{ nodeIndex: number; takeCp: number }>): string {
  if (plan.length === 0) return "";
  const last = plan[plan.length - 1]!;
  const node = textNodes[last.nodeIndex]!;
  const raw = ((node.textContent ?? "")).normalize("NFC");
  const cps = Array.from(raw);
  const idx = last.takeCp;

  if (idx < cps.length) return cps[idx]!;
  const j = findNextNodeWithText(textNodes, last.nodeIndex + 1);
  if (j == null) return "";
  const nextRaw = ((textNodes[j]!.textContent ?? "")).normalize("NFC");
  const nextCps = Array.from(nextRaw);
  return nextCps[0] ?? "";
}

function applyConsumePlan(textNodes: Element[], plan: Array<{ nodeIndex: number; takeCp: number }>) {
  for (const step of plan) {
    const node = textNodes[step.nodeIndex]!;
    const raw = ((node.textContent ?? "")).normalize("NFC");
    const cps = Array.from(raw);
    node.textContent = cps.slice(step.takeCp).join("");
  }
}

export function bridgePhrasesAcrossTextNodes(textNodes: Element[], phraseInfos: PhraseInfo[]): number {
  if (phraseInfos.length === 0) return 0;

  let changed = 0;

  for (let i = 0; i < textNodes.length - 1; i++) {
    const aNode = textNodes[i]!;
    const aRaw = ((aNode.textContent ?? "")).normalize("NFC");
    if (!aRaw) continue;

    const aCps = Array.from(aRaw);
    const aLowerCps = Array.from(aRaw.toLowerCase());

    for (const phrase of phraseInfos) {
      const p = phrase.lowerCps;
      const pLen = phrase.len;

      const maxX = Math.min(pLen - 1, aLowerCps.length);
      if (maxX <= 0) continue;

      for (let x = maxX; x >= 1; x--) {
        const startIdx = aLowerCps.length - x;

        const before = startIdx > 0 ? aCps[startIdx - 1]! : "";
        if (!isBoundaryChar(before)) continue;

        const suffixLower = aLowerCps.slice(startIdx).join("");
        const phrasePrefixLower = p.slice(0, x).join("");
        if (suffixLower !== phrasePrefixLower) continue;

        const remaining = p.slice(x);
        const remLen = remaining.length;
        if (remLen <= 0) continue;

        const j0 = findNextNodeWithText(textNodes, i + 1);
        if (j0 == null) continue;

        const takenInfo = takePrefixAcrossNodes(textNodes, j0, remLen);
        if (!takenInfo) continue;

        const takenCps = Array.from(takenInfo.taken.normalize("NFC"));
        if (takenCps.length !== remLen) continue;

        let ok = true;
        for (let k = 0; k < remLen; k++) {
          if (!matchPhraseChar(remaining[k]!, takenCps[k]!)) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;

        const after = peekCharAfterPlan(textNodes, takenInfo.plan);
        if (!isBoundaryChar(after)) continue;

        aNode.textContent = aRaw + takenInfo.taken;
        applyConsumePlan(textNodes, takenInfo.plan);
        changed++;

        x = 0;
        break;
      }

      if ((aNode.textContent ?? "") !== aRaw) break;
    }
  }

  return changed;
}