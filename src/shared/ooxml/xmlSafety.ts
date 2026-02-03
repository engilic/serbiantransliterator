// src/shared/ooxml/xmlSafety.ts

/**
 * XML Safety Gate (fail-closed).
 *
 * Goals:
 * - Block XXE / DTD / ENTITY (DOCTYPE/ENTITY).
 * - Add a hard size limit to prevent DoS (memory/time).
 * - Reject obviously invalid / dangerous control chars.
 *
 * NOTE:
 * - DOMParser("application/xml") does not execute scripts, but huge/hostile XML can still DoS.
 * - This is a *pre-parse* gate. xmlParser.ts also does a post-parse doctype check as defense-in-depth.
 */

// Keep aligned with your UX messaging ("5MB limit").
// This is a character limit (not bytes). It's intentionally conservative.
const MAX_XML_CHARS = 5_000_000;

/**
 * Returns true if the XML string is considered safe enough to parse.
 */
export function isSafeXml(xml: string): boolean {
    if (typeof xml !== "string") return false;

    // Empty is safe (caller can treat as "no content")
    if (xml.length === 0) return true;

    // Hard size limit to prevent DOMParser from blowing memory/time
    if (xml.length > MAX_XML_CHARS) return false;

    // Quick control-char rejection (XML 1.0 disallows most control chars; \u0000 is the worst)
    // We keep it minimal to avoid false positives while still blocking pathological input.
    if (xml.indexOf("\u0000") !== -1) return false;

    // SECURITY: Prevent XXE attacks.
    // Reject any XML containing DOCTYPE or ENTITY definitions (case-insensitive).
    // This is the main defense against external entity expansion / DTD attacks.
    // NOTE: "SYSTEM" / "PUBLIC" identifiers are covered by DOCTYPE anyway.
    if (/<!DOCTYPE/i.test(xml)) return false;
    if (/<!ENTITY/i.test(xml)) return false;

    return true;
}
