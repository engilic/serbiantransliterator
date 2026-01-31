// @ts-nocheck
// src/shared/i18n.ts
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
import { SR_RS } from "./locales/sr";
import { EN_US } from "./locales/en";
function getSerbianPluralForm(n: number): "one" | "few" | "many" {
    if (stryMutAct_9fa48("1741")) {
        {
        }
    } else {
        stryCov_9fa48("1741");
        const n100 = stryMutAct_9fa48("1742") ? n * 100 : (stryCov_9fa48("1742"), n % 100);
        const n10 = stryMutAct_9fa48("1743") ? n * 10 : (stryCov_9fa48("1743"), n % 10);
        if (
            stryMutAct_9fa48("1746")
                ? n100 >= 5 || n100 <= 20
                : stryMutAct_9fa48("1745")
                  ? false
                  : stryMutAct_9fa48("1744")
                    ? true
                    : (stryCov_9fa48("1744", "1745", "1746"),
                      (stryMutAct_9fa48("1749")
                          ? n100 < 5
                          : stryMutAct_9fa48("1748")
                            ? n100 > 5
                            : stryMutAct_9fa48("1747")
                              ? true
                              : (stryCov_9fa48("1747", "1748", "1749"), n100 >= 5)) &&
                          (stryMutAct_9fa48("1752")
                              ? n100 > 20
                              : stryMutAct_9fa48("1751")
                                ? n100 < 20
                                : stryMutAct_9fa48("1750")
                                  ? true
                                  : (stryCov_9fa48("1750", "1751", "1752"), n100 <= 20)))
        )
            return stryMutAct_9fa48("1753") ? "" : (stryCov_9fa48("1753"), "many");
        if (
            stryMutAct_9fa48("1756")
                ? n10 !== 1
                : stryMutAct_9fa48("1755")
                  ? false
                  : stryMutAct_9fa48("1754")
                    ? true
                    : (stryCov_9fa48("1754", "1755", "1756"), n10 === 1)
        )
            return stryMutAct_9fa48("1757") ? "" : (stryCov_9fa48("1757"), "one");
        if (
            stryMutAct_9fa48("1760")
                ? n10 >= 2 || n10 <= 4
                : stryMutAct_9fa48("1759")
                  ? false
                  : stryMutAct_9fa48("1758")
                    ? true
                    : (stryCov_9fa48("1758", "1759", "1760"),
                      (stryMutAct_9fa48("1763")
                          ? n10 < 2
                          : stryMutAct_9fa48("1762")
                            ? n10 > 2
                            : stryMutAct_9fa48("1761")
                              ? true
                              : (stryCov_9fa48("1761", "1762", "1763"), n10 >= 2)) &&
                          (stryMutAct_9fa48("1766")
                              ? n10 > 4
                              : stryMutAct_9fa48("1765")
                                ? n10 < 4
                                : stryMutAct_9fa48("1764")
                                  ? true
                                  : (stryCov_9fa48("1764", "1765", "1766"), n10 <= 4)))
        )
            return stryMutAct_9fa48("1767") ? "" : (stryCov_9fa48("1767"), "few");
        return stryMutAct_9fa48("1768") ? "" : (stryCov_9fa48("1768"), "many");
    }
}
function getEnglishPluralForm(n: number): "one" | "many" {
    if (stryMutAct_9fa48("1769")) {
        {
        }
    } else {
        stryCov_9fa48("1769");
        return (
            stryMutAct_9fa48("1772")
                ? n !== 1
                : stryMutAct_9fa48("1771")
                  ? false
                  : stryMutAct_9fa48("1770")
                    ? true
                    : (stryCov_9fa48("1770", "1771", "1772"), n === 1)
        )
            ? stryMutAct_9fa48("1773")
                ? ""
                : (stryCov_9fa48("1773"), "one")
            : stryMutAct_9fa48("1774")
              ? ""
              : (stryCov_9fa48("1774"), "many");
    }
}

// Tip izveden iz SR_RS (Single Source of Truth)
export type TranslationKey = keyof typeof SR_RS;
export type Language = "sr" | "en";
let currentLang: Language = stryMutAct_9fa48("1775") ? "" : (stryCov_9fa48("1775"), "sr");
const TRANSLATIONS: Record<Language, typeof SR_RS> = stryMutAct_9fa48("1776")
    ? {}
    : (stryCov_9fa48("1776"),
      {
          sr: SR_RS,
          en: EN_US,
      });
export function setLanguage(lang: Language) {
    if (stryMutAct_9fa48("1777")) {
        {
        }
    } else {
        stryCov_9fa48("1777");
        if (
            stryMutAct_9fa48("1779")
                ? false
                : stryMutAct_9fa48("1778")
                  ? true
                  : (stryCov_9fa48("1778", "1779"), TRANSLATIONS[lang])
        ) {
            if (stryMutAct_9fa48("1780")) {
                {
                }
            } else {
                stryCov_9fa48("1780");
                currentLang = lang;
            }
        }
    }
}
export function getLanguage(): Language {
    if (stryMutAct_9fa48("1781")) {
        {
        }
    } else {
        stryCov_9fa48("1781");
        return currentLang;
    }
}
export function t(key: TranslationKey, ...args: (string | number)[]): string {
    if (stryMutAct_9fa48("1782")) {
        {
        }
    } else {
        stryCov_9fa48("1782");
        const dict = stryMutAct_9fa48("1785")
            ? TRANSLATIONS[currentLang] && SR_RS
            : stryMutAct_9fa48("1784")
              ? false
              : stryMutAct_9fa48("1783")
                ? true
                : (stryCov_9fa48("1783", "1784", "1785"), TRANSLATIONS[currentLang] || SR_RS);
        let str = stryMutAct_9fa48("1788")
            ? (dict[key] || SR_RS[key]) && key
            : stryMutAct_9fa48("1787")
              ? false
              : stryMutAct_9fa48("1786")
                ? true
                : (stryCov_9fa48("1786", "1787", "1788"),
                  (stryMutAct_9fa48("1790")
                      ? dict[key] && SR_RS[key]
                      : stryMutAct_9fa48("1789")
                        ? false
                        : (stryCov_9fa48("1789", "1790"), dict[key] || SR_RS[key])) || key);
        if (
            stryMutAct_9fa48("1794")
                ? args.length <= 0
                : stryMutAct_9fa48("1793")
                  ? args.length >= 0
                  : stryMutAct_9fa48("1792")
                    ? false
                    : stryMutAct_9fa48("1791")
                      ? true
                      : (stryCov_9fa48("1791", "1792", "1793", "1794"), args.length > 0)
        ) {
            if (stryMutAct_9fa48("1795")) {
                {
                }
            } else {
                stryCov_9fa48("1795");
                args.forEach((arg, index) => {
                    if (stryMutAct_9fa48("1796")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1796");
                        str = str.replace(
                            new RegExp(
                                stryMutAct_9fa48("1797") ? `` : (stryCov_9fa48("1797"), `\\{${index}\\}`),
                                stryMutAct_9fa48("1798") ? "" : (stryCov_9fa48("1798"), "g")
                            ),
                            String(arg)
                        );
                    }
                });
            }
        }
        return str;
    }
}
export function tPlural(key: TranslationKey, count: number): string {
    if (stryMutAct_9fa48("1799")) {
        {
        }
    } else {
        stryCov_9fa48("1799");
        const dict = stryMutAct_9fa48("1802")
            ? TRANSLATIONS[currentLang] && SR_RS
            : stryMutAct_9fa48("1801")
              ? false
              : stryMutAct_9fa48("1800")
                ? true
                : (stryCov_9fa48("1800", "1801", "1802"), TRANSLATIONS[currentLang] || SR_RS);
        if (
            stryMutAct_9fa48("1805")
                ? currentLang !== "sr"
                : stryMutAct_9fa48("1804")
                  ? false
                  : stryMutAct_9fa48("1803")
                    ? true
                    : (stryCov_9fa48("1803", "1804", "1805"),
                      currentLang === (stryMutAct_9fa48("1806") ? "" : (stryCov_9fa48("1806"), "sr")))
        ) {
            if (stryMutAct_9fa48("1807")) {
                {
                }
            } else {
                stryCov_9fa48("1807");
                const form = getSerbianPluralForm(count);
                const specificKey = `${key}_${form}` as TranslationKey;
                if (
                    stryMutAct_9fa48("1809")
                        ? false
                        : stryMutAct_9fa48("1808")
                          ? true
                          : (stryCov_9fa48("1808", "1809"), dict[specificKey])
                )
                    return t(specificKey, count);
            }
        } else if (
            stryMutAct_9fa48("1812")
                ? currentLang !== "en"
                : stryMutAct_9fa48("1811")
                  ? false
                  : stryMutAct_9fa48("1810")
                    ? true
                    : (stryCov_9fa48("1810", "1811", "1812"),
                      currentLang === (stryMutAct_9fa48("1813") ? "" : (stryCov_9fa48("1813"), "en")))
        ) {
            if (stryMutAct_9fa48("1814")) {
                {
                }
            } else {
                stryCov_9fa48("1814");
                const form = getEnglishPluralForm(count);
                const specificKey = `${key}_${form}` as TranslationKey;
                if (
                    stryMutAct_9fa48("1816")
                        ? false
                        : stryMutAct_9fa48("1815")
                          ? true
                          : (stryCov_9fa48("1815", "1816"), dict[specificKey])
                )
                    return t(specificKey, count);
            }
        }
        return t(key, count);
    }
}
export function isTranslationKey(k: string): k is TranslationKey {
    if (stryMutAct_9fa48("1817")) {
        {
        }
    } else {
        stryCov_9fa48("1817");
        return Object.prototype.hasOwnProperty.call(SR_RS, k);
    }
}
