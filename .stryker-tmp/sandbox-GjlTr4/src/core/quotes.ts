// @ts-nocheck
// src/core/quotes.ts
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
export function fixSerbianQuotes(segment: string): string {
    if (stryMutAct_9fa48("462")) {
        {
        }
    } else {
        stryCov_9fa48("462");
        let text = segment;

        // sve quote varijante -> "
        // (unicode kodovi su sigurni za enkoding)
        text = text.replace(
            stryMutAct_9fa48("463")
                ? /[^\u201C\u201D\u2018\u2019\u00AB\u00BB\u201E\u201F\u201A\u201B\u2039\u203A]/g
                : (stryCov_9fa48("463"),
                  /[\u201C\u201D\u2018\u2019\u00AB\u00BB\u201E\u201F\u201A\u201B\u2039\u203A]/g),
            stryMutAct_9fa48("464") ? `` : (stryCov_9fa48("464"), `"`)
        );

        // opening: " -> „  (U+201E)
        // koristimo alternaciju da obuhvatimo i '[' bez "no-useless-escape" problema
        text = text.replace(
            stryMutAct_9fa48("467")
                ? /(^|[\S({<\-\u2013\u2014]|\[)"/g
                : stryMutAct_9fa48("466")
                  ? /(^|[^\s({<\-\u2013\u2014]|\[)"/g
                  : stryMutAct_9fa48("465")
                    ? /([\s({<\-\u2013\u2014]|\[)"/g
                    : (stryCov_9fa48("465", "466", "467"), /(^|[\s({<\-\u2013\u2014]|\[)"/g),
            stryMutAct_9fa48("468") ? `` : (stryCov_9fa48("468"), `$1\u201E`)
        );

        // closing: sve preostale " -> ” (U+201D)
        text = text.replace(/"/g, stryMutAct_9fa48("469") ? "" : (stryCov_9fa48("469"), "\u201D"));
        return text;
    }
}
