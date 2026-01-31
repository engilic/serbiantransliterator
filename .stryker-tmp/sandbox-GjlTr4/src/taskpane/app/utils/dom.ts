// @ts-nocheck
// src/taskpane/app/utils/dom.ts

/**
 * Type-safe wrapper around document.getElementById.
 * Throws clean error if element is missing (fail-fast), or returns typed element.
 *
 * Usage: const btn = get<HTMLButtonElement>("runBtn");
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
export function get<T extends HTMLElement>(id: string): T {
    if (stryMutAct_9fa48("7798")) {
        {
        }
    } else {
        stryCov_9fa48("7798");
        const el = document.getElementById(id);
        if (
            stryMutAct_9fa48("7801")
                ? false
                : stryMutAct_9fa48("7800")
                  ? true
                  : stryMutAct_9fa48("7799")
                    ? el
                    : (stryCov_9fa48("7799", "7800", "7801"), !el)
        ) {
            if (stryMutAct_9fa48("7802")) {
                {
                }
            } else {
                stryCov_9fa48("7802");
                // U produkciji ovo ne bi smelo da se desi ako je HTML validan.
                // Fail-fast pomaže u debugovanju ako promenimo ID u HTML-u a zaboravimo u TS-u.
                throw new Error(
                    stryMutAct_9fa48("7803")
                        ? ``
                        : (stryCov_9fa48("7803"), `Element with id '${id}' not found.`)
                );
            }
        }
        return el as T;
    }
}

/**
 * Safe variant trying to get element, returning null if missing.
 */
export function getOptional<T extends HTMLElement>(id: string): T | null {
    if (stryMutAct_9fa48("7804")) {
        {
        }
    } else {
        stryCov_9fa48("7804");
        return stryMutAct_9fa48("7807")
            ? (document.getElementById(id) as T) && null
            : stryMutAct_9fa48("7806")
              ? false
              : stryMutAct_9fa48("7805")
                ? true
                : (stryCov_9fa48("7805", "7806", "7807"), (document.getElementById(id) as T) || null);
    }
}

// [NEW] Scrolls element into view if not fully visible
export function scrollIntoViewIfNeeded(el: HTMLElement) {
    if (stryMutAct_9fa48("7808")) {
        {
        }
    } else {
        stryCov_9fa48("7808");
        if (
            stryMutAct_9fa48("7811")
                ? false
                : stryMutAct_9fa48("7810")
                  ? true
                  : stryMutAct_9fa48("7809")
                    ? el
                    : (stryCov_9fa48("7809", "7810", "7811"), !el)
        )
            return;

        // Malo kašnjenje da sačekamo CSS animaciju otvaranja (ako je ima)
        setTimeout(() => {
            if (stryMutAct_9fa48("7812")) {
                {
                }
            } else {
                stryCov_9fa48("7812");
                el.scrollIntoView(
                    stryMutAct_9fa48("7813")
                        ? {}
                        : (stryCov_9fa48("7813"),
                          {
                              behavior: stryMutAct_9fa48("7814") ? "" : (stryCov_9fa48("7814"), "smooth"),
                              block: stryMutAct_9fa48("7815") ? "" : (stryCov_9fa48("7815"), "nearest"),
                          })
                );
            }
        }, 300);
    }
}
