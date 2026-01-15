// src/taskpane/app/settings/defaults.ts

import type { UiSettings } from "../types";

export const SETTINGS_KEY = "serbiantransliterator.settings.v2";

export const DEFAULT_SETTINGS: UiSettings = {
    schemaVersion: 2,
    profile: "custom",
    userWordsCustom: [],
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

// Imena profila su sada ključevi u i18n.ts, ovaj objekat se može ukloniti ako se ne koristi direktno.
// Ali ako ga koristiš za fallback, ostavi ga. U ui.ts smo prebacili logiku na t("profile_...").
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
        userWords: [
            "Git", "GitHub", "GitLab", "Azure", "AWS", "GCP", "DevOps", "Docker", "Kubernetes", "CI/CD",
            "YAML", "REST", "GraphQL", "PowerShell", "VS Code", "Visual Studio", "Windows Server", "Linux",
            "SerbianTransliterator", "Python", "JavaScript", "Typescript", "Node.js", "React", "Angular",
            "Vue", "Frontend", "Backend", "Fullstack", "Database", "Cache", "Cookie", "Token", "API", "Endpoint",
        ],
    },
    finance: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: true,
        confirmWholeDoc: true,
        curlyProtection: "placeholders",
        userWords: [
            "SWIFT", "IBAN", "EUR", "USD", "RSD", "CHF", "GBP", "MasterCard", "Visa", "PayPal",
            "Intesa", "Raiffeisen", "OTP", "NLB", "AIK", "Erste", "UniCredit", "Western Union",
            "E-banking", "M-banking", "Leasing", "Factoring", "Equity", "Forex",
        ],
    },
    medical: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: false,
        formatDates: true,
        confirmWholeDoc: true,
        curlyProtection: "placeholders",
        userWords: [
            "mg", "ml", "kg", "Covid", "SARS", "Hemofarm", "Galenika", "Pfizer", "Actavis", "Alkaloid",
            "Bayer", "Roche", "Stada", "Anamnesis", "Diagnosis", "Therapia", "CT", "MRI", "EKG", "EEG",
            "In vitro", "In vivo",
        ],
    },
    marketing: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: false,
        confirmWholeDoc: true,
        curlyProtection: "placeholders",
        userWords: [
            "Facebook", "Instagram", "LinkedIn", "TikTok", "Twitter", "X", "YouTube", "Google",
            "SEO", "PR", "Copywriter", "Content", "Ads", "Influencer", "Giveaway", "Hashtag",
            "Story", "Reel", "Post", "Follow", "Like", "Share", "Subscribe", "Timeline", "Feed",
        ],
    },
    legal: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: true,
        confirmWholeDoc: true,
        curlyProtection: "placeholders",
        userWords: [
            "Ustav Republike Srbije", "Zakon o obligacionim odnosima", "Zakon o radu", "Ministarstvo pravde",
            "Privredni sud", "Advokatska komora Srbije", "Službeni glasnik", "Bona fide", "De facto",
            "Ex officio", "Copyright", "Trademark", "Disclaimer", "Policy", "Terms", "Conditions", "GDPR",
        ],
    },
    journalism: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: true,
        confirmWholeDoc: true,
        curlyProtection: "placeholders",
        userWords: [
            "Reuters", "Associated Press", "BBC", "CNN", "Euronews", "N1", "RTS", "Tanjug",
            "NBA", "UEFA", "FIFA", "FIBA", "ATP", "WTA", "Olimpijske igre",
        ],
    },
};
