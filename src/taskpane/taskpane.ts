/* global Word, Office, document, window, console, Blob, URL, FileReader, DOMParser */

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
    showStats: boolean;
    direction: DirectionUi;
}

// --- KONSTANTE ---

const SETTINGS_KEY = "serbiantransliterator.settings.v2";

const DEFAULT_SETTINGS: UiSettings = {
    schemaVersion: 2,
    profile: "custom",
    userWordsCustom: [],
    protectBrands: true,
    applySerbianQuotes: true,
    preserveCodeBlocks: true,
    setProofingLanguage: true,
    protectRomans: true,
    fixDoubleSpaces: true,
    formatDates: true,
    confirmWholeDoc: true,
    showStats: false,
    direction: "auto",
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
            "Git", "GitHub", "GitLab", "Azure", "AWS", "GCP", "DevOps", "Docker", "Kubernetes", "CI/CD",
            "YAML", "REST", "GraphQL", "PowerShell", "VS Code", "Visual Studio", "Windows Server", "Linux",
            "SerbianTransliterator", "Python", "JavaScript", "Typescript", "Node.js", "React", "Angular", "Vue",
            "Frontend", "Backend", "Fullstack", "Database", "Cache", "Cookie", "Token", "API", "Endpoint",
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
            "SWIFT", "IBAN", "EUR", "USD", "RSD", "CHF", "GBP",
            "MasterCard", "Visa", "PayPal", "Intesa", "Raiffeisen", "OTP", "NLB", "AIK", "Erste", "UniCredit",
            "Western Union", "E-banking", "M-banking", "Leasing", "Factoring", "Equity", "Forex",
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
            "mg", "ml", "kg", "Covid", "SARS", "Hemofarm", "Galenika", "Pfizer", "Actavis", "Alkaloid",
            "Bayer", "Roche", "Stada", "Anamnesis", "Diagnosis", "Therapia", "CT", "MRI", "EKG", "EEG",
            "In vitro", "In vivo",
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
            "Facebook", "Instagram", "LinkedIn", "TikTok", "Twitter", "X", "YouTube", "Google",
            "SEO", "PR", "Copywriter", "Content", "Ads", "Influencer", "Giveaway", "Hashtag",
            "Story", "Reel", "Post", "Follow", "Like", "Share", "Subscribe", "Timeline", "Feed",
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
            "Ustav Republike Srbije", "Zakon o obligacionim odnosima", "Zakon o radu",
            "Ministarstvo pravde", "Privredni sud", "Advokatska komora Srbije", "Službeni glasnik",
            "Bona fide", "De facto", "Ex officio",
            "Copyright", "Trademark", "Disclaimer", "Policy", "Terms", "Conditions", "GDPR",
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
            "Reuters", "Associated Press", "BBC", "CNN", "Euronews", "N1", "RTS", "Tanjug",
            "NBA", "UEFA", "FIFA", "FIBA", "ATP", "WTA", "Olimpijske igre",
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
let previewMode: "diff" | "plain" = "diff";

let previewTypeText = "";
let previewTitleText = "";
let previewOriginal = "";
let previewConverted = "";

let previewSettingsSnap: UiSettings | null = null;
let previewAllParagraphs: string[] = [];
let previewShownCount = 0;
let previewCanLoadMore = false;

// --- INIT ---

Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        initUi();

        Office.context.document.addHandlerAsync(
            Office.EventType.DocumentSelectionChanged,
            onSelectionChange
        );

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
                range = context.document.body.getRange("Whole");
            }

            setStatus("Obrada u toku...", "info");

            const ooxml = range.getOoxml();
            await context.sync();

            const opts = getOoxmlOptionsFromUi();
            const result = convertOoxml(ooxml.value, opts);

            if (result.type === "Nema teksta") {
                setStatus("Nije pronađen tekst za obradu.", "neutral");
                return;
            }

            range.insertOoxml(result.xml, Word.InsertLocation.replace);
            await context.sync();

            const scope = hasText ? "Selekcija" : "Ceo dokument";
            const time = result.stats.timingMs.toFixed(0);

            setStatus(`Završeno: ${result.type} (${time}ms)`, "success");

            lastStatsTitle = `Statistika: ${result.type}`;
            lastStatsText = `Opseg: ${scope}\nPromenjeno čvorova: ${result.stats.textNodes}\nVreme: ${time}ms`;
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
                range = context.document.body.getRange("Whole");
            }

            setStatus("Obrada u toku...", "info");

            const ooxml = range.getOoxml();
            await context.sync();

            const opts = getOoxmlOptionsFromUi();
            const result = convertOoxml(ooxml.value, opts);

            if (result.type === "Nema teksta") {
                setStatus("Nije pronađen tekst za obradu.", "neutral");
                return;
            }

            range.insertOoxml(result.xml, Word.InsertLocation.replace);
            await context.sync();

            const time = result.stats.timingMs.toFixed(0);
            setStatus(`Završeno: ${result.type} (${time}ms)`, "success");
        });
    } catch (e) {
        console.error(e);
        setStatus("Greška: " + (e as Error).message, "error");
    }
}

/* =========================
   PREVIEW (SELECTION = OOXML 1:1)
   ========================= */

function normalizeWeirdBreaks(s: string): string {
    // Word ume da vrati vertical tab (U+000B) koji izgleda kao ""
    // i form feed (U+000C). U preview-u to normalizujemo na newline.
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

/**
 * Preview za ceo dokument ostaje plain-text (prvih N paragrafa),
 * ali pokušava da emulira OOXML pipeline za fixDoubleSpaces/formatDates tako što ne dira code blocks.
 */
function convertTextForPreviewPlain(input: string, s: UiSettings): { out: string; type: string } {
    let temp = normalizeWeirdBreaks(input);

    // emulate OOXML: fix spaces/dates samo van code blocks
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

/**
 * 1:1 extractor iz Word OOXML-a: pokušava da vrati tekst sa \n između paragrafa.
 * Podržava i <w:tab/> i <w:br/> ako postoje.
 */
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
        // fallback: samo svi w:t
        return Array.from(doc.getElementsByTagNameNS(W_NS, "t"))
            .map((n) => (n.textContent ?? ""))
            .join("");
    }

    const out: string[] = [];
    for (const p of paras) {
        out.push(walk(p));
    }
    return out.join("\n");
}

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

            // snapshot settings za preview
            const settings = getSettingsFromUi();
            previewSettingsSnap = JSON.parse(JSON.stringify(settings));

            // reset preview paging
            previewAllParagraphs = [];
            previewShownCount = 0;
            previewCanLoadMore = false;

            if (hasSelectionText) {
                // === SELECTION PREVIEW: OOXML 1:1 ===
                previewScope = "selection";

                const ooxml = range.getOoxml();
                await context.sync();

                const originalOoxml = ooxml.value;
                const opts = getOoxmlOptionsFromUi();

                // original text from original OOXML (da diff bude realniji)
                const origText = extractTextFromWordOoxml(originalOoxml);

                // converted OOXML via same pipeline as "PRESLOVI"
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

            // === WHOLE DOCUMENT PREVIEW: plain-text first N paragraphs ===
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
    } else {
        holder.innerHTML = generateDiffHtml(orig, conv);
    }

    const btnDiff = document.getElementById("previewBtnDiff") as HTMLButtonElement | null;
    const btnPlain = document.getElementById("previewBtnPlain") as HTMLButtonElement | null;
    if (btnDiff && btnPlain) {
        btnDiff.disabled = previewMode === "diff";
        btnPlain.disabled = previewMode === "plain";
    }
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

          <div style="display:flex; flex-direction:column; gap:6px; align-items:stretch; min-width:110px;">
            <button id="previewBtnDiff" class="mini-btn" type="button" title="Označi promene">Razlike</button>
            <button id="previewBtnPlain" class="mini-btn" type="button" title="Prikaži samo rezultat">Rezultat</button>
          </div>
        </div>
      </div>
    </div>

    <div id="previewHolder"></div>
  `;

    (document.getElementById("previewCloseBtn") as HTMLButtonElement).onclick = () => closeModal();

    const bDiff = document.getElementById("previewBtnDiff") as HTMLButtonElement;
    const bPlain = document.getElementById("previewBtnPlain") as HTMLButtonElement;

    bDiff.onclick = () => { previewMode = "diff"; renderPreviewMode(); };
    bPlain.onclick = () => { previewMode = "plain"; renderPreviewMode(); };

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
        okBtn.onclick = () => { /* no-op */ };
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
   TAGS
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
        type === "error"
            ? "var(--error-color)"
            : type === "success"
                ? "var(--success-color)"
                : "var(--text-color)";
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

    // restore default modal layout
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
   DIFF renderer
   ========================= */

function generateDiffHtml(oldText: string, newText: string): string {
    if (oldText === newText) {
        return `<div class="preview-single-pane" style="text-align:center; padding:20px;">Nema izmena u tekstu.</div>`;
    }

    const splitRegex = /([^\s\w\u0400-\u04FF\u0100-\u017F]+|\s+)/;
    const oldParts = oldText.split(splitRegex).filter(Boolean);
    const newParts = newText.split(splitRegex).filter(Boolean);

    let html = "";
    const maxLen = Math.max(oldParts.length, newParts.length);

    for (let k = 0; k < maxLen; k++) {
        const o = oldParts[k] || "";
        const n = newParts[k] || "";

        if (o === n) {
            html += escapeHtml(n);
        } else {
            html += `<span class="diff-changed" title="Original: ${escapeHtml(o)}">${escapeHtml(n)}</span>`;
        }
    }

    return `<div class="preview-single-pane">${html}</div>`;
}