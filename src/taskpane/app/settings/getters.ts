// src/taskpane/app/settings/getters.ts
/* global document */

import type { UiSettings, DirectionUi, ProfilePreset } from "../types";
import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { state } from "../state";

export function getCheckValue(id: string): boolean {
    const el = document.getElementById(id) as HTMLInputElement | null;
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

function asProfilePreset(v: string | null | undefined): ProfilePreset {
    const s = (v ?? "") as ProfilePreset;
    const allowed: ProfilePreset[] = ["custom", "it", "finance", "medical", "legal", "journalism", "marketing"];
    return allowed.includes(s) ? s : "custom";
}

function asDirectionUi(v: string | null | undefined): DirectionUi {
    const s = (v ?? "") as DirectionUi;
    const allowed: DirectionUi[] = ["auto", "lat-to-cyr", "cyr-to-lat", "to-ascii"];
    return allowed.includes(s) ? s : "auto";
}

export function getSettingsFromUi(): UiSettings {
    const profileRaw = (document.getElementById("profilePreset") as HTMLSelectElement | null)?.value;
    const profile = asProfilePreset(profileRaw);

    const dirRaw = getRadioValue("direction");
    const direction = asDirectionUi(dirRaw);

    return {
        schemaVersion: 2,

        profile,
        userWordsCustom: Array.from(state.customWordsSet),

        protectBrands: getCheckValue("optProtectBrands"),
        applySerbianQuotes: getCheckValue("optSerbianQuotes"),
        preserveCodeBlocks: getCheckValue("optPreserveCodeBlocks"),
        setProofingLanguage: getCheckValue("optSetProofingLanguage"),
        protectRomans: getCheckValue("optProtectRomans"),

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
        userProtected: [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)],
    };
}