// @ts-nocheck
// src/shared/locales/en.ts
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
import { SR_RS } from "./sr";
export type TranslationKey = keyof typeof SR_RS;
export const EN_US: Record<TranslationKey, string> = stryMutAct_9fa48("1818")
    ? {}
    : (stryCov_9fa48("1818"),
      {
          app_title: stryMutAct_9fa48("1819") ? "" : (stryCov_9fa48("1819"), "Serbian Transliterator"),
          ui_version_prefix: stryMutAct_9fa48("1820") ? "" : (stryCov_9fa48("1820"), "v"),
          section_settings: stryMutAct_9fa48("1821") ? "" : (stryCov_9fa48("1821"), "SETTINGS"),
          btn_export: stryMutAct_9fa48("1822") ? "" : (stryCov_9fa48("1822"), "Export"),
          btn_import: stryMutAct_9fa48("1823") ? "" : (stryCov_9fa48("1823"), "Import"),
          btn_export_title: stryMutAct_9fa48("1824") ? "" : (stryCov_9fa48("1824"), "Export settings"),
          btn_import_title: stryMutAct_9fa48("1825") ? "" : (stryCov_9fa48("1825"), "Import settings"),
          section_profile: stryMutAct_9fa48("1826") ? "" : (stryCov_9fa48("1826"), "PROFILE"),
          btn_reset_factory: stryMutAct_9fa48("1827") ? "" : (stryCov_9fa48("1827"), "Reset"),
          // [CHANGE]
          profile_select_aria: stryMutAct_9fa48("1828") ? "" : (stryCov_9fa48("1828"), "Profile select"),
          section_direction: stryMutAct_9fa48("1829") ? "" : (stryCov_9fa48("1829"), "TARGET SCRIPT"),
          dir_auto: stryMutAct_9fa48("1830") ? "" : (stryCov_9fa48("1830"), "Automatic"),
          dir_to_ascii: stryMutAct_9fa48("1831") ? "" : (stryCov_9fa48("1831"), "→ ASCII Lat"),
          dir_lat_to_cyr: stryMutAct_9fa48("1832") ? "" : (stryCov_9fa48("1832"), "→ Cyrillic"),
          dir_cyr_to_lat: stryMutAct_9fa48("1833") ? "" : (stryCov_9fa48("1833"), "→ Latin"),
          dir_auto_short: stryMutAct_9fa48("1834") ? "" : (stryCov_9fa48("1834"), "Auto"),
          section_options: stryMutAct_9fa48("1835") ? "" : (stryCov_9fa48("1835"), "OPTIONS"),
          opt_confirm_whole_doc: stryMutAct_9fa48("1836")
              ? ""
              : (stryCov_9fa48("1836"), "Confirm processing the whole document"),
          opt_include_headers_footers: stryMutAct_9fa48("1837")
              ? ""
              : (stryCov_9fa48("1837"), "Include headers/footers"),
          opt_include_footnotes: stryMutAct_9fa48("1838") ? "" : (stryCov_9fa48("1838"), "Include footnotes"),
          opt_include_endnotes: stryMutAct_9fa48("1839") ? "" : (stryCov_9fa48("1839"), "Include endnotes"),
          opt_protect_brands: stryMutAct_9fa48("1840")
              ? ""
              : (stryCov_9fa48("1840"), "Protect brands (Windows, ...)"),
          opt_smart_quotes: stryMutAct_9fa48("1841") ? "" : (stryCov_9fa48("1841"), "Smart quotes ( „ … “ )"),
          opt_preserve_code_before: stryMutAct_9fa48("1842")
              ? ""
              : (stryCov_9fa48("1842"), "Preserve code ("),
          ui_inline_code_word: stryMutAct_9fa48("1843") ? "" : (stryCov_9fa48("1843"), "inline"),
          opt_preserve_code_between: stryMutAct_9fa48("1844") ? "" : (stryCov_9fa48("1844"), " / "),
          ui_block_code_word: stryMutAct_9fa48("1845") ? "" : (stryCov_9fa48("1845"), "block"),
          opt_preserve_code_after: stryMutAct_9fa48("1846") ? "" : (stryCov_9fa48("1846"), ")"),
          section_corrections: stryMutAct_9fa48("1847") ? "" : (stryCov_9fa48("1847"), "CORRECTIONS"),
          opt_fix_spaces: stryMutAct_9fa48("1848") ? "" : (stryCov_9fa48("1848"), "Remove extra spaces"),
          section_advanced: stryMutAct_9fa48("1849") ? "" : (stryCov_9fa48("1849"), "ADVANCED"),
          btn_toggle_advanced: stryMutAct_9fa48("1850") ? "" : (stryCov_9fa48("1850"), "Advanced"),
          btn_toggle_advanced_title: stryMutAct_9fa48("1851")
              ? ""
              : (stryCov_9fa48("1851"), "Show/hide advanced settings"),
          opt_ui_language_label: stryMutAct_9fa48("1852") ? "" : (stryCov_9fa48("1852"), "Language"),
          // [CHANGE] Shortened
          opt_ui_language_aria: stryMutAct_9fa48("1853")
              ? ""
              : (stryCov_9fa48("1853"), "UI language selection"),
          opt_ui_language_sr: stryMutAct_9fa48("1854") ? "" : (stryCov_9fa48("1854"), "Serbian (default)"),
          opt_ui_language_en: stryMutAct_9fa48("1855") ? "" : (stryCov_9fa48("1855"), "English"),
          opt_ui_language_auto: stryMutAct_9fa48("1856")
              ? ""
              : (stryCov_9fa48("1856"), "Auto (Office/browser)"),
          opt_ui_language_hint: stryMutAct_9fa48("1857")
              ? ""
              : (stryCov_9fa48("1857"), "Changes UI language..."),
          ui_theme_label: stryMutAct_9fa48("1858") ? "" : (stryCov_9fa48("1858"), "Theme"),
          ui_theme_aria: stryMutAct_9fa48("1859") ? "" : (stryCov_9fa48("1859"), "Theme selection"),
          ui_theme_auto: stryMutAct_9fa48("1860") ? "" : (stryCov_9fa48("1860"), "Auto"),
          dir_lat_to_cyr_short: stryMutAct_9fa48("1861") ? "" : (stryCov_9fa48("1861"), "→ Cyr"),
          dir_cyr_to_lat_short: stryMutAct_9fa48("1862") ? "" : (stryCov_9fa48("1862"), "→ Lat"),
          dir_to_ascii_short: stryMutAct_9fa48("1863") ? "" : (stryCov_9fa48("1863"), "→ ASCII"),
          ui_theme_light: stryMutAct_9fa48("1864") ? "" : (stryCov_9fa48("1864"), "Light ☀️"),
          ui_theme_dark: stryMutAct_9fa48("1865") ? "" : (stryCov_9fa48("1865"), "Dark 🌙"),
          opt_curly_label_before: stryMutAct_9fa48("1866") ? "" : (stryCov_9fa48("1866"), "Protection for "),
          opt_curly_label_after: stryMutAct_9fa48("1867") ? "" : (stryCov_9fa48("1867"), " blocks"),
          opt_curly_aria: stryMutAct_9fa48("1868") ? "" : (stryCov_9fa48("1868"), "Curly braces protection"),
          opt_curly_placeholders: stryMutAct_9fa48("1869")
              ? ""
              : (stryCov_9fa48("1869"), "Only placeholders (e.g. {USER_NAME})"),
          opt_curly_all: stryMutAct_9fa48("1870")
              ? ""
              : (stryCov_9fa48("1870"), "Everything inside {...} (legacy)"),
          opt_curly_none: stryMutAct_9fa48("1871") ? "" : (stryCov_9fa48("1871"), "Do not protect {...}"),
          opt_curly_hint: stryMutAct_9fa48("1872")
              ? ""
              : (stryCov_9fa48("1872"), "Controls whether text inside curly braces is transliterated."),
          opt_protect_romans: stryMutAct_9fa48("1873")
              ? ""
              : (stryCov_9fa48("1873"), "Protect Roman numerals (IV, XIV)"),
          opt_set_proofing_language: stryMutAct_9fa48("1874")
              ? ""
              : (stryCov_9fa48("1874"), "Set proofing language (sr-Cyrl / sr-Latn)"),
          opt_format_dates: stryMutAct_9fa48("1875")
              ? ""
              : (stryCov_9fa48("1875"), "Format dates (e.g. 21.10.2023.)"),
          opt_format_dates_hint: stryMutAct_9fa48("1876")
              ? ""
              : (stryCov_9fa48("1876"), "This option changes content (not just transliteration)."),
          opt_custom_subs_label: stryMutAct_9fa48("1877")
              ? ""
              : (stryCov_9fa48("1877"), "Custom Substitutions (Source -> Dest)"),
          opt_custom_subs_placeholder: stryMutAct_9fa48("1878")
              ? ""
              : (stryCov_9fa48("1878"), "vreme -> vrijeme\nlepo -> lijepo"),
          opt_custom_subs_hint: stryMutAct_9fa48("1879")
              ? ""
              : (stryCov_9fa48("1879"), "One rule per line. Applied last."),
          subs_list_empty: stryMutAct_9fa48("1880")
              ? ""
              : (stryCov_9fa48("1880"), "No substitutions defined."),
          subs_input_src: stryMutAct_9fa48("1881") ? "" : (stryCov_9fa48("1881"), "Source (e.g. lepo)"),
          subs_input_dest: stryMutAct_9fa48("1882") ? "" : (stryCov_9fa48("1882"), "Dest (e.g. lijepo)"),
          subs_input_src_short: stryMutAct_9fa48("1883") ? "" : (stryCov_9fa48("1883"), "src"),
          subs_input_dest_short: stryMutAct_9fa48("1884") ? "" : (stryCov_9fa48("1884"), "dest"),
          opt_dialect_label: stryMutAct_9fa48("1885") ? "" : (stryCov_9fa48("1885"), "Dialect / Script"),
          opt_dialect_aria: stryMutAct_9fa48("1886") ? "" : (stryCov_9fa48("1886"), "Dialect selection"),
          opt_dialect_none: stryMutAct_9fa48("1887")
              ? ""
              : (stryCov_9fa48("1887"), "Transliteration only (Standard)"),
          opt_dialect_ei: stryMutAct_9fa48("1888")
              ? ""
              : (stryCov_9fa48("1888"), "Ekavica → Ijekavica (beta)"),
          opt_dialect_ie: stryMutAct_9fa48("1889")
              ? ""
              : (stryCov_9fa48("1889"), "Ijekavica → Ekavica (beta)"),
          // [FIX] Added missing keys
          opt_ignored_styles_label: stryMutAct_9fa48("1890") ? "" : (stryCov_9fa48("1890"), "Ignored Styles"),
          opt_ignored_styles_hint: stryMutAct_9fa48("1891")
              ? ""
              : (stryCov_9fa48("1891"), "Text in these styles (e.g. 'Code') will not be transliterated."),
          opt_ignored_styles_placeholder: stryMutAct_9fa48("1892")
              ? ""
              : (stryCov_9fa48("1892"), "Code\nQuote"),
          section_protected: stryMutAct_9fa48("1893") ? "" : (stryCov_9fa48("1893"), "PROTECTED"),
          btn_add_word_title: stryMutAct_9fa48("1894") ? "" : (stryCov_9fa48("1894"), "Add word"),
          btn_clear_custom: stryMutAct_9fa48("1895") ? "" : (stryCov_9fa48("1895"), "Mine"),
          btn_clear_preset: stryMutAct_9fa48("1896") ? "" : (stryCov_9fa48("1896"), "Profile"),
          btn_clear_all: stryMutAct_9fa48("1897") ? "" : (stryCov_9fa48("1897"), "All"),
          btn_clear_custom_title: stryMutAct_9fa48("1898") ? "" : (stryCov_9fa48("1898"), "Clear my tags"),
          btn_clear_preset_title: stryMutAct_9fa48("1899")
              ? ""
              : (stryCov_9fa48("1899"), "Clear profile tags"),
          btn_clear_all_title: stryMutAct_9fa48("1900") ? "" : (stryCov_9fa48("1900"), "Clear all words"),
          tags_input_placeholder: stryMutAct_9fa48("1901")
              ? ""
              : (stryCov_9fa48("1901"), "Type a word or phrase..."),
          tags_hint: stryMutAct_9fa48("1902") ? "" : (stryCov_9fa48("1902"), "These words remain unchanged."),
          tags_filter_placeholder: stryMutAct_9fa48("1903")
              ? ""
              : (stryCov_9fa48("1903"), "🔍 Filter tags..."),
          tags_filter_aria: stryMutAct_9fa48("1904") ? "" : (stryCov_9fa48("1904"), "Filter protected words"),
          footer_help: stryMutAct_9fa48("1905") ? "" : (stryCov_9fa48("1905"), "Help"),
          footer_privacy: stryMutAct_9fa48("1906") ? "" : (stryCov_9fa48("1906"), "Privacy"),
          footer_copyright: stryMutAct_9fa48("1907") ? "" : (stryCov_9fa48("1907"), "© 2026"),
          footer_donate: stryMutAct_9fa48("1908") ? "" : (stryCov_9fa48("1908"), "Support ❤️"),
          ui_stats_accordion_header: stryMutAct_9fa48("1909") ? "" : (stryCov_9fa48("1909"), "STATISTICS"),
          ui_stats_empty_placeholder: stryMutAct_9fa48("1910")
              ? ""
              : (stryCov_9fa48("1910"), "(No data available)"),
          status_ready: stryMutAct_9fa48("1911") ? "" : (stryCov_9fa48("1911"), "Ready."),
          status_generating_preview: stryMutAct_9fa48("1912")
              ? ""
              : (stryCov_9fa48("1912"), "Generating preview..."),
          status_processing: stryMutAct_9fa48("1913") ? "" : (stryCov_9fa48("1913"), "Processing..."),
          status_no_changes: stryMutAct_9fa48("1914") ? "" : (stryCov_9fa48("1914"), "No changes."),
          status_cancelled: stryMutAct_9fa48("1915") ? "" : (stryCov_9fa48("1915"), "Cancelled."),
          status_empty_doc: stryMutAct_9fa48("1916") ? "" : (stryCov_9fa48("1916"), "Document is empty."),
          status_settings_saved: stryMutAct_9fa48("1917")
              ? ""
              : (stryCov_9fa48("1917"), "Settings restored (words preserved)."),
          status_settings_loaded: stryMutAct_9fa48("1918")
              ? ""
              : (stryCov_9fa48("1918"), "Settings loaded successfully."),
          status_settings_error: stryMutAct_9fa48("1919")
              ? ""
              : (stryCov_9fa48("1919"), "Error: Invalid file."),
          status_profile_changed: stryMutAct_9fa48("1920")
              ? ""
              : (stryCov_9fa48("1920"), "Profile changed to: {0}"),
          status_done_selection: stryMutAct_9fa48("1921") ? "" : (stryCov_9fa48("1921"), "Done: {0} ({1}ms)"),
          status_done_document: stryMutAct_9fa48("1922")
              ? ""
              : (stryCov_9fa48("1922"), "Done: {0} ({1}ms){2}"),
          status_preview_applied: stryMutAct_9fa48("1923")
              ? ""
              : (stryCov_9fa48("1923"), "Done (applied from preview)."),
          status_error_prefix: stryMutAct_9fa48("1924") ? "" : (stryCov_9fa48("1924"), "Error: {0}"),
          status_no_text_found: stryMutAct_9fa48("1925")
              ? ""
              : (stryCov_9fa48("1925"), "No text found to process."),
          status_processing_headers_footers: stryMutAct_9fa48("1926")
              ? ""
              : (stryCov_9fa48("1926"), "Processing: headers/footers..."),
          status_processing_footnotes: stryMutAct_9fa48("1927")
              ? ""
              : (stryCov_9fa48("1927"), "Processing: footnotes..."),
          status_processing_endnotes: stryMutAct_9fa48("1928")
              ? ""
              : (stryCov_9fa48("1928"), "Processing: endnotes..."),
          status_applying_preview: stryMutAct_9fa48("1929")
              ? ""
              : (stryCov_9fa48("1929"), "Applying preview (no re-conversion)..."),
          status_preview_cache_invalid: stryMutAct_9fa48("1930")
              ? ""
              : (stryCov_9fa48("1930"), "Preview cache invalid ({0}). Re-converting..."),
          status_preview_shown: stryMutAct_9fa48("1931")
              ? ""
              : (stryCov_9fa48("1931"), "Preview shown ({0})"),
          status_extra_headers_footers: stryMutAct_9fa48("1932") ? "" : (stryCov_9fa48("1932"), "H/F: {0}"),
          status_extra_footnotes_na: stryMutAct_9fa48("1933")
              ? ""
              : (stryCov_9fa48("1933"), "Footnotes: N/A"),
          status_extra_endnotes_na: stryMutAct_9fa48("1934") ? "" : (stryCov_9fa48("1934"), "Endnotes: N/A"),
          status_doc_too_large_short: stryMutAct_9fa48("1935")
              ? ""
              : (stryCov_9fa48("1935"), "Document too large (5MB limit)"),
          modal_title_confirm: stryMutAct_9fa48("1936") ? "" : (stryCov_9fa48("1936"), "Confirmation"),
          modal_title_error: stryMutAct_9fa48("1937") ? "" : (stryCov_9fa48("1937"), "Error"),
          modal_title_info: stryMutAct_9fa48("1938") ? "" : (stryCov_9fa48("1938"), "No changes"),
          modal_title_about: stryMutAct_9fa48("1939") ? "" : (stryCov_9fa48("1939"), "About App"),
          btn_ok: stryMutAct_9fa48("1940") ? "" : (stryCov_9fa48("1940"), "OK"),
          btn_cancel: stryMutAct_9fa48("1941") ? "" : (stryCov_9fa48("1941"), "Cancel"),
          btn_close: stryMutAct_9fa48("1942") ? "" : (stryCov_9fa48("1942"), "Close"),
          btn_load_more: stryMutAct_9fa48("1943") ? "" : (stryCov_9fa48("1943"), "Load more"),
          btn_apply: stryMutAct_9fa48("1944") ? "" : (stryCov_9fa48("1944"), "APPLY"),
          ui_btn_run: stryMutAct_9fa48("1945") ? "" : (stryCov_9fa48("1945"), "APPLY"),
          ui_btn_preview: stryMutAct_9fa48("1946") ? "" : (stryCov_9fa48("1946"), "PREVIEW"),
          ui_tag_remove: stryMutAct_9fa48("1947") ? "" : (stryCov_9fa48("1947"), "Remove"),
          ui_web_mode: stryMutAct_9fa48("1948") ? "" : (stryCov_9fa48("1948"), "Web Mode"),
          web_drop_title: stryMutAct_9fa48("1949") ? "" : (stryCov_9fa48("1949"), "Drop a .docx file here"),
          web_drop_subtitle: stryMutAct_9fa48("1950") ? "" : (stryCov_9fa48("1950"), "or click to choose"),
          web_drop_invalid_file: stryMutAct_9fa48("1951")
              ? ""
              : (stryCov_9fa48("1951"), "Only .docx files are supported!"),
          preview_btn_diff: stryMutAct_9fa48("1952") ? "" : (stryCov_9fa48("1952"), "Diff"),
          preview_btn_plain: stryMutAct_9fa48("1953") ? "" : (stryCov_9fa48("1953"), "Result"),
          preview_btn_side: stryMutAct_9fa48("1954") ? "" : (stryCov_9fa48("1954"), "Before/After"),
          preview_btn_copy: stryMutAct_9fa48("1955") ? "" : (stryCov_9fa48("1955"), "Copy"),
          preview_load_more_title: stryMutAct_9fa48("1956")
              ? ""
              : (stryCov_9fa48("1956"), "Load next paragraphs"),
          preview_load_more_none: stryMutAct_9fa48("1957")
              ? ""
              : (stryCov_9fa48("1957"), "No more paragraphs to load"),
          preview_label_before: stryMutAct_9fa48("1958") ? "" : (stryCov_9fa48("1958"), "Before"),
          preview_label_after: stryMutAct_9fa48("1959") ? "" : (stryCov_9fa48("1959"), "After"),
          preview_label_too_large_diff: stryMutAct_9fa48("1960")
              ? ""
              : (stryCov_9fa48("1960"), "File too large for detailed diff"),
          preview_label_truncated_perf: stryMutAct_9fa48("1961")
              ? ""
              : (stryCov_9fa48("1961"), "View truncated due to performance"),
          preview_btn_apply: stryMutAct_9fa48("1962") ? "" : (stryCov_9fa48("1962"), "APPLY"),
          preview_close_title: stryMutAct_9fa48("1963") ? "" : (stryCov_9fa48("1963"), "Close"),
          preview_diff_tip_insert: stryMutAct_9fa48("1964")
              ? ""
              : (stryCov_9fa48("1964"), "Click to reject this change"),
          preview_diff_tip_delete: stryMutAct_9fa48("1965")
              ? ""
              : (stryCov_9fa48("1965"), "Click to keep this text"),
          preview_toast_debug_logs_copied: stryMutAct_9fa48("1966")
              ? ""
              : (stryCov_9fa48("1966"), "Debug logs copied to clipboard!"),
          msg_empty_selection: stryMutAct_9fa48("1967")
              ? ""
              : (stryCov_9fa48("1967"), "Only whitespace is selected..."),
          msg_no_selection: stryMutAct_9fa48("1968") ? "" : (stryCov_9fa48("1968"), "No selection found."),
          msg_confirm_whole_doc: stryMutAct_9fa48("1969")
              ? ""
              : (stryCov_9fa48("1969"),
                "No text selected.<br/>Do you want to process the <b>WHOLE document</b>?"),
          msg_reset_confirm: stryMutAct_9fa48("1970")
              ? ""
              : (stryCov_9fa48("1970"), "This will reset options to factory defaults..."),
          msg_preview_empty: stryMutAct_9fa48("1971")
              ? ""
              : (stryCov_9fa48("1971"), "Preview failed: result is empty text."),
          msg_preview_no_changes: stryMutAct_9fa48("1972")
              ? ""
              : (stryCov_9fa48("1972"), "Text is already in the target script or no changes needed."),
          msg_preview_scope_doc: stryMutAct_9fa48("1973")
              ? ""
              : (stryCov_9fa48("1973"), "Available only when previewing the whole document"),
          msg_doc_too_large: stryMutAct_9fa48("1974")
              ? ""
              : (stryCov_9fa48("1974"), "Document is too large for automatic processing..."),
          preview_title_selection: stryMutAct_9fa48("1975") ? "" : (stryCov_9fa48("1975"), "Selection ({0})"),
          preview_title_doc: stryMutAct_9fa48("1976")
              ? ""
              : (stryCov_9fa48("1976"), "First {0} paragraphs ({1})"),
          preview_diff_no_changes: stryMutAct_9fa48("1977")
              ? ""
              : (stryCov_9fa48("1977"), "No text changes."),
          preview_toast_copied: stryMutAct_9fa48("1978") ? "" : (stryCov_9fa48("1978"), "Copied"),
          preview_toast_copy_fail: stryMutAct_9fa48("1979") ? "" : (stryCov_9fa48("1979"), "Cannot copy"),
          reason_opts_changed: stryMutAct_9fa48("1980") ? "" : (stryCov_9fa48("1980"), "settings changed"),
          reason_expired: stryMutAct_9fa48("1981") ? "" : (stryCov_9fa48("1981"), "cache expired"),
          reason_selection_changed: stryMutAct_9fa48("1982")
              ? ""
              : (stryCov_9fa48("1982"), "selection changed"),
          reason_formatting_changed: stryMutAct_9fa48("1983")
              ? ""
              : (stryCov_9fa48("1983"), "formatting/selection (OOXML) changed"),
          reason_missing: stryMutAct_9fa48("1984") ? "" : (stryCov_9fa48("1984"), "cache incomplete"),
          reason_unknown: stryMutAct_9fa48("1985") ? "" : (stryCov_9fa48("1985"), "unknown reason"),
          stats_scope_selection: stryMutAct_9fa48("1986") ? "" : (stryCov_9fa48("1986"), "Selection"),
          stats_scope_document: stryMutAct_9fa48("1987") ? "" : (stryCov_9fa48("1987"), "Whole document"),
          stats_header_apply: stryMutAct_9fa48("1988") ? "" : (stryCov_9fa48("1988"), "Stats: {0}"),
          stats_header_preview: stryMutAct_9fa48("1989")
              ? ""
              : (stryCov_9fa48("1989"), "Stats: preview applied"),
          stats_note_preview: stryMutAct_9fa48("1990")
              ? ""
              : (stryCov_9fa48("1990"), "Note: applied OOXML from preview (no re-conversion)."),
          stats_footnotes_na: stryMutAct_9fa48("1991")
              ? ""
              : (stryCov_9fa48("1991"), "Footnotes supported: NO"),
          stats_endnotes_na: stryMutAct_9fa48("1992")
              ? ""
              : (stryCov_9fa48("1992"), "Endnotes supported: NO"),
          stats_line_scope: stryMutAct_9fa48("1993") ? "" : (stryCov_9fa48("1993"), "Scope: {0}"),
          stats_line_nodes_changed: stryMutAct_9fa48("1994")
              ? ""
              : (stryCov_9fa48("1994"), "Changed {0} nodes"),
          stats_line_time_ms: stryMutAct_9fa48("1995") ? "" : (stryCov_9fa48("1995"), "Time: {0}ms"),
          stats_section_bridges: stryMutAct_9fa48("1996") ? "" : (stryCov_9fa48("1996"), "Structure:"),
          stats_bridge_line: stryMutAct_9fa48("1997") ? "" : (stryCov_9fa48("1997"), "- {0}: {1}"),
          stats_section_proofing: stryMutAct_9fa48("1998")
              ? ""
              : (stryCov_9fa48("1998"), "Proofing language:"),
          stats_proof_target: stryMutAct_9fa48("1999") ? "" : (stryCov_9fa48("1999"), "- target: {0}"),
          stats_proof_changed_runs: stryMutAct_9fa48("2000")
              ? ""
              : (stryCov_9fa48("2000"), "- changedRuns: {0}"),
          stats_proof_skipped_runs: stryMutAct_9fa48("2001")
              ? ""
              : (stryCov_9fa48("2001"), "- skippedRuns: {0}"),
          stats_proof_skipped_by_reason: stryMutAct_9fa48("2002")
              ? ""
              : (stryCov_9fa48("2002"), "- skippedByReason:"),
          stats_proof_reason_line: stryMutAct_9fa48("2003") ? "" : (stryCov_9fa48("2003"), "  - {0}: {1}"),
          stats_line_headers_footers: stryMutAct_9fa48("2004")
              ? ""
              : (stryCov_9fa48("2004"), "Header/Footer: {0}"),
          stats_line_footnotes: stryMutAct_9fa48("2005") ? "" : (stryCov_9fa48("2005"), "Footnotes: {0}"),
          stats_line_endnotes: stryMutAct_9fa48("2006") ? "" : (stryCov_9fa48("2006"), "Endnote: {0}"),
          stats_line_chars: stryMutAct_9fa48("2007") ? "" : (stryCov_9fa48("2007"), "Chars: {0}"),
          profile_custom: stryMutAct_9fa48("2008") ? "" : (stryCov_9fa48("2008"), "Custom"),
          profile_it: stryMutAct_9fa48("2009") ? "" : (stryCov_9fa48("2009"), "IT / Technology"),
          profile_finance: stryMutAct_9fa48("2010") ? "" : (stryCov_9fa48("2010"), "Finance / Banking"),
          profile_medical: stryMutAct_9fa48("2011") ? "" : (stryCov_9fa48("2011"), "Medical / Pharma"),
          profile_legal: stryMutAct_9fa48("2012") ? "" : (stryCov_9fa48("2012"), "Legal / Admin"),
          profile_marketing: stryMutAct_9fa48("2013")
              ? ""
              : (stryCov_9fa48("2013"), "Marketing / Social Media"),
          profile_journalism: stryMutAct_9fa48("2014") ? "" : (stryCov_9fa48("2014"), "Journalism / Media"),
          stats_line_nodes_changed_one: stryMutAct_9fa48("2015")
              ? ""
              : (stryCov_9fa48("2015"), "Changed {0} node"),
          stats_line_nodes_changed_few: stryMutAct_9fa48("2016")
              ? ""
              : (stryCov_9fa48("2016"), "Changed {0} nodes"),
          stats_line_nodes_changed_many: stryMutAct_9fa48("2017")
              ? ""
              : (stryCov_9fa48("2017"), "Changed {0} nodes"),
          error_max_retries_exceeded: stryMutAct_9fa48("2018")
              ? ""
              : (stryCov_9fa48("2018"), "Maximum retry attempts exceeded"),
          error_network_retrying: stryMutAct_9fa48("2019")
              ? ""
              : (stryCov_9fa48("2019"), "Network error, retrying..."),
          error_word_api_retrying: stryMutAct_9fa48("2020")
              ? ""
              : (stryCov_9fa48("2020"), "Word API error, retrying..."),
          error_out_of_memory_split_document: stryMutAct_9fa48("2021")
              ? ""
              : (stryCov_9fa48("2021"), "Document too large..."),
          error_selection_lost: stryMutAct_9fa48("2022")
              ? ""
              : (stryCov_9fa48("2022"), "Selection lost. Please select again."),
          perf_slow_operation: stryMutAct_9fa48("2023")
              ? ""
              : (stryCov_9fa48("2023"), "Operation is taking longer than expected..."),
          perf_very_slow_warning: stryMutAct_9fa48("2024")
              ? ""
              : (stryCov_9fa48("2024"), "Processing is very slow. Consider splitting the document."),
          tour_skip: stryMutAct_9fa48("2025") ? "" : (stryCov_9fa48("2025"), "Skip"),
          tour_next: stryMutAct_9fa48("2026") ? "" : (stryCov_9fa48("2026"), "Next"),
          tour_finish: stryMutAct_9fa48("2027") ? "" : (stryCov_9fa48("2027"), "Let's go!"),
          tour_step1_title: stryMutAct_9fa48("2028") ? "" : (stryCov_9fa48("2028"), "Welcome! 👋"),
          tour_step1_text: stryMutAct_9fa48("2029")
              ? ""
              : (stryCov_9fa48("2029"), "Choose a <b>Profile</b> (e.g. IT, Legal)..."),
          tour_step2_title: stryMutAct_9fa48("2030") ? "" : (stryCov_9fa48("2030"), "Your Words 🛡️"),
          tour_step2_text: stryMutAct_9fa48("2031")
              ? ""
              : (stryCov_9fa48("2031"), "Add company names and specific words to <b>Protected</b>..."),
          tour_step3_title: stryMutAct_9fa48("2032") ? "" : (stryCov_9fa48("2032"), "Preview First 👁️"),
          tour_step3_text: stryMutAct_9fa48("2033")
              ? ""
              : (stryCov_9fa48("2033"), "Use the <b>PREVIEW</b> button..."),
          lbl_support: stryMutAct_9fa48("2034") ? "" : (stryCov_9fa48("2034"), "Support"),
          btn_export_logs: stryMutAct_9fa48("2035") ? "" : (stryCov_9fa48("2035"), "Save logs (Debug)"),
          web_clipboard_header: stryMutAct_9fa48("2036")
              ? ""
              : (stryCov_9fa48("2036"), "Quick Text / Clipboard"),
          web_clipboard_placeholder: stryMutAct_9fa48("2037")
              ? ""
              : (stryCov_9fa48("2037"), "Paste text here (Ctrl+V)..."),
          web_clipboard_convert: stryMutAct_9fa48("2038") ? "" : (stryCov_9fa48("2038"), "Convert Text"),
          web_clipboard_copy: stryMutAct_9fa48("2039") ? "" : (stryCov_9fa48("2039"), "Copy Result"),
          web_clipboard_copied: stryMutAct_9fa48("2040") ? "" : (stryCov_9fa48("2040"), "Copied! ✅"),
          web_clipboard_ready: stryMutAct_9fa48("2041")
              ? ""
              : (stryCov_9fa48("2041"), "Ready for new text..."),
          web_convert_error: stryMutAct_9fa48("2042") ? "" : (stryCov_9fa48("2042"), "Conversion error."),
          msg_enter_text: stryMutAct_9fa48("2043") ? "" : (stryCov_9fa48("2043"), "Please enter some text."),
          live_empty_doc: stryMutAct_9fa48("2044") ? "" : (stryCov_9fa48("2044"), "Empty document"),
          live_no_text: stryMutAct_9fa48("2045") ? "" : (stryCov_9fa48("2045"), "No text"),
          live_sel_words: stryMutAct_9fa48("2046") ? "" : (stryCov_9fa48("2046"), "Selection: {0}"),
          live_doc_words: stryMutAct_9fa48("2047") ? "" : (stryCov_9fa48("2047"), "Document: {0}"),
          word_count: stryMutAct_9fa48("2048") ? "" : (stryCov_9fa48("2048"), "{0} words"),
          word_count_one: stryMutAct_9fa48("2049") ? "" : (stryCov_9fa48("2049"), "{0} word"),
          word_count_few: stryMutAct_9fa48("2050") ? "" : (stryCov_9fa48("2050"), "{0} words"),
          word_count_many: stryMutAct_9fa48("2051") ? "" : (stryCov_9fa48("2051"), "{0} words"),
          char_count: stryMutAct_9fa48("2052") ? "" : (stryCov_9fa48("2052"), "{0} chars"),
          char_count_one: stryMutAct_9fa48("2053") ? "" : (stryCov_9fa48("2053"), "{0} char"),
          char_count_few: stryMutAct_9fa48("2054") ? "" : (stryCov_9fa48("2054"), "{0} chars"),
          char_count_many: stryMutAct_9fa48("2055") ? "" : (stryCov_9fa48("2055"), "{0} chars"),
          live_auto_to_cyr: stryMutAct_9fa48("2056") ? "" : (stryCov_9fa48("2056"), "Auto (→ Cyr)"),
          live_auto_to_lat: stryMutAct_9fa48("2057") ? "" : (stryCov_9fa48("2057"), "Auto (→ Lat)"),
          live_target_cyr: stryMutAct_9fa48("2058") ? "" : (stryCov_9fa48("2058"), "→ Cyrillic"),
          live_target_lat: stryMutAct_9fa48("2059") ? "" : (stryCov_9fa48("2059"), "→ Latin"),
          live_target_ascii: stryMutAct_9fa48("2060") ? "" : (stryCov_9fa48("2060"), "→ ASCII"),
          live_warn_ascii: stryMutAct_9fa48("2061") ? "" : (stryCov_9fa48("2061"), " (ASCII?)"),
          web_drop_overlay_title: stryMutAct_9fa48("2062") ? "" : (stryCov_9fa48("2062"), "Drop file here"),
          tooltip_run_shortcut: stryMutAct_9fa48("2063") ? "" : (stryCov_9fa48("2063"), " (Alt+Enter)"),
          tooltip_preview_shortcut: stryMutAct_9fa48("2064") ? "" : (stryCov_9fa48("2064"), " (Alt+P)"),
          msg_offline: stryMutAct_9fa48("2065")
              ? ""
              : (stryCov_9fa48("2065"), "📡 No internet? No problem. Working offline."),
          msg_online: stryMutAct_9fa48("2066") ? "" : (stryCov_9fa48("2066"), "🌐 Back online."),
      });
