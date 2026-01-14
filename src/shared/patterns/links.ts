// src/shared/patterns/links.ts

// Global (za protect/statistiku)
export const EMAIL_RE_G =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu;

// Konzervativno kao kod tebe (isti karakteri kao u protect/links)
export const URL_RE_G =
    /\b(?:https?:\/\/|ftp:\/\/|file:\/\/|www\.)[^\s<>"')]+/giu;

// URI schemes (mailto/tel/sip/...)
export const URI_SCHEMES_RE_G =
    /\b(?:mailto|tel|sip|sms|geo|skype|teams|msteams):[^\s<>"')]+/giu;

// Anchored (za bridging - mora da krene od početka “combined” stringa)
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
    return s.replace(/[,.;:!?)}\]]+$/g, "");
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