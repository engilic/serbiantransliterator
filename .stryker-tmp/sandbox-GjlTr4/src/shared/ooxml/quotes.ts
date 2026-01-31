// @ts-nocheck
// src/shared/ooxml/quotes.ts
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
import { createInitialCodeState, transformQuotesRespectingCode } from "./code";
import { QUOTE_VARIANTS_RE, OPEN_QUOTE, CLOSE_QUOTE } from "./quoteConstants";
export function applySerbianQuotesAcrossNodes(textNodes: Element[], preserveCodeBlocks: boolean) {
    if (stryMutAct_9fa48("4370")) {
        {
        }
    } else {
        stryCov_9fa48("4370");
        if (
            stryMutAct_9fa48("4373")
                ? false
                : stryMutAct_9fa48("4372")
                  ? true
                  : stryMutAct_9fa48("4371")
                    ? preserveCodeBlocks
                    : (stryCov_9fa48("4371", "4372", "4373"), !preserveCodeBlocks)
        ) {
            if (stryMutAct_9fa48("4374")) {
                {
                }
            } else {
                stryCov_9fa48("4374");
                let open = stryMutAct_9fa48("4375") ? true : (stryCov_9fa48("4375"), false);
                for (const node of textNodes) {
                    if (stryMutAct_9fa48("4376")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4376");
                        const raw = stryMutAct_9fa48("4377")
                            ? node.textContent && ""
                            : (stryCov_9fa48("4377"),
                              node.textContent ??
                                  (stryMutAct_9fa48("4378")
                                      ? "Stryker was here!"
                                      : (stryCov_9fa48("4378"), "")));
                        if (
                            stryMutAct_9fa48("4381")
                                ? false
                                : stryMutAct_9fa48("4380")
                                  ? true
                                  : stryMutAct_9fa48("4379")
                                    ? raw
                                    : (stryCov_9fa48("4379", "4380", "4381"), !raw)
                        )
                            continue;
                        const normalized = raw.replace(
                            QUOTE_VARIANTS_RE,
                            stryMutAct_9fa48("4382") ? `` : (stryCov_9fa48("4382"), `"`)
                        );
                        let out = stryMutAct_9fa48("4383")
                            ? "Stryker was here!"
                            : (stryCov_9fa48("4383"), "");
                        for (const ch of normalized) {
                            if (stryMutAct_9fa48("4384")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("4384");
                                if (
                                    stryMutAct_9fa48("4387")
                                        ? ch !== `"`
                                        : stryMutAct_9fa48("4386")
                                          ? false
                                          : stryMutAct_9fa48("4385")
                                            ? true
                                            : (stryCov_9fa48("4385", "4386", "4387"),
                                              ch ===
                                                  (stryMutAct_9fa48("4388")
                                                      ? ``
                                                      : (stryCov_9fa48("4388"), `"`)))
                                ) {
                                    if (stryMutAct_9fa48("4389")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("4389");
                                        stryMutAct_9fa48("4390")
                                            ? (out -= open ? CLOSE_QUOTE : OPEN_QUOTE)
                                            : (stryCov_9fa48("4390"),
                                              (out += open ? CLOSE_QUOTE : OPEN_QUOTE));
                                        open = stryMutAct_9fa48("4391")
                                            ? open
                                            : (stryCov_9fa48("4391"), !open);
                                    }
                                } else {
                                    if (stryMutAct_9fa48("4392")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("4392");
                                        stryMutAct_9fa48("4393")
                                            ? (out -= ch)
                                            : (stryCov_9fa48("4393"), (out += ch));
                                    }
                                }
                            }
                        }
                        node.textContent = out;
                    }
                }
                return;
            }
        }
        const codeState = createInitialCodeState();
        const quoteState = stryMutAct_9fa48("4394")
            ? {}
            : (stryCov_9fa48("4394"),
              {
                  open: stryMutAct_9fa48("4395") ? true : (stryCov_9fa48("4395"), false),
              });
        for (const node of textNodes) {
            if (stryMutAct_9fa48("4396")) {
                {
                }
            } else {
                stryCov_9fa48("4396");
                const raw = stryMutAct_9fa48("4397")
                    ? node.textContent && ""
                    : (stryCov_9fa48("4397"),
                      node.textContent ??
                          (stryMutAct_9fa48("4398") ? "Stryker was here!" : (stryCov_9fa48("4398"), "")));
                if (
                    stryMutAct_9fa48("4401")
                        ? false
                        : stryMutAct_9fa48("4400")
                          ? true
                          : stryMutAct_9fa48("4399")
                            ? raw
                            : (stryCov_9fa48("4399", "4400", "4401"), !raw)
                )
                    continue;
                node.textContent = transformQuotesRespectingCode(raw, codeState, quoteState);
            }
        }
    }
}
