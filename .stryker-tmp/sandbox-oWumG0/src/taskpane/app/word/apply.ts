// @ts-nocheck
// src/taskpane/app/word/apply.ts
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
    if (stryMutAct_9fa48("8224")) {
        {
        }
    } else {
        stryCov_9fa48("8224");
        if (
            stryMutAct_9fa48("8227")
                ? Object.keys(skippedByReason).length !== 0
                : stryMutAct_9fa48("8226")
                  ? false
                  : stryMutAct_9fa48("8225")
                    ? true
                    : (stryCov_9fa48("8225", "8226", "8227"), Object.keys(skippedByReason).length === 0)
        )
            return;
        logger.warn(
            stryMutAct_9fa48("8228") ? "" : (stryCov_9fa48("8228"), "[Telemetry] Skipped runs detected:"),
            skippedByReason
        );
    }
}
function reasonToSerbian(reason: PreviewCacheDecisionReason): string {
    if (stryMutAct_9fa48("8229")) {
        {
        }
    } else {
        stryCov_9fa48("8229");
        switch (reason) {
            case stryMutAct_9fa48("8231") ? "" : (stryCov_9fa48("8231"), "optsChanged"):
                if (stryMutAct_9fa48("8230")) {
                } else {
                    stryCov_9fa48("8230");
                    return t(stryMutAct_9fa48("8232") ? "" : (stryCov_9fa48("8232"), "reason_opts_changed"));
                }
            case stryMutAct_9fa48("8234") ? "" : (stryCov_9fa48("8234"), "expired"):
                if (stryMutAct_9fa48("8233")) {
                } else {
                    stryCov_9fa48("8233");
                    return t(stryMutAct_9fa48("8235") ? "" : (stryCov_9fa48("8235"), "reason_expired"));
                }
            case stryMutAct_9fa48("8237") ? "" : (stryCov_9fa48("8237"), "selectionTextChanged"):
                if (stryMutAct_9fa48("8236")) {
                } else {
                    stryCov_9fa48("8236");
                    return t(
                        stryMutAct_9fa48("8238") ? "" : (stryCov_9fa48("8238"), "reason_selection_changed")
                    );
                }
            case stryMutAct_9fa48("8240") ? "" : (stryCov_9fa48("8240"), "selectionOoxmlChanged"):
                if (stryMutAct_9fa48("8239")) {
                } else {
                    stryCov_9fa48("8239");
                    return t(
                        stryMutAct_9fa48("8241") ? "" : (stryCov_9fa48("8241"), "reason_formatting_changed")
                    );
                }
            case stryMutAct_9fa48("8243") ? "" : (stryCov_9fa48("8243"), "missing"):
                if (stryMutAct_9fa48("8242")) {
                } else {
                    stryCov_9fa48("8242");
                    return t(stryMutAct_9fa48("8244") ? "" : (stryCov_9fa48("8244"), "reason_missing"));
                }
            default:
                if (stryMutAct_9fa48("8245")) {
                } else {
                    stryCov_9fa48("8245");
                    return t(stryMutAct_9fa48("8246") ? "" : (stryCov_9fa48("8246"), "reason_unknown"));
                }
        }
    }
}
function buildDocumentExtraStatus(ui: UiSettings, extras: ExtrasSummary): string {
    if (stryMutAct_9fa48("8247")) {
        {
        }
    } else {
        stryCov_9fa48("8247");
        const parts: string[] = stryMutAct_9fa48("8248") ? ["Stryker was here"] : (stryCov_9fa48("8248"), []);
        if (
            stryMutAct_9fa48("8251")
                ? ui.includeHeadersFooters || extras.headersFootersProcessed > 0
                : stryMutAct_9fa48("8250")
                  ? false
                  : stryMutAct_9fa48("8249")
                    ? true
                    : (stryCov_9fa48("8249", "8250", "8251"),
                      ui.includeHeadersFooters &&
                          (stryMutAct_9fa48("8254")
                              ? extras.headersFootersProcessed <= 0
                              : stryMutAct_9fa48("8253")
                                ? extras.headersFootersProcessed >= 0
                                : stryMutAct_9fa48("8252")
                                  ? true
                                  : (stryCov_9fa48("8252", "8253", "8254"),
                                    extras.headersFootersProcessed > 0)))
        ) {
            if (stryMutAct_9fa48("8255")) {
                {
                }
            } else {
                stryCov_9fa48("8255");
                parts.push(
                    t(
                        stryMutAct_9fa48("8256")
                            ? ""
                            : (stryCov_9fa48("8256"), "status_extra_headers_footers"),
                        extras.headersFootersProcessed
                    )
                );
            }
        }
        if (
            stryMutAct_9fa48("8259")
                ? ui.includeFootnotes || extras.footnotesSupported === false
                : stryMutAct_9fa48("8258")
                  ? false
                  : stryMutAct_9fa48("8257")
                    ? true
                    : (stryCov_9fa48("8257", "8258", "8259"),
                      ui.includeFootnotes &&
                          (stryMutAct_9fa48("8261")
                              ? extras.footnotesSupported !== false
                              : stryMutAct_9fa48("8260")
                                ? true
                                : (stryCov_9fa48("8260", "8261"),
                                  extras.footnotesSupported ===
                                      (stryMutAct_9fa48("8262") ? true : (stryCov_9fa48("8262"), false)))))
        ) {
            if (stryMutAct_9fa48("8263")) {
                {
                }
            } else {
                stryCov_9fa48("8263");
                parts.push(
                    t(stryMutAct_9fa48("8264") ? "" : (stryCov_9fa48("8264"), "status_extra_footnotes_na"))
                );
            }
        }
        if (
            stryMutAct_9fa48("8267")
                ? ui.includeEndnotes || extras.endnotesSupported === false
                : stryMutAct_9fa48("8266")
                  ? false
                  : stryMutAct_9fa48("8265")
                    ? true
                    : (stryCov_9fa48("8265", "8266", "8267"),
                      ui.includeEndnotes &&
                          (stryMutAct_9fa48("8269")
                              ? extras.endnotesSupported !== false
                              : stryMutAct_9fa48("8268")
                                ? true
                                : (stryCov_9fa48("8268", "8269"),
                                  extras.endnotesSupported ===
                                      (stryMutAct_9fa48("8270") ? true : (stryCov_9fa48("8270"), false)))))
        ) {
            if (stryMutAct_9fa48("8271")) {
                {
                }
            } else {
                stryCov_9fa48("8271");
                parts.push(
                    t(stryMutAct_9fa48("8272") ? "" : (stryCov_9fa48("8272"), "status_extra_endnotes_na"))
                );
            }
        }
        return parts.length
            ? (stryMutAct_9fa48("8273") ? "" : (stryCov_9fa48("8273"), " | ")) +
                  parts.join(stryMutAct_9fa48("8274") ? "" : (stryCov_9fa48("8274"), " | "))
            : stryMutAct_9fa48("8275")
              ? "Stryker was here!"
              : (stryCov_9fa48("8275"), "");
    }
}
export async function runSmart() {
    if (stryMutAct_9fa48("8276")) {
        {
        }
    } else {
        stryCov_9fa48("8276");
        try {
            if (stryMutAct_9fa48("8277")) {
                {
                }
            } else {
                stryCov_9fa48("8277");
                await Word.run(async (context) => {
                    if (stryMutAct_9fa48("8278")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8278");
                        const sel = context.document.getSelection();
                        sel.load(stryMutAct_9fa48("8279") ? "" : (stryCov_9fa48("8279"), "text"));
                        await context.sync();
                        const selInfo = analyzeSelectionText(sel.text);
                        if (
                            stryMutAct_9fa48("8281")
                                ? false
                                : stryMutAct_9fa48("8280")
                                  ? true
                                  : (stryCov_9fa48("8280", "8281"), selInfo.isJustWhitespace)
                        ) {
                            if (stryMutAct_9fa48("8282")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8282");
                                showModalInfo(
                                    t(
                                        stryMutAct_9fa48("8283")
                                            ? ""
                                            : (stryCov_9fa48("8283"), "modal_title_error")
                                    ),
                                    unsafeHtml(
                                        t(
                                            stryMutAct_9fa48("8284")
                                                ? ""
                                                : (stryCov_9fa48("8284"), "msg_empty_selection")
                                        )
                                    )
                                );
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("8285")
                                            ? ""
                                            : (stryCov_9fa48("8285"), "status_error_prefix"),
                                        t(
                                            stryMutAct_9fa48("8286")
                                                ? ""
                                                : (stryCov_9fa48("8286"), "msg_empty_selection")
                                        ).split(
                                            stryMutAct_9fa48("8287") ? "" : (stryCov_9fa48("8287"), "<")
                                        )[0]
                                    ),
                                    stryMutAct_9fa48("8288") ? "" : (stryCov_9fa48("8288"), "error")
                                );
                                return;
                            }
                        }
                        const scope: "selection" | "document" = selInfo.hasText
                            ? stryMutAct_9fa48("8289")
                                ? ""
                                : (stryCov_9fa48("8289"), "selection")
                            : stryMutAct_9fa48("8290")
                              ? ""
                              : (stryCov_9fa48("8290"), "document");
                        const ui = getSettingsFromUi();
                        const opts = getOoxmlOptionsFromUi();
                        if (
                            stryMutAct_9fa48("8293")
                                ? scope === "document" || ui.confirmWholeDoc
                                : stryMutAct_9fa48("8292")
                                  ? false
                                  : stryMutAct_9fa48("8291")
                                    ? true
                                    : (stryCov_9fa48("8291", "8292", "8293"),
                                      (stryMutAct_9fa48("8295")
                                          ? scope !== "document"
                                          : stryMutAct_9fa48("8294")
                                            ? true
                                            : (stryCov_9fa48("8294", "8295"),
                                              scope ===
                                                  (stryMutAct_9fa48("8296")
                                                      ? ""
                                                      : (stryCov_9fa48("8296"), "document")))) &&
                                          ui.confirmWholeDoc)
                        ) {
                            if (stryMutAct_9fa48("8297")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8297");
                                const ok = await confirmInPanel(
                                    unsafeHtml(
                                        t(
                                            stryMutAct_9fa48("8298")
                                                ? ""
                                                : (stryCov_9fa48("8298"), "msg_confirm_whole_doc")
                                        )
                                    )
                                );
                                if (
                                    stryMutAct_9fa48("8301")
                                        ? false
                                        : stryMutAct_9fa48("8300")
                                          ? true
                                          : stryMutAct_9fa48("8299")
                                            ? ok
                                            : (stryCov_9fa48("8299", "8300", "8301"), !ok)
                                ) {
                                    if (stryMutAct_9fa48("8302")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("8302");
                                        setStatus(
                                            t(
                                                stryMutAct_9fa48("8303")
                                                    ? ""
                                                    : (stryCov_9fa48("8303"), "status_cancelled")
                                            ),
                                            stryMutAct_9fa48("8304") ? "" : (stryCov_9fa48("8304"), "neutral")
                                        );
                                        return;
                                    }
                                }
                            }
                        }
                        const { result, extras } = await applyPipeline(context, scope, ui, opts);
                        if (
                            stryMutAct_9fa48("8307")
                                ? false
                                : stryMutAct_9fa48("8306")
                                  ? true
                                  : stryMutAct_9fa48("8305")
                                    ? result
                                    : (stryCov_9fa48("8305", "8306", "8307"), !result)
                        ) {
                            if (stryMutAct_9fa48("8308")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8308");
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("8309")
                                            ? ""
                                            : (stryCov_9fa48("8309"), "status_no_text_found")
                                    ),
                                    stryMutAct_9fa48("8310") ? "" : (stryCov_9fa48("8310"), "neutral")
                                );
                                return;
                            }
                        }
                        if (
                            stryMutAct_9fa48("8313")
                                ? result.stats.proofing.skippedByReason
                                : stryMutAct_9fa48("8312")
                                  ? false
                                  : stryMutAct_9fa48("8311")
                                    ? true
                                    : (stryCov_9fa48("8311", "8312", "8313"),
                                      result.stats.proofing?.skippedByReason)
                        ) {
                            if (stryMutAct_9fa48("8314")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8314");
                                logTelemetrySkippedRuns(result.stats.proofing.skippedByReason);
                            }
                        }
                        const time = (
                            stryMutAct_9fa48("8315")
                                ? result.stats.timingMs && 0
                                : (stryCov_9fa48("8315"), result.stats.timingMs ?? 0)
                        ).toFixed(0);
                        if (
                            stryMutAct_9fa48("8318")
                                ? scope !== "selection"
                                : stryMutAct_9fa48("8317")
                                  ? false
                                  : stryMutAct_9fa48("8316")
                                    ? true
                                    : (stryCov_9fa48("8316", "8317", "8318"),
                                      scope ===
                                          (stryMutAct_9fa48("8319")
                                              ? ""
                                              : (stryCov_9fa48("8319"), "selection")))
                        ) {
                            if (stryMutAct_9fa48("8320")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8320");
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("8321")
                                            ? ""
                                            : (stryCov_9fa48("8321"), "status_done_selection"),
                                        result.type,
                                        time
                                    ),
                                    stryMutAct_9fa48("8322") ? "" : (stryCov_9fa48("8322"), "success")
                                );
                            }
                        } else {
                            if (stryMutAct_9fa48("8323")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8323");
                                const extraInfo = buildDocumentExtraStatus(ui, extras);
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("8324")
                                            ? ""
                                            : (stryCov_9fa48("8324"), "status_done_document"),
                                        result.type,
                                        time,
                                        extraInfo
                                    ),
                                    stryMutAct_9fa48("8325") ? "" : (stryCov_9fa48("8325"), "success")
                                );
                            }
                        }
                        state.lastStatsText = buildApplyStatsText(result, scope, extras);
                        refreshStats();
                    }
                });
            }
        } catch (e) {
            if (stryMutAct_9fa48("8326")) {
                {
                }
            } else {
                stryCov_9fa48("8326");
                await errorRecovery.handle(
                    e,
                    stryMutAct_9fa48("8327")
                        ? {}
                        : (stryCov_9fa48("8327"),
                          {
                              operation: stryMutAct_9fa48("8328") ? "" : (stryCov_9fa48("8328"), "runSmart"),
                          })
                );
            }
        }
    }
}
export async function applyFromPreview(scope: "selection" | "document") {
    if (stryMutAct_9fa48("8329")) {
        {
        }
    } else {
        stryCov_9fa48("8329");
        try {
            if (stryMutAct_9fa48("8330")) {
                {
                }
            } else {
                stryCov_9fa48("8330");
                await Word.run(async (context) => {
                    if (stryMutAct_9fa48("8331")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8331");
                        const ui = getSettingsFromUi();
                        const opts: OoxmlOptions = getOoxmlOptionsFromUi();
                        const interactive = state.preview.interactiveDiff;
                        const hasManualChanges = stryMutAct_9fa48("8334")
                            ? interactive || interactive.hasRejections()
                            : stryMutAct_9fa48("8333")
                              ? false
                              : stryMutAct_9fa48("8332")
                                ? true
                                : (stryCov_9fa48("8332", "8333", "8334"),
                                  interactive && interactive.hasRejections());
                        if (
                            stryMutAct_9fa48("8337")
                                ? scope !== "selection"
                                : stryMutAct_9fa48("8336")
                                  ? false
                                  : stryMutAct_9fa48("8335")
                                    ? true
                                    : (stryCov_9fa48("8335", "8336", "8337"),
                                      scope ===
                                          (stryMutAct_9fa48("8338")
                                              ? ""
                                              : (stryCov_9fa48("8338"), "selection")))
                        ) {
                            if (stryMutAct_9fa48("8339")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8339");
                                const range = context.document.getSelection();
                                if (
                                    stryMutAct_9fa48("8341")
                                        ? false
                                        : stryMutAct_9fa48("8340")
                                          ? true
                                          : (stryCov_9fa48("8340", "8341"), hasManualChanges)
                                ) {
                                    if (stryMutAct_9fa48("8342")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("8342");
                                        const finalCustomText = interactive!.buildResult();
                                        setStatus(
                                            t(
                                                stryMutAct_9fa48("8343")
                                                    ? ""
                                                    : (stryCov_9fa48("8343"), "status_applying_preview")
                                            ),
                                            stryMutAct_9fa48("8344") ? "" : (stryCov_9fa48("8344"), "info")
                                        );
                                        range.insertText(finalCustomText, Word.InsertLocation.replace);
                                        await context.sync();
                                        setStatus(
                                            t(
                                                stryMutAct_9fa48("8345")
                                                    ? ""
                                                    : (stryCov_9fa48("8345"), "status_preview_applied")
                                            ) +
                                                (stryMutAct_9fa48("8346")
                                                    ? ""
                                                    : (stryCov_9fa48("8346"), " (Plain Text)")),
                                            stryMutAct_9fa48("8347") ? "" : (stryCov_9fa48("8347"), "success")
                                        );
                                        state.lastStatsText = stryMutAct_9fa48("8348")
                                            ? ""
                                            : (stryCov_9fa48("8348"), "Primenjene ručne izmene.");
                                        refreshStats();
                                        return;
                                    }
                                }
                                const ooxml = range.getOoxml();
                                range.load(stryMutAct_9fa48("8349") ? "" : (stryCov_9fa48("8349"), "text"));
                                await context.sync();
                                const info = analyzeSelectionText(range.text);
                                if (
                                    stryMutAct_9fa48("8352")
                                        ? false
                                        : stryMutAct_9fa48("8351")
                                          ? true
                                          : stryMutAct_9fa48("8350")
                                            ? info.hasText
                                            : (stryCov_9fa48("8350", "8351", "8352"), !info.hasText)
                                ) {
                                    if (stryMutAct_9fa48("8353")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("8353");
                                        showModalInfo(
                                            t(
                                                stryMutAct_9fa48("8354")
                                                    ? ""
                                                    : (stryCov_9fa48("8354"), "modal_title_error")
                                            ),
                                            unsafeHtml(
                                                t(
                                                    stryMutAct_9fa48("8355")
                                                        ? ""
                                                        : (stryCov_9fa48("8355"), "msg_no_selection")
                                                )
                                            )
                                        );
                                        return;
                                    }
                                }
                                if (
                                    stryMutAct_9fa48("8357")
                                        ? false
                                        : stryMutAct_9fa48("8356")
                                          ? true
                                          : (stryCov_9fa48("8356", "8357"), info.isJustWhitespace)
                                ) {
                                    if (stryMutAct_9fa48("8358")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("8358");
                                        showModalInfo(
                                            t(
                                                stryMutAct_9fa48("8359")
                                                    ? ""
                                                    : (stryCov_9fa48("8359"), "modal_title_error")
                                            ),
                                            unsafeHtml(
                                                t(
                                                    stryMutAct_9fa48("8360")
                                                        ? ""
                                                        : (stryCov_9fa48("8360"), "msg_empty_selection")
                                                )
                                            )
                                        );
                                        return;
                                    }
                                }
                                const normApply = normalizeForSelectionHash(info.raw);
                                const currentSelectionHash = await sha256Hex(normApply);
                                const currentOoxml = stryMutAct_9fa48("8361")
                                    ? ooxml.value && ""
                                    : (stryCov_9fa48("8361"),
                                      ooxml.value ??
                                          (stryMutAct_9fa48("8362")
                                              ? "Stryker was here!"
                                              : (stryCov_9fa48("8362"), "")));
                                const currentOoxmlHash = await sha256Hex(
                                    currentOoxml.normalize(
                                        stryMutAct_9fa48("8363") ? "" : (stryCov_9fa48("8363"), "NFC")
                                    )
                                );
                                const currentJson = JSON.stringify(opts);
                                const decision = decidePreviewCacheReuse(
                                    stryMutAct_9fa48("8364")
                                        ? {}
                                        : (stryCov_9fa48("8364"),
                                          {
                                              snapshot: stryMutAct_9fa48("8365")
                                                  ? {}
                                                  : (stryCov_9fa48("8365"),
                                                    {
                                                        convertedOoxml: state.preview.convertedOoxml,
                                                        ooxmlOptsSnapJson: state.preview.ooxmlOptsSnapJson,
                                                        selectionTextHash: state.preview.selectionTextHash,
                                                        selectionOoxmlHash: state.preview.selectionOoxmlHash,
                                                        cacheTimestamp: state.preview.cacheTimestamp,
                                                    }),
                                              current: stryMutAct_9fa48("8366")
                                                  ? {}
                                                  : (stryCov_9fa48("8366"),
                                                    {
                                                        currentOptsJson: currentJson,
                                                        currentSelectionTextHash: currentSelectionHash,
                                                        currentSelectionOoxmlHash: currentOoxmlHash,
                                                    }),
                                              nowMs: Date.now(),
                                              ttlMs: PREVIEW_CACHE_TTL_MS,
                                          })
                                );
                                if (
                                    stryMutAct_9fa48("8368")
                                        ? false
                                        : stryMutAct_9fa48("8367")
                                          ? true
                                          : (stryCov_9fa48("8367", "8368"), decision.ok)
                                ) {
                                    if (stryMutAct_9fa48("8369")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("8369");
                                        setStatus(
                                            t(
                                                stryMutAct_9fa48("8370")
                                                    ? ""
                                                    : (stryCov_9fa48("8370"), "status_applying_preview")
                                            ),
                                            stryMutAct_9fa48("8371") ? "" : (stryCov_9fa48("8371"), "info")
                                        );
                                        range.insertOoxml(
                                            state.preview.convertedOoxml!,
                                            Word.InsertLocation.replace
                                        );
                                        await context.sync();
                                        setStatus(
                                            t(
                                                stryMutAct_9fa48("8372")
                                                    ? ""
                                                    : (stryCov_9fa48("8372"), "status_preview_applied")
                                            ),
                                            stryMutAct_9fa48("8373") ? "" : (stryCov_9fa48("8373"), "success")
                                        );
                                        const s = buildPreviewAppliedStats();
                                        state.lastStatsText = s.text;
                                        refreshStats();
                                        return;
                                    }
                                }
                                if (
                                    stryMutAct_9fa48("8376")
                                        ? decision.reason === "missing"
                                        : stryMutAct_9fa48("8375")
                                          ? false
                                          : stryMutAct_9fa48("8374")
                                            ? true
                                            : (stryCov_9fa48("8374", "8375", "8376"),
                                              decision.reason !==
                                                  (stryMutAct_9fa48("8377")
                                                      ? ""
                                                      : (stryCov_9fa48("8377"), "missing")))
                                ) {
                                    if (stryMutAct_9fa48("8378")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("8378");
                                        invalidatePreviewCache();
                                        setStatus(
                                            t(
                                                stryMutAct_9fa48("8379")
                                                    ? ""
                                                    : (stryCov_9fa48("8379"), "status_preview_cache_invalid"),
                                                reasonToSerbian(decision.reason)
                                            ),
                                            stryMutAct_9fa48("8380") ? "" : (stryCov_9fa48("8380"), "info")
                                        );
                                    }
                                }
                                const { result } = await applyPipeline(
                                    context,
                                    stryMutAct_9fa48("8381") ? "" : (stryCov_9fa48("8381"), "selection"),
                                    ui,
                                    opts
                                );
                                if (
                                    stryMutAct_9fa48("8384")
                                        ? false
                                        : stryMutAct_9fa48("8383")
                                          ? true
                                          : stryMutAct_9fa48("8382")
                                            ? result
                                            : (stryCov_9fa48("8382", "8383", "8384"), !result)
                                ) {
                                    if (stryMutAct_9fa48("8385")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("8385");
                                        setStatus(
                                            t(
                                                stryMutAct_9fa48("8386")
                                                    ? ""
                                                    : (stryCov_9fa48("8386"), "status_no_text_found")
                                            ),
                                            stryMutAct_9fa48("8387") ? "" : (stryCov_9fa48("8387"), "neutral")
                                        );
                                        return;
                                    }
                                }
                                if (
                                    stryMutAct_9fa48("8390")
                                        ? result.stats.proofing.skippedByReason
                                        : stryMutAct_9fa48("8389")
                                          ? false
                                          : stryMutAct_9fa48("8388")
                                            ? true
                                            : (stryCov_9fa48("8388", "8389", "8390"),
                                              result.stats.proofing?.skippedByReason)
                                ) {
                                    if (stryMutAct_9fa48("8391")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("8391");
                                        logTelemetrySkippedRuns(result.stats.proofing.skippedByReason);
                                    }
                                }
                                const time = result.stats.timingMs.toFixed(0);
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("8392")
                                            ? ""
                                            : (stryCov_9fa48("8392"), "status_done_selection"),
                                        result.type,
                                        time
                                    ),
                                    stryMutAct_9fa48("8393") ? "" : (stryCov_9fa48("8393"), "success")
                                );
                                state.lastStatsText = buildApplyStatsText(
                                    result,
                                    stryMutAct_9fa48("8394") ? "" : (stryCov_9fa48("8394"), "selection")
                                );
                                refreshStats();
                                return;
                            }
                        }
                        const { result, extras } = await applyPipeline(
                            context,
                            stryMutAct_9fa48("8395") ? "" : (stryCov_9fa48("8395"), "document"),
                            ui,
                            opts
                        );
                        if (
                            stryMutAct_9fa48("8398")
                                ? false
                                : stryMutAct_9fa48("8397")
                                  ? true
                                  : stryMutAct_9fa48("8396")
                                    ? result
                                    : (stryCov_9fa48("8396", "8397", "8398"), !result)
                        ) {
                            if (stryMutAct_9fa48("8399")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8399");
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("8400")
                                            ? ""
                                            : (stryCov_9fa48("8400"), "status_no_text_found")
                                    ),
                                    stryMutAct_9fa48("8401") ? "" : (stryCov_9fa48("8401"), "neutral")
                                );
                                return;
                            }
                        }
                        if (
                            stryMutAct_9fa48("8404")
                                ? result.stats.proofing.skippedByReason
                                : stryMutAct_9fa48("8403")
                                  ? false
                                  : stryMutAct_9fa48("8402")
                                    ? true
                                    : (stryCov_9fa48("8402", "8403", "8404"),
                                      result.stats.proofing?.skippedByReason)
                        ) {
                            if (stryMutAct_9fa48("8405")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8405");
                                logTelemetrySkippedRuns(result.stats.proofing.skippedByReason);
                            }
                        }
                        const time = result.stats.timingMs.toFixed(0);
                        const extraInfo = buildDocumentExtraStatus(ui, extras);
                        setStatus(
                            t(
                                stryMutAct_9fa48("8406")
                                    ? ""
                                    : (stryCov_9fa48("8406"), "status_done_document"),
                                result.type,
                                time,
                                extraInfo
                            ),
                            stryMutAct_9fa48("8407") ? "" : (stryCov_9fa48("8407"), "success")
                        );
                        state.lastStatsText = buildApplyStatsText(
                            result,
                            stryMutAct_9fa48("8408") ? "" : (stryCov_9fa48("8408"), "document"),
                            extras
                        );
                        refreshStats();
                    }
                });
            }
        } catch (e) {
            if (stryMutAct_9fa48("8409")) {
                {
                }
            } else {
                stryCov_9fa48("8409");
                await errorRecovery.handle(
                    e,
                    stryMutAct_9fa48("8410")
                        ? {}
                        : (stryCov_9fa48("8410"),
                          {
                              operation: stryMutAct_9fa48("8411")
                                  ? ""
                                  : (stryCov_9fa48("8411"), "applyFromPreview"),
                          })
                );
            }
        }
    }
}
