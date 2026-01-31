// @ts-nocheck
// src/shared/ooxml/quoteConstants.ts
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
export const QUOTE_VARIANTS_RE = stryMutAct_9fa48("4367")
    ? /[^\u201C\u201D\u2018\u2019\u00AB\u00BB\u201E\u201F\u201A\u201B\u2039\u203A]/g
    : (stryCov_9fa48("4367"), /[\u201C\u201D\u2018\u2019\u00AB\u00BB\u201E\u201F\u201A\u201B\u2039\u203A]/g);
export const OPEN_QUOTE = stryMutAct_9fa48("4368") ? "" : (stryCov_9fa48("4368"), "\u201E"); // OPEN_QUOTE   (U+201E)
export const CLOSE_QUOTE = stryMutAct_9fa48("4369") ? "" : (stryCov_9fa48("4369"), "\u201D"); // CLOSE_QUOTE (U+201D)
