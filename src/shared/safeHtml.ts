/**
 * Runtime-safe SafeHtml.
 *
 * Cilj:
 * - TypeScript da spreči da običan string ide u innerHTML pipeline
 * - Runtime marker (Symbol) da spreči “lažno trusted” stringove
 */

const SAFE_HTML = Symbol("SafeHtml");

export type SafeHtml = {
    readonly [SAFE_HTML]: true;
    readonly html: string;
};

export function escapeHtml(unsafe: string): string {
    return (unsafe ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isSafeHtml(value: unknown): value is SafeHtml {
    return (
        typeof value === "object" &&
        value !== null &&
        (value as Record<string | symbol, unknown>)[SAFE_HTML] === true &&
        typeof (value as { html?: unknown }).html === "string"
    );
}

/**
 * Tagged template literal za kreiranje sanitizovanog HTML-a.
 * Svi interpolirani stringovi se automatski escape-uju.
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): SafeHtml {
    let result = strings[0] ?? "";

    for (let i = 0; i < values.length; i++) {
        const v = values[i];

        if (isSafeHtml(v)) {
            result += v.html;
        } else {
            result += escapeHtml(String(v ?? ""));
        }

        result += strings[i + 1] ?? "";
    }

    return { [SAFE_HTML]: true, html: result };
}

/**
 * Wrapper za hardcoded HTML koji znamo da je bezbedan.
 * OPASNO: koristi SAMO za statički HTML iz koda, NIKAD za user input!
 */
export function unsafeHtml(trustedHtml: string): SafeHtml {
    return { [SAFE_HTML]: true, html: trustedHtml };
}

/** Konvertuje SafeHtml nazad u običan string (za DOM operacije). */
export function unwrapHtml(safe: SafeHtml): string {
    return safe.html;
}