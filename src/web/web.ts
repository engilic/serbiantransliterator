// src/web/web.ts

import "./web.css";

import pkg from "../../package.json";
import { initWasm, convertPlainText, type Direction } from "../core/textCore";
import type { OoxmlOptions } from "../shared/ooxml/convertOoxml";
import { WebWorkerClient } from "./workerClient";
import { convertDocxFile, downloadBlob } from "./docx";

function $(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error("Missing element: #" + id);
    return el;
}

function setStatus(pct: number, msg: string) {
    const bar = $("bar") as HTMLDivElement;
    const st = $("statusText") as HTMLDivElement;
    bar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    st.textContent = msg;
}

function readProtectedList(): string[] {
    const raw = (document.getElementById("protected") as HTMLTextAreaElement | null)?.value ?? "";
    return raw
        .split(/\r?\n/g)
        .map((x) => x.trim())
        .filter((x) => x.length > 0)
        .slice(0, 5000);
}

function readOoxmlOptionsFromUi(): OoxmlOptions {
    const direction = (document.getElementById("direction") as HTMLSelectElement).value as
        | "auto"
        | "lat-to-cyr"
        | "cyr-to-lat"
        | "to-ascii";

    const protectBrands = (document.getElementById("protectBrands") as HTMLInputElement).checked;
    const applySerbianQuotes = (document.getElementById("applyQuotes") as HTMLInputElement).checked;
    const preserveCodeBlocks = (document.getElementById("preserveCode") as HTMLInputElement).checked;
    const curlyProtection = (document.getElementById("curly") as HTMLSelectElement).value as
        | "placeholders"
        | "all"
        | "none";

    const userProtected = readProtectedList();

    return {
        direction,
        protectBrands,
        applySerbianQuotes,
        preserveCodeBlocks,
        curlyProtection,
        userProtected,
        setProofingLanguage: false, // web nema Word proofing
        protectRomans: true,
        ignoredStyles: [],
    };
}

/**
 * Registracija Service Workera sa logikom za automatsko osvežavanje.
 */
function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;

    // Kada SW preuzme kontrolu (posle skipWaiting), osveži stranicu
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });

    window.addEventListener("load", async () => {
        try {
            const reg = await navigator.serviceWorker.register("./sw.js");

            reg.addEventListener("updatefound", () => {
                const newWorker = reg.installing;
                if (newWorker) {
                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                            // Novi sadržaj je spreman
                            console.log("Nova verzija instalirana.");
                        }
                    });
                }
            });
        } catch (err) {
            console.error("SW registration failed:", err);
        }
    });
}

async function main() {
    // Version
    const ver = document.getElementById("ver");
    if (ver) ver.textContent = `v${pkg.version}`;

    // Pokreni SW logiku
    registerServiceWorker();

    // Init WASM for plain text mode (main thread)
    await initWasm();

    const drop = $("drop");
    const fileInput = $("file") as HTMLInputElement;
    const btnConvert = $("btnConvert") as HTMLButtonElement;
    const btnCancel = $("btnCancel") as HTMLButtonElement;

    const plainIn = $("plainIn") as HTMLTextAreaElement;
    const plainOut = $("plainOut") as HTMLTextAreaElement;
    const btnPlain = $("btnPlain") as HTMLButtonElement;
    const btnCopy = $("btnCopy") as HTMLButtonElement;

    let pickedFiles: File[] = [];
    let abortCtrl: AbortController | null = null;

    const client = new WebWorkerClient();
    setStatus(0, "Spremno.");

    const updateButtons = () => {
        btnConvert.disabled = pickedFiles.length === 0 || !!abortCtrl;
        btnCancel.disabled = !abortCtrl;
    };

    fileInput.addEventListener("change", () => {
        pickedFiles = Array.from(fileInput.files || []).filter((f) => f.name.toLowerCase().endsWith(".docx"));
        setStatus(0, pickedFiles.length ? `Izabrano fajlova: ${pickedFiles.length}` : "Spremno.");
        updateButtons();
    });

    // Drag UX
    const prevent = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    ["dragenter", "dragover"].forEach((ev) => {
        drop.addEventListener(ev, (e) => {
            prevent(e as DragEvent);
            drop.classList.add("drag");
        });
    });
    ["dragleave", "drop"].forEach((ev) => {
        drop.addEventListener(ev, (e) => {
            prevent(e as DragEvent);
            drop.classList.remove("drag");
        });
    });

    drop.addEventListener("drop", (e) => {
        const de = e as DragEvent;
        const files = Array.from(de.dataTransfer?.files || []);
        pickedFiles = files.filter((f) => f.name.toLowerCase().endsWith(".docx"));
        setStatus(0, pickedFiles.length ? `Izabrano fajlova: ${pickedFiles.length}` : "Nema .docx fajlova.");
        updateButtons();
    });

    btnCancel.addEventListener("click", () => {
        abortCtrl?.abort();
    });

    btnConvert.addEventListener("click", async () => {
        if (pickedFiles.length === 0) return;

        abortCtrl = new AbortController();
        updateButtons();

        try {
            setStatus(1, "Pokretanje worker-a...");
            await client.init();

            const opts = readOoxmlOptionsFromUi();

            for (let i = 0; i < pickedFiles.length; i++) {
                // [FIX] Provera postojanja umesto "!"
                const f = pickedFiles[i];
                if (!f) continue;

                setStatus(2, `Obrada (${i + 1}/${pickedFiles.length}): ${f.name}`);

                const outBlob = await convertDocxFile(
                    f,
                    client,
                    opts,
                    (pct, msg) => setStatus(pct, msg),
                    abortCtrl.signal
                );

                downloadBlob(outBlob, `PRESLOVLJENO_${f.name}`);
            }

            setStatus(100, "Gotovo.");
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            if (err.name === "AbortError") {
                setStatus(0, "Otkaženo.");
            } else {
                setStatus(0, "Greška: " + err.message);
            }
        } finally {
            abortCtrl = null;
            updateButtons();
        }
    });

    // Plain text conversion
    btnPlain.addEventListener("click", () => {
        const input = String(plainIn.value || "");
        if (!input.trim()) {
            plainOut.value = "";
            btnCopy.disabled = true;
            setStatus(0, "Unesi tekst za konverziju.");
            return;
        }

        const opts = readOoxmlOptionsFromUi();
        const dir = (opts.direction ?? "auto") as Direction;

        const res = convertPlainText(input, dir, {
            userProtected: opts.userProtected,
            protectBrands: opts.protectBrands,
            applySerbianQuotes: opts.applySerbianQuotes,
            preserveCodeBlocks: opts.preserveCodeBlocks,
            curlyProtection: opts.curlyProtection,
            ignoredStyles: [],
        });

        plainOut.value = res.text;
        btnCopy.disabled = !res.text;
        setStatus(0, `Tekst: ${res.type}`);
    });

    btnCopy.addEventListener("click", async () => {
        const txt = String(plainOut.value || "");
        if (!txt) return;
        await navigator.clipboard.writeText(txt);
        setStatus(0, "Kopirano u clipboard.");
    });

    updateButtons();
}

main().catch((e) => {
    console.error(e);
});
