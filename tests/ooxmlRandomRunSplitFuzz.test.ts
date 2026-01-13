import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

// Determinističan PRNG (xorshift32)
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

function escapeXmlText(s: string): string {
    // za text node su bitni &, <, >
    return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapDoc(segments: string[]): string {
    const runs = segments
        .map((t) => `<w:r><w:t>${escapeXmlText(t)}</w:t></w:r>`)
        .join("");
    return `<w:document xmlns:w="${W_NS}"><w:body><w:p>${runs}</w:p></w:body></w:document>`;
}

function extractAllTText(xml: string): string {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const tNodes = Array.from(doc.getElementsByTagNameNS(W_NS, "t"));
    return tNodes.map((n) => n.textContent ?? "").join("");
}

function makeSampleText(rng: () => number): string {
    // Biramo “realistične” delove koji targetiraju tvoje bridge/protect grane
    const chunks = [
        "Zdravo", "svet", "ljubav", "džez", "injekcija", "Petar IV", "V vek",
        "Kupio sam iPhone danas",
        "Node.js", "Save As", "Local Storage",
        "https://example.com/test", "test@example.com",
        "mailto:test@example.com", "tel:+381641234567;ext=123",
        'Rekao je "Test"', // quotes state machine
        " (https://example.com/test), ", // punctuation trim na linku
        " fooBar ", "1a2b3c4d", "Müller",
    ];

    const n = randInt(rng, 3, 14);
    let out = "";
    for (let i = 0; i < n; i++) {
        const c = chunks[randInt(rng, 0, chunks.length - 1)]!;
        out += (i === 0 ? "" : " ") + c;
    }

    // Važno: izbegni “dvostruke razmake” da ti structural bridge ne promeni semantiku testa
    out = out.replace(/ {2,}/g, " ");

    return out;
}

function splitIntoRandomSegments(text: string, rng: () => number): string[] {
    const cps = Array.from(text.normalize("NFC"));

    const parts = randInt(rng, 1, Math.min(18, Math.max(1, cps.length)));
    const cuts = new Set<number>();

    for (let i = 0; i < parts - 1; i++) {
        cuts.add(randInt(rng, 1, cps.length - 1));
    }

    const idxs = Array.from(cuts).sort((a, b) => a - b);

    const segs: string[] = [];
    let prev = 0;
    for (const cut of idxs) {
        segs.push(cps.slice(prev, cut).join(""));
        prev = cut;
    }
    segs.push(cps.slice(prev).join(""));

    // Ponekad ubaci prazne node-ove (Word ume)
    const withEmpties: string[] = [];
    for (const s of segs) {
        withEmpties.push(s);
        if (randInt(rng, 0, 9) === 0) withEmpties.push("");
    }

    // Odbaci sve-prazno (da ne dobijemo dokument bez teksta)
    const allEmpty = withEmpties.every((x) => x === "");
    if (allEmpty) return [text];

    return withEmpties;
}

describe("OOXML random <w:t> splitting fuzz — rezultat mora biti identičan", () => {
    it("lat-to-cyr: split vs unsplit daju isti finalni tekst", () => {
        const rng = makeRng(0xC0FFEE);

        for (let t = 0; t < 200; t++) {
            const input = makeSampleText(rng);

            const xml1 = wrapDoc([input]); // unsplit
            const xml2 = wrapDoc(splitIntoRandomSegments(input, rng)); // split

            const out1 = convertOoxml(xml1, {
                direction: "lat-to-cyr",
                protectBrands: true,
                preserveCodeBlocks: true,
                applySerbianQuotes: true,
                protectRomans: true,
            }).xml;

            const out2 = convertOoxml(xml2, {
                direction: "lat-to-cyr",
                protectBrands: true,
                preserveCodeBlocks: true,
                applySerbianQuotes: true,
                protectRomans: true,
            }).xml;

            expect(extractAllTText(out2)).toBe(extractAllTText(out1));
        }
    });

    it("cyr-to-lat: split vs unsplit daju isti finalni tekst", () => {
        const rng = makeRng(0xBADC0DE);

        // Napravi ćirilični input tako što ćemo prvo konvertovati lat->cyr preko core logike add-ina
        // (koristimo convertOoxml jer je već tu i testira pipeline)
        for (let t = 0; t < 200; t++) {
            const baseLat = makeSampleText(rng);
            const baseCyrXml = convertOoxml(wrapDoc([baseLat]), { direction: "lat-to-cyr" }).xml;
            const baseCyrText = extractAllTText(baseCyrXml);

            const xml1 = wrapDoc([baseCyrText]);
            const xml2 = wrapDoc(splitIntoRandomSegments(baseCyrText, rng));

            const out1 = convertOoxml(xml1, {
                direction: "cyr-to-lat",
                protectBrands: true,
                preserveCodeBlocks: true,
                protectRomans: true,
            }).xml;

            const out2 = convertOoxml(xml2, {
                direction: "cyr-to-lat",
                protectBrands: true,
                preserveCodeBlocks: true,
                protectRomans: true,
            }).xml;

            expect(extractAllTText(out2)).toBe(extractAllTText(out1));
        }
    });
});