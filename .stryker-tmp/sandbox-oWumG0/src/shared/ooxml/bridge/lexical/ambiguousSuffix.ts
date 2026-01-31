// @ts-nocheck
// src/shared/ooxml/bridge/lexical/ambiguousSuffix.ts
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
import { findNextNodeWithText, trailingTokenFragment, isTokenChar, normKey, getCpArray } from "../../common";
import { ALWAYS_LATIN_TOKENS_STRICT, ALWAYS_LATIN_TOKENS_AMBIGUOUS } from "../../../../core/rules";
function isPureNumberToken(s: string): boolean {
    if (stryMutAct_9fa48("2316")) {
        {
        }
    } else {
        stryCov_9fa48("2316");
        return (
            stryMutAct_9fa48("2320")
                ? /^\D+$/u
                : stryMutAct_9fa48("2319")
                  ? /^\d$/u
                  : stryMutAct_9fa48("2318")
                    ? /^\d+/u
                    : stryMutAct_9fa48("2317")
                      ? /\d+$/u
                      : (stryCov_9fa48("2317", "2318", "2319", "2320"), /^\d+$/u)
        ).test(s);
    }
}
function isAlphaNumModelToken(s: string): boolean {
    if (stryMutAct_9fa48("2321")) {
        {
        }
    } else {
        stryCov_9fa48("2321");
        return stryMutAct_9fa48("2324")
            ? /\d/.test(s) || /\p{L}/u.test(s)
            : stryMutAct_9fa48("2323")
              ? false
              : stryMutAct_9fa48("2322")
                ? true
                : (stryCov_9fa48("2322", "2323", "2324"),
                  (stryMutAct_9fa48("2325") ? /\D/ : (stryCov_9fa48("2325"), /\d/)).test(s) &&
                      (stryMutAct_9fa48("2326") ? /\P{L}/u : (stryCov_9fa48("2326"), /\p{L}/u)).test(s));
    }
}
type PrefixTake = {
    moved: string;
    remaining: string;
    tokens: string[];
};
function takeLeadingWsAndTokenSequence(raw: string, maxTokens: number): PrefixTake | null {
    if (stryMutAct_9fa48("2327")) {
        {
        }
    } else {
        stryCov_9fa48("2327");
        const cps = getCpArray(raw);
        let i = 0;
        while (
            stryMutAct_9fa48("2329")
                ? i < cps.length || /\s/u.test(cps[i] ?? "")
                : stryMutAct_9fa48("2328")
                  ? false
                  : (stryCov_9fa48("2328", "2329"),
                    (stryMutAct_9fa48("2332")
                        ? i >= cps.length
                        : stryMutAct_9fa48("2331")
                          ? i <= cps.length
                          : stryMutAct_9fa48("2330")
                            ? true
                            : (stryCov_9fa48("2330", "2331", "2332"), i < cps.length)) &&
                        (stryMutAct_9fa48("2333") ? /\S/u : (stryCov_9fa48("2333"), /\s/u)).test(
                            stryMutAct_9fa48("2334")
                                ? cps[i] && ""
                                : (stryCov_9fa48("2334"),
                                  cps[i] ??
                                      (stryMutAct_9fa48("2335")
                                          ? "Stryker was here!"
                                          : (stryCov_9fa48("2335"), "")))
                        ))
        )
            stryMutAct_9fa48("2336") ? i-- : (stryCov_9fa48("2336"), i++);
        if (
            stryMutAct_9fa48("2339")
                ? i !== 0
                : stryMutAct_9fa48("2338")
                  ? false
                  : stryMutAct_9fa48("2337")
                    ? true
                    : (stryCov_9fa48("2337", "2338", "2339"), i === 0)
        )
            return null;
        const tokens: string[] = stryMutAct_9fa48("2340")
            ? ["Stryker was here"]
            : (stryCov_9fa48("2340"), []);
        let cur = i;
        let movedEnd = 0;
        for (
            let t = 0;
            stryMutAct_9fa48("2343")
                ? t >= maxTokens
                : stryMutAct_9fa48("2342")
                  ? t <= maxTokens
                  : stryMutAct_9fa48("2341")
                    ? false
                    : (stryCov_9fa48("2341", "2342", "2343"), t < maxTokens);
            stryMutAct_9fa48("2344") ? t-- : (stryCov_9fa48("2344"), t++)
        ) {
            if (stryMutAct_9fa48("2345")) {
                {
                }
            } else {
                stryCov_9fa48("2345");
                const startTok = cur;
                while (
                    stryMutAct_9fa48("2347")
                        ? cur < cps.length || isTokenChar(cps[cur] ?? "")
                        : stryMutAct_9fa48("2346")
                          ? false
                          : (stryCov_9fa48("2346", "2347"),
                            (stryMutAct_9fa48("2350")
                                ? cur >= cps.length
                                : stryMutAct_9fa48("2349")
                                  ? cur <= cps.length
                                  : stryMutAct_9fa48("2348")
                                    ? true
                                    : (stryCov_9fa48("2348", "2349", "2350"), cur < cps.length)) &&
                                isTokenChar(
                                    stryMutAct_9fa48("2351")
                                        ? cps[cur] && ""
                                        : (stryCov_9fa48("2351"),
                                          cps[cur] ??
                                              (stryMutAct_9fa48("2352")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("2352"), "")))
                                ))
                )
                    stryMutAct_9fa48("2353") ? cur-- : (stryCov_9fa48("2353"), cur++);
                if (
                    stryMutAct_9fa48("2356")
                        ? cur !== startTok
                        : stryMutAct_9fa48("2355")
                          ? false
                          : stryMutAct_9fa48("2354")
                            ? true
                            : (stryCov_9fa48("2354", "2355", "2356"), cur === startTok)
                )
                    break;
                const tok = stryMutAct_9fa48("2357")
                    ? cps.join("")
                    : (stryCov_9fa48("2357"),
                      cps
                          .slice(startTok, cur)
                          .join(
                              stryMutAct_9fa48("2358") ? "Stryker was here!" : (stryCov_9fa48("2358"), "")
                          ));
                const afterTok = stryMutAct_9fa48("2359")
                    ? cps[cur] && ""
                    : (stryCov_9fa48("2359"),
                      cps[cur] ??
                          (stryMutAct_9fa48("2360") ? "Stryker was here!" : (stryCov_9fa48("2360"), "")));
                if (
                    stryMutAct_9fa48("2363")
                        ? afterTok || isTokenChar(afterTok)
                        : stryMutAct_9fa48("2362")
                          ? false
                          : stryMutAct_9fa48("2361")
                            ? true
                            : (stryCov_9fa48("2361", "2362", "2363"), afterTok && isTokenChar(afterTok))
                )
                    return null;
                tokens.push(tok);
                movedEnd = cur;
                const wsStart = cur;
                while (
                    stryMutAct_9fa48("2365")
                        ? cur < cps.length || /\s/u.test(cps[cur] ?? "")
                        : stryMutAct_9fa48("2364")
                          ? false
                          : (stryCov_9fa48("2364", "2365"),
                            (stryMutAct_9fa48("2368")
                                ? cur >= cps.length
                                : stryMutAct_9fa48("2367")
                                  ? cur <= cps.length
                                  : stryMutAct_9fa48("2366")
                                    ? true
                                    : (stryCov_9fa48("2366", "2367", "2368"), cur < cps.length)) &&
                                (stryMutAct_9fa48("2369") ? /\S/u : (stryCov_9fa48("2369"), /\s/u)).test(
                                    stryMutAct_9fa48("2370")
                                        ? cps[cur] && ""
                                        : (stryCov_9fa48("2370"),
                                          cps[cur] ??
                                              (stryMutAct_9fa48("2371")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("2371"), "")))
                                ))
                )
                    stryMutAct_9fa48("2372") ? cur-- : (stryCov_9fa48("2372"), cur++);
                if (
                    stryMutAct_9fa48("2375")
                        ? cur !== wsStart
                        : stryMutAct_9fa48("2374")
                          ? false
                          : stryMutAct_9fa48("2373")
                            ? true
                            : (stryCov_9fa48("2373", "2374", "2375"), cur === wsStart)
                )
                    break;
            }
        }
        if (
            stryMutAct_9fa48("2378")
                ? tokens.length !== 0
                : stryMutAct_9fa48("2377")
                  ? false
                  : stryMutAct_9fa48("2376")
                    ? true
                    : (stryCov_9fa48("2376", "2377", "2378"), tokens.length === 0)
        )
            return null;
        const moved = stryMutAct_9fa48("2379")
            ? cps.join("")
            : (stryCov_9fa48("2379"),
              cps
                  .slice(0, movedEnd)
                  .join(stryMutAct_9fa48("2380") ? "Stryker was here!" : (stryCov_9fa48("2380"), "")));
        const remaining = stryMutAct_9fa48("2381")
            ? cps.join("")
            : (stryCov_9fa48("2381"),
              cps
                  .slice(movedEnd)
                  .join(stryMutAct_9fa48("2382") ? "Stryker was here!" : (stryCov_9fa48("2382"), "")));
        return stryMutAct_9fa48("2383")
            ? {}
            : (stryCov_9fa48("2383"),
              {
                  moved,
                  remaining,
                  tokens,
              });
    }
}
export function bridgeAmbiguousBrandSuffixAcrossTextNodes(textNodes: Element[]): number {
    if (stryMutAct_9fa48("2384")) {
        {
        }
    } else {
        stryCov_9fa48("2384");
        let changed = 0;
        for (
            let i = 0;
            stryMutAct_9fa48("2387")
                ? i >= textNodes.length - 1
                : stryMutAct_9fa48("2386")
                  ? i <= textNodes.length - 1
                  : stryMutAct_9fa48("2385")
                    ? false
                    : (stryCov_9fa48("2385", "2386", "2387"),
                      i <
                          (stryMutAct_9fa48("2388")
                              ? textNodes.length + 1
                              : (stryCov_9fa48("2388"), textNodes.length - 1)));
            stryMutAct_9fa48("2389") ? i-- : (stryCov_9fa48("2389"), i++)
        ) {
            if (stryMutAct_9fa48("2390")) {
                {
                }
            } else {
                stryCov_9fa48("2390");
                const aNode = textNodes[i];
                if (
                    stryMutAct_9fa48("2393")
                        ? false
                        : stryMutAct_9fa48("2392")
                          ? true
                          : stryMutAct_9fa48("2391")
                            ? aNode
                            : (stryCov_9fa48("2391", "2392", "2393"), !aNode)
                )
                    continue;
                const aRaw = (
                    stryMutAct_9fa48("2394")
                        ? aNode.textContent && ""
                        : (stryCov_9fa48("2394"),
                          aNode.textContent ??
                              (stryMutAct_9fa48("2395") ? "Stryker was here!" : (stryCov_9fa48("2395"), "")))
                ).normalize(stryMutAct_9fa48("2396") ? "" : (stryCov_9fa48("2396"), "NFC"));
                if (
                    stryMutAct_9fa48("2399")
                        ? false
                        : stryMutAct_9fa48("2398")
                          ? true
                          : stryMutAct_9fa48("2397")
                            ? aRaw
                            : (stryCov_9fa48("2397", "2398", "2399"), !aRaw)
                )
                    continue;
                if (
                    stryMutAct_9fa48("2402")
                        ? aRaw.trimEnd() === aRaw
                        : stryMutAct_9fa48("2401")
                          ? false
                          : stryMutAct_9fa48("2400")
                            ? true
                            : (stryCov_9fa48("2400", "2401", "2402"),
                              (stryMutAct_9fa48("2403")
                                  ? aRaw.trimStart()
                                  : (stryCov_9fa48("2403"), aRaw.trimEnd())) !== aRaw)
                )
                    continue;
                const fragInfo = trailingTokenFragment(aRaw);
                if (
                    stryMutAct_9fa48("2406")
                        ? false
                        : stryMutAct_9fa48("2405")
                          ? true
                          : stryMutAct_9fa48("2404")
                            ? fragInfo
                            : (stryCov_9fa48("2404", "2405", "2406"), !fragInfo)
                )
                    continue;
                const { frag } = fragInfo;
                const fragLower = normKey(frag);
                if (
                    stryMutAct_9fa48("2409")
                        ? false
                        : stryMutAct_9fa48("2408")
                          ? true
                          : stryMutAct_9fa48("2407")
                            ? ALWAYS_LATIN_TOKENS_STRICT.has(fragLower)
                            : (stryCov_9fa48("2407", "2408", "2409"),
                              !ALWAYS_LATIN_TOKENS_STRICT.has(fragLower))
                )
                    continue;
                let j = findNextNodeWithText(
                    textNodes,
                    stryMutAct_9fa48("2410") ? i - 1 : (stryCov_9fa48("2410"), i + 1)
                );
                if (
                    stryMutAct_9fa48("2413")
                        ? j != null
                        : stryMutAct_9fa48("2412")
                          ? false
                          : stryMutAct_9fa48("2411")
                            ? true
                            : (stryCov_9fa48("2411", "2412", "2413"), j == null)
                )
                    continue;
                let movedTotal = stryMutAct_9fa48("2414") ? "Stryker was here!" : (stryCov_9fa48("2414"), "");
                let sawModel = stryMutAct_9fa48("2415") ? true : (stryCov_9fa48("2415"), false);
                let sawAmbiguous = stryMutAct_9fa48("2416") ? true : (stryCov_9fa48("2416"), false);
                while (
                    stryMutAct_9fa48("2418")
                        ? j == null
                        : stryMutAct_9fa48("2417")
                          ? false
                          : (stryCov_9fa48("2417", "2418"), j != null)
                ) {
                    if (stryMutAct_9fa48("2419")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("2419");
                        const bNode = textNodes[j];
                        if (
                            stryMutAct_9fa48("2422")
                                ? false
                                : stryMutAct_9fa48("2421")
                                  ? true
                                  : stryMutAct_9fa48("2420")
                                    ? bNode
                                    : (stryCov_9fa48("2420", "2421", "2422"), !bNode)
                        )
                            break;
                        const bRaw = (
                            stryMutAct_9fa48("2423")
                                ? bNode.textContent && ""
                                : (stryCov_9fa48("2423"),
                                  bNode.textContent ??
                                      (stryMutAct_9fa48("2424")
                                          ? "Stryker was here!"
                                          : (stryCov_9fa48("2424"), "")))
                        ).normalize(stryMutAct_9fa48("2425") ? "" : (stryCov_9fa48("2425"), "NFC"));
                        if (
                            stryMutAct_9fa48("2428")
                                ? false
                                : stryMutAct_9fa48("2427")
                                  ? true
                                  : stryMutAct_9fa48("2426")
                                    ? bRaw
                                    : (stryCov_9fa48("2426", "2427", "2428"), !bRaw)
                        ) {
                            if (stryMutAct_9fa48("2429")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("2429");
                                j = findNextNodeWithText(
                                    textNodes,
                                    stryMutAct_9fa48("2430") ? j - 1 : (stryCov_9fa48("2430"), j + 1)
                                );
                                continue;
                            }
                        }
                        const take = takeLeadingWsAndTokenSequence(bRaw, 3);
                        if (
                            stryMutAct_9fa48("2433")
                                ? false
                                : stryMutAct_9fa48("2432")
                                  ? true
                                  : stryMutAct_9fa48("2431")
                                    ? take
                                    : (stryCov_9fa48("2431", "2432", "2433"), !take)
                        )
                            break;
                        const t1 = stryMutAct_9fa48("2434")
                            ? take.tokens[0] && ""
                            : (stryCov_9fa48("2434"),
                              take.tokens[0] ??
                                  (stryMutAct_9fa48("2435")
                                      ? "Stryker was here!"
                                      : (stryCov_9fa48("2435"), "")));
                        const t1Lower = normKey(t1);

                        // Case 1: odmah ambiguous (" Pro", " Max", ...)
                        if (
                            stryMutAct_9fa48("2437")
                                ? false
                                : stryMutAct_9fa48("2436")
                                  ? true
                                  : (stryCov_9fa48("2436", "2437"),
                                    ALWAYS_LATIN_TOKENS_AMBIGUOUS.has(t1Lower))
                        ) {
                            if (stryMutAct_9fa48("2438")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("2438");
                                stryMutAct_9fa48("2439")
                                    ? (movedTotal -= take.moved)
                                    : (stryCov_9fa48("2439"), (movedTotal += take.moved));
                                bNode.textContent = take.remaining;
                                sawAmbiguous = stryMutAct_9fa48("2440")
                                    ? false
                                    : (stryCov_9fa48("2440"), true);
                                stryMutAct_9fa48("2441") ? changed-- : (stryCov_9fa48("2441"), changed++);
                                j = findNextNodeWithText(
                                    textNodes,
                                    stryMutAct_9fa48("2442") ? j - 1 : (stryCov_9fa48("2442"), j + 1)
                                );
                                continue;
                            }
                        }

                        // Case 2: model token ("14" ili "S23") – uzmi ga samo jednom, pre ambiguous-a
                        const t1IsModel = stryMutAct_9fa48("2445")
                            ? isPureNumberToken(t1) && isAlphaNumModelToken(t1)
                            : stryMutAct_9fa48("2444")
                              ? false
                              : stryMutAct_9fa48("2443")
                                ? true
                                : (stryCov_9fa48("2443", "2444", "2445"),
                                  isPureNumberToken(t1) || isAlphaNumModelToken(t1));
                        if (
                            stryMutAct_9fa48("2448")
                                ? (t1IsModel && !sawModel) || !sawAmbiguous
                                : stryMutAct_9fa48("2447")
                                  ? false
                                  : stryMutAct_9fa48("2446")
                                    ? true
                                    : (stryCov_9fa48("2446", "2447", "2448"),
                                      (stryMutAct_9fa48("2450")
                                          ? t1IsModel || !sawModel
                                          : stryMutAct_9fa48("2449")
                                            ? true
                                            : (stryCov_9fa48("2449", "2450"),
                                              t1IsModel &&
                                                  (stryMutAct_9fa48("2451")
                                                      ? sawModel
                                                      : (stryCov_9fa48("2451"), !sawModel)))) &&
                                          (stryMutAct_9fa48("2452")
                                              ? sawAmbiguous
                                              : (stryCov_9fa48("2452"), !sawAmbiguous)))
                        ) {
                            if (stryMutAct_9fa48("2453")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("2453");
                                stryMutAct_9fa48("2454")
                                    ? (movedTotal -= take.moved)
                                    : (stryCov_9fa48("2454"), (movedTotal += take.moved));
                                bNode.textContent = take.remaining;
                                sawModel = stryMutAct_9fa48("2455") ? false : (stryCov_9fa48("2455"), true);
                                stryMutAct_9fa48("2456") ? changed-- : (stryCov_9fa48("2456"), changed++);
                                j = findNextNodeWithText(
                                    textNodes,
                                    stryMutAct_9fa48("2457") ? j - 1 : (stryCov_9fa48("2457"), j + 1)
                                );
                                continue;
                            }
                        }
                        break;
                    }
                }
                if (
                    stryMutAct_9fa48("2460")
                        ? !sawAmbiguous && !movedTotal
                        : stryMutAct_9fa48("2459")
                          ? false
                          : stryMutAct_9fa48("2458")
                            ? true
                            : (stryCov_9fa48("2458", "2459", "2460"),
                              (stryMutAct_9fa48("2461")
                                  ? sawAmbiguous
                                  : (stryCov_9fa48("2461"), !sawAmbiguous)) ||
                                  (stryMutAct_9fa48("2462")
                                      ? movedTotal
                                      : (stryCov_9fa48("2462"), !movedTotal)))
                )
                    continue;
                aNode.textContent = stryMutAct_9fa48("2463")
                    ? aRaw - movedTotal
                    : (stryCov_9fa48("2463"), aRaw + movedTotal);
            }
        }
        return changed;
    }
}
