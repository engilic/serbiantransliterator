// src/web/app/webSettings.ts

import type { Direction, Dialect } from "../../core/textCore";
import type { CurlyProtection } from "../../core/protect";
import { safeGetItem, safeSetItem } from "../../shared/storage/safeLocalStorage";

export type DirectionUi = Direction | "to-ascii";
export type UiLanguagePref = "auto" | "sr" | "en";
export type ThemePref = "auto" | "light" | "dark";

export interface WebSettings {
    schemaVersion: 1;

    // conversion
    direction: DirectionUi;
    protectBrands: boolean;
    applySerbianQuotes: boolean;
    preserveCodeBlocks: boolean;
    protectRomans: boolean;
    curlyProtection: CurlyProtection;
    userProtected: string[];
    ignoredStyles: string[];

    // advanced
    dialect: Dialect;
    customSubstitutions: string;

    // UX
    autoDownload: boolean;

    // UI prefs
    uiLanguage: UiLanguagePref;
    theme: ThemePref;
}

const WEB_SETTINGS_KEY = "serbiantransliterator.web.settings.v1";

export const DEFAULT_WEB_SETTINGS: WebSettings = {
    schemaVersion: 1,

    direction: "auto",
    protectBrands: true,
    applySerbianQuotes: true,
    preserveCodeBlocks: true,
    protectRomans: true,
    curlyProtection: "placeholders",
    userProtected: [],
    ignoredStyles: ["Code", "Macro Text", "Source Code"],

    dialect: "none",
    customSubstitutions: "",

    autoDownload: false,

    uiLanguage: "auto",
    theme: "auto",
};

export function loadWebSettings(): WebSettings {
    const raw = safeGetItem(WEB_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_WEB_SETTINGS };

    try {
        const parsed = JSON.parse(raw) as Partial<WebSettings>;
        const merged: WebSettings = { ...DEFAULT_WEB_SETTINGS, ...parsed, schemaVersion: 1 };

        // clamp arrays
        merged.userProtected = Array.isArray(merged.userProtected)
            ? merged.userProtected
                  .slice(0, 5000)
                  .map((x) => String(x || "").trim())
                  .filter(Boolean)
            : [];

        merged.ignoredStyles = Array.isArray(merged.ignoredStyles)
            ? merged.ignoredStyles
                  .slice(0, 500)
                  .map((x) => String(x || "").trim())
                  .filter(Boolean)
            : [];

        // harden enums
        const dir = String(merged.direction || "auto");
        if (dir !== "auto" && dir !== "lat-to-cyr" && dir !== "cyr-to-lat" && dir !== "to-ascii") {
            merged.direction = "auto";
        }

        const curly = String(merged.curlyProtection || "placeholders");
        if (curly !== "placeholders" && curly !== "all" && curly !== "none") {
            merged.curlyProtection = "placeholders";
        }

        const dialect = String(merged.dialect || "none");
        if (dialect !== "none" && dialect !== "ekavica_to_ijekavica" && dialect !== "ijekavica_to_ekavica") {
            merged.dialect = "none";
        }

        const uiLang = String(merged.uiLanguage || "auto");
        if (uiLang !== "auto" && uiLang !== "sr" && uiLang !== "en") merged.uiLanguage = "auto";

        const theme = String(merged.theme || "auto");
        if (theme !== "auto" && theme !== "light" && theme !== "dark") merged.theme = "auto";

        merged.customSubstitutions = String(merged.customSubstitutions || "");

        // harden booleans
        merged.protectBrands = merged.protectBrands !== false;
        merged.applySerbianQuotes = merged.applySerbianQuotes !== false;
        merged.preserveCodeBlocks = merged.preserveCodeBlocks !== false;
        merged.protectRomans = merged.protectRomans !== false;
        merged.autoDownload = merged.autoDownload === true;

        return merged;
    } catch {
        return { ...DEFAULT_WEB_SETTINGS };
    }
}

export function saveWebSettings(s: WebSettings): void {
    safeSetItem(WEB_SETTINGS_KEY, JSON.stringify(s));
}
