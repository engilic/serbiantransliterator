/* global Word, Office, document, window, console, Blob, URL, FileReader, DOMParser */

import "./taskpane.css";

import { convertOoxml, OoxmlOptions } from "../shared/ooxml/convertOoxml";
import { convertPlainText, Direction } from "../core/textCore";
import { removeMultipleSpaces } from "../core/utils";
import { createInitialCodeState, transformTextRespectingCode } from "../shared/ooxml/code";

// --- TIPOVI ---

type DirectionUi = "auto" | "lat-to-cyr" | "cyr-to-lat" | "to-ascii";
type ProfilePreset = "custom" | "it" | "finance" | "medical" | "legal" | "journalism" | "marketing";

interface UiSettings {
    schemaVersion: 2;
    profile: ProfilePreset;
    userWordsCustom: string[];
    protectBrands: boolean;
    applySerbianQuotes: boolean;
    preserveCodeBlocks: boolean;
    setProofingLanguage: boolean;
    protectRomans: boolean;
    fixDoubleSpaces: boolean;
    formatDates: boolean;
    confirmWholeDoc: boolean;
    includeHeadersFooters: boolean;
    includeFootnotes: boolean;
    includeEndnotes: boolean;
    showStats: boolean;
    direction: DirectionUi;
}

// --- KONSTANTE ---

const SETTINGS_KEY = "serbiantransliterator.settings.v2";

const DEFAULT_SETTINGS: UiSettings = {
    schemaVersion: 2,

    // Profil + korisničke reči
    profile: "custom",
    userWordsCustom: [],

    // Opseg obrade / ponašanje
    confirmWholeDoc: true,
    includeHeadersFooters: false,
    includeFootnotes: false,
    includeEndnotes: false,

    // Smer preslovljavanja
    direction: "auto",

    // Zaštite / pravila
    protectBrands: true,
    preserveCodeBlocks: true,
    protectRomans: true,

    // Korekcije / formatiranje
    applySerbianQuotes: true,
    fixDoubleSpaces: true,
    formatDates: true,

    // Word jezik provere
    setProofingLanguage: true,

    // UI
    showStats: false,
};

const PROFILE_NAMES: Record<string, string> = {
    custom: "Ručno",
    it: "IT / Tehnologija",
    finance: "Finansije / Bankarstvo",
    medical: "Medicina / Farmacija",
    legal: "Pravo / Administracija",
    marketing: "Marketing / Društvene mreže",
    journalism: "Novinarstvo / Mediji",
};

const PRESETS: Record<string, Partial<UiSettings> & { userWords: string[] }> = {
    it: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: false,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: false,
        formatDates: true,
        confirmWholeDoc: true,
        userWords: [
            "Git",
            "GitHub",
            "GitLab",
            "Azure",
            "AWS",
            "GCP",
            "DevOps",
            "Docker",
            "Kubernetes",
            "CI/CD",
            "YAML",
            "REST",
            "GraphQL",
            "PowerShell",
            "VS Code",
            "Visual Studio",
            "Windows Server",
            "Linux",
            "SerbianTransliterator",
            "Python",
            "JavaScript",
            "Typescript",
            "Node.js",
            "React",
            "Angular",
            "Vue",
            "Frontend",
            "Backend",
            "Fullstack",
            "Database",
            "Cache",
            "Cookie",
            "Token",
            "API",
            "Endpoint",
        ],
    },
    finance: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: true,
        confirmWholeDoc: true,
        userWords: [
            "SWIFT",
            "IBAN",
            "EUR",
            "USD",
            "RSD",
            "CHF",
            "GBP",
            "MasterCard",
            "Visa",
            "PayPal",
            "Intesa",
            "Raiffeisen",
            "OTP",
            "NLB",
            "AIK",
            "Erste",
            "UniCredit",
            "Western Union",
            "E-banking",
            "M-banking",
            "Leasing",
            "Factoring",
            "Equity",
            "Forex",
        ],
    },
    medical: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: false,
        formatDates: true,
        confirmWholeDoc: true,
        userWords: [
            "mg",
            "ml",
            "kg",
            "Covid",
            "SARS",
            "Hemofarm",
            "Galenika",
            "Pfizer",
            "Actavis",
            "Alkaloid",
            "Bayer",
            "Roche",
            "Stada",
            "Anamnesis",
            "Diagnosis",
            "Therapia",
            "CT",
            "MRI",
            "EKG",
            "EEG",
            "In vitro",
            "In vivo",
        ],
    },
    marketing: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: false,
        confirmWholeDoc: true,
        userWords: [
            "Facebook",
            "Instagram",
            "LinkedIn",
            "TikTok",
            "Twitter",
            "X",
            "YouTube",
            "Google",
            "SEO",
            "PR",
            "Copywriter",
            "Content",
            "Ads",
            "Influencer",
            "Giveaway",
            "Hashtag",
            "Story",
            "Reel",
            "Post",
            "Follow",
            "Like",
            "Share",
            "Subscribe",
            "Timeline",
            "Feed",
        ],
    },
    legal: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: true,
        confirmWholeDoc: true,
        userWords: [
            "Ustav Republike Srbije",
            "Zakon o obligacionim odnosima",
            "Zakon o radu",
            "Ministarstvo pravde",
            "Privredni sud",
            "Advokatska komora Srbije",
            "Službeni glasnik",
            "Bona fide",
            "De facto",
            "Ex officio",
            "Copyright",
            "Trademark",
            "Disclaimer",
            "Policy",
            "Terms",
            "Conditions",
            "GDPR",
        ],
    },
    journalism: {
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        fixDoubleSpaces: true,
        formatDates: true,
        confirmWholeDoc: true,
        userWords: [
            "Reuters",
            "Associated Press",
            "BBC",
            "CNN",
            "Euronews",
            "N1",
            "RTS",
            "Tanjug",
            "NBA",
            "UEFA",
            "FIFA",
            "FIBA",
            "ATP",
            "WTA",
            "Olimpijske igre",
        ],
    },
};

// --- GLOBAL STATE ---

let customWordsSet: Set<string> = new Set();
let presetWordsSet: Set<string> = new Set();
let currentProfile: ProfilePreset = "custom";

let lastStatsTitle = "Statistika poslednje akcije";
let lastStatsText = "(Nema statistike još)";

let selectionTimeout: any = null;
let isApplyingProfile = false;

// --- PREVIEW STATE ---
const PREVIEW_BATCH = 20;

let previewScope: "selection" | "document" = "selection";
let previewSettingsSnap: UiSettings | null = null;

let previewMode: "diff" | "plain" | "side" = "diff";
let previewTypeText = "";
let previewTitleText = "";
let previewOriginal = "";
let previewConverted = "";

let previewAllParagraphs: string[] = [];
let previewShownCount = 0;
let previewCanLoadMore = false;

let previewToastTimer: number | null = null;

// --- INIT ---

Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        initUi();

        Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, onSelectionChange);

        checkSelectionAndUpdateButtons();
    }
});

function initUi() {
    const settings = loadSettings() || DEFAULT_SETTINGS;

    customWordsSet = new Set(settings.userWordsCustom);
    presetWordsSet =
        settings.profile !== "custom" && PRESETS[settings.profile]
            ? new Set(PRESETS[settings.profile]!.userWords)
            : new Set();

    currentProfile = settings.profile;

    isApplyingProfile = true;
    applySettingsToUi(settings);
    isApplyingProfile = false;

    renderTags();
    updateResetButtonState();

    (document.getElementById("runBtn") as HTMLButtonElement).onclick = () => runWithUiLock(runSmart);
    (document.getElementById("previewBtn") as HTMLButtonElement).onclick = () => runWithUiLock(runPreview);

    (document.getElementById("exportBtn") as HTMLButtonElement).onclick = exportSettingsAsDownload;
    (document.getElementById("importBtn") as HTMLButtonElement).onclick = () =>
        (document.getElementById("fileInput") as HTMLInputElement).click();
    (document.getElementById("fileInput") as HTMLInputElement).onchange = handleFileImport;

    (document.getElementById("resetBtn") as HTMLButtonElement).onclick = async () => {
        const ok = await confirmInPanel(
            "Ovo će vratiti sve opcije na podrazumevane vrednosti.<br><br>Vaše zaštićene reči <b>neće</b> biti obrisane.<br><br>Da li želite da nastavite?"
        );
        if (ok) resetSettings();
    };

    setupTagEvents();
    setupInputListeners();

    (document.getElementById("profilePreset") as HTMLSelectElement).onchange = (e) => {
        const val = (e.target as HTMLSelectElement).value as ProfilePreset;
        changeProfile(val);
    };

    // default modal handlers
    (document.getElementById("modalOk") as HTMLButtonElement).onclick = handleModalOk;
    (document.getElementById("modalCancel") as HTMLButtonElement).onclick = closeModal;

    refreshStats();
}

// --- SELECTION HANDLING ---

function onSelectionChange() {
    if (selectionTimeout) clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => checkSelectionAndUpdateButtons(), 50);
}

async function checkSelectionAndUpdateButtons() {
    try {
        await Word.run(async (context) => {
            const range = context.document.getSelection();
            range.load("text");
            await context.sync();

            const runBtn = document.getElementById("runBtn") as HTMLButtonElement;
            const prevBtn = document.getElementById("previewBtn") as HTMLButtonElement;
            if (!runBtn || !prevBtn) return;

            const rawText = range.text ?? "";
            const hasContent = rawText.trim().length > 0;
            const isJustWhitespace = rawText.length > 0 && !hasContent;

            if (isJustWhitespace) {
                runBtn.innerHTML = `PRESLOVI<br><span class="btn-subtitle"><b>NEMA TEKSTA</b></span>`;
                runBtn.disabled = true;

                prevBtn.innerHTML = `PREGLED<br><span class="btn-subtitle"><b>NEMA TEKSTA</b></span>`;
                prevBtn.disabled = true;
            } else if (hasContent) {
                runBtn.innerHTML = `PRESLOVI<br><span class="btn-subtitle"><b>selekciju</b></span>`;
                runBtn.disabled = false;

                prevBtn.innerHTML = `PREGLED<br><span class="btn-subtitle"><b>selekcije</b></span>`;
                prevBtn.disabled = false;
            } else {
                runBtn.innerHTML = `PRESLOVI<br><span class="btn-subtitle"><b>ceo dokument</b></span>`;
                runBtn.disabled = false;

                prevBtn.innerHTML = `PREGLED<br><span class="btn-subtitle"><b>celog dokumenta</b></span>`;
                prevBtn.disabled = false;
            }
        });
    } catch {
        // ignore
    }
}

// --- APPLY TO WORD (OOXML) ---

/* eslint-disable office-addins/no-context-sync-in-loop */
async function processHeadersFooters(context: Word.RequestContext, opts: OoxmlOptions): Promise<number> {
    let processed = 0;

    const sections = context.document.sections;
    sections.load("items");
    await context.sync();

    const types: Word.HeaderFooterType[] = [
        Word.HeaderFooterType.primary,
        Word.HeaderFooterType.firstPage,
        Word.HeaderFooterType.evenPages,
    ];

    for (let si = 0; si < sections.items.length; si++) {
        const sec = sections.items[si]!;
        for (const t of types) {
            // HEADER
            try {
                const hr = sec.getHeader(t).getRange();
                const ooxml = hr.getOoxml();
                await context.sync();

                const res = convertOoxml(ooxml.value, opts);
                if (res.type !== "Nema teksta") {
                    hr.insertOoxml(res.xml, Word.InsertLocation.replace);
                    await context.sync();
                    processed++;
                }
            } catch {
                // neka okruženja/sekcije mogu baciti grešku – ignorišemo i nastavljamo
            }

            // FOOTER
            try {
                const fr = sec.getFooter(t).getRange();
                const ooxml = fr.getOoxml();
                await context.sync();

                const res = convertOoxml(ooxml.value, opts);
                if (res.type !== "Nema teksta") {
                    fr.insertOoxml(res.xml, Word.InsertLocation.replace);
                    await context.sync();
                    processed++;
                }
            } catch {
                // ignore
            }
        }
    }

    return processed;
}
/* eslint-enable office-addins/no-context-sync-in-loop */

/* eslint-disable office-addins/no-context-sync-in-loop */
async function processNotes(
    context: Word.RequestContext,
    opts: OoxmlOptions,
    kind: "footnotes" | "endnotes"
): Promise<{ processed: number; supported: boolean }> {
    let processed = 0;

    // Best-effort: u nekim hostovima može biti document.footnotes/endnotes,
    // u nekima document.body.footnotes/endnotes
    const docAny = context.document as any;
    const bodyAny = context.document.body as any;

    const coll = bodyAny?.[kind] ?? docAny?.[kind];
    if (!coll || typeof coll.load !== "function") {
        return { processed: 0, supported: false };
    }

    coll.load("items");
    await context.sync();

    const items: any[] = coll.items ?? [];
    for (const item of items) {
        let r: Word.Range | null = null;

        if (typeof item.getRange === "function") {
            r = item.getRange();
        } else if (item.body && typeof item.body.getRange === "function") {
            r = item.body.getRange("Whole");
        } else if (item.contentRange && typeof item.contentRange.getOoxml === "function") {
            r = item.contentRange;
        }

        if (!r) continue;

        const ooxml = r.getOoxml();
        await context.sync();

        const res = convertOoxml(ooxml.value, opts);
        if (res.type === "Nema teksta") continue;

        r.insertOoxml(res.xml, Word.InsertLocation.replace);
        await context.sync();

        processed++;
    }

    return { processed, supported: true };
}
/* eslint-enable office-addins/no-context-sync-in-loop */

async function runSmart() {
    try {
        await Word.run(async (context) => {
            let range = context.document.getSelection();
            range.load("text");
            await context.sync();

            const rawText = range.text ?? "";
            const hasText = rawText.trim().length > 0;
            const isJustWhitespace = rawText.length > 0 && !hasText;

            if (isJustWhitespace) {
                showModalInfo(
                    "Greška",
                    "Selektovan je samo prazan prostor (razmaci).<br>Molimo selektujte tekst ili ne selektujte ništa za ceo dokument."
                );
                setStatus("Greška: Prazna selekcija.", "error");
                return;
            }

            const ui = getSettingsFromUi();
            const opts = getOoxmlOptionsFromUi();

            let headersFootersProcessed = 0;

            // Ako nema selekcije -> ceo dokument
            if (!hasText) {
                if (ui.confirmWholeDoc) {
                    const ok = await confirmInPanel(
                        "Nije selektovan tekst.<br/>Da li želite da preslovite <b>CEO dokument</b>?"
                    );
                    if (!ok) {
                        setStatus("Otkazano.", "neutral");
                        return;
                    }
                }

                // 1) Header/Footer (opciono)
                if (ui.includeHeadersFooters) {
                    try {
                        setStatus("Obrada: zaglavlja/podnožja...", "info");
                        headersFootersProcessed = await processHeadersFooters(context, opts);
                    } catch (e) {
                        console.warn("Header/Footer obrada nije uspela:", e);
                        // Ne prekidamo ceo proces – nastavljamo dalje
                    }
                }

                // 2) Footnotes (opciono)
                if (ui.includeFootnotes) {
                    try {
                        setStatus("Obrada: fusnote...", "info");
                        const r = await processNotes(context, opts, "footnotes");
                        if (!r.supported) {
                            showModalInfo(
                                "Napomena",
                                "Fusnote nisu dostupne za automatsku obradu u ovom Word okruženju. " +
                                "I dalje možeš da selektuješ tekst u fusnoti i klikneš PRESLOVI."
                            );
                        }
                    } catch (e) {
                        console.warn("Footnotes obrada nije uspela:", e);
                    }
                }

                // 3) Endnotes (opciono)
                if (ui.includeEndnotes) {
                    try {
                        setStatus("Obrada: endnote...", "info");
                        const r = await processNotes(context, opts, "endnotes");
                        if (!r.supported) {
                            showModalInfo(
                                "Napomena",
                                "Endnote nisu dostupne za automatsku obradu u ovom Word okruženju. " +
                                "I dalje možeš da selektuješ tekst u endnoti i klikneš PRESLOVI."
                            );
                        }
                    } catch (e) {
                        console.warn("Endnotes obrada nije uspela:", e);
                    }
                }

                // 4) Body
                range = context.document.body.getRange("Whole");
            }

            setStatus("Obrada u toku...", "info");

            const ooxml = range.getOoxml();
            await context.sync();

            const result = convertOoxml(ooxml.value, opts);

            if (result.type === "Nema teksta") {
                setStatus("Nije pronađen tekst za obradu.", "neutral");
                return;
            }

            range.insertOoxml(result.xml, Word.InsertLocation.replace);
            await context.sync();

            const scope = hasText ? "Selekcija" : "Ceo dokument";
            const time = result.stats.timingMs.toFixed(0);

            const hfInfo = !hasText && headersFootersProcessed > 0 ? ` | H/F: ${headersFootersProcessed}` : "";
            setStatus(`Završeno: ${result.type} (${time}ms)${hfInfo}`, "success");

            lastStatsTitle = `Statistika: ${result.type}`;
            lastStatsText =
                `Opseg: ${scope}\n` +
                `Promenjeno čvorova: ${result.stats.textNodes}\n` +
                `Vreme: ${time}ms` +
                (!hasText ? `\nHeader/Footer obrađeno: ${headersFootersProcessed}` : "");

            refreshStats();
        });
    } catch (e) {
        console.error(e);
        setStatus("Greška: " + (e as Error).message, "error");
    }
}

async function applyFromPreview(scope: "selection" | "document") {
    try {
        await Word.run(async (context) => {
            let range = context.document.getSelection();
            range.load("text");
            await context.sync();

            const rawText = range.text ?? "";
            const hasText = rawText.trim().length > 0;
            const isJustWhitespace = rawText.length > 0 && !hasText;

            const ui = getSettingsFromUi();
            const opts = getOoxmlOptionsFromUi();
            const includeHF = ui.includeHeadersFooters === true;

            // Validacija za selekciju
            if (scope === "selection") {
                if (!hasText) {
                    showModalInfo("Greška", "Nema selekcije za preslovljavanje.");
                    return;
                }
                if (isJustWhitespace) {
                    showModalInfo("Greška", "Selektovan je samo prazan prostor (razmaci).");
                    return;
                }
            } else {
                // Whole document apply (iz preview-a)

                // 1) Header/Footer (opciono)
                if (includeHF) {
                    try {
                        setStatus("Obrada: zaglavlja/podnožja...", "info");
                        await processHeadersFooters(context, opts);
                    } catch (e) {
                        console.warn("Header/Footer obrada nije uspela:", e);
                        // Ne prekidamo proces – nastavljamo na body
                    }
                }

                // 2) Body
                range = context.document.body.getRange("Whole");
            }

            setStatus("Obrada u toku...", "info");

            const ooxml = range.getOoxml();
            await context.sync();

            const result = convertOoxml(ooxml.value, opts);

            if (result.type === "Nema teksta") {
                setStatus("Nije pronađen tekst za obradu.", "neutral");
                return;
            }

            range.insertOoxml(result.xml, Word.InsertLocation.replace);
            await context.sync();

            const time = result.stats.timingMs.toFixed(0);
            setStatus(`Završeno: ${result.type} (${time}ms)`, "success");

            // (opciono) ažuriraj stats kao u runSmart
            lastStatsTitle = `Statistika: ${result.type}`;
            lastStatsText =
                `Opseg: ${scope === "selection" ? "Selekcija" : "Ceo dokument"}\n` +
                `Promenjeno čvorova: ${result.stats.textNodes}\n` +
                `Vreme: ${time}ms` +
                (scope === "document" && includeHF ? `\nHeader/Footer: uključeno` : "");

            refreshStats();
        });
    } catch (e) {
        console.error(e);
        setStatus("Greška: " + (e as Error).message, "error");
    }
}

/* =========================
   PREVIEW HELPERS
   ========================= */

function normalizeWeirdBreaks(s: string): string {
    return (s ?? "").replace(/\u000b/g, "\n").replace(/\u000c/g, "\n");
}

function normalizeNewlines(s: string): string {
    return normalizeWeirdBreaks(s).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function formatSerbianDates(text: string): string {
    let out = text.replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, "$2.$1.$3.");
    out = out.replace(/\b(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\.?/g, "$1.$2.$3.");
    out = out.replace(/\b(\d{1,2})\.\s*(\d{1,2})\.(?!\d)/g, "$1.$2.");
    return out;
}

function toAscii(text: string): string {
    const map: Record<string, string> = {
        č: "c",
        ć: "c",
        š: "s",
        đ: "dj",
        ž: "z",
        Č: "C",
        Ć: "C",
        Š: "S",
        Đ: "Dj",
        Ž: "Z",
    };
    return text.replace(/[čćšđžČĆŠĐŽ]/g, (m) => map[m]!);
}

function convertTextForPreviewPlain(input: string, s: UiSettings): { out: string; type: string } {
    let temp = normalizeWeirdBreaks(input);

    const applyFixesOutsideCode = (txt: string) => {
        let t = txt;
        if (s.fixDoubleSpaces) t = removeMultipleSpaces(t);
        if (s.formatDates) t = formatSerbianDates(t);
        return t;
    };

    if (s.preserveCodeBlocks) {
        const cs = createInitialCodeState();
        temp = transformTextRespectingCode(
            temp,
            cs,
            (nonCode) => applyFixesOutsideCode(nonCode),
            (code) => code
        );
    } else {
        temp = applyFixesOutsideCode(temp);
    }

    const coreOpts = {
        userProtected: [...Array.from(customWordsSet), ...Array.from(presetWordsSet)],
        protectBrands: s.protectBrands,
        applySerbianQuotes: s.applySerbianQuotes,
        preserveCodeBlocks: s.preserveCodeBlocks,
    };

    if (s.direction === "to-ascii") {
        const { text: lat } = convertPlainText(temp, "cyr-to-lat", {
            ...coreOpts,
            applySerbianQuotes: false,
        });
        return { out: toAscii(lat), type: "Ošišana latinica" };
    }

    const dir: Direction = s.direction === "auto" ? "auto" : (s.direction as Direction);
    const { text, type } = convertPlainText(temp, dir, coreOpts);
    return { out: text, type };
}

function extractTextFromWordOoxml(xml: string): string {
    const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    const doc = new DOMParser().parseFromString(xml, "application/xml");

    const paras = Array.from(doc.getElementsByTagNameNS(W_NS, "p"));
    const hasParas = paras.length > 0;

    const walk = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) return "";
        const el = node as Element;
        if (!el || !el.localName) return "";

        if (el.localName === "t") return el.textContent ?? "";
        if (el.localName === "tab") return "\t";
        if (el.localName === "br" || el.localName === "cr") return "\n";

        let out = "";
        for (const ch of Array.from(el.childNodes)) out += walk(ch);
        return out;
    };

    if (!hasParas) {
        return Array.from(doc.getElementsByTagNameNS(W_NS, "t"))
            .map((n) => n.textContent ?? "")
            .join("");
    }

    const out: string[] = [];
    for (const p of paras) out.push(walk(p));
    return out.join("\n");
}

/* =========================
   PREVIEW MAIN
   ========================= */

async function runPreview() {
    setStatus("Generišem pregled...", "info");

    try {
        await Word.run(async (context) => {
            const range = context.document.getSelection();
            range.load("text");
            await context.sync();

            const selectionText = normalizeWeirdBreaks(range.text ?? "");
            const hasSelectionText = selectionText.trim().length > 0;
            const isJustWhitespace = selectionText.length > 0 && !hasSelectionText;

            if (isJustWhitespace) {
                showModalInfo("Greška", "Selektovan je samo prazan prostor.");
                setStatus("Greška: Prazna selekcija.", "error");
                return;
            }

            const settings = getSettingsFromUi();
            previewSettingsSnap = JSON.parse(JSON.stringify(settings));

            previewAllParagraphs = [];
            previewShownCount = 0;
            previewCanLoadMore = false;

            if (hasSelectionText) {
                previewScope = "selection";

                const ooxml = range.getOoxml();
                await context.sync();

                const originalOoxml = ooxml.value;
                const opts = getOoxmlOptionsFromUi();

                const origText = extractTextFromWordOoxml(originalOoxml);

                const converted = convertOoxml(originalOoxml, opts);
                const convText = extractTextFromWordOoxml(converted.xml);

                const a = normalizeNewlines(origText);
                const b = normalizeNewlines(convText);

                if (!b.trim()) {
                    showModalInfo("Greška", "Pregled nije uspeo: rezultat je prazan tekst.");
                    setStatus("Greška: Prazan rezultat pregleda.", "error");
                    return;
                }

                if (a === b) {
                    showModalInfo("Nema izmena", "Tekst je već u traženom pismu ili nema šta da se menja.");
                    setStatus("Nema izmena.", "neutral");
                    return;
                }

                previewMode = "diff";
                previewTypeText = converted.type;
                previewTitleText = `Selektovani tekst (${converted.type})`;
                previewOriginal = origText;
                previewConverted = convText;

                showPreviewModal();
                setStatus(`Prikazan pregled (${converted.type})`, "success");
                return;
            }

            // Whole doc preview: first N paragraphs (plain text)
            previewScope = "document";

            const body = context.document.body;
            body.load("text");
            await context.sync();

            const full = normalizeWeirdBreaks(body.text ?? "");
            let paragraphs = full.split(/\r/);
            if (paragraphs.length === 1) paragraphs = full.split(/\n/);
            if (paragraphs.length === 1) paragraphs = [full];

            while (paragraphs.length && !paragraphs[paragraphs.length - 1]!.trim()) paragraphs.pop();

            previewAllParagraphs = paragraphs;
            previewShownCount = Math.min(PREVIEW_BATCH, paragraphs.length);
            previewCanLoadMore = previewShownCount < paragraphs.length;

            const textToPreview = paragraphs.slice(0, previewShownCount).join("\n");
            if (!textToPreview.trim()) {
                setStatus("Dokument je prazan.", "neutral");
                return;
            }

            const { out: finalText, type } = convertTextForPreviewPlain(textToPreview, previewSettingsSnap!);

            const a = normalizeNewlines(textToPreview);
            const b = normalizeNewlines(finalText);

            if (!b.trim()) {
                showModalInfo("Greška", "Pregled nije uspeo: rezultat je prazan tekst.");
                setStatus("Greška: Prazan rezultat pregleda.", "error");
                return;
            }

            if (a === b) {
                showModalInfo("Nema izmena", "Tekst je već u traženom pismu ili nema šta da se menja.");
                setStatus("Nema izmena.", "neutral");
                return;
            }

            previewMode = "diff";
            previewTypeText = type;
            previewTitleText = `Prvih ${previewShownCount} paragrafa (${type})`;
            previewOriginal = textToPreview;
            previewConverted = finalText;

            showPreviewModal();
            setStatus(`Prikazan pregled (${type})`, "success");
        });
    } catch (e) {
        console.error(e);
        setStatus("Greška pri pregledu: " + (e as Error).message, "error");
    }
}

function setLoadMoreButtonState(btn: HTMLButtonElement, canLoadMore: boolean, reason?: string) {
    btn.disabled = !canLoadMore;
    btn.style.opacity = canLoadMore ? "1" : "0.45";
    btn.style.cursor = canLoadMore ? "pointer" : "not-allowed";
    btn.title = canLoadMore ? "Učitaj sledeće paragrafe" : (reason ?? "Nema više paragrafa za učitavanje");
}

async function loadMorePreviewParagraphs() {
    if (!previewSettingsSnap) return;
    if (!previewAllParagraphs.length) return;
    if (!previewCanLoadMore) return;

    previewShownCount = Math.min(previewAllParagraphs.length, previewShownCount + PREVIEW_BATCH);
    previewCanLoadMore = previewShownCount < previewAllParagraphs.length;

    previewTitleText = `Prvih ${previewShownCount} paragrafa (${previewTypeText})`;

    const newOriginal = previewAllParagraphs.slice(0, previewShownCount).join("\n");
    previewOriginal = newOriginal;

    const { out: newConverted } = convertTextForPreviewPlain(newOriginal, previewSettingsSnap);
    previewConverted = newConverted;

    const titleEl = document.getElementById("previewTitleText");
    if (titleEl) titleEl.textContent = previewTitleText;

    const okBtn = document.getElementById("modalOk") as HTMLButtonElement | null;
    if (okBtn) setLoadMoreButtonState(okBtn, previewCanLoadMore);

    renderPreviewMode();
}

function ensureModalApplyButton(): HTMLButtonElement {
    const actions = document.querySelector("#modalOverlay .modal-actions") as HTMLDivElement;
    let btn = document.getElementById("modalApply") as HTMLButtonElement | null;
    if (btn) return btn;

    btn = document.createElement("button");
    btn.id = "modalApply";
    btn.type = "button";
    btn.innerText = "PRESLOVI";
    btn.style.backgroundColor = "var(--primary-color)";
    btn.style.color = "white";
    btn.style.border = "none";

    actions.insertBefore(btn, actions.firstChild);
    return btn;
}

function renderPreviewMode() {
    const holder = document.getElementById("previewHolder");
    if (!holder) return;

    const orig = normalizeNewlines(previewOriginal);
    const conv = normalizeNewlines(previewConverted);

    if (previewMode === "plain") {
        holder.innerHTML = `<div class="preview-single-pane">${escapeHtml(conv)}</div>`;
    } else if (previewMode === "side") {
        holder.innerHTML = renderSideBySideWithHighlights(orig, conv);
    } else {
        holder.innerHTML = generateDiffHtml(orig, conv);
    }

    const btnDiff = document.getElementById("previewBtnDiff") as HTMLButtonElement | null;
    const btnPlain = document.getElementById("previewBtnPlain") as HTMLButtonElement | null;
    const btnSide = document.getElementById("previewBtnSide") as HTMLButtonElement | null;

    if (btnDiff) btnDiff.disabled = previewMode === "diff";
    if (btnPlain) btnPlain.disabled = previewMode === "plain";
    if (btnSide) btnSide.disabled = previewMode === "side";
}

function showPreviewModal() {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const text = document.getElementById("modalText") as HTMLDivElement;
    const input = document.getElementById("modalInput") as HTMLTextAreaElement;

    const okBtn = document.getElementById("modalOk") as HTMLButtonElement; // Učitaj još
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement; // sakrivamo
    const applyBtn = ensureModalApplyButton();

    title.style.display = "none";
    input.style.display = "none";
    (document.getElementById("modal") as HTMLDivElement).classList.add("wide");

    text.innerHTML = `
      <div id="previewStickyHeader"
           style="position:sticky; top:0; z-index:2; background: var(--bg-color);
                  border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 10px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
          <div id="previewTitleText"
               style="color: var(--primary-color); font-weight: 800; line-height: 1.3; padding-top:2px; flex:1;">
            ${escapeHtml(previewTitleText)}
          </div>

          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
            <button id="previewCloseBtn"
                    class="icon-btn"
                    type="button"
                    aria-label="Zatvori"
                    title="Zatvori"
                    style="width:28px; height:28px; padding:0; font-size:20px; line-height:1;">
              ×
            </button>

            <div id="previewToast" class="preview-toast" role="status" aria-live="polite"></div>

            <div style="display:flex; flex-direction:column; gap:6px; align-items:stretch; min-width:110px;">
              <button id="previewBtnDiff" class="mini-btn" type="button" title="Označi promene">Razlike</button>
              <button id="previewBtnPlain" class="mini-btn" type="button" title="Prikaži samo rezultat">Rezultat</button>
              <button id="previewBtnSide" class="mini-btn" type="button" title="Pre / Posle">Pre/Posle</button>
              <button id="previewBtnCopy" class="mini-btn" type="button" title="Kopiraj rezultat">Kopiraj</button>
            </div>
          </div>
        </div>
      </div>

      <div id="previewHolder"></div>
    `;

    (document.getElementById("previewCloseBtn") as HTMLButtonElement).onclick = () => closeModal();

    const bDiff = document.getElementById("previewBtnDiff") as HTMLButtonElement;
    const bPlain = document.getElementById("previewBtnPlain") as HTMLButtonElement;
    const bSide = document.getElementById("previewBtnSide") as HTMLButtonElement;
    const bCopy = document.getElementById("previewBtnCopy") as HTMLButtonElement;

    bDiff.onclick = () => {
        previewMode = "diff";
        renderPreviewMode();
    };

    bPlain.onclick = () => {
        previewMode = "plain";
        renderPreviewMode();
    };

    bSide.onclick = () => {
        previewMode = "side";
        renderPreviewMode();
    };

    bCopy.onclick = async () => {
        const ok = await copyToClipboard(previewConverted ?? "");
        if (ok) showPreviewToast("Kopirano", "success");
        else showPreviewToast("Ne mogu da kopiram", "error", 2200);
    };

    // inicijalno
    if (previewMode !== "diff" && previewMode !== "plain" && previewMode !== "side") previewMode = "diff";
    renderPreviewMode();

    // Dole: PRESLOVI + Učitaj još. "Zatvori" sakriven jer postoji X gore.
    cancelBtn.style.display = "none";

    okBtn.style.display = "inline-flex";
    okBtn.innerText = "Učitaj još";
    okBtn.style.backgroundColor = "var(--bg-color)";
    okBtn.style.color = "var(--primary-color)";
    okBtn.style.border = "1px solid var(--input-border)";

    if (previewScope === "document") {
        setLoadMoreButtonState(okBtn, previewCanLoadMore);
        okBtn.onclick = async () => {
            await loadMorePreviewParagraphs();
        };
    } else {
        setLoadMoreButtonState(okBtn, false, "Dostupno samo kada pregledate ceo dokument");
        okBtn.onclick = () => {
            /* no-op */
        };
    }

    applyBtn.style.display = "inline-flex";
    applyBtn.onclick = async () => {
        overlay.style.display = "none";
        resetModalButtons();
        await runWithUiLock(async () => {
            await applyFromPreview(previewScope);
        });
    };

    overlay.style.display = "flex";
    modalPromiseResolver = null;
}

/* =========================
   TAGOVI
   ========================= */

function setupTagEvents() {
    const input = document.getElementById("tagInput") as HTMLInputElement;
    const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;
    const container = document.getElementById("tagsContainer") as HTMLDivElement;
    const tagsList = document.getElementById("tagsList") as HTMLDivElement;

    addBtn.disabled = true;

    container.onclick = (e) => {
        if (e.target === container || e.target === tagsList) input.focus();
    };

    input.onkeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    };

    addBtn.onclick = () => {
        addTag();
        input.focus();
    };

    input.oninput = () => {
        const val = input.value.trim();
        const exists = customWordsSet.has(val) || presetWordsSet.has(val);
        addBtn.disabled = val.length === 0 || exists;
    };

    (document.getElementById("clearCustomBtn") as HTMLButtonElement).onclick = () => clearTags("custom");
    (document.getElementById("clearPresetBtn") as HTMLButtonElement).onclick = () => clearTags("preset");
    (document.getElementById("clearAllBtn") as HTMLButtonElement).onclick = () => clearTags("all");
}

function addTag() {
    const input = document.getElementById("tagInput") as HTMLInputElement;
    const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;
    const val = input.value.trim();
    if (!val) return;

    if (presetWordsSet.has(val)) {
        input.value = "";
        addBtn.disabled = true;
        return;
    }

    customWordsSet.add(val);
    input.value = "";
    addBtn.disabled = true;

    renderTags();
    switchToCustomIfManual();
    updateUiState();
}

function removeTag(word: string, type: "custom" | "preset") {
    if (type === "custom") customWordsSet.delete(word);
    else presetWordsSet.delete(word);

    renderTags();
    switchToCustomIfManual();
    updateUiState();
}

function clearTags(scope: "custom" | "preset" | "all") {
    if (scope === "custom" || scope === "all") customWordsSet.clear();
    if (scope === "preset" || scope === "all") presetWordsSet.clear();

    renderTags();
    switchToCustomIfManual();
    updateUiState();
}

function renderTags() {
    const container = document.getElementById("tagsList") as HTMLDivElement;
    container.innerHTML = "";

    const customSorted = Array.from(customWordsSet).sort();
    const presetSorted = Array.from(presetWordsSet).sort();

    customSorted.forEach((word) => container.appendChild(createTagEl(word, "custom")));
    presetSorted.forEach((word) => container.appendChild(createTagEl(word, "preset")));

    updateUiState();
}

function createTagEl(text: string, type: "custom" | "preset"): HTMLElement {
    const div = document.createElement("div");
    div.className = `tag ${type}`;
    div.innerHTML = `<span>${escapeHtml(text)}</span><span class="tag-remove" title="Ukloni">&times;</span>`;

    div.querySelector(".tag-remove")!.addEventListener("click", (e) => {
        e.stopPropagation();
        removeTag(text, type);
    });

    return div;
}

function updateUiState() {
    (document.getElementById("clearCustomBtn") as HTMLButtonElement).disabled = customWordsSet.size === 0;
    (document.getElementById("clearPresetBtn") as HTMLButtonElement).disabled = presetWordsSet.size === 0;
    (document.getElementById("clearAllBtn") as HTMLButtonElement).disabled =
        customWordsSet.size === 0 && presetWordsSet.size === 0;
}

/* =========================
   SETTINGS
   ========================= */

function changeProfile(profile: ProfilePreset) {
    currentProfile = profile;
    isApplyingProfile = true;

    if (profile === "custom") {
        presetWordsSet.clear();
    } else {
        const data = PRESETS[profile];
        if (data) {
            presetWordsSet = new Set(data.userWords);

            if (data.direction) setRadioValue("direction", data.direction);
            if (data.protectBrands !== undefined) setCheckValue("optProtectBrands", data.protectBrands);
            if (data.applySerbianQuotes !== undefined) setCheckValue("optSerbianQuotes", data.applySerbianQuotes);
            if (data.preserveCodeBlocks !== undefined) setCheckValue("optPreserveCodeBlocks", data.preserveCodeBlocks);
            if (data.protectRomans !== undefined) setCheckValue("optProtectRomans", data.protectRomans);
            if (data.setProofingLanguage !== undefined) setCheckValue("optSetProofingLanguage", data.setProofingLanguage);
            if (data.fixDoubleSpaces !== undefined) setCheckValue("optFixDoubleSpaces", data.fixDoubleSpaces);
            if (data.formatDates !== undefined) setCheckValue("optFormatDates", data.formatDates);
            if (data.confirmWholeDoc !== undefined) setCheckValue("optConfirmWholeDoc", data.confirmWholeDoc);
        }
    }

    renderTags();
    saveSettings();

    const displayName = PROFILE_NAMES[profile] || profile;
    setStatus(`Profil promenjen na: ${displayName}`, "info");

    isApplyingProfile = false;
}

function setupInputListeners() {
    const ids = [
        "optConfirmWholeDoc",
        "optProtectBrands",
        "optSerbianQuotes",
        "optPreserveCodeBlocks",
        "optProtectRomans",
        "optSetProofingLanguage",
        "optShowStats",
        "optFixDoubleSpaces",
        "optFormatDates",
	"optIncludeHeadersFooters",
        "optIncludeFootnotes",
        "optIncludeEndnotes",
        "dirAuto",
        "dirLatToCyr",
        "dirCyrToLat",
        "dirToAscii",
    ];

    ids.forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement | null;
        if (!el) return;

        el.onchange = () => {
            if (!isApplyingProfile) switchToCustomIfManual();
            else saveSettings();

            if (id === "optShowStats") refreshStats();
        };
    });
}

function getSettingsFromUi(): UiSettings {
    return {
        schemaVersion: 2,
        profile: (document.getElementById("profilePreset") as HTMLSelectElement).value as ProfilePreset,
        userWordsCustom: Array.from(customWordsSet),
        protectBrands: getCheckValue("optProtectBrands"),
        applySerbianQuotes: getCheckValue("optSerbianQuotes"),
        preserveCodeBlocks: getCheckValue("optPreserveCodeBlocks"),
        setProofingLanguage: getCheckValue("optSetProofingLanguage"),
        protectRomans: getCheckValue("optProtectRomans"),
        fixDoubleSpaces: getCheckValue("optFixDoubleSpaces"),
        formatDates: getCheckValue("optFormatDates"),
        confirmWholeDoc: getCheckValue("optConfirmWholeDoc"),
        showStats: getCheckValue("optShowStats"),
        direction: getRadioValue("direction") as DirectionUi,
        includeHeadersFooters: getCheckValue("optIncludeHeadersFooters"),
        includeFootnotes: getCheckValue("optIncludeFootnotes"),
        includeEndnotes: getCheckValue("optIncludeEndnotes"),
    };
}

function applySettingsToUi(s: UiSettings) {
    (document.getElementById("profilePreset") as HTMLSelectElement).value = s.profile;

    setCheckValue("optConfirmWholeDoc", s.confirmWholeDoc);
    setCheckValue("optProtectBrands", s.protectBrands);
    setCheckValue("optSerbianQuotes", s.applySerbianQuotes);
    setCheckValue("optPreserveCodeBlocks", s.preserveCodeBlocks);
    setCheckValue("optProtectRomans", s.protectRomans);
    setCheckValue("optSetProofingLanguage", s.setProofingLanguage);

    setCheckValue("optShowStats", s.showStats);
    setCheckValue("optFixDoubleSpaces", s.fixDoubleSpaces);
    setCheckValue("optFormatDates", s.formatDates);

    setRadioValue("direction", s.direction);

    setCheckValue("optIncludeHeadersFooters", s.includeHeadersFooters);
    setCheckValue("optIncludeFootnotes", s.includeFootnotes);
    setCheckValue("optIncludeEndnotes", s.includeEndnotes);
}

function updateResetButtonState() {
    const current = getSettingsFromUi();
    const def: UiSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    const curCopy: UiSettings = JSON.parse(JSON.stringify(current));

    curCopy.userWordsCustom = [];
    def.userWordsCustom = [];

    const isSame = JSON.stringify(curCopy) === JSON.stringify(def);
    const btn = document.getElementById("resetBtn") as HTMLButtonElement;
    if (btn) btn.disabled = isSame;
}

function saveSettings() {
    const s = getSettingsFromUi();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    updateResetButtonState();
}

function loadSettings(): UiSettings | null {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        const merged: UiSettings = { ...DEFAULT_SETTINGS, ...parsed, schemaVersion: 2 };
        return merged.schemaVersion === 2 ? merged : null;
    } catch {
        return null;
    }
}

function resetSettings() {
    const currentWords = Array.from(customWordsSet);

    const newSettings: UiSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    newSettings.userWordsCustom = currentWords;
    newSettings.profile = "custom";

    isApplyingProfile = true;
    applySettingsToUi(newSettings);
    changeProfile("custom");
    isApplyingProfile = false;

    presetWordsSet.clear();
    renderTags();

    saveSettings();
    setStatus("Podešavanja vraćena (reči sačuvane).", "success");
}

function switchToCustomIfManual() {
    if (isApplyingProfile) return;

    if (currentProfile === "custom") {
        saveSettings();
        return;
    }

    currentProfile = "custom";
    const select = document.getElementById("profilePreset") as HTMLSelectElement;
    if (select) select.value = "custom";

    saveSettings();
}

function getOoxmlOptionsFromUi(): OoxmlOptions & { showStats: boolean } {
    const s = getSettingsFromUi();

    let dir: OoxmlOptions["direction"] = "auto";
    if (s.direction === "lat-to-cyr") dir = "lat-to-cyr";
    if (s.direction === "cyr-to-lat") dir = "cyr-to-lat";
    if (s.direction === "to-ascii") dir = "to-ascii";

    return {
        direction: dir,
        protectBrands: s.protectBrands,
        applySerbianQuotes: s.applySerbianQuotes,
        preserveCodeBlocks: s.preserveCodeBlocks,
        setProofingLanguage: s.setProofingLanguage,
        fixDoubleSpaces: s.fixDoubleSpaces,
        formatDates: s.formatDates,
        protectRomans: s.protectRomans,
        userProtected: [...Array.from(customWordsSet), ...Array.from(presetWordsSet)],
        // @ts-ignore
        showStats: s.showStats,
    };
}

/* =========================
   IMPORT / EXPORT
   ========================= */

function exportSettingsAsDownload() {
    saveSettings();
    const s = getSettingsFromUi();
    const json = JSON.stringify(s, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "serbian-transliterator-settings.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleFileImport(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const json = evt.target?.result as string;
            const parsed = JSON.parse(json);

            if (typeof parsed.profile !== "string" || !Array.isArray(parsed.userWordsCustom)) {
                throw new Error("Invalid format");
            }

            const newSettings: UiSettings = { ...DEFAULT_SETTINGS, ...parsed, schemaVersion: 2 };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

            initUi();
            setStatus("Podešavanja uspešno učitana.", "success");
        } catch {
            setStatus("Greška: Neispravan fajl.", "error");
        }
        input.value = "";
    };
    reader.readAsText(input.files[0]);
}

/* =========================
   UI HELPERS
   ========================= */

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if ((navigator as any).clipboard?.writeText) {
            await (navigator as any).clipboard.writeText(text);
            return true;
        }
    } catch {
        // fallback below
    }

    try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "true");
        ta.style.position = "fixed";
        ta.style.top = "0";
        ta.style.left = "0";
        ta.style.width = "1px";
        ta.style.height = "1px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
    } catch {
        return false;
    }
}

function showPreviewToast(message: string, type: "success" | "error" | "info" = "info", ms = 1600) {
    const el = document.getElementById("previewToast") as HTMLDivElement | null;
    if (!el) return;

    el.textContent = message;
    el.classList.remove("success", "error", "info");
    el.classList.add("show", type);

    if (previewToastTimer) window.clearTimeout(previewToastTimer);
    previewToastTimer = window.setTimeout(() => {
        el.classList.remove("show", "success", "error", "info");
        el.textContent = "";
    }, ms);
}

async function runWithUiLock(fn: () => Promise<void>) {
    const runBtn = document.getElementById("runBtn") as HTMLButtonElement;
    const previewBtn = document.getElementById("previewBtn") as HTMLButtonElement;

    runBtn.disabled = true;
    previewBtn.disabled = true;
    document.body.style.cursor = "wait";

    try {
        await fn();
    } finally {
        await checkSelectionAndUpdateButtons();
        document.body.style.cursor = "default";
    }
}

function setStatus(msg: string, type: "info" | "success" | "error" | "neutral") {
    const el = document.getElementById("msg") as HTMLDivElement;
    el.innerText = msg;
    el.style.color =
        type === "error" ? "var(--error-color)" : type === "success" ? "var(--success-color)" : "var(--text-color)";
}

function refreshStats() {
    const box = document.getElementById("statsBox") as HTMLDivElement;
    const show = getCheckValue("optShowStats");

    box.style.display = show ? "block" : "none";
    if (show) {
        (document.getElementById("statsTitle") as HTMLDivElement).innerText = lastStatsTitle;
        (document.getElementById("statsText") as HTMLPreElement).innerText = lastStatsText;
    }
}

function getCheckValue(id: string): boolean {
    const el = document.getElementById(id) as HTMLInputElement | null;
    return !!el && el.checked;
}

function setCheckValue(id: string, val: boolean) {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.checked = val;
}

function getRadioValue(name: string): string {
    const els = document.getElementsByName(name);
    for (let i = 0; i < els.length; i++) {
        if ((els[i] as HTMLInputElement).checked) return (els[i] as HTMLInputElement).value;
    }
    return "";
}

function setRadioValue(name: string, val: string) {
    const els = document.getElementsByName(name);
    for (let i = 0; i < els.length; i++) {
        if ((els[i] as HTMLInputElement).value === val) (els[i] as HTMLInputElement).checked = true;
    }
}

function escapeHtml(unsafe: string) {
    return (unsafe ?? "").replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case "'":
                return "&apos;";
            case "\"":
                return "&quot;";
        }
        return c;
    });
}

/* =========================
   MODAL SYSTEM
   ========================= */

let modalPromiseResolver: ((val: boolean) => void) | null = null;

function confirmInPanel(htmlMsg: string): Promise<boolean> {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const text = document.getElementById("modalText") as HTMLDivElement;
    const input = document.getElementById("modalInput") as HTMLTextAreaElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;

    title.style.display = "";
    cancelBtn.style.display = "inline-flex";

    title.innerText = "Potvrda";
    text.innerHTML = htmlMsg;
    input.style.display = "none";

    const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
    if (applyBtn) applyBtn.style.display = "none";

    okBtn.style.display = "inline-flex";
    okBtn.innerText = "OK";
    okBtn.disabled = false;
    okBtn.style.opacity = "";
    okBtn.style.cursor = "";
    okBtn.title = "";
    okBtn.style.backgroundColor = "var(--primary-color)";
    okBtn.style.color = "white";
    okBtn.style.border = "none";
    okBtn.onclick = handleModalOk;

    cancelBtn.innerText = "Otkaži";
    cancelBtn.style.backgroundColor = "";
    cancelBtn.style.color = "";
    cancelBtn.style.border = "";
    cancelBtn.onclick = closeModal;

    (document.getElementById("modal") as HTMLDivElement).classList.remove("wide");
    overlay.style.display = "flex";

    return new Promise((resolve) => {
        modalPromiseResolver = resolve;
    });
}

function showModalInfo(titleStr: string, msg: string) {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const text = document.getElementById("modalText") as HTMLDivElement;
    const input = document.getElementById("modalInput") as HTMLTextAreaElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;

    title.style.display = "";
    cancelBtn.style.display = "inline-flex";

    title.innerText = titleStr;
    text.innerHTML = msg;
    input.style.display = "none";

    const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
    if (applyBtn) applyBtn.style.display = "none";

    okBtn.style.display = "none";

    cancelBtn.innerText = "Zatvori";
    cancelBtn.style.backgroundColor = "var(--primary-color)";
    cancelBtn.style.color = "white";
    cancelBtn.style.border = "none";
    cancelBtn.onclick = closeModal;

    (document.getElementById("modal") as HTMLDivElement).classList.remove("wide");
    overlay.style.display = "flex";

    modalPromiseResolver = null;
}

function handleModalOk() {
    (document.getElementById("modalOverlay") as HTMLDivElement).style.display = "none";
    resetModalButtons();
    if (modalPromiseResolver) modalPromiseResolver(true);
}

function closeModal() {
    (document.getElementById("modalOverlay") as HTMLDivElement).style.display = "none";
    resetModalButtons();
    if (modalPromiseResolver) modalPromiseResolver(false);
}

function resetModalButtons() {
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;

    title.style.display = "";

    cancelBtn.style.display = "inline-flex";
    cancelBtn.innerText = "Otkaži";
    cancelBtn.style.backgroundColor = "";
    cancelBtn.style.color = "";
    cancelBtn.style.border = "";
    cancelBtn.onclick = closeModal;

    okBtn.style.display = "inline-flex";
    okBtn.innerText = "OK";
    okBtn.disabled = false;
    okBtn.style.opacity = "";
    okBtn.style.cursor = "";
    okBtn.title = "";
    okBtn.style.backgroundColor = "var(--primary-color)";
    okBtn.style.color = "white";
    okBtn.style.border = "none";
    okBtn.onclick = handleModalOk;

    const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
    if (applyBtn) {
        applyBtn.style.display = "none";
        applyBtn.onclick = null;
    }
}

/* =========================
   DIFF renderer (IMPROVED)
   - NE OBELEŽAVA WHITESPACE-ONLY PROMENE
   ========================= */

type DiffOp = { type: "equal" | "insert" | "delete"; value: string };

function tokenizeForDiff(text: string): string[] {
    // isti split kao tvoj generateDiffHtml
    const splitRegex = /([^\s\w\u0400-\u04FF\u0100-\u017F]+|\s+)/;
    return normalizeNewlines(text).split(splitRegex).filter(Boolean);
}

function isWhitespaceToken(s: string): boolean {
    return /^\s+$/u.test(s);
}

// Minimal Myers diff za niz tokena (string[])
function myersDiff(a: string[], b: string[]): DiffOp[] {
    const n = a.length;
    const m = b.length;
    const max = n + m;

    // v[k] = x; k je pomeren za +max
    const v: number[] = new Array(2 * max + 1).fill(0);
    const trace: number[][] = [];

    for (let d = 0; d <= max; d++) {
        trace.push(v.slice());

        for (let k = -d; k <= d; k += 2) {
            const km = k + max;

            let x: number;
            if (k === -d || (k !== d && v[km - 1] < v[km + 1])) {
                // insert (down)
                x = v[km + 1];
            } else {
                // delete (right)
                x = v[km - 1] + 1;
            }

            let y = x - k;

            // snake
            while (x < n && y < m && a[x] === b[y]) {
                x++;
                y++;
            }

            v[km] = x;

            if (x >= n && y >= m) {
                // reconstruct
                const ops: DiffOp[] = [];
                let curX = n;
                let curY = m;

                for (let dd = d; dd >= 0; dd--) {
                    const vv = trace[dd]!;
                    const kk = curX - curY;
                    const kkm = kk + max;

                    let prevK: number;
                    if (kk === -dd || (kk !== dd && vv[kkm - 1] < vv[kkm + 1])) {
                        prevK = kk + 1; // came from down => insert
                    } else {
                        prevK = kk - 1; // came from right => delete
                    }

                    const prevX = vv[prevK + max]!;
                    const prevY = prevX - prevK;

                    // snake (equal)
                    while (curX > prevX && curY > prevY) {
                        ops.push({ type: "equal", value: a[curX - 1]! });
                        curX--;
                        curY--;
                    }

                    if (dd === 0) break;

                    // edit step
                    if (curX === prevX) {
                        // insert
                        ops.push({ type: "insert", value: b[curY - 1]! });
                        curY--;
                    } else {
                        // delete
                        ops.push({ type: "delete", value: a[curX - 1]! });
                        curX--;
                    }
                }

                ops.reverse();
                return ops;
            }
        }
    }

    // fallback (ne bi trebalo)
    return [{ type: "equal", value: b.join("") }];
}

function renderSideBySideWithHighlights(oldText: string, newText: string): string {
    const a = tokenizeForDiff(oldText);
    const b = tokenizeForDiff(newText);

    // safety: ako je preveliko, nemoj diff (samo plain side-by-side)
    const MAX_TOKENS = 8000;
    if (a.length + b.length > MAX_TOKENS) {
        return `
          <div class="preview-grid">
            <div class="preview-pane">
              <div class="preview-pane-title">Pre</div>
              <div class="preview-pane-body">${escapeHtml(normalizeNewlines(oldText))}</div>
            </div>
            <div class="preview-pane">
              <div class="preview-pane-title">Posle</div>
              <div class="preview-pane-body">${escapeHtml(normalizeNewlines(newText))}</div>
            </div>
          </div>
        `;
    }

    const ops = myersDiff(a, b);

    let left = "";
    let right = "";

    for (const op of ops) {
        const v = op.value;

        if (op.type === "equal") {
            left += escapeHtml(v);
            right += escapeHtml(v);
            continue;
        }

        // whitespace nikad ne obojimo
        const wrap = !isWhitespaceToken(v);

        if (op.type === "delete") {
            left += wrap ? `<span class="diff-removed">${escapeHtml(v)}</span>` : escapeHtml(v);
            // na desnoj strani ništa
            continue;
        }

        // insert
        right += wrap ? `<span class="diff-added">${escapeHtml(v)}</span>` : escapeHtml(v);
    }

    return `
      <div class="preview-grid">
        <div class="preview-pane">
          <div class="preview-pane-title">Pre</div>
          <div class="preview-pane-body">${left}</div>
        </div>
        <div class="preview-pane">
          <div class="preview-pane-title">Posle</div>
          <div class="preview-pane-body">${right}</div>
        </div>
      </div>
    `;
}

function generateDiffHtml(oldText: string, newText: string): string {
    if (oldText === newText) {
        return `<div class="preview-single-pane" style="text-align:center; padding:20px;">Nema izmena u tekstu.</div>`;
    }

    const splitRegex = /([^\s\w\u0400-\u04FF\u0100-\u017F]+|\s+)/;
    const oldParts = oldText.split(splitRegex).filter(Boolean);
    const newParts = newText.split(splitRegex).filter(Boolean);

    const isWs = (s: string) => /^\s+$/u.test(s);

    let html = "";
    const maxLen = Math.max(oldParts.length, newParts.length);

    for (let k = 0; k < maxLen; k++) {
        const o = oldParts[k] || "";
        const n = newParts[k] || "";

        if (o === n) {
            html += escapeHtml(n);
            continue;
        }

        if (isWs(o) || isWs(n)) {
            html += escapeHtml(n);
            continue;
        }

        html += `<span class="diff-changed" title="Original: ${escapeHtml(o)}">${escapeHtml(n)}</span>`;
    }

    return `<div class="preview-single-pane">${html}</div>`;
}