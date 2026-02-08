// src/taskpane/app/preview/runPreview.ts

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
import { errorRecovery } from "../error/errorRecovery";

import { createOfficeController } from "../../../app/integrations/office/createOfficeController";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";

function readSelectionTextFromOpaque(selection: unknown): string {
    try {
        const sel = selection as {
            kind?: unknown;
            text?: unknown;
            context?: { opaque?: { selectionText?: unknown } };
        };

        if (sel?.kind === "plainText") return String(sel.text ?? "");
        if (sel?.kind !== "ooxml") return "";
        return String(sel.context?.opaque?.selectionText ?? "");
    } catch {
        return "";
    }
}

type ControllerErr = { code?: unknown; message?: unknown };
type ControllerResultLike = { ok: true; value: unknown } | { ok: false; error: ControllerErr };

function isControllerResultLike(x: unknown): x is ControllerResultLike {
    return typeof x === "object" && x !== null && "ok" in x;
}

type ControllerPreviewValue = {
    selection?: unknown;
    converted?: unknown;
    beforeText?: unknown;
    afterText?: unknown;
    typeLabel?: unknown;
};

export async function runPreview() {
    setStatus(t("status_generating_preview"), "info");
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
        // Snapshot UI settings (isto kao pre)
        const settings = getSettingsFromUi();
        state.preview.settingsSnap = JSON.parse(JSON.stringify(settings)) as typeof settings;

        // Reset preview state
        state.preview.allParagraphs = [];
        state.preview.shownCount = 0;
        state.preview.canLoadMore = false;

        // --- 1) Pokušaj selection preview preko shared controller-a ---
        let selRes: ControllerResultLike | null = null;
        try {
            const controller = createOfficeController();
            const r = await controller.preview("selection");
            selRes = isControllerResultLike(r) ? r : null;
        } catch {
            selRes = null;
        }

        if (!selRes) {
            // ---------------------------------------------------------
            // Legacy selection routing (test-friendly) + POPUNI CACHE
            // ---------------------------------------------------------
            let selectionTextRaw = "";
            let originalOoxml = "";

            await Word.run(async (context) => {
                const range = context.document.getSelection();
                range.load("text");
                const ooxmlRes = range.getOoxml();
                await context.sync();

                selectionTextRaw = normalizeWeirdBreaks(String(range.text ?? ""));

                // eslint-disable-next-line office-addins/load-object-before-read
                originalOoxml = String(ooxmlRes.value ?? "");
            });

            const hasSelectionText = selectionTextRaw.trim().length > 0;
            const isJustWhitespace = selectionTextRaw.length > 0 && !hasSelectionText;

            if (isJustWhitespace) {
                showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_empty_selection")));
                setStatus(t("status_error_prefix", t("msg_empty_selection").split("<")[0]), "error");
                return;
            }

            if (hasSelectionText) {
                state.preview.scope = "selection";

                const normPreview = normalizeForSelectionHash(selectionTextRaw);
                state.preview.selectionTextHash = await sha256Hex(normPreview);

                const opts = getOoxmlOptionsFromUi();
                state.preview.ooxmlOptsSnapJson = JSON.stringify(opts);

                state.preview.selectionOoxmlHash = await sha256Hex(String(originalOoxml).normalize("NFC"));
                state.preview.cacheTimestamp = Date.now();

                const conv = convertOoxml(String(originalOoxml ?? ""), opts);
                const convertedXml = String(conv.xml ?? "");
                state.preview.convertedOoxml = convertedXml || String(originalOoxml || " ");

                const protectedWords = [
                    ...Array.from(state.customWordsSet),
                    ...Array.from(state.presetWordsSet),
                ];
                const { out: finalText, type } = convertTextForPreviewPlain(
                    selectionTextRaw,
                    state.preview.settingsSnap!,
                    protectedWords
                );

                const a = normalizeNewlines(selectionTextRaw);
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
                state.preview.titleText = t("preview_title_selection", type);
                state.preview.original = selectionTextRaw;
                state.preview.converted = finalText;

                showPreviewModal();
                setStatus(t("status_preview_shown", type), "success");
                return;
            }

            // no selection => fall through to DOCUMENT preview flow
        } else if (selRes.ok === false) {
            const code = String(selRes.error.code ?? "");
            const msg = String(selRes.error.message ?? "");

            if (code !== "NO_SELECTION") {
                showModalInfo(t("modal_title_error"), unsafeHtml(`Preview greška: ${msg}`));
                setStatus(t("status_error_prefix", msg), "error");
                return;
            }

            // NO_SELECTION => fall through to DOCUMENT preview flow
        } else {
            // Success branch (controller)
            const v = selRes.value as unknown as Partial<ControllerPreviewValue>;

            const selectionTextRaw = normalizeWeirdBreaks(readSelectionTextFromOpaque(v.selection));
            const hasSelectionText = selectionTextRaw.trim().length > 0;
            const isJustWhitespace = selectionTextRaw.length > 0 && !hasSelectionText;

            if (isJustWhitespace) {
                showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_empty_selection")));
                setStatus(t("status_error_prefix", t("msg_empty_selection").split("<")[0]), "error");
                return;
            }

            if (hasSelectionText) {
                state.preview.scope = "selection";

                const normPreview = normalizeForSelectionHash(selectionTextRaw);
                state.preview.selectionTextHash = await sha256Hex(normPreview);

                const opts = getOoxmlOptionsFromUi();
                state.preview.ooxmlOptsSnapJson = JSON.stringify(opts);

                // Best-effort extraction (original logic kept simple here)
                const beforeText = String(v.beforeText ?? "");
                const afterText = String(v.afterText ?? "");
                const typeLabel = String(v.typeLabel ?? "");

                if (!afterText.trim()) {
                    showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_preview_empty")));
                    setStatus(t("status_error_prefix", t("msg_preview_empty")), "error");
                    return;
                }

                if (normalizeNewlines(beforeText) === normalizeNewlines(afterText)) {
                    showModalInfo(t("modal_title_info"), unsafeHtml(t("msg_preview_no_changes")));
                    setStatus(t("status_no_changes"), "neutral");
                    return;
                }

                state.preview.mode = "diff";
                state.preview.typeText = typeLabel;
                state.preview.titleText = t("preview_title_selection", typeLabel);
                state.preview.original = beforeText;
                state.preview.converted = afterText;

                showPreviewModal();
                setStatus(t("status_preview_shown", typeLabel), "success");
                return;
            }
        }

        // --- 2) Nema selekcije => DOCUMENT preview (stari flow, za sada) ---
        state.preview.scope = "document";
        invalidatePreviewCache();

        await Word.run(async (context) => {
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
        await errorRecovery.handle(e, { operation: "runPreview" });
    }
}
