// @ts-nocheck
// src/shared/ooxml/bridge/lexical/phrases.ts
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
import { findNextNodeWithText, isBoundaryChar, normKey } from "../../common";
export type PhraseInfo = {
    raw: string;
    lowerCps: string[];
    len: number;
};
export function buildPhraseInfos(phrases: string[]): PhraseInfo[] {
    if (stryMutAct_9fa48("2694")) {
        {
        }
    } else {
        stryCov_9fa48("2694");
        return stryMutAct_9fa48("2696")
            ? phrases
                  .map((p) => p.normalize("NFC").replace(/\s+/g, " ").trim())
                  .map((raw) => {
                      const lower = raw.toLowerCase();
                      const lowerCps = Array.from(lower);
                      return {
                          raw,
                          lowerCps,
                          len: lowerCps.length,
                      };
                  })
                  .sort((a, b) => b.len - a.len)
            : stryMutAct_9fa48("2695")
              ? phrases
                    .map((p) => p.normalize("NFC").replace(/\s+/g, " ").trim())
                    .filter((p) => p.length > 0)
                    .map((raw) => {
                        const lower = raw.toLowerCase();
                        const lowerCps = Array.from(lower);
                        return {
                            raw,
                            lowerCps,
                            len: lowerCps.length,
                        };
                    })
              : (stryCov_9fa48("2695", "2696"),
                phrases
                    .map(
                        stryMutAct_9fa48("2697")
                            ? () => undefined
                            : (stryCov_9fa48("2697"),
                              (p) =>
                                  stryMutAct_9fa48("2698")
                                      ? p.normalize("NFC").replace(/\s+/g, " ")
                                      : (stryCov_9fa48("2698"),
                                        p
                                            .normalize(
                                                stryMutAct_9fa48("2699") ? "" : (stryCov_9fa48("2699"), "NFC")
                                            )
                                            .replace(
                                                stryMutAct_9fa48("2701")
                                                    ? /\S+/g
                                                    : stryMutAct_9fa48("2700")
                                                      ? /\s/g
                                                      : (stryCov_9fa48("2700", "2701"), /\s+/g),
                                                stryMutAct_9fa48("2702") ? "" : (stryCov_9fa48("2702"), " ")
                                            )
                                            .trim()))
                    )
                    .filter(
                        stryMutAct_9fa48("2703")
                            ? () => undefined
                            : (stryCov_9fa48("2703"),
                              (p) =>
                                  stryMutAct_9fa48("2707")
                                      ? p.length <= 0
                                      : stryMutAct_9fa48("2706")
                                        ? p.length >= 0
                                        : stryMutAct_9fa48("2705")
                                          ? false
                                          : stryMutAct_9fa48("2704")
                                            ? true
                                            : (stryCov_9fa48("2704", "2705", "2706", "2707"), p.length > 0))
                    )
                    .map((raw) => {
                        if (stryMutAct_9fa48("2708")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("2708");
                            const lower = stryMutAct_9fa48("2709")
                                ? raw.toUpperCase()
                                : (stryCov_9fa48("2709"), raw.toLowerCase());
                            const lowerCps = Array.from(lower);
                            return stryMutAct_9fa48("2710")
                                ? {}
                                : (stryCov_9fa48("2710"),
                                  {
                                      raw,
                                      lowerCps,
                                      len: lowerCps.length,
                                  });
                        }
                    })
                    .sort(
                        stryMutAct_9fa48("2711")
                            ? () => undefined
                            : (stryCov_9fa48("2711"),
                              (a, b) =>
                                  stryMutAct_9fa48("2712")
                                      ? b.len + a.len
                                      : (stryCov_9fa48("2712"), b.len - a.len))
                    ));
    }
}
function matchPhraseChar(expectedLower: string, actualChar: string): boolean {
    if (stryMutAct_9fa48("2713")) {
        {
        }
    } else {
        stryCov_9fa48("2713");
        if (
            stryMutAct_9fa48("2716")
                ? expectedLower !== " "
                : stryMutAct_9fa48("2715")
                  ? false
                  : stryMutAct_9fa48("2714")
                    ? true
                    : (stryCov_9fa48("2714", "2715", "2716"),
                      expectedLower === (stryMutAct_9fa48("2717") ? "" : (stryCov_9fa48("2717"), " ")))
        )
            return (stryMutAct_9fa48("2718") ? /\S/u : (stryCov_9fa48("2718"), /\s/u)).test(actualChar);
        return stryMutAct_9fa48("2721")
            ? normKey(actualChar) !== expectedLower
            : stryMutAct_9fa48("2720")
              ? false
              : stryMutAct_9fa48("2719")
                ? true
                : (stryCov_9fa48("2719", "2720", "2721"), normKey(actualChar) === expectedLower);
    }
}
function takePrefixAcrossNodes(
    textNodes: Element[],
    startIndex: number,
    countCp: number
): {
    plan: Array<{
        nodeIndex: number;
        takeCp: number;
    }>;
    taken: string;
} | null {
    if (stryMutAct_9fa48("2722")) {
        {
        }
    } else {
        stryCov_9fa48("2722");
        let remaining = countCp;
        const plan: Array<{
            nodeIndex: number;
            takeCp: number;
        }> = stryMutAct_9fa48("2723") ? ["Stryker was here"] : (stryCov_9fa48("2723"), []);
        let taken = stryMutAct_9fa48("2724") ? "Stryker was here!" : (stryCov_9fa48("2724"), "");
        let j: number | null = startIndex;
        while (
            stryMutAct_9fa48("2727")
                ? remaining <= 0
                : stryMutAct_9fa48("2726")
                  ? remaining >= 0
                  : stryMutAct_9fa48("2725")
                    ? false
                    : (stryCov_9fa48("2725", "2726", "2727"), remaining > 0)
        ) {
            if (stryMutAct_9fa48("2728")) {
                {
                }
            } else {
                stryCov_9fa48("2728");
                if (
                    stryMutAct_9fa48("2731")
                        ? j != null
                        : stryMutAct_9fa48("2730")
                          ? false
                          : stryMutAct_9fa48("2729")
                            ? true
                            : (stryCov_9fa48("2729", "2730", "2731"), j == null)
                )
                    return null;
                const node = textNodes[j];
                if (
                    stryMutAct_9fa48("2734")
                        ? false
                        : stryMutAct_9fa48("2733")
                          ? true
                          : stryMutAct_9fa48("2732")
                            ? node
                            : (stryCov_9fa48("2732", "2733", "2734"), !node)
                )
                    return null;
                const raw = (
                    stryMutAct_9fa48("2735")
                        ? node.textContent && ""
                        : (stryCov_9fa48("2735"),
                          node.textContent ??
                              (stryMutAct_9fa48("2736") ? "Stryker was here!" : (stryCov_9fa48("2736"), "")))
                ).normalize(stryMutAct_9fa48("2737") ? "" : (stryCov_9fa48("2737"), "NFC"));
                if (
                    stryMutAct_9fa48("2740")
                        ? false
                        : stryMutAct_9fa48("2739")
                          ? true
                          : stryMutAct_9fa48("2738")
                            ? raw
                            : (stryCov_9fa48("2738", "2739", "2740"), !raw)
                ) {
                    if (stryMutAct_9fa48("2741")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("2741");
                        j = findNextNodeWithText(
                            textNodes,
                            stryMutAct_9fa48("2742") ? j - 1 : (stryCov_9fa48("2742"), j + 1)
                        );
                        continue;
                    }
                }
                const cps = Array.from(raw);
                const take = stryMutAct_9fa48("2743")
                    ? Math.max(remaining, cps.length)
                    : (stryCov_9fa48("2743"), Math.min(remaining, cps.length));
                stryMutAct_9fa48("2744")
                    ? (taken -= cps.slice(0, take).join(""))
                    : (stryCov_9fa48("2744"),
                      (taken += stryMutAct_9fa48("2745")
                          ? cps.join("")
                          : (stryCov_9fa48("2745"),
                            cps
                                .slice(0, take)
                                .join(
                                    stryMutAct_9fa48("2746")
                                        ? "Stryker was here!"
                                        : (stryCov_9fa48("2746"), "")
                                ))));
                plan.push(
                    stryMutAct_9fa48("2747")
                        ? {}
                        : (stryCov_9fa48("2747"),
                          {
                              nodeIndex: j,
                              takeCp: take,
                          })
                );
                stryMutAct_9fa48("2748") ? (remaining += take) : (stryCov_9fa48("2748"), (remaining -= take));
                j = findNextNodeWithText(
                    textNodes,
                    stryMutAct_9fa48("2749") ? j - 1 : (stryCov_9fa48("2749"), j + 1)
                );
            }
        }
        return stryMutAct_9fa48("2750")
            ? {}
            : (stryCov_9fa48("2750"),
              {
                  plan,
                  taken,
              });
    }
}
function peekCharAfterPlan(
    textNodes: Element[],
    plan: Array<{
        nodeIndex: number;
        takeCp: number;
    }>
): string {
    if (stryMutAct_9fa48("2751")) {
        {
        }
    } else {
        stryCov_9fa48("2751");
        if (
            stryMutAct_9fa48("2754")
                ? plan.length !== 0
                : stryMutAct_9fa48("2753")
                  ? false
                  : stryMutAct_9fa48("2752")
                    ? true
                    : (stryCov_9fa48("2752", "2753", "2754"), plan.length === 0)
        )
            return stryMutAct_9fa48("2755") ? "Stryker was here!" : (stryCov_9fa48("2755"), "");
        const last =
            plan[stryMutAct_9fa48("2756") ? plan.length + 1 : (stryCov_9fa48("2756"), plan.length - 1)];
        if (
            stryMutAct_9fa48("2759")
                ? false
                : stryMutAct_9fa48("2758")
                  ? true
                  : stryMutAct_9fa48("2757")
                    ? last
                    : (stryCov_9fa48("2757", "2758", "2759"), !last)
        )
            return stryMutAct_9fa48("2760") ? "Stryker was here!" : (stryCov_9fa48("2760"), "");
        const node = textNodes[last.nodeIndex];
        if (
            stryMutAct_9fa48("2763")
                ? false
                : stryMutAct_9fa48("2762")
                  ? true
                  : stryMutAct_9fa48("2761")
                    ? node
                    : (stryCov_9fa48("2761", "2762", "2763"), !node)
        )
            return stryMutAct_9fa48("2764") ? "Stryker was here!" : (stryCov_9fa48("2764"), "");
        const raw = (
            stryMutAct_9fa48("2765")
                ? node.textContent && ""
                : (stryCov_9fa48("2765"),
                  node.textContent ??
                      (stryMutAct_9fa48("2766") ? "Stryker was here!" : (stryCov_9fa48("2766"), "")))
        ).normalize(stryMutAct_9fa48("2767") ? "" : (stryCov_9fa48("2767"), "NFC"));
        const cps = Array.from(raw);
        const idx = last.takeCp;
        if (
            stryMutAct_9fa48("2771")
                ? idx >= cps.length
                : stryMutAct_9fa48("2770")
                  ? idx <= cps.length
                  : stryMutAct_9fa48("2769")
                    ? false
                    : stryMutAct_9fa48("2768")
                      ? true
                      : (stryCov_9fa48("2768", "2769", "2770", "2771"), idx < cps.length)
        )
            return stryMutAct_9fa48("2772")
                ? cps[idx] && ""
                : (stryCov_9fa48("2772"),
                  cps[idx] ?? (stryMutAct_9fa48("2773") ? "Stryker was here!" : (stryCov_9fa48("2773"), "")));
        const j = findNextNodeWithText(
            textNodes,
            stryMutAct_9fa48("2774") ? last.nodeIndex - 1 : (stryCov_9fa48("2774"), last.nodeIndex + 1)
        );
        if (
            stryMutAct_9fa48("2777")
                ? j != null
                : stryMutAct_9fa48("2776")
                  ? false
                  : stryMutAct_9fa48("2775")
                    ? true
                    : (stryCov_9fa48("2775", "2776", "2777"), j == null)
        )
            return stryMutAct_9fa48("2778") ? "Stryker was here!" : (stryCov_9fa48("2778"), "");
        const nextNode = textNodes[j];
        if (
            stryMutAct_9fa48("2781")
                ? false
                : stryMutAct_9fa48("2780")
                  ? true
                  : stryMutAct_9fa48("2779")
                    ? nextNode
                    : (stryCov_9fa48("2779", "2780", "2781"), !nextNode)
        )
            return stryMutAct_9fa48("2782") ? "Stryker was here!" : (stryCov_9fa48("2782"), "");
        const nextRaw = (
            stryMutAct_9fa48("2783")
                ? nextNode.textContent && ""
                : (stryCov_9fa48("2783"),
                  nextNode.textContent ??
                      (stryMutAct_9fa48("2784") ? "Stryker was here!" : (stryCov_9fa48("2784"), "")))
        ).normalize(stryMutAct_9fa48("2785") ? "" : (stryCov_9fa48("2785"), "NFC"));
        const nextCps = Array.from(nextRaw);
        return stryMutAct_9fa48("2786")
            ? nextCps[0] && ""
            : (stryCov_9fa48("2786"),
              nextCps[0] ?? (stryMutAct_9fa48("2787") ? "Stryker was here!" : (stryCov_9fa48("2787"), "")));
    }
}
function applyConsumePlan(
    textNodes: Element[],
    plan: Array<{
        nodeIndex: number;
        takeCp: number;
    }>
) {
    if (stryMutAct_9fa48("2788")) {
        {
        }
    } else {
        stryCov_9fa48("2788");
        for (const step of plan) {
            if (stryMutAct_9fa48("2789")) {
                {
                }
            } else {
                stryCov_9fa48("2789");
                const node = textNodes[step.nodeIndex];
                if (
                    stryMutAct_9fa48("2792")
                        ? false
                        : stryMutAct_9fa48("2791")
                          ? true
                          : stryMutAct_9fa48("2790")
                            ? node
                            : (stryCov_9fa48("2790", "2791", "2792"), !node)
                )
                    continue;
                const raw = (
                    stryMutAct_9fa48("2793")
                        ? node.textContent && ""
                        : (stryCov_9fa48("2793"),
                          node.textContent ??
                              (stryMutAct_9fa48("2794") ? "Stryker was here!" : (stryCov_9fa48("2794"), "")))
                ).normalize(stryMutAct_9fa48("2795") ? "" : (stryCov_9fa48("2795"), "NFC"));
                const cps = Array.from(raw);
                node.textContent = stryMutAct_9fa48("2796")
                    ? cps.join("")
                    : (stryCov_9fa48("2796"),
                      cps
                          .slice(step.takeCp)
                          .join(
                              stryMutAct_9fa48("2797") ? "Stryker was here!" : (stryCov_9fa48("2797"), "")
                          ));
            }
        }
    }
}
export function bridgePhrasesAcrossTextNodes(textNodes: Element[], phraseInfos: PhraseInfo[]): number {
    if (stryMutAct_9fa48("2798")) {
        {
        }
    } else {
        stryCov_9fa48("2798");
        if (
            stryMutAct_9fa48("2801")
                ? phraseInfos.length !== 0
                : stryMutAct_9fa48("2800")
                  ? false
                  : stryMutAct_9fa48("2799")
                    ? true
                    : (stryCov_9fa48("2799", "2800", "2801"), phraseInfos.length === 0)
        )
            return 0;
        let changed = 0;
        for (
            let i = 0;
            stryMutAct_9fa48("2804")
                ? i >= textNodes.length - 1
                : stryMutAct_9fa48("2803")
                  ? i <= textNodes.length - 1
                  : stryMutAct_9fa48("2802")
                    ? false
                    : (stryCov_9fa48("2802", "2803", "2804"),
                      i <
                          (stryMutAct_9fa48("2805")
                              ? textNodes.length + 1
                              : (stryCov_9fa48("2805"), textNodes.length - 1)));
            stryMutAct_9fa48("2806") ? i-- : (stryCov_9fa48("2806"), i++)
        ) {
            if (stryMutAct_9fa48("2807")) {
                {
                }
            } else {
                stryCov_9fa48("2807");
                const aNode = textNodes[i];
                if (
                    stryMutAct_9fa48("2810")
                        ? false
                        : stryMutAct_9fa48("2809")
                          ? true
                          : stryMutAct_9fa48("2808")
                            ? aNode
                            : (stryCov_9fa48("2808", "2809", "2810"), !aNode)
                )
                    continue;
                const aRaw = (
                    stryMutAct_9fa48("2811")
                        ? aNode.textContent && ""
                        : (stryCov_9fa48("2811"),
                          aNode.textContent ??
                              (stryMutAct_9fa48("2812") ? "Stryker was here!" : (stryCov_9fa48("2812"), "")))
                ).normalize(stryMutAct_9fa48("2813") ? "" : (stryCov_9fa48("2813"), "NFC"));
                if (
                    stryMutAct_9fa48("2816")
                        ? false
                        : stryMutAct_9fa48("2815")
                          ? true
                          : stryMutAct_9fa48("2814")
                            ? aRaw
                            : (stryCov_9fa48("2814", "2815", "2816"), !aRaw)
                )
                    continue;
                const aCps = Array.from(aRaw);
                const aLowerCps = Array.from(
                    stryMutAct_9fa48("2817")
                        ? aRaw.toUpperCase()
                        : (stryCov_9fa48("2817"), aRaw.toLowerCase())
                );
                for (const phrase of phraseInfos) {
                    if (stryMutAct_9fa48("2818")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("2818");
                        const p = phrase.lowerCps;
                        const pLen = phrase.len;
                        const maxX = stryMutAct_9fa48("2819")
                            ? Math.max(pLen - 1, aLowerCps.length)
                            : (stryCov_9fa48("2819"),
                              Math.min(
                                  stryMutAct_9fa48("2820") ? pLen + 1 : (stryCov_9fa48("2820"), pLen - 1),
                                  aLowerCps.length
                              ));
                        if (
                            stryMutAct_9fa48("2824")
                                ? maxX > 0
                                : stryMutAct_9fa48("2823")
                                  ? maxX < 0
                                  : stryMutAct_9fa48("2822")
                                    ? false
                                    : stryMutAct_9fa48("2821")
                                      ? true
                                      : (stryCov_9fa48("2821", "2822", "2823", "2824"), maxX <= 0)
                        )
                            continue;
                        for (
                            let x = maxX;
                            stryMutAct_9fa48("2827")
                                ? x < 1
                                : stryMutAct_9fa48("2826")
                                  ? x > 1
                                  : stryMutAct_9fa48("2825")
                                    ? false
                                    : (stryCov_9fa48("2825", "2826", "2827"), x >= 1);
                            stryMutAct_9fa48("2828") ? x++ : (stryCov_9fa48("2828"), x--)
                        ) {
                            if (stryMutAct_9fa48("2829")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("2829");
                                const startIdx = stryMutAct_9fa48("2830")
                                    ? aLowerCps.length + x
                                    : (stryCov_9fa48("2830"), aLowerCps.length - x);
                                const before = (
                                    stryMutAct_9fa48("2834")
                                        ? startIdx <= 0
                                        : stryMutAct_9fa48("2833")
                                          ? startIdx >= 0
                                          : stryMutAct_9fa48("2832")
                                            ? false
                                            : stryMutAct_9fa48("2831")
                                              ? true
                                              : (stryCov_9fa48("2831", "2832", "2833", "2834"), startIdx > 0)
                                )
                                    ? stryMutAct_9fa48("2835")
                                        ? aCps[startIdx - 1] && ""
                                        : (stryCov_9fa48("2835"),
                                          aCps[
                                              stryMutAct_9fa48("2836")
                                                  ? startIdx + 1
                                                  : (stryCov_9fa48("2836"), startIdx - 1)
                                          ] ??
                                              (stryMutAct_9fa48("2837")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("2837"), "")))
                                    : stryMutAct_9fa48("2838")
                                      ? "Stryker was here!"
                                      : (stryCov_9fa48("2838"), "");
                                if (
                                    stryMutAct_9fa48("2841")
                                        ? false
                                        : stryMutAct_9fa48("2840")
                                          ? true
                                          : stryMutAct_9fa48("2839")
                                            ? isBoundaryChar(before)
                                            : (stryCov_9fa48("2839", "2840", "2841"), !isBoundaryChar(before))
                                )
                                    continue;
                                const suffixLower = stryMutAct_9fa48("2842")
                                    ? aLowerCps.join("")
                                    : (stryCov_9fa48("2842"),
                                      aLowerCps
                                          .slice(startIdx)
                                          .join(
                                              stryMutAct_9fa48("2843")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("2843"), "")
                                          ));
                                const phrasePrefixLower = stryMutAct_9fa48("2844")
                                    ? p.join("")
                                    : (stryCov_9fa48("2844"),
                                      p
                                          .slice(0, x)
                                          .join(
                                              stryMutAct_9fa48("2845")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("2845"), "")
                                          ));
                                if (
                                    stryMutAct_9fa48("2848")
                                        ? suffixLower === phrasePrefixLower
                                        : stryMutAct_9fa48("2847")
                                          ? false
                                          : stryMutAct_9fa48("2846")
                                            ? true
                                            : (stryCov_9fa48("2846", "2847", "2848"),
                                              suffixLower !== phrasePrefixLower)
                                )
                                    continue;
                                const remaining = stryMutAct_9fa48("2849")
                                    ? p
                                    : (stryCov_9fa48("2849"), p.slice(x));
                                const remLen = remaining.length;
                                if (
                                    stryMutAct_9fa48("2853")
                                        ? remLen > 0
                                        : stryMutAct_9fa48("2852")
                                          ? remLen < 0
                                          : stryMutAct_9fa48("2851")
                                            ? false
                                            : stryMutAct_9fa48("2850")
                                              ? true
                                              : (stryCov_9fa48("2850", "2851", "2852", "2853"), remLen <= 0)
                                )
                                    continue;
                                const j0 = findNextNodeWithText(
                                    textNodes,
                                    stryMutAct_9fa48("2854") ? i - 1 : (stryCov_9fa48("2854"), i + 1)
                                );
                                if (
                                    stryMutAct_9fa48("2857")
                                        ? j0 != null
                                        : stryMutAct_9fa48("2856")
                                          ? false
                                          : stryMutAct_9fa48("2855")
                                            ? true
                                            : (stryCov_9fa48("2855", "2856", "2857"), j0 == null)
                                )
                                    continue;
                                const takenInfo = takePrefixAcrossNodes(textNodes, j0, remLen);
                                if (
                                    stryMutAct_9fa48("2860")
                                        ? false
                                        : stryMutAct_9fa48("2859")
                                          ? true
                                          : stryMutAct_9fa48("2858")
                                            ? takenInfo
                                            : (stryCov_9fa48("2858", "2859", "2860"), !takenInfo)
                                )
                                    continue;
                                const takenCps = Array.from(
                                    takenInfo.taken.normalize(
                                        stryMutAct_9fa48("2861") ? "" : (stryCov_9fa48("2861"), "NFC")
                                    )
                                );
                                if (
                                    stryMutAct_9fa48("2864")
                                        ? takenCps.length === remLen
                                        : stryMutAct_9fa48("2863")
                                          ? false
                                          : stryMutAct_9fa48("2862")
                                            ? true
                                            : (stryCov_9fa48("2862", "2863", "2864"),
                                              takenCps.length !== remLen)
                                )
                                    continue;
                                let ok = stryMutAct_9fa48("2865") ? false : (stryCov_9fa48("2865"), true);
                                for (
                                    let k = 0;
                                    stryMutAct_9fa48("2868")
                                        ? k >= remLen
                                        : stryMutAct_9fa48("2867")
                                          ? k <= remLen
                                          : stryMutAct_9fa48("2866")
                                            ? false
                                            : (stryCov_9fa48("2866", "2867", "2868"), k < remLen);
                                    stryMutAct_9fa48("2869") ? k-- : (stryCov_9fa48("2869"), k++)
                                ) {
                                    if (stryMutAct_9fa48("2870")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("2870");
                                        const remChar = remaining[k];
                                        const takenChar = takenCps[k];
                                        if (
                                            stryMutAct_9fa48("2873")
                                                ? (!remChar || !takenChar) &&
                                                  !matchPhraseChar(remChar, takenChar)
                                                : stryMutAct_9fa48("2872")
                                                  ? false
                                                  : stryMutAct_9fa48("2871")
                                                    ? true
                                                    : (stryCov_9fa48("2871", "2872", "2873"),
                                                      (stryMutAct_9fa48("2875")
                                                          ? !remChar && !takenChar
                                                          : stryMutAct_9fa48("2874")
                                                            ? false
                                                            : (stryCov_9fa48("2874", "2875"),
                                                              (stryMutAct_9fa48("2876")
                                                                  ? remChar
                                                                  : (stryCov_9fa48("2876"), !remChar)) ||
                                                                  (stryMutAct_9fa48("2877")
                                                                      ? takenChar
                                                                      : (stryCov_9fa48("2877"),
                                                                        !takenChar)))) ||
                                                          (stryMutAct_9fa48("2878")
                                                              ? matchPhraseChar(remChar, takenChar)
                                                              : (stryCov_9fa48("2878"),
                                                                !matchPhraseChar(remChar, takenChar))))
                                        ) {
                                            if (stryMutAct_9fa48("2879")) {
                                                {
                                                }
                                            } else {
                                                stryCov_9fa48("2879");
                                                ok = stryMutAct_9fa48("2880")
                                                    ? true
                                                    : (stryCov_9fa48("2880"), false);
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (
                                    stryMutAct_9fa48("2883")
                                        ? false
                                        : stryMutAct_9fa48("2882")
                                          ? true
                                          : stryMutAct_9fa48("2881")
                                            ? ok
                                            : (stryCov_9fa48("2881", "2882", "2883"), !ok)
                                )
                                    continue;
                                const after = peekCharAfterPlan(textNodes, takenInfo.plan);
                                if (
                                    stryMutAct_9fa48("2886")
                                        ? false
                                        : stryMutAct_9fa48("2885")
                                          ? true
                                          : stryMutAct_9fa48("2884")
                                            ? isBoundaryChar(after)
                                            : (stryCov_9fa48("2884", "2885", "2886"), !isBoundaryChar(after))
                                )
                                    continue;
                                aNode.textContent = stryMutAct_9fa48("2887")
                                    ? aRaw - takenInfo.taken
                                    : (stryCov_9fa48("2887"), aRaw + takenInfo.taken);
                                applyConsumePlan(textNodes, takenInfo.plan);
                                stryMutAct_9fa48("2888") ? changed-- : (stryCov_9fa48("2888"), changed++);
                                x = 0;
                                break;
                            }
                        }
                        if (
                            stryMutAct_9fa48("2891")
                                ? (aNode.textContent ?? "") === aRaw
                                : stryMutAct_9fa48("2890")
                                  ? false
                                  : stryMutAct_9fa48("2889")
                                    ? true
                                    : (stryCov_9fa48("2889", "2890", "2891"),
                                      (stryMutAct_9fa48("2892")
                                          ? aNode.textContent && ""
                                          : (stryCov_9fa48("2892"),
                                            aNode.textContent ??
                                                (stryMutAct_9fa48("2893")
                                                    ? "Stryker was here!"
                                                    : (stryCov_9fa48("2893"), "")))) !== aRaw)
                        )
                            break;
                    }
                }
            }
        }
        return changed;
    }
}
