// @ts-nocheck
// src/shared/ooxml/bridge/lexical/links.ts
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
import { findNextNodeWithText, trailingLinkFragment, isLinkChar, normKey, getCpArray } from "../../common";
import { LINK_PATTERNS_ANCHORED, trimLinkEnd, looksLikeLinkStart } from "../../../patterns/links";
function buildLookahead(textNodes: Element[], startIndex: number, maxCp: number) {
    if (stryMutAct_9fa48("2530")) {
        {
        }
    } else {
        stryCov_9fa48("2530");
        const plan: Array<{
            nodeIndex: number;
            takeCp: number;
            cps: string[];
        }> = stryMutAct_9fa48("2531") ? ["Stryker was here"] : (stryCov_9fa48("2531"), []);
        let out = stryMutAct_9fa48("2532") ? "Stryker was here!" : (stryCov_9fa48("2532"), "");
        let remaining = maxCp;
        let j: number | null = startIndex;
        while (
            stryMutAct_9fa48("2535")
                ? remaining <= 0
                : stryMutAct_9fa48("2534")
                  ? remaining >= 0
                  : stryMutAct_9fa48("2533")
                    ? false
                    : (stryCov_9fa48("2533", "2534", "2535"), remaining > 0)
        ) {
            if (stryMutAct_9fa48("2536")) {
                {
                }
            } else {
                stryCov_9fa48("2536");
                if (
                    stryMutAct_9fa48("2539")
                        ? j != null
                        : stryMutAct_9fa48("2538")
                          ? false
                          : stryMutAct_9fa48("2537")
                            ? true
                            : (stryCov_9fa48("2537", "2538", "2539"), j == null)
                )
                    break;
                const node = textNodes[j];
                if (
                    stryMutAct_9fa48("2542")
                        ? false
                        : stryMutAct_9fa48("2541")
                          ? true
                          : stryMutAct_9fa48("2540")
                            ? node
                            : (stryCov_9fa48("2540", "2541", "2542"), !node)
                )
                    break;
                const raw = (
                    stryMutAct_9fa48("2543")
                        ? node.textContent && ""
                        : (stryCov_9fa48("2543"),
                          node.textContent ??
                              (stryMutAct_9fa48("2544") ? "Stryker was here!" : (stryCov_9fa48("2544"), "")))
                ).normalize(stryMutAct_9fa48("2545") ? "" : (stryCov_9fa48("2545"), "NFC"));
                if (
                    stryMutAct_9fa48("2548")
                        ? false
                        : stryMutAct_9fa48("2547")
                          ? true
                          : stryMutAct_9fa48("2546")
                            ? raw
                            : (stryCov_9fa48("2546", "2547", "2548"), !raw)
                ) {
                    if (stryMutAct_9fa48("2549")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("2549");
                        j = findNextNodeWithText(
                            textNodes,
                            stryMutAct_9fa48("2550") ? j - 1 : (stryCov_9fa48("2550"), j + 1)
                        );
                        continue;
                    }
                }

                // ako sledeći node počinje whitespace-om, ne bridguj link preko te granice
                if (
                    stryMutAct_9fa48("2553")
                        ? raw.trimStart() === raw
                        : stryMutAct_9fa48("2552")
                          ? false
                          : stryMutAct_9fa48("2551")
                            ? true
                            : (stryCov_9fa48("2551", "2552", "2553"),
                              (stryMutAct_9fa48("2554")
                                  ? raw.trimEnd()
                                  : (stryCov_9fa48("2554"), raw.trimStart())) !== raw)
                )
                    break;
                const cps = Array.from(raw);
                const take = stryMutAct_9fa48("2555")
                    ? Math.max(remaining, cps.length)
                    : (stryCov_9fa48("2555"), Math.min(remaining, cps.length));
                plan.push(
                    stryMutAct_9fa48("2556")
                        ? {}
                        : (stryCov_9fa48("2556"),
                          {
                              nodeIndex: j,
                              takeCp: take,
                              cps,
                          })
                );
                stryMutAct_9fa48("2557")
                    ? (out -= cps.slice(0, take).join(""))
                    : (stryCov_9fa48("2557"),
                      (out += stryMutAct_9fa48("2558")
                          ? cps.join("")
                          : (stryCov_9fa48("2558"),
                            cps
                                .slice(0, take)
                                .join(
                                    stryMutAct_9fa48("2559")
                                        ? "Stryker was here!"
                                        : (stryCov_9fa48("2559"), "")
                                ))));
                stryMutAct_9fa48("2560") ? (remaining += take) : (stryCov_9fa48("2560"), (remaining -= take));
                j = findNextNodeWithText(
                    textNodes,
                    stryMutAct_9fa48("2561") ? j - 1 : (stryCov_9fa48("2561"), j + 1)
                );
            }
        }
        return stryMutAct_9fa48("2562")
            ? {}
            : (stryCov_9fa48("2562"),
              {
                  out,
                  plan,
              });
    }
}
function consumeFromPlan(
    textNodes: Element[],
    plan: Array<{
        nodeIndex: number;
        takeCp: number;
        cps: string[];
    }>,
    needCp: number
) {
    if (stryMutAct_9fa48("2563")) {
        {
        }
    } else {
        stryCov_9fa48("2563");
        let remaining = needCp;
        let moved = stryMutAct_9fa48("2564") ? "Stryker was here!" : (stryCov_9fa48("2564"), "");
        for (const step of plan) {
            if (stryMutAct_9fa48("2565")) {
                {
                }
            } else {
                stryCov_9fa48("2565");
                if (
                    stryMutAct_9fa48("2569")
                        ? remaining > 0
                        : stryMutAct_9fa48("2568")
                          ? remaining < 0
                          : stryMutAct_9fa48("2567")
                            ? false
                            : stryMutAct_9fa48("2566")
                              ? true
                              : (stryCov_9fa48("2566", "2567", "2568", "2569"), remaining <= 0)
                )
                    break;
                const take = stryMutAct_9fa48("2570")
                    ? Math.max(remaining, step.takeCp)
                    : (stryCov_9fa48("2570"), Math.min(remaining, step.takeCp));
                stryMutAct_9fa48("2571")
                    ? (moved -= step.cps.slice(0, take).join(""))
                    : (stryCov_9fa48("2571"),
                      (moved += stryMutAct_9fa48("2572")
                          ? step.cps.join("")
                          : (stryCov_9fa48("2572"),
                            step.cps
                                .slice(0, take)
                                .join(
                                    stryMutAct_9fa48("2573")
                                        ? "Stryker was here!"
                                        : (stryCov_9fa48("2573"), "")
                                ))));
                const node = textNodes[step.nodeIndex];
                if (
                    stryMutAct_9fa48("2576")
                        ? false
                        : stryMutAct_9fa48("2575")
                          ? true
                          : stryMutAct_9fa48("2574")
                            ? node
                            : (stryCov_9fa48("2574", "2575", "2576"), !node)
                )
                    continue;
                node.textContent = stryMutAct_9fa48("2577")
                    ? step.cps.join("")
                    : (stryCov_9fa48("2577"),
                      step.cps
                          .slice(take)
                          .join(
                              stryMutAct_9fa48("2578") ? "Stryker was here!" : (stryCov_9fa48("2578"), "")
                          ));
                stryMutAct_9fa48("2579") ? (remaining += take) : (stryCov_9fa48("2579"), (remaining -= take));
            }
        }
        return moved;
    }
}
const LINK_PREFIXES = stryMutAct_9fa48("2580")
    ? []
    : (stryCov_9fa48("2580"),
      [
          stryMutAct_9fa48("2581") ? "" : (stryCov_9fa48("2581"), "https://"),
          stryMutAct_9fa48("2582") ? "" : (stryCov_9fa48("2582"), "http://"),
          stryMutAct_9fa48("2583") ? "" : (stryCov_9fa48("2583"), "ftp://"),
          stryMutAct_9fa48("2584") ? "" : (stryCov_9fa48("2584"), "file://"),
          stryMutAct_9fa48("2585") ? "" : (stryCov_9fa48("2585"), "www."),
          stryMutAct_9fa48("2586") ? "" : (stryCov_9fa48("2586"), "mailto:"),
          stryMutAct_9fa48("2587") ? "" : (stryCov_9fa48("2587"), "tel:"),
          stryMutAct_9fa48("2588") ? "" : (stryCov_9fa48("2588"), "sip:"),
          stryMutAct_9fa48("2589") ? "" : (stryCov_9fa48("2589"), "sms:"),
          stryMutAct_9fa48("2590") ? "" : (stryCov_9fa48("2590"), "geo:"),
          stryMutAct_9fa48("2591") ? "" : (stryCov_9fa48("2591"), "skype:"),
          stryMutAct_9fa48("2592") ? "" : (stryCov_9fa48("2592"), "teams:"),
          stryMutAct_9fa48("2593") ? "" : (stryCov_9fa48("2593"), "msteams:"),
      ]);
function trailingLinkFragmentByPrefix(raw: string): {
    frag: string;
    startCpIndex: number;
} | null {
    if (stryMutAct_9fa48("2594")) {
        {
        }
    } else {
        stryCov_9fa48("2594");
        const lower = normKey(raw);
        let bestCu = stryMutAct_9fa48("2595") ? +1 : (stryCov_9fa48("2595"), -1);
        for (const p of LINK_PREFIXES) {
            if (stryMutAct_9fa48("2596")) {
                {
                }
            } else {
                stryCov_9fa48("2596");
                const idx = lower.lastIndexOf(p);
                if (
                    stryMutAct_9fa48("2600")
                        ? idx >= 0
                        : stryMutAct_9fa48("2599")
                          ? idx <= 0
                          : stryMutAct_9fa48("2598")
                            ? false
                            : stryMutAct_9fa48("2597")
                              ? true
                              : (stryCov_9fa48("2597", "2598", "2599", "2600"), idx < 0)
                )
                    continue;

                // uslov: od prefixa do kraja ne sme biti whitespace, inače je to "stari" link u sredini teksta
                if (
                    stryMutAct_9fa48("2602")
                        ? false
                        : stryMutAct_9fa48("2601")
                          ? true
                          : (stryCov_9fa48("2601", "2602"),
                            (stryMutAct_9fa48("2603") ? /\S/u : (stryCov_9fa48("2603"), /\s/u)).test(
                                stryMutAct_9fa48("2604") ? raw : (stryCov_9fa48("2604"), raw.slice(idx))
                            ))
                )
                    continue;
                if (
                    stryMutAct_9fa48("2608")
                        ? idx <= bestCu
                        : stryMutAct_9fa48("2607")
                          ? idx >= bestCu
                          : stryMutAct_9fa48("2606")
                            ? false
                            : stryMutAct_9fa48("2605")
                              ? true
                              : (stryCov_9fa48("2605", "2606", "2607", "2608"), idx > bestCu)
                )
                    bestCu = idx;
            }
        }
        if (
            stryMutAct_9fa48("2612")
                ? bestCu >= 0
                : stryMutAct_9fa48("2611")
                  ? bestCu <= 0
                  : stryMutAct_9fa48("2610")
                    ? false
                    : stryMutAct_9fa48("2609")
                      ? true
                      : (stryCov_9fa48("2609", "2610", "2611", "2612"), bestCu < 0)
        )
            return null;

        // code-unit index -> codepoint index (da bude kompatibilno sa startCpIndex logikom)
        const startCpIndex = getCpArray(
            stryMutAct_9fa48("2613") ? raw : (stryCov_9fa48("2613"), raw.slice(0, bestCu))
        ).length;
        const frag = stryMutAct_9fa48("2614")
            ? getCpArray(raw).join("")
            : (stryCov_9fa48("2614"),
              getCpArray(raw)
                  .slice(startCpIndex)
                  .join(stryMutAct_9fa48("2615") ? "Stryker was here!" : (stryCov_9fa48("2615"), "")));
        return stryMutAct_9fa48("2616")
            ? {}
            : (stryCov_9fa48("2616"),
              {
                  frag,
                  startCpIndex,
              });
    }
}
export function bridgeLinksAcrossTextNodes(textNodes: Element[]): number {
    if (stryMutAct_9fa48("2617")) {
        {
        }
    } else {
        stryCov_9fa48("2617");
        const MAX_LOOKAHEAD_CP = 300;
        let changed = 0;
        for (
            let i = 0;
            stryMutAct_9fa48("2620")
                ? i >= textNodes.length - 1
                : stryMutAct_9fa48("2619")
                  ? i <= textNodes.length - 1
                  : stryMutAct_9fa48("2618")
                    ? false
                    : (stryCov_9fa48("2618", "2619", "2620"),
                      i <
                          (stryMutAct_9fa48("2621")
                              ? textNodes.length + 1
                              : (stryCov_9fa48("2621"), textNodes.length - 1)));
            stryMutAct_9fa48("2622") ? i-- : (stryCov_9fa48("2622"), i++)
        ) {
            if (stryMutAct_9fa48("2623")) {
                {
                }
            } else {
                stryCov_9fa48("2623");
                const aNode = textNodes[i];
                if (
                    stryMutAct_9fa48("2626")
                        ? false
                        : stryMutAct_9fa48("2625")
                          ? true
                          : stryMutAct_9fa48("2624")
                            ? aNode
                            : (stryCov_9fa48("2624", "2625", "2626"), !aNode)
                )
                    continue;
                const aRaw = (
                    stryMutAct_9fa48("2627")
                        ? aNode.textContent && ""
                        : (stryCov_9fa48("2627"),
                          aNode.textContent ??
                              (stryMutAct_9fa48("2628") ? "Stryker was here!" : (stryCov_9fa48("2628"), "")))
                ).normalize(stryMutAct_9fa48("2629") ? "" : (stryCov_9fa48("2629"), "NFC"));
                if (
                    stryMutAct_9fa48("2632")
                        ? false
                        : stryMutAct_9fa48("2631")
                          ? true
                          : stryMutAct_9fa48("2630")
                            ? aRaw
                            : (stryCov_9fa48("2630", "2631", "2632"), !aRaw)
                )
                    continue;

                // ako a završava whitespace-om, ne bridguj
                if (
                    stryMutAct_9fa48("2635")
                        ? aRaw.trimEnd() === aRaw
                        : stryMutAct_9fa48("2634")
                          ? false
                          : stryMutAct_9fa48("2633")
                            ? true
                            : (stryCov_9fa48("2633", "2634", "2635"),
                              (stryMutAct_9fa48("2636")
                                  ? aRaw.trimStart()
                                  : (stryCov_9fa48("2636"), aRaw.trimEnd())) !== aRaw)
                )
                    continue;

                // 1) pokušaj standardno (trailingLinkFragment)
                // 2) fallback: nađi poslednji "https://" / "mailto:" itd i uzmi do kraja (bez whitespace)
                let fragInfo = trailingLinkFragment(aRaw);
                if (
                    stryMutAct_9fa48("2639")
                        ? false
                        : stryMutAct_9fa48("2638")
                          ? true
                          : stryMutAct_9fa48("2637")
                            ? fragInfo
                            : (stryCov_9fa48("2637", "2638", "2639"), !fragInfo)
                )
                    fragInfo = trailingLinkFragmentByPrefix(aRaw);
                if (
                    stryMutAct_9fa48("2642")
                        ? false
                        : stryMutAct_9fa48("2641")
                          ? true
                          : stryMutAct_9fa48("2640")
                            ? fragInfo
                            : (stryCov_9fa48("2640", "2641", "2642"), !fragInfo)
                )
                    continue;
                let { frag, startCpIndex } = fragInfo;

                // boundary guard: pre fragmenta ne sme biti link-char
                const aCps = getCpArray(aRaw);
                const prevChar = (
                    stryMutAct_9fa48("2646")
                        ? startCpIndex <= 0
                        : stryMutAct_9fa48("2645")
                          ? startCpIndex >= 0
                          : stryMutAct_9fa48("2644")
                            ? false
                            : stryMutAct_9fa48("2643")
                              ? true
                              : (stryCov_9fa48("2643", "2644", "2645", "2646"), startCpIndex > 0)
                )
                    ? stryMutAct_9fa48("2647")
                        ? aCps[startCpIndex - 1] && ""
                        : (stryCov_9fa48("2647"),
                          aCps[
                              stryMutAct_9fa48("2648")
                                  ? startCpIndex + 1
                                  : (stryCov_9fa48("2648"), startCpIndex - 1)
                          ] ?? (stryMutAct_9fa48("2649") ? "Stryker was here!" : (stryCov_9fa48("2649"), "")))
                    : stryMutAct_9fa48("2650")
                      ? "Stryker was here!"
                      : (stryCov_9fa48("2650"), "");
                if (
                    stryMutAct_9fa48("2653")
                        ? prevChar || isLinkChar(prevChar)
                        : stryMutAct_9fa48("2652")
                          ? false
                          : stryMutAct_9fa48("2651")
                            ? true
                            : (stryCov_9fa48("2651", "2652", "2653"), prevChar && isLinkChar(prevChar))
                )
                    continue;
                let fragLower = normKey(frag);
                if (
                    stryMutAct_9fa48("2656")
                        ? false
                        : stryMutAct_9fa48("2655")
                          ? true
                          : stryMutAct_9fa48("2654")
                            ? looksLikeLinkStart(fragLower)
                            : (stryCov_9fa48("2654", "2655", "2656"), !looksLikeLinkStart(fragLower))
                ) {
                    if (stryMutAct_9fa48("2657")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("2657");
                        // fallback još jednom (u slučaju da trailingLinkFragment vrati nešto kratko zbog '(' u URL-u)
                        const alt = trailingLinkFragmentByPrefix(aRaw);
                        if (
                            stryMutAct_9fa48("2660")
                                ? false
                                : stryMutAct_9fa48("2659")
                                  ? true
                                  : stryMutAct_9fa48("2658")
                                    ? alt
                                    : (stryCov_9fa48("2658", "2659", "2660"), !alt)
                        )
                            continue;
                        frag = alt.frag;
                        startCpIndex = alt.startCpIndex;
                        fragLower = normKey(frag);
                        if (
                            stryMutAct_9fa48("2663")
                                ? false
                                : stryMutAct_9fa48("2662")
                                  ? true
                                  : stryMutAct_9fa48("2661")
                                    ? looksLikeLinkStart(fragLower)
                                    : (stryCov_9fa48("2661", "2662", "2663"), !looksLikeLinkStart(fragLower))
                        )
                            continue;
                    }
                }
                const j0 = findNextNodeWithText(
                    textNodes,
                    stryMutAct_9fa48("2664") ? i - 1 : (stryCov_9fa48("2664"), i + 1)
                );
                if (
                    stryMutAct_9fa48("2667")
                        ? j0 != null
                        : stryMutAct_9fa48("2666")
                          ? false
                          : stryMutAct_9fa48("2665")
                            ? true
                            : (stryCov_9fa48("2665", "2666", "2667"), j0 == null)
                )
                    continue;
                const { out: lookahead, plan } = buildLookahead(textNodes, j0, MAX_LOOKAHEAD_CP);
                if (
                    stryMutAct_9fa48("2670")
                        ? false
                        : stryMutAct_9fa48("2669")
                          ? true
                          : stryMutAct_9fa48("2668")
                            ? lookahead
                            : (stryCov_9fa48("2668", "2669", "2670"), !lookahead)
                )
                    continue;
                const combined = stryMutAct_9fa48("2671")
                    ? frag - lookahead
                    : (stryCov_9fa48("2671"), frag + lookahead);
                let best = stryMutAct_9fa48("2672") ? "Stryker was here!" : (stryCov_9fa48("2672"), "");
                for (const re of LINK_PATTERNS_ANCHORED) {
                    if (stryMutAct_9fa48("2673")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("2673");
                        const m = re.exec(combined);
                        if (
                            stryMutAct_9fa48("2676")
                                ? false
                                : stryMutAct_9fa48("2675")
                                  ? true
                                  : stryMutAct_9fa48("2674")
                                    ? m
                                    : (stryCov_9fa48("2674", "2675", "2676"), !m)
                        )
                            continue;

                        // NOTE: u patterns modulu regex-i imaju jednu capturing grupu za “glavni match”
                        const candidate = trimLinkEnd((m[1] ?? m[0] ?? "") as string);
                        if (
                            stryMutAct_9fa48("2680")
                                ? candidate.length <= best.length
                                : stryMutAct_9fa48("2679")
                                  ? candidate.length >= best.length
                                  : stryMutAct_9fa48("2678")
                                    ? false
                                    : stryMutAct_9fa48("2677")
                                      ? true
                                      : (stryCov_9fa48("2677", "2678", "2679", "2680"),
                                        candidate.length > best.length)
                        )
                            best = candidate;
                    }
                }
                if (
                    stryMutAct_9fa48("2683")
                        ? false
                        : stryMutAct_9fa48("2682")
                          ? true
                          : stryMutAct_9fa48("2681")
                            ? best
                            : (stryCov_9fa48("2681", "2682", "2683"), !best)
                )
                    continue;
                if (
                    stryMutAct_9fa48("2687")
                        ? best.length > frag.length
                        : stryMutAct_9fa48("2686")
                          ? best.length < frag.length
                          : stryMutAct_9fa48("2685")
                            ? false
                            : stryMutAct_9fa48("2684")
                              ? true
                              : (stryCov_9fa48("2684", "2685", "2686", "2687"), best.length <= frag.length)
                )
                    continue;
                const need = stryMutAct_9fa48("2688")
                    ? best.length + frag.length
                    : (stryCov_9fa48("2688"), best.length - frag.length);
                const moved = consumeFromPlan(textNodes, plan, need);
                if (
                    stryMutAct_9fa48("2691")
                        ? moved.length === need
                        : stryMutAct_9fa48("2690")
                          ? false
                          : stryMutAct_9fa48("2689")
                            ? true
                            : (stryCov_9fa48("2689", "2690", "2691"), moved.length !== need)
                )
                    continue;
                aNode.textContent = stryMutAct_9fa48("2692")
                    ? aRaw - moved
                    : (stryCov_9fa48("2692"), aRaw + moved);
                stryMutAct_9fa48("2693") ? changed-- : (stryCov_9fa48("2693"), changed++);
            }
        }
        return changed;
    }
}
