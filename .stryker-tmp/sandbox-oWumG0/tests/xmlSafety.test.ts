// @ts-nocheck
// tests/xmlSafety.test.ts

import { describe, it, expect } from "vitest";
import { isSafeXml } from "../src/shared/ooxml/xmlSafety";

describe("XML Security Checks", () => {
    it("rejects XML with DOCTYPE (XXE prevention)", () => {
        const malicious = `<!DOCTYPE foo [<!ELEMENT foo ANY >]><foo>bar</foo>`;
        expect(isSafeXml(malicious)).toBe(false);
    });

    it("rejects XML with ENTITY (XXE prevention)", () => {
        const malicious = `<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd" >]><foo>&xxe;</foo>`;
        expect(isSafeXml(malicious)).toBe(false);
    });

    it("accepts valid OOXML", () => {
        const valid = `<w:document xmlns:w="..."><w:body></w:body></w:document>`;
        expect(isSafeXml(valid)).toBe(true);
    });

    it("accepts simple text", () => {
        expect(isSafeXml("Just some text")).toBe(true);
    });
});
