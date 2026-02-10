// src/web/app/actions.ts

import { ensureWasmReady } from "../ensureWasmReady";
import { track } from "../../shared/analytics";

import JSZip from "jszip";
import { InteractiveDiff } from "../../shared/diff/interactive";
import { WebWorkerClient } from "../workerClient";
import { convertDocxFileDetailed, downloadBlob } from "../docx";
import type { Store } from "./store";
import type { AppState, DocxJob } from "./state";
import { buildOoxmlOptionsFromSettings } from "./state";
import { saveWebSettings, DEFAULT_WEB_SETTINGS, type WebSettings } from "./webSettings";
import type { ConvertStats } from "../../shared/ooxml/convertOoxml";
import { t } from "../../shared/i18n";

// ✅ shared engine (no dupe for plain + diff)
import { createSerbianEngine } from "../../app/engine/serbianEngine";
import type { Engine, EngineConvertInput } from "../../app/ports/engine";

export interface Actions {
    setMode(mode: AppState["mode"]): void;
    setOutputTab(tab: AppState["outputTab"]): void;

    openSettings(open: boolean): void;
    setSimulatedOffline(next: boolean): void;
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

    // clamp arrays
    merged.userProtected = Array.isArray(merged.userProtected) ? merged.userProtected.slice(0, 5000) : [];
    merged.ignoredStyles = Array.isArray(merged.ignoredStyles) ? merged.ignoredStyles.slice(0, 500) : [];

    merged.userProtected = merged.userProtected
        .map((x) => String(x || "").trim())
        .filter((x) => x.length > 0);

    merged.ignoredStyles = merged.ignoredStyles
        .map((x) => String(x || "").trim())
        .filter((x) => x.length > 0);

    merged.customSubstitutions = String(merged.customSubstitutions || "");

    // ui prefs harden
    if (!["auto", "sr", "en"].includes(String(merged.uiLanguage))) merged.uiLanguage = "auto";
    if (!["auto", "light", "dark"].includes(String(merged.theme))) merged.theme = "auto";

    // direction harden
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

    // live preview harden
    merged.livePreview = merged.livePreview !== false;

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

async function safeCopyText(text: string): Promise<boolean> {
    const s = String(text || "");
    if (!s) return false;

    try {
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") return false;
        await navigator.clipboard.writeText(s);
        return true;
    } catch {
        return false;
    }
}

export function createActions(store: Store<AppState>): Actions {
    const workerClient = new WebWorkerClient();
    const engine: Engine = createSerbianEngine();

    const ensurePlainDiff = async () => {
        const s = store.get();
        if (s.mode !== "text") return;

        // ✅ Guard: Diff tab “on demand” računamo samo kad je Live Preview uključen
        // (tada je output tipično svež, pa diff nije “stale”)
        if (!s.settings.livePreview) return;

        if (s.plain.interactive) return;

        const input = String(s.plain.input || "");
        const output = String(s.plain.output || "");
        if (!input.trim() || !output.trim()) return;

        const ops = await engine.diffText(input, output);
        const interactive = new InteractiveDiff(ops);

        store.update((x) => ({
            ...x,
            plain: { ...x.plain, interactive },
        }));
    };

    // Live Preview config
    const LIVE_DEBOUNCE_MS = 220;
    const LIVE_MAX_CHARS = 50_000;

    let liveTimer: ReturnType<typeof setTimeout> | null = null;
    let liveRunId = 0;

    const cancelLive = () => {
        if (liveTimer) clearTimeout(liveTimer);
        liveTimer = null;
        liveRunId++; // invalidate any scheduled run
    };

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

    const runPlainConvert = async (args?: { quiet?: boolean; token?: number }) => {
        const quiet = args?.quiet === true;
        const token = args?.token;

        const s = store.get();
        const input = String(s.plain.input || "");

        // If this run is for live preview, ignore stale runs
        const isLiveRun = typeof token === "number";
        const tokenOk = () => !isLiveRun || token === liveRunId;

        if (!input.trim()) {
            if (
                String(s.plain.output || "") === "" &&
                String(s.plain.typeLabel || "") === "" &&
                s.plain.interactive === null
            ) {
                return;
            }

            if (!tokenOk()) return;

            store.update((x) => ({
                ...x,
                plain: { ...x.plain, output: "", typeLabel: "", interactive: null },
            }));

            if (!quiet) setStatus(t("msg_enter_text"));
            return;
        }

        const opts = buildOoxmlOptionsFromSettings(s.settings);

        const dir0 = opts.direction ?? "auto";
        const dir: EngineConvertInput["direction"] =
            dir0 === "auto" || dir0 === "lat-to-cyr" || dir0 === "cyr-to-lat" || dir0 === "to-ascii"
                ? dir0
                : "auto";

        await ensureWasmReady();

        const converted = await engine.convert({
            kind: "plainText",
            text: input,
            direction: dir,
            options: opts as unknown as Record<string, unknown>,
        });

        if (converted.kind !== "plainText") {
            throw new Error("Engine returned non-plain output");
        }

        if (!quiet) {
            track("convert", {
                mode: "text",
                direction: dir,
                inputLength: input.length,
            });
        }

        const typeLabel =
            String(dir) === "to-ascii" ? t("dir_to_ascii_short") : String(converted.typeLabel || "");

        const needDiff = !quiet || store.get().outputTab === "diff";

        let interactive: InteractiveDiff | null = null;
        if (needDiff) {
            const ops = await engine.diffText(input, converted.text);
            interactive = new InteractiveDiff(ops);
        }

        if (!tokenOk()) return;

        store.update((x) => ({
            ...x,
            // NOTE: for live (quiet) do NOT force-tab away from stats
            outputTab: quiet ? x.outputTab : x.outputTab === "stats" ? "result" : x.outputTab,
            plain: { ...x.plain, output: converted.text, typeLabel, interactive },
        }));

        if (!quiet) setStatus(t("web_status_text_type", typeLabel));
    };

    const scheduleLivePlainConvert = () => {
        const st = store.get();

        if (st.mode !== "text") return;
        if (!st.settings.livePreview) return;

        const input = String(st.plain.input || "");
        if (input.length > LIVE_MAX_CHARS) {
            cancelLive();
            return;
        }

        if (liveTimer) clearTimeout(liveTimer);
        const myId = ++liveRunId;

        liveTimer = setTimeout(() => {
            if (myId !== liveRunId) return;
            runPlainConvert({ quiet: true, token: myId }).catch((e) =>
                console.error("Live convert failed:", e)
            );
        }, LIVE_DEBOUNCE_MS);
    };

    return {
        setMode: (mode) => {
            store.update((s) => {
                // reset “files-only” status messages when switching to Text
                let statusText = s.statusText;
                if (mode === "text") {
                    const filesHints = new Set([
                        t("web_status_add_docx_files"),
                        t("web_status_no_docx_files"),
                        t("web_status_jobs_cleared"),
                        t("web_status_no_done_files"),
                        t("web_status_packing_zip"),
                        t("web_status_zip_downloaded"),
                    ]);
                    if (filesHints.has(String(s.statusText || ""))) {
                        statusText = t("web_ui_status_idle");
                    }
                }

                return { ...s, mode, statusText };
            });

            // ✅ When leaving text mode, cancel pending live work
            if (mode !== "text") cancelLive();

            // ✅ When entering text mode, run live preview (if enabled)
            if (mode === "text") scheduleLivePlainConvert();
        },

        setOutputTab: (tab) => {
            store.update((s) => ({ ...s, outputTab: tab }));
            if (tab === "diff") {
                void ensurePlainDiff().catch((e) => console.error("ensurePlainDiff failed:", e));
            }
        },

        openSettings: (open) => store.update((s) => ({ ...s, settingsOpen: open })),

        setSimulatedOffline: (next) => {
            store.update((s) => ({ ...s, simulatedOffline: next }));
        },

        updateSettings: (patch) => {
            const hasLive = Object.prototype.hasOwnProperty.call(patch, "livePreview");
            const turnedOff = hasLive && patch.livePreview === false;
            const turnedOn = hasLive && patch.livePreview === true;

            // 1) Pure state update (no side-effects)
            store.update((s) => {
                const nextSettings = { ...s.settings, ...patch };

                let statusText = s.statusText;
                if (hasLive) {
                    statusText = turnedOff ? t("web_status_live_off") : t("web_status_live_on");
                }

                return { ...s, settings: nextSettings, statusText };
            });

            // 2) Side-effects AFTER state update
            if (turnedOff) {
                cancelLive();
                return;
            }

            if (turnedOn) {
                // invalidate any pending live run + clear timer
                cancelLive();

                const st = store.get();
                const input = String(st.plain.input || "");

                if (st.mode === "text" && input.trim().length > 0 && input.length <= LIVE_MAX_CHARS) {
                    // cancelLive already incremented liveRunId, so use current value as token
                    const token = liveRunId;

                    void runPlainConvert({ quiet: true, token }).catch((e) =>
                        console.error("Live convert failed:", e)
                    );
                }

                return;
            }

            // other settings changed -> keep normal live behavior
            scheduleLivePlainConvert();
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

                if (!next.livePreview) cancelLive();
                scheduleLivePlainConvert();
            } catch {
                setStatus(t("web_status_settings_import_error"));
            }
        },

        setPlainInput: (text) => {
            store.update((s) => ({ ...s, plain: { ...s.plain, input: text } }));
            scheduleLivePlainConvert();
        },

        convertPlain: () => {
            void runPlainConvert({ quiet: false }).catch((e) => {
                const err = e instanceof Error ? e : new Error(String(e));
                setStatus(t("status_error_prefix", err.message));
            });
        },

        copyPlain: async () => {
            const s = store.get();
            const txt = String(s.plain.output || "");
            if (!txt) return;

            const ok = await safeCopyText(txt);
            if (ok) setStatus(t("preview_toast_copied"));
            else setStatus(t("web_status_copy_failed"));
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
                message: t("web_job_msg_queued"),
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

            // leaving text mode cancels live
            cancelLive();

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

            // ✅ WASM ready pre starta (instant UI pattern)
            await ensureWasmReady();

            track("convert", {
                mode: "files",
                count: jobs.length,
                direction: s0.settings.direction,
            });

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

                    updateJob(job.id, {
                        status: "running",
                        progressPct: 1,
                        message: t("web_job_msg_loading"),
                    });

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
                        message: t("web_job_msg_done_ms", took),
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
                                ? { ...j, status: "canceled", message: t("web_job_msg_canceled") }
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
                                ? {
                                      ...j,
                                      status: "error",
                                      error: err.message,
                                      message: t("web_job_msg_error"),
                                  }
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

            track("download", {
                filename: job.file.name,
                size: job.outBlob.size,
                direction: s.settings.direction,
            });
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

            track("download", {
                type: "zip",
                count: done.length,
                size: out.size,
            });

            setStatus(t("web_status_zip_downloaded"));
        },

        diffToggle: (index) => {
            const s = store.get();
            const interactive = s.plain.interactive;
            if (!interactive) return;

            interactive.toggle(index);
            const rebuilt = interactive.buildResult();

            store.update((x) => ({
                ...x,
                plain: { ...x.plain, output: rebuilt, interactive },
            }));
        },
    };
}
