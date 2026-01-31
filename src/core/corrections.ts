// src/core/corrections.ts

function preserveFirstLetterCase(input: unknown, replacement: unknown): string {
    const inp = String(input || "");
    const rep = String(replacement || "");

    if (!inp) return rep;

    const firstChar = inp[0];
    if (!firstChar) return rep;

    const firstReplChar = rep[0];
    if (!firstReplChar) return rep;

    const isUpper = firstChar === firstChar.toUpperCase();
    return isUpper ? firstReplChar.toUpperCase() + rep.slice(1) : rep;
}

export function applyPreCorrectionsLatToCyr(segment: string): string {
    let text = String(segment || ""); // [FIX] Ensure string

    // Tanjug (nema 'nj' -> 'њ', već 'нј')
    text = text.replace(/\bTanjug\b/g, "Танјуг").replace(/\btanjug\b/g, "танјуг");

    // Sava fraze
    const savaMap: Record<string, string> = {
        "reke Save": "реке Саве",
        "duž Save": "дуж Саве",
        "ka Savi": "ка Сави",
        "na Savi": "на Сави",
        "ušća Save": "ушћа Саве",
        "obale Save": "обале Саве",
    };

    for (const phrase of Object.keys(savaMap)) {
        const repl = savaMap[phrase];
        if (!repl) continue;
        text = text.replace(new RegExp(phrase, "gi"), (m) => preserveFirstLetterCase(m, repl));
    }

    // Izuzeci za nj/dž
    const exceptions = [
        { l: "injekc", c: "инјекц" },
        { l: "injekt", c: "инјект" },
        { l: "konjug", c: "конјуг" },
        { l: "konjunk", c: "конјунк" },
        { l: "anjon", c: "анјон" },
        { l: "katjon", c: "катјон" },
        { l: "nadživ", c: "наджив" },
        { l: "podžanr", c: "поджанр" },
    ];

    for (const p of exceptions) {
        text = text.replace(new RegExp(p.l, "gi"), (m) => preserveFirstLetterCase(m, p.c));
    }

    return text;
}
