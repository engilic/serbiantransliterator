// src/shared/i18n.ts

import { SR_RS } from "./locales/sr";
import { EN_US } from "./locales/en";
import { sanitizeLimitedHtml, type SafeHtml } from "./safeHtml";

function getSerbianPluralForm(n: number): "one" | "few" | "many" {
    const n100 = n % 100;
    const n10 = n % 10;
    if (n100 >= 5 && n100 <= 20) return "many";
    if (n10 === 1) return "one";
    if (n10 >= 2 && n10 <= 4) return "few";
    return "many";
}

function getEnglishPluralForm(n: number): "one" | "many" {
    return n === 1 ? "one" : "many";
}

// Tip izveden iz SR_RS (Single Source of Truth)
export type TranslationKey = keyof typeof SR_RS;
export type Language = "sr" | "en";

let currentLang: Language = "sr";

const TRANSLATIONS: Record<Language, typeof SR_RS> = {
    sr: SR_RS,
    en: EN_US,
};

export function setLanguage(lang: Language) {
    if (TRANSLATIONS[lang]) {
        currentLang = lang;
    }
}

export function getLanguage(): Language {
    return currentLang;
}

export function t(key: TranslationKey, ...args: (string | number)[]): string {
    const dict = TRANSLATIONS[currentLang] || SR_RS;
    let str = dict[key] || SR_RS[key] || key;

    if (args.length > 0) {
        args.forEach((arg, index) => {
            str = str.replace(new RegExp(`\\{${index}\\}`, "g"), String(arg));
        });
    }

    return str;
}

/**
 * tHtml: za poruke koje smeju da sadrže MINIMALNI markup (npr. <br>, <b>).
 *
 * Bezbednost:
 * - DOMPurify allowlist + bez atributa
 * - ako sanitizacija ne radi u okruženju, fallback je plain text (escape).
 */
export function tHtml(key: TranslationKey, ...args: (string | number)[]): SafeHtml {
    const raw = t(key, ...args);
    return sanitizeLimitedHtml(raw);
}

export function tPlural(key: TranslationKey, count: number): string {
    const dict = TRANSLATIONS[currentLang] || SR_RS;

    if (currentLang === "sr") {
        const form = getSerbianPluralForm(count);
        const specificKey = `${key}_${form}` as TranslationKey;
        if (dict[specificKey]) return t(specificKey, count);
    } else if (currentLang === "en") {
        const form = getEnglishPluralForm(count);
        const specificKey = `${key}_${form}` as TranslationKey;
        if (dict[specificKey]) return t(specificKey, count);
    }

    return t(key, count);
}

export function tPluralHtml(key: TranslationKey, count: number): SafeHtml {
    const raw = tPlural(key, count);
    return sanitizeLimitedHtml(raw);
}

export function isTranslationKey(k: string): k is TranslationKey {
    return Object.prototype.hasOwnProperty.call(SR_RS, k);
}
