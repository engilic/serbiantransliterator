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

// PR2/PR3:
export { bridgeAmbiguousBrandSuffixAcrossTextNodes } from "./lexical/ambiguousSuffix";

// Structural bridges
export { bridgeSpacesAcrossTextNodes } from "./structural/spaces";
export {
    markCyrAllCapsDigraphHints,
    CYR_ALLCAPS_HINT,
    LAT_ALLCAPS_HINT
} from "./structural/allCapsHints";