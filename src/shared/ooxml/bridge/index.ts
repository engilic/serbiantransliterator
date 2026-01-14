// Lexical bridges
export { bridgeLinksAcrossTextNodes } from "./lexical/links";
export {
    bridgeAlwaysLatinTokensAcrossTextNodes,
    bridgeExactTokensAcrossTextNodes
} from "./lexical/tokens";
export {
    buildPhraseInfos,
    bridgePhrasesAcrossTextNodes,
    type PhraseInfo
} from "./lexical/phrases";
export { bridgeDigraphsAcrossTextNodes } from "./lexical/digraphs";

// Structural bridges
export { bridgeSpacesAcrossTextNodes } from "./structural/spaces";
export {
    markCyrAllCapsDigraphHints,
    CYR_ALLCAPS_HINT,
    LAT_ALLCAPS_HINT
} from "./structural/allCapsHints";
export { bridgeAmbiguousBrandSuffixAcrossTextNodes } from "./lexical/ambiguousSuffix";