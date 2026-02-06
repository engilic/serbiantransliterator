// src/shared/ooxml/dom.ts

export const XML_NS = "http://www.w3.org/XML/1998/namespace";
export const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

const ELEMENT_NODE = 1;

function getLocalNameSafe(el: Element): string {
    // xmldom / razni DOM-ovi: localName može faliti
    const anyEl = el as any;
    const ln = anyEl.localName;
    if (typeof ln === "string" && ln.length > 0) return ln;

    const nn = anyEl.nodeName;
    if (typeof nn === "string" && nn.length > 0) {
        const parts = nn.split(":");
        return parts[parts.length - 1] || nn;
    }

    return "";
}

function getElementChildrenSafe(el: Element): Element[] {
    const anyEl = el as any;

    // Browser DOM: el.children (HTMLCollection)
    if (anyEl.children && typeof anyEl.children.length === "number") {
        return Array.from(anyEl.children) as Element[];
    }

    // xmldom: childNodes postoji, filtriramo element čvorove
    const cn = anyEl.childNodes;
    if (cn && typeof cn.length === "number") {
        return (Array.from(cn) as any[]).filter((n) => n && n.nodeType === ELEMENT_NODE) as Element[];
    }

    return [];
}

function getParentElementSafe(el: Element): Element | null {
    const anyEl = el as any;

    if (anyEl.parentElement) return anyEl.parentElement as Element;

    // xmldom često ima parentNode umesto parentElement
    let p = anyEl.parentNode;
    while (p && p.nodeType !== ELEMENT_NODE) {
        p = p.parentNode;
    }
    return p ? (p as Element) : null;
}

function getAttrValSafe(el: Element): string | null {
    const anyEl = el as any;

    // Prefer namespaced val: w:val
    try {
        if (typeof anyEl.getAttributeNS === "function") {
            const v = anyEl.getAttributeNS(WORD_NS, "val");
            if (typeof v === "string" && v.length > 0) return v;
        }
    } catch {
        // ignore
    }

    // Fallbacks (xmldom / parser razlike)
    try {
        if (typeof anyEl.getAttribute === "function") {
            const v = anyEl.getAttribute("w:val") || anyEl.getAttribute("val");
            if (typeof v === "string" && v.length > 0) return v;
        }
    } catch {
        // ignore
    }

    return null;
}

export function needsXmlSpacePreserve(text: string): boolean {
    return /^\s/.test(text) || /\s$/.test(text);
}

export function isInsideTag(el: Element, localName: string): boolean {
    let cur: Element | null = el;
    while (cur) {
        if (getLocalNameSafe(cur) === localName) return true;
        cur = getParentElementSafe(cur);
    }
    return false;
}

// [OPTIMIZED] Brže čitanje stila bez querySelector-a
function getStyleIdFromPr(prElement: Element): string | null {
    const kids = getElementChildrenSafe(prElement);
    for (let i = 0; i < kids.length; i++) {
        const child = kids[i];
        const ln = getLocalNameSafe(child);

        // Provera localName je brža od string match-a
        if (ln === "pStyle" || ln === "rStyle") {
            return getAttrValSafe(child);
        }
    }
    return null;
}

export function getParagraphStyleId(para: Element): string | null {
    // Structure: <w:p> -> <w:pPr> -> <w:pStyle w:val="Code"/>
    const kids = getElementChildrenSafe(para);
    for (let i = 0; i < kids.length; i++) {
        const child = kids[i];
        if (getLocalNameSafe(child) === "pPr") {
            return getStyleIdFromPr(child);
        }
    }
    return null;
}

// [NEW] Podrška za Character Styles (Inline Code)
export function getRunStyleId(run: Element): string | null {
    // Structure: <w:r> -> <w:rPr> -> <w:rStyle w:val="CodeChar"/>
    const kids = getElementChildrenSafe(run);
    for (let i = 0; i < kids.length; i++) {
        const child = kids[i];
        if (getLocalNameSafe(child) === "rPr") {
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
