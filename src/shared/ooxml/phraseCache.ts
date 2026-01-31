// src/shared/ooxml/phraseCache.ts

import { buildPhraseInfos } from "./bridge/index";
import { ALWAYS_LATIN_PHRASES } from "../../core/rules";

export const ALWAYS_LATIN_PHRASE_INFOS = buildPhraseInfos(ALWAYS_LATIN_PHRASES);
const PHRASE_INFOS_CACHE_MAX = 80;
const phraseInfosCache = new Map<string, ReturnType<typeof buildPhraseInfos>>();

function normalizePhraseForKey(p: string): string {
    return p.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
}

function phrasesCacheKey(phrases: string[]): string {
    const norm = phrases.map(normalizePhraseForKey).filter(Boolean);
    const uniqSorted = Array.from(new Set(norm)).sort();
    return JSON.stringify(uniqSorted);
}

export function getCachedPhraseInfos(phrases: string[]) {
    const key = phrasesCacheKey(phrases);
    const hit = phraseInfosCache.get(key);
    if (hit) return hit;
    const infos = buildPhraseInfos(phrases);
    phraseInfosCache.set(key, infos);
    if (phraseInfosCache.size > PHRASE_INFOS_CACHE_MAX) {
        const firstKey = phraseInfosCache.keys().next().value as string | undefined;
        if (firstKey) phraseInfosCache.delete(firstKey);
    }
    return infos;
}
