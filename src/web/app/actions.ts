// src/web/app/actions.ts

import JSZip from "jszip";
import { convertPlainText, type Direction } from "../../core/textCore";
import { myersDiff } from "../../shared/diff";
import { InteractiveDiff } from "../../shared/diff/interactive";
import { renderInteractiveDiffHtml } from "../../taskpane/app/preview/diffRenderer";
import { toAscii } from "../../shared/ooxml/converterUtils";
import { WebWorkerClient } from "../workerClient";
import { convertDocxFileDetailed, downloadBlob } from "../docx";
import type { Store } from "./store";
import type { AppState, DocxJob } from "./state";
import { buildOoxmlOptionsFromSettings } from "./state";
import { saveWebSettings, DEFAULT_WEB_SETTINGS, type WebSettings } from "./webSettings";
import type { ConvertStats } from "../../shared/ooxml/convertOoxml";
import { t } from "../../shared/i18n";

export interface Actions {
    setMode(mode: AppState["mode"]): void;
    setOutputTab(tab: AppState["outputTab"]): void;

    openSettings(open: boolean): void;
    updateSettings(patch: Partial<AppState["settings"]>): void;
    saveSettings(): void;

    exportSettings(): void;
    importSettings(file: File): Promise<void>;

    setPlainInput(text: string): void;
    convertPlain(): void;
    copyPlain(): Promise<void>;

    addFiles(files: FileList | File[]): void;
    removeJob(jobId: string): void;
    clearJobs(): void;

    startJobs(): Promise<void>;
    cancel(): void;

    downloadJob(jobId: string): void;
    downloadAllZip(): Promise<void>;

    diffToggle(index: number): void;
}

function uid(): string {
    return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function tokenizeForDiff(text: string): string[] {
    return String(text || "")
        .split(/([ \t\n\r]+)/)
        .filter((x) => x);
}

function sanitizeWebSettings(raw: unknown): WebSettings {
    // Fail-closed: merge into defaults + clamp arrays
    let parsed: Partial<WebSettings> = {};
    try {
        parsed = (raw ?? {}) as Partial<WebSettings>;
    } catch {
        parsed = {};
    }

    const merged: WebSettings = {
        ...DEFAULT_WEB_SETTINGS,
        ...parsed,
        schemaVersion: DEFAULT_WEB_SETTINGS.schemaVersion,
    };

    merged.userProtected = Array.isArray(merged.userProtected) ? merged.userProtected.slice(0, 5000) : [];
    merged.ignoredStyles = Array.isArray(merged.ignoredStyles) ? merged.ignoredStyles.slice(0, 500) : [];

    merged.userProtected = merged.userProtected
        .map((x) => String(x || "").trim())
        .filter((x) => x.length > 0);

    merged.ignoredStyles = merged.ignoredStyles
        .map((x) => String(x || "").trim())
        .filter((x) => x.length > 0);

    merged.customSubstitutions = String(merged.customSubstitutions || "");

    // direction harden (allow only known values)
    const dir = String(merged.direction || "auto");
    if (dir !== "auto" && dir !== "lat-to-cyr" && dir !== "cyr-to-lat" && dir !== "to-ascii") {
        merged.direction = "auto";
    }

    // dialect harden
    const d = String(merged.dialect || "none");
    if (d !== "none" && d !== "ekavica_to_ijekavica" && d !== "ijekavica_to_ekavica") {
        merged.dialect = "none";
    }

    // curly harden
    const c = String(merged.curlyProtection || "placeholders");
    if (c !== "placeholders" && c !== "all" && c !== "none") {
        merged.curlyProtection = "placeholders";
    }

    merged.protectBrands = merged.protectBrands !== false;
    merged.applySerbianQuotes = merged.applySerbianQuotes !== false;
    merged.preserveCodeBlocks = merged.preserveCodeBlocks !== false;
    merged.protectRomans = merged.protectRomans !== false;
    merged.autoDownload = merged.autoDownload === true;

    return merged;
}

function aggregateStats(statsList: ConvertStats[]): ConvertStats | null {
    const first = statsList.length > 0 ? statsList[0] : null;
    if (!first) return null;

    const sum = {
        direction: first.direction,
        textNodes: 0,
        charsBefore: 0,
        charsAfter: 0,
        detected: { urls: 0, emails: 0 },
        code: {
            fenceMarkersSeen: 0,
            inlineTicksSeen: 0,
            endedInFence: false,
            endedInInline: false,
        },
        bridges: {
            links: 0,
            placeholders: 0,
            brandPhrases: 0,
            brandTokens: 0,
            ambiguousBrandSuffix: 0,
            digraphs: 0,
            userPhrases: 0,
            userTokens: 0,
            allCapsHints: 0,
            spaces: 0,
        },
        proofing: {
            enabled: false,
            targetLang: null,
            changedRuns: 0,
            skippedRuns: 0,
            skippedByReason: {},
        },
        timingMs: 0,
    } as ConvertStats;

    for (const s of statsList) {
        sum.textNodes += s.textNodes || 0;
        sum.charsBefore += s.charsBefore || 0;
        sum.charsAfter += s.charsAfter || 0;
        sum.detected.urls += s.detected?.urls || 0;
        sum.detected.emails += s.detected?.emails || 0;

        if (s.bridges) {
            for (const k of Object.keys(sum.bridges) as Array<keyof ConvertStats["bridges"]>) {
                sum.bridges[k] += (s.bridges[k] || 0) as number;
            }
        }

        sum.timingMs += s.timingMs || 0;
    }

    return sum;
}

export function createActions(store: Store<AppState>): Actions {
    const workerClient = new WebWorkerClient();

    const setStatus = (msg: string) => {
        store.update((s) => ({ ...s, statusText: msg }));
    };

    const updateJob = (jobId: string, patch: Partial<DocxJob>) => {
        store.update((s) => ({
            ...s,
            jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, ...patch } : j)),
        }));
    };

    const ensureAbort = () => {
        const st = store.get();
        if (st.activeAbort) return st.activeAbort;
        const ac = new AbortController();
        store.update((s) => ({ ...s, activeAbort: ac }));
        return ac;
    };

    const clearAbort = () => store.update((s) => ({ ...s, activeAbort: null }));

    return {
        setMode: (mode) => store.update((s) => ({ ...s, mode })),
        setOutputTab: (tab) => store.update((s) => ({ ...s, outputTab: tab })),

        openSettings: (open) => store.update((s) => ({ ...s, settingsOpen: open })),

        updateSettings: (patch) => {
            store.update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
        },

        saveSettings: () => {
            const s = store.get();
            saveWebSettings(s.settings);
            setStatus(t("web_status_settings_saved"));
        },

        exportSettings: () => {
            const s = store.get();
            saveWebSettings(s.settings);

            const json = JSON.stringify(s.settings, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            downloadBlob(blob, "serbian-transliterator-web-settings.json");

            setStatus(t("web_status_settings_exported"));
        },

        importSettings: async (file: File) => {
            try {
                const txt = await file.text();
                const parsed = JSON.parse(txt) as unknown;
                const next = sanitizeWebSettings(parsed);

                store.update((s) => ({ ...s, settings: next }));
                saveWebSettings(next);

                setStatus(t("web_status_settings_imported"));
            } catch {
                setStatus(t("web_status_settings_import_error"));
            }
        },

        setPlainInput: (text) => {
            store.update((s) => ({ ...s, plain: { ...s.plain, input: text } }));
        },

        convertPlain: () => {
            const s = store.get();
            const input = String(s.plain.input || "");
            if (!input.trim()) {
                store.update((x) => ({
                    ...x,
                    plain: { ...x.plain, output: "", typeLabel: "", interactive: null },
                }));
                setStatus(t("msg_enter_text"));
                return;
            }

            const opts = buildOoxmlOptionsFromSettings(s.settings);
            const dir = opts.direction ?? "auto";

            let outText = "";
            let typeLabel = "";

            if (dir === "to-ascii") {
                const lat = convertPlainText(input, "cyr-to-lat", {
                    ...opts,
                    applySerbianQuotes: false,
                });
                outText = toAscii(lat.text);
                typeLabel = t("dir_to_ascii_short");
            } else {
                const res = convertPlainText(input, dir as Direction, {
                    ...opts,
                    ignoredStyles: [],
                });
                outText = res.text;
                typeLabel = res.type;
            }

            const ops = myersDiff(tokenizeForDiff(input), tokenizeForDiff(outText));
            const interactive = new InteractiveDiff(ops);

            store.update((x) => ({
                ...x,
                outputTab: x.outputTab === "stats" ? "result" : x.outputTab,
                plain: { ...x.plain, output: outText, typeLabel, interactive },
            }));

            setStatus(t("web_status_text_type", typeLabel));
        },

        copyPlain: async () => {
            const s = store.get();
            const txt = String(s.plain.output || "");
            if (!txt) return;
            await navigator.clipboard.writeText(txt);
            setStatus(t("preview_toast_copied"));
        },

        addFiles: (files) => {
            const arr = Array.from(files as ArrayLike<File>).filter((f) =>
                f.name.toLowerCase().endsWith(".docx")
            );
            if (arr.length === 0) {
                setStatus(t("web_status_no_docx_files"));
                return;
            }

            const newJobs: DocxJob[] = arr.map((file) => ({
                id: uid(),
                file,
                status: "queued",
                progressPct: 0,
                message: "U redu čekanja",
                outBlob: null,
                error: null,
                stats: null,
                changedParts: null,
                ms: null,
            }));

            store.update((s) => ({
                ...s,
                mode: "files",
                outputTab: "result",
                jobs: [...s.jobs, ...newJobs],
            }));

            setStatus(t("web_status_files_added", newJobs.length));
        },

        removeJob: (jobId) => {
            store.update((s) => ({ ...s, jobs: s.jobs.filter((j) => j.id !== jobId) }));
        },

        clearJobs: () => {
            store.update((s) => ({ ...s, jobs: [] }));
            setStatus(t("web_status_jobs_cleared"));
        },

        startJobs: async () => {
            const s0 = store.get();
            if (s0.busy) return;

            const jobs = s0.jobs;
            if (jobs.length === 0) {
                setStatus(t("web_status_add_docx_files"));
                return;
            }

            const opts = buildOoxmlOptionsFromSettings(s0.settings);
            const ac = ensureAbort();

            store.update((s) => ({ ...s, busy: true }));
            setStatus(t("web_status_worker_starting"));

            try {
                await workerClient.init();
                setStatus(t("status_processing"));

                const statsAll: ConvertStats[] = [];

                for (const job of store.get().jobs) {
                    if (ac.signal.aborted) break;

                    updateJob(job.id, { status: "running", progressPct: 1, message: "Učitavanje..." });

                    const started = performance.now();

                    const { blob, stats, changedParts, ms } = await convertDocxFileDetailed(
                        job.file,
                        workerClient,
                        opts,
                        (pct, msg) => updateJob(job.id, { progressPct: pct, message: msg }),
                        ac.signal
                    );

                    const took = Math.max(0, Math.round(performance.now() - started));
                    if (stats) statsAll.push(stats);

                    updateJob(job.id, {
                        status: "done",
                        progressPct: 100,
                        message: `Gotovo (${took}ms)`,
                        outBlob: blob,
                        stats,
                        changedParts,
                        ms: ms ?? took,
                    });

                    if (store.get().settings.autoDownload) {
                        downloadBlob(blob, `PRESLOVLJENO_${job.file.name}`);
                    }
                }

                store.update((s) => ({ ...s, lastAggregateStats: aggregateStats(statsAll) }));

                if (ac.signal.aborted) {
                    setStatus(t("status_cancelled"));
                    store.update((s) => ({
                        ...s,
                        jobs: s.jobs.map((j) =>
                            j.status === "running" || j.status === "queued"
                                ? { ...j, status: "canceled", message: "Otkaženo" }
                                : j
                        ),
                    }));
                } else {
                    setStatus(t("web_status_done"));
                }
            } catch (e) {
                const err = e instanceof Error ? e : new Error(String(e));
                if (err.name === "AbortError") {
                    setStatus(t("status_cancelled"));
                } else {
                    setStatus(t("status_error_prefix", err.message));
                    store.update((s) => ({
                        ...s,
                        jobs: s.jobs.map((j) =>
                            j.status === "running"
                                ? { ...j, status: "error", error: err.message, message: "Greška" }
                                : j
                        ),
                    }));
                }
            } finally {
                clearAbort();
                store.update((s) => ({ ...s, busy: false }));
            }
        },

        cancel: () => {
            store.get().activeAbort?.abort();
        },

        downloadJob: (jobId) => {
            const s = store.get();
            const job = s.jobs.find((j) => j.id === jobId);
            if (!job || !job.outBlob) return;
            downloadBlob(job.outBlob, `PRESLOVLJENO_${job.file.name}`);
        },

        downloadAllZip: async () => {
            const s = store.get();
            const done = s.jobs.filter((j) => j.status === "done" && j.outBlob);
            if (done.length === 0) {
                setStatus(t("web_status_no_done_files"));
                return;
            }

            setStatus(t("web_status_packing_zip"));

            const zip = new JSZip();
            for (const j of done) {
                if (!j.outBlob) continue;
                zip.file(`PRESLOVLJENO_${j.file.name}`, j.outBlob);
            }

            const out = await zip.generateAsync({ type: "blob" });
            downloadBlob(out, `serbian-transliterator-${new Date().toISOString().slice(0, 10)}.zip`);
            setStatus(t("web_status_zip_downloaded"));
        },

        diffToggle: (index) => {
            const s = store.get();
            const interactive = s.plain.interactive;
            if (!interactive) return;

            interactive.toggle(index);
            const rebuilt = interactive.buildResult();
            renderInteractiveDiffHtml(interactive, 20000);

            store.update((x) => ({
                ...x,
                plain: { ...x.plain, output: rebuilt, interactive },
            }));
        },
    };
}
