// @ts-nocheck
// tests/safeHtml.test.ts

import { describe, it, expect } from "vitest";
import { html, unsafeHtml, unwrapHtml } from "../src/shared/safeHtml";

describe("safeHtml", () => {
    it("html`` escape-uje interpolacije (ne sme ostati pravi HTML tag)", () => {
        const user = `<img src=x onerror="alert(1)">`;
        const s = html`Hello ${user}!`;
        const out = unwrapHtml(s);

        // ključna bezbednosna stvar: ne sme ostati realan tag
        expect(out).not.toContain("<img");

        // ali mora biti escape-ovan kao tekst
        expect(out).toContain("&lt;img");
        expect(out).toContain("&gt;");

        // dodatna provera: navodnici su escape-ovani
        expect(out).toContain("&quot;");
    });

    it("unsafeHtml prolazi raw (samo za hardcoded)", () => {
        const s = unsafeHtml("<b>OK</b>");
        expect(unwrapHtml(s)).toBe("<b>OK</b>");
    });
});
