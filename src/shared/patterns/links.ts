// src/shared/patterns/links.ts

import { PUNCTUATION_END_REGEX } from "./common";

// =========================
// Global regex (protect/statistics)
// =========================

export const EMAIL_RE_G = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu;

export const URL_RE_G = /\b(?:https?:\/\/|ftp:\/\/|file:\/\/|www\.)[^\s<>"')]+/giu;

// mailto: (posebno, da ne dupliramo sa URI schemes)
export const MAILTO_RE_G = /\bmailto:[^\s<>"')]+/giu;

// URI schemes bez tel/mailto (sip/sms/geo/skype/teams/msteams)
export const URI_SCHEMES_NO_TEL_MAILTO_RE_G = /\b(?:sip|sms|geo|skype|teams|msteams):[^\s<>"')]+/giu;

// =========================
// Anchored patterns (OOXML bridging)
// =========================

export const LINK_PATTERNS_ANCHORED: RegExp[] = [
    /^(https?:\/\/[^\s<>"')]+)/iu,
    /^(ftp:\/\/[^\s<>"')]+)/iu,
    /^(file:\/\/[^\s<>"')]+)/iu,
    /^(www\.[^\s<>"')]+)/iu,
    /^([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/iu,

    /^(mailto:[^\s<>"')]+)/iu,

    // tel RFC3966 (+ params)
    /^(tel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*)/iu,

    /^(sip:[^\s<>"')]+)/iu,
    /^(sms:[^\s<>"')]+)/iu,
    /^(geo:[^\s<>"')]+)/iu,
    /^(skype:[^\s<>"')]+)/iu,
    /^(teams:[^\s<>"')]+)/iu,
    /^(msteams:[^\s<>"')]+)/iu,
];

export function trimLinkEnd(s: string): string {
    // Skida završnu interpunkciju koja često nalegne uz URL/email.
    // Koristimo centralizovani regex iz common.ts
    return (s ?? "").replace(PUNCTUATION_END_REGEX, "");
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
