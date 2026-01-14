// src/taskpane/app/word/apply.ts
/* global Word, console */

import { unsafeHtml } from "../../../shared/safeHtml";
import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";

import { state } from "../state";
import { setStatus, refreshStats } from "../status";
import { confirmInPanel, showModalInfo } from "../modal/modal";
import { invalidatePreviewCache, isPreviewCacheValid } from "../preview/cache";
import { normalizeForSelectionHash, sha256Hex } from "../selection";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../settings/getters";
import { applyPipeline } from "./pipeline";

export async function runSmart() {
    try {
        await Word.run(async (context) => {
            const sel = context.document.getSelection();
            sel.load("text");
            await context.sync();

            const selectionText = sel.text ?? "";
            const hasSelectionText = selectionText.trim().length > 0;
            const isJustWhitespace = selectionText.length > 0 && !hasSelectionText;

            if (isJustWhitespace) {
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
            const scope: "selection" | "document" = hasSelectionText ? "selection" : "document";

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
            const hfInfo =
                scope === "document" && extras.headersFootersProcessed > 0 ? ` | H/F: ${extras.headersFootersProcessed}` : "";

            setStatus(`Završeno: ${result.type} (${time}ms)${hfInfo}`, "success");

            state.lastStatsTitle = `Statistika: ${result.type}`;
            state.lastStatsText =
                `Opseg: ${scope === "selection" ? "Selekcija" : "Ceo dokument"}\n` +
                `Promenjeno čvorova: ${result.stats.textNodes}\n` +
                `Vreme: ${time}ms` +
                `\nBridges:` +
                `\n- links: ${result.stats.bridges.links}` +
                `\n- placeholders: ${result.stats.bridges.placeholders}` +
                `\n- brandPhrases: ${result.stats.bridges.brandPhrases}` +
                `\n- brandTokens: ${result.stats.bridges.brandTokens}` +
                `\n- ambiguousBrandSuffix: ${result.stats.bridges.ambiguousBrandSuffix}` +
                `\n- digraphs: ${result.stats.bridges.digraphs}` +
                `\n- userPhrases: ${result.stats.bridges.userPhrases}` +
                `\n- userTokens: ${result.stats.bridges.userTokens}` +
                `\n- allCapsHints: ${result.stats.bridges.allCapsHints}` +
                `\n- spaces: ${result.stats.bridges.spaces}` +
                (scope === "document"
                    ? `\nHeader/Footer: ${extras.headersFootersProcessed}\nFusnote: ${extras.footnotesProcessed}\nEndnote: ${extras.endnotesProcessed}`
                    : "");

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

                const rawText = range.text ?? "";
                const hasText = rawText.trim().length > 0;
                const isJustWhitespace = rawText.length > 0 && !hasText;

                if (!hasText) {
                    showModalInfo("Greška", unsafeHtml("Nema selekcije za preslovljavanje."));
                    return;
                }
                if (isJustWhitespace) {
                    showModalInfo("Greška", unsafeHtml("Selektovan je samo prazan prostor (razmaci)."));
                    return;
                }

                const normApply = normalizeForSelectionHash(rawText);
                const currentSelectionHash = await sha256Hex(normApply);

                const currentOoxml = ooxml.value ?? "";
                const currentOoxmlHash = await sha256Hex(currentOoxml.normalize("NFC"));

                if (
                    state.preview.convertedOoxml &&
                    state.preview.ooxmlOptsSnapJson &&
                    state.preview.selectionTextHash &&
                    state.preview.selectionOoxmlHash
                ) {
                    const currentJson = JSON.stringify(opts);

                    if (currentJson === state.preview.ooxmlOptsSnapJson && isPreviewCacheValid()) {
                        const sameText = currentSelectionHash === state.preview.selectionTextHash;
                        const sameOoxml = currentOoxmlHash === state.preview.selectionOoxmlHash;

                        if (sameText && sameOoxml) {
                            setStatus("Primena pregleda (bez ponovne konverzije)...", "info");

                            range.insertOoxml(state.preview.convertedOoxml, Word.InsertLocation.replace);
                            await context.sync();

                            setStatus("Završeno (primenjen preview).", "success");

                            state.lastStatsTitle = "Statistika: primenjen preview";
                            state.lastStatsText =
                                `Opseg: Selekcija\n` +
                                `Napomena: primenjen je OOXML iz pregleda (bez ponovne konverzije).`;

                            refreshStats();
                            return;
                        }

                        // UX fix: bez modala (ne prekidaj flow)
                        invalidatePreviewCache();
                        setStatus(
                            "Cache preview-a ne važi (selekcija/formatiranje promenjeni ili cache istekao). Radim ponovnu konverziju...",
                            "info"
                        );
                    }
                }

                const { result } = await applyPipeline(context, "selection", ui, opts);

                if (!result) {
                    setStatus("Nije pronađen tekst za obradu.", "neutral");
                    return;
                }

                const time = result.stats.timingMs.toFixed(0);
                setStatus(`Završeno: ${result.type} (${time}ms)`, "success");

                state.lastStatsTitle = `Statistika: ${result.type}`;
                state.lastStatsText =
                    `Opseg: Selekcija\n` +
                    `Promenjeno čvorova: ${result.stats.textNodes}\n` +
                    `Vreme: ${time}ms` +
                    `\nBridges:` +
                    `\n- links: ${result.stats.bridges.links}` +
                    `\n- placeholders: ${result.stats.bridges.placeholders}` +
                    `\n- brandPhrases: ${result.stats.bridges.brandPhrases}` +
                    `\n- brandTokens: ${result.stats.bridges.brandTokens}` +
                    `\n- ambiguousBrandSuffix: ${result.stats.bridges.ambiguousBrandSuffix}` +
                    `\n- digraphs: ${result.stats.bridges.digraphs}` +
                    `\n- userPhrases: ${result.stats.bridges.userPhrases}` +
                    `\n- userTokens: ${result.stats.bridges.userTokens}` +
                    `\n- allCapsHints: ${result.stats.bridges.allCapsHints}` +
                    `\n- spaces: ${result.stats.bridges.spaces}`;

                refreshStats();
                return;
            }

            const { result, extras } = await applyPipeline(context, "document", ui, opts);

            if (!result) {
                setStatus("Nije pronađen tekst za obradu.", "neutral");
                return;
            }

            const time = result.stats.timingMs.toFixed(0);
            const hfInfo = extras.headersFootersProcessed > 0 ? ` | H/F: ${extras.headersFootersProcessed}` : "";

            setStatus(`Završeno: ${result.type} (${time}ms)${hfInfo}`, "success");

            state.lastStatsTitle = `Statistika: ${result.type}`;
            state.lastStatsText =
                `Opseg: Ceo dokument\n` +
                `Promenjeno čvorova: ${result.stats.textNodes}\n` +
                `Vreme: ${time}ms` +
                `\nBridges:` +
                `\n- links: ${result.stats.bridges.links}` +
                `\n- placeholders: ${result.stats.bridges.placeholders}` +
                `\n- brandPhrases: ${result.stats.bridges.brandPhrases}` +
                `\n- brandTokens: ${result.stats.bridges.brandTokens}` +
                `\n- ambiguousBrandSuffix: ${result.stats.bridges.ambiguousBrandSuffix}` +
                `\n- digraphs: ${result.stats.bridges.digraphs}` +
                `\n- userPhrases: ${result.stats.bridges.userPhrases}` +
                `\n- userTokens: ${result.stats.bridges.userTokens}` +
                `\n- allCapsHints: ${result.stats.bridges.allCapsHints}` +
                `\n- spaces: ${result.stats.bridges.spaces}` +
                `\nHeader/Footer: ${extras.headersFootersProcessed}` +
                `\nFusnote: ${extras.footnotesProcessed}` +
                `\nEndnote: ${extras.endnotesProcessed}`;

            refreshStats();
        });
    } catch (e) {
        console.error(e);
        setStatus("Greška: " + (e as Error).message, "error");
    }
}