// @ts-nocheck
// src/taskpane/app/word/headersFooters.ts
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
export async function processHeadersFooters(
    context: Word.RequestContext,
    opts: OoxmlOptions
): Promise<number> {
    if (stryMutAct_9fa48("8560")) {
        {
        }
    } else {
        stryCov_9fa48("8560");
        let processed = 0;
        const sections = context.document.sections;
        sections.load(stryMutAct_9fa48("8561") ? "" : (stryCov_9fa48("8561"), "items"));
        await context.sync();
        const types: Word.HeaderFooterType[] = stryMutAct_9fa48("8562")
            ? []
            : (stryCov_9fa48("8562"),
              [
                  Word.HeaderFooterType.primary,
                  Word.HeaderFooterType.firstPage,
                  Word.HeaderFooterType.evenPages,
              ]);
        type OoxmlResult = ReturnType<Word.Range["getOoxml"]>;
        type Req = {
            range: Word.Range;
            ooxml: OoxmlResult;
        };
        const reqs: Req[] = stryMutAct_9fa48("8563") ? ["Stryker was here"] : (stryCov_9fa48("8563"), []);
        for (const sec of sections.items) {
            if (stryMutAct_9fa48("8564")) {
                {
                }
            } else {
                stryCov_9fa48("8564");
                for (const t of types) {
                    if (stryMutAct_9fa48("8565")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8565");
                        try {
                            if (stryMutAct_9fa48("8566")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8566");
                                const r = sec.getHeader(t).getRange();
                                const o = r.getOoxml();
                                reqs.push(
                                    stryMutAct_9fa48("8567")
                                        ? {}
                                        : (stryCov_9fa48("8567"),
                                          {
                                              range: r,
                                              ooxml: o,
                                          })
                                );
                            }
                        } catch {
                            // ignore (header might not exist in this context)
                        }
                        try {
                            if (stryMutAct_9fa48("8568")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8568");
                                const r = sec.getFooter(t).getRange();
                                const o = r.getOoxml();
                                reqs.push(
                                    stryMutAct_9fa48("8569")
                                        ? {}
                                        : (stryCov_9fa48("8569"),
                                          {
                                              range: r,
                                              ooxml: o,
                                          })
                                );
                            }
                        } catch {
                            // ignore (footer might not exist in this context)
                        }
                    }
                }
            }
        }
        await context.sync();
        for (const req of reqs) {
            if (stryMutAct_9fa48("8570")) {
                {
                }
            } else {
                stryCov_9fa48("8570");
                const xmlIn = req.ooxml.value;
                if (
                    stryMutAct_9fa48("8573")
                        ? false
                        : stryMutAct_9fa48("8572")
                          ? true
                          : stryMutAct_9fa48("8571")
                            ? xmlIn
                            : (stryCov_9fa48("8571", "8572", "8573"), !xmlIn)
                )
                    continue;
                const res = convertOoxml(xmlIn, opts);
                if (
                    stryMutAct_9fa48("8576")
                        ? res.type !== "Nema teksta"
                        : stryMutAct_9fa48("8575")
                          ? false
                          : stryMutAct_9fa48("8574")
                            ? true
                            : (stryCov_9fa48("8574", "8575", "8576"),
                              res.type ===
                                  (stryMutAct_9fa48("8577") ? "" : (stryCov_9fa48("8577"), "Nema teksta")))
                )
                    continue;
                req.range.insertOoxml(res.xml, Word.InsertLocation.replace);
                stryMutAct_9fa48("8578") ? processed-- : (stryCov_9fa48("8578"), processed++);
            }
        }
        if (
            stryMutAct_9fa48("8582")
                ? processed <= 0
                : stryMutAct_9fa48("8581")
                  ? processed >= 0
                  : stryMutAct_9fa48("8580")
                    ? false
                    : stryMutAct_9fa48("8579")
                      ? true
                      : (stryCov_9fa48("8579", "8580", "8581", "8582"), processed > 0)
        )
            await context.sync();
        return processed;
    }
}
