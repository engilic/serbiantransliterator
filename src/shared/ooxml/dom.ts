// src/shared/ooxml/dom.ts

export const XML_NS = "http://www.w3.org/XML/1998/namespace";
export const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

export function needsXmlSpacePreserve(text: string): boolean {
    return /^\s/.test(text) || /\s$/.test(text);
}

export function isInsideTag(el: Element, localName: string): boolean {
    let cur: Element | null = el;
    while (cur) {
        if (cur.localName === localName) return true;
        cur = cur.parentElement;
    }
    return false;
}

// [NEW] Helper to get paragraph style ID
export function getParagraphStyleId(para: Element): string | null {
    // Structure: <w:p> -> <w:pPr> -> <w:pStyle w:val="Code"/>
    // Using simple traversal for speed (avoiding querySelector in hot loop if possible)

    // 1. Find w:pPr direct child
    let pPr: Element | null = null;
    for (let i = 0; i < para.children.length; i++) {
        const child = para.children[i];
        if (child?.localName === "pPr") {
            pPr = child;
            break;
        }
    }

    if (!pPr) return null;

    // 2. Find w:pStyle child of pPr
    for (let i = 0; i < pPr.children.length; i++) {
        const child = pPr.children[i];
        if (child?.localName === "pStyle") {
            // 3. Get w:val attribute
            return child.getAttributeNS(WORD_NS, "val");
        }
    }

    return null;
}

// [MODIFIED] collectTextNodes is now context-aware if needed, but we refactored usage in convertOoxml
export function collectTextNodes(doc: Document): Element[] {
    // Prefer namespace-aware lookup (most robust for OOXML)
    let allTextNodes = Array.from(doc.getElementsByTagNameNS(WORD_NS, "t"));

    // Fallbacks (defensive)
    if (allTextNodes.length === 0) allTextNodes = Array.from(doc.getElementsByTagName("w:t"));
    if (allTextNodes.length === 0) allTextNodes = Array.from(doc.getElementsByTagName("t"));

    // preskoči field-code i deleted tekst
    return allTextNodes.filter((n) => {
        if (isInsideTag(n, "instrText")) return false;
        if (isInsideTag(n, "fldSimple")) return false;
        if (isInsideTag(n, "fldChar")) return false;
        if (isInsideTag(n, "delText")) return false;
        return true;
    });
}

export function getFullText(textNodes: Element[]): string {
    let fullText = "";
    for (const node of textNodes) {
        fullText += node.textContent ?? "";
    }
    return fullText;
}
