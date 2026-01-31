// @ts-nocheck
// src/shared/locales/sr.ts
function stryNS_9fa48() {
    var g =
        (typeof globalThis === "object" && globalThis && globalThis.Math === Math && globalThis) ||
        new Function("return this")();
    var ns = g.__stryker__ || (g.__stryker__ = {});
    if (
        ns.activeMutant === undefined &&
        g.process &&
        g.process.env &&
        g.process.env.__STRYKER_ACTIVE_MUTANT__
    ) {
        ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
    }
    function retrieveNS() {
        return ns;
    }
    stryNS_9fa48 = retrieveNS;
    return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
    var ns = stryNS_9fa48();
    var cov =
        ns.mutantCoverage ||
        (ns.mutantCoverage = {
            static: {},
            perTest: {},
        });
    function cover() {
        var c = cov.static;
        if (ns.currentTestId) {
            c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
        }
        var a = arguments;
        for (var i = 0; i < a.length; i++) {
            c[a[i]] = (c[a[i]] || 0) + 1;
        }
    }
    stryCov_9fa48 = cover;
    cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
    var ns = stryNS_9fa48();
    function isActive(id) {
        if (ns.activeMutant === id) {
            if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
                throw new Error("Stryker: Hit count limit reached (" + ns.hitCount + ")");
            }
            return true;
        }
        return false;
    }
    stryMutAct_9fa48 = isActive;
    return isActive(id);
}
export const SR_RS = stryMutAct_9fa48("2067")
    ? {}
    : (stryCov_9fa48("2067"),
      {
          app_title: stryMutAct_9fa48("2068") ? "" : (stryCov_9fa48("2068"), "Serbian Transliterator"),
          ui_version_prefix: stryMutAct_9fa48("2069") ? "" : (stryCov_9fa48("2069"), "v"),
          section_settings: stryMutAct_9fa48("2070") ? "" : (stryCov_9fa48("2070"), "PODEŠAVANJA"),
          btn_export: stryMutAct_9fa48("2071") ? "" : (stryCov_9fa48("2071"), "Izvezi"),
          btn_import: stryMutAct_9fa48("2072") ? "" : (stryCov_9fa48("2072"), "Uvezi"),
          btn_export_title: stryMutAct_9fa48("2073") ? "" : (stryCov_9fa48("2073"), "Izvezi podešavanja"),
          btn_import_title: stryMutAct_9fa48("2074") ? "" : (stryCov_9fa48("2074"), "Uvezi podešavanja"),
          section_profile: stryMutAct_9fa48("2075") ? "" : (stryCov_9fa48("2075"), "PROFIL"),
          btn_reset_factory: stryMutAct_9fa48("2076") ? "" : (stryCov_9fa48("2076"), "Resetuj"),
          profile_select_aria: stryMutAct_9fa48("2077") ? "" : (stryCov_9fa48("2077"), "Izbor profila"),
          section_direction: stryMutAct_9fa48("2078") ? "" : (stryCov_9fa48("2078"), "CILJNO PISMO"),
          dir_auto: stryMutAct_9fa48("2079") ? "" : (stryCov_9fa48("2079"), "Automatski"),
          dir_to_ascii: stryMutAct_9fa48("2080") ? "" : (stryCov_9fa48("2080"), "→ ASCII Lat"),
          dir_lat_to_cyr: stryMutAct_9fa48("2081") ? "" : (stryCov_9fa48("2081"), "→ Ćirilica"),
          dir_cyr_to_lat: stryMutAct_9fa48("2082") ? "" : (stryCov_9fa48("2082"), "→ Latinica"),
          dir_auto_short: stryMutAct_9fa48("2083") ? "" : (stryCov_9fa48("2083"), "Auto"),
          dir_lat_to_cyr_short: stryMutAct_9fa48("2084") ? "" : (stryCov_9fa48("2084"), "→ Ćir"),
          dir_cyr_to_lat_short: stryMutAct_9fa48("2085") ? "" : (stryCov_9fa48("2085"), "→ Lat"),
          dir_to_ascii_short: stryMutAct_9fa48("2086") ? "" : (stryCov_9fa48("2086"), "→ ASCII"),
          section_options: stryMutAct_9fa48("2087") ? "" : (stryCov_9fa48("2087"), "OPCIJE"),
          opt_confirm_whole_doc: stryMutAct_9fa48("2088")
              ? ""
              : (stryCov_9fa48("2088"), "Potvrdi preslovljavanje celog dokumenta"),
          opt_include_headers_footers: stryMutAct_9fa48("2089")
              ? ""
              : (stryCov_9fa48("2089"), "Uključi zaglavlja/podnožja (header/footer)"),
          opt_include_footnotes: stryMutAct_9fa48("2090") ? "" : (stryCov_9fa48("2090"), "Uključi fusnote"),
          opt_include_endnotes: stryMutAct_9fa48("2091") ? "" : (stryCov_9fa48("2091"), "Uključi endnote"),
          opt_protect_brands: stryMutAct_9fa48("2092")
              ? ""
              : (stryCov_9fa48("2092"), "Zaštiti brendove (Windows, ...)"),
          opt_smart_quotes: stryMutAct_9fa48("2093")
              ? ""
              : (stryCov_9fa48("2093"), "Pametni navodnici ( „ … “ )"),
          opt_preserve_code_before: stryMutAct_9fa48("2094") ? "" : (stryCov_9fa48("2094"), "Zaštiti kod ("),
          ui_inline_code_word: stryMutAct_9fa48("2095") ? "" : (stryCov_9fa48("2095"), "inline"),
          opt_preserve_code_between: stryMutAct_9fa48("2096") ? "" : (stryCov_9fa48("2096"), " / "),
          ui_block_code_word: stryMutAct_9fa48("2097") ? "" : (stryCov_9fa48("2097"), "blok"),
          opt_preserve_code_after: stryMutAct_9fa48("2098") ? "" : (stryCov_9fa48("2098"), ")"),
          section_corrections: stryMutAct_9fa48("2099") ? "" : (stryCov_9fa48("2099"), "KOREKCIJA"),
          opt_fix_spaces: stryMutAct_9fa48("2100") ? "" : (stryCov_9fa48("2100"), "Ukloni višak razmaka"),
          section_advanced: stryMutAct_9fa48("2101") ? "" : (stryCov_9fa48("2101"), "NAPREDNO"),
          btn_toggle_advanced: stryMutAct_9fa48("2102") ? "" : (stryCov_9fa48("2102"), "Napredno"),
          btn_toggle_advanced_title: stryMutAct_9fa48("2103")
              ? ""
              : (stryCov_9fa48("2103"), "Prikaži/sakrij napredna podešavanja"),
          opt_ui_language_label: stryMutAct_9fa48("2104") ? "" : (stryCov_9fa48("2104"), "Jezik"),
          // [CHANGE] Shortened
          opt_ui_language_aria: stryMutAct_9fa48("2105")
              ? ""
              : (stryCov_9fa48("2105"), "Izbor jezika interfejsa"),
          opt_ui_language_sr: stryMutAct_9fa48("2106")
              ? ""
              : (stryCov_9fa48("2106"), "Srpski (podrazumevano)"),
          opt_ui_language_en: stryMutAct_9fa48("2107") ? "" : (stryCov_9fa48("2107"), "English"),
          opt_ui_language_auto: stryMutAct_9fa48("2108")
              ? ""
              : (stryCov_9fa48("2108"), "Auto (Office/browser)"),
          opt_ui_language_hint: stryMutAct_9fa48("2109") ? "" : (stryCov_9fa48("2109"), "Menja jezik UI-ja."),
          ui_theme_label: stryMutAct_9fa48("2110") ? "" : (stryCov_9fa48("2110"), "Tema / Theme"),
          ui_theme_aria: stryMutAct_9fa48("2111") ? "" : (stryCov_9fa48("2111"), "Izbor teme"),
          ui_theme_auto: stryMutAct_9fa48("2112") ? "" : (stryCov_9fa48("2112"), "Auto"),
          ui_theme_light: stryMutAct_9fa48("2113") ? "" : (stryCov_9fa48("2113"), "Svetla ☀️"),
          ui_theme_dark: stryMutAct_9fa48("2114") ? "" : (stryCov_9fa48("2114"), "Tamna 🌙"),
          opt_curly_label_before: stryMutAct_9fa48("2115") ? "" : (stryCov_9fa48("2115"), "Zaštita "),
          opt_curly_label_after: stryMutAct_9fa48("2116") ? "" : (stryCov_9fa48("2116"), " blokova"),
          opt_curly_aria: stryMutAct_9fa48("2117")
              ? ""
              : (stryCov_9fa48("2117"), "Zaštita vitičastih zagrada"),
          opt_curly_placeholders: stryMutAct_9fa48("2118")
              ? ""
              : (stryCov_9fa48("2118"), "Samo zagrade (npr. {USER_NAME})"),
          opt_curly_all: stryMutAct_9fa48("2119") ? "" : (stryCov_9fa48("2119"), "Sve u {...} (legacy)"),
          opt_curly_none: stryMutAct_9fa48("2120") ? "" : (stryCov_9fa48("2120"), "Ne štiti {...}"),
          opt_curly_hint: stryMutAct_9fa48("2121")
              ? ""
              : (stryCov_9fa48("2121"), "Kontroliše da li se sadržaj u vitičastim zagradama preslovljava."),
          opt_protect_romans: stryMutAct_9fa48("2122")
              ? ""
              : (stryCov_9fa48("2122"), "Zaštiti rimske brojeve (IV, XIV)"),
          opt_set_proofing_language: stryMutAct_9fa48("2123")
              ? ""
              : (stryCov_9fa48("2123"), "Postavi jezik provere (sr-Cyrl / sr-Latn)"),
          opt_format_dates: stryMutAct_9fa48("2124")
              ? ""
              : (stryCov_9fa48("2124"), "Formatiraj datume (npr. 21.10.2023.)"),
          opt_format_dates_hint: stryMutAct_9fa48("2125")
              ? ""
              : (stryCov_9fa48("2125"), "Ova opcija menja sadržaj (nije samo preslovljavanje)."),
          opt_custom_subs_label: stryMutAct_9fa48("2126")
              ? ""
              : (stryCov_9fa48("2126"), "Sopstvene zamene (Izvor -> Cilj)"),
          opt_custom_subs_placeholder: stryMutAct_9fa48("2127")
              ? ""
              : (stryCov_9fa48("2127"), "vreme -> vrijeme\nlepo -> lijepo"),
          opt_custom_subs_hint: stryMutAct_9fa48("2128")
              ? ""
              : (stryCov_9fa48("2128"), "Jedno pravilo po liniji. Primenjuje se na kraju."),
          subs_list_empty: stryMutAct_9fa48("2129")
              ? ""
              : (stryCov_9fa48("2129"), "Nema definisanih zamena."),
          subs_input_src: stryMutAct_9fa48("2130") ? "" : (stryCov_9fa48("2130"), "Izvor (npr. lepo)"),
          subs_input_dest: stryMutAct_9fa48("2131") ? "" : (stryCov_9fa48("2131"), "Cilj (npr. lijepo)"),
          subs_input_src_short: stryMutAct_9fa48("2132") ? "" : (stryCov_9fa48("2132"), "izvor"),
          subs_input_dest_short: stryMutAct_9fa48("2133") ? "" : (stryCov_9fa48("2133"), "cilj"),
          opt_dialect_label: stryMutAct_9fa48("2134") ? "" : (stryCov_9fa48("2134"), "Dijalekt / Pismo"),
          opt_dialect_aria: stryMutAct_9fa48("2135") ? "" : (stryCov_9fa48("2135"), "Izbor dijalekta"),
          opt_dialect_none: stryMutAct_9fa48("2136")
              ? ""
              : (stryCov_9fa48("2136"), "Samo preslovljavanje (Standard)"),
          opt_dialect_ei: stryMutAct_9fa48("2137")
              ? ""
              : (stryCov_9fa48("2137"), "Ekavica → Ijekavica (beta)"),
          opt_dialect_ie: stryMutAct_9fa48("2138")
              ? ""
              : (stryCov_9fa48("2138"), "Ijekavica → Ekavica (beta)"),
          opt_ignored_styles_label: stryMutAct_9fa48("2139")
              ? ""
              : (stryCov_9fa48("2139"), "Ignorisani Stilovi"),
          opt_ignored_styles_hint: stryMutAct_9fa48("2140")
              ? ""
              : (stryCov_9fa48("2140"), "Tekst u ovim stilovima (npr. 'Code') se neće menjati."),
          opt_ignored_styles_placeholder: stryMutAct_9fa48("2141")
              ? ""
              : (stryCov_9fa48("2141"), "Code\nQuote"),
          section_protected: stryMutAct_9fa48("2142") ? "" : (stryCov_9fa48("2142"), "ZAŠTIĆENO"),
          btn_add_word_title: stryMutAct_9fa48("2143") ? "" : (stryCov_9fa48("2143"), "Dodaj reč"),
          btn_clear_custom: stryMutAct_9fa48("2144") ? "" : (stryCov_9fa48("2144"), "Moje"),
          btn_clear_preset: stryMutAct_9fa48("2145") ? "" : (stryCov_9fa48("2145"), "Profil"),
          btn_clear_all: stryMutAct_9fa48("2146") ? "" : (stryCov_9fa48("2146"), "Sve"),
          btn_clear_custom_title: stryMutAct_9fa48("2147")
              ? ""
              : (stryCov_9fa48("2147"), "Obriši moje tagove"),
          btn_clear_preset_title: stryMutAct_9fa48("2148")
              ? ""
              : (stryCov_9fa48("2148"), "Obriši tagove profila"),
          btn_clear_all_title: stryMutAct_9fa48("2149") ? "" : (stryCov_9fa48("2149"), "Obriši sve reči"),
          tags_input_placeholder: stryMutAct_9fa48("2150")
              ? ""
              : (stryCov_9fa48("2150"), "Upiši reč ili frazu..."),
          tags_hint: stryMutAct_9fa48("2151")
              ? ""
              : (stryCov_9fa48("2151"), "Ove reči se ne preslovljavaju."),
          tags_filter_placeholder: stryMutAct_9fa48("2152") ? "" : (stryCov_9fa48("2152"), "🔍 Filtriraj..."),
          tags_filter_aria: stryMutAct_9fa48("2153")
              ? ""
              : (stryCov_9fa48("2153"), "Filtriraj zaštićene reči"),
          footer_help: stryMutAct_9fa48("2154") ? "" : (stryCov_9fa48("2154"), "Pomoć"),
          footer_privacy: stryMutAct_9fa48("2155") ? "" : (stryCov_9fa48("2155"), "Privatnost"),
          footer_copyright: stryMutAct_9fa48("2156") ? "" : (stryCov_9fa48("2156"), "© 2026"),
          footer_donate: stryMutAct_9fa48("2157") ? "" : (stryCov_9fa48("2157"), "Podrži ❤️"),
          ui_stats_accordion_header: stryMutAct_9fa48("2158") ? "" : (stryCov_9fa48("2158"), "STATISTIKA"),
          ui_stats_empty_placeholder: stryMutAct_9fa48("2159")
              ? ""
              : (stryCov_9fa48("2159"), "(Nema podataka)"),
          status_ready: stryMutAct_9fa48("2160") ? "" : (stryCov_9fa48("2160"), "Spreman za rad."),
          status_generating_preview: stryMutAct_9fa48("2161")
              ? ""
              : (stryCov_9fa48("2161"), "Generišem pregled..."),
          status_processing: stryMutAct_9fa48("2162") ? "" : (stryCov_9fa48("2162"), "Obrada u toku..."),
          status_no_changes: stryMutAct_9fa48("2163") ? "" : (stryCov_9fa48("2163"), "Nema izmena."),
          status_cancelled: stryMutAct_9fa48("2164") ? "" : (stryCov_9fa48("2164"), "Otkazano."),
          status_empty_doc: stryMutAct_9fa48("2165") ? "" : (stryCov_9fa48("2165"), "Dokument je prazan."),
          status_settings_saved: stryMutAct_9fa48("2166")
              ? ""
              : (stryCov_9fa48("2166"), "Podešavanja vraćena (reči sačuvane)."),
          status_settings_loaded: stryMutAct_9fa48("2167")
              ? ""
              : (stryCov_9fa48("2167"), "Podešavanja uspešno učitana."),
          status_settings_error: stryMutAct_9fa48("2168")
              ? ""
              : (stryCov_9fa48("2168"), "Greška: Neispravan fajl."),
          status_profile_changed: stryMutAct_9fa48("2169")
              ? ""
              : (stryCov_9fa48("2169"), "Profil promenjen na: {0}"),
          status_done_selection: stryMutAct_9fa48("2170")
              ? ""
              : (stryCov_9fa48("2170"), "Završeno: {0} ({1}ms)"),
          status_done_document: stryMutAct_9fa48("2171")
              ? ""
              : (stryCov_9fa48("2171"), "Završeno: {0} ({1}ms){2}"),
          status_preview_applied: stryMutAct_9fa48("2172")
              ? ""
              : (stryCov_9fa48("2172"), "Završeno (primenjen preview)."),
          status_error_prefix: stryMutAct_9fa48("2173") ? "" : (stryCov_9fa48("2173"), "Greška: {0}"),
          status_no_text_found: stryMutAct_9fa48("2174")
              ? ""
              : (stryCov_9fa48("2174"), "Nije pronađen tekst za obradu."),
          status_processing_headers_footers: stryMutAct_9fa48("2175")
              ? ""
              : (stryCov_9fa48("2175"), "Obrada: zaglavlja/podnožja..."),
          status_processing_footnotes: stryMutAct_9fa48("2176")
              ? ""
              : (stryCov_9fa48("2176"), "Obrada: fusnote..."),
          status_processing_endnotes: stryMutAct_9fa48("2177")
              ? ""
              : (stryCov_9fa48("2177"), "Obrada: endnote..."),
          status_applying_preview: stryMutAct_9fa48("2178")
              ? ""
              : (stryCov_9fa48("2178"), "Primena pregleda (bez ponovne konverzije)..."),
          status_preview_cache_invalid: stryMutAct_9fa48("2179")
              ? ""
              : (stryCov_9fa48("2179"), "Cache pregleda ne važi ({0}). Radim ponovnu konverziju..."),
          status_preview_shown: stryMutAct_9fa48("2180")
              ? ""
              : (stryCov_9fa48("2180"), "Prikazan pregled ({0})"),
          status_extra_headers_footers: stryMutAct_9fa48("2181") ? "" : (stryCov_9fa48("2181"), "H/F: {0}"),
          status_extra_footnotes_na: stryMutAct_9fa48("2182") ? "" : (stryCov_9fa48("2182"), "Fusnote: N/A"),
          status_extra_endnotes_na: stryMutAct_9fa48("2183") ? "" : (stryCov_9fa48("2183"), "Endnote: N/A"),
          status_doc_too_large_short: stryMutAct_9fa48("2184")
              ? ""
              : (stryCov_9fa48("2184"), "Dokument prevelik (limit 5MB)"),
          modal_title_confirm: stryMutAct_9fa48("2185") ? "" : (stryCov_9fa48("2185"), "Potvrda"),
          modal_title_error: stryMutAct_9fa48("2186") ? "" : (stryCov_9fa48("2186"), "Greška"),
          modal_title_info: stryMutAct_9fa48("2187") ? "" : (stryCov_9fa48("2187"), "Nema izmena"),
          modal_title_about: stryMutAct_9fa48("2188") ? "" : (stryCov_9fa48("2188"), "O Aplikaciji"),
          btn_ok: stryMutAct_9fa48("2189") ? "" : (stryCov_9fa48("2189"), "OK"),
          btn_cancel: stryMutAct_9fa48("2190") ? "" : (stryCov_9fa48("2190"), "Otkaži"),
          btn_close: stryMutAct_9fa48("2191") ? "" : (stryCov_9fa48("2191"), "Zatvori"),
          btn_load_more: stryMutAct_9fa48("2192") ? "" : (stryCov_9fa48("2192"), "Učitaj još"),
          btn_apply: stryMutAct_9fa48("2193") ? "" : (stryCov_9fa48("2193"), "PRESLOVI"),
          ui_btn_run: stryMutAct_9fa48("2194") ? "" : (stryCov_9fa48("2194"), "PRESLOVI"),
          ui_btn_preview: stryMutAct_9fa48("2195") ? "" : (stryCov_9fa48("2195"), "PREGLED"),
          ui_tag_remove: stryMutAct_9fa48("2196") ? "" : (stryCov_9fa48("2196"), "Ukloni"),
          ui_web_mode: stryMutAct_9fa48("2197") ? "" : (stryCov_9fa48("2197"), "Web režim"),
          web_drop_title: stryMutAct_9fa48("2198")
              ? ""
              : (stryCov_9fa48("2198"), "Prevucite .docx fajl ovde"),
          web_drop_subtitle: stryMutAct_9fa48("2199") ? "" : (stryCov_9fa48("2199"), "ili kliknite za izbor"),
          web_drop_invalid_file: stryMutAct_9fa48("2200")
              ? ""
              : (stryCov_9fa48("2200"), "Samo .docx fajlovi su podržani!"),
          preview_btn_diff: stryMutAct_9fa48("2201") ? "" : (stryCov_9fa48("2201"), "Razlike"),
          preview_btn_plain: stryMutAct_9fa48("2202") ? "" : (stryCov_9fa48("2202"), "Rezultat"),
          preview_btn_side: stryMutAct_9fa48("2203") ? "" : (stryCov_9fa48("2203"), "Pre/Posle"),
          preview_btn_copy: stryMutAct_9fa48("2204") ? "" : (stryCov_9fa48("2204"), "Kopiraj"),
          preview_load_more_title: stryMutAct_9fa48("2205")
              ? ""
              : (stryCov_9fa48("2205"), "Učitaj sledeće paragrafe"),
          preview_load_more_none: stryMutAct_9fa48("2206")
              ? ""
              : (stryCov_9fa48("2206"), "Nema više paragrafa za učitavanje"),
          preview_label_before: stryMutAct_9fa48("2207") ? "" : (stryCov_9fa48("2207"), "Pre"),
          preview_label_after: stryMutAct_9fa48("2208") ? "" : (stryCov_9fa48("2208"), "Posle"),
          preview_label_too_large_diff: stryMutAct_9fa48("2209")
              ? ""
              : (stryCov_9fa48("2209"), "Prevelik fajl za detaljan diff"),
          preview_label_truncated_perf: stryMutAct_9fa48("2210")
              ? ""
              : (stryCov_9fa48("2210"), "Prikaz skraćen zbog performansi"),
          preview_btn_apply: stryMutAct_9fa48("2211") ? "" : (stryCov_9fa48("2211"), "PRIMENI"),
          preview_close_title: stryMutAct_9fa48("2212") ? "" : (stryCov_9fa48("2212"), "Zatvori"),
          preview_diff_tip_insert: stryMutAct_9fa48("2213")
              ? ""
              : (stryCov_9fa48("2213"), "Klikni da odbaciš izmenu"),
          preview_diff_tip_delete: stryMutAct_9fa48("2214")
              ? ""
              : (stryCov_9fa48("2214"), "Klikni da zadržiš ovaj tekst"),
          preview_toast_debug_logs_copied: stryMutAct_9fa48("2215")
              ? ""
              : (stryCov_9fa48("2215"), "Debug logovi kopirani u clipboard!"),
          msg_empty_selection: stryMutAct_9fa48("2216")
              ? ""
              : (stryCov_9fa48("2216"), "Selektovan je samo prazan prostor..."),
          msg_no_selection: stryMutAct_9fa48("2217")
              ? ""
              : (stryCov_9fa48("2217"), "Nema selekcije za preslovljavanje."),
          msg_confirm_whole_doc: stryMutAct_9fa48("2218")
              ? ""
              : (stryCov_9fa48("2218"),
                "Nije selektovan tekst.<br/>Da li želite da preslovite <b>CEO dokument</b>?"),
          msg_reset_confirm: stryMutAct_9fa48("2219")
              ? ""
              : (stryCov_9fa48("2219"), "Ovo će vratiti opcije na fabričke vrednosti..."),
          msg_preview_empty: stryMutAct_9fa48("2220")
              ? ""
              : (stryCov_9fa48("2220"), "Preview failed: result is empty text."),
          msg_preview_no_changes: stryMutAct_9fa48("2221")
              ? ""
              : (stryCov_9fa48("2221"), "Tekst je već u traženom pismu ili nema šta da se menja."),
          msg_preview_scope_doc: stryMutAct_9fa48("2222")
              ? ""
              : (stryCov_9fa48("2222"), "Dostupno samo kada pregledate ceo dokument"),
          msg_doc_too_large: stryMutAct_9fa48("2223")
              ? ""
              : (stryCov_9fa48("2223"), "Dokument je prevelik za automatsku obradu..."),
          preview_title_selection: stryMutAct_9fa48("2224")
              ? ""
              : (stryCov_9fa48("2224"), "Selektovani tekst ({0})"),
          preview_title_doc: stryMutAct_9fa48("2225")
              ? ""
              : (stryCov_9fa48("2225"), "Prvih {0} paragrafa ({1})"),
          preview_diff_no_changes: stryMutAct_9fa48("2226")
              ? ""
              : (stryCov_9fa48("2226"), "Nema izmena u tekstu."),
          preview_toast_copied: stryMutAct_9fa48("2227") ? "" : (stryCov_9fa48("2227"), "Kopirano"),
          preview_toast_copy_fail: stryMutAct_9fa48("2228")
              ? ""
              : (stryCov_9fa48("2228"), "Ne mogu da kopiram"),
          reason_opts_changed: stryMutAct_9fa48("2229")
              ? ""
              : (stryCov_9fa48("2229"), "podešavanja su promenjena"),
          reason_expired: stryMutAct_9fa48("2230") ? "" : (stryCov_9fa48("2230"), "cache je istekao"),
          reason_selection_changed: stryMutAct_9fa48("2231")
              ? ""
              : (stryCov_9fa48("2231"), "selekcija je promenjena"),
          reason_formatting_changed: stryMutAct_9fa48("2232")
              ? ""
              : (stryCov_9fa48("2232"), "formatiranje/selekcija (OOXML) su promenjeni"),
          reason_missing: stryMutAct_9fa48("2233") ? "" : (stryCov_9fa48("2233"), "cache nije kompletan"),
          reason_unknown: stryMutAct_9fa48("2234") ? "" : (stryCov_9fa48("2234"), "nepoznat razlog"),
          stats_scope_selection: stryMutAct_9fa48("2235") ? "" : (stryCov_9fa48("2235"), "Selekcija"),
          stats_scope_document: stryMutAct_9fa48("2236") ? "" : (stryCov_9fa48("2236"), "Ceo dokument"),
          stats_header_apply: stryMutAct_9fa48("2237") ? "" : (stryCov_9fa48("2237"), "Statistika: {0}"),
          stats_header_preview: stryMutAct_9fa48("2238")
              ? ""
              : (stryCov_9fa48("2238"), "Statistika: primenjen preview"),
          stats_note_preview: stryMutAct_9fa48("2239")
              ? ""
              : (stryCov_9fa48("2239"), "Napomena: primenjen je OOXML iz pregleda (bez ponovne konverzije)."),
          stats_footnotes_na: stryMutAct_9fa48("2240") ? "" : (stryCov_9fa48("2240"), "Fusnote podržane: NE"),
          stats_endnotes_na: stryMutAct_9fa48("2241") ? "" : (stryCov_9fa48("2241"), "Endnote podržane: NE"),
          stats_line_scope: stryMutAct_9fa48("2242") ? "" : (stryCov_9fa48("2242"), "Opseg: {0}"),
          stats_line_nodes_changed: stryMutAct_9fa48("2243")
              ? ""
              : (stryCov_9fa48("2243"), "Promenjeno {0} čvorova"),
          stats_line_time_ms: stryMutAct_9fa48("2244") ? "" : (stryCov_9fa48("2244"), "Vreme: {0}ms"),
          stats_section_bridges: stryMutAct_9fa48("2245") ? "" : (stryCov_9fa48("2245"), "Struktura:"),
          stats_bridge_line: stryMutAct_9fa48("2246") ? "" : (stryCov_9fa48("2246"), "- {0}: {1}"),
          stats_section_proofing: stryMutAct_9fa48("2247") ? "" : (stryCov_9fa48("2247"), "Jezik provere:"),
          stats_proof_target: stryMutAct_9fa48("2248") ? "" : (stryCov_9fa48("2248"), "- Ciljni jezik: {0}"),
          stats_proof_changed_runs: stryMutAct_9fa48("2249")
              ? ""
              : (stryCov_9fa48("2249"), "- Izmenjeno blokova: {0}"),
          stats_proof_skipped_runs: stryMutAct_9fa48("2250")
              ? ""
              : (stryCov_9fa48("2250"), "- Preskočeno blokova: {0}"),
          stats_proof_skipped_by_reason: stryMutAct_9fa48("2251")
              ? ""
              : (stryCov_9fa48("2251"), "- Razlog preskakanja:"),
          stats_proof_reason_line: stryMutAct_9fa48("2252") ? "" : (stryCov_9fa48("2252"), "  - {0}: {1}"),
          stats_line_headers_footers: stryMutAct_9fa48("2253")
              ? ""
              : (stryCov_9fa48("2253"), "Zaglavlja/Podnožja: {0}"),
          stats_line_footnotes: stryMutAct_9fa48("2254") ? "" : (stryCov_9fa48("2254"), "Fusnote: {0}"),
          stats_line_endnotes: stryMutAct_9fa48("2255") ? "" : (stryCov_9fa48("2255"), "Endnote: {0}"),
          stats_line_chars: stryMutAct_9fa48("2256") ? "" : (stryCov_9fa48("2256"), "Karakteri: {0}"),
          profile_custom: stryMutAct_9fa48("2257") ? "" : (stryCov_9fa48("2257"), "Ručno"),
          profile_it: stryMutAct_9fa48("2258") ? "" : (stryCov_9fa48("2258"), "IT / Tehnologija"),
          profile_finance: stryMutAct_9fa48("2259") ? "" : (stryCov_9fa48("2259"), "Finansije / Bankarstvo"),
          profile_medical: stryMutAct_9fa48("2260") ? "" : (stryCov_9fa48("2260"), "Medicina / Farmacija"),
          profile_legal: stryMutAct_9fa48("2261") ? "" : (stryCov_9fa48("2261"), "Pravo / Administracija"),
          profile_marketing: stryMutAct_9fa48("2262")
              ? ""
              : (stryCov_9fa48("2262"), "Marketing / Društvene mreže"),
          profile_journalism: stryMutAct_9fa48("2263") ? "" : (stryCov_9fa48("2263"), "Novinarstvo / Mediji"),
          stats_line_nodes_changed_one: stryMutAct_9fa48("2264")
              ? ""
              : (stryCov_9fa48("2264"), "Promenjen {0} čvor"),
          stats_line_nodes_changed_few: stryMutAct_9fa48("2265")
              ? ""
              : (stryCov_9fa48("2265"), "Promenjena {0} čvora"),
          stats_line_nodes_changed_many: stryMutAct_9fa48("2266")
              ? ""
              : (stryCov_9fa48("2266"), "Promenjeno {0} čvorova"),
          error_max_retries_exceeded: stryMutAct_9fa48("2267")
              ? ""
              : (stryCov_9fa48("2267"), "Maksimalan broj pokušaja prekoračen"),
          error_network_retrying: stryMutAct_9fa48("2268")
              ? ""
              : (stryCov_9fa48("2268"), "Mrežna greška, pokušavam ponovo..."),
          error_word_api_retrying: stryMutAct_9fa48("2269")
              ? ""
              : (stryCov_9fa48("2269"), "Word API greška, pokušavam ponovo..."),
          error_out_of_memory_split_document: stryMutAct_9fa48("2270")
              ? ""
              : (stryCov_9fa48("2270"), "Dokument je prevelik. Molimo podelite ga na manje delove."),
          error_selection_lost: stryMutAct_9fa48("2271")
              ? ""
              : (stryCov_9fa48("2271"), "Selekcija je izgubljena. Molimo selektujte ponovo."),
          perf_slow_operation: stryMutAct_9fa48("2272")
              ? ""
              : (stryCov_9fa48("2272"), "Operacija traje duže od očekivanog..."),
          perf_very_slow_warning: stryMutAct_9fa48("2273")
              ? ""
              : (stryCov_9fa48("2273"), "Processing is very slow. Consider splitting the document."),
          tour_skip: stryMutAct_9fa48("2274") ? "" : (stryCov_9fa48("2274"), "Preskoči"),
          tour_next: stryMutAct_9fa48("2275") ? "" : (stryCov_9fa48("2275"), "Dalje"),
          tour_finish: stryMutAct_9fa48("2276") ? "" : (stryCov_9fa48("2276"), "Kreni!"),
          tour_step1_title: stryMutAct_9fa48("2277") ? "" : (stryCov_9fa48("2277"), "Dobrodošli! 👋"),
          tour_step1_text: stryMutAct_9fa48("2278")
              ? ""
              : (stryCov_9fa48("2278"),
                "Izaberite <b>Profil</b> (npr. IT, Pravo) da automatski zaštitite stručne termine..."),
          tour_step2_title: stryMutAct_9fa48("2279") ? "" : (stryCov_9fa48("2279"), "Vaše Reči 🛡️"),
          tour_step2_text: stryMutAct_9fa48("2280")
              ? ""
              : (stryCov_9fa48("2280"), "Imena firmi i specifične reči dodajte u <b>Zaštićeno</b>..."),
          tour_step3_title: stryMutAct_9fa48("2281") ? "" : (stryCov_9fa48("2281"), "Pregled pre Primene 👁️"),
          tour_step3_text: stryMutAct_9fa48("2282")
              ? ""
              : (stryCov_9fa48("2282"), "Koristite dugme <b>PREGLED</b> da vidite i izaberete izmene..."),
          lbl_support: stryMutAct_9fa48("2283") ? "" : (stryCov_9fa48("2283"), "Podrška"),
          btn_export_logs: stryMutAct_9fa48("2284") ? "" : (stryCov_9fa48("2284"), "Sačuvaj logove (Debug)"),
          web_clipboard_header: stryMutAct_9fa48("2285")
              ? ""
              : (stryCov_9fa48("2285"), "Brzi tekst / Clipboard"),
          web_clipboard_placeholder: stryMutAct_9fa48("2286")
              ? ""
              : (stryCov_9fa48("2286"), "Nalepi tekst ovde (Ctrl+V)..."),
          web_clipboard_convert: stryMutAct_9fa48("2287") ? "" : (stryCov_9fa48("2287"), "Preslovi Tekst"),
          web_clipboard_copy: stryMutAct_9fa48("2288") ? "" : (stryCov_9fa48("2288"), "Kopiraj Rezultat"),
          web_clipboard_copied: stryMutAct_9fa48("2289") ? "" : (stryCov_9fa48("2289"), "Kopirano! ✅"),
          web_clipboard_ready: stryMutAct_9fa48("2290")
              ? ""
              : (stryCov_9fa48("2290"), "Spremno za novi tekst..."),
          web_convert_error: stryMutAct_9fa48("2291")
              ? ""
              : (stryCov_9fa48("2291"), "Greška pri konverziji."),
          msg_enter_text: stryMutAct_9fa48("2292") ? "" : (stryCov_9fa48("2292"), "Unesite neki tekst."),
          live_empty_doc: stryMutAct_9fa48("2293") ? "" : (stryCov_9fa48("2293"), "Prazan dokument"),
          live_no_text: stryMutAct_9fa48("2294") ? "" : (stryCov_9fa48("2294"), "Nema teksta"),
          live_sel_words: stryMutAct_9fa48("2295") ? "" : (stryCov_9fa48("2295"), "Selekcija: {0}"),
          live_doc_words: stryMutAct_9fa48("2296") ? "" : (stryCov_9fa48("2296"), "Dokument: {0}"),
          word_count: stryMutAct_9fa48("2297") ? "" : (stryCov_9fa48("2297"), "{0} reči"),
          word_count_one: stryMutAct_9fa48("2298") ? "" : (stryCov_9fa48("2298"), "{0} reč"),
          word_count_few: stryMutAct_9fa48("2299") ? "" : (stryCov_9fa48("2299"), "{0} reči"),
          word_count_many: stryMutAct_9fa48("2300") ? "" : (stryCov_9fa48("2300"), "{0} reči"),
          char_count: stryMutAct_9fa48("2301") ? "" : (stryCov_9fa48("2301"), "{0} znaka"),
          char_count_one: stryMutAct_9fa48("2302") ? "" : (stryCov_9fa48("2302"), "{0} znak"),
          char_count_few: stryMutAct_9fa48("2303") ? "" : (stryCov_9fa48("2303"), "{0} znaka"),
          char_count_many: stryMutAct_9fa48("2304") ? "" : (stryCov_9fa48("2304"), "{0} znakova"),
          live_auto_to_cyr: stryMutAct_9fa48("2305") ? "" : (stryCov_9fa48("2305"), "Auto (→ Ćir)"),
          live_auto_to_lat: stryMutAct_9fa48("2306") ? "" : (stryCov_9fa48("2306"), "Auto (→ Lat)"),
          live_target_cyr: stryMutAct_9fa48("2307") ? "" : (stryCov_9fa48("2307"), "→ Ćirilica"),
          live_target_lat: stryMutAct_9fa48("2308") ? "" : (stryCov_9fa48("2308"), "→ Latin"),
          live_target_ascii: stryMutAct_9fa48("2309") ? "" : (stryCov_9fa48("2309"), "→ ASCII"),
          live_warn_ascii: stryMutAct_9fa48("2310") ? "" : (stryCov_9fa48("2310"), " (ASCII?)"),
          web_drop_overlay_title: stryMutAct_9fa48("2311")
              ? ""
              : (stryCov_9fa48("2311"), "Prevucite fajl ovde"),
          tooltip_run_shortcut: stryMutAct_9fa48("2312") ? "" : (stryCov_9fa48("2312"), " (Alt+Enter)"),
          tooltip_preview_shortcut: stryMutAct_9fa48("2313") ? "" : (stryCov_9fa48("2313"), " (Alt+P)"),
          msg_offline: stryMutAct_9fa48("2314")
              ? ""
              : (stryCov_9fa48("2314"), "📡 Nema interneta? Nema problema. Radim offline."),
          msg_online: stryMutAct_9fa48("2315") ? "" : (stryCov_9fa48("2315"), "🌐 Ponovo na mreži."),
      });
