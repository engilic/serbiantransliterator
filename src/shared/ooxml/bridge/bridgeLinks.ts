import {
    findNextNodeWithText,
    trailingLinkFragment,
    isLinkChar,
    normKey,
} from "../common";

const LINK_PATTERNS: RegExp[] = [
    /^(https?:\/\/[^\s<>"')]+)/iu,
    /^(ftp:\/\/[^\s<>"')]+)/iu,
    /^(file:\/\/[^\s<>"')]+)/iu,
    /^(www\.[^\s<>"')]+)/iu,
    /^([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/iu,
];

function trimLinkEnd(s: string): string {
    return s.replace(/[,.;:!?)\]\}]+$/g, "");
}

function buildLookahead(textNodes: Element[], startIndex: number, maxCp: number) {
    const plan: Array<{ nodeIndex: number; takeCp: number; cps: string[] }> = [];
    let out = "";
    let remaining = maxCp;

    let j: number | null = startIndex;
    while (remaining > 0) {
        if (j == null) break;

        const node = textNodes[j]!;
        const raw = ((node.textContent ?? "")).normalize("NFC");
        if (!raw) {
            j = findNextNodeWithText(textNodes, j + 1);
            continue;
        }

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

        const node = textNodes[step.nodeIndex]!;
        node.textContent = step.cps.slice(take).join("");

        remaining -= take;
    }

    return moved;
}

export function bridgeLinksAcrossTextNodes(textNodes: Element[]): number {
    const MAX_LOOKAHEAD_CP = 300;
    let changed = 0;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i]!;
        const aRaw = ((aNode.textContent ?? "")).normalize("NFC");
        if (!aRaw) continue;

        if (aRaw.trimEnd() !== aRaw) continue;

        const fragInfo = trailingLinkFragment(aRaw);
        if (!fragInfo) continue;

        const { frag, startCpIndex } = fragInfo;

        const aCps = Array.from(aRaw);
        const prevChar = startCpIndex > 0 ? aCps[startCpIndex - 1]! : "";
        if (prevChar && isLinkChar(prevChar)) continue;

        const fragLower = normKey(frag);
        const looksLikeStart =
            fragLower.startsWith("http") ||
            fragLower.startsWith("ftp") ||
            fragLower.startsWith("file") ||
            fragLower.startsWith("www.") ||
            fragLower.includes("@");

        if (!looksLikeStart) continue;

        const j0 = findNextNodeWithText(textNodes, i + 1);
        if (j0 == null) continue;

        const { out: lookahead, plan } = buildLookahead(textNodes, j0, MAX_LOOKAHEAD_CP);
        if (!lookahead) continue;

        const combined = frag + lookahead;

        let best = "";
        for (const re of LINK_PATTERNS) {
            const m = re.exec(combined);
            if (!m) continue;
            const candidate = trimLinkEnd(m[1] ?? m[0] ?? "");
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