// src/web/docx.ts

import JSZip from "jszip";
import type { OoxmlOptions, ConvertStats } from "../shared/ooxml/convertOoxml";
import type { WebWorkerClient } from "./workerClient";

type ProgressCb = (pct: number, msg: string) => void;

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

function listWordXmlParts(zip: JSZip): string[] {
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
    return filesToProcess;
}

function mergeStats(a: ConvertStats | null, b: ConvertStats | null): ConvertStats | null {
    if (!a) return b;
    if (!b) return a;

    const out: ConvertStats = {
        ...a,
        textNodes: (a.textNodes || 0) + (b.textNodes || 0),
        charsBefore: (a.charsBefore || 0) + (b.charsBefore || 0),
        charsAfter: (a.charsAfter || 0) + (b.charsAfter || 0),
        detected: {
            urls: (a.detected?.urls || 0) + (b.detected?.urls || 0),
            emails: (a.detected?.emails || 0) + (b.detected?.emails || 0),
        },
        timingMs: (a.timingMs || 0) + (b.timingMs || 0),
        bridges: { ...a.bridges },
        code: { ...a.code },
        proofing: { ...a.proofing },
    };

    if (a.bridges && b.bridges) {
        for (const k of Object.keys(a.bridges) as Array<keyof ConvertStats["bridges"]>) {
            out.bridges[k] = (a.bridges[k] || 0) + (b.bridges[k] || 0);
        }
    }

    // code/proofing are not super meaningful aggregated for whole docx; keep first
    return out;
}

export async function convertDocxFileDetailed(
    file: File,
    client: WebWorkerClient,
    opts: OoxmlOptions,
    onProgress: ProgressCb,
    signal?: AbortSignal | null
): Promise<{ blob: Blob; stats: ConvertStats | null; changedParts: number; ms: number }> {
    const t0 = performance.now();

    const abortIfNeeded = () => {
        if (signal?.aborted) {
            const err = new Error("AbortError");
            err.name = "AbortError";
            throw err;
        }
    };

    onProgress(2, `Učitavanje: ${file.name}`);
    abortIfNeeded();

    const arrayBuffer = await file.arrayBuffer();
    abortIfNeeded();

    onProgress(8, "Otvaranje DOCX (ZIP)...");
    const zip = await JSZip.loadAsync(arrayBuffer);
    abortIfNeeded();

    const parts = listWordXmlParts(zip);
    if (parts.length === 0) {
        onProgress(100, "Nema Word XML delova za obradu.");
        const ms = Math.max(0, Math.round(performance.now() - t0));
        return {
            blob: new Blob([await file.arrayBuffer()], { type: file.type || "application/octet-stream" }),
            stats: null,
            changedParts: 0,
            ms,
        };
    }

    onProgress(10, `Pronađeno delova: ${parts.length}`);

    let done = 0;
    let changed = 0;
    let statsAgg: ConvertStats | null = null;

    const update = () => {
        const pct = Math.round(10 + (done / Math.max(1, parts.length)) * 78);
        onProgress(pct, `Obrada: ${done}/${parts.length} (izmenjeno: ${changed})`);
    };

    update();

    const tasks: Array<LimitTask<void>> = parts.map((path) => async () => {
        abortIfNeeded();

        const xml = (await zip.file(path)?.async("string")) ?? "";
        if (!xml) {
            done++;
            update();
            return;
        }

        const res = await client.convert(xml, opts, 60_000, signal);

        if (res.type !== "Nema teksta" && res.xml) {
            zip.file(path, res.xml);
            changed++;
        }

        statsAgg = mergeStats(statsAgg, res.stats || null);

        done++;
        update();
    });

    await mapLimit(tasks, CONCURRENCY);
    abortIfNeeded();

    onProgress(92, "Pakovanje rezultata...");
    const outBlob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const ms = Math.max(0, Math.round(performance.now() - t0));
    onProgress(100, `Gotovo za ${ms}ms • izmenjeno delova: ${changed}`);

    return { blob: outBlob, stats: statsAgg, changedParts: changed, ms };
}

/**
 * Backward compatible API: returns only blob (as before).
 */
export async function convertDocxFile(
    file: File,
    client: WebWorkerClient,
    opts: OoxmlOptions,
    onProgress: ProgressCb,
    signal?: AbortSignal | null
): Promise<Blob> {
    const res = await convertDocxFileDetailed(file, client, opts, onProgress, signal);
    return res.blob;
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
