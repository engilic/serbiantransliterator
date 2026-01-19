use wasm_bindgen::prelude::*;

// Baza znanja (U produkciji ovo bi se učitavalo iz fajla, ovde je hardcoded radi brzine)
fn get_ekavica_to_ijekavica(word: &str) -> Option<&str> {
    match word.to_lowercase().as_str() {
        "vreme" => Some("vrijeme"),
        "lepo" => Some("lijepo"),
        "deca" => Some("djeca"),
        "vera" => Some("vjera"),
        "reka" => Some("rijeka"),
        "pesma" => Some("pjesma"),
        "mesec" => Some("mjesec"),
        "mesto" => Some("mjesto"),
        "vesti" => Some("vijesti"),
        "zvezda" => Some("zvijezda"),
        "sneg" => Some("snijeg"),
        "celo" => Some("cijelo"),
        "belo" => Some("bijelo"),
        "htela" => Some("htjela"),
        "videla" => Some("vidjela"),
        "leteti" => Some("letjeti"),
        "razumeti" => Some("razumjeti"),
        "uspeh" => Some("uspjeh"),
        "svet" => Some("svijet"),
        "cvet" => Some("cvijet"),
        _ => None,
    }
}

fn get_ijekavica_to_ekavica(word: &str) -> Option<&str> {
    match word.to_lowercase().as_str() {
        "vrijeme" => Some("vreme"),
        "lijepo" => Some("lepo"),
        "djeca" => Some("deca"),
        "vjera" => Some("vera"),
        "rijeka" => Some("reka"),
        "pjesma" => Some("pesma"),
        "mjesec" => Some("mesec"),
        "mjesto" => Some("mesto"),
        "vijesti" => Some("vesti"),
        "zvijezda" => Some("zvezda"),
        "snijeg" => Some("sneg"),
        "cijelo" => Some("celo"),
        "bijelo" => Some("belo"),
        "htjela" => Some("htela"),
        "vidjela" => Some("videla"),
        "letjeti" => Some("leteti"),
        "razumjeti" => Some("razumeti"),
        "uspjeh" => Some("uspeh"),
        "svijet" => Some("svet"),
        "cvijet" => Some("cvet"),
        _ => None,
    }
}

// Funkcija koja čuva veliko slovo (Lepo -> Lijepo, lepo -> lijepo)
fn match_case(original: &str, replacement: &str) -> String {
    let mut chars_orig = original.chars();
    let first = chars_orig.next();
    
    if let Some(f) = first {
        if f.is_uppercase() {
            let mut chars_repl = replacement.chars();
            if let Some(r) = chars_repl.next() {
                return format!("{}{}", r.to_uppercase(), chars_repl.as_str());
            }
        }
    }
    replacement.to_string()
}

#[wasm_bindgen]
pub fn convert_dialect(text: &str, mode: &str) -> String {
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

        // Uhvati reč
        let start = i;
        while i < len && chars[i].is_alphabetic() {
            i += 1;
        }
        let word: String = chars[start..i].iter().collect();

        // Proveri zamenu
        let replacement = match mode {
            "ekavica_to_ijekavica" => get_ekavica_to_ijekavica(&word),
            "ijekavica_to_ekavica" => get_ijekavica_to_ekavica(&word),
            _ => None
        };

        if let Some(repl) = replacement {
            result.push_str(&match_case(&word, repl));
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
            'Ч' => result.push('Č'), 'ч' => result.push('č'),
            'Џ' => result.push_str("Dž"), 'џ' => result.push_str("dž"),
            'Ш' => result.push('Š'), 'ш' => result.push('š'),
            _ => result.push(c),
        }
        i += 1;
    }
    result
}
