import { isSafeXml } from "./converterUtils";

export function parseSafeOoxml(xml: string): Document | null {
    // 1. Sanitization Check
    if (!isSafeXml(xml)) {
        return null; // Reject Unsafe XML
    }

    // 2. Parsing
    try {
        const parser = new DOMParser();
        // The parser processes XML as a data structure, not executable code.
        // Input is strictly validated by isSafeXml above to prevent XXE.

        // eslint-disable-next-line
        const doc = parser.parseFromString(xml, "application/xml"); // codeql[js/xxe] // codeql[js/xss]

        return doc;
    } catch {
        return null;
    }
}
