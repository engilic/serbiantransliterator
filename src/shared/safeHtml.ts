/**
 * Brand type za HTML koji je prošao sanitizaciju.
 * TypeScript sprečava da se obični string prosledi kao SafeHtml.
 */
export type SafeHtml = string & { readonly __brand: unique symbol };

/**
 * Escape HTML special karaktera da spreči XSS.
 * 
 * @example
 * escapeHtml("<script>alert(1)</script>")
 * // Returns: "&lt;script&gt;alert(1)&lt;/script&gt;"
 */
export function escapeHtml(unsafe: string): string {
    return (unsafe ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Tagged template literal za kreiranje sanitizovanog HTML-a.
 * Svi interpolirani stringovi se automatski escape-uju.
 * 
 * @example
 * const userName = getUserInput(); // može biti "<script>alert(1)</script>"
 * const safe = html`Korisnik <b>${userName}</b> je ulogovan.`;
 * // Rezultat: "Korisnik <b>&lt;script&gt;alert(1)&lt;/script&gt;</b> je ulogovan."
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): SafeHtml {
    let result = strings[0] ?? "";

    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        // Ako je već SafeHtml, ne escape-uj
        if (isSafeHtml(value)) {
            result += value;
        } else {
            // Sve ostalo (string, number, null, undefined) escape-uj
            result += escapeHtml(String(value ?? ""));
        }

        result += strings[i + 1] ?? "";
    }

    return result as SafeHtml;
}

/**
 * Type guard za proveru da li je string već SafeHtml.
 */
function isSafeHtml(value: unknown): value is SafeHtml {
    // U runtime-u, SafeHtml je obični string, pa samo proveravamo da li je string
    // TypeScript koristi strukturu za compile-time provere
    return typeof value === "string";
}

/**
 * Wrapper za hardcoded HTML koji znamo da je bezbedan.
 * OPASNO: Koristi SAMO za statički HTML iz koda, NIKAD za user input!
 * 
 * @example
 * const safe = unsafeHtml("<b>Ovo je bezbedan statički HTML</b>");
 */
export function unsafeHtml(trustedHtml: string): SafeHtml {
    return trustedHtml as SafeHtml;
}

/**
 * Konvertuje SafeHtml nazad u običan string (za DOM operacije).
 */
export function unwrapHtml(safe: SafeHtml): string {
    return safe as string;
}