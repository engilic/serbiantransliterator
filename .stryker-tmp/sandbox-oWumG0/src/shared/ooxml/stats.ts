// @ts-nocheck
// src/shared/ooxml/stats.ts
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
import type { Direction } from "../../core/textCore";
import type { ProofingApplyResult } from "./proofing";
export type ProofingStats = {
    enabled: boolean;
    targetLang: "sr-Cyrl-RS" | "sr-Latn-RS" | null;
} & ProofingApplyResult;
export type ConvertStats = {
    direction: Direction | "to-ascii";
    textNodes: number;
    charsBefore: number;
    charsAfter: number;
    detected: {
        urls: number;
        emails: number;
    };
    code: {
        fenceMarkersSeen: number;
        inlineTicksSeen: number;
        endedInFence: boolean;
        endedInInline: boolean;
    };
    bridges: {
        links: number;
        placeholders: number;
        brandPhrases: number;
        brandTokens: number;
        digraphs: number;
        userPhrases: number;
        userTokens: number;
        allCapsHints: number;
        spaces: number;
        ambiguousBrandSuffix: number;
    };
    proofing: ProofingStats;
    timingMs: number;
};
export function createEmptyStats(direction?: string, textNodes = 0, chars = 0): ConvertStats {
    if (stryMutAct_9fa48("4479")) {
        {
        }
    } else {
        stryCov_9fa48("4479");
        return stryMutAct_9fa48("4480")
            ? {}
            : (stryCov_9fa48("4480"),
              {
                  direction: stryMutAct_9fa48("4483")
                      ? (direction as ConvertStats["direction"]) && "auto"
                      : stryMutAct_9fa48("4482")
                        ? false
                        : stryMutAct_9fa48("4481")
                          ? true
                          : (stryCov_9fa48("4481", "4482", "4483"),
                            (direction as ConvertStats["direction"]) ||
                                (stryMutAct_9fa48("4484") ? "" : (stryCov_9fa48("4484"), "auto"))),
                  textNodes,
                  charsBefore: chars,
                  charsAfter: chars,
                  detected: stryMutAct_9fa48("4485")
                      ? {}
                      : (stryCov_9fa48("4485"),
                        {
                            urls: 0,
                            emails: 0,
                        }),
                  code: stryMutAct_9fa48("4486")
                      ? {}
                      : (stryCov_9fa48("4486"),
                        {
                            fenceMarkersSeen: 0,
                            inlineTicksSeen: 0,
                            endedInFence: stryMutAct_9fa48("4487") ? true : (stryCov_9fa48("4487"), false),
                            endedInInline: stryMutAct_9fa48("4488") ? true : (stryCov_9fa48("4488"), false),
                        }),
                  bridges: stryMutAct_9fa48("4489")
                      ? {}
                      : (stryCov_9fa48("4489"),
                        {
                            links: 0,
                            placeholders: 0,
                            brandPhrases: 0,
                            brandTokens: 0,
                            digraphs: 0,
                            userPhrases: 0,
                            userTokens: 0,
                            allCapsHints: 0,
                            spaces: 0,
                            ambiguousBrandSuffix: 0,
                        }),
                  proofing: stryMutAct_9fa48("4490")
                      ? {}
                      : (stryCov_9fa48("4490"),
                        {
                            enabled: stryMutAct_9fa48("4491") ? true : (stryCov_9fa48("4491"), false),
                            targetLang: null,
                            changedRuns: 0,
                            skippedRuns: 0,
                            skippedByReason: {},
                        }),
                  timingMs: 0,
              });
    }
}
