use std::collections::HashMap;
use std::fs::File;
use std::io::Read;
use std::io::Write;
use std::path::Path;

fn main() {
    println!("Compiling dictionaries...");
    compile("dict_e2i");
    compile("dict_i2e");
    println!("Done!");
}

fn compile(name: &str) {
    // Putanje relativne u odnosu na src/wasm-core
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

    let map: HashMap<String, String> = serde_json::from_str(&data).expect("Invalid JSON");
    
    let encoded: Vec<u8> = bincode::serialize(&map).expect("Serialization failed");

    let mut out = File::create(bin_path).expect("Unable to create bin file");
    out.write_all(&encoded).expect("Unable to write bin file");
    
    println!("Saved binary to ../../src/static/assets/{}.bin ({:.2} KB)", name, encoded.len() as f64 / 1024.0);
}
