use crate::dictionary::{DictionaryStore, DICTIONARIES};
use std::cell::RefCell;
use rustc_hash::FxHashMap;

// [MAX3 OPTIMIZATION] Thread-Local Storage (TLS)
// Pošto se WASM izvršava u Web Worker-u (single-threaded context po instanci),
// Mutex je bio nepotreban overhead (atomics/locking).
// Prebacujemo se na thread_local! + RefCell za Zero-Overhead pristup kešu.
thread_local! {
    static WORD_CACHE: RefCell<FxHashMap<String, String>> = RefCell::new(
        FxHashMap::with_capacity_and_hasher(10000, Default::default())
    );
}

// [MAX4] Force Inline
#[inline(always)]
fn get_value_from_store(store: &DictionaryStore, offset: u64) -> Option<String> {
    let start = offset as usize;
    if start >= store.values.len() { return None; }
    let mut end = start;
    while end < store.values.len() && store.values[end] != 0 { end += 1; }
    let slice = &store.values[start..end];
    Some(String::from_utf8_lossy(slice).to_string())
}

#[inline(always)]
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

fn try_smart_lookup(store: &DictionaryStore, word: &str) -> Option<String> {
    let word_lower = word.to_lowercase();
    if let Some(offset) = store.fst.get(&word_lower) {
        if let Some(res) = get_value_from_store(store, offset) {
            return Some(match_case(word, &res));
        }
    }
    if word_lower.chars().count() < 4 { return None; }
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

// [MAX4] Force Inline
#[inline(always)]
fn should_protect(word: &str) -> bool {
    let mut has_foreign = false;
    let mut has_underscore = false;
    let mut has_digit = false;
    for c in word.chars() {
        match c {
            'a'..='z' | 'A'..='Z' | 'č' | 'ć' | 'đ' | 'š' | 'ž' | 'Č' | 'Ć' | 'Đ' | 'Š' | 'Ž' => {
                if matches!(c, 'q' | 'w' | 'x' | 'y' | 'Q' | 'W' | 'X' | 'Y') { has_foreign = true; }
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

pub fn convert_dialect_internal(text: &str, mode: &str) -> String {
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
        while i < len && chars[i].is_alphabetic() { i += 1; }
        let word: String = chars[start..i].iter().collect();

        // CACHE READ (Thread Local)
        let cached = WORD_CACHE.with(|cache| {
            cache.borrow().get(&word).cloned()
        });

        if let Some(c) = cached {
            result.push_str(&c);
            continue;
        }

        if should_protect(&word) {
            result.push_str(&word);
            // CACHE WRITE (Thread Local)
            WORD_CACHE.with(|cache| {
                let mut map = cache.borrow_mut();
                if map.len() > 10000 { map.clear(); }
                map.insert(word.clone(), word.clone());
            });
            continue;
        }

        let replacement = if let Some(store) = store_opt {
            try_smart_lookup(store, &word)
        } else {
            None
        };

        let final_word = if let Some(repl) = replacement {
            repl
        } else {
            word.clone()
        };

        result.push_str(&final_word);

        // CACHE WRITE (Thread Local)
        WORD_CACHE.with(|cache| {
            let mut map = cache.borrow_mut();
            if map.len() > 10000 { map.clear(); }
            map.insert(word, final_word);
        });
    }
    result
}

// [MAX4] Force Inline
#[inline(always)]
fn should_split_nj(word_lower: &str) -> bool {
    if word_lower.contains("njek") || word_lower.contains("njekt") { return true; }
    if word_lower.contains("njunk") { return true; }
    if word_lower.contains("tanjug") { return true; }
    false
}

#[inline(always)]
fn should_split_dz(word_lower: &str) -> bool {
    if word_lower.starts_with("nadž") || word_lower.starts_with("podž") { return true; }
    false
}

fn process_word_to_cyr(result: &mut String, word: &str) {
    if should_protect(word) {
        result.push_str(word);
        return;
    }

    let word_lower = word.to_lowercase();
    let split_nj = should_split_nj(&word_lower);
    let split_dz = should_split_dz(&word_lower);

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
                "Nj" | "NJ" => { 
                    if !split_nj { result.push('Њ'); i += 2; continue; }
                },
                "nj" => { 
                    if !split_nj { result.push('њ'); i += 2; continue; }
                },
                "Dž" | "DŽ" => { 
                    if !split_dz { result.push('Џ'); i += 2; continue; }
                },
                "dž" => { 
                    if !split_dz { result.push('џ'); i += 2; continue; }
                },
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

pub fn to_cyrillic_internal(text: &str) -> String {
    let mut result = String::with_capacity(text.len() * 2);
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

pub fn to_latin_internal(text: &str) -> String {
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
