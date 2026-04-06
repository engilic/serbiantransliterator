// src/web/app/state.ts

import type { t as tFn } from "../../shared/i18n";
import type { ConvertStats, OoxmlOptions } from "../../shared/ooxml/convertOoxml";
import type { InteractiveDiff } from "../../shared/diff/interactive";
import { loadWebSettings, type WebSettings } from "./webSettings";

export type WebMode = "files" | "text";
export type OutputTab = "result" | "diff" | "stats";

export type JobStatus = "queued" | "running" | "done" | "error" | "canceled";

export type I18nKey = Parameters<typeof tFn>[0];
export type StatusI18n = {
    key: I18nKey;
    args: Array<string | number>;
};

export interface DocxJob {
    id: string;
    file: File;
    status: JobStatus;
    progressPct: number;
    message: string;
    outBlob: Blob | null;
    error: string | null;
    stats: ConvertStats | null;
    changedParts: number | null;
    ms: number | null;
}

export interface PlainResult {
    input: string;
    output: string;
    typeLabel: string;
    interactive: InteractiveDiff | null;

    diffRev: number;
}

export interface AppState {
    meta: { version: string };
    mode: WebMode;
    outputTab: OutputTab;

    settingsOpen: boolean;
    settings: WebSettings;

    /** UI-only: simulated offline toggle (in addition to real navigator.onLine) */
    simulatedOffline: boolean;

    busy: boolean;
    statusText: string;
    statusI18n: StatusI18n | null;

    jobs: DocxJob[];
    activeAbort: AbortController | null;

    plain: PlainResult;

    lastAggregateStats: ConvertStats | null;
}

export function createInitialState(meta: { version: string }): AppState {
    const settings = loadWebSettings();

    return {
        meta,
        mode: "files",
        outputTab: "result",

        settingsOpen: false,
        settings,

        simulatedOffline: false,

        busy: false,
        statusText: "",
        statusI18n: { key: "web_ui_status_idle", args: [] },

        jobs: [],
        activeAbort: null,

        plain: {
            input: "",
            output: "",
            typeLabel: "",
            interactive: null,
            diffRev: 0,
        },

        lastAggregateStats: null,
    };
}

/** Map WebSettings -> OoxmlOptions (single source for conversions) */
export function buildOoxmlOptionsFromSettings(s: WebSettings): OoxmlOptions {
    const opts: OoxmlOptions = {
        direction: s.direction,
        protectBrands: s.protectBrands,
        applySerbianQuotes: s.applySerbianQuotes,
        preserveCodeBlocks: s.preserveCodeBlocks,
        curlyProtection: s.curlyProtection,
        userProtected: s.userProtected,
        setProofingLanguage: false, // web
        protectRomans: s.protectRomans,
        ignoredStyles: s.ignoredStyles,
        dialect: s.dialect,
        customSubstitutions: parseCustomSubstitutions(s.customSubstitutions),
    };
    return opts;
}

function parseCustomSubstitutions(raw: string): Record<string, string> {
    const map: Record<string, string> = {};
    if (!raw) return map;
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split("->");
        if (parts.length === 2) {
            const k = (parts[0] ?? "").trim();
            const v = (parts[1] ?? "").trim();
            if (k) map[k] = v;
        }
    }
    return map;
}
