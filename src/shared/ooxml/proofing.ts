// src/shared/ooxml/proofing.ts
import { XML_NS, WORD_NS, needsXmlSpacePreserve } from "./dom";
import { type Direction } from "../../core/textCore";
import { extractLetterWordSpans, findAncestor, getDirectChild, ensureLangOnRPr } from "./converterUtils";

const RE_CYR = /[\u0400-\u052F]/u;
const RE_LAT = /[A-Za-zČčĆćĐđŠšŽž]/u;

function isSimpleRun(run: Element): boolean {
    for (const el of Array.from(run.children)) {
        if (el.localName !== "rPr" && el.localName !== "t") return false;
    }
    return true;
}

function getRunTextFromTChildren(run: Element): string {
    let out = "";
    for (const ch of Array.from(run.children)) {
        if (ch.localName === "t") out += ch.textContent ?? "";
    }
    return out;
}

function wasWordTransliterated(orig: string, fin: string, direction: Direction | "to-ascii"): boolean {
    if (orig === fin) return false;
    if (direction === "lat-to-cyr") return RE_LAT.test(orig) && RE_CYR.test(fin);
    if (direction === "cyr-to-lat" || direction === "to-ascii") return RE_CYR.test(orig) && RE_LAT.test(fin);
    if (direction === "auto")
        return (RE_LAT.test(orig) && RE_CYR.test(fin)) || (RE_CYR.test(orig) && RE_LAT.test(fin));
    return false;
}

export function targetLangForDirection(
    direction: Direction | "to-ascii"
): "sr-Cyrl-RS" | "sr-Latn-RS" | null {
    if (direction === "lat-to-cyr") return "sr-Cyrl-RS";
    if (direction === "cyr-to-lat" || direction === "to-ascii") return "sr-Latn-RS";
    return null;
}

export type ProofingApplyResult = {
    changedRuns: number;
    skippedRuns: number;
    skippedByReason: Record<string, number>;
};

export function applyProofingLanguagePreserveUnchanged(
    doc: Document,
    textNodes: Element[],
    originalRunText: Map<Element, string>,
    direction: Direction | "to-ascii"
): ProofingApplyResult {
    const target = targetLangForDirection(direction);
    if (!target) return { changedRuns: 0, skippedRuns: 0, skippedByReason: {} };

    const runs: Element[] = [];
    const seen = new WeakSet<Element>();
    for (const t of textNodes) {
        const run = findAncestor(t, "r");
        if (!run) continue;
        if (seen.has(run)) continue;
        seen.add(run);
        runs.push(run);
    }

    let changedRuns = 0;
    let skippedRuns = 0;
    const skippedByReason: Record<string, number> = {};

    const skip = (reason: string) => {
        skippedRuns++;
        skippedByReason[reason] = (skippedByReason[reason] ?? 0) + 1;
    };

    for (const run of runs) {
        if (!isSimpleRun(run)) {
            skip("notSimpleRun");
            continue;
        }
        const orig = originalRunText.get(run);
        if (orig == null) {
            skip("missingOriginal");
            continue;
        }
        const fin = getRunTextFromTChildren(run);
        const origWords = extractLetterWordSpans(orig);
        const finWords = extractLetterWordSpans(fin);

        if (origWords.length === 0 || finWords.length === 0) {
            skip("noWordSpans");
            continue;
        }
        if (origWords.length !== finWords.length) {
            skip("wordSpanCountMismatch");
            continue;
        }

        const changedWord: boolean[] = new Array(finWords.length).fill(false);
        let anyChanged = false;

        for (let i = 0; i < finWords.length; i++) {
            const origWord = origWords[i];
            const finWord = finWords[i];
            if (!origWord || !finWord) continue;
            const isChanged = wasWordTransliterated(origWord.text, finWord.text, direction);
            changedWord[i] = isChanged;
            if (isChanged) anyChanged = true;
        }

        if (!anyChanged) {
            skip("noChangedWords");
            continue;
        }

        const parent = run.parentNode;
        if (!parent) {
            skip("missingParent");
            continue;
        }

        const baseRPr = getDirectChild(run, "rPr");
        const finCps = Array.from(fin.normalize("NFC"));

        type Seg = { text: string; changed: boolean };
        const segs: Seg[] = [];

        let cursorCp = 0;
        for (let i = 0; i < finWords.length; i++) {
            const w = finWords[i];
            if (!w) continue;
            const segStart = cursorCp;
            const segEnd = w.endCp;
            const segText = finCps.slice(segStart, segEnd).join("");
            segs.push({ text: segText, changed: changedWord[i] ?? false });
            cursorCp = segEnd;
        }

        if (cursorCp < finCps.length && segs.length) {
            const lastSeg = segs[segs.length - 1];
            if (lastSeg) {
                lastSeg.text += finCps.slice(cursorCp).join("");
            }
        }

        for (const seg of segs) {
            const newRun = doc.createElementNS(WORD_NS, "w:r");
            let newRPr: Element | null = null;
            if (baseRPr) {
                newRPr = baseRPr.cloneNode(true) as Element;
                newRun.appendChild(newRPr);
            } else if (seg.changed) {
                newRPr = doc.createElementNS(WORD_NS, "w:rPr");
                newRun.appendChild(newRPr);
            }
            if (seg.changed && newRPr) {
                ensureLangOnRPr(doc, newRPr, target);
            }
            const tEl = doc.createElementNS(WORD_NS, "w:t");
            if (needsXmlSpacePreserve(seg.text)) {
                tEl.setAttributeNS(XML_NS, "xml:space", "preserve");
            }
            tEl.textContent = seg.text;
            newRun.appendChild(tEl);
            parent.insertBefore(newRun, run);
        }
        parent.removeChild(run);
        changedRuns++;
    }
    return { changedRuns, skippedRuns, skippedByReason };
}
