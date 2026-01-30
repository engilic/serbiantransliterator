// src/shared/patterns/links.ts

import { BALANCED_CLOSERS, CLOSER_TO_OPENER, PUNCTUATION_END_REGEX } from "./common";

// =========================
// Global regex (protect/statistics)
// =========================

export const EMAIL_RE_G = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu;

// NOTE: ranije je bilo [^\s<>"')]+ (zabranjivalo ')').
// Sada dozvoljavamo ')', a pravilno "odsecanje" interpunkcije prepuštamo trimLinkEnd().
export const URL_RE_G = /\b(?:https?:\/\/|ftp:\/\/|file:\/\/|www\.)[^\s<>"']+/giu;

// mailto: (posebno, da ne dupliramo sa URI schemes)
export const MAILTO_RE_G = /\bmailto:[^\s<>"']+/giu;

// URI schemes bez tel/mailto (sip/sms/geo/skype/teams/msteams)
export const URI_SCHEMES_NO_TEL_MAILTO_RE_G = /\b(?:sip|sms|geo|skype|teams|msteams):[^\s<>"']+/giu;

// =========================
// Anchored patterns (OOXML bridging)
// =========================

export const LINK_PATTERNS_ANCHORED: RegExp[] = [
    /^(https?:\/\/[^\s<>"']+)/iu,
    /^(ftp:\/\/[^\s<>"']+)/iu,
    /^(file:\/\/[^\s<>"']+)/iu,
    /^(www\.[^\s<>"']+)/iu,
    /^([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/iu,

    /^(mailto:[^\s<>"']+)/iu,

    // tel RFC3966 (+ params)
    /^(tel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*)/iu,

    /^(sip:[^\s<>"']+)/iu,
    /^(sms:[^\s<>"']+)/iu,
    /^(geo:[^\s<>"']+)/iu,
    /^(skype:[^\s<>"']+)/iu,
    /^(teams:[^\s<>"']+)/iu,
    /^(msteams:[^\s<>"']+)/iu,
];

function countChar(haystack: string, needle: string): number {
    let c = 0;
    for (let i = 0; i < haystack.length; i++) {
        if (haystack[i] === needle) c++;
    }
    return c;
}

function trimOneUnbalancedCloserEnd(s: string): string {
    if (!s) return s;

    const last = s.slice(-1);
    if (!(BALANCED_CLOSERS as readonly string[]).includes(last)) return s;

    const closer = last as (typeof BALANCED_CLOSERS)[number];
    const opener = CLOSER_TO_OPENER[closer];

    const opens = countChar(s, opener);
    const closes = countChar(s, closer);

    // Ako imamo više zatvarajućih nego otvarajućih, poslednja zatvarajuća je "višak".
    if (closes > opens) return s.slice(0, -1);

    return s; // balansirano => ostavi
}

export function trimLinkEnd(s: string): string {
    let out = String(s ?? "");

    for (;;) {
        const before = out;

        // 1) Uvek skini "sigurnu" završnu interpunkciju (.,;:!?)
        out = out.replace(PUNCTUATION_END_REGEX, "");

        // 2) Skini ) ] } samo ako su "višak" (nebalansirane)
        out = trimOneUnbalancedCloserEnd(out);

        if (out === before) break;
    }

    return out;
}

export function looksLikeLinkStart(fragLower: string): boolean {
    return (
        fragLower.startsWith("http") ||
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
        fragLower.startsWith("msteams:") ||
        fragLower.includes("@")
    );
}
