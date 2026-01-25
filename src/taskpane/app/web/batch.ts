// src/taskpane/app/web/batch.ts
/* global Blob, URL, document, FileReader */

import JSZip from "jszip";
import { getOoxmlOptionsFromUi } from "../settings/getters";
import { setProgress, setStatus } from "../status";
import { t } from "../../../shared/i18n";
import { workerClient } from "../../worker/client";
import { state } from "../state";

const CONCURRENCY = 2;

type LimitTask<T> = () => Promise<T>;

function isCancelled(): boolean {
    return !!state.activeAbortController?.signal.aborted;
}

async function mapLimit<T>(tasks: Array<LimitTask<T>>, concurrency: number): Promise<T[]> {
    const out: T[] = new Array(tasks.length);
    let nextIndex = 0;

    async function workerLoop() {
        for (;;) {
            const i = nextIndex++;
            if (i >= tasks.length) return;
            if (isCancelled()) return;
            const task = tasks[i];
            if (!task) continue;
            out[i] = await task();
        }
    }

    const workers = Array.from({ length: Math.max(1, concurrency) }, () => workerLoop());
    await Promise.all(workers);
    return out;
}

export async function processDocxFile(file: File) {
    const t0 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();

    setStatus(t("status_processing"), "info");
    setProgress(5);

    try {
        await workerClient.init();

        if (isCancelled()) {
            setStatus(t("status_cancelled"), "neutral");
            setProgress(null);
            return;
        }

        const arrayBuffer = await readFileAsArrayBuffer(file);

        if (isCancelled()) {
            setStatus(t("status_cancelled"), "neutral");
            setProgress(null);
            return;
        }

        const zip = await JSZip.loadAsync(arrayBuffer);
        const opts = getOoxmlOptionsFromUi();

        const filesToProcess: string[] = [];
        zip.forEach((relativePath) => {
            if (
                relativePath === "word/document.xml" ||
                relativePath === "word/footnotes.xml" ||
                relativePath === "word/endnotes.xml" ||
                relativePath.startsWith("word/header") ||
                relativePath.startsWith("word/footer")
            ) {
                filesToProcess.push(relativePath);
            }
        });

        if (filesToProcess.length === 0) {
            setStatus(t("status_no_text_found"), "neutral");
            setProgress(null);
            return;
        }

        let done = 0;
        let changedFiles = 0;

        const updateProgress = () => {
            const ratio = done / filesToProcess.length;
            const pct = Math.round(5 + ratio * 85);
            setProgress(pct);
            setStatus(t("status_processing"), "info");
        };

        updateProgress();

        const tasks: Array<LimitTask<void>> = filesToProcess.map((path) => async () => {
            if (isCancelled()) return;

            // [MAX3] Explicitly nullable to allow GC hint
            let xmlContent: string | null = (await zip.file(path)?.async("string")) ?? null;

            if (!xmlContent) {
                done++;
                updateProgress();
                return;
            }

            if (isCancelled()) {
                xmlContent = null; // Free memory immediately
                return;
            }

            const res = await workerClient.convert(xmlContent, opts);

            // [MAX3] Free original XML string immediately
            xmlContent = null;

            if (!isCancelled() && res.type !== "Nema teksta" && res.xml) {
                zip.file(path, res.xml);
                changedFiles++;
            }

            done++;
            updateProgress();
        });

        await mapLimit(tasks, CONCURRENCY);

        if (isCancelled()) {
            setStatus(t("status_cancelled"), "neutral");
            setProgress(null);
            return;
        }

        setProgress(92);

        const outBlob = await zip.generateAsync({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        setProgress(100);

        const t1 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const ms = Math.max(0, Math.round(t1 - t0));

        const webLabel = t("ui_web_mode");
        const extra = changedFiles ? " | files: " + changedFiles : "";
        const msg = t("status_done_document", webLabel, ms, extra);

        // [MAX3] Success Pulse triggered inside setStatus
        setStatus(msg, "success");

        downloadBlob(outBlob, `PRESLOVLJENO_${file.name}`);

        setTimeout(() => setProgress(null), 800);
    } catch (e) {
        // Abort is not an error UX-wise
        if (isCancelled()) {
            setStatus(t("status_cancelled"), "neutral");
            setProgress(null);
            return;
        }

        console.error(e);
        setStatus(t("status_error_prefix", String(e)), "error");
        setProgress(null);
    }
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
