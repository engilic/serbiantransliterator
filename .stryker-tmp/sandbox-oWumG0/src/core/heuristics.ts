// @ts-nocheck
// src/core/heuristics.ts
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
import { Tok, prevNextWord, getPrevWord, getNextWord } from "./tokenizer";
import { ALWAYS_LATIN_TOKENS_AMBIGUOUS, ALWAYS_LATIN_TOKENS_STRICT } from "./rules";
export const normKey = (s: unknown): string => {
    if (stryMutAct_9fa48("73")) {
        {
        }
    } else {
        stryCov_9fa48("73");
        if (
            stryMutAct_9fa48("76")
                ? s === null && s === undefined
                : stryMutAct_9fa48("75")
                  ? false
                  : stryMutAct_9fa48("74")
                    ? true
                    : (stryCov_9fa48("74", "75", "76"),
                      (stryMutAct_9fa48("78")
                          ? s !== null
                          : stryMutAct_9fa48("77")
                            ? false
                            : (stryCov_9fa48("77", "78"), s === null)) ||
                          (stryMutAct_9fa48("80")
                              ? s !== undefined
                              : stryMutAct_9fa48("79")
                                ? false
                                : (stryCov_9fa48("79", "80"), s === undefined)))
        )
            return stryMutAct_9fa48("81") ? "Stryker was here!" : (stryCov_9fa48("81"), "");
        const str = String(s);
        if (
            stryMutAct_9fa48("84")
                ? false
                : stryMutAct_9fa48("83")
                  ? true
                  : stryMutAct_9fa48("82")
                    ? str
                    : (stryCov_9fa48("82", "83", "84"), !str)
        )
            return stryMutAct_9fa48("85") ? "Stryker was here!" : (stryCov_9fa48("85"), "");
        if (
            stryMutAct_9fa48("88")
                ? typeof str.normalize !== "function"
                : stryMutAct_9fa48("87")
                  ? false
                  : stryMutAct_9fa48("86")
                    ? true
                    : (stryCov_9fa48("86", "87", "88"),
                      typeof str.normalize ===
                          (stryMutAct_9fa48("89") ? "" : (stryCov_9fa48("89"), "function")))
        ) {
            if (stryMutAct_9fa48("90")) {
                {
                }
            } else {
                stryCov_9fa48("90");
                try {
                    if (stryMutAct_9fa48("91")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("91");
                        return stryMutAct_9fa48("92")
                            ? str.normalize("NFC").toUpperCase()
                            : (stryCov_9fa48("92"),
                              str
                                  .normalize(stryMutAct_9fa48("93") ? "" : (stryCov_9fa48("93"), "NFC"))
                                  .toLowerCase());
                    }
                } catch {
                    if (stryMutAct_9fa48("94")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("94");
                        return stryMutAct_9fa48("95")
                            ? str.toUpperCase()
                            : (stryCov_9fa48("95"), str.toLowerCase());
                    }
                }
            }
        }
        return stryMutAct_9fa48("96") ? str.toUpperCase() : (stryCov_9fa48("96"), str.toLowerCase());
    }
};
const ROMAN = stryMutAct_9fa48("100")
    ? /^[^IVXLCDM]+$/
    : stryMutAct_9fa48("99")
      ? /^[IVXLCDM]$/
      : stryMutAct_9fa48("98")
        ? /^[IVXLCDM]+/
        : stryMutAct_9fa48("97")
          ? /[IVXLCDM]+$/
          : (stryCov_9fa48("97", "98", "99", "100"), /^[IVXLCDM]+$/);
const RULERS = new Set(
    stryMutAct_9fa48("101")
        ? []
        : (stryCov_9fa48("101"),
          [
              stryMutAct_9fa48("102") ? "" : (stryCov_9fa48("102"), "petar"),
              stryMutAct_9fa48("103") ? "" : (stryCov_9fa48("103"), "aleksandar"),
              stryMutAct_9fa48("104") ? "" : (stryCov_9fa48("104"), "nikola"),
              stryMutAct_9fa48("105") ? "" : (stryCov_9fa48("105"), "milan"),
              stryMutAct_9fa48("106") ? "" : (stryCov_9fa48("106"), "đorđe"),
              stryMutAct_9fa48("107") ? "" : (stryCov_9fa48("107"), "jovan"),
              stryMutAct_9fa48("108") ? "" : (stryCov_9fa48("108"), "uroš"),
              stryMutAct_9fa48("109") ? "" : (stryCov_9fa48("109"), "stefan"),
              stryMutAct_9fa48("110") ? "" : (stryCov_9fa48("110"), "lazar"),
              stryMutAct_9fa48("111") ? "" : (stryCov_9fa48("111"), "luj"),
              stryMutAct_9fa48("112") ? "" : (stryCov_9fa48("112"), "čarls"),
              stryMutAct_9fa48("113") ? "" : (stryCov_9fa48("113"), "elizabeta"),
              stryMutAct_9fa48("114") ? "" : (stryCov_9fa48("114"), "filip"),
              stryMutAct_9fa48("115") ? "" : (stryCov_9fa48("115"), "papa"),
              stryMutAct_9fa48("116") ? "" : (stryCov_9fa48("116"), "pavle"),
              stryMutAct_9fa48("117") ? "" : (stryCov_9fa48("117"), "patrijarh"),
              stryMutAct_9fa48("118") ? "" : (stryCov_9fa48("118"), "tom"),
              stryMutAct_9fa48("119") ? "" : (stryCov_9fa48("119"), "grupa"),
              stryMutAct_9fa48("120") ? "" : (stryCov_9fa48("120"), "zona"),
              stryMutAct_9fa48("121") ? "" : (stryCov_9fa48("121"), "korpus"),
              stryMutAct_9fa48("122") ? "" : (stryCov_9fa48("122"), "armija"),
              stryMutAct_9fa48("123") ? "" : (stryCov_9fa48("123"), "deo"),
              stryMutAct_9fa48("124") ? "" : (stryCov_9fa48("124"), "knjiga"),
              stryMutAct_9fa48("125") ? "" : (stryCov_9fa48("125"), "stav"),
              stryMutAct_9fa48("126") ? "" : (stryCov_9fa48("126"), "član"),
              stryMutAct_9fa48("127") ? "" : (stryCov_9fa48("127"), "sprat"),
          ])
);
const CATEGORY_PREFIX = stryMutAct_9fa48("128")
    ? []
    : (stryCov_9fa48("128"),
      [
          stryMutAct_9fa48("129") ? "" : (stryCov_9fa48("129"), "razred"),
          stryMutAct_9fa48("130") ? "" : (stryCov_9fa48("130"), "kategorij"),
          stryMutAct_9fa48("131") ? "" : (stryCov_9fa48("131"), "grupa"),
          stryMutAct_9fa48("132") ? "" : (stryCov_9fa48("132"), "zona"),
          stryMutAct_9fa48("133") ? "" : (stryCov_9fa48("133"), "korpus"),
          stryMutAct_9fa48("134") ? "" : (stryCov_9fa48("134"), "armija"),
          stryMutAct_9fa48("135") ? "" : (stryCov_9fa48("135"), "deo"),
          stryMutAct_9fa48("136") ? "" : (stryCov_9fa48("136"), "tom"),
          stryMutAct_9fa48("137") ? "" : (stryCov_9fa48("137"), "knjiga"),
          stryMutAct_9fa48("138") ? "" : (stryCov_9fa48("138"), "stav"),
          stryMutAct_9fa48("139") ? "" : (stryCov_9fa48("139"), "član"),
          stryMutAct_9fa48("140") ? "" : (stryCov_9fa48("140"), "svetski"),
          stryMutAct_9fa48("141") ? "" : (stryCov_9fa48("141"), "sprat"),
          stryMutAct_9fa48("142") ? "" : (stryCov_9fa48("142"), "vek"),
          stryMutAct_9fa48("143") ? "" : (stryCov_9fa48("143"), "rat"),
      ]);
function isAlphaNumModelToken(tok: string): boolean {
    if (stryMutAct_9fa48("144")) {
        {
        }
    } else {
        stryCov_9fa48("144");
        return stryMutAct_9fa48("147")
            ? /\d/.test(tok) || /\p{L}/u.test(tok)
            : stryMutAct_9fa48("146")
              ? false
              : stryMutAct_9fa48("145")
                ? true
                : (stryCov_9fa48("145", "146", "147"),
                  (stryMutAct_9fa48("148") ? /\D/ : (stryCov_9fa48("148"), /\d/)).test(tok) &&
                      (stryMutAct_9fa48("149") ? /\P{L}/u : (stryCov_9fa48("149"), /\p{L}/u)).test(tok));
    }
}
function isPureNumberToken(tok: string): boolean {
    if (stryMutAct_9fa48("150")) {
        {
        }
    } else {
        stryCov_9fa48("150");
        return (
            stryMutAct_9fa48("154")
                ? /^\D+$/u
                : stryMutAct_9fa48("153")
                  ? /^\d$/u
                  : stryMutAct_9fa48("152")
                    ? /^\d+/u
                    : stryMutAct_9fa48("151")
                      ? /\d+$/u
                      : (stryCov_9fa48("151", "152", "153", "154"), /^\d+$/u)
        ).test(tok);
    }
}
export function shouldProtectRomanToken(tokens: Tok[], idx: number): boolean {
    if (stryMutAct_9fa48("155")) {
        {
        }
    } else {
        stryCov_9fa48("155");
        const t = tokens[idx];
        if (
            stryMutAct_9fa48("158")
                ? false
                : stryMutAct_9fa48("157")
                  ? true
                  : stryMutAct_9fa48("156")
                    ? t
                    : (stryCov_9fa48("156", "157", "158"), !t)
        )
            return stryMutAct_9fa48("159") ? true : (stryCov_9fa48("159"), false);
        if (
            stryMutAct_9fa48("162")
                ? t.type === "word"
                : stryMutAct_9fa48("161")
                  ? false
                  : stryMutAct_9fa48("160")
                    ? true
                    : (stryCov_9fa48("160", "161", "162"),
                      t.type !== (stryMutAct_9fa48("163") ? "" : (stryCov_9fa48("163"), "word")))
        )
            return stryMutAct_9fa48("164") ? true : (stryCov_9fa48("164"), false);
        const v = String(
            stryMutAct_9fa48("167")
                ? t.value && ""
                : stryMutAct_9fa48("166")
                  ? false
                  : stryMutAct_9fa48("165")
                    ? true
                    : (stryCov_9fa48("165", "166", "167"),
                      t.value || (stryMutAct_9fa48("168") ? "Stryker was here!" : (stryCov_9fa48("168"), "")))
        ); // [FIX] Ensure string
        if (
            stryMutAct_9fa48("171")
                ? false
                : stryMutAct_9fa48("170")
                  ? true
                  : stryMutAct_9fa48("169")
                    ? ROMAN.test(v)
                    : (stryCov_9fa48("169", "170", "171"), !ROMAN.test(v))
        )
            return stryMutAct_9fa48("172") ? true : (stryCov_9fa48("172"), false);
        if (
            stryMutAct_9fa48("175")
                ? v === v.toUpperCase()
                : stryMutAct_9fa48("174")
                  ? false
                  : stryMutAct_9fa48("173")
                    ? true
                    : (stryCov_9fa48("173", "174", "175"),
                      v !==
                          (stryMutAct_9fa48("176")
                              ? v.toLowerCase()
                              : (stryCov_9fa48("176"), v.toUpperCase())))
        )
            return stryMutAct_9fa48("177") ? true : (stryCov_9fa48("177"), false);
        if (
            stryMutAct_9fa48("181")
                ? v.length <= 8
                : stryMutAct_9fa48("180")
                  ? v.length >= 8
                  : stryMutAct_9fa48("179")
                    ? false
                    : stryMutAct_9fa48("178")
                      ? true
                      : (stryCov_9fa48("178", "179", "180", "181"), v.length > 8)
        )
            return stryMutAct_9fa48("182") ? true : (stryCov_9fa48("182"), false);
        const { prev, next } = prevNextWord(tokens, idx);
        const prevKey = prev
            ? normKey(prev)
            : stryMutAct_9fa48("183")
              ? "Stryker was here!"
              : (stryCov_9fa48("183"), "");
        const nextKey = next
            ? normKey(next)
            : stryMutAct_9fa48("184")
              ? "Stryker was here!"
              : (stryCov_9fa48("184"), "");
        if (
            stryMutAct_9fa48("187")
                ? prevKey || RULERS.has(prevKey)
                : stryMutAct_9fa48("186")
                  ? false
                  : stryMutAct_9fa48("185")
                    ? true
                    : (stryCov_9fa48("185", "186", "187"), prevKey && RULERS.has(prevKey))
        )
            return stryMutAct_9fa48("188") ? false : (stryCov_9fa48("188"), true);
        if (
            stryMutAct_9fa48("191")
                ? nextKey || CATEGORY_PREFIX.some((p) => nextKey.startsWith(p))
                : stryMutAct_9fa48("190")
                  ? false
                  : stryMutAct_9fa48("189")
                    ? true
                    : (stryCov_9fa48("189", "190", "191"),
                      nextKey &&
                          (stryMutAct_9fa48("192")
                              ? CATEGORY_PREFIX.every((p) => nextKey.startsWith(p))
                              : (stryCov_9fa48("192"),
                                CATEGORY_PREFIX.some(
                                    stryMutAct_9fa48("193")
                                        ? () => undefined
                                        : (stryCov_9fa48("193"),
                                          (p) =>
                                              stryMutAct_9fa48("194")
                                                  ? nextKey.endsWith(p)
                                                  : (stryCov_9fa48("194"), nextKey.startsWith(p)))
                                ))))
        )
            return stryMutAct_9fa48("195") ? false : (stryCov_9fa48("195"), true);
        return stryMutAct_9fa48("196") ? true : (stryCov_9fa48("196"), false);
    }
}
export function shouldProtectAmbiguousBrandToken(tokens: Tok[], idx: number): boolean {
    if (stryMutAct_9fa48("197")) {
        {
        }
    } else {
        stryCov_9fa48("197");
        const t = tokens[idx];
        if (
            stryMutAct_9fa48("200")
                ? !t && t.type !== "word"
                : stryMutAct_9fa48("199")
                  ? false
                  : stryMutAct_9fa48("198")
                    ? true
                    : (stryCov_9fa48("198", "199", "200"),
                      (stryMutAct_9fa48("201") ? t : (stryCov_9fa48("201"), !t)) ||
                          (stryMutAct_9fa48("203")
                              ? t.type === "word"
                              : stryMutAct_9fa48("202")
                                ? false
                                : (stryCov_9fa48("202", "203"),
                                  t.type !==
                                      (stryMutAct_9fa48("204") ? "" : (stryCov_9fa48("204"), "word")))))
        )
            return stryMutAct_9fa48("205") ? true : (stryCov_9fa48("205"), false);
        const tokLower = normKey(t.value);
        if (
            stryMutAct_9fa48("208")
                ? false
                : stryMutAct_9fa48("207")
                  ? true
                  : stryMutAct_9fa48("206")
                    ? ALWAYS_LATIN_TOKENS_AMBIGUOUS.has(tokLower)
                    : (stryCov_9fa48("206", "207", "208"), !ALWAYS_LATIN_TOKENS_AMBIGUOUS.has(tokLower))
        )
            return stryMutAct_9fa48("209") ? true : (stryCov_9fa48("209"), false);
        const prev1 = getPrevWord(tokens, idx, 1);
        const prev2 = getPrevWord(tokens, idx, 2);
        const next1 = getNextWord(tokens, idx, 1);
        const next2 = getNextWord(tokens, idx, 2);
        const p1 = prev1
            ? normKey(prev1)
            : stryMutAct_9fa48("210")
              ? "Stryker was here!"
              : (stryCov_9fa48("210"), "");
        const p2 = prev2
            ? normKey(prev2)
            : stryMutAct_9fa48("211")
              ? "Stryker was here!"
              : (stryCov_9fa48("211"), "");
        const n1 = next1
            ? normKey(next1)
            : stryMutAct_9fa48("212")
              ? "Stryker was here!"
              : (stryCov_9fa48("212"), "");
        const n2 = next2
            ? normKey(next2)
            : stryMutAct_9fa48("213")
              ? "Stryker was here!"
              : (stryCov_9fa48("213"), "");
        if (
            stryMutAct_9fa48("216")
                ? p1 || ALWAYS_LATIN_TOKENS_STRICT.has(p1)
                : stryMutAct_9fa48("215")
                  ? false
                  : stryMutAct_9fa48("214")
                    ? true
                    : (stryCov_9fa48("214", "215", "216"), p1 && ALWAYS_LATIN_TOKENS_STRICT.has(p1))
        )
            return stryMutAct_9fa48("217") ? false : (stryCov_9fa48("217"), true);
        if (
            stryMutAct_9fa48("220")
                ? p2 || ALWAYS_LATIN_TOKENS_STRICT.has(p2)
                : stryMutAct_9fa48("219")
                  ? false
                  : stryMutAct_9fa48("218")
                    ? true
                    : (stryCov_9fa48("218", "219", "220"), p2 && ALWAYS_LATIN_TOKENS_STRICT.has(p2))
        )
            return stryMutAct_9fa48("221") ? false : (stryCov_9fa48("221"), true);
        if (
            stryMutAct_9fa48("224")
                ? n1 || ALWAYS_LATIN_TOKENS_STRICT.has(n1)
                : stryMutAct_9fa48("223")
                  ? false
                  : stryMutAct_9fa48("222")
                    ? true
                    : (stryCov_9fa48("222", "223", "224"), n1 && ALWAYS_LATIN_TOKENS_STRICT.has(n1))
        )
            return stryMutAct_9fa48("225") ? false : (stryCov_9fa48("225"), true);
        if (
            stryMutAct_9fa48("228")
                ? n2 || ALWAYS_LATIN_TOKENS_STRICT.has(n2)
                : stryMutAct_9fa48("227")
                  ? false
                  : stryMutAct_9fa48("226")
                    ? true
                    : (stryCov_9fa48("226", "227", "228"), n2 && ALWAYS_LATIN_TOKENS_STRICT.has(n2))
        )
            return stryMutAct_9fa48("229") ? false : (stryCov_9fa48("229"), true);
        if (
            stryMutAct_9fa48("232")
                ? prev1 || isAlphaNumModelToken(prev1)
                : stryMutAct_9fa48("231")
                  ? false
                  : stryMutAct_9fa48("230")
                    ? true
                    : (stryCov_9fa48("230", "231", "232"), prev1 && isAlphaNumModelToken(prev1))
        )
            return stryMutAct_9fa48("233") ? false : (stryCov_9fa48("233"), true);
        if (
            stryMutAct_9fa48("236")
                ? next1 || isAlphaNumModelToken(next1)
                : stryMutAct_9fa48("235")
                  ? false
                  : stryMutAct_9fa48("234")
                    ? true
                    : (stryCov_9fa48("234", "235", "236"), next1 && isAlphaNumModelToken(next1))
        )
            return stryMutAct_9fa48("237") ? false : (stryCov_9fa48("237"), true);
        if (
            stryMutAct_9fa48("240")
                ? prev1 && isPureNumberToken(prev1) && next1 && isPureNumberToken(next1)
                : stryMutAct_9fa48("239")
                  ? false
                  : stryMutAct_9fa48("238")
                    ? true
                    : (stryCov_9fa48("238", "239", "240"),
                      (stryMutAct_9fa48("242")
                          ? prev1 || isPureNumberToken(prev1)
                          : stryMutAct_9fa48("241")
                            ? false
                            : (stryCov_9fa48("241", "242"), prev1 && isPureNumberToken(prev1))) ||
                          (stryMutAct_9fa48("244")
                              ? next1 || isPureNumberToken(next1)
                              : stryMutAct_9fa48("243")
                                ? false
                                : (stryCov_9fa48("243", "244"), next1 && isPureNumberToken(next1))))
        )
            return stryMutAct_9fa48("245") ? true : (stryCov_9fa48("245"), false);
        return stryMutAct_9fa48("246") ? true : (stryCov_9fa48("246"), false);
    }
}
export function shouldProtectHeuristic(word: unknown): boolean {
    if (stryMutAct_9fa48("247")) {
        {
        }
    } else {
        stryCov_9fa48("247");
        // [FIX] Defensive guard: word must be a string
        if (
            stryMutAct_9fa48("250")
                ? word != null
                : stryMutAct_9fa48("249")
                  ? false
                  : stryMutAct_9fa48("248")
                    ? true
                    : (stryCov_9fa48("248", "249", "250"), word == null)
        )
            return stryMutAct_9fa48("251") ? true : (stryCov_9fa48("251"), false);
        const w = String(word);
        if (
            stryMutAct_9fa48("255")
                ? w.length >= 3
                : stryMutAct_9fa48("254")
                  ? w.length <= 3
                  : stryMutAct_9fa48("253")
                    ? false
                    : stryMutAct_9fa48("252")
                      ? true
                      : (stryCov_9fa48("252", "253", "254", "255"), w.length < 3)
        )
            return stryMutAct_9fa48("256") ? true : (stryCov_9fa48("256"), false);

        // [FIX] Ovde je pucalo ako w nije string
        const slice = stryMutAct_9fa48("257") ? w : (stryCov_9fa48("257"), w.slice(1));
        const hasUpper = (
            stryMutAct_9fa48("258") ? /[^A-ZČĆŽŠĐ]/ : (stryCov_9fa48("258"), /[A-ZČĆŽŠĐ]/)
        ).test(slice);
        const hasLower = (
            stryMutAct_9fa48("259") ? /[^a-zčćžšđ]/ : (stryCov_9fa48("259"), /[a-zčćžšđ]/)
        ).test(slice);
        return stryMutAct_9fa48("262")
            ? hasUpper || hasLower
            : stryMutAct_9fa48("261")
              ? false
              : stryMutAct_9fa48("260")
                ? true
                : (stryCov_9fa48("260", "261", "262"), hasUpper && hasLower);
    }
}
