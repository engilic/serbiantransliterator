// src/wasm-core/src/rules.rs

pub const SYSTEM_EXCEPTIONS: &[(&str, &str)] = &[
    // Hemija i nauka
    ("anjon", "анјон"),
    ("katjon", "катјон"),
    ("konjug", "конјуг"),
    ("konjunk", "конјунк"),
    ("injekc", "инјекц"),
    ("injekt", "инјект"),
    // Novinske agencije i specifična imena
    ("tanjug", "танјуг"),
    // Specifični prefiksi koji nisu pokriveni opštom logikom
    ("izvanj", "извањ"),    // izvan-j (retko, ali postoji)
    ("vanjezi", "ванјези"), // van-jezički
];
