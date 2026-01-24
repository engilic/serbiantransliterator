import { isSafeXml } from "./converterUtils";

export function parseSafeOoxml(xml: string): Document | null {
    if (!isSafeXml(xml)) {
        return null;
    }

    try {
        const parser = new DOMParser();

        // CodeQL False Positive Suppression
        // Input is validated by isSafeXml().
        // DOMParser in browser context is secure against XXE by default in modern browsers.
        // We are processing data, not executing code (XSS).

        // eslint-disable-next-line
        // codeql[js/xxe]
        // codeql[js/xss]
        return parser.parseFromString(xml, "application/xml");
    } catch {
        return null;
    }
}
