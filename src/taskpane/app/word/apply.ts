// src/taskpane/app/word/apply.ts

import { unsafeHtml } from "../../../shared/safeHtml";
import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { t } from "../../../shared/i18n";

import { state, PREVIEW_CACHE_TTL_MS } from "../state";
import { setStatus, refreshStats } from "../status";
import { confirmInPanel, showModalInfo } from "../modal/modal";
import { invalidatePreviewCache } from "../preview/cache";
import { normalizeForSelectionHash, sha256Hex } from "../selection";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../settings/getters";
import { applyPipeline } from "./pipeline";
import { analyzeSelectionText } from "./selectionText";
import { buildApplyStatsText, buildPreviewAppliedStats } from "./statsText"; // REMOVED buildApplyStatsTitle
import { decidePreviewCacheReuse, type PreviewCacheDecisionReason } from "./previewCacheDecision";
import type { UiSettings, ExtrasSummary } from "../types";
import { errorRecovery } from "../error/errorRecovery";
import { logger } from "../telemetry/logger";

function logTelemetrySkippedRuns(skippedByReason: Record<string, number>) {
    if (Object.keys(skippedByReason).length === 0) return;
    logger.warn("[Telemetry] Skipped runs detected:", skippedByReason);
}

function reasonToSerbian(reason: PreviewCacheDecisionReason): string {
    switch (reason) {
        case "optsChanged":
            return t("reason_opts_changed");
        case "expired":
            return t("reason_expired");
        case "selectionTextChanged":
            return t("reason_selection_changed");
        case "selectionOoxmlChanged":
            return t("reason_formatting_changed");
        case "missing":
            return t("reason_missing");
        default:
            return t("reason_unknown");
    }
}

function buildDocumentExtraStatus(ui: UiSettings, extras: ExtrasSummary): string {
    const parts: string[] = [];

    if (ui.includeHeadersFooters && extras.headersFootersProcessed > 0) {
        parts.push(t("status_extra_headers_footers", extras.headersFootersProcessed));
    }
    if (ui.includeFootnotes && extras.footnotesSupported === false) {
        parts.push(t("status_extra_footnotes_na"));
    }
    if (ui.includeEndnotes && extras.endnotesSupported === false) {
        parts.push(t("status_extra_endnotes_na"));
    }

    return parts.length ? " | " + parts.join(" | ") : "";
}

export async function runSmart() {
    try {
        await Word.run(async (context) => {
            const sel = context.document.getSelection();
            sel.load("text");
            await context.sync();

            const selInfo = analyzeSelectionText(sel.text);

            if (selInfo.isJustWhitespace) {
                showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_empty_selection")));
                setStatus(t("status_error_prefix", t("msg_empty_selection").split("<")[0]), "error");
                return;
            }

            const scope: "selection" | "document" = selInfo.hasText ? "selection" : "document";

            const ui = getSettingsFromUi();
            const opts = getOoxmlOptionsFromUi();

            if (scope === "document" && ui.confirmWholeDoc) {
                const ok = await confirmInPanel(unsafeHtml(t("msg_confirm_whole_doc")));
                if (!ok) {
                    setStatus(t("status_cancelled"), "neutral");
                    return;
                }
            }

            const { result, extras } = await applyPipeline(context, scope, ui, opts);

            if (!result) {
                setStatus(t("status_no_text_found"), "neutral");
                return;
            }

            if (result.stats.proofing?.skippedByReason) {
                logTelemetrySkippedRuns(result.stats.proofing.skippedByReason);
            }

            const time = (result.stats.timingMs ?? 0).toFixed(0);

            if (scope === "selection") {
                setStatus(t("status_done_selection", result.type, time), "success");
            } else {
                const extraInfo = buildDocumentExtraStatus(ui, extras);
                setStatus(t("status_done_document", result.type, time, extraInfo), "success");
            }

            state.lastStatsText = buildApplyStatsText(result, scope, extras);
            refreshStats();
        });
    } catch (e: any) {
        const debugEnabled =
            typeof localStorage !== "undefined" && localStorage.getItem("stDebugOfficeErrors") === "1";

        const escapeHtml = (s: string) =>
            s
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        // Console (uvek)
        console.error("[runSmart] raw error:", e);
        console.error("[runSmart] code:", e?.code);
        console.error("[runSmart] message:", e?.message);
        console.error("[runSmart] debugInfo:", e?.debugInfo);
        console.error("[runSmart] stack:", e?.stack);

        // Modal (samo kad je flag uključen)
        if (debugEnabled) {
            try {
                const payload = {
                    name: e?.name,
                    code: e?.code,
                    message: e?.message,
                    debugInfo: e?.debugInfo,
                    stack: e?.stack,
                };

                const pretty = JSON.stringify(payload, null, 2);

                showModalInfo(
                    t("modal_title_debug"),
                    unsafeHtml(
                        `<pre style="white-space:pre-wrap; font-size:12px;">${escapeHtml(pretty)}</pre>`
                    )
                );
            } catch {
                // ignore
            }
        }

        await errorRecovery.handle(e, { operation: "runSmart" });
    }
}

export async function applyFromPreview(scope: "selection" | "document") {
    try {
        await Word.run(async (context) => {
            const ui = getSettingsFromUi();
            const opts: OoxmlOptions = getOoxmlOptionsFromUi();

            const interactive = state.preview.interactiveDiff;
            const hasManualChanges = interactive && interactive.hasRejections();

            if (scope === "selection") {
                const range = context.document.getSelection();

                if (hasManualChanges) {
                    const finalCustomText = interactive!.buildResult();
                    setStatus(t("status_applying_preview"), "info");
                    range.insertText(finalCustomText, Word.InsertLocation.replace);
                    await context.sync();
                    setStatus(t("status_preview_applied") + " (Plain Text)", "success");
                    state.lastStatsText = "Primenjene ručne izmene.";
                    refreshStats();
                    return;
                }

                const ooxml = range.getOoxml();
                range.load("text");
                await context.sync();

                const info = analyzeSelectionText(range.text);

                if (!info.hasText) {
                    showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_no_selection")));
                    return;
                }
                if (info.isJustWhitespace) {
                    showModalInfo(t("modal_title_error"), unsafeHtml(t("msg_empty_selection")));
                    return;
                }

                const normApply = normalizeForSelectionHash(info.raw);
                const currentSelectionHash = await sha256Hex(normApply);
                const currentOoxml = ooxml.value ?? "";
                const currentOoxmlHash = await sha256Hex(currentOoxml.normalize("NFC"));
                const currentJson = JSON.stringify(opts);

                const decision = decidePreviewCacheReuse({
                    snapshot: {
                        convertedOoxml: state.preview.convertedOoxml,
                        ooxmlOptsSnapJson: state.preview.ooxmlOptsSnapJson,
                        selectionTextHash: state.preview.selectionTextHash,
                        selectionOoxmlHash: state.preview.selectionOoxmlHash,
                        cacheTimestamp: state.preview.cacheTimestamp,
                    },
                    current: {
                        currentOptsJson: currentJson,
                        currentSelectionTextHash: currentSelectionHash,
                        currentSelectionOoxmlHash: currentOoxmlHash,
                    },
                    nowMs: Date.now(),
                    ttlMs: PREVIEW_CACHE_TTL_MS,
                });

                if (decision.ok) {
                    setStatus(t("status_applying_preview"), "info");
                    range.insertOoxml(state.preview.convertedOoxml!, Word.InsertLocation.replace);
                    await context.sync();
                    setStatus(t("status_preview_applied"), "success");
                    const s = buildPreviewAppliedStats();
                    state.lastStatsText = s.text;
                    refreshStats();
                    return;
                }

                if (decision.reason !== "missing") {
                    invalidatePreviewCache();
                    setStatus(t("status_preview_cache_invalid", reasonToSerbian(decision.reason)), "info");
                }

                const { result } = await applyPipeline(context, "selection", ui, opts);

                if (!result) {
                    setStatus(t("status_no_text_found"), "neutral");
                    return;
                }

                if (result.stats.proofing?.skippedByReason) {
                    logTelemetrySkippedRuns(result.stats.proofing.skippedByReason);
                }

                const time = result.stats.timingMs.toFixed(0);
                setStatus(t("status_done_selection", result.type, time), "success");
                state.lastStatsText = buildApplyStatsText(result, "selection");
                refreshStats();
                return;
            }

            const { result, extras } = await applyPipeline(context, "document", ui, opts);

            if (!result) {
                setStatus(t("status_no_text_found"), "neutral");
                return;
            }

            if (result.stats.proofing?.skippedByReason) {
                logTelemetrySkippedRuns(result.stats.proofing.skippedByReason);
            }

            const time = result.stats.timingMs.toFixed(0);
            const extraInfo = buildDocumentExtraStatus(ui, extras);

            setStatus(t("status_done_document", result.type, time, extraInfo), "success");
            state.lastStatsText = buildApplyStatsText(result, "document", extras);
            refreshStats();
        });
    } catch (e) {
        await errorRecovery.handle(e, { operation: "applyFromPreview" });
    }
}
