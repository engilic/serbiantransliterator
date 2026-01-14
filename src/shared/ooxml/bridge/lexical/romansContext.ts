import { findNextNodeWithText } from "../../common";

const ROMAN_RE = /^[IVXLCDM]{1,8}$/;

const CATEGORY_PREFIX = [
    "razred", "kategorij", "grupa", "zona", "korpus", "armija", "deo", "tom", "knjiga",
    "stav", "član", "svetski", "sprat", "vek", "rat",
];

function normKey(s: string): string {
    return (s ?? "").normalize("NFC").toLowerCase();
}

function findAncestor(el: Element, localName: string): Element | null {
    let cur: Element | null = el;
    while (cur) {
        if (cur.localName === localName) return cur;
        cur = cur.parentElement;
    }
    return null;
}

function sameParagraph(a: Element, b: Element): boolean {
    const ap = findAncestor(a, "p");
    const bp = findAncestor(b, "p");
    return !!ap && ap === bp;
}

/**
 * Trailing roman na kraju node-a, ali DOZVOLI trailing whitespace posle rimskog broja:
 * npr. "V" ili "V " ili "(V)  "
 */
function matchTrailingRomanTokenAllowSpaces(text: string): { roman: string; trailingSpaces: string } | null {
    const raw = text.normalize("NFC");

    // boundary + roman + spaces to end
    const m = /(^|[^\p{L}\p{N}])([IVXLCDM]{1,8})(\s*)$/u.exec(raw);
    if (!m) return null;

    const roman = m[2] ?? "";
    const trailingSpaces = m[3] ?? "";

    if (!ROMAN_RE.test(roman) || roman !== roman.toUpperCase()) return null;
    return { roman, trailingSpaces };
}

function startsWithAnyPrefix(word: string): boolean {
    const w = normKey(word);
    return CATEGORY_PREFIX.some((p) => w.startsWith(p));
}

type PlanStep = { nodeIndex: number; cps: string[] };

/**
 * Build lookahead across multiple next nodes (including whitespace-only nodes),
 * within same paragraph. We only need a small prefix.
 */
function buildLookaheadPlan(textNodes: Element[], startIndex: number, maxCp: number) {
    const plan: PlanStep[] = [];
    let out = "";
    let remaining = maxCp;

    let j: number | null = startIndex;
    while (remaining > 0 && j != null && j < textNodes.length) {
        const node = textNodes[j];
        if (!node) break;

        const raw = (node.textContent ?? "").normalize("NFC");
        if (raw === "") {
            j = findNextNodeWithText(textNodes, j + 1);
            continue;
        }

        const cps = Array.from(raw);
        const take = Math.min(remaining, cps.length);

        plan.push({ nodeIndex: j, cps });
        out += cps.slice(0, take).join("");
        remaining -= take;

        j = findNextNodeWithText(textNodes, j + 1);
    }

    return { out, plan };
}

function consumeFromPlan(textNodes: Element[], plan: PlanStep[], needCp: number): string {
    let remaining = needCp;
    let moved = "";

    for (const step of plan) {
        if (remaining <= 0) break;

        const take = Math.min(remaining, step.cps.length);
        moved += step.cps.slice(0, take).join("");

        const node = textNodes[step.nodeIndex];
        if (node) node.textContent = step.cps.slice(take).join("");

        remaining -= take;
    }

    return moved;
}

/**
 * Spaja rimski broj + sledeću “kontekst” reč (npr. "V" + " vek")
 * i radi i kad je whitespace splitovan u zaseban <w:t>:
 * - "V " | "vek"
 * - "V" | " " | "vek"
 */
export function bridgeRomanContextAcrossTextNodes(textNodes: Element[]): number {
    let changed = 0;
    const MAX_LOOKAHEAD_CP = 40;

    for (let i = 0; i < textNodes.length - 1; i++) {
        const aNode = textNodes[i];
        if (!aNode) continue;

        const aRaw = (aNode.textContent ?? "").normalize("NFC");
        if (!aRaw) continue;

        // nađi sledeći node sa bilo kakvim tekstom
        const j0 = findNextNodeWithText(textNodes, i + 1);
        if (j0 == null) continue;

        const bNode0 = textNodes[j0];
        if (!bNode0) continue;

        // nemoj preko paragraf granice
        if (!sameParagraph(aNode, bNode0)) continue;

        // a završava rimskim brojem (dozvoli trailing spaces)
        const tRoman = matchTrailingRomanTokenAllowSpaces(aRaw);
        if (!tRoman) continue;

        // lookahead across multiple nodes (da uhvati i whitespace-only node-ove)
        const { out: lookahead, plan } = buildLookaheadPlan(textNodes, j0, MAX_LOOKAHEAD_CP);
        if (!lookahead) continue;

        // očekujemo: optional spaces + letters word + boundary
        const m = /^(\s*)(\p{L}+)(?=$|[^\p{L}\p{N}])/u.exec(lookahead);
        if (!m) continue;

        const word = m[2] ?? "";
        if (!word) continue;
        if (!startsWithAnyPrefix(word)) continue;

        const movedStr = (m[1] ?? "") + word;
        const needCp = Array.from(movedStr).length;
        if (needCp <= 0) continue;

        const moved = consumeFromPlan(textNodes, plan, needCp);
        if (moved.length === 0) continue;

        aNode.textContent = aRaw + moved;
        changed++;
    }

    return changed;
}