// @ts-nocheck
// src/taskpane/app/word/extras.ts
function stryNS_9fa48() {
    var g =
        (typeof globalThis === "object" && globalThis && globalThis.Math === Math && globalThis) ||
        new Function("return this")();
    var ns = g.__stryker__ || (g.__stryker__ = {});
    if (
        ns.activeMutant === undefined &&
        g.process &&
        g.process.env &&
        g.process.env.__STRYKER_ACTIVE_MUTANT__
    ) {
        ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
    }
    function retrieveNS() {
        return ns;
    }
    stryNS_9fa48 = retrieveNS;
    return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
    var ns = stryNS_9fa48();
    var cov =
        ns.mutantCoverage ||
        (ns.mutantCoverage = {
            static: {},
            perTest: {},
        });
    function cover() {
        var c = cov.static;
        if (ns.currentTestId) {
            c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
        }
        var a = arguments;
        for (var i = 0; i < a.length; i++) {
            c[a[i]] = (c[a[i]] || 0) + 1;
        }
    }
    stryCov_9fa48 = cover;
    cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
    var ns = stryNS_9fa48();
    function isActive(id) {
        if (ns.activeMutant === id) {
            if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
                throw new Error("Stryker: Hit count limit reached (" + ns.hitCount + ")");
            }
            return true;
        }
        return false;
    }
    stryMutAct_9fa48 = isActive;
    return isActive(id);
}
import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import type { UiSettings, ExtrasSummary } from "../types";
import { emptyExtrasSummary } from "../types";
import { setStatus } from "../status";
import { processHeadersFooters } from "./headersFooters";
import { processNotes } from "./notes";
import { t } from "../../../shared/i18n";
export async function applyExtrasIfEnabled(
    context: Word.RequestContext,
    ui: UiSettings,
    opts: OoxmlOptions
): Promise<ExtrasSummary> {
    if (stryMutAct_9fa48("8531")) {
        {
        }
    } else {
        stryCov_9fa48("8531");
        const summary = emptyExtrasSummary();
        if (
            stryMutAct_9fa48("8533")
                ? false
                : stryMutAct_9fa48("8532")
                  ? true
                  : (stryCov_9fa48("8532", "8533"), ui.includeHeadersFooters)
        ) {
            if (stryMutAct_9fa48("8534")) {
                {
                }
            } else {
                stryCov_9fa48("8534");
                try {
                    if (stryMutAct_9fa48("8535")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8535");
                        setStatus(
                            t(
                                stryMutAct_9fa48("8536")
                                    ? ""
                                    : (stryCov_9fa48("8536"), "status_processing_headers_footers")
                            ),
                            stryMutAct_9fa48("8537") ? "" : (stryCov_9fa48("8537"), "info")
                        );
                        summary.headersFootersProcessed = await processHeadersFooters(context, opts);
                    }
                } catch (e) {
                    if (stryMutAct_9fa48("8538")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8538");
                        console.warn(
                            stryMutAct_9fa48("8539")
                                ? ""
                                : (stryCov_9fa48("8539"), "Header/Footer obrada nije uspela:"),
                            e
                        );
                    }
                }
            }
        }
        if (
            stryMutAct_9fa48("8541")
                ? false
                : stryMutAct_9fa48("8540")
                  ? true
                  : (stryCov_9fa48("8540", "8541"), ui.includeFootnotes)
        ) {
            if (stryMutAct_9fa48("8542")) {
                {
                }
            } else {
                stryCov_9fa48("8542");
                try {
                    if (stryMutAct_9fa48("8543")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8543");
                        setStatus(
                            t(
                                stryMutAct_9fa48("8544")
                                    ? ""
                                    : (stryCov_9fa48("8544"), "status_processing_footnotes")
                            ),
                            stryMutAct_9fa48("8545") ? "" : (stryCov_9fa48("8545"), "info")
                        );
                        const r = await processNotes(
                            context,
                            opts,
                            stryMutAct_9fa48("8546") ? "" : (stryCov_9fa48("8546"), "footnotes")
                        );
                        summary.footnotesProcessed = r.processed;
                        summary.footnotesSupported = r.supported;
                    }
                } catch (e) {
                    if (stryMutAct_9fa48("8547")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8547");
                        console.warn(
                            stryMutAct_9fa48("8548")
                                ? ""
                                : (stryCov_9fa48("8548"), "Footnotes obrada nije uspela:"),
                            e
                        );
                        summary.footnotesProcessed = 0;
                        summary.footnotesSupported = stryMutAct_9fa48("8549")
                            ? true
                            : (stryCov_9fa48("8549"), false);
                    }
                }
            }
        }
        if (
            stryMutAct_9fa48("8551")
                ? false
                : stryMutAct_9fa48("8550")
                  ? true
                  : (stryCov_9fa48("8550", "8551"), ui.includeEndnotes)
        ) {
            if (stryMutAct_9fa48("8552")) {
                {
                }
            } else {
                stryCov_9fa48("8552");
                try {
                    if (stryMutAct_9fa48("8553")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8553");
                        setStatus(
                            t(
                                stryMutAct_9fa48("8554")
                                    ? ""
                                    : (stryCov_9fa48("8554"), "status_processing_endnotes")
                            ),
                            stryMutAct_9fa48("8555") ? "" : (stryCov_9fa48("8555"), "info")
                        );
                        const r = await processNotes(
                            context,
                            opts,
                            stryMutAct_9fa48("8556") ? "" : (stryCov_9fa48("8556"), "endnotes")
                        );
                        summary.endnotesProcessed = r.processed;
                        summary.endnotesSupported = r.supported;
                    }
                } catch (e) {
                    if (stryMutAct_9fa48("8557")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8557");
                        console.warn(
                            stryMutAct_9fa48("8558")
                                ? ""
                                : (stryCov_9fa48("8558"), "Endnotes obrada nije uspela:"),
                            e
                        );
                        summary.endnotesProcessed = 0;
                        summary.endnotesSupported = stryMutAct_9fa48("8559")
                            ? true
                            : (stryCov_9fa48("8559"), false);
                    }
                }
            }
        }
        return summary;
    }
}
