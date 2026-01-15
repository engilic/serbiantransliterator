import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { convertOoxml } from "../src/shared/transliterator";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const XML_NS = "http://www.w3.org/XML/1998/namespace";

function loadFixture(name: string): string {
    const p = path.resolve(process.cwd(), "tests", "fixtures", name);
    return readFileSync(p, "utf8");
}

function getTextNodes(xml: string): Element[] {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagNameNS(W_NS, "t"));
}

describe("convertOoxml - tabs, breaks, xml:space + spaces bridging", () => {
    it("čuva w:tab i w:br, a preslovljava w:t", () => {
        const xml = loadFixture("tabs_and_breaks.xml");
        const r = convertOoxml(xml, { direction: "lat-to-cyr" });

        expect(r.type).toBe("Lat → Ćir");

        // tab i break moraju ostati
        expect(r.xml).toMatch(/<w:tab\s*\/>/);
        expect(r.xml).toMatch(/<w:br\s*\/>/);

        // tekst mora biti preslovljen
        expect(r.xml).toContain(">Здраво<");
        expect(r.xml).toContain(">свет<");
        expect(r.xml).toContain(">џез<");
    });

    it("xml:space='preserve' se setuje kad ima vodeći/trailing razmak, i spaces-bridging uklanja duple razmake preko granice", () => {
        const xml = loadFixture("xml_space_and_spaces.xml");
        const r = convertOoxml(xml, { direction: "lat-to-cyr" });

        expect(r.type).toBe("Lat → Ćir");

        const tNodes = getTextNodes(r.xml);
        const texts = tNodes.map((n) => n.textContent ?? "");

        // očekujemo da i dalje postoji node sa vodećim+trailing razmakom (i da je preslovljeno)
        expect(texts.some((t) => t === " Здраво ")).toBe(true);

        // " svet" je bio sa vodećim razmakom, ali pošto prethodni završava razmakom,
        // bridgeSpacesAcrossTextNodes treba da ukloni vodeći razmak -> "свет"
        expect(texts.some((t) => t === "свет")).toBe(true);
        expect(texts.some((t) => t === " свет")).toBe(false);

        // proveri da je xml:space="preserve" setovan bar na node-u koji ima vodeći/trailing razmak
        const hasPreserve = tNodes.some((n) => {
            const txt = n.textContent ?? "";
            const preserve = n.getAttributeNS(XML_NS, "space");
            return (txt.startsWith(" ") || txt.endsWith(" ")) && preserve === "preserve";
        });
        expect(hasPreserve).toBe(true);

        // i “kraj” se preslovljava
        expect(texts.some((t) => t === " крај")).toBe(true);
    });
});
