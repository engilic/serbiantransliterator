// src/core/protect.ts

// Putanje: C:\Windows\System32 ili /usr/local/bin
const WINDOWS_PATH_RE = /\b[a-zA-Z]:\\[\w\\\s.-]{2,}\b/g;
const UNIX_PATH_RE = /(?<!\w)\/(?:[\w.-]+\/)+[\w.-]+\b/g;

// Tehnički obrasci: verzije (v1.2.3), prečice (Ctrl+Shift+C), GUID-ovi
const VERSION_RE = /\bv\d+(\.\d+)*\b/gi;
const SHORTCUT_RE = /\b(Ctrl|Alt|Shift|Cmd|Win)\s*\+\s*[A-Z0-9]\b/gi;
const GUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

// Ekstenzije fajlova (proširena lista za MAX1)
const FILE_EXT_RE =
    /\b[\w-]+\.(?:js|ts|tsx|jsx|json|html|css|md|py|rs|cpp|h|cs|php|java|sql|yaml|xml|docx|xlsx|pptx|pdf|zip|exe|dll|wasm|sh|bat)\b/gi;

import { EMAIL_RE_G, URL_RE_G, URI_SCHEMES_NO_TEL_MAILTO_RE_G, trimLinkEnd } from "../shared/patterns/links";

export type Range = [start: number, end: number];

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function addRangesFromRegex(text: string, re: RegExp, ranges: Range[], groupIndex: number | null = null) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        let start = m.index;
        let len = m[0].length;

        if (groupIndex !== null && m[groupIndex] !== undefined) {
            const groupText = m[groupIndex];
            start = m.index + m[0].indexOf(groupText);
            len = groupText.length;
        }

        ranges.push([start, start + len]);
        if (re.lastIndex === m.index) re.lastIndex++;
    }
}

function addRangesFromRegexTrimEnd(
    text: string,
    re: RegExp,
    ranges: Range[],
    trimEndFn: (s: string) => string
) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        if (m.index === undefined) continue;

        const raw = m[0] ?? "";
        const trimmed = trimEndFn(raw);

        if (!trimmed) continue;

        const len = Math.max(0, trimmed.length);
        if (len === 0) continue;

        ranges.push([m.index, m.index + len]);

        if (re.lastIndex === m.index) re.lastIndex++;
    }
}

function mergeRanges(ranges: Range[]): Range[] {
    if (ranges.length === 0) return [];
    // Sortiramo po početnoj poziciji
    const sorted = [...ranges].sort((a, b) => a[0] - b[0]);

    const merged: Range[] = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
        const last = merged[merged.length - 1];
        const current = sorted[i];

        if (current[0] <= last[1]) {
            // Postoji preklapanje, proširi kraj
            last[1] = Math.max(last[1], current[1]);
        } else {
            // Nema preklapanja, dodaj novi opseg
            merged.push(current);
        }
    }
    return merged;
}

export function splitByRanges(text: string, ranges: Range[]): Array<{ text: string; protected: boolean }> {
    if (ranges.length === 0) return [{ text, protected: false }];

    const out: Array<{ text: string; protected: boolean }> = [];
    let i = 0;

    for (const [s, e] of ranges) {
        if (s > i) out.push({ text: text.slice(i, s), protected: false });
        out.push({ text: text.slice(s, e), protected: true });
        i = e;
    }

    if (i < text.length) out.push({ text: text.slice(i), protected: false });
    return out;
}

export type CurlyProtection = "placeholders" | "all" | "none";

export interface ProtectOptions {
    protectBrands: boolean;
    brandPhrases: string[];
    userProtectedPhrases: string[];
    preserveCodeBlocks: boolean;
    curlyProtection: CurlyProtection;
}

export function collectProtectedRanges(text: string, opts: ProtectOptions): Range[] {
    const ranges: Range[] = [];

    // --- 1. Markdown Kod Blokovi (Prioritet #1) ---
    if (opts.preserveCodeBlocks) {
        addRangesFromRegex(text, /```[\s\S]*?```/g, ranges); // Multi-line
        addRangesFromRegex(text, /`[^`\r\n]*`/g, ranges); // Inline
    }

    // --- 2. HTML Tagovi ---
    addRangesFromRegex(text, /<\/?[a-z][^>]*>/gi, ranges);

    // --- 2.5 URI Schemes (MAX1 Fix za mailto, tel, sms, sip...) ---
    addRangesFromRegexTrimEnd(
        text,
        /\b(?:mailto|tel|sms|sip|geo|skype|teams):[^\s<>"]+/gi,
        ranges,
        trimLinkEnd
    );

    // --- 3. URL-ovi i Emailovi (MAX1: Trimovanje interpunkcije na kraju) ---
    // Koristimo funkcije iz shared/patterns/links.ts
    addRangesFromRegexTrimEnd(text, EMAIL_RE_G, ranges, trimLinkEnd);
    addRangesFromRegexTrimEnd(text, URL_RE_G, ranges, trimLinkEnd);
    addRangesFromRegexTrimEnd(text, URI_SCHEMES_NO_TEL_MAILTO_RE_G, ranges, trimLinkEnd);

    // --- 4. Sistemske putanje i Fajlovi (MAX1) ---
    addRangesFromRegex(text, WINDOWS_PATH_RE, ranges);
    addRangesFromRegex(text, UNIX_PATH_RE, ranges);
    addRangesFromRegex(text, FILE_EXT_RE, ranges);

    // --- 5. Tehnički formati (MAX1) ---
    addRangesFromRegex(text, VERSION_RE, ranges);
    addRangesFromRegex(text, SHORTCUT_RE, ranges);
    addRangesFromRegex(text, GUID_RE, ranges);

    // --- 6. Placeholder-i (Curly Braces) ---
    // Rešava {user_name}, {{token}}, {id:123}
    if (opts.curlyProtection === "all") {
        addRangesFromRegex(text, /\{[\s\S]*?\}/g, ranges);
    } else if (opts.curlyProtection === "placeholders") {
        addRangesFromRegex(text, /\{[A-Za-z_][\w:.-]*\}/g, ranges);
    }

    // --- 7. Brendovi i Korisničke fraze (MAX1: Boundary detekcija) ---
    // Koristimo Unicode-aware boundary da ne bi zaštitili "Apple" unutar reči "Applesauce"
    const boundary = `[^\\p{L}\\p{N}]`;
    const prefix = `(^|${boundary})`;
    const suffix = `(?=$|${boundary})`;

    const allPhrases = [...(opts.protectBrands ? opts.brandPhrases : []), ...opts.userProtectedPhrases];

    for (const phrase of allPhrases) {
        if (!phrase.trim()) continue;
        const escaped = escapeRegex(phrase.trim());
        // Tražimo frazu koja je okružena razmacima ili znacima interpunkcije
        const re = new RegExp(`${prefix}(${escaped})${suffix}`, "giu");
        addRangesFromRegex(text, re, ranges, 2); // Grupa 2 je sama fraza
    }

    // Na kraju spajamo preklopljene opsege (npr. ako je URL unutar Code bloka)
    return mergeRanges(ranges);
}
