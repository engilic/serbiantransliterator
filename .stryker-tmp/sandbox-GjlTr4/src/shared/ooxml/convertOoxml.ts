// @ts-nocheck
// src/shared/ooxml/convertOoxml.ts
function stryNS_9fa48() {
    var g =
        (typeof globalThis === "object" && globalThis && globalThis.Math === Math && globalThis) ||
        new Function("return this")();
    var ns = g.__stryker__ || (g.__stryker__ = {});
    if (
        ns.activeMutant === undefined &&
        g.process &&
        g.process.env &&
        g.process.env.__STRYKER_ACTIVE_MUTANT__
    ) {
        ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
    }
    function retrieveNS() {
        return ns;
    }
    stryNS_9fa48 = retrieveNS;
    return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
    var ns = stryNS_9fa48();
    var cov =
        ns.mutantCoverage ||
        (ns.mutantCoverage = {
            static: {},
            perTest: {},
        });
    function cover() {
        var c = cov.static;
        if (ns.currentTestId) {
            c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
        }
        var a = arguments;
        for (var i = 0; i < a.length; i++) {
            c[a[i]] = (c[a[i]] || 0) + 1;
        }
    }
    stryCov_9fa48 = cover;
    cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
    var ns = stryNS_9fa48();
    function isActive(id) {
        if (ns.activeMutant === id) {
            if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
                throw new Error("Stryker: Hit count limit reached (" + ns.hitCount + ")");
            }
            return true;
        }
        return false;
    }
    stryMutAct_9fa48 = isActive;
    return isActive(id);
}
import { convertPlainText, type Direction, type CoreOptions, detectScript } from "../../core/textCore";
import {
    XML_NS,
    WORD_NS,
    collectTextNodes,
    getFullText,
    needsXmlSpacePreserve,
    getParagraphStyleId,
    getRunStyleId,
    // <--- NEW
    isInsideTag,
} from "./dom";
import { applySerbianQuotesAcrossNodes } from "./quotes";
import { createInitialCodeState, createInitialCodeParseStats, transformTextRespectingCode } from "./code";
import {
    bridgeLinksAcrossTextNodes,
    bridgeAlwaysLatinTokensAcrossTextNodes,
    bridgeExactTokensAcrossTextNodes,
    bridgePhrasesAcrossTextNodes,
    bridgeDigraphsAcrossTextNodes,
    bridgeSpacesAcrossTextNodes,
    bridgeAmbiguousBrandSuffixAcrossTextNodes,
    bridgeBracedPlaceholdersAcrossTextNodes,
    markCyrAllCapsDigraphHints,
    LAT_ALLCAPS_HINT,
    buildPhraseInfos,
} from "./bridge/index";
import { URL_RE_G, EMAIL_RE_G } from "../patterns/links";
import { perfMonitor } from "../../taskpane/app/telemetry/performanceMonitor";
import { removeProofingTags, findAncestor, countMatches, toAscii } from "./converterUtils";
import { parseSafeOoxml } from "./xmlParser";
import { createEmptyStats, type ConvertStats } from "./stats";
import { getCachedPhraseInfos, ALWAYS_LATIN_PHRASE_INFOS } from "./phraseCache";
import { ROMAN_REGEX_STRICT, ROMAN_I_REGEX } from "./roman";
import { applyProofingLanguagePreserveUnchanged, targetLangForDirection } from "./proofing";
export interface OoxmlOptions extends CoreOptions {
    direction?: Direction | "to-ascii";
    setProofingLanguage?: boolean;
    protectRomans?: boolean;
    ignoredStyles?: string[];
}
export { ConvertStats };

// [REMOVED] isNodeInIgnoredStyle (više nam ne treba, radimo pametnije)

export function convertOoxml(
    ooxml: string,
    options?: OoxmlOptions
): {
    xml: string;
    type: string;
    stats: ConvertStats;
} {
    if (stryMutAct_9fa48("3713")) {
        {
        }
    } else {
        stryCov_9fa48("3713");
        const t0 = (
            stryMutAct_9fa48("3716")
                ? typeof performance !== "undefined" || performance.now
                : stryMutAct_9fa48("3715")
                  ? false
                  : stryMutAct_9fa48("3714")
                    ? true
                    : (stryCov_9fa48("3714", "3715", "3716"),
                      (stryMutAct_9fa48("3718")
                          ? typeof performance === "undefined"
                          : stryMutAct_9fa48("3717")
                            ? true
                            : (stryCov_9fa48("3717", "3718"),
                              typeof performance !==
                                  (stryMutAct_9fa48("3719") ? "" : (stryCov_9fa48("3719"), "undefined")))) &&
                          performance.now)
        )
            ? performance.now()
            : Date.now();
        const ooxmlSizeKb = Math.round(
            stryMutAct_9fa48("3720") ? ooxml.length * 1024 : (stryCov_9fa48("3720"), ooxml.length / 1024)
        );
        const doc = parseSafeOoxml(ooxml);
        if (
            stryMutAct_9fa48("3723")
                ? false
                : stryMutAct_9fa48("3722")
                  ? true
                  : stryMutAct_9fa48("3721")
                    ? doc
                    : (stryCov_9fa48("3721", "3722", "3723"), !doc)
        ) {
            if (stryMutAct_9fa48("3724")) {
                {
                }
            } else {
                stryCov_9fa48("3724");
                return stryMutAct_9fa48("3725")
                    ? {}
                    : (stryCov_9fa48("3725"),
                      {
                          xml: stryMutAct_9fa48("3726") ? "Stryker was here!" : (stryCov_9fa48("3726"), ""),
                          type: stryMutAct_9fa48("3727")
                              ? ""
                              : (stryCov_9fa48("3727"), "Greška: Nebezbedan ili nevalidan XML"),
                          stats: createEmptyStats(
                              stryMutAct_9fa48("3728")
                                  ? options.direction
                                  : (stryCov_9fa48("3728"), options?.direction)
                          ),
                      });
            }
        }
        try {
            if (stryMutAct_9fa48("3729")) {
                {
                }
            } else {
                stryCov_9fa48("3729");
                const pe = doc.getElementsByTagName(
                    stryMutAct_9fa48("3730") ? "" : (stryCov_9fa48("3730"), "parsererror")
                );
                if (
                    stryMutAct_9fa48("3733")
                        ? pe || pe.length > 0
                        : stryMutAct_9fa48("3732")
                          ? false
                          : stryMutAct_9fa48("3731")
                            ? true
                            : (stryCov_9fa48("3731", "3732", "3733"),
                              pe &&
                                  (stryMutAct_9fa48("3736")
                                      ? pe.length <= 0
                                      : stryMutAct_9fa48("3735")
                                        ? pe.length >= 0
                                        : stryMutAct_9fa48("3734")
                                          ? true
                                          : (stryCov_9fa48("3734", "3735", "3736"), pe.length > 0)))
                ) {
                    if (stryMutAct_9fa48("3737")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3737");
                        return stryMutAct_9fa48("3738")
                            ? {}
                            : (stryCov_9fa48("3738"),
                              {
                                  xml: ooxml,
                                  type: stryMutAct_9fa48("3739")
                                      ? ""
                                      : (stryCov_9fa48("3739"), "Nema teksta"),
                                  stats: createEmptyStats(
                                      stryMutAct_9fa48("3740")
                                          ? options.direction
                                          : (stryCov_9fa48("3740"), options?.direction)
                                  ),
                              });
                    }
                }
            }
        } catch {
            // ignore
        }

        // [MAX3] REFACTOR: Smart Traversal (Paragraph -> Run -> Text)
        // Ovo je O(N) i podržava rStyle (Character Styles).

        const allParas = Array.from(
            doc.getElementsByTagNameNS(WORD_NS, stryMutAct_9fa48("3741") ? "" : (stryCov_9fa48("3741"), "p"))
        );
        const ignoredSet = new Set(
            stryMutAct_9fa48("3744")
                ? options?.ignoredStyles && []
                : stryMutAct_9fa48("3743")
                  ? false
                  : stryMutAct_9fa48("3742")
                    ? true
                    : (stryCov_9fa48("3742", "3743", "3744"),
                      (stryMutAct_9fa48("3745")
                          ? options.ignoredStyles
                          : (stryCov_9fa48("3745"), options?.ignoredStyles)) ||
                          (stryMutAct_9fa48("3746") ? ["Stryker was here"] : (stryCov_9fa48("3746"), [])))
        );
        const textNodesToProcess: Element[] = stryMutAct_9fa48("3747")
            ? ["Stryker was here"]
            : (stryCov_9fa48("3747"), []);

        // Fallback: Ako nema paragrafa (npr. samo run fragment), koristi stari metod
        if (
            stryMutAct_9fa48("3750")
                ? allParas.length !== 0
                : stryMutAct_9fa48("3749")
                  ? false
                  : stryMutAct_9fa48("3748")
                    ? true
                    : (stryCov_9fa48("3748", "3749", "3750"), allParas.length === 0)
        ) {
            if (stryMutAct_9fa48("3751")) {
                {
                }
            } else {
                stryCov_9fa48("3751");
                // [FIX] I ovde možemo proveriti rStyle ako roditelj postoji
                let nodes = collectTextNodes(doc);
                if (
                    stryMutAct_9fa48("3755")
                        ? ignoredSet.size <= 0
                        : stryMutAct_9fa48("3754")
                          ? ignoredSet.size >= 0
                          : stryMutAct_9fa48("3753")
                            ? false
                            : stryMutAct_9fa48("3752")
                              ? true
                              : (stryCov_9fa48("3752", "3753", "3754", "3755"), ignoredSet.size > 0)
                ) {
                    if (stryMutAct_9fa48("3756")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3756");
                        nodes = stryMutAct_9fa48("3757")
                            ? nodes
                            : (stryCov_9fa48("3757"),
                              nodes.filter((n) => {
                                  if (stryMutAct_9fa48("3758")) {
                                      {
                                      }
                                  } else {
                                      stryCov_9fa48("3758");
                                      const run = findAncestor(
                                          n,
                                          stryMutAct_9fa48("3759") ? "" : (stryCov_9fa48("3759"), "r")
                                      );
                                      if (
                                          stryMutAct_9fa48("3761")
                                              ? false
                                              : stryMutAct_9fa48("3760")
                                                ? true
                                                : (stryCov_9fa48("3760", "3761"), run)
                                      ) {
                                          if (stryMutAct_9fa48("3762")) {
                                              {
                                              }
                                          } else {
                                              stryCov_9fa48("3762");
                                              const rStyle = getRunStyleId(run);
                                              if (
                                                  stryMutAct_9fa48("3765")
                                                      ? rStyle || ignoredSet.has(rStyle)
                                                      : stryMutAct_9fa48("3764")
                                                        ? false
                                                        : stryMutAct_9fa48("3763")
                                                          ? true
                                                          : (stryCov_9fa48("3763", "3764", "3765"),
                                                            rStyle && ignoredSet.has(rStyle))
                                              )
                                                  return stryMutAct_9fa48("3766")
                                                      ? true
                                                      : (stryCov_9fa48("3766"), false);
                                          }
                                      }
                                      return stryMutAct_9fa48("3767") ? false : (stryCov_9fa48("3767"), true);
                                  }
                              }));
                    }
                }
                textNodesToProcess.push(...nodes);
            }
        } else {
            if (stryMutAct_9fa48("3768")) {
                {
                }
            } else {
                stryCov_9fa48("3768");
                for (const para of allParas) {
                    if (stryMutAct_9fa48("3769")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3769");
                        // 1. Check Paragraph Style (pStyle)
                        if (
                            stryMutAct_9fa48("3773")
                                ? ignoredSet.size <= 0
                                : stryMutAct_9fa48("3772")
                                  ? ignoredSet.size >= 0
                                  : stryMutAct_9fa48("3771")
                                    ? false
                                    : stryMutAct_9fa48("3770")
                                      ? true
                                      : (stryCov_9fa48("3770", "3771", "3772", "3773"), ignoredSet.size > 0)
                        ) {
                            if (stryMutAct_9fa48("3774")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("3774");
                                const pStyle = getParagraphStyleId(para);
                                if (
                                    stryMutAct_9fa48("3777")
                                        ? pStyle || ignoredSet.has(pStyle)
                                        : stryMutAct_9fa48("3776")
                                          ? false
                                          : stryMutAct_9fa48("3775")
                                            ? true
                                            : (stryCov_9fa48("3775", "3776", "3777"),
                                              pStyle && ignoredSet.has(pStyle))
                                ) {
                                    if (stryMutAct_9fa48("3778")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("3778");
                                        continue; // SKIP entire paragraph
                                    }
                                }
                            }
                        }

                        // 2. Collect nodes from runs
                        const runs = Array.from(
                            para.getElementsByTagNameNS(
                                WORD_NS,
                                stryMutAct_9fa48("3779") ? "" : (stryCov_9fa48("3779"), "r")
                            )
                        );
                        for (const run of runs) {
                            if (stryMutAct_9fa48("3780")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("3780");
                                // 3. [NEW] Check Character Style (rStyle)
                                if (
                                    stryMutAct_9fa48("3784")
                                        ? ignoredSet.size <= 0
                                        : stryMutAct_9fa48("3783")
                                          ? ignoredSet.size >= 0
                                          : stryMutAct_9fa48("3782")
                                            ? false
                                            : stryMutAct_9fa48("3781")
                                              ? true
                                              : (stryCov_9fa48("3781", "3782", "3783", "3784"),
                                                ignoredSet.size > 0)
                                ) {
                                    if (stryMutAct_9fa48("3785")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("3785");
                                        const rStyle = getRunStyleId(run);
                                        if (
                                            stryMutAct_9fa48("3788")
                                                ? rStyle || ignoredSet.has(rStyle)
                                                : stryMutAct_9fa48("3787")
                                                  ? false
                                                  : stryMutAct_9fa48("3786")
                                                    ? true
                                                    : (stryCov_9fa48("3786", "3787", "3788"),
                                                      rStyle && ignoredSet.has(rStyle))
                                        ) {
                                            if (stryMutAct_9fa48("3789")) {
                                                {
                                                }
                                            } else {
                                                stryCov_9fa48("3789");
                                                continue; // SKIP this run (inline code)
                                            }
                                        }
                                    }
                                }
                                const tNodes = Array.from(
                                    run.getElementsByTagNameNS(
                                        WORD_NS,
                                        stryMutAct_9fa48("3790") ? "" : (stryCov_9fa48("3790"), "t")
                                    )
                                );
                                for (const t of tNodes) {
                                    if (stryMutAct_9fa48("3791")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("3791");
                                        // Security filters
                                        if (
                                            stryMutAct_9fa48("3793")
                                                ? false
                                                : stryMutAct_9fa48("3792")
                                                  ? true
                                                  : (stryCov_9fa48("3792", "3793"),
                                                    isInsideTag(
                                                        t,
                                                        stryMutAct_9fa48("3794")
                                                            ? ""
                                                            : (stryCov_9fa48("3794"), "instrText")
                                                    ))
                                        )
                                            continue;
                                        if (
                                            stryMutAct_9fa48("3796")
                                                ? false
                                                : stryMutAct_9fa48("3795")
                                                  ? true
                                                  : (stryCov_9fa48("3795", "3796"),
                                                    isInsideTag(
                                                        t,
                                                        stryMutAct_9fa48("3797")
                                                            ? ""
                                                            : (stryCov_9fa48("3797"), "fldSimple")
                                                    ))
                                        )
                                            continue;
                                        if (
                                            stryMutAct_9fa48("3799")
                                                ? false
                                                : stryMutAct_9fa48("3798")
                                                  ? true
                                                  : (stryCov_9fa48("3798", "3799"),
                                                    isInsideTag(
                                                        t,
                                                        stryMutAct_9fa48("3800")
                                                            ? ""
                                                            : (stryCov_9fa48("3800"), "fldChar")
                                                    ))
                                        )
                                            continue;
                                        if (
                                            stryMutAct_9fa48("3802")
                                                ? false
                                                : stryMutAct_9fa48("3801")
                                                  ? true
                                                  : (stryCov_9fa48("3801", "3802"),
                                                    isInsideTag(
                                                        t,
                                                        stryMutAct_9fa48("3803")
                                                            ? ""
                                                            : (stryCov_9fa48("3803"), "delText")
                                                    ))
                                        )
                                            continue;
                                        textNodesToProcess.push(t);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        const textNodes = textNodesToProcess;
        const fullText = getFullText(textNodes);
        if (
            stryMutAct_9fa48("3806")
                ? false
                : stryMutAct_9fa48("3805")
                  ? true
                  : stryMutAct_9fa48("3804")
                    ? fullText.trim()
                    : (stryCov_9fa48("3804", "3805", "3806"),
                      !(stryMutAct_9fa48("3807") ? fullText : (stryCov_9fa48("3807"), fullText.trim())))
        ) {
            if (stryMutAct_9fa48("3808")) {
                {
                }
            } else {
                stryCov_9fa48("3808");
                return stryMutAct_9fa48("3809")
                    ? {}
                    : (stryCov_9fa48("3809"),
                      {
                          xml: ooxml,
                          type: stryMutAct_9fa48("3810") ? "" : (stryCov_9fa48("3810"), "Nema teksta"),
                          stats: createEmptyStats(
                              stryMutAct_9fa48("3811")
                                  ? options.direction
                                  : (stryCov_9fa48("3811"), options?.direction),
                              textNodes.length,
                              fullText.length
                          ),
                      });
            }
        }
        removeProofingTags(doc);

        // ... (Ostatak funkcije ostaje ISTI kao pre, bez izmena) ...
        // Samo kopirajte ostatak od "const dirSetting = options?.direction ?? 'auto';" na dole.

        const dirSetting = stryMutAct_9fa48("3812")
            ? options?.direction && "auto"
            : (stryCov_9fa48("3812"),
              (stryMutAct_9fa48("3813") ? options.direction : (stryCov_9fa48("3813"), options?.direction)) ??
                  (stryMutAct_9fa48("3814") ? "" : (stryCov_9fa48("3814"), "auto")));
        let direction: Direction | "to-ascii";
        if (
            stryMutAct_9fa48("3817")
                ? dirSetting !== "auto"
                : stryMutAct_9fa48("3816")
                  ? false
                  : stryMutAct_9fa48("3815")
                    ? true
                    : (stryCov_9fa48("3815", "3816", "3817"),
                      dirSetting === (stryMutAct_9fa48("3818") ? "" : (stryCov_9fa48("3818"), "auto")))
        ) {
            if (stryMutAct_9fa48("3819")) {
                {
                }
            } else {
                stryCov_9fa48("3819");
                const script = detectScript(fullText);
                direction = (
                    stryMutAct_9fa48("3822")
                        ? script !== "latin"
                        : stryMutAct_9fa48("3821")
                          ? false
                          : stryMutAct_9fa48("3820")
                            ? true
                            : (stryCov_9fa48("3820", "3821", "3822"),
                              script === (stryMutAct_9fa48("3823") ? "" : (stryCov_9fa48("3823"), "latin")))
                )
                    ? stryMutAct_9fa48("3824")
                        ? ""
                        : (stryCov_9fa48("3824"), "lat-to-cyr")
                    : stryMutAct_9fa48("3825")
                      ? ""
                      : (stryCov_9fa48("3825"), "cyr-to-lat");
            }
        } else {
            if (stryMutAct_9fa48("3826")) {
                {
                }
            } else {
                stryCov_9fa48("3826");
                direction = dirSetting;
            }
        }
        let label = stryMutAct_9fa48("3827") ? "" : (stryCov_9fa48("3827"), "Auto");
        if (
            stryMutAct_9fa48("3830")
                ? direction !== "lat-to-cyr"
                : stryMutAct_9fa48("3829")
                  ? false
                  : stryMutAct_9fa48("3828")
                    ? true
                    : (stryCov_9fa48("3828", "3829", "3830"),
                      direction === (stryMutAct_9fa48("3831") ? "" : (stryCov_9fa48("3831"), "lat-to-cyr")))
        )
            label = stryMutAct_9fa48("3832") ? "" : (stryCov_9fa48("3832"), "Lat → Ćir");
        else if (
            stryMutAct_9fa48("3835")
                ? direction !== "cyr-to-lat"
                : stryMutAct_9fa48("3834")
                  ? false
                  : stryMutAct_9fa48("3833")
                    ? true
                    : (stryCov_9fa48("3833", "3834", "3835"),
                      direction === (stryMutAct_9fa48("3836") ? "" : (stryCov_9fa48("3836"), "cyr-to-lat")))
        )
            label = stryMutAct_9fa48("3837") ? "" : (stryCov_9fa48("3837"), "Ćir → Lat");
        else if (
            stryMutAct_9fa48("3840")
                ? direction !== "to-ascii"
                : stryMutAct_9fa48("3839")
                  ? false
                  : stryMutAct_9fa48("3838")
                    ? true
                    : (stryCov_9fa48("3838", "3839", "3840"),
                      direction === (stryMutAct_9fa48("3841") ? "" : (stryCov_9fa48("3841"), "to-ascii")))
        )
            label = stryMutAct_9fa48("3842") ? "" : (stryCov_9fa48("3842"), "Ošišana latinica");
        const preserveCodeBlocks = stryMutAct_9fa48("3845")
            ? options?.preserveCodeBlocks === false
            : stryMutAct_9fa48("3844")
              ? false
              : stryMutAct_9fa48("3843")
                ? true
                : (stryCov_9fa48("3843", "3844", "3845"),
                  (stryMutAct_9fa48("3846")
                      ? options.preserveCodeBlocks
                      : (stryCov_9fa48("3846"), options?.preserveCodeBlocks)) !==
                      (stryMutAct_9fa48("3847") ? true : (stryCov_9fa48("3847"), false)));
        const protectBrands = stryMutAct_9fa48("3850")
            ? options?.protectBrands === false
            : stryMutAct_9fa48("3849")
              ? false
              : stryMutAct_9fa48("3848")
                ? true
                : (stryCov_9fa48("3848", "3849", "3850"),
                  (stryMutAct_9fa48("3851")
                      ? options.protectBrands
                      : (stryCov_9fa48("3851"), options?.protectBrands)) !==
                      (stryMutAct_9fa48("3852") ? true : (stryCov_9fa48("3852"), false)));
        const curlyProtection = stryMutAct_9fa48("3853")
            ? options?.curlyProtection && "placeholders"
            : (stryCov_9fa48("3853"),
              (stryMutAct_9fa48("3854")
                  ? options.curlyProtection
                  : (stryCov_9fa48("3854"), options?.curlyProtection)) ??
                  (stryMutAct_9fa48("3855") ? "" : (stryCov_9fa48("3855"), "placeholders")));
        const shouldSetLang = stryMutAct_9fa48("3858")
            ? options?.setProofingLanguage !== true
            : stryMutAct_9fa48("3857")
              ? false
              : stryMutAct_9fa48("3856")
                ? true
                : (stryCov_9fa48("3856", "3857", "3858"),
                  (stryMutAct_9fa48("3859")
                      ? options.setProofingLanguage
                      : (stryCov_9fa48("3859"), options?.setProofingLanguage)) ===
                      (stryMutAct_9fa48("3860") ? false : (stryCov_9fa48("3860"), true)));
        const doProtectRomans = stryMutAct_9fa48("3863")
            ? options?.protectRomans === false
            : stryMutAct_9fa48("3862")
              ? false
              : stryMutAct_9fa48("3861")
                ? true
                : (stryCov_9fa48("3861", "3862", "3863"),
                  (stryMutAct_9fa48("3864")
                      ? options.protectRomans
                      : (stryCov_9fa48("3864"), options?.protectRomans)) !==
                      (stryMutAct_9fa48("3865") ? true : (stryCov_9fa48("3865"), false)));
        const detectedUrls = countMatches(fullText, URL_RE_G);
        const detectedEmails = countMatches(fullText, EMAIL_RE_G);
        const userProtected = stryMutAct_9fa48("3866")
            ? options?.userProtected && []
            : (stryCov_9fa48("3866"),
              (stryMutAct_9fa48("3867")
                  ? options.userProtected
                  : (stryCov_9fa48("3867"), options?.userProtected)) ??
                  (stryMutAct_9fa48("3868") ? ["Stryker was here"] : (stryCov_9fa48("3868"), [])));
        const userProtectedPhrases = stryMutAct_9fa48("3869")
            ? userProtected
            : (stryCov_9fa48("3869"),
              userProtected.filter(
                  stryMutAct_9fa48("3870")
                      ? () => undefined
                      : (stryCov_9fa48("3870"),
                        (x) => (stryMutAct_9fa48("3871") ? /\S/ : (stryCov_9fa48("3871"), /\s/)).test(x))
              ));
        const userProtectedTokens = stryMutAct_9fa48("3872")
            ? userProtected
            : (stryCov_9fa48("3872"),
              userProtected.filter(
                  stryMutAct_9fa48("3873")
                      ? () => undefined
                      : (stryCov_9fa48("3873"),
                        (x) =>
                            stryMutAct_9fa48("3876")
                                ? !/\s/.test(x) || x.trim().length > 0
                                : stryMutAct_9fa48("3875")
                                  ? false
                                  : stryMutAct_9fa48("3874")
                                    ? true
                                    : (stryCov_9fa48("3874", "3875", "3876"),
                                      (stryMutAct_9fa48("3877")
                                          ? /\s/.test(x)
                                          : (stryCov_9fa48("3877"),
                                            !(
                                                stryMutAct_9fa48("3878")
                                                    ? /\S/
                                                    : (stryCov_9fa48("3878"), /\s/)
                                            ).test(x))) &&
                                          (stryMutAct_9fa48("3881")
                                              ? x.trim().length <= 0
                                              : stryMutAct_9fa48("3880")
                                                ? x.trim().length >= 0
                                                : stryMutAct_9fa48("3879")
                                                  ? true
                                                  : (stryCov_9fa48("3879", "3880", "3881"),
                                                    (stryMutAct_9fa48("3882")
                                                        ? x.length
                                                        : (stryCov_9fa48("3882"), x.trim().length)) > 0))))
              ));
        const userProtectedTokenSet = new Set(
            userProtectedTokens.map(
                stryMutAct_9fa48("3883")
                    ? () => undefined
                    : (stryCov_9fa48("3883"),
                      (x) => x.normalize(stryMutAct_9fa48("3884") ? "" : (stryCov_9fa48("3884"), "NFC")))
            )
        );
        const bridges = stryMutAct_9fa48("3885")
            ? {}
            : (stryCov_9fa48("3885"),
              {
                  links: 0,
                  placeholders: 0,
                  brandPhrases: 0,
                  brandTokens: 0,
                  ambiguousBrandSuffix: 0,
                  digraphs: 0,
                  userPhrases: 0,
                  userTokens: 0,
                  allCapsHints: 0,
                  spaces: 0,
              });
        bridges.spaces = bridgeSpacesAcrossTextNodes(textNodes);
        if (
            stryMutAct_9fa48("3888")
                ? curlyProtection !== "none"
                : stryMutAct_9fa48("3887")
                  ? false
                  : stryMutAct_9fa48("3886")
                    ? true
                    : (stryCov_9fa48("3886", "3887", "3888"),
                      curlyProtection === (stryMutAct_9fa48("3889") ? "" : (stryCov_9fa48("3889"), "none")))
        ) {
            if (stryMutAct_9fa48("3890")) {
                {
                }
            } else {
                stryCov_9fa48("3890");
                bridges.placeholders = 0;
            }
        } else if (
            stryMutAct_9fa48("3893")
                ? curlyProtection !== "all"
                : stryMutAct_9fa48("3892")
                  ? false
                  : stryMutAct_9fa48("3891")
                    ? true
                    : (stryCov_9fa48("3891", "3892", "3893"),
                      curlyProtection === (stryMutAct_9fa48("3894") ? "" : (stryCov_9fa48("3894"), "all")))
        ) {
            if (stryMutAct_9fa48("3895")) {
                {
                }
            } else {
                stryCov_9fa48("3895");
                bridges.placeholders = bridgeBracedPlaceholdersAcrossTextNodes(
                    textNodes,
                    stryMutAct_9fa48("3896") ? "" : (stryCov_9fa48("3896"), "all")
                );
            }
        } else {
            if (stryMutAct_9fa48("3897")) {
                {
                }
            } else {
                stryCov_9fa48("3897");
                bridges.placeholders = bridgeBracedPlaceholdersAcrossTextNodes(
                    textNodes,
                    stryMutAct_9fa48("3898") ? "" : (stryCov_9fa48("3898"), "placeholders")
                );
            }
        }
        if (
            stryMutAct_9fa48("3900")
                ? false
                : stryMutAct_9fa48("3899")
                  ? true
                  : (stryCov_9fa48("3899", "3900"), userProtectedPhrases.length)
        ) {
            if (stryMutAct_9fa48("3901")) {
                {
                }
            } else {
                stryCov_9fa48("3901");
                const infos = getCachedPhraseInfos(userProtectedPhrases);
                bridges.userPhrases = bridgePhrasesAcrossTextNodes(textNodes, infos);
            }
        }
        if (
            stryMutAct_9fa48("3903")
                ? false
                : stryMutAct_9fa48("3902")
                  ? true
                  : (stryCov_9fa48("3902", "3903"), userProtectedTokens.length)
        ) {
            if (stryMutAct_9fa48("3904")) {
                {
                }
            } else {
                stryCov_9fa48("3904");
                bridges.userTokens = bridgeExactTokensAcrossTextNodes(textNodes, userProtectedTokens);
            }
        }
        if (
            stryMutAct_9fa48("3907")
                ? direction !== "lat-to-cyr"
                : stryMutAct_9fa48("3906")
                  ? false
                  : stryMutAct_9fa48("3905")
                    ? true
                    : (stryCov_9fa48("3905", "3906", "3907"),
                      direction === (stryMutAct_9fa48("3908") ? "" : (stryCov_9fa48("3908"), "lat-to-cyr")))
        ) {
            if (stryMutAct_9fa48("3909")) {
                {
                }
            } else {
                stryCov_9fa48("3909");
                bridges.links = bridgeLinksAcrossTextNodes(textNodes);
                if (
                    stryMutAct_9fa48("3911")
                        ? false
                        : stryMutAct_9fa48("3910")
                          ? true
                          : (stryCov_9fa48("3910", "3911"), protectBrands)
                ) {
                    if (stryMutAct_9fa48("3912")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3912");
                        bridges.brandPhrases = bridgePhrasesAcrossTextNodes(
                            textNodes,
                            ALWAYS_LATIN_PHRASE_INFOS
                        );
                        bridges.brandTokens = bridgeAlwaysLatinTokensAcrossTextNodes(textNodes);
                        bridges.ambiguousBrandSuffix = bridgeAmbiguousBrandSuffixAcrossTextNodes(textNodes);
                    }
                }
                bridges.digraphs = bridgeDigraphsAcrossTextNodes(textNodes);
                if (
                    stryMutAct_9fa48("3914")
                        ? false
                        : stryMutAct_9fa48("3913")
                          ? true
                          : (stryCov_9fa48("3913", "3914"), doProtectRomans)
                ) {
                    if (stryMutAct_9fa48("3915")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3915");
                        const strictMatches = stryMutAct_9fa48("3918")
                            ? fullText.match(ROMAN_REGEX_STRICT) && []
                            : stryMutAct_9fa48("3917")
                              ? false
                              : stryMutAct_9fa48("3916")
                                ? true
                                : (stryCov_9fa48("3916", "3917", "3918"),
                                  fullText.match(ROMAN_REGEX_STRICT) ||
                                      (stryMutAct_9fa48("3919")
                                          ? ["Stryker was here"]
                                          : (stryCov_9fa48("3919"), [])));
                        const uniqueStrict = stryMutAct_9fa48("3920")
                            ? []
                            : (stryCov_9fa48("3920"), [...new Set(strictMatches)]);
                        if (
                            stryMutAct_9fa48("3924")
                                ? uniqueStrict.length <= 0
                                : stryMutAct_9fa48("3923")
                                  ? uniqueStrict.length >= 0
                                  : stryMutAct_9fa48("3922")
                                    ? false
                                    : stryMutAct_9fa48("3921")
                                      ? true
                                      : (stryCov_9fa48("3921", "3922", "3923", "3924"),
                                        uniqueStrict.length > 0)
                        ) {
                            if (stryMutAct_9fa48("3925")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("3925");
                                bridgeExactTokensAcrossTextNodes(textNodes, uniqueStrict);
                            }
                        }
                        const iMatches = stryMutAct_9fa48("3928")
                            ? fullText.match(ROMAN_I_REGEX) && []
                            : stryMutAct_9fa48("3927")
                              ? false
                              : stryMutAct_9fa48("3926")
                                ? true
                                : (stryCov_9fa48("3926", "3927", "3928"),
                                  fullText.match(ROMAN_I_REGEX) ||
                                      (stryMutAct_9fa48("3929")
                                          ? ["Stryker was here"]
                                          : (stryCov_9fa48("3929"), [])));
                        const uniqueIPhrases = stryMutAct_9fa48("3930")
                            ? []
                            : (stryCov_9fa48("3930"), [...new Set(iMatches)]);
                        if (
                            stryMutAct_9fa48("3934")
                                ? uniqueIPhrases.length <= 0
                                : stryMutAct_9fa48("3933")
                                  ? uniqueIPhrases.length >= 0
                                  : stryMutAct_9fa48("3932")
                                    ? false
                                    : stryMutAct_9fa48("3931")
                                      ? true
                                      : (stryCov_9fa48("3931", "3932", "3933", "3934"),
                                        uniqueIPhrases.length > 0)
                        ) {
                            if (stryMutAct_9fa48("3935")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("3935");
                                const iInfos = buildPhraseInfos(uniqueIPhrases);
                                bridgePhrasesAcrossTextNodes(textNodes, iInfos);
                            }
                        }
                    }
                }
            }
        }
        let proofing: import("./stats").ProofingStats = stryMutAct_9fa48("3936")
            ? {}
            : (stryCov_9fa48("3936"),
              {
                  enabled: stryMutAct_9fa48("3937") ? true : (stryCov_9fa48("3937"), false),
                  targetLang: null,
                  changedRuns: 0,
                  skippedRuns: 0,
                  skippedByReason: {},
              });
        let originalRunText: Map<Element, string> | null = null;
        if (
            stryMutAct_9fa48("3939")
                ? false
                : stryMutAct_9fa48("3938")
                  ? true
                  : (stryCov_9fa48("3938", "3939"), shouldSetLang)
        ) {
            if (stryMutAct_9fa48("3940")) {
                {
                }
            } else {
                stryCov_9fa48("3940");
                originalRunText = new Map<Element, string>();
                const seenRuns = new WeakSet<Element>();
                for (const t of textNodes) {
                    if (stryMutAct_9fa48("3941")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3941");
                        const run = findAncestor(
                            t,
                            stryMutAct_9fa48("3942") ? "" : (stryCov_9fa48("3942"), "r")
                        );
                        if (
                            stryMutAct_9fa48("3945")
                                ? false
                                : stryMutAct_9fa48("3944")
                                  ? true
                                  : stryMutAct_9fa48("3943")
                                    ? run
                                    : (stryCov_9fa48("3943", "3944", "3945"), !run)
                        )
                            continue;
                        if (
                            stryMutAct_9fa48("3948")
                                ? false
                                : stryMutAct_9fa48("3947")
                                  ? true
                                  : stryMutAct_9fa48("3946")
                                    ? seenRuns.has(run)
                                    : (stryCov_9fa48("3946", "3947", "3948"), !seenRuns.has(run))
                        )
                            seenRuns.add(run);
                        originalRunText.set(
                            run,
                            stryMutAct_9fa48("3949")
                                ? (originalRunText.get(run) ?? "") - (t.textContent ?? "")
                                : (stryCov_9fa48("3949"),
                                  (stryMutAct_9fa48("3950")
                                      ? originalRunText.get(run) && ""
                                      : (stryCov_9fa48("3950"),
                                        originalRunText.get(run) ??
                                            (stryMutAct_9fa48("3951")
                                                ? "Stryker was here!"
                                                : (stryCov_9fa48("3951"), "")))) +
                                      (stryMutAct_9fa48("3952")
                                          ? t.textContent && ""
                                          : (stryCov_9fa48("3952"),
                                            t.textContent ??
                                                (stryMutAct_9fa48("3953")
                                                    ? "Stryker was here!"
                                                    : (stryCov_9fa48("3953"), "")))))
                        );
                    }
                }
            }
        }
        let hintedNodes: WeakSet<Element> = new WeakSet<Element>();
        if (
            stryMutAct_9fa48("3956")
                ? direction === "cyr-to-lat" && direction === "to-ascii"
                : stryMutAct_9fa48("3955")
                  ? false
                  : stryMutAct_9fa48("3954")
                    ? true
                    : (stryCov_9fa48("3954", "3955", "3956"),
                      (stryMutAct_9fa48("3958")
                          ? direction !== "cyr-to-lat"
                          : stryMutAct_9fa48("3957")
                            ? false
                            : (stryCov_9fa48("3957", "3958"),
                              direction ===
                                  (stryMutAct_9fa48("3959") ? "" : (stryCov_9fa48("3959"), "cyr-to-lat")))) ||
                          (stryMutAct_9fa48("3961")
                              ? direction !== "to-ascii"
                              : stryMutAct_9fa48("3960")
                                ? false
                                : (stryCov_9fa48("3960", "3961"),
                                  direction ===
                                      (stryMutAct_9fa48("3962") ? "" : (stryCov_9fa48("3962"), "to-ascii")))))
        ) {
            if (stryMutAct_9fa48("3963")) {
                {
                }
            } else {
                stryCov_9fa48("3963");
                const res = markCyrAllCapsDigraphHints(textNodes, userProtectedTokenSet);
                hintedNodes = res.hinted;
                bridges.allCapsHints = res.count;
            }
        }
        const wantQuotes = stryMutAct_9fa48("3966")
            ? direction === "lat-to-cyr" || options?.applySerbianQuotes !== false
            : stryMutAct_9fa48("3965")
              ? false
              : stryMutAct_9fa48("3964")
                ? true
                : (stryCov_9fa48("3964", "3965", "3966"),
                  (stryMutAct_9fa48("3968")
                      ? direction !== "lat-to-cyr"
                      : stryMutAct_9fa48("3967")
                        ? true
                        : (stryCov_9fa48("3967", "3968"),
                          direction ===
                              (stryMutAct_9fa48("3969") ? "" : (stryCov_9fa48("3969"), "lat-to-cyr")))) &&
                      (stryMutAct_9fa48("3971")
                          ? options?.applySerbianQuotes === false
                          : stryMutAct_9fa48("3970")
                            ? true
                            : (stryCov_9fa48("3970", "3971"),
                              (stryMutAct_9fa48("3972")
                                  ? options.applySerbianQuotes
                                  : (stryCov_9fa48("3972"), options?.applySerbianQuotes)) !==
                                  (stryMutAct_9fa48("3973") ? true : (stryCov_9fa48("3973"), false)))));
        const codeState = createInitialCodeState();
        const codeParseStats = createInitialCodeParseStats();
        for (const node of textNodes) {
            if (stryMutAct_9fa48("3974")) {
                {
                }
            } else {
                stryCov_9fa48("3974");
                const original = stryMutAct_9fa48("3975")
                    ? node.textContent && ""
                    : (stryCov_9fa48("3975"),
                      node.textContent ??
                          (stryMutAct_9fa48("3976") ? "Stryker was here!" : (stryCov_9fa48("3976"), "")));
                if (
                    stryMutAct_9fa48("3979")
                        ? original !== ""
                        : stryMutAct_9fa48("3978")
                          ? false
                          : stryMutAct_9fa48("3977")
                            ? true
                            : (stryCov_9fa48("3977", "3978", "3979"),
                              original ===
                                  (stryMutAct_9fa48("3980")
                                      ? "Stryker was here!"
                                      : (stryCov_9fa48("3980"), "")))
                )
                    continue;
                let finalText = stryMutAct_9fa48("3981") ? "Stryker was here!" : (stryCov_9fa48("3981"), "");
                const transformFn = (input: string) => {
                    if (stryMutAct_9fa48("3982")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3982");
                        const temp = input;
                        if (
                            stryMutAct_9fa48("3985")
                                ? direction !== "to-ascii"
                                : stryMutAct_9fa48("3984")
                                  ? false
                                  : stryMutAct_9fa48("3983")
                                    ? true
                                    : (stryCov_9fa48("3983", "3984", "3985"),
                                      direction ===
                                          (stryMutAct_9fa48("3986")
                                              ? ""
                                              : (stryCov_9fa48("3986"), "to-ascii")))
                        ) {
                            if (stryMutAct_9fa48("3987")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("3987");
                                const { text: tempLat } = convertPlainText(
                                    temp,
                                    stryMutAct_9fa48("3988") ? "" : (stryCov_9fa48("3988"), "cyr-to-lat"),
                                    stryMutAct_9fa48("3989")
                                        ? {}
                                        : (stryCov_9fa48("3989"),
                                          {
                                              ...options,
                                              applySerbianQuotes: stryMutAct_9fa48("3990")
                                                  ? true
                                                  : (stryCov_9fa48("3990"), false),
                                          })
                                );
                                return toAscii(tempLat);
                            }
                        } else {
                            if (stryMutAct_9fa48("3991")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("3991");
                                const { text } = convertPlainText(
                                    temp,
                                    direction as Direction,
                                    stryMutAct_9fa48("3992")
                                        ? {}
                                        : (stryCov_9fa48("3992"),
                                          {
                                              ...options,
                                              applySerbianQuotes: wantQuotes
                                                  ? stryMutAct_9fa48("3993")
                                                      ? true
                                                      : (stryCov_9fa48("3993"), false)
                                                  : stryMutAct_9fa48("3994")
                                                    ? options.applySerbianQuotes
                                                    : (stryCov_9fa48("3994"), options?.applySerbianQuotes),
                                          })
                                );
                                return text;
                            }
                        }
                    }
                };
                if (
                    stryMutAct_9fa48("3996")
                        ? false
                        : stryMutAct_9fa48("3995")
                          ? true
                          : (stryCov_9fa48("3995", "3996"), preserveCodeBlocks)
                ) {
                    if (stryMutAct_9fa48("3997")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3997");
                        finalText = transformTextRespectingCode(
                            original,
                            codeState,
                            stryMutAct_9fa48("3998")
                                ? () => undefined
                                : (stryCov_9fa48("3998"), (nonCode) => transformFn(nonCode)),
                            stryMutAct_9fa48("3999")
                                ? () => undefined
                                : (stryCov_9fa48("3999"), (code) => code),
                            codeParseStats
                        );
                    }
                } else {
                    if (stryMutAct_9fa48("4000")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4000");
                        finalText = transformFn(original);
                    }
                }
                if (
                    stryMutAct_9fa48("4003")
                        ? direction === "cyr-to-lat" || direction === "to-ascii" || hintedNodes.has(node)
                        : stryMutAct_9fa48("4002")
                          ? false
                          : stryMutAct_9fa48("4001")
                            ? true
                            : (stryCov_9fa48("4001", "4002", "4003"),
                              (stryMutAct_9fa48("4005")
                                  ? direction === "cyr-to-lat" && direction === "to-ascii"
                                  : stryMutAct_9fa48("4004")
                                    ? true
                                    : (stryCov_9fa48("4004", "4005"),
                                      (stryMutAct_9fa48("4007")
                                          ? direction !== "cyr-to-lat"
                                          : stryMutAct_9fa48("4006")
                                            ? false
                                            : (stryCov_9fa48("4006", "4007"),
                                              direction ===
                                                  (stryMutAct_9fa48("4008")
                                                      ? ""
                                                      : (stryCov_9fa48("4008"), "cyr-to-lat")))) ||
                                          (stryMutAct_9fa48("4010")
                                              ? direction !== "to-ascii"
                                              : stryMutAct_9fa48("4009")
                                                ? false
                                                : (stryCov_9fa48("4009", "4010"),
                                                  direction ===
                                                      (stryMutAct_9fa48("4011")
                                                          ? ""
                                                          : (stryCov_9fa48("4011"), "to-ascii")))))) &&
                                  hintedNodes.has(node))
                ) {
                    if (stryMutAct_9fa48("4012")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4012");
                        if (
                            stryMutAct_9fa48("4015")
                                ? finalText.startsWith(LAT_ALLCAPS_HINT)
                                : stryMutAct_9fa48("4014")
                                  ? false
                                  : stryMutAct_9fa48("4013")
                                    ? true
                                    : (stryCov_9fa48("4013", "4014", "4015"),
                                      finalText.endsWith(LAT_ALLCAPS_HINT))
                        ) {
                            if (stryMutAct_9fa48("4016")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("4016");
                                finalText = stryMutAct_9fa48("4017")
                                    ? finalText
                                    : (stryCov_9fa48("4017"),
                                      finalText.slice(
                                          0,
                                          stryMutAct_9fa48("4018")
                                              ? +LAT_ALLCAPS_HINT.length
                                              : (stryCov_9fa48("4018"), -LAT_ALLCAPS_HINT.length)
                                      ));
                            }
                        }
                    }
                }
                if (
                    stryMutAct_9fa48("4020")
                        ? false
                        : stryMutAct_9fa48("4019")
                          ? true
                          : (stryCov_9fa48("4019", "4020"), needsXmlSpacePreserve(finalText))
                ) {
                    if (stryMutAct_9fa48("4021")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4021");
                        node.setAttributeNS(
                            XML_NS,
                            stryMutAct_9fa48("4022") ? "" : (stryCov_9fa48("4022"), "xml:space"),
                            stryMutAct_9fa48("4023") ? "" : (stryCov_9fa48("4023"), "preserve")
                        );
                    }
                }
                node.textContent = finalText;
            }
        }
        if (
            stryMutAct_9fa48("4025")
                ? false
                : stryMutAct_9fa48("4024")
                  ? true
                  : (stryCov_9fa48("4024", "4025"), wantQuotes)
        ) {
            if (stryMutAct_9fa48("4026")) {
                {
                }
            } else {
                stryCov_9fa48("4026");
                applySerbianQuotesAcrossNodes(textNodes, preserveCodeBlocks);
            }
        }
        if (
            stryMutAct_9fa48("4029")
                ? shouldSetLang || originalRunText
                : stryMutAct_9fa48("4028")
                  ? false
                  : stryMutAct_9fa48("4027")
                    ? true
                    : (stryCov_9fa48("4027", "4028", "4029"), shouldSetLang && originalRunText)
        ) {
            if (stryMutAct_9fa48("4030")) {
                {
                }
            } else {
                stryCov_9fa48("4030");
                const r = applyProofingLanguagePreserveUnchanged(doc, textNodes, originalRunText, direction);
                proofing = stryMutAct_9fa48("4031")
                    ? {}
                    : (stryCov_9fa48("4031"),
                      {
                          enabled: stryMutAct_9fa48("4032") ? false : (stryCov_9fa48("4032"), true),
                          targetLang: targetLangForDirection(direction),
                          ...r,
                      });
            }
        }
        let charsAfter = 0;
        for (const node of textNodes) {
            if (stryMutAct_9fa48("4033")) {
                {
                }
            } else {
                stryCov_9fa48("4033");
                stryMutAct_9fa48("4034")
                    ? (charsAfter -= (node.textContent ?? "").length)
                    : (stryCov_9fa48("4034"),
                      (charsAfter += (
                          stryMutAct_9fa48("4035")
                              ? node.textContent && ""
                              : (stryCov_9fa48("4035"),
                                node.textContent ??
                                    (stryMutAct_9fa48("4036")
                                        ? "Stryker was here!"
                                        : (stryCov_9fa48("4036"), "")))
                      ).length));
            }
        }
        let xml = new XMLSerializer().serializeToString(doc);
        xml = xml.replace(
            / xmlns=""/g,
            stryMutAct_9fa48("4037") ? "Stryker was here!" : (stryCov_9fa48("4037"), "")
        );
        const t1 = (
            stryMutAct_9fa48("4040")
                ? typeof performance !== "undefined" || performance.now
                : stryMutAct_9fa48("4039")
                  ? false
                  : stryMutAct_9fa48("4038")
                    ? true
                    : (stryCov_9fa48("4038", "4039", "4040"),
                      (stryMutAct_9fa48("4042")
                          ? typeof performance === "undefined"
                          : stryMutAct_9fa48("4041")
                            ? true
                            : (stryCov_9fa48("4041", "4042"),
                              typeof performance !==
                                  (stryMutAct_9fa48("4043") ? "" : (stryCov_9fa48("4043"), "undefined")))) &&
                          performance.now)
        )
            ? performance.now()
            : Date.now();
        const duration = stryMutAct_9fa48("4044")
            ? Math.min(0, t1 - t0)
            : (stryCov_9fa48("4044"),
              Math.max(0, stryMutAct_9fa48("4045") ? t1 + t0 : (stryCov_9fa48("4045"), t1 - t0)));
        if (
            stryMutAct_9fa48("4048")
                ? typeof perfMonitor === "undefined"
                : stryMutAct_9fa48("4047")
                  ? false
                  : stryMutAct_9fa48("4046")
                    ? true
                    : (stryCov_9fa48("4046", "4047", "4048"),
                      typeof perfMonitor !==
                          (stryMutAct_9fa48("4049") ? "" : (stryCov_9fa48("4049"), "undefined")))
        ) {
            if (stryMutAct_9fa48("4050")) {
                {
                }
            } else {
                stryCov_9fa48("4050");
                perfMonitor.record(
                    stryMutAct_9fa48("4051") ? "" : (stryCov_9fa48("4051"), "convertOoxml"),
                    textNodes.length,
                    duration,
                    stryMutAct_9fa48("4052")
                        ? {}
                        : (stryCov_9fa48("4052"),
                          {
                              sizeKb: ooxmlSizeKb,
                              direction: direction,
                              bridges: Object.values(bridges).reduce(
                                  stryMutAct_9fa48("4053")
                                      ? () => undefined
                                      : (stryCov_9fa48("4053"),
                                        (a, b) =>
                                            stryMutAct_9fa48("4054")
                                                ? a - b
                                                : (stryCov_9fa48("4054"), a + b)),
                                  0
                              ),
                          })
                );
            }
        }
        const stats: ConvertStats = stryMutAct_9fa48("4055")
            ? {}
            : (stryCov_9fa48("4055"),
              {
                  direction: direction as ConvertStats["direction"],
                  textNodes: textNodes.length,
                  charsBefore: fullText.length,
                  charsAfter,
                  detected: stryMutAct_9fa48("4056")
                      ? {}
                      : (stryCov_9fa48("4056"),
                        {
                            urls: detectedUrls,
                            emails: detectedEmails,
                        }),
                  code: stryMutAct_9fa48("4057")
                      ? {}
                      : (stryCov_9fa48("4057"),
                        {
                            fenceMarkersSeen: codeParseStats.fenceMarkersSeen,
                            inlineTicksSeen: codeParseStats.inlineTicksSeen,
                            endedInFence: codeState.inFence,
                            endedInInline: codeState.inInline,
                        }),
                  bridges,
                  proofing,
                  timingMs: duration,
              });
        return stryMutAct_9fa48("4058")
            ? {}
            : (stryCov_9fa48("4058"),
              {
                  xml,
                  type: label,
                  stats,
              });
    }
}
