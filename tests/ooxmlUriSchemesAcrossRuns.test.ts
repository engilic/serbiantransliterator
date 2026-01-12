import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - URI schemes (sip/sms/geo/skype/teams) preko više <w:t>", () => {
    it("sip split ostaje ASCII", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Pozovi: sip:in</w:t></w:r>
      <w:r><w:t>fo@example.com</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
        const r = convertOoxml(OOXML, { direction: "lat-to-cyr" });
        expect(r.xml).toContain("Позови:");
        expect(r.xml).toContain("sip:info@example.com");
        expect(r.xml).not.toContain("сип:");
    });

    it("sms split ostaje ASCII", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>SMS: sms:+38164</w:t></w:r>
      <w:r><w:t>1234567?body=Test</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
        const r = convertOoxml(OOXML, { direction: "lat-to-cyr" });
        expect(r.xml).toContain("СМС:");
        expect(r.xml).toContain("sms:+381641234567?body=Test");
        expect(r.xml).not.toContain("смс:");
    });
});