// src/core/quotes.ts

export function fixSerbianQuotes(segment: string): string {
    let text = segment;

    // sve quote varijante -> "
    // (unicode kodovi su sigurni za enkoding)
    text = text.replace(/[\u201C\u201D\u2018\u2019\u00AB\u00BB\u201E\u201F\u201A\u201B\u2039\u203A]/g, `"`);

    // opening: " -> „  (U+201E)
    // koristimo alternaciju da obuhvatimo i '[' bez "no-useless-escape" problema
    text = text.replace(/(^|[\s({<\-\u2013\u2014]|\[)"/g, `$1\u201E`);

    // closing: sve preostale " -> ” (U+201D)
    text = text.replace(/"/g, "\u201D");

    return text;
}
