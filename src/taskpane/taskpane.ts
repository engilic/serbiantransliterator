/* global Word, Office, document, window, console, Blob, URL, FileReader, DOMParser */

import "./taskpane.css";

import { convertOoxml, OoxmlOptions } from "../shared/ooxml/convertOoxml";
import { convertPlainText, Direction } from "../core/textCore";
import { removeMultipleSpaces } from "../core/utils";
import { createInitialCodeState, transformTextRespectingCode } from "../shared/ooxml/code";
import { formatSerbianDates, toAscii } from "../core/format";
import { myersDiff, type DiffOp } from "../shared/diff";
import { html, unsafeHtml, unwrapHtml, escapeHtml, type SafeHtml } from "../shared/safeHtml";

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

let selectionTimeout: ReturnType<typeof setTimeout> | null = null;
let isApplyingProfile = false;

let selectionChangeHandler: (() => void) | null = null;

// --- PREVIEW STATE ---
const PREVIEW_BATCH = 20;

// --- PREVIEW STATE (TIPIZIRANO) ---

interface PreviewState {
    scope: "selection" | "document";
    settingsSnap: UiSettings | null;
    mode: "diff" | "plain" | "side";
    typeText: string;
    titleText: string;
    original: string;
    converted: string;
    allParagraphs: string[];
    shownCount: number;
    canLoadMore: boolean;
    toastTimer: number | null;

    // Cache
    convertedOoxml: string | null;
    ooxmlOptsSnapJson: string | null;
    selectionTextHash: string | null;
    cacheTimestamp: number | null;
}

const PREVIEW_CACHE_TTL_MS = 30_000;

const previewState: PreviewState = {
    scope: "selection",
    settingsSnap: null,
    mode: "diff",
    typeText: "",
    titleText: "",
    original: "",
    converted: "",
    allParagraphs: [],
    shownCount: 0,
    canLoadMore: false,
    toastTimer: null,
    convertedOoxml: null,
    ooxmlOptsSnapJson: null,
    selectionTextHash: null,
    cacheTimestamp: null,
};

function invalidatePreviewCache() {
    previewState.convertedOoxml = null;
    previewState.ooxmlOptsSnapJson = null;
    previewState.selectionTextHash = null;
    previewState.cacheTimestamp = null;
}

function isPreviewCacheValid(): boolean {
    if (!previewState.convertedOoxml || !previewState.cacheTimestamp) return false;

    const age = Date.now() - previewState.cacheTimestamp;
    return age < PREVIEW_CACHE_TTL_MS;
}

// --- INIT ---

Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        initUi();

        // Wrapper da bi imali referencu za removeHandlerAsync
        selectionChangeHandler = () => {
            onSelectionChange();
        };

        Office.context.document.addHandlerAsync(
            Office.EventType.DocumentSelectionChanged,
            selectionChangeHandler
        );

        checkSelectionAndUpdateButtons();

        // Cleanup event handler na unload
        window.addEventListener("beforeunload", () => {
            cleanupEventHandlers();
        });
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
            unsafeHtml("Ovo će vratiti opcije na fabričke vrednosti.<br><br>Vaše zaštićene reči <b>neće</b> biti obrisane.<br><br>Da li želite da nastavite?")
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
    invalidatePreviewCache();

    if (selectionTimeout) clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => checkSelectionAndUpdateButtons(), 50);
}

function getSelectedTextAsync(): Promise<string> {
    return new Promise((resolve, reject) => {
        Office.context.document.getSelectedDataAsync(
            Office.CoercionType.Text,
            (result) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve(String(result.value ?? ""));
                } else {
                    reject(result.error);
                }
            }
        );
    });
}

async function checkSelectionAndUpdateButtons() {
    try {
        const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
        const prevBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;
        if (!runBtn || !prevBtn) return;

        const rawText = normalizeWeirdBreaks(await getSelectedTextAsync());
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
    } catch {
        // best-effort: ako Office API ne vrati selekciju (npr. neka non-text selekcija), ne ruši UI
    }
}

// --- APPLY TO WORD (OOXML) ---

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

    type OoxmlResult = ReturnType<Word.Range["getOoxml"]>;
    type Req = { range: Word.Range; ooxml: OoxmlResult };
    const reqs: Req[] = [];

    // 1) Batch: prikupi sve getOoxml pozive (bez sync u petlji)
    for (const sec of sections.items) {
        for (const t of types) {
            // HEADER
            try {
                const r = sec.getHeader(t).getRange();
                const o = r.getOoxml();
                reqs.push({ range: r, ooxml: o });
            } catch {
                // ignore
            }

            // FOOTER
            try {
                const r = sec.getFooter(t).getRange();
                const o = r.getOoxml();
                reqs.push({ range: r, ooxml: o });
            } catch {
                // ignore
            }
        }
    }

    // 2) Jedan sync da dobijemo sve .value
    await context.sync();

    // 3) Lokalna konverzija + queue insert (bez sync u petlji)
    for (const req of reqs) {
        const xmlIn = req.ooxml.value;
        if (!xmlIn) continue;

        const res = convertOoxml(xmlIn, opts);
        if (res.type === "Nema teksta") continue;

        req.range.insertOoxml(res.xml, Word.InsertLocation.replace);
        processed++;
    }

    // 4) Jedan sync da se sve primeni
    if (processed > 0) {
        await context.sync();
    }

    return processed;
}

async function processNotes(
    context: Word.RequestContext,
    opts: OoxmlOptions,
    kind: "footnotes" | "endnotes"
): Promise<{ processed: number; supported: boolean }> {
    let processed = 0;

    // Type assertion za Office API koji TypeScript ne prepoznaje
    const docAny = context.document as {
        footnotes?: { load: (props: string) => void; items: unknown[] };
        endnotes?: { load: (props: string) => void; items: unknown[] };
    };
    const bodyAny = context.document.body as {
        footnotes?: { load: (props: string) => void; items: unknown[] };
        endnotes?: { load: (props: string) => void; items: unknown[] };
    };

    const coll = bodyAny?.[kind] ?? docAny?.[kind];
    if (!coll || typeof coll.load !== "function") {
        return { processed: 0, supported: false };
    }

    coll.load("items");
    await context.sync();

    type OoxmlResult = ReturnType<Word.Range["getOoxml"]>;
    type Req = { range: Word.Range; ooxml: OoxmlResult };
    const reqs: Req[] = [];

    // 1) Batch prikupi getOoxml (bez sync u petlji)
    const items: unknown[] = coll.items ?? [];
    for (const item of items) {
        let r: Word.Range | null = null;

        try {
            // Type guard za properties
            const itemWithRange = item as {
                getRange?: () => Word.Range;
                body?: { getRange?: (type: string) => Word.Range };
                contentRange?: Word.Range;
            };

            if (typeof itemWithRange.getRange === "function") {
                r = itemWithRange.getRange();
            } else if (itemWithRange.body && typeof itemWithRange.body.getRange === "function") {
                r = itemWithRange.body.getRange("Whole");
            } else if (itemWithRange.contentRange) {
                r = itemWithRange.contentRange;
            }
        } catch {
            r = null;
        }

        if (!r) continue;

        try {
            const o = r.getOoxml();
            reqs.push({ range: r, ooxml: o });
        } catch {
            // ignore
        }
    }

    // 2) Jedan sync da dobijemo sve .value
    await context.sync();

    // 3) Konverzija + queue insert
    for (const req of reqs) {
        const xmlIn = req.ooxml.value;
        if (!xmlIn) continue;

        const res = convertOoxml(xmlIn, opts);
        if (res.type === "Nema teksta") continue;

        req.range.insertOoxml(res.xml, Word.InsertLocation.replace);
        processed++;
    }

    // 4) Jedan sync za primenu
    if (processed > 0) {
        await context.sync();
    }

    return { processed, supported: true };
}

type OoxmlConvertResult = ReturnType<typeof convertOoxml>;

type ExtrasSummary = {
    headersFootersProcessed: number;
    footnotesProcessed: number;
    endnotesProcessed: number;
    footnotesSupported: boolean;
    endnotesSupported: boolean;
};

function emptyExtrasSummary(): ExtrasSummary {
    return {
        headersFootersProcessed: 0,
        footnotesProcessed: 0,
        endnotesProcessed: 0,
        footnotesSupported: true,
        endnotesSupported: true,
    };
}

async function applyExtrasIfEnabled(
    context: Word.RequestContext,
    ui: UiSettings,
    opts: OoxmlOptions
): Promise<ExtrasSummary> {
    const summary = emptyExtrasSummary();

    if (ui.includeHeadersFooters) {
        try {
            setStatus("Obrada: zaglavlja/podnožja...", "info");
            summary.headersFootersProcessed = await processHeadersFooters(context, opts);
        } catch (e) {
            console.warn("Header/Footer obrada nije uspela:", e);
        }
    }

    if (ui.includeFootnotes) {
        try {
            setStatus("Obrada: fusnote...", "info");
            const r = await processNotes(context, opts, "footnotes");
            summary.footnotesProcessed = r.processed;
            summary.footnotesSupported = r.supported;
        } catch (e) {
            console.warn("Footnotes obrada nije uspela:", e);
        }
    }

    if (ui.includeEndnotes) {
        try {
            setStatus("Obrada: endnote...", "info");
            const r = await processNotes(context, opts, "endnotes");
            summary.endnotesProcessed = r.processed;
            summary.endnotesSupported = r.supported;
        } catch (e) {
            console.warn("Endnotes obrada nije uspela:", e);
        }
    }

    return summary;
}

async function applyRangeWithOoxmlConversion(
    context: Word.RequestContext,
    range: Word.Range,
    opts: OoxmlOptions
): Promise<OoxmlConvertResult | null> {
    setStatus("Obrada u toku...", "info");

    const ooxml = range.getOoxml();
    await context.sync();

    const result = convertOoxml(ooxml.value, opts);
    if (result.type === "Nema teksta") return null;

    range.insertOoxml(result.xml, Word.InsertLocation.replace);
    await context.sync();

    return result;
}

async function applyPipeline(
    context: Word.RequestContext,
    scope: "selection" | "document",
    ui: UiSettings,
    opts: OoxmlOptions
): Promise<{ result: OoxmlConvertResult | null; extras: ExtrasSummary }> {

    if (scope === "selection") {
        const range = context.document.getSelection();
        range.load("text");
        await context.sync();

        const rawText = range.text ?? "";
        const hasText = rawText.trim().length > 0;
        const isJustWhitespace = rawText.length > 0 && !hasText;

        if (!hasText) {
            showModalInfo("Greška", unsafeHtml("Nema selekcije za preslovljavanje."));
            return { result: null, extras: emptyExtrasSummary() };
        }
        if (isJustWhitespace) {
            showModalInfo("Greška", unsafeHtml("Selektovan je samo prazan prostor (razmaci)."));
            return { result: null, extras: emptyExtrasSummary() };
        }

        const result = await applyRangeWithOoxmlConversion(context, range, opts);
        return { result, extras: emptyExtrasSummary() };
    }

    // scope === "document"
    const extras = await applyExtrasIfEnabled(context, ui, opts);

    if (ui.includeFootnotes && !extras.footnotesSupported) {
        showModalInfo(
            "Napomena",
            unsafeHtml("Fusnote nisu dostupne za automatsku obradu u ovom Word okruženju. " +
                "I dalje možeš da selektuješ tekst u fusnoti i klikneš PRESLOVI.")
        );
    }

    if (ui.includeEndnotes && !extras.endnotesSupported) {
        showModalInfo(
            "Napomena",
            unsafeHtml("Endnote nisu dostupne za automatsku obradu u ovom Word okruženju. " +
                "I dalje možeš da selektuješ tekst u endnoti i klikneš PRESLOVI.")
        );
    }

    const bodyRange = context.document.body.getRange("Whole");
    const result = await applyRangeWithOoxmlConversion(context, bodyRange, opts);
    return { result, extras };
}

async function runSmart() {
    try {
        await Word.run(async (context) => {
            // odredi scope na osnovu selekcije (kao pre)
            const sel = context.document.getSelection();
            sel.load("text");
            await context.sync();

            const selectionText = sel.text ?? "";
            const hasSelectionText = selectionText.trim().length > 0;
            const isJustWhitespace = selectionText.length > 0 && !hasSelectionText;

            if (isJustWhitespace) {
                showModalInfo(
                    "Greška",
                    unsafeHtml("Selektovan je samo prazan prostor (razmaci).<br>Molimo selektujte tekst ili ne selektujte ništa za ceo dokument.")
                );
                setStatus("Greška: Prazna selekcija.", "error");
                return;
            }

            const ui = getSettingsFromUi();
            const opts = getOoxmlOptionsFromUi();

            const scope: "selection" | "document" = hasSelectionText ? "selection" : "document";

            if (scope === "document" && ui.confirmWholeDoc) {
                const ok = await confirmInPanel(
                    unsafeHtml("Nije selektovan tekst.<br/>Da li želite da preslovite <b>CEO dokument</b>?")
                );
                if (!ok) {
                    setStatus("Otkazano.", "neutral");
                    return;
                }
            }

            const { result, extras } = await applyPipeline(context, scope, ui, opts);

            if (!result) {
                setStatus("Nije pronađen tekst za obradu.", "neutral");
                return;
            }

            const time = result.stats.timingMs.toFixed(0);
            const hfInfo = scope === "document" && extras.headersFootersProcessed > 0
                ? ` | H/F: ${extras.headersFootersProcessed}`
                : "";

            setStatus(`Završeno: ${result.type} (${time}ms)${hfInfo}`, "success");

            lastStatsTitle = `Statistika: ${result.type}`;
            lastStatsText =
                `Opseg: ${scope === "selection" ? "Selekcija" : "Ceo dokument"}\n` +
                `Promenjeno čvorova: ${result.stats.textNodes}\n` +
                `Vreme: ${time}ms` +
                (scope === "document"
                    ? `\nHeader/Footer: ${extras.headersFootersProcessed}\nFusnote: ${extras.footnotesProcessed}\nEndnote: ${extras.endnotesProcessed}`
                    : "");

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
            const ui = getSettingsFromUi();
            const opts = getOoxmlOptionsFromUi();

            // =========================
            // SELECTION: pokušaj cache apply (1:1 sa preview)
            // =========================
            if (scope === "selection") {
                const range = context.document.getSelection();
                range.load("text");
                await context.sync();

                const rawText = range.text ?? "";
                const hasText = rawText.trim().length > 0;
                const isJustWhitespace = rawText.length > 0 && !hasText;

                if (!hasText) {
                    showModalInfo("Greška", unsafeHtml("Nema selekcije za preslovljavanje."));
                    return;
                }

                if (isJustWhitespace) {
                    showModalInfo("Greška", unsafeHtml("Selektovan je samo prazan prostor (razmaci)."));
                    return;
                }

                // Stabilan fingerprint: hash nad TEKSTOM selekcije (ne OOXML)
                const normApply = normalizeForSelectionHash(rawText);
                const currentSelectionHash = await sha256Hex(normApply);

                // cache važi samo ako:
                // - imamo cached converted OOXML
                // - opcije su iste kao u preview-u
                // - tekst selekcije je isti kao u preview-u
                if(previewState.convertedOoxml && previewState.ooxmlOptsSnapJson && previewState.selectionTextHash) {
                    const currentJson = JSON.stringify(opts);

                    if (currentJson === previewState.ooxmlOptsSnapJson && isPreviewCacheValid()) {
                        if (currentSelectionHash === previewState.selectionTextHash) {
                            setStatus("Primena pregleda (bez ponovne konverzije)...", "info");

                            range.insertOoxml(previewState.convertedOoxml, Word.InsertLocation.replace);
                            await context.sync();

                            setStatus("Završeno (primenjen preview).", "success");

                            lastStatsTitle = "Statistika: primenjen preview";
                            lastStatsText =
                                `Opseg: Selekcija\n` +
                                `Napomena: primenjen je OOXML iz pregleda (bez ponovne konverzije).`;

                            refreshStats();
                            return;
                        }

                        // selekcija nije ista ili cache je istekao -> ne koristimo cache
                        invalidatePreviewCache();
                        showModalInfo(
                            "Cache je nevažeći",
                            unsafeHtml("Ne mogu da primenim sačuvani preview (selekcija je promenjena ili je cache istekao). Pokrećem ponovnu konverziju.")
                        );
                        // nastavlja dalje na fallback pipeline
                    }
                }

                // fallback: ponovna konverzija selekcije
                const { result } = await applyPipeline(context, "selection", ui, opts);

                if (!result) {
                    setStatus("Nije pronađen tekst za obradu.", "neutral");
                    return;
                }

                const time = result.stats.timingMs.toFixed(0);
                setStatus(`Završeno: ${result.type} (${time}ms)`, "success");

                lastStatsTitle = `Statistika: ${result.type}`;
                lastStatsText =
                    `Opseg: Selekcija\n` +
                    `Promenjeno čvorova: ${result.stats.textNodes}\n` +
                    `Vreme: ${time}ms`;

                refreshStats();
                return;
            }

            // =========================
            // DOCUMENT: koristi pipeline
            // =========================
            const { result, extras } = await applyPipeline(context, "document", ui, opts);

            if (!result) {
                setStatus("Nije pronađen tekst za obradu.", "neutral");
                return;
            }

            const time = result.stats.timingMs.toFixed(0);
            const hfInfo =
                extras.headersFootersProcessed > 0 ? ` | H/F: ${extras.headersFootersProcessed}` : "";

            setStatus(`Završeno: ${result.type} (${time}ms)${hfInfo}`, "success");

            lastStatsTitle = `Statistika: ${result.type}`;
            lastStatsText =
                `Opseg: Ceo dokument\n` +
                `Promenjeno čvorova: ${result.stats.textNodes}\n` +
                `Vreme: ${time}ms\n` +
                `Header/Footer: ${extras.headersFootersProcessed}\n` +
                `Fusnote: ${extras.footnotesProcessed}\n` +
                `Endnote: ${extras.endnotesProcessed}`;

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

function fnv1a32(str: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
}

async function sha256Hex(str: string): Promise<string> {
    try {
        const cryptoAny = (globalThis as typeof globalThis & { crypto?: { subtle?: SubtleCrypto } }).crypto;
        if (!cryptoAny?.subtle) return fnv1a32(str);

        const enc = new TextEncoder();
        const buf = await cryptoAny.subtle.digest("SHA-256", enc.encode(str));
        const bytes = new Uint8Array(buf);
        return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
        return fnv1a32(str);
    }
}

function normalizeWeirdBreaks(s: string): string {
    return (s ?? "").replace(/\u000b/g, "\n").replace(/\u000c/g, "\n");
}

function normalizeNewlines(s: string): string {
    return normalizeWeirdBreaks(s).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function normalizeForSelectionHash(s: string): string {
    let t = normalizeNewlines(s ?? "").normalize("NFC");

    // Word zna da ubaci "end-of-cell" marker u tabelama
    t = t.replace(/\u0007/g, "");

    // često varira da li vraća završni paragraph mark ili newline
    t = t.replace(/\n+$/g, "");

    return t;
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
                showModalInfo("Greška", unsafeHtml("Selektovan je samo prazan prostor."));
                setStatus("Greška: Prazna selekcija.", "error");
                return;
            }

            const settings = getSettingsFromUi();
            previewState.settingsSnap = JSON.parse(JSON.stringify(settings));

            previewState.allParagraphs = [];
            previewState.shownCount = 0;
            previewState.canLoadMore = false;

            // =========================
            // PREVIEW: SELECTION (OOXML)
            // =========================
            if (hasSelectionText) {
                previewState.scope = "selection";

                // Stabilan fingerprint za cache apply: hash nad TEKSTOM selekcije
                const normPreview = normalizeForSelectionHash(selectionText);
                previewState.selectionTextHash = await sha256Hex(normPreview);

                const ooxml = range.getOoxml();
                await context.sync();

                const originalOoxml = ooxml.value;
                const opts = getOoxmlOptionsFromUi();

                const origText = extractTextFromWordOoxml(originalOoxml);

                const converted = convertOoxml(originalOoxml, opts);

                // cache za apply (samo za selekciju)
                previewState.convertedOoxml = converted.xml;
                previewState.ooxmlOptsSnapJson = JSON.stringify(opts);
                previewState.cacheTimestamp = Date.now();

                const convText = extractTextFromWordOoxml(converted.xml);

                const a = normalizeNewlines(origText);
                const b = normalizeNewlines(convText);

                if (!b.trim()) {
                    showModalInfo("Greška", unsafeHtml("Pregled nije uspeo: rezultat je prazan tekst."));
                    setStatus("Greška: Prazan rezultat pregleda.", "error");
                    return;
                }

                if (a === b) {
                    showModalInfo("Nema izmena", unsafeHtml("Tekst je već u traženom pismu ili nema šta da se menja."));
                    setStatus("Nema izmena.", "neutral");
                    return;
                }

                previewState.mode = "diff";
                previewState.typeText = converted.type;
                previewState.titleText = `Selektovani tekst (${converted.type})`;
                previewState.original = origText;
                previewState.converted = convText;

                showPreviewModal();
                setStatus(`Prikazan pregled (${converted.type})`, "success");
                return;
            }

            // =========================
            // PREVIEW: WHOLE DOC (plain text, first N paragraphs)
            // =========================
            previewState.scope = "document";

            // u document modu ne koristimo selection cache
            invalidatePreviewCache();

            const body = context.document.body;
            body.load("text");
            await context.sync();

            const full = normalizeWeirdBreaks(body.text ?? "");
            let paragraphs = full.split(/\r/);
            if (paragraphs.length === 1) paragraphs = full.split(/\n/);
            if (paragraphs.length === 1) paragraphs = [full];

            while (paragraphs.length && !paragraphs[paragraphs.length - 1]!.trim()) paragraphs.pop();

            previewState.allParagraphs = paragraphs;
            previewState.shownCount = Math.min(PREVIEW_BATCH, paragraphs.length);
            previewState.canLoadMore = previewState.shownCount < paragraphs.length;

            const textToPreview = paragraphs.slice(0, previewState.shownCount).join("\n");
            if (!textToPreview.trim()) {
                setStatus("Dokument je prazan.", "neutral");
                return;
            }

            const { out: finalText, type } = convertTextForPreviewPlain(textToPreview, previewState.settingsSnap!);

            const a = normalizeNewlines(textToPreview);
            const b = normalizeNewlines(finalText);

            if (!b.trim()) {
                showModalInfo("Greška", unsafeHtml("Pregled nije uspeo: rezultat je prazan tekst."));
                setStatus("Greška: Prazan rezultat pregleda.", "error");
                return;
            }

            if (a === b) {
                showModalInfo("Nema izmena", unsafeHtml("Tekst je već u traženom pismu ili nema šta da se menja."));
                setStatus("Nema izmena.", "neutral");
                return;
            }

            previewState.mode = "diff";
            previewState.typeText = type;
            previewState.titleText = `Prvih ${previewState.shownCount} paragrafa (${type})`;
            previewState.original = textToPreview;
            previewState.converted = finalText;

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
    if (!previewState.settingsSnap) return;
    if (!previewState.allParagraphs.length) return;
    if (!previewState.canLoadMore) return;

    previewState.shownCount = Math.min(previewState.allParagraphs.length, previewState.shownCount + PREVIEW_BATCH);
    previewState.canLoadMore = previewState.shownCount < previewState.allParagraphs.length;

    previewState.titleText = `Prvih ${previewState.shownCount} paragrafa (${previewState.typeText})`;

    const newOriginal = previewState.allParagraphs.slice(0, previewState.shownCount).join("\n");
    previewState.original = newOriginal;

    const { out: newConverted } = convertTextForPreviewPlain(newOriginal, previewState.settingsSnap);
    previewState.converted = newConverted;

    const titleEl = document.getElementById("previewState.titleText");
    if (titleEl) titleEl.textContent = previewState.titleText;

    const okBtn = document.getElementById("modalOk") as HTMLButtonElement | null;
    if (okBtn) setLoadMoreButtonState(okBtn, previewState.canLoadMore);

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

    const orig = normalizeNewlines(previewState.original);
    const conv = normalizeNewlines(previewState.converted);

    if (previewState.mode === "plain") {
        holder.innerHTML = `<div class="preview-text-pane preview-single-pane">${escapeHtml(conv)}</div>`;
    } else if (previewState.mode === "side") {
        holder.innerHTML = renderSideBySideWithHighlights(orig, conv);
    } else {
        holder.innerHTML = generateDiffHtml(orig, conv);
    }

    const btnDiff = document.getElementById("previewBtnDiff") as HTMLButtonElement | null;
    const btnPlain = document.getElementById("previewBtnPlain") as HTMLButtonElement | null;
    const btnSide = document.getElementById("previewBtnSide") as HTMLButtonElement | null;

    if (btnDiff) btnDiff.disabled = previewState.mode === "diff";
    if (btnPlain) btnPlain.disabled = previewState.mode === "plain";
    if (btnSide) btnSide.disabled = previewState.mode === "side";
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
      <div id="previewStickyHeader" class="preview-sticky-header">
        <div class="preview-header-row">
          <div id="previewState.titleText" class="preview-title">
            ${escapeHtml(previewState.titleText)}
          </div>

          <div class="preview-header-right">
            <button id="previewCloseBtn"
                    class="icon-btn preview-close-btn"
                    type="button"
                    aria-label="Zatvori"
                    title="Zatvori">
              ×
            </button>

            <div id="previewToast" class="preview-toast" role="status" aria-live="polite"></div>

            <div class="preview-header-buttons">
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
        previewState.mode = "diff";
        renderPreviewMode();
    };

    bPlain.onclick = () => {
        previewState.mode = "plain";
        renderPreviewMode();
    };

    bSide.onclick = () => {
        previewState.mode = "side";
        renderPreviewMode();
    };

    bCopy.onclick = async () => {
        const ok = await copyToClipboard(previewState.converted ?? "");
        if (ok) showPreviewToast("Kopirano", "success");
        else showPreviewToast("Ne mogu da kopiram", "error", 2200);
    };

    // inicijalno
    if (previewState.mode !== "diff" && previewState.mode !== "plain" && previewState.mode !== "side") previewState.mode = "diff";
    renderPreviewMode();

    // Dole: PRESLOVI + Učitaj još. "Zatvori" sakriven jer postoji X gore.
    cancelBtn.style.display = "none";

    okBtn.style.display = "inline-flex";
    okBtn.innerText = "Učitaj još";
    okBtn.style.backgroundColor = "var(--bg-color)";
    okBtn.style.color = "var(--primary-color)";
    okBtn.style.border = "1px solid var(--input-border)";

    if (previewState.scope === "document") {
        setLoadMoreButtonState(okBtn, previewState.canLoadMore);
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
            await applyFromPreview(previewState.scope);
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
    invalidatePreviewCache();
    input.value = "";
    addBtn.disabled = true;

    renderTags();
    switchToCustomIfManual();
    updateUiState();
}

function removeTag(word: string, type: "custom" | "preset") {
    if (type === "custom") customWordsSet.delete(word);
    else presetWordsSet.delete(word);

    invalidatePreviewCache();

    renderTags();
    switchToCustomIfManual();
    updateUiState();
}

function clearTags(scope: "custom" | "preset" | "all") {
    if (scope === "custom" || scope === "all") customWordsSet.clear();
    if (scope === "preset" || scope === "all") presetWordsSet.clear();

    invalidatePreviewCache();

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
    invalidatePreviewCache();

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
            const affectsConversion = id !== "optShowStats";
            if (affectsConversion) invalidatePreviewCache();

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

    refreshStats();
    updateResetButtonState();
}

function updateResetButtonState() {
    const current = getSettingsFromUi();

    // userWordsCustom se IGNORIŠE jer reset ne briše "Moje zaštićene reči"
    const keys: Array<keyof UiSettings> = [
        "profile",
        "direction",
        "confirmWholeDoc",
        "includeHeadersFooters",
        "includeFootnotes",
        "includeEndnotes",
        "protectBrands",
        "applySerbianQuotes",
        "preserveCodeBlocks",
        "protectRomans",
        "setProofingLanguage",
        "fixDoubleSpaces",
        "formatDates",
        "showStats",
    ];

    const mismatches = keys.filter((k) => current[k] !== DEFAULT_SETTINGS[k]);
    const isSame = mismatches.length === 0;

    const btn = document.getElementById("resetBtn") as HTMLButtonElement | null;
    if (!btn) return;

    btn.disabled = isSame;
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
    refreshStats();
    updateResetButtonState();
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

function getOoxmlOptionsFromUi(): OoxmlOptions {
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
            invalidatePreviewCache();
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

/**
 * Kopira tekst u clipboard koristeći moderan Clipboard API.
 * Fallback za stare browsere koji ne podržavaju Clipboard API.
 */
async function copyToClipboard(text: string): Promise<boolean> {
    // 1. Pokušaj moderan Clipboard API (Chrome 66+, Edge 79+, Firefox 63+)
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Clipboard API failed - možda permissions denied ili nije dostupan
        console.warn("Clipboard API failed:", err);
    }

    // 2. Fallback: Selection API (bez execCommand)
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
        ta.style.pointerEvents = "none";

        document.body.appendChild(ta);

        // Focus i select
        ta.focus();
        ta.select();

        // Range selection za maksimalnu kompatibilnost
        const range = document.createRange();
        range.selectNodeContents(ta);
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }

        ta.setSelectionRange(0, text.length);

        // Trigger copy event (moderna alternativa execCommand)
        let success = false;
        try {
            const copyEvent = new ClipboardEvent('copy', {
                bubbles: true,
                cancelable: true,
                clipboardData: new DataTransfer()
            });
            copyEvent.clipboardData?.setData('text/plain', text);
            success = document.dispatchEvent(copyEvent);
        } catch {
            // ClipboardEvent nije podržan, korisnik mora ručno Ctrl+C
            success = false;
        }

        document.body.removeChild(ta);
        return success;
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

    if (previewState.toastTimer) window.clearTimeout(previewState.toastTimer);
    previewState.toastTimer = window.setTimeout(() => {
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

/* =========================
   MODAL SYSTEM
   ========================= */

let modalPromiseResolver: ((val: boolean) => void) | null = null;

function confirmInPanel(safeHtmlMsg: SafeHtml): Promise<boolean> {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const text = document.getElementById("modalText") as HTMLDivElement;
    const input = document.getElementById("modalInput") as HTMLTextAreaElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;

    title.style.display = "";
    cancelBtn.style.display = "inline-flex";

    title.innerText = "Potvrda";
    text.innerHTML = unwrapHtml(safeHtmlMsg); // ← TYPE-SAFE unwrap
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

function showModalInfo(titleStr: string, safeHtmlMsg: SafeHtml) {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const text = document.getElementById("modalText") as HTMLDivElement;
    const input = document.getElementById("modalInput") as HTMLTextAreaElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;

    title.style.display = "";
    cancelBtn.style.display = "inline-flex";

    title.innerText = titleStr;
    text.innerHTML = unwrapHtml(safeHtmlMsg); // ← TYPE-SAFE unwrap
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

function tokenizeForDiff(text: string): string[] {
    // isti split kao tvoj generateDiffHtml
    const splitRegex = /([^\s\w\u0400-\u04FF\u0100-\u017F]+|\s+)/;
    return normalizeNewlines(text).split(splitRegex).filter(Boolean);
}

function isWhitespaceToken(s: string): boolean {
    return /^\s+$/u.test(s);
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
              <div class="preview-text-pane preview-pane-body">${escapeHtml(normalizeNewlines(oldText))}</div>
            </div>
            <div class="preview-pane">
              <div class="preview-pane-title">Posle</div>
              <div class="preview-text-pane preview-pane-body">${escapeHtml(normalizeNewlines(newText))}</div>
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
            continue;
        }

        // insert
        right += wrap ? `<span class="diff-added">${escapeHtml(v)}</span>` : escapeHtml(v);
    }

    return `
      <div class="preview-grid">
        <div class="preview-pane">
          <div class="preview-pane-title">Pre</div>
          <div class="preview-text-pane preview-pane-body">${left}</div>
        </div>
        <div class="preview-pane">
          <div class="preview-pane-title">Posle</div>
          <div class="preview-text-pane preview-pane-body">${right}</div>
        </div>
      </div>
    `;
}

function generateDiffHtml(oldText: string, newText: string): string {
    const oldN = normalizeNewlines(oldText);
    const newN = normalizeNewlines(newText);

    if (oldN === newN) {
        return `<div class="preview-text-pane preview-single-pane preview-no-changes">Nema izmena u tekstu.</div>`;
    }

    const a = tokenizeForDiff(oldN);
    const b = tokenizeForDiff(newN);

    // safety: ako je preveliko, nemoj Myers (sporije); prikaži samo rezultat
    const MAX_TOKENS = 8000;
    if (a.length + b.length > MAX_TOKENS) {
        return `<div class="preview-text-pane preview-single-pane">${escapeHtml(newN)}</div>`;
    }

    const ops = myersDiff(a, b);

    let html = "";

    for (const op of ops) {
        const v = op.value;

        if (op.type === "equal") {
            html += escapeHtml(v);
            continue;
        }

        if (op.type === "delete") {
            // "Razlike" prikazuje rezultat; delete ne renderujemo
            continue;
        }

        // insert
        if (isWhitespaceToken(v)) {
            html += escapeHtml(v);
        } else {
            html += `<span class="diff-changed">${escapeHtml(v)}</span>`;
        }
    }

    return `<div class="preview-text-pane preview-single-pane">${html}</div>`;
}

/**
* Cleanup event handlers to prevent memory leaks.
* Called on window beforeunload.
*/
function cleanupEventHandlers() {
    if (selectionChangeHandler) {
        try {
            Office.context.document.removeHandlerAsync(
                Office.EventType.DocumentSelectionChanged,
                { handler: selectionChangeHandler }
            );
        } catch (e) {
            console.warn("Failed to remove selection change handler:", e);
        }
        selectionChangeHandler = null;
    }

    // Cleanup timeout ako postoji
    if (selectionTimeout) {
        clearTimeout(selectionTimeout);
        selectionTimeout = null;
    }
}