// @ts-nocheck
// src/taskpane/app/word/chunking.ts

/* global Word */ function stryNS_9fa48() {
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
import { type OoxmlOptions, type ConvertStats } from "../../../shared/ooxml/convertOoxml";
import { setStatus, setProgress } from "../status";
import { t } from "../../../shared/i18n";
import { workerClient } from "../../worker/client";
import { state } from "../state";
import { perfMonitor } from "../telemetry/performanceMonitor";
const BATCH_SIZE_START = 50;
const MIN_BATCH = 10;
const MAX_BATCH = 150;
const TARGET_TIME_MS = 800;
const YIELD_DELAY_MS = 5;
export type ChunkingResult = {
    type: string;
    stats: ConvertStats;
};
function nowMs(): number {
    if (stryMutAct_9fa48("8412")) {
        {
        }
    } else {
        stryCov_9fa48("8412");
        return (
            stryMutAct_9fa48("8415")
                ? typeof performance === "undefined"
                : stryMutAct_9fa48("8414")
                  ? false
                  : stryMutAct_9fa48("8413")
                    ? true
                    : (stryCov_9fa48("8413", "8414", "8415"),
                      typeof performance !==
                          (stryMutAct_9fa48("8416") ? "" : (stryCov_9fa48("8416"), "undefined")))
        )
            ? performance.now()
            : Date.now();
    }
}
function labelForDirection(dir: ConvertStats["direction"]): string {
    if (stryMutAct_9fa48("8417")) {
        {
        }
    } else {
        stryCov_9fa48("8417");
        if (
            stryMutAct_9fa48("8420")
                ? dir !== "lat-to-cyr"
                : stryMutAct_9fa48("8419")
                  ? false
                  : stryMutAct_9fa48("8418")
                    ? true
                    : (stryCov_9fa48("8418", "8419", "8420"),
                      dir === (stryMutAct_9fa48("8421") ? "" : (stryCov_9fa48("8421"), "lat-to-cyr")))
        )
            return stryMutAct_9fa48("8422") ? "" : (stryCov_9fa48("8422"), "Lat → Ćir");
        if (
            stryMutAct_9fa48("8425")
                ? dir !== "cyr-to-lat"
                : stryMutAct_9fa48("8424")
                  ? false
                  : stryMutAct_9fa48("8423")
                    ? true
                    : (stryCov_9fa48("8423", "8424", "8425"),
                      dir === (stryMutAct_9fa48("8426") ? "" : (stryCov_9fa48("8426"), "cyr-to-lat")))
        )
            return stryMutAct_9fa48("8427") ? "" : (stryCov_9fa48("8427"), "Ćir → Lat");
        if (
            stryMutAct_9fa48("8430")
                ? dir !== "to-ascii"
                : stryMutAct_9fa48("8429")
                  ? false
                  : stryMutAct_9fa48("8428")
                    ? true
                    : (stryCov_9fa48("8428", "8429", "8430"),
                      dir === (stryMutAct_9fa48("8431") ? "" : (stryCov_9fa48("8431"), "to-ascii")))
        )
            return stryMutAct_9fa48("8432") ? "" : (stryCov_9fa48("8432"), "Ošišana latinica");
        return stryMutAct_9fa48("8433") ? "" : (stryCov_9fa48("8433"), "Auto");
    }
}
function emptyStats(direction: ConvertStats["direction"]): ConvertStats {
    if (stryMutAct_9fa48("8434")) {
        {
        }
    } else {
        stryCov_9fa48("8434");
        return stryMutAct_9fa48("8435")
            ? {}
            : (stryCov_9fa48("8435"),
              {
                  direction,
                  textNodes: 0,
                  charsBefore: 0,
                  charsAfter: 0,
                  detected: stryMutAct_9fa48("8436")
                      ? {}
                      : (stryCov_9fa48("8436"),
                        {
                            urls: 0,
                            emails: 0,
                        }),
                  code: stryMutAct_9fa48("8437")
                      ? {}
                      : (stryCov_9fa48("8437"),
                        {
                            fenceMarkersSeen: 0,
                            inlineTicksSeen: 0,
                            endedInFence: stryMutAct_9fa48("8438") ? true : (stryCov_9fa48("8438"), false),
                            endedInInline: stryMutAct_9fa48("8439") ? true : (stryCov_9fa48("8439"), false),
                        }),
                  bridges: stryMutAct_9fa48("8440")
                      ? {}
                      : (stryCov_9fa48("8440"),
                        {
                            links: 0,
                            placeholders: 0,
                            brandPhrases: 0,
                            brandTokens: 0,
                            digraphs: 0,
                            userPhrases: 0,
                            userTokens: 0,
                            allCapsHints: 0,
                            spaces: 0,
                            ambiguousBrandSuffix: 0,
                        }),
                  proofing: stryMutAct_9fa48("8441")
                      ? {}
                      : (stryCov_9fa48("8441"),
                        {
                            enabled: stryMutAct_9fa48("8442") ? true : (stryCov_9fa48("8442"), false),
                            targetLang: null,
                            changedRuns: 0,
                            skippedRuns: 0,
                            skippedByReason: {},
                        }),
                  timingMs: 0,
              });
    }
}
function mergeStats(into: ConvertStats, from: ConvertStats) {
    if (stryMutAct_9fa48("8443")) {
        {
        }
    } else {
        stryCov_9fa48("8443");
        stryMutAct_9fa48("8444")
            ? (into.textNodes -= from.textNodes)
            : (stryCov_9fa48("8444"), (into.textNodes += from.textNodes));
        stryMutAct_9fa48("8445")
            ? (into.charsBefore -= from.charsBefore)
            : (stryCov_9fa48("8445"), (into.charsBefore += from.charsBefore));
        stryMutAct_9fa48("8446")
            ? (into.charsAfter -= from.charsAfter)
            : (stryCov_9fa48("8446"), (into.charsAfter += from.charsAfter));
        stryMutAct_9fa48("8447")
            ? (into.detected.urls -= from.detected.urls)
            : (stryCov_9fa48("8447"), (into.detected.urls += from.detected.urls));
        stryMutAct_9fa48("8448")
            ? (into.detected.emails -= from.detected.emails)
            : (stryCov_9fa48("8448"), (into.detected.emails += from.detected.emails));
        stryMutAct_9fa48("8449")
            ? (into.code.fenceMarkersSeen -= from.code.fenceMarkersSeen)
            : (stryCov_9fa48("8449"), (into.code.fenceMarkersSeen += from.code.fenceMarkersSeen));
        stryMutAct_9fa48("8450")
            ? (into.code.inlineTicksSeen -= from.code.inlineTicksSeen)
            : (stryCov_9fa48("8450"), (into.code.inlineTicksSeen += from.code.inlineTicksSeen));
        into.code.endedInFence = from.code.endedInFence;
        into.code.endedInInline = from.code.endedInInline;
        for (const key in into.bridges) {
            if (stryMutAct_9fa48("8451")) {
                {
                }
            } else {
                stryCov_9fa48("8451");
                const k = key as keyof typeof into.bridges;
                stryMutAct_9fa48("8452")
                    ? (into.bridges[k] -= from.bridges[k])
                    : (stryCov_9fa48("8452"), (into.bridges[k] += from.bridges[k]));
            }
        }
        if (
            stryMutAct_9fa48("8454")
                ? false
                : stryMutAct_9fa48("8453")
                  ? true
                  : (stryCov_9fa48("8453", "8454"), from.proofing.enabled)
        ) {
            if (stryMutAct_9fa48("8455")) {
                {
                }
            } else {
                stryCov_9fa48("8455");
                into.proofing.enabled = stryMutAct_9fa48("8456") ? false : (stryCov_9fa48("8456"), true);
                into.proofing.targetLang = from.proofing.targetLang;
                stryMutAct_9fa48("8457")
                    ? (into.proofing.changedRuns -= from.proofing.changedRuns)
                    : (stryCov_9fa48("8457"), (into.proofing.changedRuns += from.proofing.changedRuns));
                stryMutAct_9fa48("8458")
                    ? (into.proofing.skippedRuns -= from.proofing.skippedRuns)
                    : (stryCov_9fa48("8458"), (into.proofing.skippedRuns += from.proofing.skippedRuns));
                for (const r in from.proofing.skippedByReason) {
                    if (stryMutAct_9fa48("8459")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8459");
                        into.proofing.skippedByReason[r] = stryMutAct_9fa48("8460")
                            ? (into.proofing.skippedByReason[r] || 0) - from.proofing.skippedByReason[r]
                            : (stryCov_9fa48("8460"),
                              (stryMutAct_9fa48("8463")
                                  ? into.proofing.skippedByReason[r] && 0
                                  : stryMutAct_9fa48("8462")
                                    ? false
                                    : stryMutAct_9fa48("8461")
                                      ? true
                                      : (stryCov_9fa48("8461", "8462", "8463"),
                                        into.proofing.skippedByReason[r] || 0)) +
                                  from.proofing.skippedByReason[r]);
                    }
                }
            }
        }
    }
}
export async function processDocumentInChunks(
    context: Word.RequestContext,
    opts: OoxmlOptions
): Promise<ChunkingResult> {
    if (stryMutAct_9fa48("8464")) {
        {
        }
    } else {
        stryCov_9fa48("8464");
        const t0 = nowMs();
        await workerClient.init();
        const paragraphs = context.document.body.paragraphs;
        paragraphs.load(stryMutAct_9fa48("8465") ? "" : (stryCov_9fa48("8465"), "items"));

        // eslint-disable-next-line office-addins/no-context-sync-in-loop
        await context.sync();
        const totalParagraphs = paragraphs.items.length;
        let agg: ConvertStats | null = null;
        let i = 0;
        let batchSize = BATCH_SIZE_START;
        while (
            stryMutAct_9fa48("8468")
                ? i >= totalParagraphs
                : stryMutAct_9fa48("8467")
                  ? i <= totalParagraphs
                  : stryMutAct_9fa48("8466")
                    ? false
                    : (stryCov_9fa48("8466", "8467", "8468"), i < totalParagraphs)
        ) {
            if (stryMutAct_9fa48("8469")) {
                {
                }
            } else {
                stryCov_9fa48("8469");
                if (
                    stryMutAct_9fa48("8472")
                        ? state.activeAbortController.signal.aborted
                        : stryMutAct_9fa48("8471")
                          ? false
                          : stryMutAct_9fa48("8470")
                            ? true
                            : (stryCov_9fa48("8470", "8471", "8472"),
                              state.activeAbortController?.signal.aborted)
                )
                    break;
                const batchStart = nowMs();
                const batchItems = stryMutAct_9fa48("8473")
                    ? paragraphs.items
                    : (stryCov_9fa48("8473"),
                      paragraphs.items.slice(
                          i,
                          stryMutAct_9fa48("8474") ? i - batchSize : (stryCov_9fa48("8474"), i + batchSize)
                      ));
                if (
                    stryMutAct_9fa48("8477")
                        ? batchItems.length !== 0
                        : stryMutAct_9fa48("8476")
                          ? false
                          : stryMutAct_9fa48("8475")
                            ? true
                            : (stryCov_9fa48("8475", "8476", "8477"), batchItems.length === 0)
                )
                    break;
                const batchRange = batchItems[0]
                    .getRange(stryMutAct_9fa48("8478") ? "" : (stryCov_9fa48("8478"), "Whole"))
                    .expandTo(
                        batchItems[
                            stryMutAct_9fa48("8479")
                                ? batchItems.length + 1
                                : (stryCov_9fa48("8479"), batchItems.length - 1)
                        ].getRange(stryMutAct_9fa48("8480") ? "" : (stryCov_9fa48("8480"), "Whole"))
                    );
                const ooxmlRes = batchRange.getOoxml();

                /**
                 * ARHITEKTONSKO OBRAZLOŽENJE: context.sync() unutar petlje je neophodan
                 * za "Adaptive Smart Chunking". On omogućava Word hostu da oslobodi UI nit
                 * i obradi OOXML u delovima, sprečavajući Out-of-Memory greške kod 1000+ strana.
                 */
                // eslint-disable-next-line office-addins/no-context-sync-in-loop
                await context.sync();
                const result = await workerClient.convert(ooxmlRes.value, opts);
                if (
                    stryMutAct_9fa48("8483")
                        ? false
                        : stryMutAct_9fa48("8482")
                          ? true
                          : stryMutAct_9fa48("8481")
                            ? agg
                            : (stryCov_9fa48("8481", "8482", "8483"), !agg)
                )
                    agg = emptyStats(result.stats.direction);
                mergeStats(agg, result.stats);
                if (
                    stryMutAct_9fa48("8486")
                        ? result.xml === ooxmlRes.value
                        : stryMutAct_9fa48("8485")
                          ? false
                          : stryMutAct_9fa48("8484")
                            ? true
                            : (stryCov_9fa48("8484", "8485", "8486"), result.xml !== ooxmlRes.value)
                ) {
                    if (stryMutAct_9fa48("8487")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8487");
                        batchRange.insertOoxml(result.xml, Word.InsertLocation.replace);
                    }
                }
                stryMutAct_9fa48("8488") ? (i -= batchSize) : (stryCov_9fa48("8488"), (i += batchSize));
                const progress = Math.round(
                    stryMutAct_9fa48("8489")
                        ? i / totalParagraphs / 100
                        : (stryCov_9fa48("8489"),
                          (stryMutAct_9fa48("8490")
                              ? i * totalParagraphs
                              : (stryCov_9fa48("8490"), i / totalParagraphs)) * 100)
                );
                setProgress(progress);
                setStatus(
                    t(stryMutAct_9fa48("8491") ? "" : (stryCov_9fa48("8491"), "status_processing")) +
                        (stryMutAct_9fa48("8492") ? `` : (stryCov_9fa48("8492"), ` ${progress}%`)),
                    stryMutAct_9fa48("8493") ? "" : (stryCov_9fa48("8493"), "info")
                );
                await new Promise(
                    stryMutAct_9fa48("8494")
                        ? () => undefined
                        : (stryCov_9fa48("8494"), (r) => setTimeout(r, YIELD_DELAY_MS))
                );

                // Adaptive batching logic
                const dur = stryMutAct_9fa48("8495")
                    ? nowMs() + batchStart
                    : (stryCov_9fa48("8495"), nowMs() - batchStart);
                perfMonitor.record(
                    stryMutAct_9fa48("8496") ? "" : (stryCov_9fa48("8496"), "processChunk"),
                    batchItems.length,
                    dur,
                    stryMutAct_9fa48("8497")
                        ? {}
                        : (stryCov_9fa48("8497"),
                          {
                              batchSize: batchItems.length,
                          })
                );
                const msPerPara = stryMutAct_9fa48("8498")
                    ? dur * batchItems.length
                    : (stryCov_9fa48("8498"), dur / batchItems.length);
                const idealBatch = Math.floor(
                    stryMutAct_9fa48("8499")
                        ? TARGET_TIME_MS * msPerPara
                        : (stryCov_9fa48("8499"), TARGET_TIME_MS / msPerPara)
                );
                batchSize = stryMutAct_9fa48("8500")
                    ? Math.min(MIN_BATCH, Math.min(MAX_BATCH, Math.floor((batchSize + idealBatch) / 2)))
                    : (stryCov_9fa48("8500"),
                      Math.max(
                          MIN_BATCH,
                          stryMutAct_9fa48("8501")
                              ? Math.max(MAX_BATCH, Math.floor((batchSize + idealBatch) / 2))
                              : (stryCov_9fa48("8501"),
                                Math.min(
                                    MAX_BATCH,
                                    Math.floor(
                                        stryMutAct_9fa48("8502")
                                            ? (batchSize + idealBatch) * 2
                                            : (stryCov_9fa48("8502"),
                                              (stryMutAct_9fa48("8503")
                                                  ? batchSize - idealBatch
                                                  : (stryCov_9fa48("8503"), batchSize + idealBatch)) / 2)
                                    )
                                ))
                      ));
            }
        }

        // Finalni sync nakon izmena
        // eslint-disable-next-line office-addins/no-context-sync-in-loop
        await context.sync();
        const finalStats = stryMutAct_9fa48("8506")
            ? agg && emptyStats((opts.direction as ConvertStats["direction"]) || "auto")
            : stryMutAct_9fa48("8505")
              ? false
              : stryMutAct_9fa48("8504")
                ? true
                : (stryCov_9fa48("8504", "8505", "8506"),
                  agg ||
                      emptyStats(
                          stryMutAct_9fa48("8509")
                              ? (opts.direction as ConvertStats["direction"]) && "auto"
                              : stryMutAct_9fa48("8508")
                                ? false
                                : stryMutAct_9fa48("8507")
                                  ? true
                                  : (stryCov_9fa48("8507", "8508", "8509"),
                                    (opts.direction as ConvertStats["direction"]) ||
                                        (stryMutAct_9fa48("8510") ? "" : (stryCov_9fa48("8510"), "auto")))
                      ));
        finalStats.timingMs = stryMutAct_9fa48("8511") ? nowMs() + t0 : (stryCov_9fa48("8511"), nowMs() - t0);
        return stryMutAct_9fa48("8512")
            ? {}
            : (stryCov_9fa48("8512"),
              {
                  type: labelForDirection(finalStats.direction),
                  stats: finalStats,
              });
    }
}
