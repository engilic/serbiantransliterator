use wasm_bindgen::prelude::*;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use fst::Map;
use std::collections::HashMap;
use aho_corasick::AhoCorasick;

// Struktura koja drži učitani rečnik (Zero-Copy wrapper)
struct DictionaryStore {
    fst: Map<Vec<u8>>,
    values: Vec<u8>,
    suffixes: Vec<String>, // Dinamički sufiksi učitani iz binara
}

static DICTIONARIES: Lazy<Mutex<HashMap<String, DictionaryStore>>> = Lazy::new(|| {
    Mutex::new(HashMap::new())
});

// === GLOBALNI REPLACER (Aho-Corasick) ===
static REPLACER: Lazy<Mutex<Option<(AhoCorasick, Vec<String>)>>> = Lazy::new(|| {
    Mutex::new(None)
});

// SISTEMSKI IZUZECI (Lingvistička pravila koja odstupaju od standardne transliteracije)
const SYSTEM_EXCEPTIONS: &[(&str, &str)] = &[
    ("Tanjug", "Танјуг"), ("tanjug", "танјуг"),
    ("Injekc", "Инјекц"), ("injekc", "инјекц"),
    ("Injekt", "Инјект"), ("injekt", "инјект"),
    ("Konjug", "Конјуг"), ("konjug", "конјуг"),
    ("Konjunk", "Конјунк"), ("konjunk", "конјунк"),
    ("Anjon", "Анјон"),   ("anjon", "анјон"),
    ("Katjon", "Катјон"), ("katjon", "катјон"),
    ("Nadživ", "Наджив"), ("nadživ", "наджив"),
    ("Podžanr", "Поджанр"), ("podžanr", "поджанр"),
    ("reke Save", "реке Саве"),
    ("duž Save", "дуж Саве"),
    ("ka Savi", "ка Сави"),
    ("na Savi", "на Сави"),
    ("ušća Save", "ушћа Саве"),
    ("obale Save", "обале Саве"),
];

// Inicijalizacija Replacera
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

    // 1. Dodaj sistemske izuzetke
    for (pat, rep) in SYSTEM_EXCEPTIONS {
        patterns.push(pat.to_string());
        replacements.push(rep.to_string());
    }

    // 2. Dodaj korisničke zamene
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

// Primena zamena na tekst
#[wasm_bindgen]
pub fn apply_replacements(text: &str) -> String {
    let guard = REPLACER.lock().unwrap();
    
    if let Some((ac, replacements)) = &*guard {
        ac.replace_all(text, replacements)
    } else {
        text.to_string()
    }
}

// Helper za čitanje 8 bajtova (u64)
fn read_u64(slice: &[u8]) -> u64 {
    let mut bytes = [0u8; 8];
    bytes.copy_from_slice(slice);
    u64::from_le_bytes(bytes)
}

// Binary Loader (FST + Suffixes)
#[wasm_bindgen]
pub fn load_dictionary_bin(mode: &str, bin_data: &[u8]) -> Result<(), JsValue> {
    // Format: [FST_LEN 8b][FST][VAL_LEN 8b][VAL][SUF_LEN 8b][SUF]
    let mut cursor = 0;

    // 1. FST
    if bin_data.len() < cursor + 8 { return Err(JsValue::from_str("Invalid bin (FST len)")); }
    let fst_len = read_u64(&bin_data[cursor..cursor+8]) as usize;
    cursor += 8;

    if bin_data.len() < cursor + fst_len { return Err(JsValue::from_str("Invalid bin (FST body)")); }
    let fst_bytes = bin_data[cursor..cursor+fst_len].to_vec();
    cursor += fst_len;

    let fst = Map::new(fst_bytes).map_err(|e| JsValue::from_str(&e.to_string()))?;

    // 2. Values
    if bin_data.len() < cursor + 8 { return Err(JsValue::from_str("Invalid bin (Val len)")); }
    let val_len = read_u64(&bin_data[cursor..cursor+8]) as usize;
    cursor += 8;

    if bin_data.len() < cursor + val_len { return Err(JsValue::from_str("Invalid bin (Val body)")); }
    let values_bytes = bin_data[cursor..cursor+val_len].to_vec();
    cursor += val_len;

    // 3. Suffixes
    if bin_data.len() < cursor + 8 { return Err(JsValue::from_str("Invalid bin (Suf len)")); }
    let suf_len = read_u64(&bin_data[cursor..cursor+8]) as usize;
    cursor += 8;

    if bin_data.len() < cursor + suf_len { return Err(JsValue::from_str("Invalid bin (Suf body)")); }
    let suf_bytes = &bin_data[cursor..cursor+suf_len];
    
    let suffixes: Vec<String> = serde_json::from_slice(suf_bytes)
        .map_err(|e| JsValue::from_str(&format!("Suffix decode error: {}", e)))?;

    let store = DictionaryStore {
        fst,
        values: values_bytes,
        suffixes,
    };

    let mut global = DICTIONARIES.lock().map_err(|_| JsValue::from_str("Mutex poisoned"))?;
    let key = match mode {
        "e2i" => "ekavica_to_ijekavica",
        "i2e" => "ijekavica_to_ekavica",
        _ => mode
    };
    global.insert(key.to_string(), store);
    Ok(())
}

// === SMART GUARD LOGIC ===
fn should_protect(word: &str) -> bool {
    let mut has_foreign = false;
    let mut has_underscore = false;
    let mut has_digit = false;

    for c in word.chars() {
        match c {
            'a'..='z' | 'A'..='Z' |
            'č' | 'ć' | 'đ' | 'š' | 'ž' |
            'Č' | 'Ć' | 'Đ' | 'Š' | 'Ž' => {
                if matches!(c, 'q' | 'w' | 'x' | 'y' | 'Q' | 'W' | 'X' | 'Y') {
                    has_foreign = true; 
                }
            },
            '\u{0400}'..='\u{04FF}' => {},
            '0'..='9' => { has_digit = true; },
            '_' => { has_underscore = true; },
            '-' | '.' | '\'' => {},
            _ => { has_foreign = true; }
        }
    }

    if has_foreign || has_underscore || has_digit { return true; }
    false
}

// === CONVERSION LOGIC ===

fn process_word_to_cyr(result: &mut String, word: &str) {
    if should_protect(word) {
        result.push_str(word);
        return;
    }

    let chars: Vec<char> = word.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        let c = chars[i];
        
        if i + 1 < len {
            let next = chars[i + 1];
            let pair = format!("{}{}", c, next);
            match pair.as_str() {
                "Lj" | "LJ" => { result.push('Љ'); i += 2; continue; },
                "lj" => { result.push('љ'); i += 2; continue; },
                "Nj" | "NJ" => { result.push('Њ'); i += 2; continue; },
                "nj" => { result.push('њ'); i += 2; continue; },
                "Dž" | "DŽ" => { result.push('Џ'); i += 2; continue; },
                "dž" => { result.push('џ'); i += 2; continue; },
                _ => {}
            }
        }

        let mapped = match c {
            'A' => 'А', 'a' => 'а', 'B' => 'Б', 'b' => 'б', 'V' => 'В', 'v' => 'в',
            'G' => 'Г', 'g' => 'г', 'D' => 'Д', 'd' => 'д', 'Đ' => 'Ђ', 'đ' => 'ђ',
            'E' => 'Е', 'e' => 'е', 'Ž' => 'Ж', 'ž' => 'ж', 'Z' => 'З', 'z' => 'з',
            'I' => 'И', 'i' => 'и', 'J' => 'Ј', 'j' => 'ј', 'K' => 'К', 'k' => 'к',
            'L' => 'Л', 'l' => 'л', 'M' => 'М', 'm' => 'м', 'N' => 'Н', 'n' => 'н',
            'O' => 'О', 'o' => 'о', 'P' => 'П', 'p' => 'п', 'R' => 'Р', 'r' => 'р',
            'S' => 'С', 's' => 'с', 'T' => 'Т', 't' => 'т', 'Ć' => 'Ћ', 'ć' => 'ћ',
            'U' => 'У', 'u' => 'у', 'F' => 'Ф', 'f' => 'ф', 'H' => 'Х', 'h' => 'х',
            'C' => 'Ц', 'c' => 'ц', 'Č' => 'Ч', 'č' => 'ч', 'Š' => 'Ш', 'š' => 'ш',
            _ => c,
        };
        result.push(mapped);
        i += 1;
    }
}

#[wasm_bindgen]
pub fn to_cyrillic(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let mut current_word = String::new();
    let mut in_word = false;

    for c in text.chars() {
        if c.is_alphanumeric() || c == '_' {
            in_word = true;
            current_word.push(c);
        } else {
            if in_word {
                process_word_to_cyr(&mut result, &current_word);
                current_word.clear();
                in_word = false;
            }
            result.push(c);
        }
    }
    if in_word {
        process_word_to_cyr(&mut result, &current_word);
    }
    result
}

#[wasm_bindgen]
pub fn to_latin(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let chars: Vec<char> = text.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        let c = chars[i];
        match c {
            'А' => result.push('A'), 'а' => result.push('a'),
            'Б' => result.push('B'), 'б' => result.push('b'),
            'В' => result.push('V'), 'в' => result.push('v'),
            'Г' => result.push('G'), 'г' => result.push('g'),
            'Д' => result.push('D'), 'д' => result.push('d'),
            'Ђ' => result.push('Đ'), 'ђ' => result.push('đ'),
            'Е' => result.push('E'), 'е' => result.push('e'),
            'Ж' => result.push('Ž'), 'ж' => result.push('ž'),
            'З' => result.push('Z'), 'з' => result.push('z'),
            'И' => result.push('I'), 'и' => result.push('i'),
            'Ј' => result.push('J'), 'ј' => result.push('j'),
            'К' => result.push('K'), 'к' => result.push('k'),
            'Л' => result.push('L'), 'л' => result.push('l'),
            'Љ' => result.push_str("Lj"), 'љ' => result.push_str("lj"),
            'М' => result.push('M'), 'м' => result.push('m'),
            'Н' => result.push('N'), 'н' => result.push('n'),
            'Њ' => result.push_str("Nj"), 'њ' => result.push_str("nj"),
            'О' => result.push('O'), 'о' => result.push('o'),
            'П' => result.push('P'), 'п' => result.push('p'),
            'Р' => result.push('R'), 'р' => result.push('r'),
            'С' => result.push('S'), 'с' => result.push('s'),
            'Т' => result.push('T'), 'т' => result.push('t'),
            'Ћ' => result.push('Ć'), 'ћ' => result.push('ć'),
            'У' => result.push('U'), 'у' => result.push('u'),
            'Ф' => result.push('F'), 'ф' => result.push('f'),
            'Х' => result.push('H'), 'х' => result.push('h'),
            'Ц' => result.push('C'), 'ц' => result.push('c'),
            'Č' => result.push('Č'), 'č' => result.push('č'),
            'Џ' => result.push_str("Dž"), 'џ' => result.push_str("dž"),
            'Ш' => result.push('Š'), 'ш' => result.push('š'),
            _ => result.push(c),
        }
        i += 1;
    }
    result
}

// === DIALECT LOGIC (Data-Driven Morphology) ===

fn get_value_from_store(store: &DictionaryStore, offset: u64) -> Option<String> {
    let start = offset as usize;
    if start >= store.values.len() { return None; }
    
    let mut end = start;
    while end < store.values.len() && store.values[end] != 0 {
        end += 1;
    }
    
    let slice = &store.values[start..end];
    Some(String::from_utf8_lossy(slice).to_string())
}

fn try_smart_lookup(store: &DictionaryStore, word: &str) -> Option<String> {
    let word_lower = word.to_lowercase();

    // 1. Direct Lookup
    if let Some(offset) = store.fst.get(&word_lower) {
        if let Some(res) = get_value_from_store(store, offset) {
            return Some(match_case(word, &res));
        }
    }

    // 2. Stemming (Dynamic Suffixes)
    if word_lower.chars().count() < 4 {
        return None;
    }

    for suffix in &store.suffixes {
        if word_lower.ends_with(suffix) {
            let root_len = word_lower.len() - suffix.len();
            let root = &word_lower[..root_len];

            if root.chars().count() < 3 { continue; }

            if let Some(offset) = store.fst.get(root) {
                if let Some(root_translation) = get_value_from_store(store, offset) {
                    let mut result = root_translation;
                    result.push_str(suffix);
                    return Some(match_case(word, &result));
                }
            }
        }
    }

    None
}

fn match_case(original: &str, replacement: &str) -> String {
    let mut chars_orig = original.chars();
    let first = chars_orig.next();
    
    if let Some(f) = first {
        if f.is_uppercase() {
            let mut chars_repl = replacement.chars();
            if let Some(r) = chars_repl.next() {
                let mut res = r.to_uppercase().to_string();
                res.push_str(chars_repl.as_str());
                return res;
            }
        }
    }
    replacement.to_string()
}

#[wasm_bindgen]
pub fn convert_dialect(text: &str, mode: &str) -> String {
    let guard = DICTIONARIES.lock().unwrap();
    let store_opt = guard.get(mode);

    let mut result = String::with_capacity(text.len());
    let chars: Vec<char> = text.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        if !chars[i].is_alphabetic() {
            result.push(chars[i]);
            i += 1;
            continue;
        }

        let start = i;
        while i < len && chars[i].is_alphabetic() {
            i += 1;
        }
        let word: String = chars[start..i].iter().collect();

        if should_protect(&word) {
            result.push_str(&word);
            continue;
        }

        let replacement = if let Some(store) = store_opt {
            try_smart_lookup(store, &word)
        } else {
            None
        };

        if let Some(repl) = replacement {
            result.push_str(&repl);
        } else {
            result.push_str(&word);
        }
    }
    result
}
