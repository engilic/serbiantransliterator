// @ts-nocheck
// src/shared/ooxml/phraseCache.ts
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
import { buildPhraseInfos } from "./bridge/index";
import { ALWAYS_LATIN_PHRASES } from "../../core/rules";
export const ALWAYS_LATIN_PHRASE_INFOS = buildPhraseInfos(ALWAYS_LATIN_PHRASES);
const PHRASE_INFOS_CACHE_MAX = 80;
const phraseInfosCache = new Map<string, ReturnType<typeof buildPhraseInfos>>();
function normalizePhraseForKey(p: string): string {
    if (stryMutAct_9fa48("4151")) {
        {
        }
    } else {
        stryCov_9fa48("4151");
        return stryMutAct_9fa48("4153")
            ? p.normalize("NFC").replace(/\s+/g, " ").toLowerCase()
            : stryMutAct_9fa48("4152")
              ? p.normalize("NFC").replace(/\s+/g, " ").trim().toUpperCase()
              : (stryCov_9fa48("4152", "4153"),
                p
                    .normalize(stryMutAct_9fa48("4154") ? "" : (stryCov_9fa48("4154"), "NFC"))
                    .replace(
                        stryMutAct_9fa48("4156")
                            ? /\S+/g
                            : stryMutAct_9fa48("4155")
                              ? /\s/g
                              : (stryCov_9fa48("4155", "4156"), /\s+/g),
                        stryMutAct_9fa48("4157") ? "" : (stryCov_9fa48("4157"), " ")
                    )
                    .trim()
                    .toLowerCase());
    }
}
function phrasesCacheKey(phrases: string[]): string {
    if (stryMutAct_9fa48("4158")) {
        {
        }
    } else {
        stryCov_9fa48("4158");
        const norm = stryMutAct_9fa48("4159")
            ? phrases.map(normalizePhraseForKey)
            : (stryCov_9fa48("4159"), phrases.map(normalizePhraseForKey).filter(Boolean));
        const uniqSorted = stryMutAct_9fa48("4160")
            ? Array.from(new Set(norm))
            : (stryCov_9fa48("4160"), Array.from(new Set(norm)).sort());
        return JSON.stringify(uniqSorted);
    }
}
export function getCachedPhraseInfos(phrases: string[]) {
    if (stryMutAct_9fa48("4161")) {
        {
        }
    } else {
        stryCov_9fa48("4161");
        const key = phrasesCacheKey(phrases);
        const hit = phraseInfosCache.get(key);
        if (
            stryMutAct_9fa48("4163")
                ? false
                : stryMutAct_9fa48("4162")
                  ? true
                  : (stryCov_9fa48("4162", "4163"), hit)
        )
            return hit;
        const infos = buildPhraseInfos(phrases);
        phraseInfosCache.set(key, infos);
        if (
            stryMutAct_9fa48("4167")
                ? phraseInfosCache.size <= PHRASE_INFOS_CACHE_MAX
                : stryMutAct_9fa48("4166")
                  ? phraseInfosCache.size >= PHRASE_INFOS_CACHE_MAX
                  : stryMutAct_9fa48("4165")
                    ? false
                    : stryMutAct_9fa48("4164")
                      ? true
                      : (stryCov_9fa48("4164", "4165", "4166", "4167"),
                        phraseInfosCache.size > PHRASE_INFOS_CACHE_MAX)
        ) {
            if (stryMutAct_9fa48("4168")) {
                {
                }
            } else {
                stryCov_9fa48("4168");
                const firstKey = phraseInfosCache.keys().next().value as string | undefined;
                if (
                    stryMutAct_9fa48("4170")
                        ? false
                        : stryMutAct_9fa48("4169")
                          ? true
                          : (stryCov_9fa48("4169", "4170"), firstKey)
                )
                    phraseInfosCache.delete(firstKey);
            }
        }
        return infos;
    }
}
