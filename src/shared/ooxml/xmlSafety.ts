// src/shared/ooxml/xmlSafety.ts

export function isSafeXml(xml: string): boolean {
    // OOXML files (document.xml) usually don't have DTDs or ENTITY declarations.
    // If they do, it's suspicious in this context.
    if (xml.includes("<!DOCTYPE") || xml.includes("<!ENTITY")) {
        return false;
    }
    return true;
}
