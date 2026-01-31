// @ts-nocheck
// src/shared/ooxml/converterUtils.ts
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
import { WORD_NS } from "./dom";
import { isTokenChar } from "./common";

// --- XML Safety ---
// Single source of truth (avoid drift)
export { isSafeXml } from "./xmlSafety";

// --- DOM Helpers ---
export function removeProofingTags(doc: Document) {
    if (stryMutAct_9fa48("3615")) {
        {
        }
    } else {
        stryCov_9fa48("3615");
        const errs = Array.from(
            doc.getElementsByTagNameNS(
                WORD_NS,
                stryMutAct_9fa48("3616") ? "" : (stryCov_9fa48("3616"), "proofErr")
            )
        );
        for (const el of errs) {
            if (stryMutAct_9fa48("3617")) {
                {
                }
            } else {
                stryCov_9fa48("3617");
                if (
                    stryMutAct_9fa48("3619")
                        ? false
                        : stryMutAct_9fa48("3618")
                          ? true
                          : (stryCov_9fa48("3618", "3619"), el.parentNode)
                )
                    el.parentNode.removeChild(el);
            }
        }
    }
}
export function ensureLangOnRPr(doc: Document, rPr: Element, lang: string) {
    if (stryMutAct_9fa48("3620")) {
        {
        }
    } else {
        stryCov_9fa48("3620");
        let langEl = Array.from(rPr.children).find(
            stryMutAct_9fa48("3621")
                ? () => undefined
                : (stryCov_9fa48("3621"),
                  (c) =>
                      stryMutAct_9fa48("3624")
                          ? c.localName !== "lang"
                          : stryMutAct_9fa48("3623")
                            ? false
                            : stryMutAct_9fa48("3622")
                              ? true
                              : (stryCov_9fa48("3622", "3623", "3624"),
                                c.localName ===
                                    (stryMutAct_9fa48("3625") ? "" : (stryCov_9fa48("3625"), "lang"))))
        );
        if (
            stryMutAct_9fa48("3628")
                ? false
                : stryMutAct_9fa48("3627")
                  ? true
                  : stryMutAct_9fa48("3626")
                    ? langEl
                    : (stryCov_9fa48("3626", "3627", "3628"), !langEl)
        ) {
            if (stryMutAct_9fa48("3629")) {
                {
                }
            } else {
                stryCov_9fa48("3629");
                langEl = doc.createElementNS(
                    WORD_NS,
                    stryMutAct_9fa48("3630") ? "" : (stryCov_9fa48("3630"), "w:lang")
                );
                rPr.appendChild(langEl);
            }
        }
        langEl.setAttributeNS(
            WORD_NS,
            stryMutAct_9fa48("3631") ? "" : (stryCov_9fa48("3631"), "w:val"),
            lang
        );
        langEl.setAttributeNS(
            WORD_NS,
            stryMutAct_9fa48("3632") ? "" : (stryCov_9fa48("3632"), "w:eastAsia"),
            lang
        );
        langEl.setAttributeNS(
            WORD_NS,
            stryMutAct_9fa48("3633") ? "" : (stryCov_9fa48("3633"), "w:bidi"),
            lang
        );
    }
}
export function getDirectChild(run: Element, localName: string): Element | null {
    if (stryMutAct_9fa48("3634")) {
        {
        }
    } else {
        stryCov_9fa48("3634");
        const el = Array.from(run.children).find(
            stryMutAct_9fa48("3635")
                ? () => undefined
                : (stryCov_9fa48("3635"),
                  (c) =>
                      stryMutAct_9fa48("3638")
                          ? c.localName !== "rPr"
                          : stryMutAct_9fa48("3637")
                            ? false
                            : stryMutAct_9fa48("3636")
                              ? true
                              : (stryCov_9fa48("3636", "3637", "3638"),
                                c.localName ===
                                    (stryMutAct_9fa48("3639") ? "" : (stryCov_9fa48("3639"), "rPr"))))
        );
        if (
            stryMutAct_9fa48("3642")
                ? localName === "rPr"
                : stryMutAct_9fa48("3641")
                  ? false
                  : stryMutAct_9fa48("3640")
                    ? true
                    : (stryCov_9fa48("3640", "3641", "3642"),
                      localName !== (stryMutAct_9fa48("3643") ? "" : (stryCov_9fa48("3643"), "rPr")))
        ) {
            if (stryMutAct_9fa48("3644")) {
                {
                }
            } else {
                stryCov_9fa48("3644");
                const other = Array.from(run.children).find(
                    stryMutAct_9fa48("3645")
                        ? () => undefined
                        : (stryCov_9fa48("3645"),
                          (c) =>
                              stryMutAct_9fa48("3648")
                                  ? c.localName !== localName
                                  : stryMutAct_9fa48("3647")
                                    ? false
                                    : stryMutAct_9fa48("3646")
                                      ? true
                                      : (stryCov_9fa48("3646", "3647", "3648"), c.localName === localName))
                );
                return stryMutAct_9fa48("3649") ? other && null : (stryCov_9fa48("3649"), other ?? null);
            }
        }
        return stryMutAct_9fa48("3650") ? el && null : (stryCov_9fa48("3650"), el ?? null);
    }
}
export function findAncestor(el: Element, localName: string): Element | null {
    if (stryMutAct_9fa48("3651")) {
        {
        }
    } else {
        stryCov_9fa48("3651");
        let cur: Element | null = el;
        while (stryMutAct_9fa48("3652") ? false : (stryCov_9fa48("3652"), cur)) {
            if (stryMutAct_9fa48("3653")) {
                {
                }
            } else {
                stryCov_9fa48("3653");
                if (
                    stryMutAct_9fa48("3656")
                        ? cur.localName !== localName
                        : stryMutAct_9fa48("3655")
                          ? false
                          : stryMutAct_9fa48("3654")
                            ? true
                            : (stryCov_9fa48("3654", "3655", "3656"), cur.localName === localName)
                )
                    return cur;
                cur = cur.parentElement;
            }
        }
        return null;
    }
}

// --- Text Analysis ---
export type WordSpan = {
    startCp: number;
    endCp: number;
    text: string;
};
export function extractLetterWordSpans(text: string): WordSpan[] {
    if (stryMutAct_9fa48("3657")) {
        {
        }
    } else {
        stryCov_9fa48("3657");
        const cps = Array.from(
            text.normalize(stryMutAct_9fa48("3658") ? "" : (stryCov_9fa48("3658"), "NFC"))
        );
        const out: WordSpan[] = stryMutAct_9fa48("3659") ? ["Stryker was here"] : (stryCov_9fa48("3659"), []);
        let i = 0;
        while (
            stryMutAct_9fa48("3662")
                ? i >= cps.length
                : stryMutAct_9fa48("3661")
                  ? i <= cps.length
                  : stryMutAct_9fa48("3660")
                    ? false
                    : (stryCov_9fa48("3660", "3661", "3662"), i < cps.length)
        ) {
            if (stryMutAct_9fa48("3663")) {
                {
                }
            } else {
                stryCov_9fa48("3663");
                const cp = cps[i];
                if (
                    stryMutAct_9fa48("3666")
                        ? !cp && !isTokenChar(cp)
                        : stryMutAct_9fa48("3665")
                          ? false
                          : stryMutAct_9fa48("3664")
                            ? true
                            : (stryCov_9fa48("3664", "3665", "3666"),
                              (stryMutAct_9fa48("3667") ? cp : (stryCov_9fa48("3667"), !cp)) ||
                                  (stryMutAct_9fa48("3668")
                                      ? isTokenChar(cp)
                                      : (stryCov_9fa48("3668"), !isTokenChar(cp))))
                ) {
                    if (stryMutAct_9fa48("3669")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3669");
                        stryMutAct_9fa48("3670") ? i-- : (stryCov_9fa48("3670"), i++);
                        continue;
                    }
                }
                const start = i;
                let hasLetter = stryMutAct_9fa48("3671") ? true : (stryCov_9fa48("3671"), false);
                while (
                    stryMutAct_9fa48("3674")
                        ? i >= cps.length
                        : stryMutAct_9fa48("3673")
                          ? i <= cps.length
                          : stryMutAct_9fa48("3672")
                            ? false
                            : (stryCov_9fa48("3672", "3673", "3674"), i < cps.length)
                ) {
                    if (stryMutAct_9fa48("3675")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3675");
                        const cp2 = cps[i];
                        if (
                            stryMutAct_9fa48("3678")
                                ? !cp2 && !isTokenChar(cp2)
                                : stryMutAct_9fa48("3677")
                                  ? false
                                  : stryMutAct_9fa48("3676")
                                    ? true
                                    : (stryCov_9fa48("3676", "3677", "3678"),
                                      (stryMutAct_9fa48("3679") ? cp2 : (stryCov_9fa48("3679"), !cp2)) ||
                                          (stryMutAct_9fa48("3680")
                                              ? isTokenChar(cp2)
                                              : (stryCov_9fa48("3680"), !isTokenChar(cp2))))
                        )
                            break;
                        if (
                            stryMutAct_9fa48("3682")
                                ? false
                                : stryMutAct_9fa48("3681")
                                  ? true
                                  : (stryCov_9fa48("3681", "3682"),
                                    (stryMutAct_9fa48("3683")
                                        ? /\P{L}/u
                                        : (stryCov_9fa48("3683"), /\p{L}/u)
                                    ).test(cp2))
                        )
                            hasLetter = stryMutAct_9fa48("3684") ? false : (stryCov_9fa48("3684"), true);
                        stryMutAct_9fa48("3685") ? i-- : (stryCov_9fa48("3685"), i++);
                    }
                }
                const end = i;
                if (
                    stryMutAct_9fa48("3687")
                        ? false
                        : stryMutAct_9fa48("3686")
                          ? true
                          : (stryCov_9fa48("3686", "3687"), hasLetter)
                ) {
                    if (stryMutAct_9fa48("3688")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3688");
                        out.push(
                            stryMutAct_9fa48("3689")
                                ? {}
                                : (stryCov_9fa48("3689"),
                                  {
                                      startCp: start,
                                      endCp: end,
                                      text: stryMutAct_9fa48("3690")
                                          ? cps.join("")
                                          : (stryCov_9fa48("3690"),
                                            cps
                                                .slice(start, end)
                                                .join(
                                                    stryMutAct_9fa48("3691")
                                                        ? "Stryker was here!"
                                                        : (stryCov_9fa48("3691"), "")
                                                )),
                                  })
                        );
                    }
                }
            }
        }
        return out;
    }
}
export function countMatches(text: string, re: RegExp): number {
    if (stryMutAct_9fa48("3692")) {
        {
        }
    } else {
        stryCov_9fa48("3692");
        if (
            stryMutAct_9fa48("3695")
                ? false
                : stryMutAct_9fa48("3694")
                  ? true
                  : stryMutAct_9fa48("3693")
                    ? re.global
                    : (stryCov_9fa48("3693", "3694", "3695"), !re.global)
        )
            return re.test(text) ? 1 : 0;
        re.lastIndex = 0;
        let c = 0;
        while (stryMutAct_9fa48("3696") ? false : (stryCov_9fa48("3696"), re.exec(text)))
            stryMutAct_9fa48("3697") ? c-- : (stryCov_9fa48("3697"), c++);
        return c;
    }
}
export function toAscii(text: string): string {
    if (stryMutAct_9fa48("3698")) {
        {
        }
    } else {
        stryCov_9fa48("3698");
        const map: Record<string, string> = stryMutAct_9fa48("3699")
            ? {}
            : (stryCov_9fa48("3699"),
              {
                  č: stryMutAct_9fa48("3700") ? "" : (stryCov_9fa48("3700"), "c"),
                  ć: stryMutAct_9fa48("3701") ? "" : (stryCov_9fa48("3701"), "c"),
                  š: stryMutAct_9fa48("3702") ? "" : (stryCov_9fa48("3702"), "s"),
                  đ: stryMutAct_9fa48("3703") ? "" : (stryCov_9fa48("3703"), "dj"),
                  ž: stryMutAct_9fa48("3704") ? "" : (stryCov_9fa48("3704"), "z"),
                  Č: stryMutAct_9fa48("3705") ? "" : (stryCov_9fa48("3705"), "C"),
                  Ć: stryMutAct_9fa48("3706") ? "" : (stryCov_9fa48("3706"), "C"),
                  Š: stryMutAct_9fa48("3707") ? "" : (stryCov_9fa48("3707"), "S"),
                  Đ: stryMutAct_9fa48("3708") ? "" : (stryCov_9fa48("3708"), "Dj"),
                  Ž: stryMutAct_9fa48("3709") ? "" : (stryCov_9fa48("3709"), "Z"),
              });
        return text.replace(
            stryMutAct_9fa48("3710") ? /[^čćšđžČĆŠĐŽ]/g : (stryCov_9fa48("3710"), /[čćšđžČĆŠĐŽ]/g),
            stryMutAct_9fa48("3711")
                ? () => undefined
                : (stryCov_9fa48("3711"),
                  (m) => (stryMutAct_9fa48("3712") ? map[m] && m : (stryCov_9fa48("3712"), map[m] ?? m)))
        );
    }
}
