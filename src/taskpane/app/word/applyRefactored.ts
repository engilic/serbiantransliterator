/* global Word */
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";
import { analyzeSelectionText } from "./selectionText";
import { processDocumentInChunksRefactored } from "./chunking";
import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";

// Interfejs za komunikaciju sa React-om
export interface RunCallbacks {
    onProgress: (p: number) => void;
    onStatus: (msg: string, type: "info" | "success" | "error" | "warning") => void;
}

export interface RunSettings {
    direction: string;
    protectBrands: boolean;
    // Nove opcije mapirane iz UI
    applySerbianQuotes?: boolean;
    preserveCodeBlocks?: boolean;
    setProofingLanguage?: boolean;
    formatDates?: boolean;
    // Ovde bi dodali i customSubs, userProtected reči, dialect...
}

export async function runSmartRefactored(params: { settings: RunSettings } & RunCallbacks) {
    const { settings, onProgress, onStatus } = params;

    try {
        await Word.run(async (context) => {
            const range = context.document.getSelection();
            range.load("text");
            await context.sync();

            const info = analyzeSelectionText(range.text);

            // Konverzija UI podešavanja u OoxmlOptions
            const opts: OoxmlOptions = {
                direction: settings.direction as any, // "auto" | "lat-to-cyr" ...
                protectBrands: settings.protectBrands,
                applySerbianQuotes: settings.applySerbianQuotes,
                preserveCodeBlocks: settings.preserveCodeBlocks,
                setProofingLanguage: settings.setProofingLanguage,
                formatDates: settings.formatDates,
                // TODO: Dodati userProtected i ostalo kad implementiramo u UI
            };

            if (info.hasText) {
                // === SELECTION MODE ===
                onStatus("Obrada selekcije...", "info");

                const ooxml = range.getOoxml();
                await context.sync();

                const res = convertOoxml(ooxml.value, opts);

                if (res.type !== "Nema teksta") {
                    range.insertOoxml(res.xml, Word.InsertLocation.replace);
                    await context.sync();
                    onStatus(`Završeno: ${res.type}`, "success");
                } else {
                    onStatus("Nema teksta za obradu.", "warning");
                }
            } else {
                // === DOCUMENT MODE (CHUNKING) ===
                // Koristimo refaktorisanu chunking funkciju koja prima callback-ove
                const changed = await processDocumentInChunksRefactored(context, opts, {
                    onProgress: (p) => onProgress(p),
                    onStatus: (msg) => onStatus(msg, "info"),
                });

                onStatus(`Završeno! Promenjeno ${changed} čvorova.`, "success");
            }
        });
    } catch (e) {
        // Logujemo grešku i javljamo UI-u
        console.error(e);
        onStatus(`Greška: ${e}`, "error");
    }
}
