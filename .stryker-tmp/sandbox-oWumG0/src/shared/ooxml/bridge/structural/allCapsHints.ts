// @ts-nocheck
// src/shared/ooxml/bridge/structural/allCapsHints.ts
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
import { findNextNodeWithText, firstCp, lastCp, isUpperCyrillicLetter } from "../../common";
export const CYR_ALLCAPS_HINT = stryMutAct_9fa48("3199") ? "" : (stryCov_9fa48("3199"), "А");
export const LAT_ALLCAPS_HINT = stryMutAct_9fa48("3200") ? "" : (stryCov_9fa48("3200"), "A");
export function markCyrAllCapsDigraphHints(
    textNodes: Element[],
    skipExactTokens?: Set<string>
): {
    hinted: WeakSet<Element>;
    count: number;
} {
    if (stryMutAct_9fa48("3201")) {
        {
        }
    } else {
        stryCov_9fa48("3201");
        const hinted = new WeakSet<Element>();
        let count = 0;
        for (
            let i = 0;
            stryMutAct_9fa48("3204")
                ? i >= textNodes.length - 1
                : stryMutAct_9fa48("3203")
                  ? i <= textNodes.length - 1
                  : stryMutAct_9fa48("3202")
                    ? false
                    : (stryCov_9fa48("3202", "3203", "3204"),
                      i <
                          (stryMutAct_9fa48("3205")
                              ? textNodes.length + 1
                              : (stryCov_9fa48("3205"), textNodes.length - 1)));
            stryMutAct_9fa48("3206") ? i-- : (stryCov_9fa48("3206"), i++)
        ) {
            if (stryMutAct_9fa48("3207")) {
                {
                }
            } else {
                stryCov_9fa48("3207");
                const aNode = textNodes[i];
                if (
                    stryMutAct_9fa48("3210")
                        ? false
                        : stryMutAct_9fa48("3209")
                          ? true
                          : stryMutAct_9fa48("3208")
                            ? aNode
                            : (stryCov_9fa48("3208", "3209", "3210"), !aNode)
                )
                    continue;
                const aRaw = (
                    stryMutAct_9fa48("3211")
                        ? aNode.textContent && ""
                        : (stryCov_9fa48("3211"),
                          aNode.textContent ??
                              (stryMutAct_9fa48("3212") ? "Stryker was here!" : (stryCov_9fa48("3212"), "")))
                ).normalize(stryMutAct_9fa48("3213") ? "" : (stryCov_9fa48("3213"), "NFC"));
                if (
                    stryMutAct_9fa48("3216")
                        ? false
                        : stryMutAct_9fa48("3215")
                          ? true
                          : stryMutAct_9fa48("3214")
                            ? aRaw
                            : (stryCov_9fa48("3214", "3215", "3216"), !aRaw)
                )
                    continue;
                if (
                    stryMutAct_9fa48("3219")
                        ? skipExactTokens.has(aRaw)
                        : stryMutAct_9fa48("3218")
                          ? false
                          : stryMutAct_9fa48("3217")
                            ? true
                            : (stryCov_9fa48("3217", "3218", "3219"), skipExactTokens?.has(aRaw))
                )
                    continue;
                if (
                    stryMutAct_9fa48("3222")
                        ? aRaw.trimEnd() === aRaw
                        : stryMutAct_9fa48("3221")
                          ? false
                          : stryMutAct_9fa48("3220")
                            ? true
                            : (stryCov_9fa48("3220", "3221", "3222"),
                              (stryMutAct_9fa48("3223")
                                  ? aRaw.trimStart()
                                  : (stryCov_9fa48("3223"), aRaw.trimEnd())) !== aRaw)
                )
                    continue;
                const last = lastCp(aRaw);
                if (
                    stryMutAct_9fa48("3226")
                        ? (last !== "Љ" && last !== "Њ") || last !== "Џ"
                        : stryMutAct_9fa48("3225")
                          ? false
                          : stryMutAct_9fa48("3224")
                            ? true
                            : (stryCov_9fa48("3224", "3225", "3226"),
                              (stryMutAct_9fa48("3228")
                                  ? last !== "Љ" || last !== "Њ"
                                  : stryMutAct_9fa48("3227")
                                    ? true
                                    : (stryCov_9fa48("3227", "3228"),
                                      (stryMutAct_9fa48("3230")
                                          ? last === "Љ"
                                          : stryMutAct_9fa48("3229")
                                            ? true
                                            : (stryCov_9fa48("3229", "3230"),
                                              last !==
                                                  (stryMutAct_9fa48("3231")
                                                      ? ""
                                                      : (stryCov_9fa48("3231"), "Љ")))) &&
                                          (stryMutAct_9fa48("3233")
                                              ? last === "Њ"
                                              : stryMutAct_9fa48("3232")
                                                ? true
                                                : (stryCov_9fa48("3232", "3233"),
                                                  last !==
                                                      (stryMutAct_9fa48("3234")
                                                          ? ""
                                                          : (stryCov_9fa48("3234"), "Њ")))))) &&
                                  (stryMutAct_9fa48("3236")
                                      ? last === "Џ"
                                      : stryMutAct_9fa48("3235")
                                        ? true
                                        : (stryCov_9fa48("3235", "3236"),
                                          last !==
                                              (stryMutAct_9fa48("3237")
                                                  ? ""
                                                  : (stryCov_9fa48("3237"), "Џ")))))
                )
                    continue;
                const j = findNextNodeWithText(
                    textNodes,
                    stryMutAct_9fa48("3238") ? i - 1 : (stryCov_9fa48("3238"), i + 1)
                );
                if (
                    stryMutAct_9fa48("3241")
                        ? j != null
                        : stryMutAct_9fa48("3240")
                          ? false
                          : stryMutAct_9fa48("3239")
                            ? true
                            : (stryCov_9fa48("3239", "3240", "3241"), j == null)
                )
                    continue;
                const bNode = textNodes[j];
                if (
                    stryMutAct_9fa48("3244")
                        ? false
                        : stryMutAct_9fa48("3243")
                          ? true
                          : stryMutAct_9fa48("3242")
                            ? bNode
                            : (stryCov_9fa48("3242", "3243", "3244"), !bNode)
                )
                    continue;
                const bRaw = (
                    stryMutAct_9fa48("3245")
                        ? bNode.textContent && ""
                        : (stryCov_9fa48("3245"),
                          bNode.textContent ??
                              (stryMutAct_9fa48("3246") ? "Stryker was here!" : (stryCov_9fa48("3246"), "")))
                ).normalize(stryMutAct_9fa48("3247") ? "" : (stryCov_9fa48("3247"), "NFC"));
                if (
                    stryMutAct_9fa48("3250")
                        ? false
                        : stryMutAct_9fa48("3249")
                          ? true
                          : stryMutAct_9fa48("3248")
                            ? bRaw
                            : (stryCov_9fa48("3248", "3249", "3250"), !bRaw)
                )
                    continue;
                if (
                    stryMutAct_9fa48("3253")
                        ? bRaw.trimStart() === bRaw
                        : stryMutAct_9fa48("3252")
                          ? false
                          : stryMutAct_9fa48("3251")
                            ? true
                            : (stryCov_9fa48("3251", "3252", "3253"),
                              (stryMutAct_9fa48("3254")
                                  ? bRaw.trimEnd()
                                  : (stryCov_9fa48("3254"), bRaw.trimStart())) !== bRaw)
                )
                    continue;
                const bFirst = firstCp(bRaw);
                if (
                    stryMutAct_9fa48("3257")
                        ? false
                        : stryMutAct_9fa48("3256")
                          ? true
                          : stryMutAct_9fa48("3255")
                            ? bFirst
                            : (stryCov_9fa48("3255", "3256", "3257"), !bFirst)
                )
                    continue;
                if (
                    stryMutAct_9fa48("3260")
                        ? false
                        : stryMutAct_9fa48("3259")
                          ? true
                          : stryMutAct_9fa48("3258")
                            ? isUpperCyrillicLetter(bFirst)
                            : (stryCov_9fa48("3258", "3259", "3260"), !isUpperCyrillicLetter(bFirst))
                )
                    continue;
                aNode.textContent = stryMutAct_9fa48("3261")
                    ? aRaw - CYR_ALLCAPS_HINT
                    : (stryCov_9fa48("3261"), aRaw + CYR_ALLCAPS_HINT);
                hinted.add(aNode);
                stryMutAct_9fa48("3262") ? count-- : (stryCov_9fa48("3262"), count++);
            }
        }
        return stryMutAct_9fa48("3263")
            ? {}
            : (stryCov_9fa48("3263"),
              {
                  hinted,
                  count,
              });
    }
}
