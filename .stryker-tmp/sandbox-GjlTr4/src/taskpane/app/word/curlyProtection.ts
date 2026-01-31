// @ts-nocheck
// src/taskpane/app/word/curlyProtection.ts
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
export type CurlyProtectionUi = "placeholders" | "all" | "none";
export function asCurlyProtectionUi(v: unknown): CurlyProtectionUi {
    if (stryMutAct_9fa48("8513")) {
        {
        }
    } else {
        stryCov_9fa48("8513");
        const s = String(
            stryMutAct_9fa48("8514")
                ? v && ""
                : (stryCov_9fa48("8514"),
                  v ?? (stryMutAct_9fa48("8515") ? "Stryker was here!" : (stryCov_9fa48("8515"), "")))
        );
        return (
            stryMutAct_9fa48("8518")
                ? (s === "all" || s === "none") && s === "placeholders"
                : stryMutAct_9fa48("8517")
                  ? false
                  : stryMutAct_9fa48("8516")
                    ? true
                    : (stryCov_9fa48("8516", "8517", "8518"),
                      (stryMutAct_9fa48("8520")
                          ? s === "all" && s === "none"
                          : stryMutAct_9fa48("8519")
                            ? false
                            : (stryCov_9fa48("8519", "8520"),
                              (stryMutAct_9fa48("8522")
                                  ? s !== "all"
                                  : stryMutAct_9fa48("8521")
                                    ? false
                                    : (stryCov_9fa48("8521", "8522"),
                                      s ===
                                          (stryMutAct_9fa48("8523")
                                              ? ""
                                              : (stryCov_9fa48("8523"), "all")))) ||
                                  (stryMutAct_9fa48("8525")
                                      ? s !== "none"
                                      : stryMutAct_9fa48("8524")
                                        ? false
                                        : (stryCov_9fa48("8524", "8525"),
                                          s ===
                                              (stryMutAct_9fa48("8526")
                                                  ? ""
                                                  : (stryCov_9fa48("8526"), "none")))))) ||
                          (stryMutAct_9fa48("8528")
                              ? s !== "placeholders"
                              : stryMutAct_9fa48("8527")
                                ? false
                                : (stryCov_9fa48("8527", "8528"),
                                  s ===
                                      (stryMutAct_9fa48("8529")
                                          ? ""
                                          : (stryCov_9fa48("8529"), "placeholders")))))
        )
            ? s
            : stryMutAct_9fa48("8530")
              ? ""
              : (stryCov_9fa48("8530"), "placeholders");
    }
}
