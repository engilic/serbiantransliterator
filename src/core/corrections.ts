// src/core/corrections.ts

function preserveFirstLetterCase(input: string, replacement: string): string {
    if (!input) return replacement;

    const firstChar = input[0];
    if (!firstChar) return replacement;

    const firstReplChar = replacement[0];
    if (!firstReplChar) return replacement;

    const isUpper = firstChar === firstChar.toUpperCase();
    return isUpper ? firstReplChar.toUpperCase() + replacement.slice(1) : replacement;
}

export function applyPreCorrectionsLatToCyr(segment: string): string {
    let text = segment;

    // Tanjug (nema 'nj' -> 'њ', već 'нј')
    text = text.replace(/\bTanjug\b/g, "Танјуг").replace(/\btanjug\b/g, "танјуг");

    // Sava fraze: Ako je "Save" u kontekstu reke, prevedi ga u "Саве".
    // (Ovo je potrebno jer je "Save" često zaštićen kao "Save button", pa ga ALWAYS_LATIN čuva).
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

    // “nj” nije uvek digraf (injekcija, konjunkcija…)
    // “dž” nije uvek digraf (nadživeti, podžanr…)
    // Ovi izuzeci sprečavaju da se "nj" pretvori u "њ", već forsiraju "нј".
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
