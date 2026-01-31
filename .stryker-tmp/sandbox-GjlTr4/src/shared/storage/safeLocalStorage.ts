// @ts-nocheck
// src/shared/storage/safeLocalStorage.ts

/**
 * Defensive wrapper oko localStorage.
 *
 * Razlog: u nekim okruženjima (npr. restriktivan privacy režim / blokiran storage)
 * localStorage.getItem/setItem/removeItem mogu da bace exception.
 *
 * Cilj: UI i add-in ne smeju da puknu zbog storage-a (best-effort).
 */ function stryNS_9fa48() {
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
export function safeGetItem(key: string): string | null {
    if (stryMutAct_9fa48("4724")) {
        {
        }
    } else {
        stryCov_9fa48("4724");
        try {
            if (stryMutAct_9fa48("4725")) {
                {
                }
            } else {
                stryCov_9fa48("4725");
                return globalThis.localStorage ? globalThis.localStorage.getItem(key) : null;
            }
        } catch {
            if (stryMutAct_9fa48("4726")) {
                {
                }
            } else {
                stryCov_9fa48("4726");
                return null;
            }
        }
    }
}
export function safeSetItem(key: string, value: string): boolean {
    if (stryMutAct_9fa48("4727")) {
        {
        }
    } else {
        stryCov_9fa48("4727");
        try {
            if (stryMutAct_9fa48("4728")) {
                {
                }
            } else {
                stryCov_9fa48("4728");
                if (
                    stryMutAct_9fa48("4731")
                        ? false
                        : stryMutAct_9fa48("4730")
                          ? true
                          : stryMutAct_9fa48("4729")
                            ? globalThis.localStorage
                            : (stryCov_9fa48("4729", "4730", "4731"), !globalThis.localStorage)
                )
                    return stryMutAct_9fa48("4732") ? true : (stryCov_9fa48("4732"), false);
                globalThis.localStorage.setItem(key, value);
                return stryMutAct_9fa48("4733") ? false : (stryCov_9fa48("4733"), true);
            }
        } catch {
            if (stryMutAct_9fa48("4734")) {
                {
                }
            } else {
                stryCov_9fa48("4734");
                return stryMutAct_9fa48("4735") ? true : (stryCov_9fa48("4735"), false);
            }
        }
    }
}
export function safeRemoveItem(key: string): boolean {
    if (stryMutAct_9fa48("4736")) {
        {
        }
    } else {
        stryCov_9fa48("4736");
        try {
            if (stryMutAct_9fa48("4737")) {
                {
                }
            } else {
                stryCov_9fa48("4737");
                if (
                    stryMutAct_9fa48("4740")
                        ? false
                        : stryMutAct_9fa48("4739")
                          ? true
                          : stryMutAct_9fa48("4738")
                            ? globalThis.localStorage
                            : (stryCov_9fa48("4738", "4739", "4740"), !globalThis.localStorage)
                )
                    return stryMutAct_9fa48("4741") ? true : (stryCov_9fa48("4741"), false);
                globalThis.localStorage.removeItem(key);
                return stryMutAct_9fa48("4742") ? false : (stryCov_9fa48("4742"), true);
            }
        } catch {
            if (stryMutAct_9fa48("4743")) {
                {
                }
            } else {
                stryCov_9fa48("4743");
                return stryMutAct_9fa48("4744") ? true : (stryCov_9fa48("4744"), false);
            }
        }
    }
}
