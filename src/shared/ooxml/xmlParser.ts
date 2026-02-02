// src/shared/ooxml/xmlParser.ts

import { isSafeXml } from "./xmlSafety";

/**
 * Parse OOXML XML in a "safe enough" way.
 *
 * - Runs pre-parse safety checks (isSafeXml).
 * - Uses DOMParser("application/xml").
 * - Defense-in-depth: rejects documents that still end up with a doctype after parsing.
 *
 * Returns:
 * - Document on success
 * - null on unsafe / invalid / disallowed constructs
 */
export function parseSafeOoxml(xml: string): Document | null {
    if (!isSafeXml(xml)) {
        return null;
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "application/xml");

        // Defense-in-depth: even though we block <!DOCTYPE> in string form,
        // ensure parsed doc has no doctype.
        // Some environments may expose doctype differently; handle defensively.
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyDoc = doc as any;
            if (anyDoc && anyDoc.doctype) {
                return null;
            }
        } catch {
            // ignore
        }

        return doc;
    } catch {
        return null;
    }
}
