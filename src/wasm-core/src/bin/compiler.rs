use std::collections::{BTreeMap, HashMap};
use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;
use fst::MapBuilder;

fn main() {
    println!("Compiling dictionaries to FST...");
    compile("dict_e2i");
    compile("dict_i2e");
    println!("Done!");
}

fn compile(name: &str) {
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
    file.read_to_string(&mut data).expect("Unable to read string");

    let raw_map: HashMap<String, String> = serde_json::from_str(&data).expect("Invalid JSON");

    // 1. Sortiranje (FST zahteva sortirane ključeve)
    // Koristimo BTreeMap da automatski sortira
    let sorted_map: BTreeMap<String, String> = raw_map.into_iter().collect();

    // 2. Izgradnja Values Buffera i FST-a
    let mut values_buffer = Vec::new();
    let mut fst_buffer = Vec::new();
    let mut build = MapBuilder::new(&mut fst_buffer).unwrap();

    for (key, value) in sorted_map {
        // Offset gde počinje ovaj prevod u values_bufferu
        let offset = values_buffer.len() as u64;
        
        // Ubaci prevod u buffer (sa null byte-om kao separatorom)
        values_buffer.extend_from_slice(value.as_bytes());
        values_buffer.push(0); // separator

        // Ubaci u FST: key -> offset
        build.insert(key, offset).unwrap();
    }

    build.finish().unwrap();

    // 3. Spajanje u jedan fajl
    // Format: [FST LEN (8 bytes)][FST BYTES][VALUES BYTES]
    let mut final_file = File::create(bin_path).expect("Unable to create bin file");
    
    let fst_len = fst_buffer.len() as u64;
    final_file.write_all(&fst_len.to_le_bytes()).unwrap(); // Header: dužina FST-a
    final_file.write_all(&fst_buffer).unwrap();            // FST podaci
    final_file.write_all(&values_buffer).unwrap();         // Values podaci

    println!("Saved FST binary to ../../src/static/assets/{}.bin ({:.2} KB)", name, (fst_len + values_buffer.len() as u64 + 8) as f64 / 1024.0);
}
