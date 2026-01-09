function preserveFirstLetterCase(input: string, replacement: string): string {
    if (!input) return replacement;
    const isUpper = input[0] === input[0]!.toUpperCase();
    return isUpper ? replacement[0]!.toUpperCase() + replacement.slice(1) : replacement;
}

export function applyPreCorrectionsLatToCyr(segment: string): string {
    let text = segment;

    // Tanjug
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
        const repl = savaMap[phrase]!;
        text = text.replace(new RegExp(phrase, "gi"), (m) => preserveFirstLetterCase(m, repl));
    }

    // “nj” nije uvek digraf (injekcija, konjunkcija…)
    // “dž” nije uvek digraf (nadživeti, podžanr…)
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