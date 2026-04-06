// src/shared/ooxml/dom.ts

export const XML_NS = "http://www.w3.org/XML/1998/namespace";
export const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

const ELEMENT_NODE = 1;

type ArrayLike<T> = { length: number; [index: number]: T | null | undefined };

function readStringField(obj: unknown, key: string): string | null {
    if (!obj || typeof obj !== "object") return null;
    const rec = obj as Record<string, unknown>;
    const v = rec[key];
    return typeof v === "string" && v.length > 0 ? v : null;
}

function getLocalNameSafe(el: Element): string {
    const ln = readStringField(el, "localName");
    if (ln) return ln;

    const nn = readStringField(el, "nodeName");
    if (nn) {
        const parts = nn.split(":");
        return parts[parts.length - 1] || nn;
    }

    return "";
}

function arrayLikeToElements<T>(list: ArrayLike<T>): T[] {
    const out: T[] = [];
    for (let i = 0; i < list.length; i++) {
        const v = list[i];
        if (v != null) out.push(v);
    }
    return out;
}

function getElementChildrenSafe(el: Element): Element[] {
    // Browser DOM: el.children
    const childrenUnknown = (el as unknown as { children?: unknown }).children;
    if (childrenUnknown && typeof childrenUnknown === "object") {
        const len = (childrenUnknown as { length?: unknown }).length;
        if (typeof len === "number") {
            return arrayLikeToElements(childrenUnknown as ArrayLike<Element>);
        }
    }

    // xmldom: childNodes (filtriramo element čvorove)
    const childNodesUnknown = (el as unknown as { childNodes?: unknown }).childNodes;
    if (childNodesUnknown && typeof childNodesUnknown === "object") {
        const len = (childNodesUnknown as { length?: unknown }).length;
        if (typeof len === "number") {
            const nodes = arrayLikeToElements(childNodesUnknown as ArrayLike<Node>);
            return nodes.filter((n): n is Element => n.nodeType === ELEMENT_NODE) as Element[];
        }
    }

    return [];
}

function getParentElementSafe(el: Element): Element | null {
    const pe = (el as unknown as { parentElement?: Element | null }).parentElement;
    if (pe) return pe;

    // xmldom: parentNode
    let p = (el as unknown as { parentNode?: Node | null }).parentNode;
    while (p && p.nodeType !== ELEMENT_NODE) {
        p = (p as { parentNode?: Node | null }).parentNode ?? null;
    }
    return p ? (p as Element) : null;
}

function getAttrValSafe(el: Element): string | null {
    // Prefer namespaced val: w:val
    const getAttrNS = (el as unknown as { getAttributeNS?: unknown }).getAttributeNS;
    if (typeof getAttrNS === "function") {
        try {
            const v = (getAttrNS as (ns: string, name: string) => string | null).call(el, WORD_NS, "val");
            if (typeof v === "string" && v.length > 0) return v;
        } catch {
            void 0;
        }
    }

    // Fallbacks (xmldom / parser razlike)
    const getAttr = (el as unknown as { getAttribute?: unknown }).getAttribute;
    if (typeof getAttr === "function") {
        try {
            const v =
                (getAttr as (name: string) => string | null).call(el, "w:val") ??
                (getAttr as (name: string) => string | null).call(el, "val");
            if (typeof v === "string" && v.length > 0) return v;
        } catch {
            void 0;
        }
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

// Podrška za Character Styles (Inline Code)
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
