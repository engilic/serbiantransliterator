// src/wasm-core/src/lib.rs

use aho_corasick::AhoCorasick;
use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::sync::{Mutex, MutexGuard};
use wasm_bindgen::prelude::*;

mod convert;
mod dictionary;
mod rules;

#[cfg(test)]
mod tests;

use convert::{convert_dialect_internal, to_cyrillic_internal, to_latin_internal};
use dictionary::load_dictionary_internal;
use rules::SYSTEM_EXCEPTIONS;

type ReplacerState = (AhoCorasick, Vec<String>);
type ReplacerCache = Option<ReplacerState>;
type ReplacerLock = Mutex<ReplacerCache>;

/// Globalni statički replacer koji čuva Aho-Corasick automat
static REPLACER: Lazy<ReplacerLock> = Lazy::new(|| Mutex::new(None));

/// Pomoćna funkcija za bezbedno zaključavanje Mutex-a (otporna na paniku)
fn replacer_lock() -> MutexGuard<'static, ReplacerCache> {
    match REPLACER.lock() {
        Ok(g) => g,
        Err(poisoned) => poisoned.into_inner(),
    }
}

#[wasm_bindgen]
pub fn init_debug() {
    console_error_panic_hook::set_once();
}

/// [MAX1] Inicijalizacija replacera sa automatskim generisanjem varijacija pisma
#[wasm_bindgen]
pub fn init_replacer(custom_json: &str) -> Result<(), JsValue> {
    let custom_map: HashMap<String, String> = if custom_json.is_empty() || custom_json == "{}" {
        HashMap::new()
    } else {
        serde_json::from_str(custom_json)
            .map_err(|e| JsValue::from_str(&format!("JSON error: {}", e)))?
    };

    let mut patterns: Vec<String> = Vec::new();
    let mut replacements: Vec<String> = Vec::new();

    // 1. Obrada SISTEMSKIH IZUZETAKA (npr. tanjug -> танјуг)
    for (pat, rep) in SYSTEM_EXCEPTIONS {
        // --- Lowercase (original) ---
        patterns.push(pat.to_string());
        replacements.push(rep.to_string());

        // --- ALL CAPS (TANJUG -> ТАНЈУГ) ---
        let pat_upper = pat.to_uppercase();
        if pat_upper != *pat {
            patterns.push(pat_upper);
            replacements.push(rep.to_uppercase());
        }

        // --- Title Case (Tanjug -> Танјуг) ---
        let mut p_chars = pat.chars();
        if let Some(first) = p_chars.next() {
            let p_title = first.to_uppercase().collect::<String>() + p_chars.as_str();
            if p_title != *pat {
                patterns.push(p_title);
                let mut r_chars = rep.chars();
                let r_title =
                    r_chars.next().unwrap().to_uppercase().collect::<String>() + r_chars.as_str();
                replacements.push(r_title);
            }
        }
    }

    // 2. Dodavanje KORISNIČKIH zamena (već su sortirane na JS strani ili ih sortiramo ovde)
    let mut custom_entries: Vec<(String, String)> = custom_map.into_iter().collect();
    // Sortiramo po dužini (duže fraze imaju prioritet)
    custom_entries.sort_by(|(pa, _), (pb, _)| pb.len().cmp(&pa.len()));

    for (pat, rep) in custom_entries {
        if !pat.is_empty() {
            patterns.push(pat);
            replacements.push(rep);
        }
    }

    if patterns.is_empty() {
        let mut global = replacer_lock();
        *global = None;
        return Ok(());
    }

    // 3. Izgradnja Aho-Corasick automata (LeftmostFirst osigurava da "najduži match" pobeđuje)
    let ac = AhoCorasick::builder()
        .ascii_case_insensitive(false)
        .match_kind(aho_corasick::MatchKind::LeftmostFirst)
        .build(&patterns)
        .map_err(|e| JsValue::from_str(&format!("AC error: {}", e)))?;

    let mut global = replacer_lock();
    *global = Some((ac, replacements));

    Ok(())
}

/// Primenjuje sve definisane zamene na tekst koristeći Aho-Corasick
#[wasm_bindgen]
pub fn apply_replacements(text: &str) -> String {
    let guard = replacer_lock();
    if let Some((ac, replacements)) = &*guard {
        ac.replace_all(text, replacements)
    } else {
        text.to_string()
    }
}

/// Učitava binarni rečnik (FST format) za dijalekte
#[wasm_bindgen]
pub fn load_dictionary_bin(mode: &str, bin_data: &[u8]) -> Result<(), JsValue> {
    load_dictionary_internal(mode, bin_data).map_err(|e| JsValue::from_str(&e))
}

/// Konverzija u Ćirilicu (koristi MAX1 process_word_to_cyr logiku)
#[wasm_bindgen]
pub fn to_cyrillic(text: &str) -> String {
    to_cyrillic_internal(text)
}

/// Konverzija u Latinicu
#[wasm_bindgen]
pub fn to_latin(text: &str) -> String {
    to_latin_internal(text)
}

/// Konverzija dijalekata (Ekavica/Ijekavica) koristeći FST rečnike
#[wasm_bindgen]
pub fn convert_dialect(text: &str, mode: &str) -> String {
    convert_dialect_internal(text, mode)
}
