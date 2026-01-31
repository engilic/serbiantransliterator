// src/shared/ooxml/bridge/lexical/links.ts
import { findNextNodeWithText, trailingLinkFragment, isLinkChar, normKey, getCpArray } from "../../common";

import { LINK_PATTERNS_ANCHORED, trimLinkEnd, looksLikeLinkStart } from "../../../patterns/links";

function buildLookahead(textNodes: Element[], startIndex: number, maxCp: number) {
    const plan: Array<{ nodeIndex: number; takeCp: number; cps: string[] }> = [];
    let out = "";
    let remaining = maxCp;

    let j: number | null = startIndex;
    while (remaining > 0) {
        if (j == null) break;

        const node = textNodes[j];
        if (!node) break;
        const raw = (node.textContent ?? "").normalize("NFC");
        if (!raw) {
            j = findNextNodeWithText(textNodes, j + 1);
            continue;
        }

        // ako sledeći node počinje whitespace-om, ne bridguj link preko te granice
        if (raw.trimStart() !== raw) break;

        const cps = Array.from(raw);
        const take = Math.min(remaining, cps.length);

        plan.push({ nodeIndex: j, takeCp: take, cps });
        out += cps.slice(0, take).join("");
        remaining -= take;

        j = findNextNodeWithText(textNodes, j + 1);
    }

    return { out, plan };
}

function consumeFromPlan(
    textNodes: Element[],
    plan: Array<{ nodeIndex: number; takeCp: number; cps: string[] }>,
    needCp: number
) {
    let remaining = needCp;
    let moved = "";

    for (const step of plan) {
        if (remaining <= 0) break;

        const take = Math.min(remaining, step.takeCp);
        moved += step.cps.slice(0, take).join("");

        const node = textNodes[step.nodeIndex];
        if (!node) continue;
        node.textContent = step.cps.slice(take).join("");

        remaining -= take;
    }

    return moved;
}

const LINK_PREFIXES = [
    "https://",
    "http://",
    "ftp://",
    "file://",
    "www.",
    "mailto:",
    "tel:",
    "sip:",
    "sms:",
    "geo:",
    "skype:",
    "teams:",
    "msteams:",
];

function trailingLinkFragmentByPrefix(raw: string): { frag: string; startCpIndex: number } | null {
    const lower = normKey(raw);

    let bestCu = -1;

    for (const p of LINK_PREFIXES) {
        const idx = lower.lastIndexOf(p);
        if (idx < 0) continue;

        // uslov: od prefixa do kraja ne sme biti whitespace, inače je to "stari" link u sredini teksta
        if (/\s/u.test(raw.slice(idx))) continue;

        if (idx > bestCu) bestCu = idx;
    }

    if (bestCu < 0) return null;

    // code-unit index -> codepoint index (da bude kompatibilno sa startCpIndex logikom)
    const startCpIndex = getCpArray(raw.slice(0, bestCu)).length;
    const frag = getCpArray(raw).slice(startCpIndex).join("");

    return { frag, startCpIndex };
}

export function bridgeLinksAcrossTextNodes(textNodes: Element[]): number {
    const MAX_LOOKAHEAD_CP = 300;
    let changed = 0;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;
        const aRaw = (aNode.textContent ?? "").normalize("NFC");
        if (!aRaw) continue;

        // ako a završava whitespace-om, ne bridguj
        if (aRaw.trimEnd() !== aRaw) continue;

        // 1) pokušaj standardno (trailingLinkFragment)
        // 2) fallback: nađi poslednji "https://" / "mailto:" itd i uzmi do kraja (bez whitespace)
        let fragInfo = trailingLinkFragment(aRaw);
        if (!fragInfo) fragInfo = trailingLinkFragmentByPrefix(aRaw);
        if (!fragInfo) continue;

        let { frag, startCpIndex } = fragInfo;

        // boundary guard: pre fragmenta ne sme biti link-char
        const aCps = getCpArray(aRaw);
        const prevChar = startCpIndex > 0 ? aCps[startCpIndex - 1] ?? "" : "";
        if (prevChar && isLinkChar(prevChar)) continue;

        let fragLower = normKey(frag);
        if (!looksLikeLinkStart(fragLower)) {
            // fallback još jednom (u slučaju da trailingLinkFragment vrati nešto kratko zbog '(' u URL-u)
            const alt = trailingLinkFragmentByPrefix(aRaw);
            if (!alt) continue;
            frag = alt.frag;
            startCpIndex = alt.startCpIndex;
            fragLower = normKey(frag);
            if (!looksLikeLinkStart(fragLower)) continue;
        }

        const j0 = findNextNodeWithText(textNodes, i + 1);
        if (j0 == null) continue;

        const { out: lookahead, plan } = buildLookahead(textNodes, j0, MAX_LOOKAHEAD_CP);
        if (!lookahead) continue;

        const combined = frag + lookahead;

        let best = "";
        for (const re of LINK_PATTERNS_ANCHORED) {
            const m = re.exec(combined);
            if (!m) continue;

            // NOTE: u patterns modulu regex-i imaju jednu capturing grupu za “glavni match”
            const candidate = trimLinkEnd((m[1] ?? m[0] ?? "") as string);
            if (candidate.length > best.length) best = candidate;
        }

        if (!best) continue;
        if (best.length <= frag.length) continue;

        const need = best.length - frag.length;
        const moved = consumeFromPlan(textNodes, plan, need);
        if (moved.length !== need) continue;

        aNode.textContent = aRaw + moved;
        changed++;
    }

    return changed;
}
