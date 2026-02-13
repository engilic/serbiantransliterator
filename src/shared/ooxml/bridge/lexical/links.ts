// src/shared/ooxml/bridge/lexical/links.ts

import { findNextNodeWithText, lastCp, firstCp, areNodesAdjacent } from "../../common";

const LINK_CONNECTORS = new Set([":", "/", ".", "@", "?", "=", "&", "#", "%", "-", "_", "(", ")"]);
const PROTO_RE = /\b(https?|mailto|tel|sms|sip|geo|file|ftp):[^\s]*$|[a-z0-9._%+-]+@[a-z0-9.-]*$/i;
const STOPPERS = new Set([",", "!", ";", "?", "]", "}", " "]);

export function bridgeLinksAcrossTextNodes(textNodes: Element[]): number {
    let changed = 0;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;
        const aRaw = aNode.textContent ?? "";
        if (!aRaw || /\s$/.test(aRaw)) continue;

        const j = findNextNodeWithText(textNodes, i + 1);
        if (j == null) continue;
        const bNode = textNodes[j];
        if (!bNode || !areNodesAdjacent(aNode, bNode)) continue;

        const bRaw = bNode.textContent ?? "";
        if (!bRaw || /^\s/.test(bRaw)) continue;

        const bFirst = firstCp(bRaw);
        if (bFirst == null) continue;

        // [FIX ZA TEST] Zaustavi ako bNode počinje sa interpunkcijom koja prati link
        const nextCharInB = bRaw.length > 1 ? bRaw[1] : undefined;
        if (bFirst === ")" && (nextCharInB === "," || nextCharInB === " " || bRaw.length === 1)) {
            continue;
        }
        if (STOPPERS.has(bFirst)) continue;

        const isInsideLink = PROTO_RE.test(aRaw);
        const aLast = lastCp(aRaw);
        const isConnector = (aLast != null && LINK_CONNECTORS.has(aLast)) || LINK_CONNECTORS.has(bFirst);

        if (isInsideLink || isConnector) {
            const bCps = Array.from(bRaw);
            let takeCount = 0;

            while (takeCount < bCps.length) {
                const char = bCps[takeCount];
                if (char == null || /\s/.test(char)) break;
                if (STOPPERS.has(char) && !LINK_CONNECTORS.has(char)) break;

                // Wikipedia balansiranje
                if (char === ")" && (bCps[takeCount + 1] === "," || bCps[takeCount + 1] === " ")) break;
                if (char === ")" && !combinedContainsOpen(aRaw, bCps, takeCount)) break;

                takeCount++;
            }

            if (takeCount > 0) {
                aNode.textContent = aRaw + bCps.slice(0, takeCount).join("");
                bNode.textContent = bCps.slice(takeCount).join("");
                changed++;
                i--;
            }
        }
    }
    return changed;
}

function combinedContainsOpen(aRaw: string, bCps: string[], currentIdx: number): boolean {
    if (aRaw.includes("(")) return true;
    for (let i = 0; i < currentIdx; i++) {
        if (bCps[i] === "(") return true;
    }
    return false;
}
