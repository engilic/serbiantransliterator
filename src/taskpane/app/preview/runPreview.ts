// src/taskpane/app/preview/runPreview.ts
/* global Word, console, DOMParser */

import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";
import { convertPlainText, type Direction } from "../../../core/textCore";
import { removeMultipleSpaces } from "../../../core/utils";
import { createInitialCodeState, transformTextRespectingCode } from "../../../shared/ooxml/code";
import { formatSerbianDates, toAscii } from "../../../core/format";

import { state } from "../state";
import type { UiSettings } from "../types";

import { setStatus } from "../status";
import { showModalInfo } from "../modal/modal";
import { showPreviewModal } from "../modal/previewModal";

import { invalidatePreviewCache } from "./cache";
import {
    normalizeWeirdBreaks,
    normalizeNewlines,
    normalizeForSelectionHash,
    sha256Hex,
} from "../selection";

import { unsafeHtml } from "../../../shared/safeHtml";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../settings/getters";

const PREVIEW_BATCH = 20;

/* =========================
   Plain-text preview conversion (document preview)
   ========================= */

function convertTextForPreviewPlain(input: string, s: UiSettings): { out: string; type: string } {
    let temp = normalizeWeirdBreaks(input);

    const applyFixesOutsideCode = (txt: string) => {
        let t = txt;
        if (s.fixDoubleSpaces) t = removeMultipleSpaces(t);
        if (s.formatDates) t = formatSerbianDates(t);
        return t;
    };

    if (s.preserveCodeBlocks) {
        const cs = createInitialCodeState();
        temp = transformTextRespectingCode(
            temp,
            cs,
            (nonCode) => applyFixesOutsideCode(nonCode),
            (code) => code
        );
    } else {
        temp = applyFixesOutsideCode(temp);
    }

    const coreOpts = {
        userProtected: [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)],
        protectBrands: s.protectBrands,
        applySerbianQuotes: s.applySerbianQuotes,
        preserveCodeBlocks: s.preserveCodeBlocks,
    };

    if (s.direction === "to-ascii") {
        const { text: lat } = convertPlainText(temp, "cyr-to-lat", {
            ...coreOpts,
            applySerbianQuotes: false,
        });
        return { out: toAscii(lat), type: "Ošišana latinica" };
    }

    const dir: Direction = s.direction === "auto" ? "auto" : (s.direction as Direction);
    const { text, type } = convertPlainText(temp, dir, coreOpts);
    return { out: text, type };
}

/* =========================
   OOXML -> text extraction (selection preview)
   ========================= */

function extractTextFromWordOoxml(xml: string): string {
    const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    const doc = new DOMParser().parseFromString(xml, "application/xml");

    const paras = Array.from(doc.getElementsByTagNameNS(W_NS, "p"));
    const hasParas = paras.length > 0;

    const walk = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) return "";
        const el = node as Element;
        if (!el || !el.localName) return "";

        if (el.localName === "t") return el.textContent ?? "";
        if (el.localName === "tab") return "\t";
        if (el.localName === "br" || el.localName === "cr") return "\n";

        let out = "";
        for (const ch of Array.from(el.childNodes)) out += walk(ch);
        return out;
    };

    if (!hasParas) {
        return Array.from(doc.getElementsByTagNameNS(W_NS, "t"))
            .map((n) => n.textContent ?? "")
            .join("");
    }

    const out: string[] = [];
    for (const p of paras) out.push(walk(p));
    return out.join("\n");
}

/* =========================
   Public API: runPreview
   ========================= */

export async function runPreview() {
    setStatus("Generišem pregled...", "info");

    try {
        await Word.run(async (context) => {
            const range = context.document.getSelection();
            range.load("text");
            await context.sync();

            const selectionText = normalizeWeirdBreaks(range.text ?? "");
            const hasSelectionText = selectionText.trim().length > 0;
            const isJustWhitespace = selectionText.length > 0 && !hasSelectionText;

            if (isJustWhitespace) {
                showModalInfo("Greška", unsafeHtml("Selektovan je samo prazan prostor."));
                setStatus("Greška: Prazna selekcija.", "error");
                return;
            }

            const settings = getSettingsFromUi();
            state.preview.settingsSnap = JSON.parse(JSON.stringify(settings)) as UiSettings;

            state.preview.allParagraphs = [];
            state.preview.shownCount = 0;
            state.preview.canLoadMore = false;

            // =========================
            // PREVIEW: SELECTION (OOXML)
            // =========================
            if (hasSelectionText) {
                state.preview.scope = "selection";

                const normPreview = normalizeForSelectionHash(selectionText);
                state.preview.selectionTextHash = await sha256Hex(normPreview);

                const ooxml = range.getOoxml();
                await context.sync();

                const originalOoxml = ooxml.value;
                const opts: OoxmlOptions = getOoxmlOptionsFromUi();

                const origText = extractTextFromWordOoxml(originalOoxml);
                const converted = convertOoxml(originalOoxml, opts);

                // cache za apply (samo za selekciju)
                state.preview.convertedOoxml = converted.xml;
                state.preview.ooxmlOptsSnapJson = JSON.stringify(opts);

                // NEW: hash originalnog OOXML-a selekcije (hvata i formatiranje)
                state.preview.selectionOoxmlHash = await sha256Hex((originalOoxml ?? "").normalize("NFC"));

                state.preview.cacheTimestamp = Date.now();

                const convText = extractTextFromWordOoxml(converted.xml);

                const a = normalizeNewlines(origText);
                const b = normalizeNewlines(convText);

                if (!b.trim()) {
                    showModalInfo("Greška", unsafeHtml("Pregled nije uspeo: rezultat je prazan tekst."));
                    setStatus("Greška: Prazan rezultat pregleda.", "error");
                    return;
                }

                if (a === b) {
                    showModalInfo("Nema izmena", unsafeHtml("Tekst je već u traženom pismu ili nema šta da se menja."));
                    setStatus("Nema izmena.", "neutral");
                    return;
                }

                state.preview.mode = "diff";
                state.preview.typeText = converted.type;
                state.preview.titleText = `Selektovani tekst (${converted.type})`;
                state.preview.original = origText;
                state.preview.converted = convText;

                showPreviewModal();
                setStatus(`Prikazan pregled (${converted.type})`, "success");
                return;
            }

            // =========================
            // PREVIEW: WHOLE DOC (plain text, first N paragraphs)
            // =========================
            state.preview.scope = "document";

            invalidatePreviewCache();

            const body = context.document.body;
            body.load("text");
            await context.sync();

            const full = normalizeWeirdBreaks(body.text ?? "");

            let paragraphs = full.split(/\r/);
            if (paragraphs.length === 1) paragraphs = full.split(/\n/);
            if (paragraphs.length === 1) paragraphs = [full];

            while (paragraphs.length && !paragraphs[paragraphs.length - 1]!.trim()) paragraphs.pop();

            state.preview.allParagraphs = paragraphs;
            state.preview.shownCount = Math.min(PREVIEW_BATCH, paragraphs.length);
            state.preview.canLoadMore = state.preview.shownCount < paragraphs.length;

            const textToPreview = paragraphs.slice(0, state.preview.shownCount).join("\n");
            if (!textToPreview.trim()) {
                setStatus("Dokument je prazan.", "neutral");
                return;
            }

            const { out: finalText, type } = convertTextForPreviewPlain(textToPreview, state.preview.settingsSnap);

            const a = normalizeNewlines(textToPreview);
            const b = normalizeNewlines(finalText);

            if (!b.trim()) {
                showModalInfo("Greška", unsafeHtml("Pregled nije uspeo: rezultat je prazan tekst."));
                setStatus("Greška: Prazan rezultat pregleda.", "error");
                return;
            }

            if (a === b) {
                showModalInfo("Nema izmena", unsafeHtml("Tekst je već u traženom pismu ili nema šta da se menja."));
                setStatus("Nema izmena.", "neutral");
                return;
            }

            state.preview.mode = "diff";
            state.preview.typeText = type;
            state.preview.titleText = `Prvih ${state.preview.shownCount} paragrafa (${type})`;
            state.preview.original = textToPreview;
            state.preview.converted = finalText;

            showPreviewModal();
            setStatus(`Prikazan pregled (${type})`, "success");
        });
    } catch (e) {
        console.error(e);
        setStatus("Greška pri pregledu: " + (e as Error).message, "error");
    }
}