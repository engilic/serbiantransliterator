// @ts-nocheck
// src/shared/ooxml/bridge/structural/spaces.ts

/**
 * Spaja višestruke space koji su razbijeni preko više <w:t> čvorova.
 * Primer: "između" + "  " + "reči" → "između" + " " + "reči"
 *
 * NEW: tretira i NBSP (\u00A0) kao “space” u smislu bridging-a.
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
export function bridgeSpacesAcrossTextNodes(textNodes: Element[]): number {
    if (stryMutAct_9fa48("3264")) {
        {
        }
    } else {
        stryCov_9fa48("3264");
        const NBSP = stryMutAct_9fa48("3265") ? "" : (stryCov_9fa48("3265"), "\u00A0");
        let changed = 0;
        for (
            let i = 0;
            stryMutAct_9fa48("3268")
                ? i >= textNodes.length - 1
                : stryMutAct_9fa48("3267")
                  ? i <= textNodes.length - 1
                  : stryMutAct_9fa48("3266")
                    ? false
                    : (stryCov_9fa48("3266", "3267", "3268"),
                      i <
                          (stryMutAct_9fa48("3269")
                              ? textNodes.length + 1
                              : (stryCov_9fa48("3269"), textNodes.length - 1)));
            stryMutAct_9fa48("3270") ? i-- : (stryCov_9fa48("3270"), i++)
        ) {
            if (stryMutAct_9fa48("3271")) {
                {
                }
            } else {
                stryCov_9fa48("3271");
                const aNode = textNodes[i];
                if (
                    stryMutAct_9fa48("3274")
                        ? false
                        : stryMutAct_9fa48("3273")
                          ? true
                          : stryMutAct_9fa48("3272")
                            ? aNode
                            : (stryCov_9fa48("3272", "3273", "3274"), !aNode)
                )
                    continue;
                const bNode = textNodes[stryMutAct_9fa48("3275") ? i - 1 : (stryCov_9fa48("3275"), i + 1)];
                if (
                    stryMutAct_9fa48("3278")
                        ? false
                        : stryMutAct_9fa48("3277")
                          ? true
                          : stryMutAct_9fa48("3276")
                            ? bNode
                            : (stryCov_9fa48("3276", "3277", "3278"), !bNode)
                )
                    continue;
                const aText = stryMutAct_9fa48("3279")
                    ? aNode.textContent && ""
                    : (stryCov_9fa48("3279"),
                      aNode.textContent ??
                          (stryMutAct_9fa48("3280") ? "Stryker was here!" : (stryCov_9fa48("3280"), "")));
                let bText = stryMutAct_9fa48("3281")
                    ? bNode.textContent && ""
                    : (stryCov_9fa48("3281"),
                      bNode.textContent ??
                          (stryMutAct_9fa48("3282") ? "Stryker was here!" : (stryCov_9fa48("3282"), "")));
                const aEndsWithSpaceLike = stryMutAct_9fa48("3285")
                    ? aText.endsWith(" ") && aText.endsWith(NBSP)
                    : stryMutAct_9fa48("3284")
                      ? false
                      : stryMutAct_9fa48("3283")
                        ? true
                        : (stryCov_9fa48("3283", "3284", "3285"),
                          (stryMutAct_9fa48("3286")
                              ? aText.startsWith(" ")
                              : (stryCov_9fa48("3286"),
                                aText.endsWith(
                                    stryMutAct_9fa48("3287") ? "" : (stryCov_9fa48("3287"), " ")
                                ))) ||
                              (stryMutAct_9fa48("3288")
                                  ? aText.startsWith(NBSP)
                                  : (stryCov_9fa48("3288"), aText.endsWith(NBSP))));
                const bStartsWithSpaceLike = stryMutAct_9fa48("3291")
                    ? bText.startsWith(" ") && bText.startsWith(NBSP)
                    : stryMutAct_9fa48("3290")
                      ? false
                      : stryMutAct_9fa48("3289")
                        ? true
                        : (stryCov_9fa48("3289", "3290", "3291"),
                          (stryMutAct_9fa48("3292")
                              ? bText.endsWith(" ")
                              : (stryCov_9fa48("3292"),
                                bText.startsWith(
                                    stryMutAct_9fa48("3293") ? "" : (stryCov_9fa48("3293"), " ")
                                ))) ||
                              (stryMutAct_9fa48("3294")
                                  ? bText.endsWith(NBSP)
                                  : (stryCov_9fa48("3294"), bText.startsWith(NBSP))));

                // Ako a završava space-like, a b počinje space-like
                if (
                    stryMutAct_9fa48("3297")
                        ? aEndsWithSpaceLike || bStartsWithSpaceLike
                        : stryMutAct_9fa48("3296")
                          ? false
                          : stryMutAct_9fa48("3295")
                            ? true
                            : (stryCov_9fa48("3295", "3296", "3297"),
                              aEndsWithSpaceLike && bStartsWithSpaceLike)
                ) {
                    if (stryMutAct_9fa48("3298")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3298");
                        // Ukloni sve vodeće space/NBSP iz b
                        bText = bText.replace(
                            stryMutAct_9fa48("3301")
                                ? /^[^ \u00A0]+/g
                                : stryMutAct_9fa48("3300")
                                  ? /^[ \u00A0]/g
                                  : stryMutAct_9fa48("3299")
                                    ? /[ \u00A0]+/g
                                    : (stryCov_9fa48("3299", "3300", "3301"), /^[ \u00A0]+/g),
                            stryMutAct_9fa48("3302") ? "Stryker was here!" : (stryCov_9fa48("3302"), "")
                        );
                        // Ako bText je sada prazan, preskoči na sledeći čvor
                        if (
                            stryMutAct_9fa48("3305")
                                ? bText.length !== 0
                                : stryMutAct_9fa48("3304")
                                  ? false
                                  : stryMutAct_9fa48("3303")
                                    ? true
                                    : (stryCov_9fa48("3303", "3304", "3305"), bText.length === 0)
                        ) {
                            if (stryMutAct_9fa48("3306")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("3306");
                                bNode.textContent = stryMutAct_9fa48("3307")
                                    ? "Stryker was here!"
                                    : (stryCov_9fa48("3307"), "");
                                stryMutAct_9fa48("3308") ? changed-- : (stryCov_9fa48("3308"), changed++);
                                continue;
                            }
                        }

                        // Obezbedi da između a i b ostane tačno jedan space-like.
                        // Ako je u a bio NBSP, čuvamo NBSP; inače čuvamo regularan space.
                        const keep = (
                            stryMutAct_9fa48("3309")
                                ? aText.startsWith(NBSP)
                                : (stryCov_9fa48("3309"), aText.endsWith(NBSP))
                        )
                            ? NBSP
                            : stryMutAct_9fa48("3310")
                              ? ""
                              : (stryCov_9fa48("3310"), " ");
                        aNode.textContent = aText.replace(
                            stryMutAct_9fa48("3313")
                                ? /[^ \u00A0]+$/g
                                : stryMutAct_9fa48("3312")
                                  ? /[ \u00A0]$/g
                                  : stryMutAct_9fa48("3311")
                                    ? /[ \u00A0]+/g
                                    : (stryCov_9fa48("3311", "3312", "3313"), /[ \u00A0]+$/g),
                            keep
                        );
                        bNode.textContent = bText;
                        stryMutAct_9fa48("3314") ? changed-- : (stryCov_9fa48("3314"), changed++);
                    }
                }
            }
        }
        return changed;
    }
}
