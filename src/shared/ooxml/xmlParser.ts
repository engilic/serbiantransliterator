// src/shared/ooxml/xmlParser.ts

/**
 * SECURITY GOALS
 * - Treat OOXML as untrusted input.
 * - Block DTD/ENTITY before parsing (prevents XXE-like tricks + "billion laughs"/entity bombs).
 * - Enforce size limit to reduce DoS risk.
 * - Parse as application/xml (NOT text/html).
 * - Reject parsererror + any document that still exposes a doctype.
 *
 * IMPORTANT:
 * The returned Document must be treated as DATA ONLY.
 * Never insert it into the live DOM (no innerHTML/outerHTML/insertAdjacentHTML/etc).
 */
const MAX_OOXML_CHARS = 5_000_000; // ~5MB in characters; adjust if needed for your docs
const FORBIDDEN_XML_RE = /<!\s*(DOCTYPE|ENTITY)\b/i;

export function parseSafeOoxml(xml: string): Document | null {
    if (typeof xml !== "string" || xml.length === 0 || xml.length > MAX_OOXML_CHARS) return null;

    // [MAX1 Security] Blokiraj entitete i eksterne definicije pre nego što uopšte dođu do parsera
    if (FORBIDDEN_XML_RE.test(xml)) return null;

    // Dodatna provera za duboko ugnježdene elemente (DoS zaštita)
    if (xml.split("<").length > 50000) return null;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "application/xml");

        const pe = doc.getElementsByTagName("parsererror");
        if (pe && pe.length > 0) return null;

        // [MAX1] Osiguraj da dokument nema DOCTYPE čak i ako je parser "progutao"
        if (doc.doctype) return null;

        return doc;
    } catch {
        return null;
    }
}
