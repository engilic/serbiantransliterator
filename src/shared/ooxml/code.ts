export type CodeState = {
    inFence: boolean;  // ``` ... ```
    inInline: boolean; // ` ... `
};

export type CodeParseStats = {
    fenceMarkersSeen: number;  // koliko puta je viđeno ```
    inlineTicksSeen: number;   // koliko puta je viđeno `
};

export function createInitialCodeState(): CodeState {
    return { inFence: false, inInline: false };
}

export function createInitialCodeParseStats(): CodeParseStats {
    return { fenceMarkersSeen: 0, inlineTicksSeen: 0 };
}

/**
 * Podeli tekst na segmente u/van koda i vrati transformisani tekst.
 * - ``` toggluje inFence
 * - ` toggluje inInline samo kad NISMO u fence bloku
 */
export function transformTextRespectingCode(
    input: string,
    state: CodeState,
    transformNonCode: (s: string) => string,
    transformCode: (s: string) => string = (s) => s,
    stats?: CodeParseStats
): string {
    let out = "";
    let buf = "";

    const flush = () => {
        if (!buf) return;
        const inCode = state.inFence || state.inInline;
        out += inCode ? transformCode(buf) : transformNonCode(buf);
        buf = "";
    };

    let i = 0;
    while (i < input.length) {
        if (input.startsWith("```", i)) {
            flush();
            out += "```";
            state.inFence = !state.inFence;
            if (state.inFence) state.inInline = false;
            if (stats) stats.fenceMarkersSeen += 1;
            i += 3;
            continue;
        }

        const ch = input[i]!;
        if (ch === "`" && !state.inFence) {
            flush();
            out += "`";
            state.inInline = !state.inInline;
            if (stats) stats.inlineTicksSeen += 1;
            i += 1;
            continue;
        }

        buf += ch;
        i += 1;
    }

    flush();
    return out;
}

export function transformQuotesRespectingCode(
    input: string,
    codeState: CodeState,
    quoteState: { open: boolean }
): string {
    const normalizeQuotes = (s: string) => s.replace(/[“”‘’«»„‟‚‛‹›]/g, `"`);

    return transformTextRespectingCode(
        input,
        codeState,
        (nonCode) => {
            const normalized = normalizeQuotes(nonCode);
            let out = "";
            for (const ch of normalized) {
                if (ch === `"`) {
                    out += quoteState.open ? "”" : "„";
                    quoteState.open = !quoteState.open;
                } else {
                    out += ch;
                }
            }
            return out;
        },
        (code) => code
    );
}