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

// [OPTIMIZED] Brže čitanje stila bez querySelector-a
function getStyleIdFromPr(prElement: Element): string | null {
    for (let i = 0; i < prElement.children.length; i++) {
        const child = prElement.children[i];
        // Provera localName je brža od string match-a
        if (child.localName === "pStyle" || child.localName === "rStyle") {
            return child.getAttributeNS(WORD_NS, "val");
        }
    }
    return null;
}

export function getParagraphStyleId(para: Element): string | null {
    // Structure: <w:p> -> <w:pPr> -> <w:pStyle w:val="Code"/>
    for (let i = 0; i < para.children.length; i++) {
        const child = para.children[i];
        if (child.localName === "pPr") {
            return getStyleIdFromPr(child);
        }
    }
    return null;
}

// [NEW] Podrška za Character Styles (Inline Code)
export function getRunStyleId(run: Element): string | null {
    // Structure: <w:r> -> <w:rPr> -> <w:rStyle w:val="CodeChar"/>
    for (let i = 0; i < run.children.length; i++) {
        const child = run.children[i];
        if (child.localName === "rPr") {
            return getStyleIdFromPr(child);
        }
    }
    return null;
}

export function collectTextNodes(doc: Document): Element[] {
    let allTextNodes = Array.from(doc.getElementsByTagNameNS(WORD_NS, "t"));
    if (allTextNodes.length === 0) allTextNodes = Array.from(doc.getElementsByTagName("w:t"));
    if (allTextNodes.length === 0) allTextNodes = Array.from(doc.getElementsByTagName("t"));

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
