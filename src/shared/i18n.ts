// src/shared/i18n.ts

export type TranslationKey = keyof typeof SR_RS;
export type Language = "sr" | "en";

// Trenutni aktivni jezik (default je srpski)
let currentLang: Language = "sr";

// === SRPSKI (Izvor) ===
const SR_RS = {
    // Statusi
    status_ready: "Spreman za rad.",
    status_generating_preview: "Generišem pregled...",
    status_processing: "Obrada u toku...",
    status_no_changes: "Nema izmena.",
    status_cancelled: "Otkazano.",
    status_empty_doc: "Dokument je prazan.",
    status_settings_saved: "Podešavanja vraćena (reči sačuvane).",
    status_settings_loaded: "Podešavanja uspešno učitana.",
    status_settings_error: "Greška: Neispravan fajl.",
    status_profile_changed: "Profil promenjen na: {0}",
    status_done_selection: "Završeno: {0} ({1}ms)",
    status_done_document: "Završeno: {0} ({1}ms){2}",
    status_preview_applied: "Završeno (primenjen preview).",
    status_error_prefix: "Greška: {0}",

    // PR2: dodatni status stringovi
    status_no_text_found: "Nije pronađen tekst za obradu.",
    status_processing_headers_footers: "Obrada: zaglavlja/podnožja...",
    status_processing_footnotes: "Obrada: fusnote...",
    status_processing_endnotes: "Obrada: endnote...",
    status_applying_preview: "Primena pregleda (bez ponovne konverzije)...",
    status_preview_cache_invalid: "Cache pregleda ne važi ({0}). Radim ponovnu konverziju...",

    // PR4: status posle otvaranja preview-a
    status_preview_shown: "Prikazan pregled ({0})",

    // PR5: document status extras
    status_extra_headers_footers: "H/F: {0}",
    status_extra_footnotes_na: "Fusnote: N/A",
    status_extra_endnotes_na: "Endnote: N/A",

    // Modali & Obaveštenja
    modal_title_confirm: "Potvrda",
    modal_title_error: "Greška",
    modal_title_info: "Nema izmena",

    // Dugmad
    btn_ok: "OK",
    btn_cancel: "Otkaži",
    btn_close: "Zatvori",
    btn_load_more: "Učitaj još",
    btn_apply: "PRESLOVI",

    // PR4: main taskpane buttons (dynamic labels)
    ui_btn_run: "PRESLOVI",
    ui_btn_preview: "PREGLED",
    ui_sub_no_text: "NEMA TEKSTA",
    ui_sub_run_selection: "selekciju",
    ui_sub_preview_selection: "selekcije",
    ui_sub_run_document: "ceo dokument",
    ui_sub_preview_document: "celog dokumenta",

    // Preview tabovi
    preview_btn_diff: "Razlike",
    preview_btn_plain: "Rezultat",
    preview_btn_side: "Pre/Posle",
    preview_btn_copy: "Kopiraj",

    // PR2: tooltip / fallback za "load more"
    preview_load_more_title: "Učitaj sledeće paragrafe",
    preview_load_more_none: "Nema više paragrafa za učitavanje",

    // PR3: diff/preview labele
    preview_label_before: "Pre",
    preview_label_after: "Posle",
    preview_label_too_large_diff: "Prevelik fajl za detaljan diff",
    preview_label_truncated_perf: "Prikaz skraćen zbog performansi",

    // Poruke
    msg_empty_selection:
        "Selektovan je samo prazan prostor (razmaci).<br>Molimo selektujte tekst ili ne selektujte ništa za ceo dokument.",
    msg_no_selection: "Nema selekcije za preslovljavanje.",
    msg_confirm_whole_doc: "Nije selektovan tekst.<br/>Da li želite da preslovite <b>CEO dokument</b>?",
    msg_reset_confirm:
        "Ovo će vratiti opcije na fabričke vrednosti.<br><br>Vaše zaštićene reči <b>neće</b> biti obrisane.<br><br>Da li želite da nastavite?",
    msg_preview_empty: "Pregled nije uspeo: rezultat je prazan tekst.",
    msg_preview_no_changes: "Tekst je već u traženom pismu ili nema šta da se menja.",
    msg_preview_scope_doc: "Dostupno samo kada pregledate ceo dokument",

    // Zaštita od velikih dokumenata
    msg_doc_too_large:
        "Dokument je prevelik za automatsku obradu (limit 5MB).<br>Molimo podelite ga na manje delove.",

    // Preview
    preview_title_selection: "Selektovani tekst ({0})",
    preview_title_doc: "Prvih {0} paragrafa ({1})",
    preview_diff_no_changes: "Nema izmena u tekstu.",
    preview_toast_copied: "Kopirano",
    preview_toast_copy_fail: "Ne mogu da kopiram",

    // Cache razlozi
    reason_opts_changed: "podešavanja su promenjena",
    reason_expired: "cache je istekao",
    reason_selection_changed: "selekcija je promenjena",
    reason_formatting_changed: "formatiranje/selekcija (OOXML) su promenjeni",
    reason_missing: "cache nije kompletan",
    reason_unknown: "nepoznat razlog",

    // Stats
    stats_scope_selection: "Selekcija",
    stats_scope_document: "Ceo dokument",
    stats_header_apply: "Statistika: {0}",
    stats_header_preview: "Statistika: primenjen preview",
    stats_note_preview: "Napomena: primenjen je OOXML iz pregleda (bez ponovne konverzije).",
    stats_footnotes_na: "Fusnote podržane: NE",
    stats_endnotes_na: "Endnote podržane: NE",

    // Profil imena
    profile_custom: "Ručno",
    profile_it: "IT / Tehnologija",
    profile_finance: "Finansije / Bankarstvo",
    profile_medical: "Medicina / Farmacija",
    profile_legal: "Pravo / Administracija",
    profile_marketing: "Marketing / Društvene mreže",
    profile_journalism: "Novinarstvo / Mediji",
};

// === ENGLESKI (Prevod) ===
const EN_US: Record<TranslationKey, string> = {
    // Statuses
    status_ready: "Ready.",
    status_generating_preview: "Generating preview...",
    status_processing: "Processing...",
    status_no_changes: "No changes.",
    status_cancelled: "Cancelled.",
    status_empty_doc: "Document is empty.",
    status_settings_saved: "Settings restored (words preserved).",
    status_settings_loaded: "Settings loaded successfully.",
    status_settings_error: "Error: Invalid file.",
    status_profile_changed: "Profile changed to: {0}",
    status_done_selection: "Done: {0} ({1}ms)",
    status_done_document: "Done: {0} ({1}ms){2}",
    status_preview_applied: "Done (applied from preview).",
    status_error_prefix: "Error: {0}",

    // PR2
    status_no_text_found: "No text found to process.",
    status_processing_headers_footers: "Processing: headers/footers...",
    status_processing_footnotes: "Processing: footnotes...",
    status_processing_endnotes: "Processing: endnotes...",
    status_applying_preview: "Applying preview (no re-conversion)...",
    status_preview_cache_invalid: "Preview cache invalid ({0}). Re-converting...",

    // PR4
    status_preview_shown: "Preview shown ({0})",

    // PR5
    status_extra_headers_footers: "H/F: {0}",
    status_extra_footnotes_na: "Footnotes: N/A",
    status_extra_endnotes_na: "Endnotes: N/A",

    // Modals & Messages
    modal_title_confirm: "Confirmation",
    modal_title_error: "Error",
    modal_title_info: "No changes",

    // Buttons
    btn_ok: "OK",
    btn_cancel: "Cancel",
    btn_close: "Close",
    btn_load_more: "Load more",
    btn_apply: "APPLY",

    // PR4: main taskpane buttons (dynamic labels)
    ui_btn_run: "APPLY",
    ui_btn_preview: "PREVIEW",
    ui_sub_no_text: "NO TEXT",
    ui_sub_run_selection: "selection",
    ui_sub_preview_selection: "selection",
    ui_sub_run_document: "whole document",
    ui_sub_preview_document: "whole document",

    // Preview tabs
    preview_btn_diff: "Diff",
    preview_btn_plain: "Result",
    preview_btn_side: "Before/After",
    preview_btn_copy: "Copy",

    // PR2: tooltip / fallback for "load more"
    preview_load_more_title: "Load next paragraphs",
    preview_load_more_none: "No more paragraphs to load",

    // PR3: diff/preview labels
    preview_label_before: "Before",
    preview_label_after: "After",
    preview_label_too_large_diff: "File too large for detailed diff",
    preview_label_truncated_perf: "View truncated due to performance",

    // Messages
    msg_empty_selection:
        "Only whitespace is selected.<br>Please select some text or select nothing for the whole document.",
    msg_no_selection: "No selection found.",
    msg_confirm_whole_doc: "No text selected.<br/>Do you want to process the <b>WHOLE document</b>?",
    msg_reset_confirm:
        "This will reset options to factory defaults.<br><br>Your protected words will <b>NOT</b> be deleted.<br><br>Do you want to continue?",
    msg_preview_empty: "Preview failed: result is empty text.",
    msg_preview_no_changes: "Text is already in the target script or no changes needed.",
    msg_preview_scope_doc: "Available only when previewing the whole document",

    msg_doc_too_large:
        "Document is too large for automatic processing (5MB limit).<br>Please split it into smaller parts.",

    // Preview
    preview_title_selection: "Selection ({0})",
    preview_title_doc: "First {0} paragraphs ({1})",
    preview_diff_no_changes: "No text changes.",
    preview_toast_copied: "Copied",
    preview_toast_copy_fail: "Cannot copy",

    // Cache reasons
    reason_opts_changed: "settings changed",
    reason_expired: "cache expired",
    reason_selection_changed: "selection changed",
    reason_formatting_changed: "formatting/selection (OOXML) changed",
    reason_missing: "cache incomplete",
    reason_unknown: "unknown reason",

    // Stats
    stats_scope_selection: "Selection",
    stats_scope_document: "Whole document",
    stats_header_apply: "Stats: {0}",
    stats_header_preview: "Stats: preview applied",
    stats_note_preview: "Note: applied OOXML from preview (no re-conversion).",
    stats_footnotes_na: "Footnotes supported: NO",
    stats_endnotes_na: "Endnotes supported: NO",

    // Profile names
    profile_custom: "Custom",
    profile_it: "IT / Technology",
    profile_finance: "Finance / Banking",
    profile_medical: "Medical / Pharma",
    profile_legal: "Legal / Admin",
    profile_marketing: "Marketing / Social Media",
    profile_journalism: "Journalism / Media",
};

// Mapa svih prevoda
const TRANSLATIONS: Record<Language, typeof SR_RS> = {
    sr: SR_RS,
    en: EN_US,
};

export function setLanguage(lang: Language) {
    if (TRANSLATIONS[lang]) {
        currentLang = lang;
    }
}

export function getLanguage(): Language {
    return currentLang;
}

/**
 * Glavna funkcija za prevod.
 * Primer: t("status_done_selection", type, time)
 */
export function t(key: TranslationKey, ...args: (string | number)[]): string {
    const dict = TRANSLATIONS[currentLang] || SR_RS;
    let str = dict[key] || SR_RS[key] || key;

    if (args.length > 0) {
        args.forEach((arg, index) => {
            str = str.replace(new RegExp(`\\{${index}\\}`, "g"), String(arg));
        });
    }

    return str;
}
