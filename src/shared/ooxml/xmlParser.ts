// src/shared/ooxml/xmlParser.ts

import { isSafeXml } from "./xmlSafety";

export function parseSafeOoxml(xml: string): Document | null {
    if (!isSafeXml(xml)) {
        return null;
    }

    try {
        const parser = new DOMParser();
        return parser.parseFromString(xml, "application/xml");
    } catch {
        return null;
    }
}
