// src/taskpane/app/web/batch.ts
/* global Blob, URL, document, FileReader */

import JSZip from "jszip";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";
import { getOoxmlOptionsFromUi } from "../settings/getters";
import { setStatus, setProgress } from "../status";
import { t } from "../../../shared/i18n";

// Fajlovi unutar .docx koje treba procesirati
const TARGET_XML_FILES = [
    "word/document.xml",
    "word/footnotes.xml",
    "word/endnotes.xml",
    // Headers & Footers (regex match kasnije)
];

export async function processDocxFile(file: File) {
    setStatus(t("status_processing"), "info");
    setProgress(10); // Start

    try {
        // 1. Učitaj fajl kao ArrayBuffer
        const arrayBuffer = await readFileAsArrayBuffer(file);

        // 2. Unzip
        const zip = await JSZip.loadAsync(arrayBuffer);
        const opts = getOoxmlOptionsFromUi();

        let processedCount = 0;
        const filesToProcess: string[] = [];

        // 3. Identifikuj fajlove za obradu
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

        // 4. Obrada (u seriji da ne blokiramo UI previše, mada je JSZip async)
        for (const path of filesToProcess) {
            const xmlContent = await zip.file(path)?.async("string");
            if (!xmlContent) continue;

            // Konverzija
            const result = convertOoxml(xmlContent, opts);

            // Ako ima izmena, upiši nazad u ZIP
            if (result.type !== "Nema teksta") {
                zip.file(path, result.xml);
                processedCount++;
            }
        }

        setProgress(80);

        // 5. Generiši novi .docx
        const outBlob = await zip.generateAsync({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        setProgress(100);
        setStatus(t("status_done_document", "Web Mode", "0", ""), "success");

        // 6. Trigger Download
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
