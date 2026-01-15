export type TranslationKey = keyof typeof SR_RS;

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

    // Modali & Obaveštenja
    modal_title_confirm: "Potvrda",
    modal_title_error: "Greška",
    modal_title_info: "Nema izmena",

    msg_empty_selection:
        "Selektovan je samo prazan prostor (razmaci).<br>Molimo selektujte tekst ili ne selektujte ništa za ceo dokument.",
    msg_no_selection: "Nema selekcije za preslovljavanje.",
    msg_confirm_whole_doc: "Nije selektovan tekst.<br/>Da li želite da preslovite <b>CEO dokument</b>?",
    msg_reset_confirm:
        "Ovo će vratiti opcije na fabričke vrednosti.<br><br>Vaše zaštićene reči <b>neće</b> biti obrisane.<br><br>Da li želite da nastavite?",
    msg_preview_empty: "Pregled nije uspeo: rezultat je prazan tekst.",
    msg_preview_no_changes: "Tekst je već u traženom pismu ili nema šta da se menja.",
    msg_preview_scope_doc: "Dostupno samo kada pregledate ceo dokument",

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

/**
 * Jednostavna i18n funkcija.
 * Primer: t("status_done", type, time)
 */
export function t(key: TranslationKey, ...args: (string | number)[]): string {
    let str = SR_RS[key] || key;

    if (args.length > 0) {
        args.forEach((arg, index) => {
            str = str.replace(new RegExp(`\\{${index}\\}`, "g"), String(arg));
        });
    }

    return str;
}
