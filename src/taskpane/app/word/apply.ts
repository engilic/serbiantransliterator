// src/taskpane/app/word/apply.ts
/* global Word, console */

import { unsafeHtml } from "../../../shared/safeHtml";
import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";

import { state, PREVIEW_CACHE_TTL_MS } from "../state";
import { setStatus, refreshStats } from "../status";
import { confirmInPanel, showModalInfo } from "../modal/modal";
import { invalidatePreviewCache } from "../preview/cache";
import { normalizeForSelectionHash, sha256Hex } from "../selection";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../settings/getters";
import { applyPipeline } from "./pipeline";
import { analyzeSelectionText } from "./selectionText";
import { buildApplyStatsText, buildApplyStatsTitle, buildPreviewAppliedStats } from "./statsText";
import { decidePreviewCacheReuse, type PreviewCacheDecisionReason } from "./previewCacheDecision";
import type { UiSettings, ExtrasSummary } from "../types";

function reasonToSerbian(reason: PreviewCacheDecisionReason): string {
    switch (reason) {
        case "optsChanged":
            return "podešavanja su promenjena";
        case "expired":
            return "cache je istekao";
        case "selectionTextChanged":
            return "selekcija je promenjena";
        case "selectionOoxmlChanged":
            return "formatiranje/selekcija (OOXML) su promenjeni";
        case "missing":
            return "cache nije kompletan";
        case "ok":
            return "OK";
        default:
            return "nepoznat razlog";
    }
}

function buildDocumentExtraStatus(ui: UiSettings, extras: ExtrasSummary): string {
    const parts: string[] = [];

    if (ui.includeHeadersFooters && extras.headersFootersProcessed > 0) {
        parts.push(`H/F: ${extras.headersFootersProcessed}`);
    }

    // If user enabled notes but API isn't supported in this host/context
    if (ui.includeFootnotes && extras.footnotesSupported === false) {
        parts.push("Fusnote: N/A");
    }
    if (ui.includeEndnotes && extras.endnotesSupported === false) {
        parts.push("Endnote: N/A");
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
                showModalInfo(
                    "Greška",
                    unsafeHtml(
                        "Selektovan je samo prazan prostor (razmaci).<br>" +
                            "Molimo selektujte tekst ili ne selektujte ništa za ceo dokument."
                    )
                );
                setStatus("Greška: Prazna selekcija.", "error");
                return;
            }

            const ui = getSettingsFromUi();
            const opts = getOoxmlOptionsFromUi();
            const scope: "selection" | "document" = selInfo.hasText ? "selection" : "document";

            if (scope === "document" && ui.confirmWholeDoc) {
                const ok = await confirmInPanel(
                    unsafeHtml("Nije selektovan tekst.<br/>Da li želite da preslovite <b>CEO dokument</b>?")
                );
                if (!ok) {
                    setStatus("Otkazano.", "neutral");
                    return;
                }
            }

            const { result, extras } = await applyPipeline(context, scope, ui, opts);

            if (!result) {
                setStatus("Nije pronađen tekst za obradu.", "neutral");
                return;
            }

            const time = result.stats.timingMs.toFixed(0);
            const extraInfo = scope === "document" ? buildDocumentExtraStatus(ui, extras) : "";

            setStatus(`Završeno: ${result.type} (${time}ms)${extraInfo}`, "success");

            state.lastStatsTitle = buildApplyStatsTitle(result);
            state.lastStatsText = buildApplyStatsText(result, scope, extras);

            refreshStats();
        });
    } catch (e) {
        console.error(e);
        setStatus("Greška: " + (e as Error).message, "error");
    }
}

export async function applyFromPreview(scope: "selection" | "document") {
    try {
        await Word.run(async (context) => {
            const ui = getSettingsFromUi();
            const opts: OoxmlOptions = getOoxmlOptionsFromUi();

            if (scope === "selection") {
                const range = context.document.getSelection();
                const ooxml = range.getOoxml();
                range.load("text");
                await context.sync();

                const info = analyzeSelectionText(range.text);

                if (!info.hasText) {
                    showModalInfo("Greška", unsafeHtml("Nema selekcije za preslovljavanje."));
                    return;
                }
                if (info.isJustWhitespace) {
                    showModalInfo("Greška", unsafeHtml("Selektovan je samo prazan prostor (razmaci)."));
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
                    setStatus("Primena pregleda (bez ponovne konverzije)...", "info");

                    range.insertOoxml(state.preview.convertedOoxml!, Word.InsertLocation.replace);
                    await context.sync();

                    setStatus("Završeno (primenjen preview).", "success");

                    const s = buildPreviewAppliedStats();
                    state.lastStatsTitle = s.title;
                    state.lastStatsText = s.text;

                    refreshStats();
                    return;
                }

                // UX: bez modala (ne prekidaj flow)
                if (decision.reason !== "missing") {
                    invalidatePreviewCache();
                    setStatus(
                        `Cache preview-a ne važi (${reasonToSerbian(decision.reason)}). Radim ponovnu konverziju...`,
                        "info"
                    );
                }

                const { result } = await applyPipeline(context, "selection", ui, opts);

                if (!result) {
                    setStatus("Nije pronađen tekst za obradu.", "neutral");
                    return;
                }

                const time = result.stats.timingMs.toFixed(0);
                setStatus(`Završeno: ${result.type} (${time}ms)`, "success");

                state.lastStatsTitle = buildApplyStatsTitle(result);
                state.lastStatsText = buildApplyStatsText(result, "selection");

                refreshStats();
                return;
            }

            // scope === "document"
            const { result, extras } = await applyPipeline(context, "document", ui, opts);

            if (!result) {
                setStatus("Nije pronađen tekst za obradu.", "neutral");
                return;
            }

            const time = result.stats.timingMs.toFixed(0);
            const extraInfo = buildDocumentExtraStatus(ui, extras);

            setStatus(`Završeno: ${result.type} (${time}ms)${extraInfo}`, "success");

            state.lastStatsTitle = buildApplyStatsTitle(result);
            state.lastStatsText = buildApplyStatsText(result, "document", extras);

            refreshStats();
        });
    } catch (e) {
        console.error(e);
        setStatus("Greška: " + (e as Error).message, "error");
    }
}
