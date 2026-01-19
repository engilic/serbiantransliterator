// src/taskpane/app/preview/runPreview.ts
/* global Word, console, DOMParser */

import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";
import { state } from "../state";
import { setStatus } from "../status";
import { showModalInfo } from "../modal/modal";
import { showPreviewModal } from "../modal/previewModal";
import { invalidatePreviewCache } from "./cache";
import { normalizeWeirdBreaks, normalizeNewlines, normalizeForSelectionHash, sha256Hex } from "../selection";
import { unsafeHtml } from "../../../shared/safeHtml";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../settings/getters";
import { PREVIEW_BATCH } from "./constants";
import { convertTextForPreviewPlain } from "./convertPreviewPlain";
import { t } from "../../../shared/i18n";
// NEW: Import recovery
import { errorRecovery } from "../error/errorRecovery";

function extractTextFromWordOoxml(xml: string): string {
    const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const paras = Array.from(doc.getElementsByTagNameNS(W_NS, "p"));

    if (paras.length === 0) {
        return Array.from(doc.getElementsByTagNameNS(W_NS, "t"))
            .map((n) => n.textContent ?? "")
            .join("");
    }

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

    return paras.map(walk).join("\n");
}

export async function runPreview() {
    setStatus(t("status_generating_preview"), "info");

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
        await Word.run(async (context) => {
            const range = context.document.getSelection();
            range.load("text");
            await context.sync();

            const selectionText = normalizeWeirdBreaks(range.text ?? "");
            const hasSelectionText = selectionText.trim().length > 0;
            const isJustWhitespace = selectionText.length > 0 && !hasSelectionText;

            if (isJustWhitespace) {
                showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_empty_selection")));
                setStatus(t("status_error_prefix", t("msg_empty_selection").split("<")[0]), "error");
                return;
            }

            const settings = getSettingsFromUi();
            state.preview.settingsSnap = JSON.parse(JSON.stringify(settings)) as typeof settings;
            state.preview.allParagraphs = [];
            state.preview.shownCount = 0;
            state.preview.canLoadMore = false;

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

                state.preview.convertedOoxml = converted.xml;
                state.preview.ooxmlOptsSnapJson = JSON.stringify(opts);
                state.preview.selectionOoxmlHash = await sha256Hex((originalOoxml ?? "").normalize("NFC"));
                state.preview.cacheTimestamp = Date.now();

                const convText = extractTextFromWordOoxml(converted.xml);
                const a = normalizeNewlines(origText);
                const b = normalizeNewlines(convText);

                if (!b.trim()) {
                    showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_preview_empty")));
                    setStatus(t("status_error_prefix", t("msg_preview_empty")), "error");
                    return;
                }

                if (a === b) {
                    showModalInfo(t("modal_title_info"), unsafeHtml(t("msg_preview_no_changes")));
                    setStatus(t("status_no_changes"), "neutral");
                    return;
                }

                state.preview.mode = "diff";
                state.preview.typeText = converted.type;
                state.preview.titleText = t("preview_title_selection", converted.type);
                state.preview.original = origText;
                state.preview.converted = convText;

                showPreviewModal();
                setStatus(t("status_preview_shown", converted.type), "success");
                return;
            }

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
                setStatus(t("status_empty_doc"), "neutral");
                return;
            }

            const protectedWords = [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)];
            const { out: finalText, type } = convertTextForPreviewPlain(
                textToPreview,
                state.preview.settingsSnap!,
                protectedWords
            );

            const a = normalizeNewlines(textToPreview);
            const b = normalizeNewlines(finalText);

            if (!b.trim()) {
                showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_preview_empty")));
                setStatus(t("status_error_prefix", t("msg_preview_empty")), "error");
                return;
            }

            if (a === b) {
                showModalInfo(t("modal_title_info"), unsafeHtml(t("msg_preview_no_changes")));
                setStatus(t("status_no_changes"), "neutral");
                return;
            }

            state.preview.mode = "diff";
            state.preview.typeText = type;
            state.preview.titleText = t("preview_title_doc", state.preview.shownCount, type);
            state.preview.original = textToPreview;
            state.preview.converted = finalText;

            showPreviewModal();
            setStatus(t("status_preview_shown", type), "success");
        });
    } catch (e) {
        // CHANGED: Use centralized error recovery
        await errorRecovery.handle(e, { operation: "runPreview" });
    }
}
