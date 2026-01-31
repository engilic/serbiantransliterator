// tests/roundtripFuzz.test.ts

import { describe, it, expect } from "vitest";
import { latinToCyrillic, cyrillicToLatin } from "../src/core/serbian";

// Determinističan PRNG (xorshift32) da test ne bude “flaky”
function makeRng(seed: number) {
    let x = seed >>> 0;
    return () => {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        return x >>> 0;
    };
}

function randInt(rng: () => number, min: number, maxInclusive: number): number {
    const span = maxInclusive - min + 1;
    return min + (rng() % span);
}

describe("Round-trip fuzz (lowercase)", () => {
    it("latin -> cyr -> latin (lowercase, uključujući lj/nj/dž)", () => {
        const rng = makeRng(0xc0ffee);

        const letters = "abcčćdđefghijklmnoprsštuvzž";
        const digraphs = ["lj", "nj", "dž"] as const;

        for (let t = 0; t < 500; t++) {
            const len = randInt(rng, 1, 40);

            let w = "";
            for (let i = 0; i < len; ) {
                const useDigraph = randInt(rng, 0, 9) === 0 && i + 2 <= len;
                if (useDigraph) {
                    w += digraphs[randInt(rng, 0, digraphs.length - 1)];
                    i += 2;
                    continue;
                }

                w += letters[randInt(rng, 0, letters.length - 1)]!;
                i += 1;
            }

            const c = latinToCyrillic(w).normalize("NFC");
            const back = cyrillicToLatin(c).normalize("NFC");

            expect(back).toBe(w);
        }
    });

    it("cyr -> latin -> cyr (lowercase) za KANONSKI srpski ćirilični tekst (bez лј/нј/дж)", () => {
        const rng = makeRng(0xbadc0de);

        const cyrLetters = "абвгдђежзијклљмнњопрстћуфхцчџш";

        for (let t = 0; t < 500; t++) {
            const len = randInt(rng, 1, 40);

            let w = "";
            for (let i = 0; i < len; i++) {
                // biramo slovo, ali izbegavamo ambigvne bigrame:
                // л + ј (može postati љ), н + ј (može postati њ), д + ж (može postati џ)
                let ch = "";
                for (;;) {
                    ch = cyrLetters[randInt(rng, 0, cyrLetters.length - 1)]!;
                    const prev = w.length ? w[w.length - 1]! : "";

                    const bad =
                        (prev === "л" && ch === "ј") ||
                        (prev === "н" && ch === "ј") ||
                        (prev === "д" && ch === "ж");

                    if (!bad) break;
                }

                w += ch;
            }

            const lat = cyrillicToLatin(w).normalize("NFC");
            const back = latinToCyrillic(lat).normalize("NFC");

            expect(back).toBe(w);
        }
    });

    it("dokaz ambigviteta: 'лј' i 'љ' oba postanu 'lj', pa round-trip ne čuva 'лј'", () => {
        const original = "лј";
        const lat = cyrillicToLatin(original);
        expect(lat).toBe("lj");

        const back = latinToCyrillic(lat);
        expect(back).toBe("љ"); // nije "лј"
    });
});
