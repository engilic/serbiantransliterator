// src/taskpane/app/i18n/uiI18n.ts
import { setLanguage, t, type Language, getLanguage, isTranslationKey } from "../../../shared/i18n";
import { safeGetItem, safeSetItem, safeRemoveItem } from "../../../shared/storage/safeLocalStorage";

export type UiLangPref = "sr" | "en" | "auto";

const LANG_KEY = "serbiantransliterator.ui.lang";

// Minimal Office typing (avoid `any`, keep runtime-safe)
type OfficeContextLike = {
    displayLanguage?: string;
    contentLanguage?: string;
};

type OfficeLike = {
    context?: OfficeContextLike;
};

type GlobalWithOffice = typeof globalThis & { Office?: OfficeLike };

export function asUiLangPref(v: unknown): UiLangPref {
    const s = String(v ?? "").toLowerCase();
    return s === "en" || s === "auto" || s === "sr" ? (s as UiLangPref) : "sr";
}

/**
 * Default language preference: SR.
 * (If user never touched the setting, UI stays Serbian.)
 */
export function getUiLanguagePreference(): UiLangPref {
    const raw = safeGetItem(LANG_KEY);
    if (!raw) return "sr";
    return asUiLangPref(raw);
}

export function setUiLanguagePreference(pref: UiLangPref): void {
    // Keep storage clean:
    // - default "sr" => remove key
    // - store "en" / "auto"
    if (pref === "sr") safeRemoveItem(LANG_KEY);
    else safeSetItem(LANG_KEY, pref);

    // Apply immediately
    applyUiLanguage(pref);
}

function detectUiLanguageFromEnv(): Language {
    // Office context preferred, then navigator; default "sr"
    try {
        const office = (globalThis as GlobalWithOffice).Office;
        const displayLang = office?.context?.displayLanguage;
        const contentLang = office?.context?.contentLanguage;

        const pick = (displayLang || contentLang || "").toLowerCase();
        if (pick.startsWith("en")) return "en";
        if (pick.startsWith("sr")) return "sr";
    } catch {
        // ignore
    }

    try {
        const nav = (navigator?.language || "").toLowerCase();
        if (nav.startsWith("en")) return "en";
        if (nav.startsWith("sr")) return "sr";
    } catch {
        // ignore
    }

    return "sr";
}

function setAttr(el: Element, attrName: string, value: string) {
    if (!value) el.removeAttribute(attrName);
    else el.setAttribute(attrName, value);
}

/**
 * Apply translations to:
 * - elements with data-i18n            => textContent
 * - elements with data-i18n-attr       => attributes
 *
 * Security: uses textContent / setAttribute only (no innerHTML).
 */
export function applyI18nToDom(root: ParentNode = document): void {
    const textEls = root.querySelectorAll?.("[data-i18n]") ?? [];
    for (const el of Array.from(textEls)) {
        const key = (el as HTMLElement).dataset?.i18n;
        if (!key || !isTranslationKey(key)) continue;
        (el as HTMLElement).textContent = t(key);
    }

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
            if (!attr || !keyRaw || !isTranslationKey(keyRaw)) continue;
            setAttr(el, attr, t(keyRaw));
        }
    }

    try {
        document.title = t("app_title");
    } catch {
        // ignore
    }

    try {
        const htmlEl = document.documentElement;
        if (htmlEl) htmlEl.lang = getLanguage() === "en" ? "en" : "sr";
    } catch {
        // ignore
    }
}

export function applyUiLanguage(pref: UiLangPref): void {
    const lang: Language = pref === "auto" ? detectUiLanguageFromEnv() : pref === "en" ? "en" : "sr";

    setLanguage(lang);
    applyI18nToDom(document);
}

/**
 * Init i18n:
 * - read UI language preference from storage (default: "sr")
 * - apply language + translate DOM
 */
export function initUiI18n(): void {
    const pref = getUiLanguagePreference();
    applyUiLanguage(pref);
}
