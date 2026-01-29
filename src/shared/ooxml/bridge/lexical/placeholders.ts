// src/shared/ooxml/bridge/lexical/placeholders.ts
import { findNextNodeWithText, getCpArray } from "../../common";

type CurlyMode = "placeholders" | "all";

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

        const cps = getCpArray(raw);
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
        if (node) node.textContent = step.cps.slice(take).join("");

        remaining -= take;
    }

    return moved;
}

const PLACEHOLDER_RE = /^\{[A-Za-z][A-Za-z0-9_:-]{0,120}\}$/;

/**
 * Braced placeholders bridging:
 * - mode="placeholders": bridguje samo placeholder-like "{USER_NAME}" / "{Order-Id}" itd.
 * - mode="all": legacy; bridguje bilo šta od "{" do prve "}" (do MAX_LOOKAHEAD_CP)
 *
 * Napomena:
 * Ovo postoji jer protect sloj radi u plain-text-u, ali Word OOXML često splituje "{USER" + "_NAME}" kroz <w:t>.
 */
export function bridgeBracedPlaceholdersAcrossTextNodes(
    textNodes: Element[],
    mode: CurlyMode = "placeholders"
): number {
    const MAX_LOOKAHEAD_CP = 250;
    let changed = 0;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;

        const aRaw = (aNode.textContent ?? "").normalize("NFC");
        if (!aRaw) continue;

        const openIdx = aRaw.lastIndexOf("{");
        if (openIdx < 0) continue;

        const closeIdx = aRaw.lastIndexOf("}");
        if (closeIdx > openIdx) continue; // već zatvoreno u istom node-u

        const j0 = findNextNodeWithText(textNodes, i + 1);
        if (j0 == null) continue;

        const { out: lookahead, plan } = buildLookahead(textNodes, j0, MAX_LOOKAHEAD_CP);
        if (!lookahead) continue;

        const frag = aRaw.slice(openIdx);
        const combined = frag + lookahead;

        const endIdx = combined.indexOf("}");
        if (endIdx < 0) continue;

        const candidate = combined.slice(0, endIdx + 1);

        if (mode === "placeholders") {
            // Strict: samo placeholder-like (bez whitespace, kontrolisana dužina i allowed chars)
            if (!PLACEHOLDER_RE.test(candidate)) continue;
        }

        const neededLen = candidate.length - frag.length;
        if (neededLen <= 0) continue;

        const moved = consumeFromPlan(textNodes, plan, neededLen);
        if (moved.length !== neededLen) continue;

        aNode.textContent = aRaw + moved;
        changed++;
    }

    return changed;
}
