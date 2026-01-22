// src/core/corrections.ts

// Helper za očuvanje velikog slova
function preserveFirstLetterCase(input: string, replacement: string): string {
    if (!input) return replacement;
    const firstChar = input[0];
    if (!firstChar) return replacement;
    const isUpper = firstChar === firstChar.toUpperCase();
    return isUpper ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
}

// 1. NEGACIJE (glagoli se pišu odvojeno)
const NEGATIONS_MAP: Record<string, string> = {
    neznam: "ne znam",
    nemogu: "ne mogu",
    neželim: "ne želim",
    nevolim: "ne volim",
    neradim: "ne radim",
    neverujem: "ne verujem",
    nevidim: "ne vidim",
    nebi: "ne bi",
    nebih: "ne bih",
    nebismo: "ne bismo",
    nebiste: "ne biste",
    sumlja: "sumnja", // česta greška
    hvali: "fali", // česta greška (kad znači nedostaje)
};

// 2. FUTUR I (spojeno vs odvojeno)
// Pravilo: ako se infinitiv završava na -ći, piše se odvojeno od ću/ćeš/će.
const FUTURE_RE = /\b([a-zčćđšž]+ći)(ću|ćeš|će|ćemo|ćete|će)\b/gi;

// 3. SUPERLATIV (uvek spojeno)
const SUPERLATIVE_RE = /\b(naj)\s+([a-zčćđšž]+)\b/gi;

export function applyGrammarCorrections(text: string): string {
    let out = text;

    // 1. Negacije i česte greške
    const negKeys = Object.keys(NEGATIONS_MAP).join("|");
    const negRe = new RegExp(`\\b(${negKeys})\\b`, "gi");

    out = out.replace(negRe, (match) => {
        const lower = match.toLowerCase();
        const repl = NEGATIONS_MAP[lower];
        if (repl) return preserveFirstLetterCase(match, repl);
        return match;
    });

    // 2. Futur (doćiću -> doći ću)
    out = out.replace(FUTURE_RE, (_m, inf, suf) => {
        return `${inf} ${suf}`;
    });

    // 3. Superlativ (naj bolji -> najbolji)
    out = out.replace(SUPERLATIVE_RE, (_m, prefix, adj) => {
        // prefix je "naj", adj je "bolji"
        return `${prefix}${adj.toLowerCase()}`;
    });

    return out;
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
        const repl = savaMap[phrase];
        if (!repl) continue;
        text = text.replace(new RegExp(phrase, "gi"), (m) => preserveFirstLetterCase(m, repl));
    }

    return text;
}
