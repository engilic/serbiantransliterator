// @ts-nocheck
// src/taskpane/app/word/notes.ts
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
export async function processNotes(
    context: Word.RequestContext,
    opts: OoxmlOptions,
    kind: "footnotes" | "endnotes"
): Promise<{
    processed: number;
    supported: boolean;
}> {
    if (stryMutAct_9fa48("8583")) {
        {
        }
    } else {
        stryCov_9fa48("8583");
        let processed = 0;
        const docAny = context.document as {
            footnotes?: {
                load: (props: string) => void;
                items: unknown[];
            };
            endnotes?: {
                load: (props: string) => void;
                items: unknown[];
            };
        };
        const bodyAny = context.document.body as {
            footnotes?: {
                load: (props: string) => void;
                items: unknown[];
            };
            endnotes?: {
                load: (props: string) => void;
                items: unknown[];
            };
        };
        const coll = stryMutAct_9fa48("8584")
            ? bodyAny?.[kind] && docAny?.[kind]
            : (stryCov_9fa48("8584"),
              (stryMutAct_9fa48("8585") ? bodyAny[kind] : (stryCov_9fa48("8585"), bodyAny?.[kind])) ??
                  (stryMutAct_9fa48("8586") ? docAny[kind] : (stryCov_9fa48("8586"), docAny?.[kind])));
        if (
            stryMutAct_9fa48("8589")
                ? !coll && typeof coll.load !== "function"
                : stryMutAct_9fa48("8588")
                  ? false
                  : stryMutAct_9fa48("8587")
                    ? true
                    : (stryCov_9fa48("8587", "8588", "8589"),
                      (stryMutAct_9fa48("8590") ? coll : (stryCov_9fa48("8590"), !coll)) ||
                          (stryMutAct_9fa48("8592")
                              ? typeof coll.load === "function"
                              : stryMutAct_9fa48("8591")
                                ? false
                                : (stryCov_9fa48("8591", "8592"),
                                  typeof coll.load !==
                                      (stryMutAct_9fa48("8593") ? "" : (stryCov_9fa48("8593"), "function")))))
        ) {
            if (stryMutAct_9fa48("8594")) {
                {
                }
            } else {
                stryCov_9fa48("8594");
                return stryMutAct_9fa48("8595")
                    ? {}
                    : (stryCov_9fa48("8595"),
                      {
                          processed: 0,
                          supported: stryMutAct_9fa48("8596") ? true : (stryCov_9fa48("8596"), false),
                      });
            }
        }
        coll.load(stryMutAct_9fa48("8597") ? "" : (stryCov_9fa48("8597"), "items"));
        await context.sync();
        type OoxmlResult = ReturnType<Word.Range["getOoxml"]>;
        type Req = {
            range: Word.Range;
            ooxml: OoxmlResult;
        };
        const reqs: Req[] = stryMutAct_9fa48("8598") ? ["Stryker was here"] : (stryCov_9fa48("8598"), []);
        const items: unknown[] = stryMutAct_9fa48("8599")
            ? coll.items && []
            : (stryCov_9fa48("8599"),
              coll.items ?? (stryMutAct_9fa48("8600") ? ["Stryker was here"] : (stryCov_9fa48("8600"), [])));
        for (const item of items) {
            if (stryMutAct_9fa48("8601")) {
                {
                }
            } else {
                stryCov_9fa48("8601");
                let r: Word.Range | null = null;
                try {
                    if (stryMutAct_9fa48("8602")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8602");
                        const itemWithRange = item as {
                            getRange?: () => Word.Range;
                            body?: {
                                getRange?: (type: string) => Word.Range;
                            };
                            contentRange?: Word.Range;
                        };
                        if (
                            stryMutAct_9fa48("8605")
                                ? typeof itemWithRange.getRange !== "function"
                                : stryMutAct_9fa48("8604")
                                  ? false
                                  : stryMutAct_9fa48("8603")
                                    ? true
                                    : (stryCov_9fa48("8603", "8604", "8605"),
                                      typeof itemWithRange.getRange ===
                                          (stryMutAct_9fa48("8606")
                                              ? ""
                                              : (stryCov_9fa48("8606"), "function")))
                        ) {
                            if (stryMutAct_9fa48("8607")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8607");
                                r = itemWithRange.getRange();
                            }
                        } else if (
                            stryMutAct_9fa48("8610")
                                ? itemWithRange.body || typeof itemWithRange.body.getRange === "function"
                                : stryMutAct_9fa48("8609")
                                  ? false
                                  : stryMutAct_9fa48("8608")
                                    ? true
                                    : (stryCov_9fa48("8608", "8609", "8610"),
                                      itemWithRange.body &&
                                          (stryMutAct_9fa48("8612")
                                              ? typeof itemWithRange.body.getRange !== "function"
                                              : stryMutAct_9fa48("8611")
                                                ? true
                                                : (stryCov_9fa48("8611", "8612"),
                                                  typeof itemWithRange.body.getRange ===
                                                      (stryMutAct_9fa48("8613")
                                                          ? ""
                                                          : (stryCov_9fa48("8613"), "function")))))
                        ) {
                            if (stryMutAct_9fa48("8614")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8614");
                                r = itemWithRange.body.getRange(
                                    stryMutAct_9fa48("8615") ? "" : (stryCov_9fa48("8615"), "Whole")
                                );
                            }
                        } else if (
                            stryMutAct_9fa48("8617")
                                ? false
                                : stryMutAct_9fa48("8616")
                                  ? true
                                  : (stryCov_9fa48("8616", "8617"), itemWithRange.contentRange)
                        ) {
                            if (stryMutAct_9fa48("8618")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8618");
                                r = itemWithRange.contentRange;
                            }
                        }
                    }
                } catch {
                    if (stryMutAct_9fa48("8619")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8619");
                        // ignore (some note items might not expose range in this context)
                        r = null;
                    }
                }
                if (
                    stryMutAct_9fa48("8622")
                        ? false
                        : stryMutAct_9fa48("8621")
                          ? true
                          : stryMutAct_9fa48("8620")
                            ? r
                            : (stryCov_9fa48("8620", "8621", "8622"), !r)
                )
                    continue;
                try {
                    if (stryMutAct_9fa48("8623")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8623");
                        const o = r.getOoxml();
                        reqs.push(
                            stryMutAct_9fa48("8624")
                                ? {}
                                : (stryCov_9fa48("8624"),
                                  {
                                      range: r,
                                      ooxml: o,
                                  })
                        );
                    }
                } catch {
                    // ignore
                }
            }
        }
        await context.sync();
        for (const req of reqs) {
            if (stryMutAct_9fa48("8625")) {
                {
                }
            } else {
                stryCov_9fa48("8625");
                const xmlIn = req.ooxml.value;
                if (
                    stryMutAct_9fa48("8628")
                        ? false
                        : stryMutAct_9fa48("8627")
                          ? true
                          : stryMutAct_9fa48("8626")
                            ? xmlIn
                            : (stryCov_9fa48("8626", "8627", "8628"), !xmlIn)
                )
                    continue;
                const res = convertOoxml(xmlIn, opts);
                if (
                    stryMutAct_9fa48("8631")
                        ? res.type !== "Nema teksta"
                        : stryMutAct_9fa48("8630")
                          ? false
                          : stryMutAct_9fa48("8629")
                            ? true
                            : (stryCov_9fa48("8629", "8630", "8631"),
                              res.type ===
                                  (stryMutAct_9fa48("8632") ? "" : (stryCov_9fa48("8632"), "Nema teksta")))
                )
                    continue;
                req.range.insertOoxml(res.xml, Word.InsertLocation.replace);
                stryMutAct_9fa48("8633") ? processed-- : (stryCov_9fa48("8633"), processed++);
            }
        }
        if (
            stryMutAct_9fa48("8637")
                ? processed <= 0
                : stryMutAct_9fa48("8636")
                  ? processed >= 0
                  : stryMutAct_9fa48("8635")
                    ? false
                    : stryMutAct_9fa48("8634")
                      ? true
                      : (stryCov_9fa48("8634", "8635", "8636", "8637"), processed > 0)
        )
            await context.sync();
        return stryMutAct_9fa48("8638")
            ? {}
            : (stryCov_9fa48("8638"),
              {
                  processed,
                  supported: stryMutAct_9fa48("8639") ? false : (stryCov_9fa48("8639"), true),
              });
    }
}
