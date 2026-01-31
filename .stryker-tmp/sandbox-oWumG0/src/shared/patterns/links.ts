// @ts-nocheck
// src/shared/patterns/links.ts
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
import { BALANCED_CLOSERS, CLOSER_TO_OPENER, PUNCTUATION_END_REGEX } from "./common";

// =========================
// Global regex (protect/statistics)
// =========================

export const EMAIL_RE_G = stryMutAct_9fa48("4518")
    ? /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[^A-Z]{2,}\b/giu
    : stryMutAct_9fa48("4517")
      ? /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]\b/giu
      : stryMutAct_9fa48("4516")
        ? /\b[A-Z0-9._%+-]+@[^A-Z0-9.-]+\.[A-Z]{2,}\b/giu
        : stryMutAct_9fa48("4515")
          ? /\b[A-Z0-9._%+-]+@[A-Z0-9.-]\.[A-Z]{2,}\b/giu
          : stryMutAct_9fa48("4514")
            ? /\b[^A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu
            : stryMutAct_9fa48("4513")
              ? /\b[A-Z0-9._%+-]@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu
              : (stryCov_9fa48("4513", "4514", "4515", "4516", "4517", "4518"),
                /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu);

// NOTE: ranije je bilo [^\s<>"')]+ (zabranjivalo ')').
// Sada dozvoljavamo ')', a pravilno "odsecanje" interpunkcije prepuštamo trimLinkEnd().
export const URL_RE_G = stryMutAct_9fa48("4522")
    ? /\b(?:https?:\/\/|ftp:\/\/|file:\/\/|www\.)[^\S<>"']+/giu
    : stryMutAct_9fa48("4521")
      ? /\b(?:https?:\/\/|ftp:\/\/|file:\/\/|www\.)[\s<>"']+/giu
      : stryMutAct_9fa48("4520")
        ? /\b(?:https?:\/\/|ftp:\/\/|file:\/\/|www\.)[^\s<>"']/giu
        : stryMutAct_9fa48("4519")
          ? /\b(?:https:\/\/|ftp:\/\/|file:\/\/|www\.)[^\s<>"']+/giu
          : (stryCov_9fa48("4519", "4520", "4521", "4522"),
            /\b(?:https?:\/\/|ftp:\/\/|file:\/\/|www\.)[^\s<>"']+/giu);

// mailto: (posebno, da ne dupliramo sa URI schemes)
export const MAILTO_RE_G = stryMutAct_9fa48("4525")
    ? /\bmailto:[^\S<>"']+/giu
    : stryMutAct_9fa48("4524")
      ? /\bmailto:[\s<>"']+/giu
      : stryMutAct_9fa48("4523")
        ? /\bmailto:[^\s<>"']/giu
        : (stryCov_9fa48("4523", "4524", "4525"), /\bmailto:[^\s<>"']+/giu);

// URI schemes bez tel/mailto (sip/sms/geo/skype/teams/msteams)
export const URI_SCHEMES_NO_TEL_MAILTO_RE_G = stryMutAct_9fa48("4528")
    ? /\b(?:sip|sms|geo|skype|teams|msteams):[^\S<>"']+/giu
    : stryMutAct_9fa48("4527")
      ? /\b(?:sip|sms|geo|skype|teams|msteams):[\s<>"']+/giu
      : stryMutAct_9fa48("4526")
        ? /\b(?:sip|sms|geo|skype|teams|msteams):[^\s<>"']/giu
        : (stryCov_9fa48("4526", "4527", "4528"), /\b(?:sip|sms|geo|skype|teams|msteams):[^\s<>"']+/giu);

// =========================
// Anchored patterns (OOXML bridging)
// =========================

export const LINK_PATTERNS_ANCHORED: RegExp[] = stryMutAct_9fa48("4529")
    ? []
    : (stryCov_9fa48("4529"),
      [
          stryMutAct_9fa48("4534")
              ? /^(https?:\/\/[^\S<>"']+)/iu
              : stryMutAct_9fa48("4533")
                ? /^(https?:\/\/[\s<>"']+)/iu
                : stryMutAct_9fa48("4532")
                  ? /^(https?:\/\/[^\s<>"'])/iu
                  : stryMutAct_9fa48("4531")
                    ? /^(https:\/\/[^\s<>"']+)/iu
                    : stryMutAct_9fa48("4530")
                      ? /(https?:\/\/[^\s<>"']+)/iu
                      : (stryCov_9fa48("4530", "4531", "4532", "4533", "4534"), /^(https?:\/\/[^\s<>"']+)/iu),
          stryMutAct_9fa48("4538")
              ? /^(ftp:\/\/[^\S<>"']+)/iu
              : stryMutAct_9fa48("4537")
                ? /^(ftp:\/\/[\s<>"']+)/iu
                : stryMutAct_9fa48("4536")
                  ? /^(ftp:\/\/[^\s<>"'])/iu
                  : stryMutAct_9fa48("4535")
                    ? /(ftp:\/\/[^\s<>"']+)/iu
                    : (stryCov_9fa48("4535", "4536", "4537", "4538"), /^(ftp:\/\/[^\s<>"']+)/iu),
          stryMutAct_9fa48("4542")
              ? /^(file:\/\/[^\S<>"']+)/iu
              : stryMutAct_9fa48("4541")
                ? /^(file:\/\/[\s<>"']+)/iu
                : stryMutAct_9fa48("4540")
                  ? /^(file:\/\/[^\s<>"'])/iu
                  : stryMutAct_9fa48("4539")
                    ? /(file:\/\/[^\s<>"']+)/iu
                    : (stryCov_9fa48("4539", "4540", "4541", "4542"), /^(file:\/\/[^\s<>"']+)/iu),
          stryMutAct_9fa48("4546")
              ? /^(www\.[^\S<>"']+)/iu
              : stryMutAct_9fa48("4545")
                ? /^(www\.[\s<>"']+)/iu
                : stryMutAct_9fa48("4544")
                  ? /^(www\.[^\s<>"'])/iu
                  : stryMutAct_9fa48("4543")
                    ? /(www\.[^\s<>"']+)/iu
                    : (stryCov_9fa48("4543", "4544", "4545", "4546"), /^(www\.[^\s<>"']+)/iu),
          stryMutAct_9fa48("4553")
              ? /^([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[^A-Z]{2,})/iu
              : stryMutAct_9fa48("4552")
                ? /^([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z])/iu
                : stryMutAct_9fa48("4551")
                  ? /^([A-Z0-9._%+-]+@[^A-Z0-9.-]+\.[A-Z]{2,})/iu
                  : stryMutAct_9fa48("4550")
                    ? /^([A-Z0-9._%+-]+@[A-Z0-9.-]\.[A-Z]{2,})/iu
                    : stryMutAct_9fa48("4549")
                      ? /^([^A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/iu
                      : stryMutAct_9fa48("4548")
                        ? /^([A-Z0-9._%+-]@[A-Z0-9.-]+\.[A-Z]{2,})/iu
                        : stryMutAct_9fa48("4547")
                          ? /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/iu
                          : (stryCov_9fa48("4547", "4548", "4549", "4550", "4551", "4552", "4553"),
                            /^([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/iu),
          stryMutAct_9fa48("4557")
              ? /^(mailto:[^\S<>"']+)/iu
              : stryMutAct_9fa48("4556")
                ? /^(mailto:[\s<>"']+)/iu
                : stryMutAct_9fa48("4555")
                  ? /^(mailto:[^\s<>"'])/iu
                  : stryMutAct_9fa48("4554")
                    ? /(mailto:[^\s<>"']+)/iu
                    : (stryCov_9fa48("4554", "4555", "4556", "4557"), /^(mailto:[^\s<>"']+)/iu), // tel RFC3966 (+ params)
          stryMutAct_9fa48("4567")
              ? /^(tel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[^a-z0-9._+~:%-]+)*)/iu
              : stryMutAct_9fa48("4566")
                ? /^(tel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-])*)/iu
                : stryMutAct_9fa48("4565")
                  ? /^(tel:\+?[0-9][0-9().-]{5,}(?:;[^a-z0-9-]+=[a-z0-9._+~:%-]+)*)/iu
                  : stryMutAct_9fa48("4564")
                    ? /^(tel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]=[a-z0-9._+~:%-]+)*)/iu
                    : stryMutAct_9fa48("4563")
                      ? /^(tel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+))/iu
                      : stryMutAct_9fa48("4562")
                        ? /^(tel:\+?[0-9][^0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*)/iu
                        : stryMutAct_9fa48("4561")
                          ? /^(tel:\+?[0-9][0-9().-](?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*)/iu
                          : stryMutAct_9fa48("4560")
                            ? /^(tel:\+?[^0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*)/iu
                            : stryMutAct_9fa48("4559")
                              ? /^(tel:\+[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*)/iu
                              : stryMutAct_9fa48("4558")
                                ? /(tel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*)/iu
                                : (stryCov_9fa48(
                                      "4558",
                                      "4559",
                                      "4560",
                                      "4561",
                                      "4562",
                                      "4563",
                                      "4564",
                                      "4565",
                                      "4566",
                                      "4567"
                                  ),
                                  /^(tel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*)/iu),
          stryMutAct_9fa48("4571")
              ? /^(sip:[^\S<>"']+)/iu
              : stryMutAct_9fa48("4570")
                ? /^(sip:[\s<>"']+)/iu
                : stryMutAct_9fa48("4569")
                  ? /^(sip:[^\s<>"'])/iu
                  : stryMutAct_9fa48("4568")
                    ? /(sip:[^\s<>"']+)/iu
                    : (stryCov_9fa48("4568", "4569", "4570", "4571"), /^(sip:[^\s<>"']+)/iu),
          stryMutAct_9fa48("4575")
              ? /^(sms:[^\S<>"']+)/iu
              : stryMutAct_9fa48("4574")
                ? /^(sms:[\s<>"']+)/iu
                : stryMutAct_9fa48("4573")
                  ? /^(sms:[^\s<>"'])/iu
                  : stryMutAct_9fa48("4572")
                    ? /(sms:[^\s<>"']+)/iu
                    : (stryCov_9fa48("4572", "4573", "4574", "4575"), /^(sms:[^\s<>"']+)/iu),
          stryMutAct_9fa48("4579")
              ? /^(geo:[^\S<>"']+)/iu
              : stryMutAct_9fa48("4578")
                ? /^(geo:[\s<>"']+)/iu
                : stryMutAct_9fa48("4577")
                  ? /^(geo:[^\s<>"'])/iu
                  : stryMutAct_9fa48("4576")
                    ? /(geo:[^\s<>"']+)/iu
                    : (stryCov_9fa48("4576", "4577", "4578", "4579"), /^(geo:[^\s<>"']+)/iu),
          stryMutAct_9fa48("4583")
              ? /^(skype:[^\S<>"']+)/iu
              : stryMutAct_9fa48("4582")
                ? /^(skype:[\s<>"']+)/iu
                : stryMutAct_9fa48("4581")
                  ? /^(skype:[^\s<>"'])/iu
                  : stryMutAct_9fa48("4580")
                    ? /(skype:[^\s<>"']+)/iu
                    : (stryCov_9fa48("4580", "4581", "4582", "4583"), /^(skype:[^\s<>"']+)/iu),
          stryMutAct_9fa48("4587")
              ? /^(teams:[^\S<>"']+)/iu
              : stryMutAct_9fa48("4586")
                ? /^(teams:[\s<>"']+)/iu
                : stryMutAct_9fa48("4585")
                  ? /^(teams:[^\s<>"'])/iu
                  : stryMutAct_9fa48("4584")
                    ? /(teams:[^\s<>"']+)/iu
                    : (stryCov_9fa48("4584", "4585", "4586", "4587"), /^(teams:[^\s<>"']+)/iu),
          stryMutAct_9fa48("4591")
              ? /^(msteams:[^\S<>"']+)/iu
              : stryMutAct_9fa48("4590")
                ? /^(msteams:[\s<>"']+)/iu
                : stryMutAct_9fa48("4589")
                  ? /^(msteams:[^\s<>"'])/iu
                  : stryMutAct_9fa48("4588")
                    ? /(msteams:[^\s<>"']+)/iu
                    : (stryCov_9fa48("4588", "4589", "4590", "4591"), /^(msteams:[^\s<>"']+)/iu),
      ]);
function countChar(haystack: string, needle: string): number {
    if (stryMutAct_9fa48("4592")) {
        {
        }
    } else {
        stryCov_9fa48("4592");
        let c = 0;
        for (
            let i = 0;
            stryMutAct_9fa48("4595")
                ? i >= haystack.length
                : stryMutAct_9fa48("4594")
                  ? i <= haystack.length
                  : stryMutAct_9fa48("4593")
                    ? false
                    : (stryCov_9fa48("4593", "4594", "4595"), i < haystack.length);
            stryMutAct_9fa48("4596") ? i-- : (stryCov_9fa48("4596"), i++)
        ) {
            if (stryMutAct_9fa48("4597")) {
                {
                }
            } else {
                stryCov_9fa48("4597");
                if (
                    stryMutAct_9fa48("4600")
                        ? haystack[i] !== needle
                        : stryMutAct_9fa48("4599")
                          ? false
                          : stryMutAct_9fa48("4598")
                            ? true
                            : (stryCov_9fa48("4598", "4599", "4600"), haystack[i] === needle)
                )
                    stryMutAct_9fa48("4601") ? c-- : (stryCov_9fa48("4601"), c++);
            }
        }
        return c;
    }
}
function trimOneUnbalancedCloserEnd(s: string): string {
    if (stryMutAct_9fa48("4602")) {
        {
        }
    } else {
        stryCov_9fa48("4602");
        if (
            stryMutAct_9fa48("4605")
                ? false
                : stryMutAct_9fa48("4604")
                  ? true
                  : stryMutAct_9fa48("4603")
                    ? s
                    : (stryCov_9fa48("4603", "4604", "4605"), !s)
        )
            return s;
        const last = stryMutAct_9fa48("4606")
            ? s
            : (stryCov_9fa48("4606"), s.slice(stryMutAct_9fa48("4607") ? +1 : (stryCov_9fa48("4607"), -1)));
        if (
            stryMutAct_9fa48("4610")
                ? false
                : stryMutAct_9fa48("4609")
                  ? true
                  : stryMutAct_9fa48("4608")
                    ? (BALANCED_CLOSERS as readonly string[]).includes(last)
                    : (stryCov_9fa48("4608", "4609", "4610"),
                      !(BALANCED_CLOSERS as readonly string[]).includes(last))
        )
            return s;
        const closer = last as (typeof BALANCED_CLOSERS)[number];
        const opener = CLOSER_TO_OPENER[closer];
        const opens = countChar(s, opener);
        const closes = countChar(s, closer);

        // Ako imamo više zatvarajućih nego otvarajućih, poslednja zatvarajuća je "višak".
        if (
            stryMutAct_9fa48("4614")
                ? closes <= opens
                : stryMutAct_9fa48("4613")
                  ? closes >= opens
                  : stryMutAct_9fa48("4612")
                    ? false
                    : stryMutAct_9fa48("4611")
                      ? true
                      : (stryCov_9fa48("4611", "4612", "4613", "4614"), closes > opens)
        )
            return stryMutAct_9fa48("4615")
                ? s
                : (stryCov_9fa48("4615"),
                  s.slice(0, stryMutAct_9fa48("4616") ? +1 : (stryCov_9fa48("4616"), -1)));
        return s; // balansirano => ostavi
    }
}
export function trimLinkEnd(s: string): string {
    if (stryMutAct_9fa48("4617")) {
        {
        }
    } else {
        stryCov_9fa48("4617");
        let out = String(
            stryMutAct_9fa48("4618")
                ? s && ""
                : (stryCov_9fa48("4618"),
                  s ?? (stryMutAct_9fa48("4619") ? "Stryker was here!" : (stryCov_9fa48("4619"), "")))
        );
        if (stryMutAct_9fa48("4620")) {
            for (; false; ) {
                const before = out;

                // 1) Uvek skini "sigurnu" završnu interpunkciju (.,;:!?)
                out = out.replace(PUNCTUATION_END_REGEX, "");

                // 2) Skini ) ] } samo ako su "višak" (nebalansirane)
                out = trimOneUnbalancedCloserEnd(out);
                if (out === before) break;
            }
        } else {
            stryCov_9fa48("4620");
            for (;;) {
                if (stryMutAct_9fa48("4621")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4621");
                    const before = out;

                    // 1) Uvek skini "sigurnu" završnu interpunkciju (.,;:!?)
                    out = out.replace(
                        PUNCTUATION_END_REGEX,
                        stryMutAct_9fa48("4622") ? "Stryker was here!" : (stryCov_9fa48("4622"), "")
                    );

                    // 2) Skini ) ] } samo ako su "višak" (nebalansirane)
                    out = trimOneUnbalancedCloserEnd(out);
                    if (
                        stryMutAct_9fa48("4625")
                            ? out !== before
                            : stryMutAct_9fa48("4624")
                              ? false
                              : stryMutAct_9fa48("4623")
                                ? true
                                : (stryCov_9fa48("4623", "4624", "4625"), out === before)
                    )
                        break;
                }
            }
        }
        return out;
    }
}
export function looksLikeLinkStart(fragLower: string): boolean {
    if (stryMutAct_9fa48("4626")) {
        {
        }
    } else {
        stryCov_9fa48("4626");
        return stryMutAct_9fa48("4629")
            ? (fragLower.startsWith("http") ||
                  fragLower.startsWith("ftp") ||
                  fragLower.startsWith("file") ||
                  fragLower.startsWith("www.") ||
                  fragLower.startsWith("mailto:") ||
                  fragLower.startsWith("tel:") ||
                  fragLower.startsWith("sip:") ||
                  fragLower.startsWith("sms:") ||
                  fragLower.startsWith("geo:") ||
                  fragLower.startsWith("skype:") ||
                  fragLower.startsWith("teams:") ||
                  fragLower.startsWith("msteams:")) &&
                  fragLower.includes("@")
            : stryMutAct_9fa48("4628")
              ? false
              : stryMutAct_9fa48("4627")
                ? true
                : (stryCov_9fa48("4627", "4628", "4629"),
                  (stryMutAct_9fa48("4631")
                      ? (fragLower.startsWith("http") ||
                            fragLower.startsWith("ftp") ||
                            fragLower.startsWith("file") ||
                            fragLower.startsWith("www.") ||
                            fragLower.startsWith("mailto:") ||
                            fragLower.startsWith("tel:") ||
                            fragLower.startsWith("sip:") ||
                            fragLower.startsWith("sms:") ||
                            fragLower.startsWith("geo:") ||
                            fragLower.startsWith("skype:") ||
                            fragLower.startsWith("teams:")) &&
                        fragLower.startsWith("msteams:")
                      : stryMutAct_9fa48("4630")
                        ? false
                        : (stryCov_9fa48("4630", "4631"),
                          (stryMutAct_9fa48("4633")
                              ? (fragLower.startsWith("http") ||
                                    fragLower.startsWith("ftp") ||
                                    fragLower.startsWith("file") ||
                                    fragLower.startsWith("www.") ||
                                    fragLower.startsWith("mailto:") ||
                                    fragLower.startsWith("tel:") ||
                                    fragLower.startsWith("sip:") ||
                                    fragLower.startsWith("sms:") ||
                                    fragLower.startsWith("geo:") ||
                                    fragLower.startsWith("skype:")) &&
                                fragLower.startsWith("teams:")
                              : stryMutAct_9fa48("4632")
                                ? false
                                : (stryCov_9fa48("4632", "4633"),
                                  (stryMutAct_9fa48("4635")
                                      ? (fragLower.startsWith("http") ||
                                            fragLower.startsWith("ftp") ||
                                            fragLower.startsWith("file") ||
                                            fragLower.startsWith("www.") ||
                                            fragLower.startsWith("mailto:") ||
                                            fragLower.startsWith("tel:") ||
                                            fragLower.startsWith("sip:") ||
                                            fragLower.startsWith("sms:") ||
                                            fragLower.startsWith("geo:")) &&
                                        fragLower.startsWith("skype:")
                                      : stryMutAct_9fa48("4634")
                                        ? false
                                        : (stryCov_9fa48("4634", "4635"),
                                          (stryMutAct_9fa48("4637")
                                              ? (fragLower.startsWith("http") ||
                                                    fragLower.startsWith("ftp") ||
                                                    fragLower.startsWith("file") ||
                                                    fragLower.startsWith("www.") ||
                                                    fragLower.startsWith("mailto:") ||
                                                    fragLower.startsWith("tel:") ||
                                                    fragLower.startsWith("sip:") ||
                                                    fragLower.startsWith("sms:")) &&
                                                fragLower.startsWith("geo:")
                                              : stryMutAct_9fa48("4636")
                                                ? false
                                                : (stryCov_9fa48("4636", "4637"),
                                                  (stryMutAct_9fa48("4639")
                                                      ? (fragLower.startsWith("http") ||
                                                            fragLower.startsWith("ftp") ||
                                                            fragLower.startsWith("file") ||
                                                            fragLower.startsWith("www.") ||
                                                            fragLower.startsWith("mailto:") ||
                                                            fragLower.startsWith("tel:") ||
                                                            fragLower.startsWith("sip:")) &&
                                                        fragLower.startsWith("sms:")
                                                      : stryMutAct_9fa48("4638")
                                                        ? false
                                                        : (stryCov_9fa48("4638", "4639"),
                                                          (stryMutAct_9fa48("4641")
                                                              ? (fragLower.startsWith("http") ||
                                                                    fragLower.startsWith("ftp") ||
                                                                    fragLower.startsWith("file") ||
                                                                    fragLower.startsWith("www.") ||
                                                                    fragLower.startsWith("mailto:") ||
                                                                    fragLower.startsWith("tel:")) &&
                                                                fragLower.startsWith("sip:")
                                                              : stryMutAct_9fa48("4640")
                                                                ? false
                                                                : (stryCov_9fa48("4640", "4641"),
                                                                  (stryMutAct_9fa48("4643")
                                                                      ? (fragLower.startsWith("http") ||
                                                                            fragLower.startsWith("ftp") ||
                                                                            fragLower.startsWith("file") ||
                                                                            fragLower.startsWith("www.") ||
                                                                            fragLower.startsWith(
                                                                                "mailto:"
                                                                            )) &&
                                                                        fragLower.startsWith("tel:")
                                                                      : stryMutAct_9fa48("4642")
                                                                        ? false
                                                                        : (stryCov_9fa48("4642", "4643"),
                                                                          (stryMutAct_9fa48("4645")
                                                                              ? (fragLower.startsWith(
                                                                                    "http"
                                                                                ) ||
                                                                                    fragLower.startsWith(
                                                                                        "ftp"
                                                                                    ) ||
                                                                                    fragLower.startsWith(
                                                                                        "file"
                                                                                    ) ||
                                                                                    fragLower.startsWith(
                                                                                        "www."
                                                                                    )) &&
                                                                                fragLower.startsWith(
                                                                                    "mailto:"
                                                                                )
                                                                              : stryMutAct_9fa48("4644")
                                                                                ? false
                                                                                : (stryCov_9fa48(
                                                                                      "4644",
                                                                                      "4645"
                                                                                  ),
                                                                                  (stryMutAct_9fa48("4647")
                                                                                      ? (fragLower.startsWith(
                                                                                            "http"
                                                                                        ) ||
                                                                                            fragLower.startsWith(
                                                                                                "ftp"
                                                                                            ) ||
                                                                                            fragLower.startsWith(
                                                                                                "file"
                                                                                            )) &&
                                                                                        fragLower.startsWith(
                                                                                            "www."
                                                                                        )
                                                                                      : stryMutAct_9fa48(
                                                                                              "4646"
                                                                                          )
                                                                                        ? false
                                                                                        : (stryCov_9fa48(
                                                                                              "4646",
                                                                                              "4647"
                                                                                          ),
                                                                                          (stryMutAct_9fa48(
                                                                                              "4649"
                                                                                          )
                                                                                              ? (fragLower.startsWith(
                                                                                                    "http"
                                                                                                ) ||
                                                                                                    fragLower.startsWith(
                                                                                                        "ftp"
                                                                                                    )) &&
                                                                                                fragLower.startsWith(
                                                                                                    "file"
                                                                                                )
                                                                                              : stryMutAct_9fa48(
                                                                                                      "4648"
                                                                                                  )
                                                                                                ? false
                                                                                                : (stryCov_9fa48(
                                                                                                      "4648",
                                                                                                      "4649"
                                                                                                  ),
                                                                                                  (stryMutAct_9fa48(
                                                                                                      "4651"
                                                                                                  )
                                                                                                      ? fragLower.startsWith(
                                                                                                            "http"
                                                                                                        ) &&
                                                                                                        fragLower.startsWith(
                                                                                                            "ftp"
                                                                                                        )
                                                                                                      : stryMutAct_9fa48(
                                                                                                              "4650"
                                                                                                          )
                                                                                                        ? false
                                                                                                        : (stryCov_9fa48(
                                                                                                              "4650",
                                                                                                              "4651"
                                                                                                          ),
                                                                                                          (stryMutAct_9fa48(
                                                                                                              "4652"
                                                                                                          )
                                                                                                              ? fragLower.endsWith(
                                                                                                                    "http"
                                                                                                                )
                                                                                                              : (stryCov_9fa48(
                                                                                                                    "4652"
                                                                                                                ),
                                                                                                                fragLower.startsWith(
                                                                                                                    stryMutAct_9fa48(
                                                                                                                        "4653"
                                                                                                                    )
                                                                                                                        ? ""
                                                                                                                        : (stryCov_9fa48(
                                                                                                                              "4653"
                                                                                                                          ),
                                                                                                                          "http")
                                                                                                                ))) ||
                                                                                                              (stryMutAct_9fa48(
                                                                                                                  "4654"
                                                                                                              )
                                                                                                                  ? fragLower.endsWith(
                                                                                                                        "ftp"
                                                                                                                    )
                                                                                                                  : (stryCov_9fa48(
                                                                                                                        "4654"
                                                                                                                    ),
                                                                                                                    fragLower.startsWith(
                                                                                                                        stryMutAct_9fa48(
                                                                                                                            "4655"
                                                                                                                        )
                                                                                                                            ? ""
                                                                                                                            : (stryCov_9fa48(
                                                                                                                                  "4655"
                                                                                                                              ),
                                                                                                                              "ftp")
                                                                                                                    ))))) ||
                                                                                                      (stryMutAct_9fa48(
                                                                                                          "4656"
                                                                                                      )
                                                                                                          ? fragLower.endsWith(
                                                                                                                "file"
                                                                                                            )
                                                                                                          : (stryCov_9fa48(
                                                                                                                "4656"
                                                                                                            ),
                                                                                                            fragLower.startsWith(
                                                                                                                stryMutAct_9fa48(
                                                                                                                    "4657"
                                                                                                                )
                                                                                                                    ? ""
                                                                                                                    : (stryCov_9fa48(
                                                                                                                          "4657"
                                                                                                                      ),
                                                                                                                      "file")
                                                                                                            ))))) ||
                                                                                              (stryMutAct_9fa48(
                                                                                                  "4658"
                                                                                              )
                                                                                                  ? fragLower.endsWith(
                                                                                                        "www."
                                                                                                    )
                                                                                                  : (stryCov_9fa48(
                                                                                                        "4658"
                                                                                                    ),
                                                                                                    fragLower.startsWith(
                                                                                                        stryMutAct_9fa48(
                                                                                                            "4659"
                                                                                                        )
                                                                                                            ? ""
                                                                                                            : (stryCov_9fa48(
                                                                                                                  "4659"
                                                                                                              ),
                                                                                                              "www.")
                                                                                                    ))))) ||
                                                                                      (stryMutAct_9fa48(
                                                                                          "4660"
                                                                                      )
                                                                                          ? fragLower.endsWith(
                                                                                                "mailto:"
                                                                                            )
                                                                                          : (stryCov_9fa48(
                                                                                                "4660"
                                                                                            ),
                                                                                            fragLower.startsWith(
                                                                                                stryMutAct_9fa48(
                                                                                                    "4661"
                                                                                                )
                                                                                                    ? ""
                                                                                                    : (stryCov_9fa48(
                                                                                                          "4661"
                                                                                                      ),
                                                                                                      "mailto:")
                                                                                            ))))) ||
                                                                              (stryMutAct_9fa48("4662")
                                                                                  ? fragLower.endsWith("tel:")
                                                                                  : (stryCov_9fa48("4662"),
                                                                                    fragLower.startsWith(
                                                                                        stryMutAct_9fa48(
                                                                                            "4663"
                                                                                        )
                                                                                            ? ""
                                                                                            : (stryCov_9fa48(
                                                                                                  "4663"
                                                                                              ),
                                                                                              "tel:")
                                                                                    ))))) ||
                                                                      (stryMutAct_9fa48("4664")
                                                                          ? fragLower.endsWith("sip:")
                                                                          : (stryCov_9fa48("4664"),
                                                                            fragLower.startsWith(
                                                                                stryMutAct_9fa48("4665")
                                                                                    ? ""
                                                                                    : (stryCov_9fa48("4665"),
                                                                                      "sip:")
                                                                            ))))) ||
                                                              (stryMutAct_9fa48("4666")
                                                                  ? fragLower.endsWith("sms:")
                                                                  : (stryCov_9fa48("4666"),
                                                                    fragLower.startsWith(
                                                                        stryMutAct_9fa48("4667")
                                                                            ? ""
                                                                            : (stryCov_9fa48("4667"), "sms:")
                                                                    ))))) ||
                                                      (stryMutAct_9fa48("4668")
                                                          ? fragLower.endsWith("geo:")
                                                          : (stryCov_9fa48("4668"),
                                                            fragLower.startsWith(
                                                                stryMutAct_9fa48("4669")
                                                                    ? ""
                                                                    : (stryCov_9fa48("4669"), "geo:")
                                                            ))))) ||
                                              (stryMutAct_9fa48("4670")
                                                  ? fragLower.endsWith("skype:")
                                                  : (stryCov_9fa48("4670"),
                                                    fragLower.startsWith(
                                                        stryMutAct_9fa48("4671")
                                                            ? ""
                                                            : (stryCov_9fa48("4671"), "skype:")
                                                    ))))) ||
                                      (stryMutAct_9fa48("4672")
                                          ? fragLower.endsWith("teams:")
                                          : (stryCov_9fa48("4672"),
                                            fragLower.startsWith(
                                                stryMutAct_9fa48("4673")
                                                    ? ""
                                                    : (stryCov_9fa48("4673"), "teams:")
                                            ))))) ||
                              (stryMutAct_9fa48("4674")
                                  ? fragLower.endsWith("msteams:")
                                  : (stryCov_9fa48("4674"),
                                    fragLower.startsWith(
                                        stryMutAct_9fa48("4675") ? "" : (stryCov_9fa48("4675"), "msteams:")
                                    ))))) ||
                      fragLower.includes(stryMutAct_9fa48("4676") ? "" : (stryCov_9fa48("4676"), "@")));
    }
}
