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

export function collectTextNodes(doc: Document): Element[] {
    let allTextNodes = Array.from(doc.getElementsByTagName("w:t"));
    if (allTextNodes.length === 0) {
        allTextNodes = Array.from(doc.getElementsByTagName("t"));
    }

    // preskoči field-code i deleted tekst
    return allTextNodes.filter((n) => {
        if (isInsideTag(n, "instrText")) return false;
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