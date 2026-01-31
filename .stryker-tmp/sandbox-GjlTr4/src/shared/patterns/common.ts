// @ts-nocheck
// src/shared/patterns/common.ts

/**
 * Znakovi interpunkcije koji se često lepe za kraj URL-a ili reči,
 * a ne želimo da budu deo linka.
 *
 * NAMERNO ne uključuje: ) ] }
 * jer te zatvarajuće zagrade mogu biti validan deo URL-a (npr. Wikipedia),
 * pa ih skidamo "balansirano" u trimLinkEnd().
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
export const PUNCTUATION_CHARS = stryMutAct_9fa48("4506") ? "" : (stryCov_9fa48("4506"), ".,;:!?");

/**
 * Regex koji hvata jedan ili više znakova interpunkcije na kraju stringa.
 */
export const PUNCTUATION_END_REGEX = new RegExp(
    stryMutAct_9fa48("4507") ? `` : (stryCov_9fa48("4507"), `[${PUNCTUATION_CHARS}]+$`),
    stryMutAct_9fa48("4508") ? "" : (stryCov_9fa48("4508"), "g")
);

/**
 * Zatvarajuće zagrade koje ponekad jesu validan deo URL-a,
 * pa ih skidamo samo ako su "višak" (nebalansirane).
 */
export const BALANCED_CLOSERS = [")", "]", "}"] as const;
export const CLOSER_TO_OPENER: Record<(typeof BALANCED_CLOSERS)[number], string> = stryMutAct_9fa48("4509")
    ? {}
    : (stryCov_9fa48("4509"),
      {
          ")": stryMutAct_9fa48("4510") ? "" : (stryCov_9fa48("4510"), "("),
          "]": stryMutAct_9fa48("4511") ? "" : (stryCov_9fa48("4511"), "["),
          "}": stryMutAct_9fa48("4512") ? "" : (stryCov_9fa48("4512"), "{"),
      });
