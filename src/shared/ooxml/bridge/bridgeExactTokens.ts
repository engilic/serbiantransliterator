import {
    findNextNodeWithText,
    trailingTokenFragment,
    isTokenChar,
} from "../common";

type ExactTokenInfo = { token: string; cps: string[]; len: number };

export function bridgeExactTokensAcrossTextNodes(textNodes: Element[], tokens: string[]): number {
    const infos: ExactTokenInfo[] = tokens
        .map((t) => t.normalize("NFC"))
        .filter((t) => t.length > 0 && !/\s/.test(t))
        .map((token) => ({ token, cps: Array.from(token), len: Array.from(token).length }))
        .sort((a, b) => b.len - a.len);

    if (infos.length === 0) return 0;

    let changed = 0;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i]!;
        const aRaw = ((aNode.textContent ?? "")).normalize("NFC");
        if (!aRaw) continue;

        if (aRaw.trimEnd() !== aRaw) continue;

        const fragInfo = trailingTokenFragment(aRaw);
        if (!fragInfo) continue;

        const { frag, startCpIndex } = fragInfo;

        const aCps = Array.from(aRaw);
        const prevChar = startCpIndex > 0 ? aCps[startCpIndex - 1]! : "";
        if (prevChar && isTokenChar(prevChar)) continue;

        const fragCps = Array.from(frag);
        const candidates = infos.filter(
            (t) => t.len > fragCps.length && t.cps.slice(0, fragCps.length).join("") === frag
        );
        if (candidates.length === 0) continue;

        const j0 = findNextNodeWithText(textNodes, i + 1);
        if (j0 == null) continue;

        for (const cand of candidates) {
            const rem = cand.cps.slice(fragCps.length);
            let remIdx = 0;

            const plan: Array<{ nodeIndex: number; takeCp: number }> = [];

            let j: number | null = j0;
            while (remIdx < rem.length) {
                if (j == null) break;

                const bNode = textNodes[j]!;
                const bRaw = ((bNode.textContent ?? "")).normalize("NFC");
                if (!bRaw) {
                    j = findNextNodeWithText(textNodes, j + 1);
                    continue;
                }

                if (bRaw.trimStart() !== bRaw) {
                    remIdx = -1;
                    break;
                }

                const bCps = Array.from(bRaw);
                let take = 0;

                while (take < bCps.length && remIdx < rem.length) {
                    const ch = bCps[take]!;
                    if (!isTokenChar(ch)) break;
                    if (ch !== rem[remIdx]) break;
                    take++;
                    remIdx++;
                }

                if (take === 0) {
                    remIdx = -1;
                    break;
                }

                plan.push({ nodeIndex: j, takeCp: take });

                if (remIdx >= rem.length) {
                    const nextChar = bCps[take] ?? "";
                    if (nextChar && isTokenChar(nextChar)) remIdx = -1;
                    break;
                }

                j = findNextNodeWithText(textNodes, j + 1);
            }

            if (remIdx !== rem.length) continue;

            let moved = "";
            for (const step of plan) {
                const bNode = textNodes[step.nodeIndex]!;
                const bRaw = ((bNode.textContent ?? "")).normalize("NFC");
                const bCps = Array.from(bRaw);
                moved += bCps.slice(0, step.takeCp).join("");
            }

            aNode.textContent = aRaw + moved;

            for (const step of plan) {
                const bNode = textNodes[step.nodeIndex]!;
                const bRaw = ((bNode.textContent ?? "")).normalize("NFC");
                const bCps = Array.from(bRaw);
                bNode.textContent = bCps.slice(step.takeCp).join("");
            }

            changed++;
            break;
        }
    }

    return changed;
}