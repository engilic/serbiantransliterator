// src/wasm-core/src/bin/compiler.rs

use fst::MapBuilder;
use std::collections::{BTreeMap, HashMap};
use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;

fn main() {
    println!("Compiling dictionaries to FST with Morphology...");

    // Učitaj sufikse jednom (zajednički su)
    let suffixes = load_suffixes();

    compile("dict_e2i", &suffixes);
    compile("dict_i2e", &suffixes);
    println!("Done!");
}

fn load_suffixes() -> Vec<String> {
    let path = Path::new("../../src/static/assets/suffixes.json");
    if !path.exists() {
        println!("Warning: suffixes.json not found, using empty list.");
        return Vec::new();
    }
    let mut file = File::open(path).expect("Unable to open suffixes.json");
    let mut data = String::new();
    file.read_to_string(&mut data)
        .expect("Unable to read suffixes");
    serde_json::from_str(&data).expect("Invalid suffixes JSON")
}

fn compile(name: &str, suffixes: &[String]) {
    let json_path = format!("../../src/static/assets/{}.json", name);
    let bin_path = format!("../../src/static/assets/{}.bin", name);

    println!("Reading {} ...", json_path);
    let path = Path::new(&json_path);
    if !path.exists() {
        println!("Error: File not found: {}", json_path);
        return;
    }

    let mut file = File::open(path).expect("Unable to open JSON file");
    let mut data = String::new();
    file.read_to_string(&mut data)
        .expect("Unable to read string");

    let raw_map: HashMap<String, String> = serde_json::from_str(&data).expect("Invalid JSON");
    let sorted_map: BTreeMap<String, String> = raw_map.into_iter().collect();

    // 1. Values Buffer
    let mut values_buffer = Vec::new();
    let mut fst_buffer = Vec::new();
    let mut build = MapBuilder::new(&mut fst_buffer).unwrap();

    for (key, value) in sorted_map {
        let offset = values_buffer.len() as u64;
        values_buffer.extend_from_slice(value.as_bytes());
        values_buffer.push(0);
        build.insert(key, offset).unwrap();
    }
    build.finish().unwrap();

    // 2. Suffixes Buffer (JSON string serialized)
    // Najjednostavnije je da sačuvamo sufikse kao JSON string u binaru
    let suffixes_json = serde_json::to_string(suffixes).unwrap();
    let suffixes_bytes = suffixes_json.as_bytes();

    // 3. Spajanje
    // Format: [FST_LEN 8b][FST][VAL_LEN 8b][VAL][SUF_LEN 8b][SUF]
    let mut final_file = File::create(bin_path).expect("Unable to create bin file");

    let fst_len = fst_buffer.len() as u64;
    let val_len = values_buffer.len() as u64;
    let suf_len = suffixes_bytes.len() as u64;

    final_file.write_all(&fst_len.to_le_bytes()).unwrap();
    final_file.write_all(&fst_buffer).unwrap();

    final_file.write_all(&val_len.to_le_bytes()).unwrap();
    final_file.write_all(&values_buffer).unwrap();

    final_file.write_all(&suf_len.to_le_bytes()).unwrap();
    final_file.write_all(suffixes_bytes).unwrap();

    println!(
        "Saved Enhanced FST binary ({:.2} KB)",
        (fst_len + val_len + suf_len + 24) as f64 / 1024.0
    );
}
