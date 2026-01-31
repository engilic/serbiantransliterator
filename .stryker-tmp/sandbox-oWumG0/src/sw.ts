// @ts-nocheck
// src/sw.ts
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
const CACHE_NAME = stryMutAct_9fa48("4745") ? "" : (stryCov_9fa48("4745"), "serbian-trans-v1");
const ASSETS_TO_CACHE = stryMutAct_9fa48("4746")
    ? []
    : (stryCov_9fa48("4746"),
      [
          stryMutAct_9fa48("4747") ? "" : (stryCov_9fa48("4747"), "./"),
          stryMutAct_9fa48("4748") ? "" : (stryCov_9fa48("4748"), "./index.html"),
          stryMutAct_9fa48("4749") ? "" : (stryCov_9fa48("4749"), "./taskpane.html"),
          stryMutAct_9fa48("4750") ? "" : (stryCov_9fa48("4750"), "./taskpane.js"),
          stryMutAct_9fa48("4751") ? "" : (stryCov_9fa48("4751"), "./taskpane.css"),
          stryMutAct_9fa48("4752") ? "" : (stryCov_9fa48("4752"), "./assets/dict_e2i.bin"),
          stryMutAct_9fa48("4753") ? "" : (stryCov_9fa48("4753"), "./assets/dict_i2e.bin"),
      ]);

// Koristimo "Local" prefix da izbegnemo konflikt sa globalnim DOM tipovima
interface LocalExtendableEvent extends Event {
    waitUntil(fn: Promise<unknown>): void;
}
interface LocalFetchEvent extends Event {
    request: Request;
    respondWith(response: Promise<Response> | Response): void;
}
self.addEventListener(stryMutAct_9fa48("4754") ? "" : (stryCov_9fa48("4754"), "install"), (event: Event) => {
    if (stryMutAct_9fa48("4755")) {
        {
        }
    } else {
        stryCov_9fa48("4755");
        const e = event as LocalExtendableEvent;
        e.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                if (stryMutAct_9fa48("4756")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4756");
                    console.log(
                        stryMutAct_9fa48("4757") ? "" : (stryCov_9fa48("4757"), "[SW] Caching assets")
                    );
                    return cache.addAll(ASSETS_TO_CACHE);
                }
            })
        );
    }
});
self.addEventListener(stryMutAct_9fa48("4758") ? "" : (stryCov_9fa48("4758"), "activate"), (event: Event) => {
    if (stryMutAct_9fa48("4759")) {
        {
        }
    } else {
        stryCov_9fa48("4759");
        const e = event as LocalExtendableEvent;
        e.waitUntil(
            caches.keys().then((keyList) => {
                if (stryMutAct_9fa48("4760")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4760");
                    return Promise.all(
                        keyList.map((key) => {
                            if (stryMutAct_9fa48("4761")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("4761");
                                if (
                                    stryMutAct_9fa48("4764")
                                        ? key === CACHE_NAME
                                        : stryMutAct_9fa48("4763")
                                          ? false
                                          : stryMutAct_9fa48("4762")
                                            ? true
                                            : (stryCov_9fa48("4762", "4763", "4764"), key !== CACHE_NAME)
                                ) {
                                    if (stryMutAct_9fa48("4765")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("4765");
                                        console.log(
                                            stryMutAct_9fa48("4766")
                                                ? ""
                                                : (stryCov_9fa48("4766"), "[SW] Removing old cache"),
                                            key
                                        );
                                        return caches.delete(key);
                                    }
                                }
                                return Promise.resolve();
                            }
                        })
                    );
                }
            })
        );
    }
});
self.addEventListener(stryMutAct_9fa48("4767") ? "" : (stryCov_9fa48("4767"), "fetch"), (event: Event) => {
    if (stryMutAct_9fa48("4768")) {
        {
        }
    } else {
        stryCov_9fa48("4768");
        const e = event as LocalFetchEvent;
        e.respondWith(
            caches.match(e.request).then((response) => {
                if (stryMutAct_9fa48("4769")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4769");
                    // Vrati iz keša ako postoji, inače idi na mrežu
                    return stryMutAct_9fa48("4772")
                        ? response && fetch(e.request)
                        : stryMutAct_9fa48("4771")
                          ? false
                          : stryMutAct_9fa48("4770")
                            ? true
                            : (stryCov_9fa48("4770", "4771", "4772"), response || fetch(e.request));
                }
            })
        );
    }
});
