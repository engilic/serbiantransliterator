// @ts-nocheck
// src/taskpane/app/preview/cache.ts
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
import { state, PREVIEW_CACHE_TTL_MS } from "../state";
export function invalidatePreviewCache() {
    if (stryMutAct_9fa48("5774")) {
        {
        }
    } else {
        stryCov_9fa48("5774");
        state.preview.convertedOoxml = null;
        state.preview.ooxmlOptsSnapJson = null;
        state.preview.selectionTextHash = null;
        state.preview.selectionOoxmlHash = null;
        state.preview.cacheTimestamp = null;
    }
}
export function isPreviewCacheValid(): boolean {
    if (stryMutAct_9fa48("5775")) {
        {
        }
    } else {
        stryCov_9fa48("5775");
        if (
            stryMutAct_9fa48("5778")
                ? !state.preview.convertedOoxml && !state.preview.cacheTimestamp
                : stryMutAct_9fa48("5777")
                  ? false
                  : stryMutAct_9fa48("5776")
                    ? true
                    : (stryCov_9fa48("5776", "5777", "5778"),
                      (stryMutAct_9fa48("5779")
                          ? state.preview.convertedOoxml
                          : (stryCov_9fa48("5779"), !state.preview.convertedOoxml)) ||
                          (stryMutAct_9fa48("5780")
                              ? state.preview.cacheTimestamp
                              : (stryCov_9fa48("5780"), !state.preview.cacheTimestamp)))
        )
            return stryMutAct_9fa48("5781") ? true : (stryCov_9fa48("5781"), false);
        const age = stryMutAct_9fa48("5782")
            ? Date.now() + state.preview.cacheTimestamp
            : (stryCov_9fa48("5782"), Date.now() - state.preview.cacheTimestamp);
        return stryMutAct_9fa48("5786")
            ? age >= PREVIEW_CACHE_TTL_MS
            : stryMutAct_9fa48("5785")
              ? age <= PREVIEW_CACHE_TTL_MS
              : stryMutAct_9fa48("5784")
                ? false
                : stryMutAct_9fa48("5783")
                  ? true
                  : (stryCov_9fa48("5783", "5784", "5785", "5786"), age < PREVIEW_CACHE_TTL_MS);
    }
}
