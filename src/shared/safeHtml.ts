// src/shared/safeHtml.ts

/**
 * SafeHtml runtime wrapper.
 *
 * Bitno: branded string ne pomaže u runtime-u (TS tipovi nestanu),
 * pa koristimo wrapper objekat sa __html poljem.
 */

export type SafeHtml = { readonly __html: string };

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

function isSafeHtml(value: unknown): value is SafeHtml {
    if (!value || typeof value !== "object") return false;

    // eslint: nema `any`, koristimo unknown property
    const v = value as { __html?: unknown };
    return typeof v.__html === "string";
}

/**
 * Tagged template literal za kreiranje sanitizovanog HTML-a.
 * Svi interpolirani stringovi se automatski escape-uju.
 *
 * Ako želiš da ubaciš "raw" HTML, moraš eksplicitno da koristiš unsafeHtml().
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): SafeHtml {
    let result = strings[0] ?? "";

    for (let i = 0; i < values.length; i++) {
        const v = values[i];

        if (isSafeHtml(v)) {
            result += v.__html;
        } else {
            result += escapeHtml(String(v ?? ""));
        }

        result += strings[i + 1] ?? "";
    }

    return { __html: result };
}

/**
 * Wrapper za hardcoded HTML koji znamo da je bezbedan.
 * OPASNO: Koristi SAMO za statički HTML iz koda, NIKAD za user input!
 */
export function unsafeHtml(trustedHtml: string): SafeHtml {
    return { __html: trustedHtml ?? "" };
}

/**
 * Konvertuje SafeHtml nazad u običan string (za DOM operacije).
 */
export function unwrapHtml(safe: SafeHtml): string {
    return safe.__html;
}
