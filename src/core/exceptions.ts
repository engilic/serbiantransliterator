// src/core/exceptions.ts

/**
 * Rečnik izuzetaka za transliteraciju (Lat -> Ćir).
 * Slučajevi gde grafička struktura liči na digraf, ali se izgovara odvojeno.
 */
export const LAT_TO_CYR_EXCEPTIONS: Record<string, string> = {
    // nj -> нј (nije њ)
    injekcija: "инјекција",
    injekcije: "инјекције",
    injekciji: "инјекцији",
    injekciju: "инјекцију",
    injekcijom: "инјекцијом",
    injektor: "инјектор",
    konjugacija: "конјугација",
    konjunkcija: "конјункција",
    anjon: "анјон",
    katjon: "катјон",
    tanjug: "танјуг", // ako nije zaštićeno kao brend u rules.ts

    // dž -> дж (nije џ)
    nadživeti: "надживети",
    nadživim: "надживим",
    podžanr: "поджанр",
    predživot: "предживот",
};

/**
 * Proverava da li reč ima definisan izuzetak.
 * Vraća preslovljenu reč sa očuvanim casing-om (prvo slovo).
 */
export function checkException(word: string): string | null {
    const lower = word.toLowerCase();
    const replacement = LAT_TO_CYR_EXCEPTIONS[lower];

    if (!replacement) return null;

    // Match case logic (Simple: First letter only)
    const firstChar = word[0];
    if (firstChar && firstChar === firstChar.toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }

    return replacement;
}
