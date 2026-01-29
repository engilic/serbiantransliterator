// src/shared/ooxml/xmlSafety.ts
export function isSafeXml(xml: string): boolean {
    // SECURITY: Prevent XXE attacks.
    // Reject any XML containing DOCTYPE or ENTITY definitions (case-insensitive).
    return !/<!DOCTYPE/i.test(xml) && !/<!ENTITY/i.test(xml);
}
