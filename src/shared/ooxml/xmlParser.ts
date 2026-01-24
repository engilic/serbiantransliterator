import { isSafeXml } from "./converterUtils";

export function parseSafeOoxml(xml: string): Document | null {
    // 1. Sanitization Check
    if (!isSafeXml(xml)) {
        return null; // Reject Unsafe XML
    }

    // 2. Parsing
    try {
        const parser = new DOMParser();
        // CodeQL [js/xxe] [js/xss] - Sanitized by isSafeXml above
        return parser.parseFromString(xml, "application/xml");
    } catch {
        return null;
    }
}
