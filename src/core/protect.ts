import { EMAIL_RE_G, URL_RE_G } from "../shared/patterns/links";

export type Range = [start: number, end: number];

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function addRangesFromRegex(
    text: string,
    re: RegExp,
    ranges: Range[],
    groupIndex: number | null = null
) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        if (m.index === undefined) continue;

        if (groupIndex == null) {
            ranges.push([m.index, m.index + m[0].length]);
        } else {
            // očekujemo pattern (^|boundary)(group)
            const prefixLen = (m[1] ?? "").length;
            const g = m[groupIndex] ?? "";
            const start = m.index + prefixLen;
            ranges.push([start, start + g.length]);
        }

        if (re.lastIndex === m.index) re.lastIndex++;
    }
}

function mergeRanges(ranges: Range[]): Range[] {
    if (ranges.length === 0) return [];
    ranges.sort((a, b) => a[0] - b[0]);

    const out: Range[] = [];
    for (const r of ranges) {
        const last = out[out.length - 1];
        if (!last || r[0] > last[1]) out.push([r[0], r[1]]);
        else last[1] = Math.max(last[1], r[1]);
    }
    return out;
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

export interface ProtectOptions {
    protectBrands: boolean;
    brandPhrases: string[];
    userProtectedPhrases: string[];
    preserveCodeBlocks: boolean;
}

export function collectProtectedRanges(text: string, opts: ProtectOptions): Range[] {
    const ranges: Range[] = [];

    // 0) Code blocks (Markdown): ```...``` i `...`
    // Ovo štiti i navodnike i preslovljavanje unutar koda.
    if (opts.preserveCodeBlocks) {
        addRangesFromRegex(text, /```[\s\S]*?```/g, ranges);
        addRangesFromRegex(text, /`[^`\r\n]*`/g, ranges);
    }

    // 1) HTML tagovi
    addRangesFromRegex(text, /<\/?[a-zA-Z0-9]+[^>]*>/g, ranges);

    // 2) URL / Email (+ mailto/tel)
    addRangesFromRegex(text, EMAIL_RE_G, ranges);
    addRangesFromRegex(text, URL_RE_G, ranges);

    // NEW:
    addRangesFromRegex(text, /\bmailto:[^\s<>"')]+/giu, ranges);
    addRangesFromRegex(
        text,
        /\btel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*/giu,
        ranges
    );

    addRangesFromRegex(text, /\bsip:[^\s<>"')]+/giu, ranges);
    addRangesFromRegex(text, /\bsms:[^\s<>"')]+/giu, ranges);
    addRangesFromRegex(text, /\bgeo:[^\s<>"')]+/giu, ranges);
    addRangesFromRegex(text, /\bskype:[^\s<>"')]+/giu, ranges);
    addRangesFromRegex(text, /\bteams:[^\s<>"')]+/giu, ranges);
    // opcionalno (ako ti treba):
    addRangesFromRegex(text, /\bmsteams:[^\s<>"')]+/giu, ranges);

    // 3) Putanje (Windows/UNC/Unix)
    addRangesFromRegex(text, /\b[a-zA-Z0-9]+:\\[^\r\n<>:"|?*]+/g, ranges); // C:\..., Cert:\...
    addRangesFromRegex(text, /\\\\[a-zA-Z0-9.-]+\\[^\r\n<>:"|?*]+/g, ranges); // \\Server\Share
    addRangesFromRegex(text, /\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._\-/]+/g, ranges); // /var/log/...

    // 4) Ekstenzije fajlova
    addRangesFromRegex(
        text,
        /\b[\w.-]+\.(exe|dll|js|ts|json|xml|html|css|docx|xlsx|pptx|pdf|jpg|png|zip|rar|vsto|md|txt|sql|cs|py|java|cpp)\b/giu,
        ranges
    );

    // 5) Verzije i prečice
    addRangesFromRegex(text, /\bv\d+(\.\d+)*\b/giu, ranges);
    addRangesFromRegex(text, /\b(Ctrl|Alt|Shift|Cmd)\s*\+\s*[A-Z0-9]\b/giu, ranges);

    // 6) GUID
    addRangesFromRegex(
        text,
        /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/giu,
        ranges
    );

    // 7) Kod/placeholder blokovi
    addRangesFromRegex(text, /\{[\s\S]*?\}/g, ranges);
    addRangesFromRegex(text, /<[a-zA-Z0-9_]+>/g, ranges);

    // 8) Fraze (brend + userProtected) - bez lookbehind
    const boundary = `[^\\p{L}\\p{N}]`;
    const boundaryPrefix = `(^|${boundary})`;
    const boundarySuffix = `(?=$|${boundary})`;

    if (opts.protectBrands && opts.brandPhrases.length) {
        for (const phrase of opts.brandPhrases) {
            const parts = phrase.split(/\s+/).map(escapeRegex).join("\\s+");
            const re = new RegExp(`${boundaryPrefix}(${parts})${boundarySuffix}`, "giu");
            addRangesFromRegex(text, re, ranges, 2);
        }
    }

    if (opts.userProtectedPhrases.length) {
        for (const phrase of opts.userProtectedPhrases) {
            const parts = phrase.split(/\s+/).map(escapeRegex).join("\\s+");
            const re = new RegExp(`${boundaryPrefix}(${parts})${boundarySuffix}`, "giu");
            addRangesFromRegex(text, re, ranges, 2);
        }
    }

    return mergeRanges(ranges);
}