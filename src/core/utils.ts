// src/core/utils.ts

/**
 * Uklanja višak razmaka:
 * - Zameni sve "čudne" razmake običnim razmakom
 * - SVE višestruke razmake (2 ili više) svodi na JEDAN
 * - Višestruke prazne linije svodi na najviše 2 zaredom
 * - Očuva vodeće/trailing razmake po liniji (opciono)
 */
export function removeMultipleSpaces(text: string): string {
    // 1. Zameni sve "čudne" razmake običnim razmakom
    let out = text.replace(/[\t\u00A0\u1680-\u200a\u2028\u2029\u202f\u205f\u3000]/g, " ");
    // 2. Svedi SVE višestruke space (bilo gde) na JEDAN
    out = out.replace(/ {2,}/g, " ");
    // 3. Višestruke prazne linije → najviše 2 zaredom
    out = out.replace(/\n{3,}/g, '\n\n');
    return out;
}