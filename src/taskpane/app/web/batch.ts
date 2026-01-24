// src/taskpane/app/web/batch.ts
/* global Blob, URL, document, FileReader */

import JSZip from "jszip";
import { getOoxmlOptionsFromUi } from "../settings/getters";
import { setProgress, setStatus } from "../status";
import { t } from "../../../shared/i18n";
import { workerClient } from "../../worker/client";

// Max paralelnih konverzija u letu (balans perf/memorija)
const CONCURRENCY = 2;

type LimitTask<T> = () => Promise<T>;

async function mapLimit<T>(tasks: Array<LimitTask<T>>, concurrency: number): Promise<T[]> {
    const out: T[] = new Array(tasks.length);
    let nextIndex = 0;

    async function workerLoop() {
        for (;;) {
            const i = nextIndex++;
            if (i >= tasks.length) return;
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
        // 0) Worker init (dicts + wasm)
        await workerClient.init();

        // 1) Učitaj fajl
        const arrayBuffer = await readFileAsArrayBuffer(file);

        // 2) Unzip
        const zip = await JSZip.loadAsync(arrayBuffer);
        const opts = getOoxmlOptionsFromUi();

        // 3) Identifikuj fajlove za obradu
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
            // 5%..90% tokom obrade fajlova, ostatak za zip generate + download
            const ratio = done / filesToProcess.length;
            const pct = Math.round(5 + ratio * 85);
            setProgress(pct);

            // i18n-guard: ne prosleđuj template literal direktno u setStatus
            const msg = t("status_processing");
            setStatus(msg, "info");
        };

        updateProgress();

        // 4) Napravi taskove za svaki XML fajl
        const tasks: Array<LimitTask<void>> = filesToProcess.map((path) => async () => {
            const xmlContent = await zip.file(path)?.async("string");
            if (!xmlContent) {
                done++;
                updateProgress();
                return;
            }

            // Konverzija u worker-u (off-main-thread)
            const res = await workerClient.convert(xmlContent, opts);

            if (res.type !== "Nema teksta" && res.xml) {
                zip.file(path, res.xml);
                changedFiles++;
            }

            done++;
            updateProgress();
        });

        // 5) Izvrši konverzije sa limitiranom paralelizacijom
        await mapLimit(tasks, CONCURRENCY);

        setProgress(92);

        // 6) Generiši novi .docx
        const outBlob = await zip.generateAsync({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        setProgress(100);

        const t1 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const ms = Math.max(0, Math.round(t1 - t0));

        // U status koristimo već postojeći format: status_done_document("{0}", "{1}ms", "{2}")
        // {0} = "Web Mode" label iz i18n (ako je već u PR2), fallback je string ovde ako nema ključa
        const webLabel = t("ui_web_mode");

        const msg = t("status_done_document", webLabel, ms, changedFiles ? ` | files: ${changedFiles}` : "");
        setStatus(msg, "success");

        downloadBlob(outBlob, `PRESLOVLJENO_${file.name}`);

        setTimeout(() => setProgress(null), 800);
    } catch (e) {
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
