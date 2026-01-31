// @ts-nocheck
// src/taskpane/app/word/statsText.ts
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
import type { ConvertStats } from "../../../shared/ooxml/convertOoxml";
import type { ExtrasSummary } from "../types";
import { t, tPlural } from "../../../shared/i18n";
export type ApplyScope = "selection" | "document";
export type ResultLike = {
    type: string;
    stats: ConvertStats;
};
function scopeLabel(scope: ApplyScope): string {
    if (stryMutAct_9fa48("8754")) {
        {
        }
    } else {
        stryCov_9fa48("8754");
        return (
            stryMutAct_9fa48("8757")
                ? scope !== "selection"
                : stryMutAct_9fa48("8756")
                  ? false
                  : stryMutAct_9fa48("8755")
                    ? true
                    : (stryCov_9fa48("8755", "8756", "8757"),
                      scope === (stryMutAct_9fa48("8758") ? "" : (stryCov_9fa48("8758"), "selection")))
        )
            ? t(stryMutAct_9fa48("8759") ? "" : (stryCov_9fa48("8759"), "stats_scope_selection"))
            : t(stryMutAct_9fa48("8760") ? "" : (stryCov_9fa48("8760"), "stats_scope_document"));
    }
}
function ms0(n: number): string {
    if (stryMutAct_9fa48("8761")) {
        {
        }
    } else {
        stryCov_9fa48("8761");
        return Number.isFinite(n)
            ? n.toFixed(0)
            : stryMutAct_9fa48("8762")
              ? ""
              : (stryCov_9fa48("8762"), "0");
    }
}

// [MAX3 CLEANUP] Removed dead code: buildApplyStatsTitle

export function buildApplyStatsText(result: ResultLike, scope: ApplyScope, extras?: ExtrasSummary): string {
    if (stryMutAct_9fa48("8763")) {
        {
        }
    } else {
        stryCov_9fa48("8763");
        const time = ms0(result.stats.timingMs);
        const bridges = result.stats.bridges;
        const chars = stryMutAct_9fa48("8766")
            ? result.stats.charsBefore && 0
            : stryMutAct_9fa48("8765")
              ? false
              : stryMutAct_9fa48("8764")
                ? true
                : (stryCov_9fa48("8764", "8765", "8766"), result.stats.charsBefore || 0);
        let out =
            (stryMutAct_9fa48("8767")
                ? ``
                : (stryCov_9fa48("8767"),
                  `${t(stryMutAct_9fa48("8768") ? "" : (stryCov_9fa48("8768"), "stats_line_scope"), scopeLabel(scope))}\n`)) +
            (stryMutAct_9fa48("8769")
                ? ``
                : (stryCov_9fa48("8769"),
                  `${tPlural(stryMutAct_9fa48("8770") ? "" : (stryCov_9fa48("8770"), "stats_line_nodes_changed"), result.stats.textNodes)}\n`)) +
            (stryMutAct_9fa48("8771")
                ? ``
                : (stryCov_9fa48("8771"),
                  `${t(stryMutAct_9fa48("8772") ? "" : (stryCov_9fa48("8772"), "stats_line_chars"), chars)}\n`)) +
            (stryMutAct_9fa48("8773")
                ? ``
                : (stryCov_9fa48("8773"),
                  `${t(stryMutAct_9fa48("8774") ? "" : (stryCov_9fa48("8774"), "stats_line_time_ms"), time)}\n`)) +
            (stryMutAct_9fa48("8775")
                ? ``
                : (stryCov_9fa48("8775"),
                  `${t(stryMutAct_9fa48("8776") ? "" : (stryCov_9fa48("8776"), "stats_section_bridges"))}\n`)) +
            (stryMutAct_9fa48("8777")
                ? ``
                : (stryCov_9fa48("8777"),
                  `${t(stryMutAct_9fa48("8778") ? "" : (stryCov_9fa48("8778"), "stats_bridge_line"), stryMutAct_9fa48("8779") ? "" : (stryCov_9fa48("8779"), "links"), bridges.links)}\n`)) +
            (stryMutAct_9fa48("8780")
                ? ``
                : (stryCov_9fa48("8780"),
                  `${t(stryMutAct_9fa48("8781") ? "" : (stryCov_9fa48("8781"), "stats_bridge_line"), stryMutAct_9fa48("8782") ? "" : (stryCov_9fa48("8782"), "placeholders"), bridges.placeholders)}\n`)) +
            (stryMutAct_9fa48("8783")
                ? ``
                : (stryCov_9fa48("8783"),
                  `${t(stryMutAct_9fa48("8784") ? "" : (stryCov_9fa48("8784"), "stats_bridge_line"), stryMutAct_9fa48("8785") ? "" : (stryCov_9fa48("8785"), "brandPhrases"), bridges.brandPhrases)}\n`)) +
            (stryMutAct_9fa48("8786")
                ? ``
                : (stryCov_9fa48("8786"),
                  `${t(stryMutAct_9fa48("8787") ? "" : (stryCov_9fa48("8787"), "stats_bridge_line"), stryMutAct_9fa48("8788") ? "" : (stryCov_9fa48("8788"), "brandTokens"), bridges.brandTokens)}\n`)) +
            (stryMutAct_9fa48("8789")
                ? ``
                : (stryCov_9fa48("8789"),
                  `${t(stryMutAct_9fa48("8790") ? "" : (stryCov_9fa48("8790"), "stats_bridge_line"), stryMutAct_9fa48("8791") ? "" : (stryCov_9fa48("8791"), "ambiguousBrandSuffix"), bridges.ambiguousBrandSuffix)}\n`)) +
            (stryMutAct_9fa48("8792")
                ? ``
                : (stryCov_9fa48("8792"),
                  `${t(stryMutAct_9fa48("8793") ? "" : (stryCov_9fa48("8793"), "stats_bridge_line"), stryMutAct_9fa48("8794") ? "" : (stryCov_9fa48("8794"), "digraphs"), bridges.digraphs)}\n`)) +
            (stryMutAct_9fa48("8795")
                ? ``
                : (stryCov_9fa48("8795"),
                  `${t(stryMutAct_9fa48("8796") ? "" : (stryCov_9fa48("8796"), "stats_bridge_line"), stryMutAct_9fa48("8797") ? "" : (stryCov_9fa48("8797"), "userPhrases"), bridges.userPhrases)}\n`)) +
            (stryMutAct_9fa48("8798")
                ? ``
                : (stryCov_9fa48("8798"),
                  `${t(stryMutAct_9fa48("8799") ? "" : (stryCov_9fa48("8799"), "stats_bridge_line"), stryMutAct_9fa48("8800") ? "" : (stryCov_9fa48("8800"), "userTokens"), bridges.userTokens)}\n`)) +
            (stryMutAct_9fa48("8801")
                ? ``
                : (stryCov_9fa48("8801"),
                  `${t(stryMutAct_9fa48("8802") ? "" : (stryCov_9fa48("8802"), "stats_bridge_line"), stryMutAct_9fa48("8803") ? "" : (stryCov_9fa48("8803"), "allCapsHints"), bridges.allCapsHints)}\n`)) +
            (stryMutAct_9fa48("8804")
                ? ``
                : (stryCov_9fa48("8804"),
                  `${t(stryMutAct_9fa48("8805") ? "" : (stryCov_9fa48("8805"), "stats_bridge_line"), stryMutAct_9fa48("8806") ? "" : (stryCov_9fa48("8806"), "spaces"), bridges.spaces)}`));
        const proof = result.stats.proofing;
        if (
            stryMutAct_9fa48("8809")
                ? proof.enabled
                : stryMutAct_9fa48("8808")
                  ? false
                  : stryMutAct_9fa48("8807")
                    ? true
                    : (stryCov_9fa48("8807", "8808", "8809"), proof?.enabled)
        ) {
            if (stryMutAct_9fa48("8810")) {
                {
                }
            } else {
                stryCov_9fa48("8810");
                stryMutAct_9fa48("8811")
                    ? (out -=
                          `\n${t("stats_section_proofing")}` +
                          `\n${t("stats_proof_target", proof.targetLang ?? "N/A")}` +
                          `\n${t("stats_proof_changed_runs", proof.changedRuns)}` +
                          `\n${t("stats_proof_skipped_runs", proof.skippedRuns)}`)
                    : (stryCov_9fa48("8811"),
                      (out +=
                          (stryMutAct_9fa48("8812")
                              ? ``
                              : (stryCov_9fa48("8812"),
                                `\n${t(stryMutAct_9fa48("8813") ? "" : (stryCov_9fa48("8813"), "stats_section_proofing"))}`)) +
                          (stryMutAct_9fa48("8814")
                              ? ``
                              : (stryCov_9fa48("8814"),
                                `\n${t(stryMutAct_9fa48("8815") ? "" : (stryCov_9fa48("8815"), "stats_proof_target"), stryMutAct_9fa48("8816") ? proof.targetLang && "N/A" : (stryCov_9fa48("8816"), proof.targetLang ?? (stryMutAct_9fa48("8817") ? "" : (stryCov_9fa48("8817"), "N/A"))))}`)) +
                          (stryMutAct_9fa48("8818")
                              ? ``
                              : (stryCov_9fa48("8818"),
                                `\n${t(stryMutAct_9fa48("8819") ? "" : (stryCov_9fa48("8819"), "stats_proof_changed_runs"), proof.changedRuns)}`)) +
                          (stryMutAct_9fa48("8820")
                              ? ``
                              : (stryCov_9fa48("8820"),
                                `\n${t(stryMutAct_9fa48("8821") ? "" : (stryCov_9fa48("8821"), "stats_proof_skipped_runs"), proof.skippedRuns)}`))));
                const skipped = (proof.skippedByReason ?? {}) as Record<string, number>;
                const reasons = stryMutAct_9fa48("8824")
                    ? Object.entries(skipped)
                          .filter(([, n]) => (n ?? 0) > 0)
                          .slice(0, 6)
                    : stryMutAct_9fa48("8823")
                      ? Object.entries(skipped)
                            .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                            .slice(0, 6)
                      : stryMutAct_9fa48("8822")
                        ? Object.entries(skipped)
                              .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                              .filter(([, n]) => (n ?? 0) > 0)
                        : (stryCov_9fa48("8822", "8823", "8824"),
                          Object.entries(skipped)
                              .sort(
                                  stryMutAct_9fa48("8825")
                                      ? () => undefined
                                      : (stryCov_9fa48("8825"),
                                        (a, b) =>
                                            stryMutAct_9fa48("8826")
                                                ? (b[1] ?? 0) + (a[1] ?? 0)
                                                : (stryCov_9fa48("8826"),
                                                  (stryMutAct_9fa48("8827")
                                                      ? b[1] && 0
                                                      : (stryCov_9fa48("8827"), b[1] ?? 0)) -
                                                      (stryMutAct_9fa48("8828")
                                                          ? a[1] && 0
                                                          : (stryCov_9fa48("8828"), a[1] ?? 0))))
                              )
                              .filter(
                                  stryMutAct_9fa48("8829")
                                      ? () => undefined
                                      : (stryCov_9fa48("8829"),
                                        ([, n]) =>
                                            stryMutAct_9fa48("8833")
                                                ? (n ?? 0) <= 0
                                                : stryMutAct_9fa48("8832")
                                                  ? (n ?? 0) >= 0
                                                  : stryMutAct_9fa48("8831")
                                                    ? false
                                                    : stryMutAct_9fa48("8830")
                                                      ? true
                                                      : (stryCov_9fa48("8830", "8831", "8832", "8833"),
                                                        (stryMutAct_9fa48("8834")
                                                            ? n && 0
                                                            : (stryCov_9fa48("8834"), n ?? 0)) > 0))
                              )
                              .slice(0, 6));
                if (
                    stryMutAct_9fa48("8836")
                        ? false
                        : stryMutAct_9fa48("8835")
                          ? true
                          : (stryCov_9fa48("8835", "8836"), reasons.length)
                ) {
                    if (stryMutAct_9fa48("8837")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8837");
                        out += stryMutAct_9fa48("8838")
                            ? ``
                            : (stryCov_9fa48("8838"),
                              `\n${t(stryMutAct_9fa48("8839") ? "" : (stryCov_9fa48("8839"), "stats_proof_skipped_by_reason"))}`);
                        for (const [k, n] of reasons)
                            out += stryMutAct_9fa48("8840")
                                ? ``
                                : (stryCov_9fa48("8840"),
                                  `\n${t(stryMutAct_9fa48("8841") ? "" : (stryCov_9fa48("8841"), "stats_proof_reason_line"), k, n)}`);
                    }
                }
            }
        }
        if (
            stryMutAct_9fa48("8844")
                ? scope === "document" || extras
                : stryMutAct_9fa48("8843")
                  ? false
                  : stryMutAct_9fa48("8842")
                    ? true
                    : (stryCov_9fa48("8842", "8843", "8844"),
                      (stryMutAct_9fa48("8846")
                          ? scope !== "document"
                          : stryMutAct_9fa48("8845")
                            ? true
                            : (stryCov_9fa48("8845", "8846"),
                              scope ===
                                  (stryMutAct_9fa48("8847") ? "" : (stryCov_9fa48("8847"), "document")))) &&
                          extras)
        ) {
            if (stryMutAct_9fa48("8848")) {
                {
                }
            } else {
                stryCov_9fa48("8848");
                stryMutAct_9fa48("8849")
                    ? (out -=
                          `\n${t("stats_line_headers_footers", extras.headersFootersProcessed)}` +
                          `\n${t("stats_line_footnotes", extras.footnotesProcessed)}` +
                          `\n${t("stats_line_endnotes", extras.endnotesProcessed)}`)
                    : (stryCov_9fa48("8849"),
                      (out +=
                          (stryMutAct_9fa48("8850")
                              ? ``
                              : (stryCov_9fa48("8850"),
                                `\n${t(stryMutAct_9fa48("8851") ? "" : (stryCov_9fa48("8851"), "stats_line_headers_footers"), extras.headersFootersProcessed)}`)) +
                          (stryMutAct_9fa48("8852")
                              ? ``
                              : (stryCov_9fa48("8852"),
                                `\n${t(stryMutAct_9fa48("8853") ? "" : (stryCov_9fa48("8853"), "stats_line_footnotes"), extras.footnotesProcessed)}`)) +
                          (stryMutAct_9fa48("8854")
                              ? ``
                              : (stryCov_9fa48("8854"),
                                `\n${t(stryMutAct_9fa48("8855") ? "" : (stryCov_9fa48("8855"), "stats_line_endnotes"), extras.endnotesProcessed)}`))));
                if (
                    stryMutAct_9fa48("8858")
                        ? extras.footnotesSupported !== false
                        : stryMutAct_9fa48("8857")
                          ? false
                          : stryMutAct_9fa48("8856")
                            ? true
                            : (stryCov_9fa48("8856", "8857", "8858"),
                              extras.footnotesSupported ===
                                  (stryMutAct_9fa48("8859") ? true : (stryCov_9fa48("8859"), false)))
                )
                    out += stryMutAct_9fa48("8860")
                        ? ``
                        : (stryCov_9fa48("8860"),
                          `\n${t(stryMutAct_9fa48("8861") ? "" : (stryCov_9fa48("8861"), "stats_footnotes_na"))}`);
                if (
                    stryMutAct_9fa48("8864")
                        ? extras.endnotesSupported !== false
                        : stryMutAct_9fa48("8863")
                          ? false
                          : stryMutAct_9fa48("8862")
                            ? true
                            : (stryCov_9fa48("8862", "8863", "8864"),
                              extras.endnotesSupported ===
                                  (stryMutAct_9fa48("8865") ? true : (stryCov_9fa48("8865"), false)))
                )
                    out += stryMutAct_9fa48("8866")
                        ? ``
                        : (stryCov_9fa48("8866"),
                          `\n${t(stryMutAct_9fa48("8867") ? "" : (stryCov_9fa48("8867"), "stats_endnotes_na"))}`);
            }
        }
        return out;
    }
}
export function buildPreviewAppliedStats(): {
    title: string;
    text: string;
} {
    if (stryMutAct_9fa48("8868")) {
        {
        }
    } else {
        stryCov_9fa48("8868");
        return stryMutAct_9fa48("8869")
            ? {}
            : (stryCov_9fa48("8869"),
              {
                  title: t(stryMutAct_9fa48("8870") ? "" : (stryCov_9fa48("8870"), "stats_header_preview")),
                  text: stryMutAct_9fa48("8871")
                      ? ``
                      : (stryCov_9fa48("8871"),
                        `${t(stryMutAct_9fa48("8872") ? "" : (stryCov_9fa48("8872"), "stats_line_scope"), t(stryMutAct_9fa48("8873") ? "" : (stryCov_9fa48("8873"), "stats_scope_selection")))}\n${t(stryMutAct_9fa48("8874") ? "" : (stryCov_9fa48("8874"), "stats_note_preview"))}`),
              });
    }
}
