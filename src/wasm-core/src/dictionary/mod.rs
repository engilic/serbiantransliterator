mod nouns;
mod adjectives;
mod verbs;
mod others;

pub fn get_ekavica_to_ijekavica(word: &str) -> Option<&str> {
    nouns::e2i(word)
        .or_else(|| verbs::e2i(word))
        .or_else(|| adjectives::e2i(word))
        .or_else(|| others::e2i(word))
}

pub fn get_ijekavica_to_ekavica(word: &str) -> Option<&str> {
    nouns::i2e(word)
        .or_else(|| verbs::i2e(word))
        .or_else(|| adjectives::i2e(word))
        .or_else(|| others::i2e(word))
}
