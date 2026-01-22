// src/core/grammarManager.ts
import { load_grammar_rules_bin, apply_grammar } from "../wasm-core/pkg";

const RULES_URL = "https://serbiantransliterator.pages.dev/assets/grammar_rules.bin"; // Online
const LOCAL_BACKUP = "../static/assets/grammar_rules.bin"; // Fallback unutar bundle-a

export async function initGrammar() {
    try {
        // 1. Pokušaj učitavanja iz LocalStorage (cache)
        // TODO: Implementirati IndexedDB čuvanje za sledeći PR.

        // 2. Fallback: Učitaj lokalni bundle fajl (za prvi start bez neta)
        // U realnosti ovde koristimo fetch() ka lokalnom fajlu ili import buffer
        const response = await fetch(new URL(LOCAL_BACKUP, import.meta.url));
        if (response.ok) {
            const buffer = await response.arrayBuffer();
            load_grammar_rules_bin(new Uint8Array(buffer));
            console.log("Grammar rules loaded (offline bundle).");
        }

        // 3. Background Sync (Fire & Forget)
        syncGrammarRules();
    } catch (e) {
        console.error("Failed to load grammar rules:", e);
    }
}

async function syncGrammarRules() {
    if (!navigator.onLine) return;

    try {
        const response = await fetch(RULES_URL);
        if (response.ok) {
            const buffer = await response.arrayBuffer();
            // Ovde bismo sačuvali u LocalStorage/IndexedDB
            // Za sada samo učitavamo u RAM da osvežimo trenutnu sesiju
            load_grammar_rules_bin(new Uint8Array(buffer));
            console.log("Grammar rules updated from cloud.");
        }
    } catch (e) {
        console.warn("Grammar sync failed (ignoring):", e);
    }
}

export function correctGrammar(text: string): string {
    return apply_grammar(text);
}
