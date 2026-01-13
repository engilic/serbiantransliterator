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
export { bridgeRomanContextAcrossTextNodes } from "./lexical/romansContext";

// Structural bridges
export { bridgeSpacesAcrossTextNodes } from "./structural/spaces";
export {
    markCyrAllCapsDigraphHints,
    CYR_ALLCAPS_HINT,
    LAT_ALLCAPS_HINT
} from "./structural/allCapsHints";