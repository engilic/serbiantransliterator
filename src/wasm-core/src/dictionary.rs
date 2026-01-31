use std::collections::HashMap;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use fst::Map;
use serde_json;

pub struct DictionaryStore {
    pub fst: Map<Vec<u8>>,
    pub values: Vec<u8>,
    pub suffixes: Vec<String>,
}

pub static DICTIONARIES: Lazy<Mutex<HashMap<String, DictionaryStore>>> = Lazy::new(|| {
    Mutex::new(HashMap::new())
});

fn read_u64(slice: &[u8]) -> u64 {
    let mut bytes = [0u8; 8];
    bytes.copy_from_slice(slice);
    u64::from_le_bytes(bytes)
}

pub fn load_dictionary_internal(mode: &str, bin_data: &[u8]) -> Result<(), String> {
    let mut cursor = 0;

    if bin_data.len() < cursor + 8 { return Err("Invalid bin (FST len)".to_string()); }
    let fst_len = read_u64(&bin_data[cursor..cursor+8]) as usize;
    cursor += 8;

    if bin_data.len() < cursor + fst_len { return Err("Invalid bin (FST body)".to_string()); }
    let fst_bytes = bin_data[cursor..cursor+fst_len].to_vec();
    cursor += fst_len;

    let fst = Map::new(fst_bytes).map_err(|e| e.to_string())?;

    if bin_data.len() < cursor + 8 { return Err("Invalid bin (Val len)".to_string()); }
    let val_len = read_u64(&bin_data[cursor..cursor+8]) as usize;
    cursor += 8;

    if bin_data.len() < cursor + val_len { return Err("Invalid bin (Val body)".to_string()); }
    let values_bytes = bin_data[cursor..cursor+val_len].to_vec();
    cursor += val_len;

    if bin_data.len() < cursor + 8 { return Err("Invalid bin (Suf len)".to_string()); }
    let suf_len = read_u64(&bin_data[cursor..cursor+8]) as usize;
    cursor += 8;

    if bin_data.len() < cursor + suf_len { return Err("Invalid bin (Suf body)".to_string()); }
    let suf_bytes = &bin_data[cursor..cursor+suf_len];
    
    let suffixes: Vec<String> = serde_json::from_slice(suf_bytes)
        .map_err(|e| format!("Suffix decode error: {}", e))?;

    let store = DictionaryStore {
        fst,
        values: values_bytes,
        suffixes,
    };

    let mut global = DICTIONARIES.lock().map_err(|_| "Mutex poisoned".to_string())?;
    let key = match mode {
        "e2i" => "ekavica_to_ijekavica",
        "i2e" => "ijekavica_to_ekavica",
        _ => mode
    };
    global.insert(key.to_string(), store);
    Ok(())
}
