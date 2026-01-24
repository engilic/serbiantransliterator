// src/taskpane/app/web/batch.ts
/* global Blob, URL, document, FileReader */

import JSZip from "jszip";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";
import { getOoxmlOptionsFromUi } from "../settings/getters";
import { setStatus, setProgress } from "../status";
import { t } from "../../../shared/i18n";

const TARGET_XML_FILES = ["word/document.xml", "word/footnotes.xml", "word/endnotes.xml"];

export async function processDocxFile(file: File) {
    const t0 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();

    setStatus(t("status_processing"), "info");
    setProgress(10);

    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);

        const zip = await JSZip.loadAsync(arrayBuffer);
        const opts = getOoxmlOptionsFromUi();

        let processedCount = 0;
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

        for (const path of filesToProcess) {
            const xmlContent = await zip.file(path)?.async("string");
            if (!xmlContent) continue;

            const result = convertOoxml(xmlContent, opts);

            if (result.type !== "Nema teksta") {
                zip.file(path, result.xml);
                processedCount++;
            }
        }

        setProgress(80);

        const outBlob = await zip.generateAsync({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        setProgress(100);

        const t1 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const ms = Math.max(0, Math.round(t1 - t0));

        const msg = t("status_done_document", t("ui_web_mode"), ms, "");
        setStatus(msg, "success");

        downloadBlob(outBlob, `PRESLOVLJENO_${file.name}`);

        setTimeout(() => setProgress(null), 1000);
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
