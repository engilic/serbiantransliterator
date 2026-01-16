// src/taskpane/app/i18n/uiI18n.ts
/* global document, navigator */

import { setLanguage, t, type Language } from "../../../shared/i18n";

/**
 * Ultra-defensive language pick:
 * - prefer Office displayLanguage/contentLanguage if available
 * - else fallback to navigator.language
 * - default: "sr"
 */
export function detectUiLanguage(): Language {
    try {
        const officeAny = (globalThis as unknown as { Office?: any }).Office;
        const displayLang: string | undefined = officeAny?.context?.displayLanguage;
        const contentLang: string | undefined = officeAny?.context?.contentLanguage;

        const pick = (displayLang || contentLang || "").toLowerCase();
        if (pick.startsWith("en")) return "en";
    } catch {
        // ignore
    }

    try {
        const nav = (navigator?.language || "").toLowerCase();
        if (nav.startsWith("en")) return "en";
    } catch {
        // ignore
    }

    return "sr";
}

function setAttr(el: Element, attrName: string, value: string) {
    // empty value => remove to avoid stale tooltips/placeholders
    if (!value) el.removeAttribute(attrName);
    else el.setAttribute(attrName, value);
}

/**
 * Apply translations to:
 * - elements with data-i18n (textContent)
 * - elements with data-i18n-attr="title:key,placeholder:key,aria-label:key"
 *
 * Security: uses textContent / setAttribute only.
 */
export function applyI18nToDom(root: ParentNode = document): void {
    // text nodes
    const textEls = root.querySelectorAll?.("[data-i18n]") ?? [];
    for (const el of Array.from(textEls)) {
        const key = (el as HTMLElement).dataset?.i18n;
        if (!key) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el as HTMLElement).textContent = t(key as any);
    }

    // attributes
    const attrEls = root.querySelectorAll?.("[data-i18n-attr]") ?? [];
    for (const el of Array.from(attrEls)) {
        const spec = (el as HTMLElement).dataset?.i18nAttr ?? "";
        if (!spec) continue;

        const pairs = spec
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);

        for (const p of pairs) {
            const [attr, keyRaw] = p.split(":").map((x) => (x ?? "").trim());
            if (!attr || !keyRaw) continue;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const val = t(keyRaw as any);
            setAttr(el, attr, val);
        }
    }

    // <title> is not easily selectable with querySelector in some cases, set explicitly
    try {
        document.title = t("app_title");
    } catch {
        // ignore
    }

    // update <html lang="">
    try {
        const htmlEl = document.documentElement;
        if (htmlEl) htmlEl.lang = detectUiLanguage() === "en" ? "en" : "sr";
    } catch {
        // ignore
    }
}

/**
 * One call convenience:
 * - detect language
 * - set language in i18n engine
 * - apply i18n to current DOM
 */
export function initUiI18n(): void {
    const lang = detectUiLanguage();
    setLanguage(lang);
    applyI18nToDom(document);
}
