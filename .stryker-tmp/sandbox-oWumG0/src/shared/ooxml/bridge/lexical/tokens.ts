// @ts-nocheck
// src/shared/ooxml/bridge/lexical/tokens.ts
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
import { ALWAYS_LATIN_TOKENS_BRIDGE } from "../../../../core/rules";
import { findNextNodeWithText, trailingTokenFragment, isTokenChar, normKey } from "../../common";
type TokenLowerCps = {
    s: string;
    cps: string[];
    len: number;
};
const TOKENS_CACHE_MAX = 120;
const tokensCache = new Map<string, TokenLowerCps[]>();
function tokensCacheKey(tokensSource: Set<string> | string[], caseSensitive: boolean): string {
    if (stryMutAct_9fa48("3005")) {
        {
        }
    } else {
        stryCov_9fa48("3005");
        const arr = Array.isArray(tokensSource) ? tokensSource : Array.from(tokensSource);
        const norm = stryMutAct_9fa48("3006")
            ? arr.map((s) => (s ?? "").normalize("NFC")).map((s) => (caseSensitive ? s : normKey(s)))
            : (stryCov_9fa48("3006"),
              arr
                  .map(
                      stryMutAct_9fa48("3007")
                          ? () => undefined
                          : (stryCov_9fa48("3007"),
                            (s) =>
                                (stryMutAct_9fa48("3008")
                                    ? s && ""
                                    : (stryCov_9fa48("3008"),
                                      s ??
                                          (stryMutAct_9fa48("3009")
                                              ? "Stryker was here!"
                                              : (stryCov_9fa48("3009"), "")))
                                ).normalize(stryMutAct_9fa48("3010") ? "" : (stryCov_9fa48("3010"), "NFC")))
                  )
                  .filter(
                      stryMutAct_9fa48("3011")
                          ? () => undefined
                          : (stryCov_9fa48("3011"),
                            (s) =>
                                stryMutAct_9fa48("3015")
                                    ? s.length <= 0
                                    : stryMutAct_9fa48("3014")
                                      ? s.length >= 0
                                      : stryMutAct_9fa48("3013")
                                        ? false
                                        : stryMutAct_9fa48("3012")
                                          ? true
                                          : (stryCov_9fa48("3012", "3013", "3014", "3015"), s.length > 0))
                  )
                  .map(
                      stryMutAct_9fa48("3016")
                          ? () => undefined
                          : (stryCov_9fa48("3016"), (s) => (caseSensitive ? s : normKey(s)))
                  ));
        const uniqSorted = stryMutAct_9fa48("3017")
            ? Array.from(new Set(norm))
            : (stryCov_9fa48("3017"), Array.from(new Set(norm)).sort());
        return stryMutAct_9fa48("3018")
            ? (caseSensitive ? "CS:" : "CI:") - JSON.stringify(uniqSorted)
            : (stryCov_9fa48("3018"),
              (caseSensitive
                  ? stryMutAct_9fa48("3019")
                      ? ""
                      : (stryCov_9fa48("3019"), "CS:")
                  : stryMutAct_9fa48("3020")
                    ? ""
                    : (stryCov_9fa48("3020"), "CI:")) + JSON.stringify(uniqSorted));
    }
}
function getCachedTokenList(tokensSource: Set<string> | string[], caseSensitive: boolean): TokenLowerCps[] {
    if (stryMutAct_9fa48("3021")) {
        {
        }
    } else {
        stryCov_9fa48("3021");
        const key = tokensCacheKey(tokensSource, caseSensitive);
        const hit = tokensCache.get(key);
        if (
            stryMutAct_9fa48("3023")
                ? false
                : stryMutAct_9fa48("3022")
                  ? true
                  : (stryCov_9fa48("3022", "3023"), hit)
        )
            return hit;
        const tokens: TokenLowerCps[] = stryMutAct_9fa48("3025")
            ? (Array.isArray(tokensSource) ? tokensSource : Array.from(tokensSource))
                  .map((s) => s.normalize("NFC"))
                  .map((token) => {
                      const normalized = caseSensitive ? token : normKey(token);
                      const cps = Array.from(normalized);
                      return {
                          s: normalized,
                          cps,
                          len: cps.length,
                      };
                  })
                  .sort((a, b) => b.len - a.len)
            : stryMutAct_9fa48("3024")
              ? (Array.isArray(tokensSource) ? tokensSource : Array.from(tokensSource))
                    .map((s) => s.normalize("NFC"))
                    .filter((s) => s.length > 0)
                    .map((token) => {
                        const normalized = caseSensitive ? token : normKey(token);
                        const cps = Array.from(normalized);
                        return {
                            s: normalized,
                            cps,
                            len: cps.length,
                        };
                    })
              : (stryCov_9fa48("3024", "3025"),
                (Array.isArray(tokensSource) ? tokensSource : Array.from(tokensSource))
                    .map(
                        stryMutAct_9fa48("3026")
                            ? () => undefined
                            : (stryCov_9fa48("3026"),
                              (s) =>
                                  s.normalize(stryMutAct_9fa48("3027") ? "" : (stryCov_9fa48("3027"), "NFC")))
                    )
                    .filter(
                        stryMutAct_9fa48("3028")
                            ? () => undefined
                            : (stryCov_9fa48("3028"),
                              (s) =>
                                  stryMutAct_9fa48("3032")
                                      ? s.length <= 0
                                      : stryMutAct_9fa48("3031")
                                        ? s.length >= 0
                                        : stryMutAct_9fa48("3030")
                                          ? false
                                          : stryMutAct_9fa48("3029")
                                            ? true
                                            : (stryCov_9fa48("3029", "3030", "3031", "3032"), s.length > 0))
                    )
                    .map((token) => {
                        if (stryMutAct_9fa48("3033")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("3033");
                            const normalized = caseSensitive ? token : normKey(token);
                            const cps = Array.from(normalized);
                            return stryMutAct_9fa48("3034")
                                ? {}
                                : (stryCov_9fa48("3034"),
                                  {
                                      s: normalized,
                                      cps,
                                      len: cps.length,
                                  });
                        }
                    })
                    .sort(
                        stryMutAct_9fa48("3035")
                            ? () => undefined
                            : (stryCov_9fa48("3035"),
                              (a, b) =>
                                  stryMutAct_9fa48("3036")
                                      ? b.len + a.len
                                      : (stryCov_9fa48("3036"), b.len - a.len))
                    ));
        tokensCache.set(key, tokens);
        if (
            stryMutAct_9fa48("3040")
                ? tokensCache.size <= TOKENS_CACHE_MAX
                : stryMutAct_9fa48("3039")
                  ? tokensCache.size >= TOKENS_CACHE_MAX
                  : stryMutAct_9fa48("3038")
                    ? false
                    : stryMutAct_9fa48("3037")
                      ? true
                      : (stryCov_9fa48("3037", "3038", "3039", "3040"), tokensCache.size > TOKENS_CACHE_MAX)
        ) {
            if (stryMutAct_9fa48("3041")) {
                {
                }
            } else {
                stryCov_9fa48("3041");
                const firstKey = tokensCache.keys().next().value as string | undefined;
                if (
                    stryMutAct_9fa48("3043")
                        ? false
                        : stryMutAct_9fa48("3042")
                          ? true
                          : (stryCov_9fa48("3042", "3043"), firstKey)
                )
                    tokensCache.delete(firstKey);
            }
        }
        return tokens;
    }
}

/**
 * Generički bridging funkcija za tokene (case-sensitive ili insensitive).
 */
function bridgeTokensAcrossTextNodes(
    textNodes: Element[],
    tokensSource: Set<string> | string[],
    caseSensitive = stryMutAct_9fa48("3044") ? true : (stryCov_9fa48("3044"), false)
): number {
    if (stryMutAct_9fa48("3045")) {
        {
        }
    } else {
        stryCov_9fa48("3045");
        const tokens = getCachedTokenList(tokensSource, caseSensitive);
        if (
            stryMutAct_9fa48("3048")
                ? tokens.length !== 0
                : stryMutAct_9fa48("3047")
                  ? false
                  : stryMutAct_9fa48("3046")
                    ? true
                    : (stryCov_9fa48("3046", "3047", "3048"), tokens.length === 0)
        )
            return 0;
        let changed = 0;
        for (
            let i = 0;
            stryMutAct_9fa48("3051")
                ? i >= textNodes.length - 1
                : stryMutAct_9fa48("3050")
                  ? i <= textNodes.length - 1
                  : stryMutAct_9fa48("3049")
                    ? false
                    : (stryCov_9fa48("3049", "3050", "3051"),
                      i <
                          (stryMutAct_9fa48("3052")
                              ? textNodes.length + 1
                              : (stryCov_9fa48("3052"), textNodes.length - 1)));
            stryMutAct_9fa48("3053") ? i-- : (stryCov_9fa48("3053"), i++)
        ) {
            if (stryMutAct_9fa48("3054")) {
                {
                }
            } else {
                stryCov_9fa48("3054");
                const aNode = textNodes[i];
                if (
                    stryMutAct_9fa48("3057")
                        ? false
                        : stryMutAct_9fa48("3056")
                          ? true
                          : stryMutAct_9fa48("3055")
                            ? aNode
                            : (stryCov_9fa48("3055", "3056", "3057"), !aNode)
                )
                    continue;
                const aRaw = (
                    stryMutAct_9fa48("3058")
                        ? aNode.textContent && ""
                        : (stryCov_9fa48("3058"),
                          aNode.textContent ??
                              (stryMutAct_9fa48("3059") ? "Stryker was here!" : (stryCov_9fa48("3059"), "")))
                ).normalize(stryMutAct_9fa48("3060") ? "" : (stryCov_9fa48("3060"), "NFC"));
                if (
                    stryMutAct_9fa48("3063")
                        ? !aRaw && aRaw.trimEnd() !== aRaw
                        : stryMutAct_9fa48("3062")
                          ? false
                          : stryMutAct_9fa48("3061")
                            ? true
                            : (stryCov_9fa48("3061", "3062", "3063"),
                              (stryMutAct_9fa48("3064") ? aRaw : (stryCov_9fa48("3064"), !aRaw)) ||
                                  (stryMutAct_9fa48("3066")
                                      ? aRaw.trimEnd() === aRaw
                                      : stryMutAct_9fa48("3065")
                                        ? false
                                        : (stryCov_9fa48("3065", "3066"),
                                          (stryMutAct_9fa48("3067")
                                              ? aRaw.trimStart()
                                              : (stryCov_9fa48("3067"), aRaw.trimEnd())) !== aRaw)))
                )
                    continue;
                const fragInfo = trailingTokenFragment(aRaw);
                if (
                    stryMutAct_9fa48("3070")
                        ? false
                        : stryMutAct_9fa48("3069")
                          ? true
                          : stryMutAct_9fa48("3068")
                            ? fragInfo
                            : (stryCov_9fa48("3068", "3069", "3070"), !fragInfo)
                )
                    continue;
                const { frag, startCpIndex } = fragInfo;
                const aCps = Array.from(aRaw);
                const prevChar = (
                    stryMutAct_9fa48("3074")
                        ? startCpIndex <= 0
                        : stryMutAct_9fa48("3073")
                          ? startCpIndex >= 0
                          : stryMutAct_9fa48("3072")
                            ? false
                            : stryMutAct_9fa48("3071")
                              ? true
                              : (stryCov_9fa48("3071", "3072", "3073", "3074"), startCpIndex > 0)
                )
                    ? stryMutAct_9fa48("3075")
                        ? aCps[startCpIndex - 1] && ""
                        : (stryCov_9fa48("3075"),
                          aCps[
                              stryMutAct_9fa48("3076")
                                  ? startCpIndex + 1
                                  : (stryCov_9fa48("3076"), startCpIndex - 1)
                          ] ?? (stryMutAct_9fa48("3077") ? "Stryker was here!" : (stryCov_9fa48("3077"), "")))
                    : stryMutAct_9fa48("3078")
                      ? "Stryker was here!"
                      : (stryCov_9fa48("3078"), "");
                if (
                    stryMutAct_9fa48("3081")
                        ? prevChar || isTokenChar(prevChar)
                        : stryMutAct_9fa48("3080")
                          ? false
                          : stryMutAct_9fa48("3079")
                            ? true
                            : (stryCov_9fa48("3079", "3080", "3081"), prevChar && isTokenChar(prevChar))
                )
                    continue;
                const fragKey = caseSensitive ? frag : normKey(frag);
                if (
                    stryMutAct_9fa48("3084")
                        ? false
                        : stryMutAct_9fa48("3083")
                          ? true
                          : stryMutAct_9fa48("3082")
                            ? fragKey
                            : (stryCov_9fa48("3082", "3083", "3084"), !fragKey)
                )
                    continue;
                const fragCps = Array.from(fragKey);
                const candidates = stryMutAct_9fa48("3085")
                    ? tokens
                    : (stryCov_9fa48("3085"),
                      tokens.filter(
                          stryMutAct_9fa48("3086")
                              ? () => undefined
                              : (stryCov_9fa48("3086"),
                                (t) =>
                                    stryMutAct_9fa48("3089")
                                        ? t.len > fragCps.length ||
                                          t.cps.slice(0, fragCps.length).join("") === fragKey
                                        : stryMutAct_9fa48("3088")
                                          ? false
                                          : stryMutAct_9fa48("3087")
                                            ? true
                                            : (stryCov_9fa48("3087", "3088", "3089"),
                                              (stryMutAct_9fa48("3092")
                                                  ? t.len <= fragCps.length
                                                  : stryMutAct_9fa48("3091")
                                                    ? t.len >= fragCps.length
                                                    : stryMutAct_9fa48("3090")
                                                      ? true
                                                      : (stryCov_9fa48("3090", "3091", "3092"),
                                                        t.len > fragCps.length)) &&
                                                  (stryMutAct_9fa48("3094")
                                                      ? t.cps.slice(0, fragCps.length).join("") !== fragKey
                                                      : stryMutAct_9fa48("3093")
                                                        ? true
                                                        : (stryCov_9fa48("3093", "3094"),
                                                          (stryMutAct_9fa48("3095")
                                                              ? t.cps.join("")
                                                              : (stryCov_9fa48("3095"),
                                                                t.cps
                                                                    .slice(0, fragCps.length)
                                                                    .join(
                                                                        stryMutAct_9fa48("3096")
                                                                            ? "Stryker was here!"
                                                                            : (stryCov_9fa48("3096"), "")
                                                                    ))) === fragKey))))
                      ));
                if (
                    stryMutAct_9fa48("3099")
                        ? candidates.length !== 0
                        : stryMutAct_9fa48("3098")
                          ? false
                          : stryMutAct_9fa48("3097")
                            ? true
                            : (stryCov_9fa48("3097", "3098", "3099"), candidates.length === 0)
                )
                    continue;
                const j0 = findNextNodeWithText(
                    textNodes,
                    stryMutAct_9fa48("3100") ? i - 1 : (stryCov_9fa48("3100"), i + 1)
                );
                if (
                    stryMutAct_9fa48("3103")
                        ? j0 != null
                        : stryMutAct_9fa48("3102")
                          ? false
                          : stryMutAct_9fa48("3101")
                            ? true
                            : (stryCov_9fa48("3101", "3102", "3103"), j0 == null)
                )
                    continue;
                for (const cand of candidates) {
                    if (stryMutAct_9fa48("3104")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("3104");
                        const rem = stryMutAct_9fa48("3105")
                            ? cand.cps
                            : (stryCov_9fa48("3105"), cand.cps.slice(fragCps.length));
                        let remainingIdx = 0;
                        const consumePlan: Array<{
                            nodeIndex: number;
                            takeCount: number;
                        }> = stryMutAct_9fa48("3106") ? ["Stryker was here"] : (stryCov_9fa48("3106"), []);
                        let j: number | null = j0;
                        while (
                            stryMutAct_9fa48("3109")
                                ? remainingIdx >= rem.length
                                : stryMutAct_9fa48("3108")
                                  ? remainingIdx <= rem.length
                                  : stryMutAct_9fa48("3107")
                                    ? false
                                    : (stryCov_9fa48("3107", "3108", "3109"), remainingIdx < rem.length)
                        ) {
                            if (stryMutAct_9fa48("3110")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("3110");
                                if (
                                    stryMutAct_9fa48("3113")
                                        ? j != null
                                        : stryMutAct_9fa48("3112")
                                          ? false
                                          : stryMutAct_9fa48("3111")
                                            ? true
                                            : (stryCov_9fa48("3111", "3112", "3113"), j == null)
                                )
                                    break;
                                const bNode = textNodes[j];
                                if (
                                    stryMutAct_9fa48("3116")
                                        ? false
                                        : stryMutAct_9fa48("3115")
                                          ? true
                                          : stryMutAct_9fa48("3114")
                                            ? bNode
                                            : (stryCov_9fa48("3114", "3115", "3116"), !bNode)
                                )
                                    break;
                                const bRaw = (
                                    stryMutAct_9fa48("3117")
                                        ? bNode.textContent && ""
                                        : (stryCov_9fa48("3117"),
                                          bNode.textContent ??
                                              (stryMutAct_9fa48("3118")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("3118"), "")))
                                ).normalize(stryMutAct_9fa48("3119") ? "" : (stryCov_9fa48("3119"), "NFC"));
                                if (
                                    stryMutAct_9fa48("3122")
                                        ? false
                                        : stryMutAct_9fa48("3121")
                                          ? true
                                          : stryMutAct_9fa48("3120")
                                            ? bRaw
                                            : (stryCov_9fa48("3120", "3121", "3122"), !bRaw)
                                ) {
                                    if (stryMutAct_9fa48("3123")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("3123");
                                        j = findNextNodeWithText(
                                            textNodes,
                                            stryMutAct_9fa48("3124") ? j - 1 : (stryCov_9fa48("3124"), j + 1)
                                        );
                                        continue;
                                    }
                                }
                                if (
                                    stryMutAct_9fa48("3127")
                                        ? bRaw.trimStart() === bRaw
                                        : stryMutAct_9fa48("3126")
                                          ? false
                                          : stryMutAct_9fa48("3125")
                                            ? true
                                            : (stryCov_9fa48("3125", "3126", "3127"),
                                              (stryMutAct_9fa48("3128")
                                                  ? bRaw.trimEnd()
                                                  : (stryCov_9fa48("3128"), bRaw.trimStart())) !== bRaw)
                                ) {
                                    if (stryMutAct_9fa48("3129")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("3129");
                                        remainingIdx = stryMutAct_9fa48("3130")
                                            ? +1
                                            : (stryCov_9fa48("3130"), -1);
                                        break;
                                    }
                                }
                                const bCps = Array.from(bRaw);
                                let take = 0;
                                while (
                                    stryMutAct_9fa48("3132")
                                        ? take < bCps.length || remainingIdx < rem.length
                                        : stryMutAct_9fa48("3131")
                                          ? false
                                          : (stryCov_9fa48("3131", "3132"),
                                            (stryMutAct_9fa48("3135")
                                                ? take >= bCps.length
                                                : stryMutAct_9fa48("3134")
                                                  ? take <= bCps.length
                                                  : stryMutAct_9fa48("3133")
                                                    ? true
                                                    : (stryCov_9fa48("3133", "3134", "3135"),
                                                      take < bCps.length)) &&
                                                (stryMutAct_9fa48("3138")
                                                    ? remainingIdx >= rem.length
                                                    : stryMutAct_9fa48("3137")
                                                      ? remainingIdx <= rem.length
                                                      : stryMutAct_9fa48("3136")
                                                        ? true
                                                        : (stryCov_9fa48("3136", "3137", "3138"),
                                                          remainingIdx < rem.length)))
                                ) {
                                    if (stryMutAct_9fa48("3139")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("3139");
                                        const ch = bCps[take];
                                        if (
                                            stryMutAct_9fa48("3142")
                                                ? false
                                                : stryMutAct_9fa48("3141")
                                                  ? true
                                                  : stryMutAct_9fa48("3140")
                                                    ? ch
                                                    : (stryCov_9fa48("3140", "3141", "3142"), !ch)
                                        )
                                            break;
                                        if (
                                            stryMutAct_9fa48("3145")
                                                ? false
                                                : stryMutAct_9fa48("3144")
                                                  ? true
                                                  : stryMutAct_9fa48("3143")
                                                    ? isTokenChar(ch)
                                                    : (stryCov_9fa48("3143", "3144", "3145"),
                                                      !isTokenChar(ch))
                                        )
                                            break;
                                        const chKey = caseSensitive ? ch : normKey(ch);
                                        if (
                                            stryMutAct_9fa48("3148")
                                                ? chKey === rem[remainingIdx]
                                                : stryMutAct_9fa48("3147")
                                                  ? false
                                                  : stryMutAct_9fa48("3146")
                                                    ? true
                                                    : (stryCov_9fa48("3146", "3147", "3148"),
                                                      chKey !== rem[remainingIdx])
                                        )
                                            break;
                                        stryMutAct_9fa48("3149") ? take-- : (stryCov_9fa48("3149"), take++);
                                        stryMutAct_9fa48("3150")
                                            ? remainingIdx--
                                            : (stryCov_9fa48("3150"), remainingIdx++);
                                    }
                                }
                                if (
                                    stryMutAct_9fa48("3153")
                                        ? take !== 0
                                        : stryMutAct_9fa48("3152")
                                          ? false
                                          : stryMutAct_9fa48("3151")
                                            ? true
                                            : (stryCov_9fa48("3151", "3152", "3153"), take === 0)
                                ) {
                                    if (stryMutAct_9fa48("3154")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("3154");
                                        remainingIdx = stryMutAct_9fa48("3155")
                                            ? +1
                                            : (stryCov_9fa48("3155"), -1);
                                        break;
                                    }
                                }
                                consumePlan.push(
                                    stryMutAct_9fa48("3156")
                                        ? {}
                                        : (stryCov_9fa48("3156"),
                                          {
                                              nodeIndex: j,
                                              takeCount: take,
                                          })
                                );
                                if (
                                    stryMutAct_9fa48("3160")
                                        ? remainingIdx < rem.length
                                        : stryMutAct_9fa48("3159")
                                          ? remainingIdx > rem.length
                                          : stryMutAct_9fa48("3158")
                                            ? false
                                            : stryMutAct_9fa48("3157")
                                              ? true
                                              : (stryCov_9fa48("3157", "3158", "3159", "3160"),
                                                remainingIdx >= rem.length)
                                ) {
                                    if (stryMutAct_9fa48("3161")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("3161");
                                        const nextChar = stryMutAct_9fa48("3162")
                                            ? bCps[take] && ""
                                            : (stryCov_9fa48("3162"),
                                              bCps[take] ??
                                                  (stryMutAct_9fa48("3163")
                                                      ? "Stryker was here!"
                                                      : (stryCov_9fa48("3163"), "")));
                                        if (
                                            stryMutAct_9fa48("3166")
                                                ? nextChar || isTokenChar(nextChar)
                                                : stryMutAct_9fa48("3165")
                                                  ? false
                                                  : stryMutAct_9fa48("3164")
                                                    ? true
                                                    : (stryCov_9fa48("3164", "3165", "3166"),
                                                      nextChar && isTokenChar(nextChar))
                                        ) {
                                            if (stryMutAct_9fa48("3167")) {
                                                {
                                                }
                                            } else {
                                                stryCov_9fa48("3167");
                                                remainingIdx = stryMutAct_9fa48("3168")
                                                    ? +1
                                                    : (stryCov_9fa48("3168"), -1);
                                            }
                                        }
                                        break;
                                    }
                                }
                                j = findNextNodeWithText(
                                    textNodes,
                                    stryMutAct_9fa48("3169") ? j - 1 : (stryCov_9fa48("3169"), j + 1)
                                );
                            }
                        }
                        if (
                            stryMutAct_9fa48("3172")
                                ? remainingIdx === rem.length
                                : stryMutAct_9fa48("3171")
                                  ? false
                                  : stryMutAct_9fa48("3170")
                                    ? true
                                    : (stryCov_9fa48("3170", "3171", "3172"), remainingIdx !== rem.length)
                        )
                            continue;
                        let moved = stryMutAct_9fa48("3173")
                            ? "Stryker was here!"
                            : (stryCov_9fa48("3173"), "");
                        for (const step of consumePlan) {
                            if (stryMutAct_9fa48("3174")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("3174");
                                const bNode = textNodes[step.nodeIndex];
                                if (
                                    stryMutAct_9fa48("3177")
                                        ? false
                                        : stryMutAct_9fa48("3176")
                                          ? true
                                          : stryMutAct_9fa48("3175")
                                            ? bNode
                                            : (stryCov_9fa48("3175", "3176", "3177"), !bNode)
                                )
                                    continue;
                                const bRaw = (
                                    stryMutAct_9fa48("3178")
                                        ? bNode.textContent && ""
                                        : (stryCov_9fa48("3178"),
                                          bNode.textContent ??
                                              (stryMutAct_9fa48("3179")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("3179"), "")))
                                ).normalize(stryMutAct_9fa48("3180") ? "" : (stryCov_9fa48("3180"), "NFC"));
                                const bCps = Array.from(bRaw);
                                stryMutAct_9fa48("3181")
                                    ? (moved -= bCps.slice(0, step.takeCount).join(""))
                                    : (stryCov_9fa48("3181"),
                                      (moved += stryMutAct_9fa48("3182")
                                          ? bCps.join("")
                                          : (stryCov_9fa48("3182"),
                                            bCps
                                                .slice(0, step.takeCount)
                                                .join(
                                                    stryMutAct_9fa48("3183")
                                                        ? "Stryker was here!"
                                                        : (stryCov_9fa48("3183"), "")
                                                ))));
                            }
                        }
                        aNode.textContent = stryMutAct_9fa48("3184")
                            ? aRaw - moved
                            : (stryCov_9fa48("3184"), aRaw + moved);
                        for (const step of consumePlan) {
                            if (stryMutAct_9fa48("3185")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("3185");
                                const bNode = textNodes[step.nodeIndex];
                                if (
                                    stryMutAct_9fa48("3188")
                                        ? false
                                        : stryMutAct_9fa48("3187")
                                          ? true
                                          : stryMutAct_9fa48("3186")
                                            ? bNode
                                            : (stryCov_9fa48("3186", "3187", "3188"), !bNode)
                                )
                                    continue;
                                const bRaw = (
                                    stryMutAct_9fa48("3189")
                                        ? bNode.textContent && ""
                                        : (stryCov_9fa48("3189"),
                                          bNode.textContent ??
                                              (stryMutAct_9fa48("3190")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("3190"), "")))
                                ).normalize(stryMutAct_9fa48("3191") ? "" : (stryCov_9fa48("3191"), "NFC"));
                                const bCps = Array.from(bRaw);
                                bNode.textContent = stryMutAct_9fa48("3192")
                                    ? bCps.join("")
                                    : (stryCov_9fa48("3192"),
                                      bCps
                                          .slice(step.takeCount)
                                          .join(
                                              stryMutAct_9fa48("3193")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("3193"), "")
                                          ));
                            }
                        }
                        stryMutAct_9fa48("3194") ? changed-- : (stryCov_9fa48("3194"), changed++);
                        break;
                    }
                }
            }
        }
        return changed;
    }
}

/**
 * Bridge ALWAYS_LATIN tokens (case-insensitive).
 * NOTE: uključuje i "ambiguous" tokene (Pro/Max/...) da se ne desi parcijalna transliteracija kad su splitovani.
 */
export function bridgeAlwaysLatinTokensAcrossTextNodes(textNodes: Element[]): number {
    if (stryMutAct_9fa48("3195")) {
        {
        }
    } else {
        stryCov_9fa48("3195");
        return bridgeTokensAcrossTextNodes(
            textNodes,
            ALWAYS_LATIN_TOKENS_BRIDGE,
            stryMutAct_9fa48("3196") ? true : (stryCov_9fa48("3196"), false)
        );
    }
}

/**
 * Bridge exact user-provided tokens (case-sensitive).
 */
export function bridgeExactTokensAcrossTextNodes(textNodes: Element[], tokens: string[]): number {
    if (stryMutAct_9fa48("3197")) {
        {
        }
    } else {
        stryCov_9fa48("3197");
        return bridgeTokensAcrossTextNodes(
            textNodes,
            tokens,
            stryMutAct_9fa48("3198") ? false : (stryCov_9fa48("3198"), true)
        );
    }
}
