// @ts-nocheck
// src/taskpane/app/utils/incognito.ts
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
import { showPreviewToast } from "../modal/previewModal";
export function checkIncognito() {
    if (stryMutAct_9fa48("7816")) {
        {
        }
    } else {
        stryCov_9fa48("7816");
        try {
            if (stryMutAct_9fa48("7817")) {
                {
                }
            } else {
                stryCov_9fa48("7817");
                localStorage.setItem(
                    stryMutAct_9fa48("7818") ? "" : (stryCov_9fa48("7818"), "test"),
                    stryMutAct_9fa48("7819") ? "" : (stryCov_9fa48("7819"), "test")
                );
                localStorage.removeItem(stryMutAct_9fa48("7820") ? "" : (stryCov_9fa48("7820"), "test"));
            }
        } catch (e) {
            if (stryMutAct_9fa48("7821")) {
                {
                }
            } else {
                stryCov_9fa48("7821");
                // Storage quota exceeded or disabled (Incognito / Private Mode)
                showPreviewToast(
                    stryMutAct_9fa48("7822")
                        ? ""
                        : (stryCov_9fa48("7822"), "⚠️ Incognito/Private Mode: Podešavanja se neće čuvati."),
                    stryMutAct_9fa48("7823") ? "" : (stryCov_9fa48("7823"), "info"),
                    5000
                );
            }
        }
    }
}
