// @ts-nocheck
// src/shared/ooxml/code.ts
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
import { QUOTE_VARIANTS_RE, OPEN_QUOTE, CLOSE_QUOTE } from "./quoteConstants";
export type CodeState = {
    inFence: boolean; // ``` ... ```
    inInline: boolean; // ` ... `
};
export type CodeParseStats = {
    fenceMarkersSeen: number; // koliko puta je viđeno ```
    inlineTicksSeen: number; // koliko puta je viđeno `
};
export function createInitialCodeState(): CodeState {
    if (stryMutAct_9fa48("3315")) {
        {
        }
    } else {
        stryCov_9fa48("3315");
        return stryMutAct_9fa48("3316")
            ? {}
            : (stryCov_9fa48("3316"),
              {
                  inFence: stryMutAct_9fa48("3317") ? true : (stryCov_9fa48("3317"), false),
                  inInline: stryMutAct_9fa48("3318") ? true : (stryCov_9fa48("3318"), false),
              });
    }
}
export function createInitialCodeParseStats(): CodeParseStats {
    if (stryMutAct_9fa48("3319")) {
        {
        }
    } else {
        stryCov_9fa48("3319");
        return stryMutAct_9fa48("3320")
            ? {}
            : (stryCov_9fa48("3320"),
              {
                  fenceMarkersSeen: 0,
                  inlineTicksSeen: 0,
              });
    }
}

/**
 * Podeli tekst na segmente u/van koda i vrati transformisani tekst.
 * - ``` toggluje inFence
 * - ` toggluje inInline samo kad NISMO u fence bloku
 */
export function transformTextRespectingCode(
    input: string,
    state: CodeState,
    transformNonCode: (s: string) => string,
    transformCode: (s: string) => string = stryMutAct_9fa48("3321")
        ? () => undefined
        : (stryCov_9fa48("3321"), (s) => s),
    stats?: CodeParseStats
): string {
    if (stryMutAct_9fa48("3322")) {
        {
        }
    } else {
        stryCov_9fa48("3322");
        let out = stryMutAct_9fa48("3323") ? "Stryker was here!" : (stryCov_9fa48("3323"), "");
        let buf = stryMutAct_9fa48("3324") ? "Stryker was here!" : (stryCov_9fa48("3324"), "");
        const flush = () => {
            if (stryMutAct_9fa48("3325")) {
                {
                }
            } else {
                stryCov_9fa48("3325");
                if (
                    stryMutAct_9fa48("3328")
                        ? false
                        : stryMutAct_9fa48("3327")
                          ? true
                          : stryMutAct_9fa48("3326")
                            ? buf
                            : (stryCov_9fa48("3326", "3327", "3328"), !buf)
                )
                    return;
                const inCode = stryMutAct_9fa48("3331")
                    ? state.inFence && state.inInline
                    : stryMutAct_9fa48("3330")
                      ? false
                      : stryMutAct_9fa48("3329")
                        ? true
                        : (stryCov_9fa48("3329", "3330", "3331"), state.inFence || state.inInline);
                stryMutAct_9fa48("3332")
                    ? (out -= inCode ? transformCode(buf) : transformNonCode(buf))
                    : (stryCov_9fa48("3332"), (out += inCode ? transformCode(buf) : transformNonCode(buf)));
                buf = stryMutAct_9fa48("3333") ? "Stryker was here!" : (stryCov_9fa48("3333"), "");
            }
        };
        let i = 0;
        while (
            stryMutAct_9fa48("3336")
                ? i >= input.length
                : stryMutAct_9fa48("3335")
                  ? i <= input.length
                  : stryMutAct_9fa48("3334")
                    ? false
                    : (stryCov_9fa48("3334", "3335", "3336"), i < input.length)
        ) {
            if (stryMutAct_9fa48("3337")) {
                {
                }
            } else {
                stryCov_9fa48("3337");
                if (
                    stryMutAct_9fa48("3340")
                        ? input.endsWith("```", i)
                        : stryMutAct_9fa48("3339")
                          ? false
                          : stryMutAct_9fa48("3338")
                            ? true
                            : (stryCov_9fa48("3338", "3339", "3340"),
                              input.startsWith(
                                  stryMutAct_9fa48("3341") ? "" : (stryCov_9fa48("3341"), "```"),
                                  i
                              ))
                ) {
                    if (stryMutAct_9fa48("3342")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3342");
                        flush();
                        out += stryMutAct_9fa48("3343") ? "" : (stryCov_9fa48("3343"), "```");
                        state.inFence = stryMutAct_9fa48("3344")
                            ? state.inFence
                            : (stryCov_9fa48("3344"), !state.inFence);
                        if (
                            stryMutAct_9fa48("3346")
                                ? false
                                : stryMutAct_9fa48("3345")
                                  ? true
                                  : (stryCov_9fa48("3345", "3346"), state.inFence)
                        )
                            state.inInline = stryMutAct_9fa48("3347") ? true : (stryCov_9fa48("3347"), false);
                        if (
                            stryMutAct_9fa48("3349")
                                ? false
                                : stryMutAct_9fa48("3348")
                                  ? true
                                  : (stryCov_9fa48("3348", "3349"), stats)
                        )
                            stryMutAct_9fa48("3350")
                                ? (stats.fenceMarkersSeen -= 1)
                                : (stryCov_9fa48("3350"), (stats.fenceMarkersSeen += 1));
                        stryMutAct_9fa48("3351") ? (i -= 3) : (stryCov_9fa48("3351"), (i += 3));
                        continue;
                    }
                }
                const ch = input[i];
                if (
                    stryMutAct_9fa48("3354")
                        ? false
                        : stryMutAct_9fa48("3353")
                          ? true
                          : stryMutAct_9fa48("3352")
                            ? ch
                            : (stryCov_9fa48("3352", "3353", "3354"), !ch)
                )
                    break;
                if (
                    stryMutAct_9fa48("3357")
                        ? ch === "`" || !state.inFence
                        : stryMutAct_9fa48("3356")
                          ? false
                          : stryMutAct_9fa48("3355")
                            ? true
                            : (stryCov_9fa48("3355", "3356", "3357"),
                              (stryMutAct_9fa48("3359")
                                  ? ch !== "`"
                                  : stryMutAct_9fa48("3358")
                                    ? true
                                    : (stryCov_9fa48("3358", "3359"),
                                      ch ===
                                          (stryMutAct_9fa48("3360") ? "" : (stryCov_9fa48("3360"), "`")))) &&
                                  (stryMutAct_9fa48("3361")
                                      ? state.inFence
                                      : (stryCov_9fa48("3361"), !state.inFence)))
                ) {
                    if (stryMutAct_9fa48("3362")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3362");
                        flush();
                        out += stryMutAct_9fa48("3363") ? "" : (stryCov_9fa48("3363"), "`");
                        state.inInline = stryMutAct_9fa48("3364")
                            ? state.inInline
                            : (stryCov_9fa48("3364"), !state.inInline);
                        if (
                            stryMutAct_9fa48("3366")
                                ? false
                                : stryMutAct_9fa48("3365")
                                  ? true
                                  : (stryCov_9fa48("3365", "3366"), stats)
                        )
                            stryMutAct_9fa48("3367")
                                ? (stats.inlineTicksSeen -= 1)
                                : (stryCov_9fa48("3367"), (stats.inlineTicksSeen += 1));
                        stryMutAct_9fa48("3368") ? (i -= 1) : (stryCov_9fa48("3368"), (i += 1));
                        continue;
                    }
                }
                stryMutAct_9fa48("3369") ? (buf -= ch) : (stryCov_9fa48("3369"), (buf += ch));
                stryMutAct_9fa48("3370") ? (i -= 1) : (stryCov_9fa48("3370"), (i += 1));
            }
        }
        flush();
        return out;
    }
}
export function transformQuotesRespectingCode(
    input: string,
    codeState: CodeState,
    quoteState: {
        open: boolean;
    }
): string {
    if (stryMutAct_9fa48("3371")) {
        {
        }
    } else {
        stryCov_9fa48("3371");
        const normalizeQuotes = stryMutAct_9fa48("3372")
            ? () => undefined
            : (stryCov_9fa48("3372"),
              (() => {
                  const normalizeQuotes = (s: string) =>
                      s.replace(
                          QUOTE_VARIANTS_RE,
                          stryMutAct_9fa48("3373") ? `` : (stryCov_9fa48("3373"), `"`)
                      );
                  return normalizeQuotes;
              })());
        return transformTextRespectingCode(
            input,
            codeState,
            (nonCode) => {
                if (stryMutAct_9fa48("3374")) {
                    {
                    }
                } else {
                    stryCov_9fa48("3374");
                    const normalized = normalizeQuotes(nonCode);
                    let out = stryMutAct_9fa48("3375") ? "Stryker was here!" : (stryCov_9fa48("3375"), "");
                    for (const ch of normalized) {
                        if (stryMutAct_9fa48("3376")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("3376");
                            if (
                                stryMutAct_9fa48("3379")
                                    ? ch !== `"`
                                    : stryMutAct_9fa48("3378")
                                      ? false
                                      : stryMutAct_9fa48("3377")
                                        ? true
                                        : (stryCov_9fa48("3377", "3378", "3379"),
                                          ch ===
                                              (stryMutAct_9fa48("3380") ? `` : (stryCov_9fa48("3380"), `"`)))
                            ) {
                                if (stryMutAct_9fa48("3381")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("3381");
                                    stryMutAct_9fa48("3382")
                                        ? (out -= quoteState.open ? CLOSE_QUOTE : OPEN_QUOTE)
                                        : (stryCov_9fa48("3382"),
                                          (out += quoteState.open ? CLOSE_QUOTE : OPEN_QUOTE));
                                    quoteState.open = stryMutAct_9fa48("3383")
                                        ? quoteState.open
                                        : (stryCov_9fa48("3383"), !quoteState.open);
                                }
                            } else {
                                if (stryMutAct_9fa48("3384")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("3384");
                                    stryMutAct_9fa48("3385")
                                        ? (out -= ch)
                                        : (stryCov_9fa48("3385"), (out += ch));
                                }
                            }
                        }
                    }
                    return out;
                }
            },
            stryMutAct_9fa48("3386") ? () => undefined : (stryCov_9fa48("3386"), (code) => code)
        );
    }
}
