// src/shared/i18n.ts

export type TranslationKey = keyof typeof SR_RS;
export type Language = "sr" | "en";

// Trenutni aktivni jezik (default je srpski)
let currentLang: Language = "sr";

// === SRPSKI (Izvor) ===
const SR_RS = {
    // ===== App / Taskpane static UI (NEW) =====
    app_title: "Serbian Transliterator",
    ui_version_prefix: "v",

    section_settings: "PODEŠAVANJA",
    btn_export: "Izvezi",
    btn_import: "Uvezi",
    btn_export_title: "Izvezi podešavanja",
    btn_import_title: "Uvezi podešavanja",

    section_profile: "PROFIL",
    btn_reset_factory: "Fabrička podešavanja",
    profile_select_aria: "Izbor profila",

    section_direction: "SMER",
    dir_auto: "Auto",
    dir_to_ascii: "Ošišana latinica",
    dir_lat_to_cyr: "Lat → Ćir",
    dir_cyr_to_lat: "Ćir → Lat",

    section_options: "OPCIJE",
    opt_confirm_whole_doc: "Potvrdi preslovljavanje celog dokumenta",
    opt_include_headers_footers: "Uključi zaglavlja/podnožja (header/footer)",
    opt_include_footnotes: "Uključi fusnote (footnotes)",
    opt_include_endnotes: "Uključi endnote (endnotes)",
    opt_protect_brands: "Zaštiti brendove (Windows, ...)",
    opt_smart_quotes: "Pametni navodnici ( „ … “ )",
    opt_preserve_code_before: "Zaštiti kod (",
    ui_inline_code_word: "inline",
    opt_preserve_code_between: " / ",
    ui_block_code_word: "blok",
    opt_preserve_code_after: ")",
    opt_show_stats: "Prikaži detaljnu statistiku",

    section_corrections: "KOREKCIJA",
    opt_fix_spaces: "Ukloni višak razmaka",

    section_advanced: "NAPREDNO",
    btn_toggle_advanced: "Napredno",
    btn_toggle_advanced_title: "Prikaži/sakrij napredna podešavanja",

    opt_curly_label_before: "Zaštita ",
    opt_curly_label_after: " blokova",
    opt_curly_aria: "Zaštita vitičastih zagrada",
    opt_curly_placeholders: "Samo placeholder-i (npr. {USER_NAME})",
    opt_curly_all: "Sve u {...} (legacy)",
    opt_curly_none: "Ne štiti {...}",
    opt_curly_hint: "Kontroliše da li se sadržaj u vitičastim zagradama preslovljava.",

    opt_protect_romans: "Zaštiti rimske brojeve (IV, XIV)",
    opt_set_proofing_language: "Postavi jezik provere (sr-Cyrl / sr-Latn)",
    opt_format_dates: "Formatiraj datume (npr. 21.10.2023.)",
    opt_format_dates_hint: "Ova opcija menja sadržaj (nije samo preslovljavanje).",

    section_protected: "ZAŠTIĆENO",
    btn_add_word_title: "Dodaj reč",
    btn_clear_custom: "Moje",
    btn_clear_preset: "Profil",
    btn_clear_all: "Sve",
    btn_clear_custom_title: "Obriši moje tagove",
    btn_clear_preset_title: "Obriši tagove profila",
    btn_clear_all_title: "Obriši sve reči",
    tags_input_placeholder: "Upiši reč ili frazu...",
    tags_hint: "Reči ovde ostaju u originalnom pismu.",

    footer_help: "Pomoć",
    footer_privacy: "Privatnost",
    footer_copyright: "© 2026",

    // ===== Existing keys (original project) =====

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

    // PR6: short error strings (for status line)
    status_doc_too_large_short: "Dokument prevelik (limit 5MB)",

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

    // PR6: tags
    ui_tag_remove: "Ukloni",

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

    // PR6: stats lines/sections
    stats_line_scope: "Opseg: {0}",
    stats_line_nodes_changed: "Promenjeno čvorova: {0}",
    stats_line_time_ms: "Vreme: {0}ms",

    stats_section_bridges: "Bridges:",
    stats_bridge_line: "- {0}: {1}",

    stats_section_proofing: "Proofing language:",
    stats_proof_target: "- target: {0}",
    stats_proof_changed_runs: "- changedRuns: {0}",
    stats_proof_skipped_runs: "- skippedRuns: {0}",
    stats_proof_skipped_by_reason: "- skippedByReason:",
    stats_proof_reason_line: "  - {0}: {1}",

    stats_line_headers_footers: "Header/Footer: {0}",
    stats_line_footnotes: "Fusnote: {0}",
    stats_line_endnotes: "Endnote: {0}",

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
// Mora sadržati SVE ključeve iz SR_RS, jer je tip: Record<TranslationKey, string>
const EN_US: Record<TranslationKey, string> = {
    // ===== App / Taskpane static UI (NEW) =====
    app_title: "Serbian Transliterator",
    ui_version_prefix: "v",

    section_settings: "SETTINGS",
    btn_export: "Export",
    btn_import: "Import",
    btn_export_title: "Export settings",
    btn_import_title: "Import settings",

    section_profile: "PROFILE",
    btn_reset_factory: "Factory settings",
    profile_select_aria: "Profile select",

    section_direction: "DIRECTION",
    dir_auto: "Auto",
    dir_to_ascii: "ASCII Latin",
    dir_lat_to_cyr: "Lat → Cyr",
    dir_cyr_to_lat: "Cyr → Lat",

    section_options: "OPTIONS",
    opt_confirm_whole_doc: "Confirm processing the whole document",
    opt_include_headers_footers: "Include headers/footers",
    opt_include_footnotes: "Include footnotes",
    opt_include_endnotes: "Include endnotes",
    opt_protect_brands: "Protect brands (Windows, ...)",
    opt_smart_quotes: "Smart quotes ( „ … “ )",
    opt_preserve_code_before: "Preserve code (",
    ui_inline_code_word: "inline",
    opt_preserve_code_between: " / ",
    ui_block_code_word: "block",
    opt_preserve_code_after: ")",
    opt_show_stats: "Show detailed statistics",

    section_corrections: "CORRECTIONS",
    opt_fix_spaces: "Remove extra spaces",

    section_advanced: "ADVANCED",
    btn_toggle_advanced: "Advanced",
    btn_toggle_advanced_title: "Show/hide advanced settings",

    opt_curly_label_before: "Protection for ",
    opt_curly_label_after: " blocks",
    opt_curly_aria: "Curly braces protection",
    opt_curly_placeholders: "Only placeholders (e.g. {USER_NAME})",
    opt_curly_all: "Everything inside {...} (legacy)",
    opt_curly_none: "Do not protect {...}",
    opt_curly_hint: "Controls whether text inside curly braces is transliterated.",

    opt_protect_romans: "Protect Roman numerals (IV, XIV)",
    opt_set_proofing_language: "Set proofing language (sr-Cyrl / sr-Latn)",
    opt_format_dates: "Format dates (e.g. 21.10.2023.)",
    opt_format_dates_hint: "This option changes content (not just transliteration).",

    section_protected: "PROTECTED",
    btn_add_word_title: "Add word",
    btn_clear_custom: "Mine",
    btn_clear_preset: "Profile",
    btn_clear_all: "All",
    btn_clear_custom_title: "Clear my tags",
    btn_clear_preset_title: "Clear profile tags",
    btn_clear_all_title: "Clear all words",
    tags_input_placeholder: "Type a word or phrase...",
    tags_hint: "Words here remain in the original script.",

    footer_help: "Help",
    footer_privacy: "Privacy",
    footer_copyright: "© 2026",

    // ===== Existing keys (original project) =====

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

    status_no_text_found: "No text found to process.",
    status_processing_headers_footers: "Processing: headers/footers...",
    status_processing_footnotes: "Processing: footnotes...",
    status_processing_endnotes: "Processing: endnotes...",
    status_applying_preview: "Applying preview (no re-conversion)...",
    status_preview_cache_invalid: "Preview cache invalid ({0}). Re-converting...",

    status_preview_shown: "Preview shown ({0})",

    status_extra_headers_footers: "H/F: {0}",
    status_extra_footnotes_na: "Footnotes: N/A",
    status_extra_endnotes_na: "Endnotes: N/A",

    status_doc_too_large_short: "Document too large (5MB limit)",

    modal_title_confirm: "Confirmation",
    modal_title_error: "Error",
    modal_title_info: "No changes",

    btn_ok: "OK",
    btn_cancel: "Cancel",
    btn_close: "Close",
    btn_load_more: "Load more",
    btn_apply: "APPLY",

    ui_btn_run: "APPLY",
    ui_btn_preview: "PREVIEW",
    ui_sub_no_text: "NO TEXT",
    ui_sub_run_selection: "selection",
    ui_sub_preview_selection: "selection",
    ui_sub_run_document: "whole document",
    ui_sub_preview_document: "whole document",

    ui_tag_remove: "Remove",

    preview_btn_diff: "Diff",
    preview_btn_plain: "Result",
    preview_btn_side: "Before/After",
    preview_btn_copy: "Copy",

    preview_load_more_title: "Load next paragraphs",
    preview_load_more_none: "No more paragraphs to load",

    preview_label_before: "Before",
    preview_label_after: "After",
    preview_label_too_large_diff: "File too large for detailed diff",
    preview_label_truncated_perf: "View truncated due to performance",

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

    preview_title_selection: "Selection ({0})",
    preview_title_doc: "First {0} paragraphs ({1})",
    preview_diff_no_changes: "No text changes.",
    preview_toast_copied: "Copied",
    preview_toast_copy_fail: "Cannot copy",

    reason_opts_changed: "settings changed",
    reason_expired: "cache expired",
    reason_selection_changed: "selection changed",
    reason_formatting_changed: "formatting/selection (OOXML) changed",
    reason_missing: "cache incomplete",
    reason_unknown: "unknown reason",

    stats_scope_selection: "Selection",
    stats_scope_document: "Whole document",
    stats_header_apply: "Stats: {0}",
    stats_header_preview: "Stats: preview applied",
    stats_note_preview: "Note: applied OOXML from preview (no re-conversion).",
    stats_footnotes_na: "Footnotes supported: NO",
    stats_endnotes_na: "Endnotes supported: NO",

    stats_line_scope: "Scope: {0}",
    stats_line_nodes_changed: "Nodes changed: {0}",
    stats_line_time_ms: "Time: {0}ms",

    stats_section_bridges: "Bridges:",
    stats_bridge_line: "- {0}: {1}",

    stats_section_proofing: "Proofing language:",
    stats_proof_target: "- target: {0}",
    stats_proof_changed_runs: "- changedRuns: {0}",
    stats_proof_skipped_runs: "- skippedRuns: {0}",
    stats_proof_skipped_by_reason: "- skippedByReason:",
    stats_proof_reason_line: "  - {0}: {1}",

    stats_line_headers_footers: "Header/Footer: {0}",
    stats_line_footnotes: "Footnotes: {0}",
    stats_line_endnotes: "Endnotes: {0}",

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
