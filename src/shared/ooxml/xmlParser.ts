// src/shared/ooxml/xmlParser.ts

import { isSafeXml } from "./xmlSafety";

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
    // Basic type/DoS guards (defense-in-depth)
    if (typeof xml !== "string") return null;
    if (xml.length === 0) return null;

    // Hard DoS guard
    if (xml.length > MAX_OOXML_CHARS) return null;

    // Block DTD/entity expansion payloads before parsing (defense-in-depth).
    // Even if your xmlSafety already blocks these, keep this here so the safety is local and obvious.
    if (FORBIDDEN_XML_RE.test(xml)) return null;

    // Your existing safety checks (keep them)
    if (!isSafeXml(xml)) return null;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "application/xml");

        // Reject malformed XML
        try {
            const pe = doc.getElementsByTagName("parsererror");
            if (pe && pe.length > 0) return null;
        } catch {
            // ignore
        }

        // Defense-in-depth: reject documents that expose a doctype after parsing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyDoc = doc as any;
        if (anyDoc && anyDoc.doctype) return null;

        return doc;
    } catch {
        return null;
    }
}
