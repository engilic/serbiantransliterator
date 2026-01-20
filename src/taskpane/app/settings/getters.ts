// src/taskpane/app/settings/getters.ts
import type { UiSettings, DirectionUi, ProfilePreset, AppTheme, DialectUi } from "../types";
import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { state } from "../state";
import { asCurlyProtectionUi } from "../word/curlyProtection";
import { getOptional } from "../utils/dom";

export function getCheckValue(id: string): boolean {
    const el = getOptional<HTMLInputElement>(id);
    return !!el?.checked;
}

export function getRadioValue(name: string): string {
    const els = document.getElementsByName(name);
    for (let i = 0; i < els.length; i++) {
        const el = els[i] as HTMLInputElement;
        if (el.checked) return el.value;
    }
    return "";
}

export function getSelectValue(id: string): string {
    const el = getOptional<HTMLSelectElement>(id);
    return String(el?.value ?? "");
}

export function getTextValue(id: string): string {
    const el = getOptional<HTMLTextAreaElement>(id);
    return String(el?.value ?? "");
}

function asProfilePreset(v: string | null | undefined): ProfilePreset {
    const s = (v ?? "") as ProfilePreset;
    const allowed: ProfilePreset[] = [
        "custom",
        "it",
        "finance",
        "medical",
        "legal",
        "journalism",
        "marketing",
    ];
    return allowed.includes(s) ? s : "custom";
}

function asDirectionUi(v: string | null | undefined): DirectionUi {
    const s = (v ?? "") as DirectionUi;
    const allowed: DirectionUi[] = ["auto", "lat-to-cyr", "cyr-to-lat", "to-ascii"];
    return allowed.includes(s) ? s : "auto";
}

function asAppTheme(v: string): AppTheme {
    return v === "light" || v === "dark" ? v : "auto";
}

function asDialectUi(v: string): DialectUi {
    return v === "ekavica_to_ijekavica" || v === "ijekavica_to_ekavica" ? v : "none";
}

function parseCustomSubstitutions(raw: string): Record<string, string> {
    const map: Record<string, string> = {};
    if (!raw) return map;
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split("->");
        if (parts.length === 2) {
            const k = parts[0]!.trim();
            const v = parts[1]!.trim();
            if (k) map[k] = v;
        }
    }
    return map;
}

export function getSettingsFromUi(): UiSettings {
    const profileRaw = getSelectValue("profilePreset");
    const profile = asProfilePreset(profileRaw);

    const dirRaw = getRadioValue("direction");
    const direction = asDirectionUi(dirRaw);

    const curlyRaw = getSelectValue("optCurlyProtection");
    const curlyProtection = asCurlyProtectionUi(curlyRaw);

    const themeRaw = getSelectValue("optTheme");
    const theme = asAppTheme(themeRaw);

    const subsRaw = getTextValue("optCustomSubstitutions");
    const dialectRaw = getSelectValue("optDialect");
    const dialect = asDialectUi(dialectRaw);

    return {
        schemaVersion: 2,
        profile,
        userWordsCustom: Array.from(state.customWordsSet),
        theme,
        customSubstitutions: subsRaw,
        dialect,
        protectBrands: getCheckValue("optProtectBrands"),
        applySerbianQuotes: getCheckValue("optSerbianQuotes"),
        preserveCodeBlocks: getCheckValue("optPreserveCodeBlocks"),
        setProofingLanguage: getCheckValue("optSetProofingLanguage"),
        protectRomans: getCheckValue("optProtectRomans"),
        curlyProtection,
        fixDoubleSpaces: getCheckValue("optFixDoubleSpaces"),
        formatDates: getCheckValue("optFormatDates"),
        confirmWholeDoc: getCheckValue("optConfirmWholeDoc"),
        includeHeadersFooters: getCheckValue("optIncludeHeadersFooters"),
        includeFootnotes: getCheckValue("optIncludeFootnotes"),
        includeEndnotes: getCheckValue("optIncludeEndnotes"),
        showStats: getCheckValue("optShowStats"),
        direction,
    };
}

export function getOoxmlOptionsFromUi(): OoxmlOptions {
    const s = getSettingsFromUi();

    let dir: OoxmlOptions["direction"] = "auto";
    if (s.direction === "lat-to-cyr") dir = "lat-to-cyr";
    if (s.direction === "cyr-to-lat") dir = "cyr-to-lat";
    if (s.direction === "to-ascii") dir = "to-ascii";

    return {
        direction: dir,
        protectBrands: s.protectBrands,
        applySerbianQuotes: s.applySerbianQuotes,
        preserveCodeBlocks: s.preserveCodeBlocks,
        setProofingLanguage: s.setProofingLanguage,
        fixDoubleSpaces: s.fixDoubleSpaces,
        formatDates: s.formatDates,
        protectRomans: s.protectRomans,
        curlyProtection: s.curlyProtection,
        userProtected: [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)],
        customSubstitutions: parseCustomSubstitutions(s.customSubstitutions),
        dialect: s.dialect,
    };
}
