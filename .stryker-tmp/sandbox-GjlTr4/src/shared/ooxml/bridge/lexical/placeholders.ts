// @ts-nocheck
// src/shared/ooxml/bridge/lexical/placeholders.ts
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
import { findNextNodeWithText, getCpArray } from "../../common";
type CurlyMode = "placeholders" | "all";
function buildLookahead(textNodes: Element[], startIndex: number, maxCp: number) {
    if (stryMutAct_9fa48("2894")) {
        {
        }
    } else {
        stryCov_9fa48("2894");
        const plan: Array<{
            nodeIndex: number;
            takeCp: number;
            cps: string[];
        }> = stryMutAct_9fa48("2895") ? ["Stryker was here"] : (stryCov_9fa48("2895"), []);
        let out = stryMutAct_9fa48("2896") ? "Stryker was here!" : (stryCov_9fa48("2896"), "");
        let remaining = maxCp;
        let j: number | null = startIndex;
        while (
            stryMutAct_9fa48("2899")
                ? remaining <= 0
                : stryMutAct_9fa48("2898")
                  ? remaining >= 0
                  : stryMutAct_9fa48("2897")
                    ? false
                    : (stryCov_9fa48("2897", "2898", "2899"), remaining > 0)
        ) {
            if (stryMutAct_9fa48("2900")) {
                {
                }
            } else {
                stryCov_9fa48("2900");
                if (
                    stryMutAct_9fa48("2903")
                        ? j != null
                        : stryMutAct_9fa48("2902")
                          ? false
                          : stryMutAct_9fa48("2901")
                            ? true
                            : (stryCov_9fa48("2901", "2902", "2903"), j == null)
                )
                    break;
                const node = textNodes[j];
                if (
                    stryMutAct_9fa48("2906")
                        ? false
                        : stryMutAct_9fa48("2905")
                          ? true
                          : stryMutAct_9fa48("2904")
                            ? node
                            : (stryCov_9fa48("2904", "2905", "2906"), !node)
                )
                    break;
                const raw = (
                    stryMutAct_9fa48("2907")
                        ? node.textContent && ""
                        : (stryCov_9fa48("2907"),
                          node.textContent ??
                              (stryMutAct_9fa48("2908") ? "Stryker was here!" : (stryCov_9fa48("2908"), "")))
                ).normalize(stryMutAct_9fa48("2909") ? "" : (stryCov_9fa48("2909"), "NFC"));
                if (
                    stryMutAct_9fa48("2912")
                        ? false
                        : stryMutAct_9fa48("2911")
                          ? true
                          : stryMutAct_9fa48("2910")
                            ? raw
                            : (stryCov_9fa48("2910", "2911", "2912"), !raw)
                ) {
                    if (stryMutAct_9fa48("2913")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("2913");
                        j = findNextNodeWithText(
                            textNodes,
                            stryMutAct_9fa48("2914") ? j - 1 : (stryCov_9fa48("2914"), j + 1)
                        );
                        continue;
                    }
                }
                const cps = getCpArray(raw);
                const take = stryMutAct_9fa48("2915")
                    ? Math.max(remaining, cps.length)
                    : (stryCov_9fa48("2915"), Math.min(remaining, cps.length));
                plan.push(
                    stryMutAct_9fa48("2916")
                        ? {}
                        : (stryCov_9fa48("2916"),
                          {
                              nodeIndex: j,
                              takeCp: take,
                              cps,
                          })
                );
                stryMutAct_9fa48("2917")
                    ? (out -= cps.slice(0, take).join(""))
                    : (stryCov_9fa48("2917"),
                      (out += stryMutAct_9fa48("2918")
                          ? cps.join("")
                          : (stryCov_9fa48("2918"),
                            cps
                                .slice(0, take)
                                .join(
                                    stryMutAct_9fa48("2919")
                                        ? "Stryker was here!"
                                        : (stryCov_9fa48("2919"), "")
                                ))));
                stryMutAct_9fa48("2920") ? (remaining += take) : (stryCov_9fa48("2920"), (remaining -= take));
                j = findNextNodeWithText(
                    textNodes,
                    stryMutAct_9fa48("2921") ? j - 1 : (stryCov_9fa48("2921"), j + 1)
                );
            }
        }
        return stryMutAct_9fa48("2922")
            ? {}
            : (stryCov_9fa48("2922"),
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
    if (stryMutAct_9fa48("2923")) {
        {
        }
    } else {
        stryCov_9fa48("2923");
        let remaining = needCp;
        let moved = stryMutAct_9fa48("2924") ? "Stryker was here!" : (stryCov_9fa48("2924"), "");
        for (const step of plan) {
            if (stryMutAct_9fa48("2925")) {
                {
                }
            } else {
                stryCov_9fa48("2925");
                if (
                    stryMutAct_9fa48("2929")
                        ? remaining > 0
                        : stryMutAct_9fa48("2928")
                          ? remaining < 0
                          : stryMutAct_9fa48("2927")
                            ? false
                            : stryMutAct_9fa48("2926")
                              ? true
                              : (stryCov_9fa48("2926", "2927", "2928", "2929"), remaining <= 0)
                )
                    break;
                const take = stryMutAct_9fa48("2930")
                    ? Math.max(remaining, step.takeCp)
                    : (stryCov_9fa48("2930"), Math.min(remaining, step.takeCp));
                stryMutAct_9fa48("2931")
                    ? (moved -= step.cps.slice(0, take).join(""))
                    : (stryCov_9fa48("2931"),
                      (moved += stryMutAct_9fa48("2932")
                          ? step.cps.join("")
                          : (stryCov_9fa48("2932"),
                            step.cps
                                .slice(0, take)
                                .join(
                                    stryMutAct_9fa48("2933")
                                        ? "Stryker was here!"
                                        : (stryCov_9fa48("2933"), "")
                                ))));
                const node = textNodes[step.nodeIndex];
                if (
                    stryMutAct_9fa48("2935")
                        ? false
                        : stryMutAct_9fa48("2934")
                          ? true
                          : (stryCov_9fa48("2934", "2935"), node)
                )
                    node.textContent = stryMutAct_9fa48("2936")
                        ? step.cps.join("")
                        : (stryCov_9fa48("2936"),
                          step.cps
                              .slice(take)
                              .join(
                                  stryMutAct_9fa48("2937") ? "Stryker was here!" : (stryCov_9fa48("2937"), "")
                              ));
                stryMutAct_9fa48("2938") ? (remaining += take) : (stryCov_9fa48("2938"), (remaining -= take));
            }
        }
        return moved;
    }
}
const PLACEHOLDER_RE = stryMutAct_9fa48("2943")
    ? /^\{[A-Za-z][^A-Za-z0-9_:-]{0,120}\}$/
    : stryMutAct_9fa48("2942")
      ? /^\{[A-Za-z][A-Za-z0-9_:-]\}$/
      : stryMutAct_9fa48("2941")
        ? /^\{[^A-Za-z][A-Za-z0-9_:-]{0,120}\}$/
        : stryMutAct_9fa48("2940")
          ? /^\{[A-Za-z][A-Za-z0-9_:-]{0,120}\}/
          : stryMutAct_9fa48("2939")
            ? /\{[A-Za-z][A-Za-z0-9_:-]{0,120}\}$/
            : (stryCov_9fa48("2939", "2940", "2941", "2942", "2943"), /^\{[A-Za-z][A-Za-z0-9_:-]{0,120}\}$/);

/**
 * Braced placeholders bridging:
 * - mode="placeholders": bridguje samo placeholder-like "{USER_NAME}" / "{Order-Id}" itd.
 * - mode="all": legacy; bridguje bilo šta od "{" do prve "}" (do MAX_LOOKAHEAD_CP)
 *
 * Napomena:
 * Ovo postoji jer protect sloj radi u plain-text-u, ali Word OOXML često splituje "{USER" + "_NAME}" kroz <w:t>.
 */
export function bridgeBracedPlaceholdersAcrossTextNodes(
    textNodes: Element[],
    mode: CurlyMode = stryMutAct_9fa48("2944") ? "" : (stryCov_9fa48("2944"), "placeholders")
): number {
    if (stryMutAct_9fa48("2945")) {
        {
        }
    } else {
        stryCov_9fa48("2945");
        const MAX_LOOKAHEAD_CP = 250;
        let changed = 0;
        for (
            let i = 0;
            stryMutAct_9fa48("2948")
                ? i >= textNodes.length - 1
                : stryMutAct_9fa48("2947")
                  ? i <= textNodes.length - 1
                  : stryMutAct_9fa48("2946")
                    ? false
                    : (stryCov_9fa48("2946", "2947", "2948"),
                      i <
                          (stryMutAct_9fa48("2949")
                              ? textNodes.length + 1
                              : (stryCov_9fa48("2949"), textNodes.length - 1)));
            stryMutAct_9fa48("2950") ? i-- : (stryCov_9fa48("2950"), i++)
        ) {
            if (stryMutAct_9fa48("2951")) {
                {
                }
            } else {
                stryCov_9fa48("2951");
                const aNode = textNodes[i];
                if (
                    stryMutAct_9fa48("2954")
                        ? false
                        : stryMutAct_9fa48("2953")
                          ? true
                          : stryMutAct_9fa48("2952")
                            ? aNode
                            : (stryCov_9fa48("2952", "2953", "2954"), !aNode)
                )
                    continue;
                const aRaw = (
                    stryMutAct_9fa48("2955")
                        ? aNode.textContent && ""
                        : (stryCov_9fa48("2955"),
                          aNode.textContent ??
                              (stryMutAct_9fa48("2956") ? "Stryker was here!" : (stryCov_9fa48("2956"), "")))
                ).normalize(stryMutAct_9fa48("2957") ? "" : (stryCov_9fa48("2957"), "NFC"));
                if (
                    stryMutAct_9fa48("2960")
                        ? false
                        : stryMutAct_9fa48("2959")
                          ? true
                          : stryMutAct_9fa48("2958")
                            ? aRaw
                            : (stryCov_9fa48("2958", "2959", "2960"), !aRaw)
                )
                    continue;
                const openIdx = aRaw.lastIndexOf(
                    stryMutAct_9fa48("2961") ? "" : (stryCov_9fa48("2961"), "{")
                );
                if (
                    stryMutAct_9fa48("2965")
                        ? openIdx >= 0
                        : stryMutAct_9fa48("2964")
                          ? openIdx <= 0
                          : stryMutAct_9fa48("2963")
                            ? false
                            : stryMutAct_9fa48("2962")
                              ? true
                              : (stryCov_9fa48("2962", "2963", "2964", "2965"), openIdx < 0)
                )
                    continue;
                const closeIdx = aRaw.lastIndexOf(
                    stryMutAct_9fa48("2966") ? "" : (stryCov_9fa48("2966"), "}")
                );
                if (
                    stryMutAct_9fa48("2970")
                        ? closeIdx <= openIdx
                        : stryMutAct_9fa48("2969")
                          ? closeIdx >= openIdx
                          : stryMutAct_9fa48("2968")
                            ? false
                            : stryMutAct_9fa48("2967")
                              ? true
                              : (stryCov_9fa48("2967", "2968", "2969", "2970"), closeIdx > openIdx)
                )
                    continue; // već zatvoreno u istom node-u

                const j0 = findNextNodeWithText(
                    textNodes,
                    stryMutAct_9fa48("2971") ? i - 1 : (stryCov_9fa48("2971"), i + 1)
                );
                if (
                    stryMutAct_9fa48("2974")
                        ? j0 != null
                        : stryMutAct_9fa48("2973")
                          ? false
                          : stryMutAct_9fa48("2972")
                            ? true
                            : (stryCov_9fa48("2972", "2973", "2974"), j0 == null)
                )
                    continue;
                const { out: lookahead, plan } = buildLookahead(textNodes, j0, MAX_LOOKAHEAD_CP);
                if (
                    stryMutAct_9fa48("2977")
                        ? false
                        : stryMutAct_9fa48("2976")
                          ? true
                          : stryMutAct_9fa48("2975")
                            ? lookahead
                            : (stryCov_9fa48("2975", "2976", "2977"), !lookahead)
                )
                    continue;
                const frag = stryMutAct_9fa48("2978") ? aRaw : (stryCov_9fa48("2978"), aRaw.slice(openIdx));
                const combined = stryMutAct_9fa48("2979")
                    ? frag - lookahead
                    : (stryCov_9fa48("2979"), frag + lookahead);
                const endIdx = combined.indexOf(stryMutAct_9fa48("2980") ? "" : (stryCov_9fa48("2980"), "}"));
                if (
                    stryMutAct_9fa48("2984")
                        ? endIdx >= 0
                        : stryMutAct_9fa48("2983")
                          ? endIdx <= 0
                          : stryMutAct_9fa48("2982")
                            ? false
                            : stryMutAct_9fa48("2981")
                              ? true
                              : (stryCov_9fa48("2981", "2982", "2983", "2984"), endIdx < 0)
                )
                    continue;
                const candidate = stryMutAct_9fa48("2985")
                    ? combined
                    : (stryCov_9fa48("2985"),
                      combined.slice(
                          0,
                          stryMutAct_9fa48("2986") ? endIdx - 1 : (stryCov_9fa48("2986"), endIdx + 1)
                      ));
                if (
                    stryMutAct_9fa48("2989")
                        ? mode !== "placeholders"
                        : stryMutAct_9fa48("2988")
                          ? false
                          : stryMutAct_9fa48("2987")
                            ? true
                            : (stryCov_9fa48("2987", "2988", "2989"),
                              mode ===
                                  (stryMutAct_9fa48("2990") ? "" : (stryCov_9fa48("2990"), "placeholders")))
                ) {
                    if (stryMutAct_9fa48("2991")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("2991");
                        // Strict: samo placeholder-like (bez whitespace, kontrolisana dužina i allowed chars)
                        if (
                            stryMutAct_9fa48("2994")
                                ? false
                                : stryMutAct_9fa48("2993")
                                  ? true
                                  : stryMutAct_9fa48("2992")
                                    ? PLACEHOLDER_RE.test(candidate)
                                    : (stryCov_9fa48("2992", "2993", "2994"), !PLACEHOLDER_RE.test(candidate))
                        )
                            continue;
                    }
                }
                const neededLen = stryMutAct_9fa48("2995")
                    ? candidate.length + frag.length
                    : (stryCov_9fa48("2995"), candidate.length - frag.length);
                if (
                    stryMutAct_9fa48("2999")
                        ? neededLen > 0
                        : stryMutAct_9fa48("2998")
                          ? neededLen < 0
                          : stryMutAct_9fa48("2997")
                            ? false
                            : stryMutAct_9fa48("2996")
                              ? true
                              : (stryCov_9fa48("2996", "2997", "2998", "2999"), neededLen <= 0)
                )
                    continue;
                const moved = consumeFromPlan(textNodes, plan, neededLen);
                if (
                    stryMutAct_9fa48("3002")
                        ? moved.length === neededLen
                        : stryMutAct_9fa48("3001")
                          ? false
                          : stryMutAct_9fa48("3000")
                            ? true
                            : (stryCov_9fa48("3000", "3001", "3002"), moved.length !== neededLen)
                )
                    continue;
                aNode.textContent = stryMutAct_9fa48("3003")
                    ? aRaw - moved
                    : (stryCov_9fa48("3003"), aRaw + moved);
                stryMutAct_9fa48("3004") ? changed-- : (stryCov_9fa48("3004"), changed++);
            }
        }
        return changed;
    }
}
