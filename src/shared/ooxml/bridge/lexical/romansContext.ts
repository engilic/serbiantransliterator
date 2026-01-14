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

function matchTrailingRomanToken(text: string): string | null {
  const raw = text.normalize("NFC");
  if (raw.trimEnd() !== raw) return null;

  const m = /(^|[^\p{L}\p{N}])([IVXLCDM]{1,8})$/u.exec(raw);
  if (!m) return null;

  const roman = m[2] ?? "";
  if (!ROMAN_RE.test(roman) || roman !== roman.toUpperCase()) return null;
  return roman;
}

function matchLeadingWsAndWord(text: string): { moved: string; word: string } | null {
  const raw = text.normalize("NFC");
  const m = /^(\s*)(\p{L}+)(?=$|[^\p{L}\p{N}])/u.exec(raw);
  if (!m) return null;

  const moved = (m[1] ?? "") + (m[2] ?? "");
  const word = m[2] ?? "";
  return { moved, word };
}

function startsWithAnyPrefix(word: string): boolean {
  const w = normKey(word);
  return CATEGORY_PREFIX.some((p) => w.startsWith(p));
}

/**
 * Spaja rimski broj + sledeću “kontekst” reč (npr. "V" + " vek")
 * u isti <w:t>, da bi core zaštita rimskih brojeva radila i kad su run-ovi splitovani.
 */
export function bridgeRomanContextAcrossTextNodes(textNodes: Element[]): number {
  let changed = 0;

  for (let i = 0; i < textNodes.length - 1; i++) {
    const aNode = textNodes[i];
    if (!aNode) continue;

    const aRaw = (aNode.textContent ?? "").normalize("NFC");
    if (!aRaw) continue;

    const j = findNextNodeWithText(textNodes, i + 1);
    if (j == null) continue;

    const bNode = textNodes[j];
    if (!bNode) continue;

    const bRaw = (bNode.textContent ?? "").normalize("NFC");
    if (!bRaw) continue;

    // Nemoj preko paragraf granice
    if (!sameParagraph(aNode, bNode)) continue;

    // a završava rimskim brojem?
    const roman = matchTrailingRomanToken(aRaw);
    if (!roman) continue;

    // b počinje whitespace + reč (kontekst)?
    const lead = matchLeadingWsAndWord(bRaw);
    if (!lead) continue;

    if (!startsWithAnyPrefix(lead.word)) continue;

    // prebaci " vek" u aNode
    aNode.textContent = aRaw + lead.moved;
    bNode.textContent = bRaw.slice(lead.moved.length);
    changed++;
  }

  return changed;
}