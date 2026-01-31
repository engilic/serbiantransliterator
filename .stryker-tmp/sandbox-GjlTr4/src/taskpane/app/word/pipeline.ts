// @ts-nocheck
// src/taskpane/app/word/pipeline.ts
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
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";
import type { UiSettings, ExtrasSummary } from "../types";
import { emptyExtrasSummary } from "../types";
import { showModalInfo } from "../modal/modal";
import { unsafeHtml } from "../../../shared/safeHtml";
import { applyExtrasIfEnabled } from "./extras";
import { setStatus } from "../status";
import { analyzeSelectionText } from "./selectionText";
import { t } from "../../../shared/i18n";
import { processDocumentInChunks } from "./chunking";
import { workerClient } from "../../worker/client";
const MAX_SELECTION_OOXML_SIZE = stryMutAct_9fa48("8640")
    ? (5 * 1024) / 1024
    : (stryCov_9fa48("8640"),
      (stryMutAct_9fa48("8641") ? 5 / 1024 : (stryCov_9fa48("8641"), 5 * 1024)) * 1024);
export type OoxmlConvertResult = ReturnType<typeof convertOoxml>;
async function applyRangeWithOoxmlConversion(
    context: Word.RequestContext,
    range: Word.Range,
    opts: OoxmlOptions
): Promise<OoxmlConvertResult | null> {
    if (stryMutAct_9fa48("8642")) {
        {
        }
    } else {
        stryCov_9fa48("8642");
        setStatus(
            t(stryMutAct_9fa48("8643") ? "" : (stryCov_9fa48("8643"), "status_processing")),
            stryMutAct_9fa48("8644") ? "" : (stryCov_9fa48("8644"), "info")
        );
        const ooxml = range.getOoxml();
        await context.sync();
        const rawXml = stryMutAct_9fa48("8645")
            ? ooxml.value && ""
            : (stryCov_9fa48("8645"),
              ooxml.value ?? (stryMutAct_9fa48("8646") ? "Stryker was here!" : (stryCov_9fa48("8646"), "")));
        if (
            stryMutAct_9fa48("8650")
                ? rawXml.length <= MAX_SELECTION_OOXML_SIZE
                : stryMutAct_9fa48("8649")
                  ? rawXml.length >= MAX_SELECTION_OOXML_SIZE
                  : stryMutAct_9fa48("8648")
                    ? false
                    : stryMutAct_9fa48("8647")
                      ? true
                      : (stryCov_9fa48("8647", "8648", "8649", "8650"),
                        rawXml.length > MAX_SELECTION_OOXML_SIZE)
        ) {
            if (stryMutAct_9fa48("8651")) {
                {
                }
            } else {
                stryCov_9fa48("8651");
                showModalInfo(
                    t(stryMutAct_9fa48("8652") ? "" : (stryCov_9fa48("8652"), "modal_title_error")),
                    unsafeHtml(
                        t(stryMutAct_9fa48("8653") ? "" : (stryCov_9fa48("8653"), "msg_doc_too_large"))
                    )
                );
                return null;
            }
        }
        const result = await workerClient.convert(rawXml, opts);
        if (
            stryMutAct_9fa48("8656")
                ? result.type !== "Nema teksta"
                : stryMutAct_9fa48("8655")
                  ? false
                  : stryMutAct_9fa48("8654")
                    ? true
                    : (stryCov_9fa48("8654", "8655", "8656"),
                      result.type ===
                          (stryMutAct_9fa48("8657") ? "" : (stryCov_9fa48("8657"), "Nema teksta")))
        )
            return null;
        range.insertOoxml(result.xml, Word.InsertLocation.replace);
        range.select();
        await context.sync();
        return result;
    }
}
export async function applyPipeline(
    context: Word.RequestContext,
    scope: "selection" | "document",
    ui: UiSettings,
    opts: OoxmlOptions
): Promise<{
    result: OoxmlConvertResult | null;
    extras: ExtrasSummary;
}> {
    if (stryMutAct_9fa48("8658")) {
        {
        }
    } else {
        stryCov_9fa48("8658");
        await workerClient.init();
        if (
            stryMutAct_9fa48("8661")
                ? scope !== "selection"
                : stryMutAct_9fa48("8660")
                  ? false
                  : stryMutAct_9fa48("8659")
                    ? true
                    : (stryCov_9fa48("8659", "8660", "8661"),
                      scope === (stryMutAct_9fa48("8662") ? "" : (stryCov_9fa48("8662"), "selection")))
        ) {
            if (stryMutAct_9fa48("8663")) {
                {
                }
            } else {
                stryCov_9fa48("8663");
                const range = context.document.getSelection();
                range.load(stryMutAct_9fa48("8664") ? "" : (stryCov_9fa48("8664"), "text"));
                await context.sync();
                const info = analyzeSelectionText(range.text);
                if (
                    stryMutAct_9fa48("8667")
                        ? !info.hasText && info.isJustWhitespace
                        : stryMutAct_9fa48("8666")
                          ? false
                          : stryMutAct_9fa48("8665")
                            ? true
                            : (stryCov_9fa48("8665", "8666", "8667"),
                              (stryMutAct_9fa48("8668")
                                  ? info.hasText
                                  : (stryCov_9fa48("8668"), !info.hasText)) || info.isJustWhitespace)
                ) {
                    if (stryMutAct_9fa48("8669")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8669");
                        showModalInfo(
                            t(stryMutAct_9fa48("8670") ? "" : (stryCov_9fa48("8670"), "modal_title_error")),
                            unsafeHtml(
                                t(stryMutAct_9fa48("8671") ? "" : (stryCov_9fa48("8671"), "msg_no_selection"))
                            )
                        );
                        return stryMutAct_9fa48("8672")
                            ? {}
                            : (stryCov_9fa48("8672"),
                              {
                                  result: null,
                                  extras: emptyExtrasSummary(),
                              });
                    }
                }
                const result = await applyRangeWithOoxmlConversion(context, range, opts);
                return stryMutAct_9fa48("8673")
                    ? {}
                    : (stryCov_9fa48("8673"),
                      {
                          result,
                          extras: emptyExtrasSummary(),
                      });
            }
        }
        const extras = await applyExtrasIfEnabled(context, ui, opts);
        const chunk = await processDocumentInChunks(context, opts);
        return stryMutAct_9fa48("8674")
            ? {}
            : (stryCov_9fa48("8674"),
              {
                  result: stryMutAct_9fa48("8675")
                      ? {}
                      : (stryCov_9fa48("8675"),
                        {
                            xml: stryMutAct_9fa48("8676") ? "Stryker was here!" : (stryCov_9fa48("8676"), ""),
                            type: chunk.type,
                            stats: chunk.stats,
                        }),
                  extras,
              });
    }
}
