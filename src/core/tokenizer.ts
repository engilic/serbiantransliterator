// src/core/tokenizer.ts
export type Tok = { type: "word" | "other"; value: string };

function isLetterOrDigit(ch: string): boolean {
    return /\p{L}|\p{N}/u.test(ch);
}

export function tokenize(text: string): Tok[] {
    const out: Tok[] = [];
    let i = 0;
    const push = (type: Tok["type"], value: string) => {
        if (!value) return;
        const last = out[out.length - 1];
        if (last && last.type === type) last.value += value;
        else out.push({ type, value });
    };
    while (i < text.length) {
        // FIX: Koristimo ?? "" umesto !
        const ch = text[i] ?? "";
        if (!ch) break;

        // FIX: Osiguravamo da su prev i next uvek stringovi, nikad undefined
        const prev = i > 0 ? text[i - 1] ?? "" : "";
        const next = i + 1 < text.length ? text[i + 1] ?? "" : "";

        const isJoiner =
            ch === "-" ||
            ch === "‑" ||
            ch === "‐" ||
            ch === "‒" ||
            ch === "–" ||
            ch === "—" ||
            ch === "'" ||
            ch === "’" ||
            ch === "." ||
            ch === "+" ||
            ch === "#" ||
            ch === "/";

        // FIX: Uklonjeni svi uzvičnici (prev! -> prev) jer su promenljive sada sigurne
        const joinerOk =
            isJoiner &&
            ((ch === "." && (isLetterOrDigit(next) || (isLetterOrDigit(prev) && isLetterOrDigit(next)))) ||
                ((ch === "+" || ch === "#") && (isLetterOrDigit(prev) || isLetterOrDigit(next))) ||
                (ch === "/" && isLetterOrDigit(prev) && isLetterOrDigit(next)) ||
                ((ch === "-" ||
                    ch === "‑" ||
                    ch === "‐" ||
                    ch === "‒" ||
                    ch === "–" ||
                    ch === "—" ||
                    ch === "'" ||
                    ch === "’") &&
                    (isLetterOrDigit(prev) || isLetterOrDigit(next))));

        if (isLetterOrDigit(ch) || joinerOk) push("word", ch);
        else push("other", ch);
        i++;
    }
    return out;
}

export function prevNextWord(tokens: Tok[], idx: number): { prev?: string; next?: string } {
    let prev: string | undefined;
    let next: string | undefined;
    for (let i = idx - 1; i >= 0; i--) {
        const tok = tokens[i];
        if (tok && tok.type === "word") {
            prev = tok.value;
            break;
        }
    }
    for (let i = idx + 1; i < tokens.length; i++) {
        const tok = tokens[i];
        if (tok && tok.type === "word") {
            next = tok.value;
            break;
        }
    }
    return { prev, next };
}

export function getPrevWord(tokens: Tok[], idx: number, n: number): string | undefined {
    let seen = 0;
    for (let i = idx - 1; i >= 0; i--) {
        const t = tokens[i];
        if (t?.type === "word") {
            seen++;
            if (seen === n) return t.value;
        }
    }
    return undefined;
}

export function getNextWord(tokens: Tok[], idx: number, n: number): string | undefined {
    let seen = 0;
    for (let i = idx + 1; i < tokens.length; i++) {
        const t = tokens[i];
        if (t?.type === "word") {
            seen++;
            if (seen === n) return t.value;
        }
    }
    return undefined;
}
