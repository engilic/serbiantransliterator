// @ts-nocheck
// src/core/corrections.ts
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
function preserveFirstLetterCase(input: unknown, replacement: unknown): string {
    if (stryMutAct_9fa48("0")) {
        {
        }
    } else {
        stryCov_9fa48("0");
        const inp = String(
            stryMutAct_9fa48("3")
                ? input && ""
                : stryMutAct_9fa48("2")
                  ? false
                  : stryMutAct_9fa48("1")
                    ? true
                    : (stryCov_9fa48("1", "2", "3"),
                      input || (stryMutAct_9fa48("4") ? "Stryker was here!" : (stryCov_9fa48("4"), "")))
        );
        const rep = String(
            stryMutAct_9fa48("7")
                ? replacement && ""
                : stryMutAct_9fa48("6")
                  ? false
                  : stryMutAct_9fa48("5")
                    ? true
                    : (stryCov_9fa48("5", "6", "7"),
                      replacement || (stryMutAct_9fa48("8") ? "Stryker was here!" : (stryCov_9fa48("8"), "")))
        );
        if (
            stryMutAct_9fa48("11")
                ? false
                : stryMutAct_9fa48("10")
                  ? true
                  : stryMutAct_9fa48("9")
                    ? inp
                    : (stryCov_9fa48("9", "10", "11"), !inp)
        )
            return rep;
        const firstChar = inp[0];
        if (
            stryMutAct_9fa48("14")
                ? false
                : stryMutAct_9fa48("13")
                  ? true
                  : stryMutAct_9fa48("12")
                    ? firstChar
                    : (stryCov_9fa48("12", "13", "14"), !firstChar)
        )
            return rep;
        const firstReplChar = rep[0];
        if (
            stryMutAct_9fa48("17")
                ? false
                : stryMutAct_9fa48("16")
                  ? true
                  : stryMutAct_9fa48("15")
                    ? firstReplChar
                    : (stryCov_9fa48("15", "16", "17"), !firstReplChar)
        )
            return rep;
        const isUpper = stryMutAct_9fa48("20")
            ? firstChar !== firstChar.toUpperCase()
            : stryMutAct_9fa48("19")
              ? false
              : stryMutAct_9fa48("18")
                ? true
                : (stryCov_9fa48("18", "19", "20"),
                  firstChar ===
                      (stryMutAct_9fa48("21")
                          ? firstChar.toLowerCase()
                          : (stryCov_9fa48("21"), firstChar.toUpperCase())));
        return isUpper
            ? stryMutAct_9fa48("22")
                ? firstReplChar.toUpperCase() - rep.slice(1)
                : (stryCov_9fa48("22"),
                  (stryMutAct_9fa48("23")
                      ? firstReplChar.toLowerCase()
                      : (stryCov_9fa48("23"), firstReplChar.toUpperCase())) +
                      (stryMutAct_9fa48("24") ? rep : (stryCov_9fa48("24"), rep.slice(1))))
            : rep;
    }
}
export function applyPreCorrectionsLatToCyr(segment: string): string {
    if (stryMutAct_9fa48("25")) {
        {
        }
    } else {
        stryCov_9fa48("25");
        let text = String(
            stryMutAct_9fa48("28")
                ? segment && ""
                : stryMutAct_9fa48("27")
                  ? false
                  : stryMutAct_9fa48("26")
                    ? true
                    : (stryCov_9fa48("26", "27", "28"),
                      segment || (stryMutAct_9fa48("29") ? "Stryker was here!" : (stryCov_9fa48("29"), "")))
        ); // [FIX] Ensure string

        // Tanjug (nema 'nj' -> 'њ', već 'нј')
        text = text
            .replace(/\bTanjug\b/g, stryMutAct_9fa48("30") ? "" : (stryCov_9fa48("30"), "Танјуг"))
            .replace(/\btanjug\b/g, stryMutAct_9fa48("31") ? "" : (stryCov_9fa48("31"), "танјуг"));

        // Sava fraze
        const savaMap: Record<string, string> = stryMutAct_9fa48("32")
            ? {}
            : (stryCov_9fa48("32"),
              {
                  "reke Save": stryMutAct_9fa48("33") ? "" : (stryCov_9fa48("33"), "реке Саве"),
                  "duž Save": stryMutAct_9fa48("34") ? "" : (stryCov_9fa48("34"), "дуж Саве"),
                  "ka Savi": stryMutAct_9fa48("35") ? "" : (stryCov_9fa48("35"), "ка Сави"),
                  "na Savi": stryMutAct_9fa48("36") ? "" : (stryCov_9fa48("36"), "на Сави"),
                  "ušća Save": stryMutAct_9fa48("37") ? "" : (stryCov_9fa48("37"), "ушћа Саве"),
                  "obale Save": stryMutAct_9fa48("38") ? "" : (stryCov_9fa48("38"), "обале Саве"),
              });
        for (const phrase of Object.keys(savaMap)) {
            if (stryMutAct_9fa48("39")) {
                {
                }
            } else {
                stryCov_9fa48("39");
                const repl = savaMap[phrase];
                if (
                    stryMutAct_9fa48("42")
                        ? false
                        : stryMutAct_9fa48("41")
                          ? true
                          : stryMutAct_9fa48("40")
                            ? repl
                            : (stryCov_9fa48("40", "41", "42"), !repl)
                )
                    continue;
                text = text.replace(
                    new RegExp(phrase, stryMutAct_9fa48("43") ? "" : (stryCov_9fa48("43"), "gi")),
                    stryMutAct_9fa48("44")
                        ? () => undefined
                        : (stryCov_9fa48("44"), (m) => preserveFirstLetterCase(m, repl))
                );
            }
        }

        // Izuzeci za nj/dž
        const exceptions = stryMutAct_9fa48("45")
            ? []
            : (stryCov_9fa48("45"),
              [
                  stryMutAct_9fa48("46")
                      ? {}
                      : (stryCov_9fa48("46"),
                        {
                            l: stryMutAct_9fa48("47") ? "" : (stryCov_9fa48("47"), "injekc"),
                            c: stryMutAct_9fa48("48") ? "" : (stryCov_9fa48("48"), "инјекц"),
                        }),
                  stryMutAct_9fa48("49")
                      ? {}
                      : (stryCov_9fa48("49"),
                        {
                            l: stryMutAct_9fa48("50") ? "" : (stryCov_9fa48("50"), "injekt"),
                            c: stryMutAct_9fa48("51") ? "" : (stryCov_9fa48("51"), "инјект"),
                        }),
                  stryMutAct_9fa48("52")
                      ? {}
                      : (stryCov_9fa48("52"),
                        {
                            l: stryMutAct_9fa48("53") ? "" : (stryCov_9fa48("53"), "konjug"),
                            c: stryMutAct_9fa48("54") ? "" : (stryCov_9fa48("54"), "конјуг"),
                        }),
                  stryMutAct_9fa48("55")
                      ? {}
                      : (stryCov_9fa48("55"),
                        {
                            l: stryMutAct_9fa48("56") ? "" : (stryCov_9fa48("56"), "konjunk"),
                            c: stryMutAct_9fa48("57") ? "" : (stryCov_9fa48("57"), "конјунк"),
                        }),
                  stryMutAct_9fa48("58")
                      ? {}
                      : (stryCov_9fa48("58"),
                        {
                            l: stryMutAct_9fa48("59") ? "" : (stryCov_9fa48("59"), "anjon"),
                            c: stryMutAct_9fa48("60") ? "" : (stryCov_9fa48("60"), "анјон"),
                        }),
                  stryMutAct_9fa48("61")
                      ? {}
                      : (stryCov_9fa48("61"),
                        {
                            l: stryMutAct_9fa48("62") ? "" : (stryCov_9fa48("62"), "katjon"),
                            c: stryMutAct_9fa48("63") ? "" : (stryCov_9fa48("63"), "катјон"),
                        }),
                  stryMutAct_9fa48("64")
                      ? {}
                      : (stryCov_9fa48("64"),
                        {
                            l: stryMutAct_9fa48("65") ? "" : (stryCov_9fa48("65"), "nadživ"),
                            c: stryMutAct_9fa48("66") ? "" : (stryCov_9fa48("66"), "наджив"),
                        }),
                  stryMutAct_9fa48("67")
                      ? {}
                      : (stryCov_9fa48("67"),
                        {
                            l: stryMutAct_9fa48("68") ? "" : (stryCov_9fa48("68"), "podžanr"),
                            c: stryMutAct_9fa48("69") ? "" : (stryCov_9fa48("69"), "поджанр"),
                        }),
              ]);
        for (const p of exceptions) {
            if (stryMutAct_9fa48("70")) {
                {
                }
            } else {
                stryCov_9fa48("70");
                text = text.replace(
                    new RegExp(p.l, stryMutAct_9fa48("71") ? "" : (stryCov_9fa48("71"), "gi")),
                    stryMutAct_9fa48("72")
                        ? () => undefined
                        : (stryCov_9fa48("72"), (m) => preserveFirstLetterCase(m, p.c))
                );
            }
        }
        return text;
    }
}
