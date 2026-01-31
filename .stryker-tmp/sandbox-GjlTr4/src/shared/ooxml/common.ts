// @ts-nocheck
// src/shared/ooxml/common.ts

// --- NOVO: Safe wrapper ---
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
export function safeNormalize(s: unknown): string {
    if (stryMutAct_9fa48("3387")) {
        {
        }
    } else {
        stryCov_9fa48("3387");
        if (
            stryMutAct_9fa48("3390")
                ? s === null && s === undefined
                : stryMutAct_9fa48("3389")
                  ? false
                  : stryMutAct_9fa48("3388")
                    ? true
                    : (stryCov_9fa48("3388", "3389", "3390"),
                      (stryMutAct_9fa48("3392")
                          ? s !== null
                          : stryMutAct_9fa48("3391")
                            ? false
                            : (stryCov_9fa48("3391", "3392"), s === null)) ||
                          (stryMutAct_9fa48("3394")
                              ? s !== undefined
                              : stryMutAct_9fa48("3393")
                                ? false
                                : (stryCov_9fa48("3393", "3394"), s === undefined)))
        )
            return stryMutAct_9fa48("3395") ? "Stryker was here!" : (stryCov_9fa48("3395"), "");

        // [FIX] Osiguravamo da je 's' string pre poziva metoda
        const str = String(s);
        if (
            stryMutAct_9fa48("3398")
                ? false
                : stryMutAct_9fa48("3397")
                  ? true
                  : stryMutAct_9fa48("3396")
                    ? str
                    : (stryCov_9fa48("3396", "3397", "3398"), !str)
        )
            return stryMutAct_9fa48("3399") ? "Stryker was here!" : (stryCov_9fa48("3399"), "");
        if (
            stryMutAct_9fa48("3402")
                ? typeof str.normalize !== "function"
                : stryMutAct_9fa48("3401")
                  ? false
                  : stryMutAct_9fa48("3400")
                    ? true
                    : (stryCov_9fa48("3400", "3401", "3402"),
                      typeof str.normalize ===
                          (stryMutAct_9fa48("3403") ? "" : (stryCov_9fa48("3403"), "function")))
        ) {
            if (stryMutAct_9fa48("3404")) {
                {
                }
            } else {
                stryCov_9fa48("3404");
                try {
                    if (stryMutAct_9fa48("3405")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3405");
                        return str.normalize(stryMutAct_9fa48("3406") ? "" : (stryCov_9fa48("3406"), "NFC"));
                    }
                } catch {
                    if (stryMutAct_9fa48("3407")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3407");
                        return str;
                    }
                }
            }
        }
        return str;
    }
}

// Ažuriran normKey da koristi safeNormalize i lowerCase
export const normKey = stryMutAct_9fa48("3408")
    ? () => undefined
    : (stryCov_9fa48("3408"),
      (() => {
          const normKey = (s: string) =>
              stryMutAct_9fa48("3409")
                  ? safeNormalize(s).toUpperCase()
                  : (stryCov_9fa48("3409"), safeNormalize(s).toLowerCase());
          return normKey;
      })());

// Ažuriran getCpArray
export function getCpArray(text: string): string[] {
    if (stryMutAct_9fa48("3410")) {
        {
        }
    } else {
        stryCov_9fa48("3410");
        return Array.from(safeNormalize(text));
    }
}
export function firstCp(text: string): string | null {
    if (stryMutAct_9fa48("3411")) {
        {
        }
    } else {
        stryCov_9fa48("3411");
        const arr = Array.from(safeNormalize(text)); // [FIX] koristimo safeNormalize
        return arr.length
            ? stryMutAct_9fa48("3412")
                ? arr[0] && null
                : (stryCov_9fa48("3412"), arr[0] ?? null)
            : null;
    }
}
export function lastCp(text: string): string | null {
    if (stryMutAct_9fa48("3413")) {
        {
        }
    } else {
        stryCov_9fa48("3413");
        const arr = Array.from(safeNormalize(text)); // [FIX] koristimo safeNormalize
        return arr.length
            ? stryMutAct_9fa48("3414")
                ? arr[arr.length - 1] && null
                : (stryCov_9fa48("3414"),
                  arr[stryMutAct_9fa48("3415") ? arr.length + 1 : (stryCov_9fa48("3415"), arr.length - 1)] ??
                      null)
            : null;
    }
}
export function dropFirstCp(text: string): string {
    if (stryMutAct_9fa48("3416")) {
        {
        }
    } else {
        stryCov_9fa48("3416");
        const arr = Array.from(safeNormalize(text)); // [FIX] koristimo safeNormalize
        return stryMutAct_9fa48("3417")
            ? arr.join("")
            : (stryCov_9fa48("3417"),
              arr
                  .slice(1)
                  .join(stryMutAct_9fa48("3418") ? "Stryker was here!" : (stryCov_9fa48("3418"), "")));
    }
}
export function findNextNodeWithText(textNodes: Element[], startIdx: number): number | null {
    if (stryMutAct_9fa48("3419")) {
        {
        }
    } else {
        stryCov_9fa48("3419");
        for (
            let i = startIdx;
            stryMutAct_9fa48("3422")
                ? i >= textNodes.length
                : stryMutAct_9fa48("3421")
                  ? i <= textNodes.length
                  : stryMutAct_9fa48("3420")
                    ? false
                    : (stryCov_9fa48("3420", "3421", "3422"), i < textNodes.length);
            stryMutAct_9fa48("3423") ? i-- : (stryCov_9fa48("3423"), i++)
        ) {
            if (stryMutAct_9fa48("3424")) {
                {
                }
            } else {
                stryCov_9fa48("3424");
                const node = textNodes[i];
                if (
                    stryMutAct_9fa48("3427")
                        ? false
                        : stryMutAct_9fa48("3426")
                          ? true
                          : stryMutAct_9fa48("3425")
                            ? node
                            : (stryCov_9fa48("3425", "3426", "3427"), !node)
                )
                    continue;
                const t = stryMutAct_9fa48("3428")
                    ? node.textContent && ""
                    : (stryCov_9fa48("3428"),
                      node.textContent ??
                          (stryMutAct_9fa48("3429") ? "Stryker was here!" : (stryCov_9fa48("3429"), "")));
                if (
                    stryMutAct_9fa48("3433")
                        ? t.length <= 0
                        : stryMutAct_9fa48("3432")
                          ? t.length >= 0
                          : stryMutAct_9fa48("3431")
                            ? false
                            : stryMutAct_9fa48("3430")
                              ? true
                              : (stryCov_9fa48("3430", "3431", "3432", "3433"), t.length > 0)
                )
                    return i;
            }
        }
        return null;
    }
}
export function latinLetterSr(ch: string): boolean {
    if (stryMutAct_9fa48("3434")) {
        {
        }
    } else {
        stryCov_9fa48("3434");
        return (
            stryMutAct_9fa48("3437")
                ? /^[^A-Za-zČčĆćĐđŠšŽž]$/
                : stryMutAct_9fa48("3436")
                  ? /^[A-Za-zČčĆćĐđŠšŽž]/
                  : stryMutAct_9fa48("3435")
                    ? /[A-Za-zČčĆćĐđŠšŽž]$/
                    : (stryCov_9fa48("3435", "3436", "3437"), /^[A-Za-zČčĆćĐđŠšŽž]$/)
        ).test(ch);
    }
}
export function isCyrillicLetter(ch: string): boolean {
    if (stryMutAct_9fa48("3438")) {
        {
        }
    } else {
        stryCov_9fa48("3438");
        const code = ch.codePointAt(0);
        if (
            stryMutAct_9fa48("3441")
                ? code != null
                : stryMutAct_9fa48("3440")
                  ? false
                  : stryMutAct_9fa48("3439")
                    ? true
                    : (stryCov_9fa48("3439", "3440", "3441"), code == null)
        )
            return stryMutAct_9fa48("3442") ? true : (stryCov_9fa48("3442"), false);
        return stryMutAct_9fa48("3445")
            ? code >= 0x0400 || code <= 0x052f
            : stryMutAct_9fa48("3444")
              ? false
              : stryMutAct_9fa48("3443")
                ? true
                : (stryCov_9fa48("3443", "3444", "3445"),
                  (stryMutAct_9fa48("3448")
                      ? code < 0x0400
                      : stryMutAct_9fa48("3447")
                        ? code > 0x0400
                        : stryMutAct_9fa48("3446")
                          ? true
                          : (stryCov_9fa48("3446", "3447", "3448"), code >= 0x0400)) &&
                      (stryMutAct_9fa48("3451")
                          ? code > 0x052f
                          : stryMutAct_9fa48("3450")
                            ? code < 0x052f
                            : stryMutAct_9fa48("3449")
                              ? true
                              : (stryCov_9fa48("3449", "3450", "3451"), code <= 0x052f)));
    }
}
export function isUpperCyrillicLetter(ch: string): boolean {
    if (stryMutAct_9fa48("3452")) {
        {
        }
    } else {
        stryCov_9fa48("3452");
        return stryMutAct_9fa48("3455")
            ? isCyrillicLetter(ch) || ch === ch.toUpperCase()
            : stryMutAct_9fa48("3454")
              ? false
              : stryMutAct_9fa48("3453")
                ? true
                : (stryCov_9fa48("3453", "3454", "3455"),
                  isCyrillicLetter(ch) &&
                      (stryMutAct_9fa48("3457")
                          ? ch !== ch.toUpperCase()
                          : stryMutAct_9fa48("3456")
                            ? true
                            : (stryCov_9fa48("3456", "3457"),
                              ch ===
                                  (stryMutAct_9fa48("3458")
                                      ? ch.toLowerCase()
                                      : (stryCov_9fa48("3458"), ch.toUpperCase())))));
    }
}
export function isAlphaNum(ch: string): boolean {
    if (stryMutAct_9fa48("3459")) {
        {
        }
    } else {
        stryCov_9fa48("3459");
        return (
            stryMutAct_9fa48("3461")
                ? /\p{L}|\P{N}/u
                : stryMutAct_9fa48("3460")
                  ? /\P{L}|\p{N}/u
                  : (stryCov_9fa48("3460", "3461"), /\p{L}|\p{N}/u)
        ).test(ch);
    }
}
export function isBoundaryChar(ch: string): boolean {
    if (stryMutAct_9fa48("3462")) {
        {
        }
    } else {
        stryCov_9fa48("3462");
        return stryMutAct_9fa48("3465")
            ? !ch && !isAlphaNum(ch)
            : stryMutAct_9fa48("3464")
              ? false
              : stryMutAct_9fa48("3463")
                ? true
                : (stryCov_9fa48("3463", "3464", "3465"),
                  (stryMutAct_9fa48("3466") ? ch : (stryCov_9fa48("3466"), !ch)) ||
                      (stryMutAct_9fa48("3467") ? isAlphaNum(ch) : (stryCov_9fa48("3467"), !isAlphaNum(ch))));
    }
}
export function isTokenChar(ch: string): boolean {
    if (stryMutAct_9fa48("3468")) {
        {
        }
    } else {
        stryCov_9fa48("3468");
        if (
            stryMutAct_9fa48("3471")
                ? false
                : stryMutAct_9fa48("3470")
                  ? true
                  : stryMutAct_9fa48("3469")
                    ? ch
                    : (stryCov_9fa48("3469", "3470", "3471"), !ch)
        )
            return stryMutAct_9fa48("3472") ? true : (stryCov_9fa48("3472"), false);
        if (
            stryMutAct_9fa48("3474")
                ? false
                : stryMutAct_9fa48("3473")
                  ? true
                  : (stryCov_9fa48("3473", "3474"),
                    (stryMutAct_9fa48("3476")
                        ? /\p{L}|\P{N}/u
                        : stryMutAct_9fa48("3475")
                          ? /\P{L}|\p{N}/u
                          : (stryCov_9fa48("3475", "3476"), /\p{L}|\p{N}/u)
                    ).test(ch))
        )
            return stryMutAct_9fa48("3477") ? false : (stryCov_9fa48("3477"), true);
        return stryMutAct_9fa48("3480")
            ? (ch === "." ||
                  ch === "+" ||
                  ch === "#" ||
                  ch === "_" ||
                  ch === "/" ||
                  ch === "-" ||
                  ch === "\u2011" ||
                  ch === "\u2010" ||
                  ch === "\u2012" ||
                  ch === "\u2013" ||
                  ch === "\u2014" ||
                  ch === "'") &&
                  ch === "\u2019"
            : stryMutAct_9fa48("3479")
              ? false
              : stryMutAct_9fa48("3478")
                ? true
                : (stryCov_9fa48("3478", "3479", "3480"),
                  (stryMutAct_9fa48("3482")
                      ? (ch === "." ||
                            ch === "+" ||
                            ch === "#" ||
                            ch === "_" ||
                            ch === "/" ||
                            ch === "-" ||
                            ch === "\u2011" ||
                            ch === "\u2010" ||
                            ch === "\u2012" ||
                            ch === "\u2013" ||
                            ch === "\u2014") &&
                        ch === "'"
                      : stryMutAct_9fa48("3481")
                        ? false
                        : (stryCov_9fa48("3481", "3482"),
                          (stryMutAct_9fa48("3484")
                              ? (ch === "." ||
                                    ch === "+" ||
                                    ch === "#" ||
                                    ch === "_" ||
                                    ch === "/" ||
                                    ch === "-" ||
                                    ch === "\u2011" ||
                                    ch === "\u2010" ||
                                    ch === "\u2012" ||
                                    ch === "\u2013") &&
                                ch === "\u2014"
                              : stryMutAct_9fa48("3483")
                                ? false
                                : (stryCov_9fa48("3483", "3484"),
                                  (stryMutAct_9fa48("3486")
                                      ? (ch === "." ||
                                            ch === "+" ||
                                            ch === "#" ||
                                            ch === "_" ||
                                            ch === "/" ||
                                            ch === "-" ||
                                            ch === "\u2011" ||
                                            ch === "\u2010" ||
                                            ch === "\u2012") &&
                                        ch === "\u2013"
                                      : stryMutAct_9fa48("3485")
                                        ? false
                                        : (stryCov_9fa48("3485", "3486"),
                                          (stryMutAct_9fa48("3488")
                                              ? (ch === "." ||
                                                    ch === "+" ||
                                                    ch === "#" ||
                                                    ch === "_" ||
                                                    ch === "/" ||
                                                    ch === "-" ||
                                                    ch === "\u2011" ||
                                                    ch === "\u2010") &&
                                                ch === "\u2012"
                                              : stryMutAct_9fa48("3487")
                                                ? false
                                                : (stryCov_9fa48("3487", "3488"),
                                                  (stryMutAct_9fa48("3490")
                                                      ? (ch === "." ||
                                                            ch === "+" ||
                                                            ch === "#" ||
                                                            ch === "_" ||
                                                            ch === "/" ||
                                                            ch === "-" ||
                                                            ch === "\u2011") &&
                                                        ch === "\u2010"
                                                      : stryMutAct_9fa48("3489")
                                                        ? false
                                                        : (stryCov_9fa48("3489", "3490"),
                                                          (stryMutAct_9fa48("3492")
                                                              ? (ch === "." ||
                                                                    ch === "+" ||
                                                                    ch === "#" ||
                                                                    ch === "_" ||
                                                                    ch === "/" ||
                                                                    ch === "-") &&
                                                                ch === "\u2011"
                                                              : stryMutAct_9fa48("3491")
                                                                ? false
                                                                : (stryCov_9fa48("3491", "3492"),
                                                                  (stryMutAct_9fa48("3494")
                                                                      ? (ch === "." ||
                                                                            ch === "+" ||
                                                                            ch === "#" ||
                                                                            ch === "_" ||
                                                                            ch === "/") &&
                                                                        ch === "-"
                                                                      : stryMutAct_9fa48("3493")
                                                                        ? false
                                                                        : (stryCov_9fa48("3493", "3494"),
                                                                          (stryMutAct_9fa48("3496")
                                                                              ? (ch === "." ||
                                                                                    ch === "+" ||
                                                                                    ch === "#" ||
                                                                                    ch === "_") &&
                                                                                ch === "/"
                                                                              : stryMutAct_9fa48("3495")
                                                                                ? false
                                                                                : (stryCov_9fa48(
                                                                                      "3495",
                                                                                      "3496"
                                                                                  ),
                                                                                  (stryMutAct_9fa48("3498")
                                                                                      ? (ch === "." ||
                                                                                            ch === "+" ||
                                                                                            ch === "#") &&
                                                                                        ch === "_"
                                                                                      : stryMutAct_9fa48(
                                                                                              "3497"
                                                                                          )
                                                                                        ? false
                                                                                        : (stryCov_9fa48(
                                                                                              "3497",
                                                                                              "3498"
                                                                                          ),
                                                                                          (stryMutAct_9fa48(
                                                                                              "3500"
                                                                                          )
                                                                                              ? (ch === "." ||
                                                                                                    ch ===
                                                                                                        "+") &&
                                                                                                ch === "#"
                                                                                              : stryMutAct_9fa48(
                                                                                                      "3499"
                                                                                                  )
                                                                                                ? false
                                                                                                : (stryCov_9fa48(
                                                                                                      "3499",
                                                                                                      "3500"
                                                                                                  ),
                                                                                                  (stryMutAct_9fa48(
                                                                                                      "3502"
                                                                                                  )
                                                                                                      ? ch ===
                                                                                                            "." &&
                                                                                                        ch ===
                                                                                                            "+"
                                                                                                      : stryMutAct_9fa48(
                                                                                                              "3501"
                                                                                                          )
                                                                                                        ? false
                                                                                                        : (stryCov_9fa48(
                                                                                                              "3501",
                                                                                                              "3502"
                                                                                                          ),
                                                                                                          (stryMutAct_9fa48(
                                                                                                              "3504"
                                                                                                          )
                                                                                                              ? ch !==
                                                                                                                "."
                                                                                                              : stryMutAct_9fa48(
                                                                                                                      "3503"
                                                                                                                  )
                                                                                                                ? false
                                                                                                                : (stryCov_9fa48(
                                                                                                                      "3503",
                                                                                                                      "3504"
                                                                                                                  ),
                                                                                                                  ch ===
                                                                                                                      (stryMutAct_9fa48(
                                                                                                                          "3505"
                                                                                                                      )
                                                                                                                          ? ""
                                                                                                                          : (stryCov_9fa48(
                                                                                                                                "3505"
                                                                                                                            ),
                                                                                                                            ".")))) ||
                                                                                                              (stryMutAct_9fa48(
                                                                                                                  "3507"
                                                                                                              )
                                                                                                                  ? ch !==
                                                                                                                    "+"
                                                                                                                  : stryMutAct_9fa48(
                                                                                                                          "3506"
                                                                                                                      )
                                                                                                                    ? false
                                                                                                                    : (stryCov_9fa48(
                                                                                                                          "3506",
                                                                                                                          "3507"
                                                                                                                      ),
                                                                                                                      ch ===
                                                                                                                          (stryMutAct_9fa48(
                                                                                                                              "3508"
                                                                                                                          )
                                                                                                                              ? ""
                                                                                                                              : (stryCov_9fa48(
                                                                                                                                    "3508"
                                                                                                                                ),
                                                                                                                                "+")))))) ||
                                                                                                      (stryMutAct_9fa48(
                                                                                                          "3510"
                                                                                                      )
                                                                                                          ? ch !==
                                                                                                            "#"
                                                                                                          : stryMutAct_9fa48(
                                                                                                                  "3509"
                                                                                                              )
                                                                                                            ? false
                                                                                                            : (stryCov_9fa48(
                                                                                                                  "3509",
                                                                                                                  "3510"
                                                                                                              ),
                                                                                                              ch ===
                                                                                                                  (stryMutAct_9fa48(
                                                                                                                      "3511"
                                                                                                                  )
                                                                                                                      ? ""
                                                                                                                      : (stryCov_9fa48(
                                                                                                                            "3511"
                                                                                                                        ),
                                                                                                                        "#")))))) ||
                                                                                              (stryMutAct_9fa48(
                                                                                                  "3513"
                                                                                              )
                                                                                                  ? ch !== "_"
                                                                                                  : stryMutAct_9fa48(
                                                                                                          "3512"
                                                                                                      )
                                                                                                    ? false
                                                                                                    : (stryCov_9fa48(
                                                                                                          "3512",
                                                                                                          "3513"
                                                                                                      ),
                                                                                                      ch ===
                                                                                                          (stryMutAct_9fa48(
                                                                                                              "3514"
                                                                                                          )
                                                                                                              ? ""
                                                                                                              : (stryCov_9fa48(
                                                                                                                    "3514"
                                                                                                                ),
                                                                                                                "_")))))) ||
                                                                                      (stryMutAct_9fa48(
                                                                                          "3516"
                                                                                      )
                                                                                          ? ch !== "/"
                                                                                          : stryMutAct_9fa48(
                                                                                                  "3515"
                                                                                              )
                                                                                            ? false
                                                                                            : (stryCov_9fa48(
                                                                                                  "3515",
                                                                                                  "3516"
                                                                                              ),
                                                                                              ch ===
                                                                                                  (stryMutAct_9fa48(
                                                                                                      "3517"
                                                                                                  )
                                                                                                      ? ""
                                                                                                      : (stryCov_9fa48(
                                                                                                            "3517"
                                                                                                        ),
                                                                                                        "/")))))) ||
                                                                              (stryMutAct_9fa48("3519")
                                                                                  ? ch !== "-"
                                                                                  : stryMutAct_9fa48("3518")
                                                                                    ? false
                                                                                    : (stryCov_9fa48(
                                                                                          "3518",
                                                                                          "3519"
                                                                                      ),
                                                                                      ch ===
                                                                                          (stryMutAct_9fa48(
                                                                                              "3520"
                                                                                          )
                                                                                              ? ""
                                                                                              : (stryCov_9fa48(
                                                                                                    "3520"
                                                                                                ),
                                                                                                "-")))))) ||
                                                                      (stryMutAct_9fa48("3522")
                                                                          ? ch !== "\u2011"
                                                                          : stryMutAct_9fa48("3521")
                                                                            ? false
                                                                            : (stryCov_9fa48("3521", "3522"),
                                                                              ch ===
                                                                                  (stryMutAct_9fa48("3523")
                                                                                      ? ""
                                                                                      : (stryCov_9fa48(
                                                                                            "3523"
                                                                                        ),
                                                                                        "\u2011")))))) ||
                                                              (stryMutAct_9fa48("3525")
                                                                  ? ch !== "\u2010"
                                                                  : stryMutAct_9fa48("3524")
                                                                    ? false
                                                                    : (stryCov_9fa48("3524", "3525"),
                                                                      ch ===
                                                                          (stryMutAct_9fa48("3526")
                                                                              ? ""
                                                                              : (stryCov_9fa48("3526"),
                                                                                "\u2010")))))) ||
                                                      (stryMutAct_9fa48("3528")
                                                          ? ch !== "\u2012"
                                                          : stryMutAct_9fa48("3527")
                                                            ? false
                                                            : (stryCov_9fa48("3527", "3528"),
                                                              ch ===
                                                                  (stryMutAct_9fa48("3529")
                                                                      ? ""
                                                                      : (stryCov_9fa48("3529"),
                                                                        "\u2012")))))) ||
                                              (stryMutAct_9fa48("3531")
                                                  ? ch !== "\u2013"
                                                  : stryMutAct_9fa48("3530")
                                                    ? false
                                                    : (stryCov_9fa48("3530", "3531"),
                                                      ch ===
                                                          (stryMutAct_9fa48("3532")
                                                              ? ""
                                                              : (stryCov_9fa48("3532"), "\u2013")))))) ||
                                      (stryMutAct_9fa48("3534")
                                          ? ch !== "\u2014"
                                          : stryMutAct_9fa48("3533")
                                            ? false
                                            : (stryCov_9fa48("3533", "3534"),
                                              ch ===
                                                  (stryMutAct_9fa48("3535")
                                                      ? ""
                                                      : (stryCov_9fa48("3535"), "\u2014")))))) ||
                              (stryMutAct_9fa48("3537")
                                  ? ch !== "'"
                                  : stryMutAct_9fa48("3536")
                                    ? false
                                    : (stryCov_9fa48("3536", "3537"),
                                      ch ===
                                          (stryMutAct_9fa48("3538")
                                              ? ""
                                              : (stryCov_9fa48("3538"), "'")))))) ||
                      (stryMutAct_9fa48("3540")
                          ? ch !== "\u2019"
                          : stryMutAct_9fa48("3539")
                            ? false
                            : (stryCov_9fa48("3539", "3540"),
                              ch === (stryMutAct_9fa48("3541") ? "" : (stryCov_9fa48("3541"), "\u2019")))));
    }
}
export function isLinkChar(ch: string): boolean {
    if (stryMutAct_9fa48("3542")) {
        {
        }
    } else {
        stryCov_9fa48("3542");
        if (
            stryMutAct_9fa48("3545")
                ? false
                : stryMutAct_9fa48("3544")
                  ? true
                  : stryMutAct_9fa48("3543")
                    ? ch
                    : (stryCov_9fa48("3543", "3544", "3545"), !ch)
        )
            return stryMutAct_9fa48("3546") ? true : (stryCov_9fa48("3546"), false);
        if (
            stryMutAct_9fa48("3548")
                ? false
                : stryMutAct_9fa48("3547")
                  ? true
                  : (stryCov_9fa48("3547", "3548"),
                    (stryMutAct_9fa48("3549") ? /\S/u : (stryCov_9fa48("3549"), /\s/u)).test(ch))
        )
            return stryMutAct_9fa48("3550") ? true : (stryCov_9fa48("3550"), false);
        if (
            stryMutAct_9fa48("3552")
                ? false
                : stryMutAct_9fa48("3551")
                  ? true
                  : (stryCov_9fa48("3551", "3552"),
                    (stryMutAct_9fa48("3554")
                        ? /\p{L}|\P{N}/u
                        : stryMutAct_9fa48("3553")
                          ? /\P{L}|\p{N}/u
                          : (stryCov_9fa48("3553", "3554"), /\p{L}|\p{N}/u)
                    ).test(ch))
        )
            return stryMutAct_9fa48("3555") ? false : (stryCov_9fa48("3555"), true);
        return (
            stryMutAct_9fa48("3556") ? /[^:/@?&=%#._+~;-]/u : (stryCov_9fa48("3556"), /[:/@?&=%#._+~;-]/u)
        ).test(ch);
    }
}
export function trailingTokenFragment(text: string): {
    frag: string;
    startCpIndex: number;
} | null {
    if (stryMutAct_9fa48("3557")) {
        {
        }
    } else {
        stryCov_9fa48("3557");
        const cps = getCpArray(text);
        if (
            stryMutAct_9fa48("3560")
                ? cps.length !== 0
                : stryMutAct_9fa48("3559")
                  ? false
                  : stryMutAct_9fa48("3558")
                    ? true
                    : (stryCov_9fa48("3558", "3559", "3560"), cps.length === 0)
        )
            return null;
        const lastCp =
            cps[stryMutAct_9fa48("3561") ? cps.length + 1 : (stryCov_9fa48("3561"), cps.length - 1)];
        if (
            stryMutAct_9fa48("3564")
                ? !lastCp && /\s/u.test(lastCp)
                : stryMutAct_9fa48("3563")
                  ? false
                  : stryMutAct_9fa48("3562")
                    ? true
                    : (stryCov_9fa48("3562", "3563", "3564"),
                      (stryMutAct_9fa48("3565") ? lastCp : (stryCov_9fa48("3565"), !lastCp)) ||
                          (stryMutAct_9fa48("3566") ? /\S/u : (stryCov_9fa48("3566"), /\s/u)).test(lastCp))
        )
            return null;
        let i = stryMutAct_9fa48("3567") ? cps.length + 1 : (stryCov_9fa48("3567"), cps.length - 1);
        while (
            stryMutAct_9fa48("3570")
                ? i < 0
                : stryMutAct_9fa48("3569")
                  ? i > 0
                  : stryMutAct_9fa48("3568")
                    ? false
                    : (stryCov_9fa48("3568", "3569", "3570"), i >= 0)
        ) {
            if (stryMutAct_9fa48("3571")) {
                {
                }
            } else {
                stryCov_9fa48("3571");
                const cp = cps[i];
                if (
                    stryMutAct_9fa48("3574")
                        ? !cp && !isTokenChar(cp)
                        : stryMutAct_9fa48("3573")
                          ? false
                          : stryMutAct_9fa48("3572")
                            ? true
                            : (stryCov_9fa48("3572", "3573", "3574"),
                              (stryMutAct_9fa48("3575") ? cp : (stryCov_9fa48("3575"), !cp)) ||
                                  (stryMutAct_9fa48("3576")
                                      ? isTokenChar(cp)
                                      : (stryCov_9fa48("3576"), !isTokenChar(cp))))
                )
                    break;
                stryMutAct_9fa48("3577") ? i++ : (stryCov_9fa48("3577"), i--);
            }
        }
        const start = stryMutAct_9fa48("3578") ? i - 1 : (stryCov_9fa48("3578"), i + 1);
        if (
            stryMutAct_9fa48("3582")
                ? start < cps.length
                : stryMutAct_9fa48("3581")
                  ? start > cps.length
                  : stryMutAct_9fa48("3580")
                    ? false
                    : stryMutAct_9fa48("3579")
                      ? true
                      : (stryCov_9fa48("3579", "3580", "3581", "3582"), start >= cps.length)
        )
            return null;
        const frag = stryMutAct_9fa48("3583")
            ? cps.join("")
            : (stryCov_9fa48("3583"),
              cps
                  .slice(start)
                  .join(stryMutAct_9fa48("3584") ? "Stryker was here!" : (stryCov_9fa48("3584"), "")));
        return stryMutAct_9fa48("3585")
            ? {}
            : (stryCov_9fa48("3585"),
              {
                  frag,
                  startCpIndex: start,
              });
    }
}
export function trailingLinkFragment(text: string): {
    frag: string;
    startCpIndex: number;
} | null {
    if (stryMutAct_9fa48("3586")) {
        {
        }
    } else {
        stryCov_9fa48("3586");
        const cps = getCpArray(text);
        if (
            stryMutAct_9fa48("3589")
                ? cps.length !== 0
                : stryMutAct_9fa48("3588")
                  ? false
                  : stryMutAct_9fa48("3587")
                    ? true
                    : (stryCov_9fa48("3587", "3588", "3589"), cps.length === 0)
        )
            return null;
        const lastCp =
            cps[stryMutAct_9fa48("3590") ? cps.length + 1 : (stryCov_9fa48("3590"), cps.length - 1)];
        if (
            stryMutAct_9fa48("3593")
                ? !lastCp && /\s/u.test(lastCp)
                : stryMutAct_9fa48("3592")
                  ? false
                  : stryMutAct_9fa48("3591")
                    ? true
                    : (stryCov_9fa48("3591", "3592", "3593"),
                      (stryMutAct_9fa48("3594") ? lastCp : (stryCov_9fa48("3594"), !lastCp)) ||
                          (stryMutAct_9fa48("3595") ? /\S/u : (stryCov_9fa48("3595"), /\s/u)).test(lastCp))
        )
            return null;
        let i = stryMutAct_9fa48("3596") ? cps.length + 1 : (stryCov_9fa48("3596"), cps.length - 1);
        while (
            stryMutAct_9fa48("3599")
                ? i < 0
                : stryMutAct_9fa48("3598")
                  ? i > 0
                  : stryMutAct_9fa48("3597")
                    ? false
                    : (stryCov_9fa48("3597", "3598", "3599"), i >= 0)
        ) {
            if (stryMutAct_9fa48("3600")) {
                {
                }
            } else {
                stryCov_9fa48("3600");
                const cp = cps[i];
                if (
                    stryMutAct_9fa48("3603")
                        ? !cp && !isLinkChar(cp)
                        : stryMutAct_9fa48("3602")
                          ? false
                          : stryMutAct_9fa48("3601")
                            ? true
                            : (stryCov_9fa48("3601", "3602", "3603"),
                              (stryMutAct_9fa48("3604") ? cp : (stryCov_9fa48("3604"), !cp)) ||
                                  (stryMutAct_9fa48("3605")
                                      ? isLinkChar(cp)
                                      : (stryCov_9fa48("3605"), !isLinkChar(cp))))
                )
                    break;
                stryMutAct_9fa48("3606") ? i++ : (stryCov_9fa48("3606"), i--);
            }
        }
        const start = stryMutAct_9fa48("3607") ? i - 1 : (stryCov_9fa48("3607"), i + 1);
        if (
            stryMutAct_9fa48("3611")
                ? start < cps.length
                : stryMutAct_9fa48("3610")
                  ? start > cps.length
                  : stryMutAct_9fa48("3609")
                    ? false
                    : stryMutAct_9fa48("3608")
                      ? true
                      : (stryCov_9fa48("3608", "3609", "3610", "3611"), start >= cps.length)
        )
            return null;
        const frag = stryMutAct_9fa48("3612")
            ? cps.join("")
            : (stryCov_9fa48("3612"),
              cps
                  .slice(start)
                  .join(stryMutAct_9fa48("3613") ? "Stryker was here!" : (stryCov_9fa48("3613"), "")));
        return stryMutAct_9fa48("3614")
            ? {}
            : (stryCov_9fa48("3614"),
              {
                  frag,
                  startCpIndex: start,
              });
    }
}
