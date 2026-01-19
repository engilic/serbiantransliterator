// src/taskpane/app/settings/defaults.ts

import type { UiSettings } from "../types";

export const SETTINGS_KEY = "serbiantransliterator.settings.v2";

export const DEFAULT_SETTINGS: UiSettings = {
    schemaVersion: 2,
    profile: "custom",
    userWordsCustom: [],

    theme: "auto",
    customSubstitutions: "",
    // FIX: Add dialect
    dialect: "none",

    confirmWholeDoc: true,
    includeHeadersFooters: false,
    includeFootnotes: false,
    includeEndnotes: false,
    direction: "auto",
    protectBrands: true,
    preserveCodeBlocks: true,
    protectRomans: true,
    applySerbianQuotes: true,
    fixDoubleSpaces: true,
    formatDates: false,
    curlyProtection: "placeholders",
    setProofingLanguage: true,
    showStats: false,
};

export const PROFILE_NAMES: Record<string, string> = {
    custom: "Ručno",
    it: "IT / Tehnologija",
    finance: "Finansije / Bankarstvo",
    medical: "Medicina / Farmacija",
    legal: "Pravo / Administracija",
    marketing: "Marketing / Društvene mreže",
    journalism: "Novinarstvo / Mediji",
};

export const PRESETS: Record<string, Partial<UiSettings> & { userWords: string[] }> = {
    it: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: false,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: false,
        formatDates: true,
        confirmWholeDoc: true,
        curlyProtection: "placeholders",
        dialect: "none",
        userWords: [
            "Git",
            "GitHub",
            "GitLab",
            "Azure",
            "AWS",
            "GCP",
            "DevOps",
            "Docker",
            "Kubernetes",
            "CI/CD",
            "YAML",
            "REST",
            "GraphQL",
            "PowerShell",
            "VS Code",
            "Visual Studio",
            "Windows Server",
            "Linux",
            "SerbianTransliterator",
            "Python",
            "JavaScript",
            "Typescript",
            "Node.js",
            "React",
            "Angular",
            "Vue",
            "Frontend",
            "Backend",
            "Fullstack",
            "Database",
            "Cache",
            "Cookie",
            "Token",
            "API",
            "Endpoint",
        ],
    },
    // ... (ostali preseti takođe treba da imaju dialect: "none" ili da Partial<UiSettings> pokriva to)
    // TypeScript ne kuka za Partial, ali DEFAULT_SETTINGS je strog tip.
};
