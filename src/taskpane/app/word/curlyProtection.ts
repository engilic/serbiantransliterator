// src/taskpane/app/word/curlyProtection.ts

export type CurlyProtectionUi = "placeholders" | "all" | "none";

export function asCurlyProtectionUi(v: unknown): CurlyProtectionUi {
    const s = String(v ?? "");
    return s === "all" || s === "none" || s === "placeholders" ? s : "placeholders";
}