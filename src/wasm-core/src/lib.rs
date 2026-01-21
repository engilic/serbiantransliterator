use wasm_bindgen::prelude::*;
use std::collections::HashMap;
use std::sync::Mutex;
use once_cell::sync::Lazy;

// Globalno skladište
static DICTIONARY: Lazy<Mutex<HashMap<String, HashMap<String, String>>>> = Lazy::new(|| {
    Mutex::new(HashMap::new())
});

#[wasm_bindgen]
pub fn load_dictionary(mode: &str, json_data: &str) -> Result<(), JsValue> {
    let data: HashMap<String, String> = serde_json::from_str(json_data)
        .map_err(|e| JsValue::from_str(&format!("JSON error: {}", e)))?;
    insert_data(mode, data)?;
    Ok(())
}

#[wasm_bindgen]
pub fn load_dictionary_bin(mode: &str, bin_data: &[u8]) -> Result<(), JsValue> {
    let data: HashMap<String, String> = bincode::deserialize(bin_data)
        .map_err(|e| JsValue::from_str(&format!("Bincode error: {}", e)))?;
    insert_data(mode, data)?;
    Ok(())
}

fn insert_data(mode: &str, data: HashMap<String, String>) -> Result<(), JsValue> {
    let mut global_dict = DICTIONARY.lock().map_err(|_| JsValue::from_str("Mutex poisoned"))?;
    let key = match mode {
        "e2i" => "ekavica_to_ijekavica",
        "i2e" => "ijekavica_to_ekavica",
        _ => mode
    };
    global_dict.insert(key.to_string(), data);
    Ok(())
}

// === SMART STEMMING LOGIC ===

// Najčešći srpski sufiksi (poređani po dužini, duži prvo da ne bi "pojeli" kraće greškom)
// Ovo pokriva: Pridjeve, Imenice (padeže), Glagole (neka vremena)
const SUFFIXES: &[&str] = &[
    "ima", "om", "em", "im", "ih", "og", "eg", "uj", // 2-3 slova
    "a", "e", "i", "o", "u"                          // 1 slovo
];

fn try_smart_lookup(map: &HashMap<String, String>, word: &str) -> Option<String> {
    let word_lower = word.to_lowercase();

    // 1. Probaj tačan pogodak (najbrže)
    if let Some(res) = map.get(&word_lower) {
        return Some(match_case(word, res));
    }

    // 2. Probaj skidanje sufiksa (Stemming)
    // Ne diramo reči kraće od 4 slova da ne bismo uništili kratke reči (npr. 'oko' -> 'ok')
    if word_lower.chars().count() < 4 {
        return None;
    }

    for suffix in SUFFIXES {
        if word_lower.ends_with(suffix) {
            let root_len = word_lower.len() - suffix.len();
            let root = &word_lower[..root_len];

            // Ako je koren prekratak, batali (npr. 'brzi' -> 'br' + 'zi' -> ne valja)
            if root.chars().count() < 3 {
                continue;
            }

            if let Some(root_translation) = map.get(root) {
                // NAŠLI SMO KOREN!
                // Sada treba zalepiti sufiks nazad na PREVEDENI koren.
                // Primer: ulaz "lepim" -> root "lep" -> prevod "lijep" -> izlaz "lijep" + "im"
                
                let mut result = root_translation.clone();
                result.push_str(suffix);
                return Some(match_case(word, &result));
            }
        }
    }

    None
}

// === END SMART LOGIC ===

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
    // Uzmi referencu na mapu da ne lock-ujemo mutex 1000 puta u petlji
    let guard = DICTIONARY.lock().unwrap();
    let map_opt = guard.get(mode);

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

        // Ako imamo mapu, probaj pametni lookup
        let replacement = if let Some(map) = map_opt {
            try_smart_lookup(map, &word)
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

#[wasm_bindgen]
pub fn to_cyrillic(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let chars: Vec<char> = text.chars().collect();
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
