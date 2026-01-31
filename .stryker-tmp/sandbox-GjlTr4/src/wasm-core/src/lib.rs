// src/wasm-core/src/lib.rs

use wasm_bindgen::prelude::*;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use std::collections::HashMap;
use aho_corasick::AhoCorasick;

mod dictionary;
mod convert;
mod rules;
mod tests;

use dictionary::load_dictionary_internal;
use convert::{to_cyrillic_internal, to_latin_internal, convert_dialect_internal};
use rules::SYSTEM_EXCEPTIONS;

static REPLACER: Lazy<Mutex<Option<(AhoCorasick, Vec<String>)>>> = Lazy::new(|| {
    Mutex::new(None)
});

#[wasm_bindgen]
pub fn init_debug() {
    console_error_panic_hook::set_once();
}

// [FIX] Added #[wasm_bindgen] attribute here so it gets exported to JS!
#[wasm_bindgen]
pub fn init_replacer(custom_json: &str) -> Result<(), JsValue> {
    let custom_map: HashMap<String, String> = if custom_json.is_empty() {
        HashMap::new()
    } else {
        serde_json::from_str(custom_json)
            .map_err(|e| JsValue::from_str(&format!("JSON error: {}", e)))?
    };

    let mut patterns: Vec<String> = Vec::new();
    let mut replacements = Vec::new();

    for (pat, rep) in SYSTEM_EXCEPTIONS {
        patterns.push(pat.to_string());
        replacements.push(rep.to_string());
    }

    for (pat, rep) in custom_map {
        patterns.push(pat);
        replacements.push(rep);
    }

    if patterns.is_empty() {
        let mut global = REPLACER.lock().unwrap();
        *global = None;
        return Ok(());
    }

    let ac = AhoCorasick::builder()
        .ascii_case_insensitive(false) 
        .match_kind(aho_corasick::MatchKind::LeftmostFirst)
        .build(&patterns)
        .map_err(|e| JsValue::from_str(&format!("AC error: {}", e)))?;

    let mut global = REPLACER.lock().unwrap();
    *global = Some((ac, replacements));

    Ok(())
}

#[wasm_bindgen]
pub fn apply_replacements(text: &str) -> String {
    let guard = REPLACER.lock().unwrap();
    if let Some((ac, replacements)) = &*guard {
        ac.replace_all(text, replacements)
    } else {
        text.to_string()
    }
}

#[wasm_bindgen]
pub fn load_dictionary_bin(mode: &str, bin_data: &[u8]) -> Result<(), JsValue> {
    load_dictionary_internal(mode, bin_data)
        .map_err(|e| JsValue::from_str(&e))
}

#[wasm_bindgen]
pub fn to_cyrillic(text: &str) -> String {
    to_cyrillic_internal(text)
}

#[wasm_bindgen]
pub fn to_latin(text: &str) -> String {
    to_latin_internal(text)
}

#[wasm_bindgen]
pub fn convert_dialect(text: &str, mode: &str) -> String {
    convert_dialect_internal(text, mode)
}
