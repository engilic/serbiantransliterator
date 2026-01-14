// src/taskpane/app/word/apply.ts
/* global Word, console */

import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";
import { unsafeHtml } from "../../../shared/safeHtml";

import { state } from "../state";
import type { UiSettings, ExtrasSummary } from "../types";
import { emptyExtrasSummary } from "../types";

import { setStatus, refreshStats } from "../status";
import { confirmInPanel, showModalInfo } from "../modal/modal";

import { invalidatePreviewCache, isPreviewCacheValid } from "../preview/cache";
import { normalizeForSelectionHash, sha256Hex } from "../selection";

import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../settings/getters";

/* =========================
   Word apply helpers
   ========================= */

type OoxmlConvertResult = ReturnType<typeof convertOoxml>;

async function applyRangeWithOoxmlConversion(
    context: Word.RequestContext,
    range: Word.Range,
    opts: OoxmlOptions
): Promise<OoxmlConvertResult | null> {
    setStatus("Obrada u toku...", "info");

    const ooxml = range.getOoxml();
    await context.sync();

    const result = convertOoxml(ooxml.value, opts);
    if (result.type === "Nema teksta") return null;

    range.insertOoxml(result.xml, Word.InsertLocation.replace);
    await context.sync();

    return result;
}

async function processHeadersFooters(context: Word.RequestContext, opts: OoxmlOptions): Promise<number> {
    let processed = 0;

    const sections = context.document.sections;
    sections.load("items");
    await context.sync();

    const types: Word.HeaderFooterType[] = [
        Word.HeaderFooterType.primary,
        Word.HeaderFooterType.firstPage,
        Word.HeaderFooterType.evenPages,
    ];

    type OoxmlResult = ReturnType<Word.Range["getOoxml"]>;
    type Req = { range: Word.Range; ooxml: OoxmlResult };
    const reqs: Req[] = [];

    // 1) Batch: prikupi sve getOoxml pozive (bez sync u petlji)
    for (const sec of sections.items) {
        for (const t of types) {
            try {
                const r = sec.getHeader(t).getRange();
                const o = r.getOoxml();
                reqs.push({ range: r, ooxml: o });
            } catch {
                // ignore
            }

            try {
                const r = sec.getFooter(t).getRange();
                const o = r.getOoxml();
                reqs.push({ range: r, ooxml: o });
            } catch {
                // ignore
            }
        }
    }

    // 2) Jedan sync da dobijemo sve .value
    await context.sync();

    // 3) Lokalna konverzija + queue insert (bez sync u petlji)
    for (const req of reqs) {
        const xmlIn = req.ooxml.value;
        if (!xmlIn) continue;

        const res = convertOoxml(xmlIn, opts);
        if (res.type === "Nema teksta") continue;

        req.range.insertOoxml(res.xml, Word.InsertLocation.replace);
        processed++;
    }

    // 4) Jedan sync da se sve primeni
    if (processed > 0) await context.sync();

    return processed;
}

async function processNotes(
    context: Word.RequestContext,
    opts: OoxmlOptions,
    kind: "footnotes" | "endnotes"
): Promise<{ processed: number; supported: boolean }> {
    let processed = 0;

    const docAny = context.document as {
        footnotes?: { load: (props: string) => void; items: unknown[] };
        endnotes?: { load: (props: string) => void; items: unknown[] };
    };
    const bodyAny = context.document.body as {
        footnotes?: { load: (props: string) => void; items: unknown[] };
        endnotes?: { load: (props: string) => void; items: unknown[] };
    };

    const coll = bodyAny?.[kind] ?? docAny?.[kind];
    if (!coll || typeof coll.load !== "function") {
        return { processed: 0, supported: false };
    }

    coll.load("items");
    await context.sync();

    type OoxmlResult = ReturnType<Word.Range["getOoxml"]>;
    type Req = { range: Word.Range; ooxml: OoxmlResult };
    const reqs: Req[] = [];

    const items: unknown[] = coll.items ?? [];
    for (const item of items) {
        let r: Word.Range | null = null;

        try {
            const itemWithRange = item as {
                getRange?: () => Word.Range;
                body?: { getRange?: (type: string) => Word.Range };
                contentRange?: Word.Range;
            };

            if (typeof itemWithRange.getRange === "function") {
                r = itemWithRange.getRange();
            } else if (itemWithRange.body && typeof itemWithRange.body.getRange === "function") {
                r = itemWithRange.body.getRange("Whole");
            } else if (itemWithRange.contentRange) {
                r = itemWithRange.contentRange;
            }
        } catch {
            r = null;
        }

        if (!r) continue;

        try {
            const o = r.getOoxml();
            reqs.push({ range: r, ooxml: o });
        } catch {
            // ignore
        }
    }

    await context.sync();

    for (const req of reqs) {
        const xmlIn = req.ooxml.value;
        if (!xmlIn) continue;

        const res = convertOoxml(xmlIn, opts);
        if (res.type === "Nema teksta") continue;

        req.range.insertOoxml(res.xml, Word.InsertLocation.replace);
        processed++;
    }

    if (processed > 0) await context.sync();

    return { processed, supported: true };
}

async function applyExtrasIfEnabled(
    context: Word.RequestContext,
    ui: UiSettings,
    opts: OoxmlOptions
): Promise<ExtrasSummary> {
    const summary = emptyExtrasSummary();

    if (ui.includeHeadersFooters) {
        try {
            setStatus("Obrada: zaglavlja/podnožja...", "info");
            summary.headersFootersProcessed = await processHeadersFooters(context, opts);
        } catch (e) {
            console.warn("Header/Footer obrada nije uspela:", e);
        }
    }

    if (ui.includeFootnotes) {
        try {
            setStatus("Obrada: fusnote...", "info");
            const r = await processNotes(context, opts, "footnotes");
            summary.footnotesProcessed = r.processed;
            summary.footnotesSupported = r.supported;
        } catch (e) {
            console.warn("Footnotes obrada nije uspela:", e);
        }
    }

    if (ui.includeEndnotes) {
        try {
            setStatus("Obrada: endnote...", "info");
            const r = await processNotes(context, opts, "endnotes");
            summary.endnotesProcessed = r.processed;
            summary.endnotesSupported = r.supported;
        } catch (e) {
            console.warn("Endnotes obrada nije uspela:", e);
        }
    }

    return summary;
}

async function applyPipeline(
    context: Word.RequestContext,
    scope: "selection" | "document",
    ui: UiSettings,
    opts: OoxmlOptions
): Promise<{ result: OoxmlConvertResult | null; extras: ExtrasSummary }> {
    if (scope === "selection") {
        const range = context.document.getSelection();
        range.load("text");
        await context.sync();

        const rawText = range.text ?? "";
        const hasText = rawText.trim().length > 0;
        const isJustWhitespace = rawText.length > 0 && !hasText;

        if (!hasText) {
            showModalInfo("Greška", unsafeHtml("Nema selekcije za preslovljavanje."));
            return { result: null, extras: emptyExtrasSummary() };
        }
        if (isJustWhitespace) {
            showModalInfo("Greška", unsafeHtml("Selektovan je samo prazan prostor (razmaci)."));
            return { result: null, extras: emptyExtrasSummary() };
        }

        const result = await applyRangeWithOoxmlConversion(context, range, opts);
        return { result, extras: emptyExtrasSummary() };
    }

    const extras = await applyExtrasIfEnabled(context, ui, opts);

    if (ui.includeFootnotes && !extras.footnotesSupported) {
        showModalInfo(
            "Napomena",
            unsafeHtml(
                "Fusnote nisu dostupne za automatsku obradu u ovom Word okruženju. " +
                "I dalje možeš da selektuješ tekst u fusnoti i klikneš PRESLOVI."
            )
        );
    }

    if (ui.includeEndnotes && !extras.endnotesSupported) {
        showModalInfo(
            "Napomena",
            unsafeHtml(
                "Endnote nisu dostupne za automatsku obradu u ovom Word okruženju. " +
                "I dalje možeš da selektuješ tekst u endnoti i klikneš PRESLOVI."
            )
        );
    }

    const bodyRange = context.document.body.getRange("Whole");
    const result = await applyRangeWithOoxmlConversion(context, bodyRange, opts);
    return { result, extras };
}

/* =========================
   Public API
   ========================= */

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
            const opts = getOoxmlOptionsFromUi();

            // =========================
            // SELECTION: pokušaj cache apply (1:1 sa preview)
            // =========================
            if (scope === "selection") {
                const range = context.document.getSelection();
                const ooxml = range.getOoxml(); // NEW: hvata i formatiranje
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

                        invalidatePreviewCache();

                        showModalInfo(
                            "Cache je nevažeći",
                            unsafeHtml(
                                "Ne mogu da primenim sačuvani preview (selekcija je promenjena ili je cache istekao). " +
                                "Moguće je da je promenjen tekst ili formatiranje selekcije. Pokrećem ponovnu konverziju."
                            )
                        );
                    }
                }

                // fallback: ponovna konverzija selekcije
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

            // =========================
            // DOCUMENT: koristi pipeline
            // =========================
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