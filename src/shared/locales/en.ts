// src/shared/locales/en.ts

import { SR_RS } from "./sr";

export type TranslationKey = keyof typeof SR_RS;

export const EN_US: Record<TranslationKey, string> = {
    // Meta (added to match SR_RS)
    name: "English",
    dir: "ltr",

    // Common
    btn_ok: "OK",
    btn_cancel: "Cancel",
    btn_close: "Close",
    btn_export: "Export",
    btn_import: "Import",
    btn_export_title: "Export settings",
    btn_import_title: "Import settings",

    // App / Sections
    app_title: "Serbian Transliterator",
    ui_version_prefix: "v",
    section_settings: "SETTINGS",
    section_profile: "PROFILE",
    section_direction: "TARGET SCRIPT",
    section_options: "OPTIONS",
    section_corrections: "CORRECTIONS",
    section_advanced: "ADVANCED",
    section_protected: "PROTECTED",

    // Profiles
    profile_select_aria: "Profile select",
    profile_custom: "Custom",
    profile_it: "IT / Technology",
    profile_finance: "Finance / Banking",
    profile_medical: "Medical / Pharma",
    profile_legal: "Legal / Admin",
    profile_marketing: "Marketing / Social Media",
    profile_journalism: "Journalism / Media",
    status_profile_changed: "Profile changed to: {0}",

    // Factory reset / basic buttons
    btn_reset_factory: "Reset",
    msg_reset_confirm: "This will reset options to factory defaults...",

    // Directions (long)
    dir_auto: "Automatic",
    dir_lat_to_cyr: "→ Cyrillic",
    dir_cyr_to_lat: "→ Latin",
    dir_to_ascii: "→ ASCII Lat",

    // Directions (short)
    dir_auto_short: "Auto",
    dir_lat_to_cyr_short: "→ Cyr",
    dir_cyr_to_lat_short: "→ Lat",
    dir_to_ascii_short: "→ ASCII",

    // Theme
    ui_theme_label: "Theme",
    ui_theme_aria: "Theme selection",
    ui_theme_auto: "Auto",
    ui_theme_light: "Light ☀️",
    ui_theme_dark: "Dark 🌙",

    // UI language (Office/taskpane)
    opt_ui_language_label: "Language",
    opt_ui_language_aria: "UI language selection",
    opt_ui_language_sr: "Serbian (default)",
    opt_ui_language_en: "English",
    opt_ui_language_auto: "Auto (Office/browser)",
    opt_ui_language_hint: "Changes UI language...",

    // Options
    opt_confirm_whole_doc: "Confirm processing the whole document",
    opt_include_headers_footers: "Include headers/footers",
    opt_include_footnotes: "Include footnotes",
    opt_include_endnotes: "Include endnotes",
    opt_protect_brands: "Protect brands (Windows, ...)",
    opt_smart_quotes: "Smart quotes ( „ … “ )",

    // Preserve code (label pieces)
    opt_preserve_code_before: "Preserve code (",
    ui_inline_code_word: "inline",
    opt_preserve_code_between: " / ",
    ui_block_code_word: "block",
    opt_preserve_code_after: ")",

    // Corrections
    opt_fix_spaces: "Remove extra spaces",

    // Curly braces protection (Office/taskpane)
    opt_curly_label_before: "Protection for ",
    opt_curly_label_after: " blocks",
    opt_curly_aria: "Curly braces protection",
    opt_curly_placeholders: "Only placeholders (e.g. {USER_NAME})",
    opt_curly_all: "Everything inside {...} (legacy)",
    opt_curly_none: "Do not protect {...}",
    opt_curly_hint: "Controls whether text inside curly braces is transliterated.",

    // Advanced options
    opt_protect_romans: "Protect Roman numerals (IV, XIV)",
    opt_set_proofing_language: "Set proofing language (sr-Cyrl / sr-Latn)",
    opt_format_dates: "Format dates (e.g. 21.10.2023.)",
    opt_format_dates_hint: "This option changes content (not just transliteration).",

    // Custom substitutions (Office/taskpane)
    opt_custom_subs_label: "Custom Substitutions (Source -> Dest)",
    opt_custom_subs_placeholder: "vreme -> vrijeme\nlepo -> lijepo",
    opt_custom_subs_hint: "One rule per line. Applied last.",
    subs_list_empty: "No substitutions defined.",
    subs_input_src: "Source (e.g. lepo)",
    subs_input_dest: "Dest (e.g. lijepo)",
    subs_input_src_short: "src",
    subs_input_dest_short: "dest",

    // Dialect (Office/taskpane)
    opt_dialect_label: "Dialect / Script",
    opt_dialect_aria: "Dialect selection",
    opt_dialect_none: "Transliteration only (Standard)",
    opt_dialect_ei: "Ekavica → Ijekavica (beta)",
    opt_dialect_ie: "Ijekavica → Ekavica (beta)",

    // Ignored styles (Office/taskpane)
    opt_ignored_styles_label: "Ignored Styles",
    opt_ignored_styles_hint: "Text in these styles (e.g. 'Code') will not be transliterated.",
    opt_ignored_styles_placeholder: "Code\nQuote",

    // Protected tags (Office/taskpane)
    btn_add_word_title: "Add word",
    btn_clear_custom: "Mine",
    btn_clear_preset: "Profile",
    btn_clear_all: "All",
    btn_clear_custom_title: "Clear my tags",
    btn_clear_preset_title: "Clear profile tags",
    btn_clear_all_title: "Clear all words",
    tags_input_placeholder: "Type a word or phrase...",
    tags_hint: "These words remain unchanged.",
    tags_filter_placeholder: "🔍 Filter tags...",
    tags_filter_aria: "Filter protected words",

    // Footer (Office/taskpane)
    footer_help: "Help",
    footer_privacy: "Privacy",
    footer_copyright: "© 2026",
    footer_donate: "Support ❤️",
    lbl_support: "Support",

    // Stats accordion header
    ui_stats_accordion_header: "STATISTICS",
    ui_stats_empty_placeholder: "(No data available)",

    // Status messages (Office/taskpane)
    status_ready: "Ready.",
    status_generating_preview: "Generating preview...",
    status_processing: "Processing...",
    status_no_changes: "No changes.",
    status_cancelled: "Cancelled.",
    status_empty_doc: "Document is empty.",
    status_settings_saved: "Settings restored (words preserved).",
    status_settings_loaded: "Settings loaded successfully.",
    status_settings_error: "Error: Invalid file.",
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

    // Modals
    modal_title_confirm: "Confirmation",
    modal_title_error: "Error",
    modal_title_info: "No changes",
    modal_title_about: "About App",
    modal_title_debug: "Diagnostics (Debug)",

    // UI buttons (Office/taskpane)
    btn_load_more: "Load more",
    btn_apply: "APPLY",
    ui_btn_run: "APPLY",
    ui_btn_preview: "PREVIEW",

    // Tag remove label
    ui_tag_remove: "Remove",

    // Web mode label
    ui_web_mode: "Web Mode",

    // Web: drag/drop generic (Office-web shared)
    web_drop_title: "Drop a .docx file here",
    web_drop_subtitle: "or click to choose",
    web_drop_invalid_file: "Only .docx files are supported!",
    web_drop_overlay_title: "Drop file here",

    // Preview UI
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
    preview_btn_apply: "APPLY",
    preview_close_title: "Close",
    preview_diff_tip_insert: "Click to reject this change",
    preview_diff_tip_delete: "Click to keep this text",
    preview_toast_debug_logs_copied: "Debug logs copied to clipboard!",
    preview_toast_copied: "Copied",
    preview_toast_copy_fail: "Cannot copy",
    preview_title_selection: "Selection ({0})",
    preview_title_doc: "First {0} paragraphs ({1})",
    preview_diff_no_changes: "No text changes.",

    // Common messages
    msg_empty_selection: "Only whitespace is selected...",
    msg_no_selection: "No selection found.",
    msg_confirm_whole_doc: "No text selected.<br/>Do you want to process the <b>WHOLE document</b>?",
    msg_preview_empty: "Preview failed: result is empty text.",
    msg_preview_no_changes: "Text is already in the target script or no changes needed.",
    msg_preview_scope_doc: "Available only when previewing the whole document",
    msg_doc_too_large: "Document is too large for automatic processing...",
    msg_enter_text: "Please enter some text.",

    // Cache reasons
    reason_opts_changed: "settings changed",
    reason_expired: "cache expired",
    reason_selection_changed: "selection changed",
    reason_formatting_changed: "formatting/selection (OOXML) changed",
    reason_missing: "cache incomplete",
    reason_unknown: "unknown reason",

    // Stats (detailed)
    stats_scope_selection: "Selection",
    stats_scope_document: "Whole document",
    stats_header_apply: "Stats: {0}",
    stats_header_preview: "Stats: preview applied",
    stats_note_preview: "Note: applied OOXML from preview (no re-conversion).",
    stats_footnotes_na: "Footnotes supported: NO",
    stats_endnotes_na: "Endnotes supported: NO",
    stats_line_scope: "Scope: {0}",
    stats_line_nodes_changed: "Changed {0} nodes",
    stats_line_time_ms: "Time: {0}ms",
    stats_section_bridges: "Structure:",
    stats_bridge_line: "- {0}: {1}",
    stats_section_proofing: "Proofing language:",
    stats_proof_target: "- target: {0}",
    stats_proof_changed_runs: "- changedRuns: {0}",
    stats_proof_skipped_runs: "- skippedRuns: {0}",
    stats_proof_skipped_by_reason: "- skippedByReason:",
    stats_proof_reason_line: "  - {0}: {1}",
    stats_line_headers_footers: "Header/Footer: {0}",
    stats_line_footnotes: "Footnotes: {0}",
    stats_line_endnotes: "Endnote: {0}",
    stats_line_chars: "Chars: {0}",

    // Stats pluralization variants
    stats_line_nodes_changed_one: "Changed {0} node",
    stats_line_nodes_changed_few: "Changed {0} nodes",
    stats_line_nodes_changed_many: "Changed {0} nodes",

    // Errors / perf
    error_max_retries_exceeded: "Maximum retry attempts exceeded",
    error_network_retrying: "Network error, retrying...",
    error_word_api_retrying: "Word API error, retrying...",
    error_out_of_memory_split_document: "Document too large...",
    error_selection_lost: "Selection lost. Please select again.",
    perf_slow_operation: "Operation is taking longer than expected...",
    perf_very_slow_warning: "Processing is very slow. Consider splitting the document.",

    // Tour
    tour_skip: "Skip",
    tour_next: "Next",
    tour_finish: "Let's go!",
    tour_step1_title: "Welcome! 👋",
    tour_step1_text: "Choose a <b>Profile</b> (e.g. IT, Legal)...",
    tour_step2_title: "Your Words 🛡️",
    tour_step2_text: "Add company names and specific words to <b>Protected</b>...",
    tour_step3_title: "Preview First 👁️",
    tour_step3_text: "Use the <b>PREVIEW</b> button...",

    // Debug
    btn_export_logs: "Save logs (Debug)",

    // Web clipboard
    web_clipboard_header: "Quick Text / Clipboard",
    web_clipboard_placeholder: "Paste text here (Ctrl+V)...",
    web_clipboard_convert: "Convert Text",
    web_clipboard_copy: "Copy Result",
    web_clipboard_copied: "Copied! ✅",
    web_clipboard_ready: "Ready for new text...",
    web_convert_error: "Conversion error.",

    // Live
    live_empty_doc: "Empty document",
    live_no_text: "No text",
    live_sel_words: "Selection: {0}",
    live_doc_words: "Document: {0}",

    // Word/char count plural forms
    word_count: "{0} words",
    word_count_one: "{0} word",
    word_count_few: "{0} words",
    word_count_many: "{0} words",
    char_count: "{0} chars",
    char_count_one: "{0} char",
    char_count_few: "{0} chars",
    char_count_many: "{0} chars",

    // Live direction labels
    live_auto_to_cyr: "Auto (→ Cyr)",
    live_auto_to_lat: "Auto (→ Lat)",
    live_target_cyr: "→ Cyrillic",
    live_target_lat: "→ Latin",
    live_target_ascii: "→ ASCII",
    live_warn_ascii: " (ASCII?)",

    // Tooltips
    tooltip_run_shortcut: " (Alt+Enter)",
    tooltip_preview_shortcut: " (Alt+P)",

    // Online/offline messages
    msg_offline: "📡 No internet? No problem. Working offline.",
    msg_online: "🌐 Back online.",

    // ===== WEB APP (src/web) =====

    // Web UI - modes / top buttons
    web_ui_mode_files: "Files (.docx)",
    web_ui_mode_text: "Text",
    web_ui_btn_settings: "Settings",
    web_ui_btn_convert: "Convert",
    web_ui_btn_working: "Working...",

    // Web status (web app)
    web_status_live_on: "Live preview: ON",
    web_status_live_off: "Live preview: OFF",
    web_ui_status_idle: "idle",
    web_ui_status_busy_pct: "busy {0}%",

    // Web badges
    web_badge_offline: "OFFLINE",
    web_badge_offline_ready: "OFFLINE READY",
    web_status_offline_ready: "✅ Offline ready. The app can work without internet.",

    // Web DOCX panel
    web_ui_docx_title: "DOCX conversion",
    web_ui_docx_desc: "Drop files, run conversion, then download results.",
    web_ui_btn_clear_list: "Clear list",
    web_ui_btn_download_zip: "Download ZIP",
    web_ui_btn_download_zip_title: "Download all as ZIP",
    web_ui_drop_title: "Drop .docx here or click to choose",
    web_ui_drop_sub: "Multiple files supported. Processing happens locally.",
    web_ui_no_files: "No files yet. Add .docx to start.",

    // Web DOCX table
    web_ui_table_file: "File",
    web_ui_table_status: "Status",
    web_ui_table_progress: "Progress",
    web_ui_table_meta: "Meta",
    web_ui_table_actions: "Actions",
    web_ui_job_queued: "queued",
    web_ui_job_running: "running",
    web_ui_job_done: "done",
    web_ui_job_error: "error",
    web_ui_job_canceled: "canceled",
    web_ui_meta_parts_ms: "{0} parts • {1}ms",
    web_ui_btn_remove: "Remove",
    web_ui_btn_download: "Download",

    // Web Text panel
    web_ui_text_title: "Quick text conversion",
    web_ui_text_desc: "Plain text mode. Runs locally. Includes Diff and interactive change rejection.",
    web_ui_label_input: "Text",
    web_ui_text_placeholder: "Paste text here...",
    web_ui_text_hint: "Tip: in the Diff tab click green/red parts to reject changes.",
    web_ui_btn_copy_result: "Copy result",
    web_ui_btn_copy_result_title: "Copy to clipboard",

    // Web Output panel
    web_ui_output_title: "Output",
    web_ui_output_desc_files: "Results & downloads.",
    web_ui_output_desc_text: "Result: {0}",
    web_ui_badge_version: "ver {0}",
    web_ui_tab_result: "Result",
    web_ui_tab_diff: "Diff",
    web_ui_tab_stats: "Stats",
    web_ui_label_result: "Result",
    web_ui_result_placeholder: "Result will appear here...",
    web_ui_no_diff: "No diff yet. Convert text first.",
    web_ui_diff_help: "Click highlighted parts to reject inserts or keep deletions.",

    // Web files summary
    web_ui_files_done: "done: {0}/{1}",
    web_ui_files_errors: "errors: {0}",
    web_ui_files_result_hint: "Download files from the table on the left (Download).",
    web_ui_docx_diff_placeholder:
        "DOCX diff can come later (needs a stable text preview). Use Text mode for Diff for now.",

    // Web stats
    web_ui_stats_chars_in: "chars in: {0}",
    web_ui_stats_chars_out: "chars out: {0}",
    web_ui_stats_no_data: "No stats yet (run a conversion).",
    web_ui_stats_direction: "direction: {0}",
    web_ui_stats_nodes: "nodes: {0}",
    web_ui_stats_time_ms: "time: {0}ms",
    web_ui_stats_chars_before: "charsBefore: {0}",
    web_ui_stats_chars_after: "charsAfter: {0}",
    web_ui_stats_detected_urls: "detected.urls: {0}",
    web_ui_stats_detected_emails: "detected.emails: {0}",
    web_ui_stats_bridges_header: "bridges:",

    // Web drawer/settings
    web_ui_drawer_title: "Settings",
    web_ui_shortcut_palette: "Command palette",
    web_ui_shortcut_live: "Live preview",
    web_ui_setting_language: "Language",
    web_ui_lang_auto: "Auto",
    web_ui_lang_sr: "Serbian",
    web_ui_lang_en: "English",
    web_ui_setting_protect_brands: "Protect brands/technologies",
    web_ui_setting_quotes: "Apply Serbian quotes (Lat → Cyr)",
    web_ui_setting_code: "Preserve code blocks (`...` and ```...```)",
    web_ui_setting_romans: "Protect Roman numerals (IV, XIV)",
    web_ui_setting_autodl: "Auto-download after conversion",
    web_ui_setting_live_preview: "Live preview (while typing)",

    web_ui_setting_curly: "Curly protection",
    web_ui_curly_placeholders: "Only placeholders (e.g. {USER_NAME})",
    web_ui_curly_all: "Everything inside {...}",
    web_ui_curly_none: "None",

    web_ui_protected_label: "Protected words/phrases",
    web_ui_protected_placeholder: "Add a word or phrase...",
    web_ui_protected_help: "These words stay unchanged in conversion (Text + DOCX).",
    web_ui_btn_add: "Add",
    web_ui_btn_clear: "Clear",

    web_ui_ignored_styles_label: "Ignored styles (DOCX)",
    web_ui_ignored_styles_placeholder: "Ignored styles (one per line)\nCode\nQuote",

    web_ui_dialect_label: "Dialect",
    web_ui_dialect_none: "Standard (transliteration only)",
    web_ui_dialect_ei: "Ekavian → Ijekavian (beta)",
    web_ui_dialect_ie: "Ijekavian → Ekavian (beta)",

    web_ui_subs_label: "Custom substitutions",
    web_ui_subs_placeholder: "Custom substitutions (src -> dest)\nvreme -> vrijeme",

    web_ui_btn_save: "Save",
    web_ui_btn_reset_web: "Reset (web)",

    // Web live badge
    web_ui_live_badge_on: "LIVE",
    web_ui_live_badge_off: "LIVE OFF",
    web_ui_live_shortcut_hint: "Alt+L: toggle live preview",

    // Web palette
    web_palette_placeholder: "Type a command…",
    web_palette_footer: "↑/↓ select • Enter run • Esc close",
    web_palette_empty: "No results.",

    // Web commands
    web_cmd_convert_files: "Convert DOCX (Start)",
    web_cmd_convert_text: "Convert text",
    web_cmd_toggle_to_text: "Switch to: Text",
    web_cmd_toggle_to_files: "Switch to: Files (.docx)",
    web_cmd_open_settings: "Open settings",
    web_cmd_cycle_direction: "Change direction (now: {0})",
    web_cmd_download_zip: "Download all as ZIP",
    web_cmd_copy_result: "Copy result (text)",
    web_cmd_clear_jobs: "Clear file list",
    web_cmd_toggle_live_on: "Live preview: ON",
    web_cmd_toggle_live_off: "Live preview: OFF",
    web_cmd_update_refresh_now: "Update: refresh now",

    // Web hints
    web_hint_ctrl_k: "Ctrl+K",
    web_hint_alt_l: "Alt+L",
    web_hint_ctrl_enter: "Ctrl+Enter",
    web_hint_ctrl_comma: "Ctrl+,",
    web_hint_ctrl_shift_c: "Ctrl+Shift+C",

    // Web statuses
    web_status_settings_saved: "Settings saved.",
    web_status_text_type: "Text: {0}",
    web_status_no_docx_files: "No .docx files.",
    web_status_files_added: "Added files: {0}",
    web_status_jobs_cleared: "File list cleared.",
    web_status_add_docx_files: "Add .docx files.",
    web_status_worker_starting: "Starting worker...",
    web_status_done: "Done.",
    web_status_no_done_files: "No finished files to download.",
    web_status_packing_zip: "Packing ZIP...",
    web_status_zip_downloaded: "ZIP downloaded.",
    web_status_settings_exported: "Settings exported.",
    web_status_settings_imported: "Settings imported.",
    web_status_settings_import_error: "Error: invalid file.",

    // Web updates
    web_update_available: "✨ A new version is available.",
    web_update_available_versions: "✨ A new version is available ({0} → {1}).",
    web_update_refresh: "Refresh",
    web_update_later: "Later",
    web_update_dismiss: "Dismiss",
    web_update_release_notes: "What's new",

    // Web jobs (messages shown in progress pill)
    web_job_msg_queued: "Queued",
    web_job_msg_loading: "Loading...",
    web_job_msg_done_ms: "Done ({0}ms)",
    web_job_msg_canceled: "Canceled",
    web_job_msg_error: "Error",

    web_wifi_online: "Online",
    web_wifi_offline: "Offline",
    web_toast_offline_mode: "Offline mode enabled",
    web_toast_online_mode: "Network is active",
    web_toast_copied_clipboard: "Copied to clipboard!",
    web_status_copy_failed: "Cannot copy (clipboard not available).",
    web_wifi_title_online: "Online (click to go offline)",
    web_wifi_title_offline: "Offline (click to go online)",
};
