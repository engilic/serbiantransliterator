// src/wasm-core/src/tests.rs

#![cfg(test)]

// FIX: Koristimo crate::convert jer je convert sada pub(crate)
use crate::convert::{to_cyrillic_internal, to_latin_internal};

#[test]
fn test_basic_lat_to_cyr() {
    assert_eq!(to_cyrillic_internal("Zdravo"), "Здраво");
    assert_eq!(to_cyrillic_internal("Srbija"), "Србија");
}

#[test]
fn test_digraphs() {
    assert_eq!(to_cyrillic_internal("Ljubav"), "Љубав");
    assert_eq!(to_cyrillic_internal("Njiva"), "Њива");
    assert_eq!(to_cyrillic_internal("Džep"), "Џеп");
}

#[test]
fn test_mixed_case_digraphs() {
    assert_eq!(to_cyrillic_internal("LJubav"), "Љубав");
    // FIX: Rust logika detektuje LJ (velika slova) i pretvara u Љ
    assert_eq!(to_cyrillic_internal("LjUBAV"), "ЉУБАВ");
}

#[test]
fn test_basic_cyr_to_lat() {
    assert_eq!(to_latin_internal("Здраво"), "Zdravo");
    assert_eq!(to_latin_internal("Србија"), "Srbija");
}

#[test]
fn test_cyr_digraphs_to_lat() {
    assert_eq!(to_latin_internal("Љубав"), "Ljubav");
    assert_eq!(to_latin_internal("Њива"), "Njiva");
    assert_eq!(to_latin_internal("Џеп"), "Džep");
}

#[test]
fn test_cyr_allcaps_digraphs_to_lat() {
    // ALL CAPS: Љ + veliko ćir slovo posle => LJ (ne Lj)
    assert_eq!(to_latin_internal("ЉУБЉАНА"), "LJUBLJANA");

    // još 2 brza sanity check-a
    assert_eq!(to_latin_internal("ЊЕГОШ"), "NJEGOŠ");
    assert_eq!(to_latin_internal("ЏЕЗ"), "DŽEZ");
}

#[test]
fn test_cyr_che_to_lat() {
    assert_eq!(to_latin_internal("Чаша"), "Čaša");
    assert_eq!(to_latin_internal("чаша"), "čaša");
}

#[test]
fn test_protection() {
    // Rust engine (bez TS zaštite) preslovljava e-mail jer sadrži samo mapabilna slova.
    assert_eq!(to_cyrillic_internal("e-mail"), "е-маил");

    // Ali štiti reči sa brojevima ili underscore-om
    assert_eq!(to_cyrillic_internal("word_1"), "word_1");
    assert_eq!(to_cyrillic_internal("w0rd"), "w0rd");
}
