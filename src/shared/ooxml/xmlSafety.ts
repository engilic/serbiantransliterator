// src/shared/ooxml/xmlSafety.ts

export function isSafeXml(xml: string): boolean {
    // SECURITY: Prevent XXE attacks.
    // OOXML parts (document.xml) strictly should not have DTDs or ENTITY declarations.
    // We reject any XML containing DOCTYPE or ENTITY definitions case-insensitively.
    return !/<!DOCTYPE/i.test(xml) && !/<!ENTITY/i.test(xml);
}
