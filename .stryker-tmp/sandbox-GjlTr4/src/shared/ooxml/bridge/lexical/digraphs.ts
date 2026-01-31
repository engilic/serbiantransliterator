// @ts-nocheck
// src/shared/ooxml/bridge/lexical/digraphs.ts
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
import { findNextNodeWithText, firstCp, lastCp, dropFirstCp, latinLetterSr } from "../../common";
export function bridgeDigraphsAcrossTextNodes(textNodes: Element[]): number {
    if (stryMutAct_9fa48("2464")) {
        {
        }
    } else {
        stryCov_9fa48("2464");
        let changed = 0;
        for (
            let i = 0;
            stryMutAct_9fa48("2467")
                ? i >= textNodes.length - 1
                : stryMutAct_9fa48("2466")
                  ? i <= textNodes.length - 1
                  : stryMutAct_9fa48("2465")
                    ? false
                    : (stryCov_9fa48("2465", "2466", "2467"),
                      i <
                          (stryMutAct_9fa48("2468")
                              ? textNodes.length + 1
                              : (stryCov_9fa48("2468"), textNodes.length - 1)));
            stryMutAct_9fa48("2469") ? i-- : (stryCov_9fa48("2469"), i++)
        ) {
            if (stryMutAct_9fa48("2470")) {
                {
                }
            } else {
                stryCov_9fa48("2470");
                const aNode = textNodes[i];
                if (
                    stryMutAct_9fa48("2473")
                        ? false
                        : stryMutAct_9fa48("2472")
                          ? true
                          : stryMutAct_9fa48("2471")
                            ? aNode
                            : (stryCov_9fa48("2471", "2472", "2473"), !aNode)
                )
                    continue;
                const aRaw = (
                    stryMutAct_9fa48("2474")
                        ? aNode.textContent && ""
                        : (stryCov_9fa48("2474"),
                          aNode.textContent ??
                              (stryMutAct_9fa48("2475") ? "Stryker was here!" : (stryCov_9fa48("2475"), "")))
                ).normalize(stryMutAct_9fa48("2476") ? "" : (stryCov_9fa48("2476"), "NFC"));
                if (
                    stryMutAct_9fa48("2479")
                        ? false
                        : stryMutAct_9fa48("2478")
                          ? true
                          : stryMutAct_9fa48("2477")
                            ? aRaw
                            : (stryCov_9fa48("2477", "2478", "2479"), !aRaw)
                )
                    continue;
                const j = findNextNodeWithText(
                    textNodes,
                    stryMutAct_9fa48("2480") ? i - 1 : (stryCov_9fa48("2480"), i + 1)
                );
                if (
                    stryMutAct_9fa48("2483")
                        ? j != null
                        : stryMutAct_9fa48("2482")
                          ? false
                          : stryMutAct_9fa48("2481")
                            ? true
                            : (stryCov_9fa48("2481", "2482", "2483"), j == null)
                )
                    continue;
                const bNode = textNodes[j];
                if (
                    stryMutAct_9fa48("2486")
                        ? false
                        : stryMutAct_9fa48("2485")
                          ? true
                          : stryMutAct_9fa48("2484")
                            ? bNode
                            : (stryCov_9fa48("2484", "2485", "2486"), !bNode)
                )
                    continue;
                const bRaw = (
                    stryMutAct_9fa48("2487")
                        ? bNode.textContent && ""
                        : (stryCov_9fa48("2487"),
                          bNode.textContent ??
                              (stryMutAct_9fa48("2488") ? "Stryker was here!" : (stryCov_9fa48("2488"), "")))
                ).normalize(stryMutAct_9fa48("2489") ? "" : (stryCov_9fa48("2489"), "NFC"));
                if (
                    stryMutAct_9fa48("2492")
                        ? false
                        : stryMutAct_9fa48("2491")
                          ? true
                          : stryMutAct_9fa48("2490")
                            ? bRaw
                            : (stryCov_9fa48("2490", "2491", "2492"), !bRaw)
                )
                    continue;
                if (
                    stryMutAct_9fa48("2494")
                        ? false
                        : stryMutAct_9fa48("2493")
                          ? true
                          : (stryCov_9fa48("2493", "2494"),
                            (stryMutAct_9fa48("2496")
                                ? /\S$/
                                : stryMutAct_9fa48("2495")
                                  ? /\s/
                                  : (stryCov_9fa48("2495", "2496"), /\s$/)
                            ).test(aRaw))
                )
                    continue;
                if (
                    stryMutAct_9fa48("2498")
                        ? false
                        : stryMutAct_9fa48("2497")
                          ? true
                          : (stryCov_9fa48("2497", "2498"),
                            (stryMutAct_9fa48("2500")
                                ? /^\S/
                                : stryMutAct_9fa48("2499")
                                  ? /\s/
                                  : (stryCov_9fa48("2499", "2500"), /^\s/)
                            ).test(bRaw))
                )
                    continue;
                const aLast = lastCp(aRaw);
                const bFirst = firstCp(bRaw);
                if (
                    stryMutAct_9fa48("2503")
                        ? !aLast && !bFirst
                        : stryMutAct_9fa48("2502")
                          ? false
                          : stryMutAct_9fa48("2501")
                            ? true
                            : (stryCov_9fa48("2501", "2502", "2503"),
                              (stryMutAct_9fa48("2504") ? aLast : (stryCov_9fa48("2504"), !aLast)) ||
                                  (stryMutAct_9fa48("2505") ? bFirst : (stryCov_9fa48("2505"), !bFirst)))
                )
                    continue;
                if (
                    stryMutAct_9fa48("2508")
                        ? !latinLetterSr(aLast) && !latinLetterSr(bFirst)
                        : stryMutAct_9fa48("2507")
                          ? false
                          : stryMutAct_9fa48("2506")
                            ? true
                            : (stryCov_9fa48("2506", "2507", "2508"),
                              (stryMutAct_9fa48("2509")
                                  ? latinLetterSr(aLast)
                                  : (stryCov_9fa48("2509"), !latinLetterSr(aLast))) ||
                                  (stryMutAct_9fa48("2510")
                                      ? latinLetterSr(bFirst)
                                      : (stryCov_9fa48("2510"), !latinLetterSr(bFirst))))
                )
                    continue;
                const pair = stryMutAct_9fa48("2511")
                    ? (aLast + bFirst).toUpperCase()
                    : (stryCov_9fa48("2511"),
                      (stryMutAct_9fa48("2512")
                          ? aLast - bFirst
                          : (stryCov_9fa48("2512"), aLast + bFirst)
                      ).toLowerCase());
                if (
                    stryMutAct_9fa48("2515")
                        ? (pair === "lj" || pair === "nj") && pair === "dž"
                        : stryMutAct_9fa48("2514")
                          ? false
                          : stryMutAct_9fa48("2513")
                            ? true
                            : (stryCov_9fa48("2513", "2514", "2515"),
                              (stryMutAct_9fa48("2517")
                                  ? pair === "lj" && pair === "nj"
                                  : stryMutAct_9fa48("2516")
                                    ? false
                                    : (stryCov_9fa48("2516", "2517"),
                                      (stryMutAct_9fa48("2519")
                                          ? pair !== "lj"
                                          : stryMutAct_9fa48("2518")
                                            ? false
                                            : (stryCov_9fa48("2518", "2519"),
                                              pair ===
                                                  (stryMutAct_9fa48("2520")
                                                      ? ""
                                                      : (stryCov_9fa48("2520"), "lj")))) ||
                                          (stryMutAct_9fa48("2522")
                                              ? pair !== "nj"
                                              : stryMutAct_9fa48("2521")
                                                ? false
                                                : (stryCov_9fa48("2521", "2522"),
                                                  pair ===
                                                      (stryMutAct_9fa48("2523")
                                                          ? ""
                                                          : (stryCov_9fa48("2523"), "nj")))))) ||
                                  (stryMutAct_9fa48("2525")
                                      ? pair !== "dž"
                                      : stryMutAct_9fa48("2524")
                                        ? false
                                        : (stryCov_9fa48("2524", "2525"),
                                          pair ===
                                              (stryMutAct_9fa48("2526")
                                                  ? ""
                                                  : (stryCov_9fa48("2526"), "dž")))))
                ) {
                    if (stryMutAct_9fa48("2527")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("2527");
                        aNode.textContent = stryMutAct_9fa48("2528")
                            ? aRaw - bFirst
                            : (stryCov_9fa48("2528"), aRaw + bFirst);
                        bNode.textContent = dropFirstCp(bRaw);
                        stryMutAct_9fa48("2529") ? changed-- : (stryCov_9fa48("2529"), changed++);
                    }
                }
            }
        }
        return changed;
    }
}
