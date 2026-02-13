// src/wasm-core/src/convert.rs

use crate::dictionary::{DictionaryStore, DICTIONARIES};
use rustc_hash::FxHashMap;
use std::cell::RefCell;

thread_local! {
    // [MAX1] - Thread-local keš sprečava locking overhead.
    // FxHashMap je 3-5x brži od standardnog HashMap-a za kratke stringove (reči).
    static WORD_CACHE: RefCell<FxHashMap<String, String>> = RefCell::new(
        FxHashMap::with_capacity_and_hasher(15000, Default::default())
    );
}

#[inline(always)]
fn insert_to_cache(word: &str, translated: String) {
    WORD_CACHE.with(|cache| {
        let mut map = cache.borrow_mut();
        // Sprečavamo preveliku potrošnju memorije u browseru
        if map.len() > 15000 {
            map.clear();
        }
        map.insert(word.to_string(), translated);
    });
}

// [MAX1] Force Inline
#[inline(always)]
fn get_value_from_store(store: &DictionaryStore, offset: u64) -> Option<String> {
    let start = offset as usize;
    if start >= store.values.len() {
        return None;
    }
    let mut end = start;
    while end < store.values.len() && store.values[end] != 0 {
        end += 1;
    }
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
    if word_lower.chars().count() < 4 {
        return None;
    }
    for suffix in &store.suffixes {
        if word_lower.ends_with(suffix) {
            let root_len = word_lower.len() - suffix.len();
            let root = &word_lower[..root_len];
            if root.chars().count() < 3 {
                continue;
            }
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

// [MAX1] Force Inline
#[inline(always)]
fn should_protect(word: &str) -> bool {
    let mut has_foreign = false;
    let mut has_underscore = false;
    let mut has_digit = false;
    for c in word.chars() {
        match c {
            'a'..='z' | 'A'..='Z' | 'č' | 'ć' | 'đ' | 'š' | 'ž' | 'Č' | 'Ć' | 'Đ' | 'Š' | 'Ž' => {
                if matches!(c, 'q' | 'w' | 'x' | 'y' | 'Q' | 'W' | 'X' | 'Y') {
                    has_foreign = true;
                }
            }
            '\u{0400}'..='\u{04FF}' => {}
            '0'..='9' => {
                has_digit = true;
            }
            '_' => {
                has_underscore = true;
            }
            '-' | '.' | '\'' => {}
            _ => {
                has_foreign = true;
            }
        }
    }
    if has_foreign || has_underscore || has_digit {
        return true;
    }
    false
}

pub fn convert_dialect_internal(text: &str, mode: &str) -> String {
    let guard = DICTIONARIES.lock().unwrap();
    let store_opt = guard.get(mode);

    let mut result = String::with_capacity(text.len());

    // Custom iterator loop to handle word segmentation without Vec<char> alloc
    let mut char_indices = text.char_indices().peekable();

    while let Some((idx, c)) = char_indices.next() {
        if !c.is_alphanumeric() {
            // Non-word char, just append
            result.push(c);
            continue;
        }

        // Start of a word
        let word_start = idx;
        let mut word_end = idx + c.len_utf8();

        // Consume rest of word
        while let Some(&(peek_idx, peek_c)) = char_indices.peek() {
            if peek_c.is_alphanumeric() {
                char_indices.next(); // consume
                word_end = peek_idx + peek_c.len_utf8();
            } else {
                break;
            }
        }

        let word = &text[word_start..word_end];

        // Process word
        let cached = WORD_CACHE.with(|cache| cache.borrow().get(word).cloned());

        if let Some(c) = cached {
            result.push_str(&c);
        } else if should_protect(word) {
            result.push_str(word);
            // PROMENA: Ovde prosleđujemo word.to_string() jer final_word ne postoji ovde
            insert_to_cache(word, word.to_string());
        } else {
            let replacement = store_opt.and_then(|store| try_smart_lookup(store, word));
            let final_word = replacement.unwrap_or_else(|| word.to_string());

            result.push_str(&final_word);
            insert_to_cache(word, final_word);
        }
    }

    result
}

/// [MAX1] Pomoćna funkcija za proveru granice prefiksa kod slova NJ (npr. in-jekcija)
#[inline(always)]
fn is_at_prefix_boundary_nj(word_lower: &str, pos: usize) -> bool {
    if pos >= 2 {
        let prefix = &word_lower[..pos];
        // MAX1: Provera najčešćih prefiksa koji se završavaju na 'n' ispred 'j'
        return prefix.ends_with("in")
            || prefix.ends_with("ko")
            || prefix.ends_with("ta")
            || prefix.ends_with("an")
            || prefix.ends_with("ka");
    }
    false
}

/// [MAX1] Pomoćna funkcija za proveru granice prefiksa kod slova DŽ (npr. nad-živeti)
#[inline(always)]
fn is_at_prefix_boundary_dz(word_lower: &str, pos: usize) -> bool {
    if pos >= 2 {
        let prefix = &word_lower[..pos];
        // MAX1: Provera prefiksa 'nad' i 'pod' ispred 'ž'
        if prefix.ends_with("na") || prefix.ends_with("po") {
            // Izuzeci gde dž ostaje dž (deo korena)
            let roots = ["hadž", "madž", "džam", "džab", "džidž"];
            if roots.iter().any(|&r| word_lower.contains(r)) {
                return false;
            }
            return true;
        }
    }
    false
}

/// [MAX1] Mapiranje pojedinačnih karaktera (fallback)
#[inline(always)]
fn map_char_to_cyr(c: char) -> char {
    match c {
        'A' => 'А',
        'a' => 'а',
        'B' => 'Б',
        'b' => 'б',
        'V' => 'В',
        'v' => 'в',
        'G' => 'Г',
        'g' => 'г',
        'D' => 'Д',
        'd' => 'д',
        'Đ' => 'Ђ',
        'đ' => 'ђ',
        'E' => 'Е',
        'e' => 'е',
        'Ž' => 'Ж',
        'ž' => 'ж',
        'Z' => 'З',
        'z' => 'з',
        'I' => 'И',
        'i' => 'и',
        'J' => 'Ј',
        'j' => 'ј',
        'K' => 'К',
        'k' => 'к',
        'L' => 'Л',
        'l' => 'л',
        'M' => 'М',
        'm' => 'м',
        'N' => 'Н',
        'n' => 'н',
        'O' => 'О',
        'o' => 'о',
        'P' => 'П',
        'p' => 'п',
        'R' => 'Р',
        'r' => 'р',
        'S' => 'С',
        's' => 'с',
        'T' => 'Т',
        't' => 'т',
        'Ć' => 'Ћ',
        'ć' => 'ћ',
        'U' => 'У',
        'u' => 'у',
        'F' => 'Ф',
        'h' => 'х',
        'H' => 'Х',
        'f' => 'ф',
        'C' => 'Ц',
        'c' => 'ц',
        'Č' => 'Ч',
        'č' => 'ч',
        'Š' => 'Ш',
        'š' => 'ш',
        'Ч' => 'Ч',
        'ч' => 'ч',
        _ => c,
    }
}

/// [MAX1] Glavna funkcija za procesiranje reči u ćirilicu
fn process_word_to_cyr(result: &mut String, word: &str) {
    let cached = WORD_CACHE.with(|cache| cache.borrow().get(word).cloned());
    if let Some(c) = cached {
        result.push_str(&c);
        return;
    }

    // [MAX1 FIX] - DODAJ OVE LINIJE OVDE:
    if should_protect(word) {
        result.push_str(word);
        insert_to_cache(word, word.to_string());
        return;
    }

    let mut translated = String::with_capacity(word.len() * 2);
    let word_lower = word.to_lowercase();
    let mut iter = word.chars().enumerate().peekable();

    while let Some((i, c)) = iter.next() {
        let next_opt = iter.peek().map(|(_, ch)| *ch);
        let mut processed = false;

        if let Some(next) = next_opt {
            let next_low = next.to_lowercase().next().unwrap_or(next);

            match (c.to_lowercase().next().unwrap_or(c), next_low) {
                ('n', 'j') => {
                    if !is_at_prefix_boundary_nj(&word_lower, i) {
                        translated.push(if c.is_uppercase() { 'Њ' } else { 'њ' });
                        iter.next();
                        processed = true;
                    }
                }
                ('l', 'j') => {
                    translated.push(if c.is_uppercase() { 'Љ' } else { 'љ' });
                    iter.next();
                    processed = true;
                }
                ('d', 'ž') => {
                    if !is_at_prefix_boundary_dz(&word_lower, i) {
                        translated.push(if c.is_uppercase() { 'Џ' } else { 'џ' });
                        iter.next();
                        processed = true;
                    }
                }
                _ => {}
            }
        }

        if !processed {
            translated.push(map_char_to_cyr(c));
        }
    }

    // Upis u keš i u rezultat
    insert_to_cache(word, translated.clone());
    result.push_str(&translated);
}

pub fn to_cyrillic_internal(text: &str) -> String {
    let mut result = String::with_capacity(text.len() * 2);
    let mut current_word = String::with_capacity(32);

    for c in text.chars() {
        if c.is_alphanumeric() || c == '_' {
            current_word.push(c);
        } else {
            if !current_word.is_empty() {
                process_word_to_cyr(&mut result, &current_word);
                current_word.clear();
            }
            result.push(c);
        }
    }

    if !current_word.is_empty() {
        process_word_to_cyr(&mut result, &current_word);
    }
    result
}

// [OPTIMIZATION] Direct iterator, no vec
pub fn to_latin_internal(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let mut it = text.chars().peekable();
    while let Some(c) = it.next() {
        match c {
            'Љ' | 'Њ' | 'Џ' => {
                let next_is_upper = is_next_upper(&mut it);
                let res = match c {
                    'Љ' => {
                        if next_is_upper {
                            "LJ"
                        } else {
                            "Lj"
                        }
                    }
                    'Њ' => {
                        if next_is_upper {
                            "NJ"
                        } else {
                            "Nj"
                        }
                    }
                    _ => {
                        if next_is_upper {
                            "DŽ"
                        } else {
                            "Dž"
                        }
                    }
                };
                result.push_str(res);
            }
            'љ' => result.push_str("lj"),
            'њ' => result.push_str("nj"),
            'џ' => result.push_str("dž"),
            _ => result.push(map_char_to_lat(c)),
        }
    }
    result
}

#[inline(always)]
fn is_next_upper(it: &mut std::iter::Peekable<std::str::Chars>) -> bool {
    it.peek()
        .is_some_and(|&n| (0x0400..=0x04FF).contains(&(n as u32)) && n.is_uppercase())
}

#[inline(always)]
fn map_char_to_lat(c: char) -> char {
    match c {
        'А' => 'A',
        'а' => 'a',
        'Б' => 'B',
        'б' => 'b',
        'В' => 'V',
        'в' => 'v',
        'Г' => 'G',
        'г' => 'g',
        'Д' => 'D',
        'д' => 'd',
        'Ђ' => 'Đ',
        'ђ' => 'đ',
        'Е' => 'E',
        'е' => 'e',
        'Ж' => 'Ž',
        'ж' => 'ž',
        'З' => 'Z',
        'з' => 'z',
        'И' => 'I',
        'и' => 'i',
        'Ј' => 'J',
        'ј' => 'j',
        'К' => 'K',
        'к' => 'k',
        'Л' => 'L',
        'л' => 'l',
        'М' => 'M',
        'м' => 'm',
        'Н' => 'N',
        'н' => 'n',
        'О' => 'O',
        'о' => 'o',
        'П' => 'P',
        'п' => 'p',
        'Р' => 'R',
        'р' => 'r',
        'С' => 'S',
        'с' => 's',
        'Т' => 'T',
        'т' => 't',
        'Ћ' => 'Ć',
        'ћ' => 'ć',
        'У' => 'U',
        'у' => 'u',
        'Ф' => 'F',
        'ф' => 'f',
        'Х' => 'H',
        'х' => 'h',
        'Ц' => 'C',
        'ц' => 'c',
        'Ч' => 'Č',
        'ч' => 'č',
        'Ш' => 'Š',
        'ш' => 'š',
        _ => c,
    }
}
