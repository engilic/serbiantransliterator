// @ts-nocheck
// src/taskpane/app/selection.ts
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
import { state } from "./state";
import { invalidatePreviewCache } from "./preview/cache";
import { t, tPlural } from "../../shared/i18n";
import { getSettingsFromUi } from "./settings/getters";

// [MAX3] Fluent UI SVG Ikone
const ICON_DOC = stryMutAct_9fa48("6101")
    ? ``
    : (stryCov_9fa48("6101"),
      `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`);
const ICON_SEL = stryMutAct_9fa48("6102")
    ? ``
    : (stryCov_9fa48("6102"),
      `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M2.5 4v3h2V5h15v2h2V4h-19zm19 16v-3h-2v2H4.5v-2h-2v3h19zM6 10h12v4H6v-4z"/></svg>`);
let cachedDocInfo: {
    count: number;
    sample: string;
    hasLat: boolean;
    hasCyr: boolean;
} | null = null;
let lastDocCheck = 0;
const DOC_INFO_CACHE_MS = 5000;
export function onSelectionChange() {
    if (stryMutAct_9fa48("6103")) {
        {
        }
    } else {
        stryCov_9fa48("6103");
        invalidatePreviewCache();
        if (
            stryMutAct_9fa48("6105")
                ? false
                : stryMutAct_9fa48("6104")
                  ? true
                  : (stryCov_9fa48("6104", "6105"), state.selectionTimeout)
        )
            clearTimeout(state.selectionTimeout);
        state.selectionTimeout = setTimeout(() => {
            if (stryMutAct_9fa48("6106")) {
                {
                }
            } else {
                stryCov_9fa48("6106");
                void checkSelectionAndUpdateButtons();
            }
        }, 200);
    }
}
export function getSelectedTextAsync(): Promise<string> {
    if (stryMutAct_9fa48("6107")) {
        {
        }
    } else {
        stryCov_9fa48("6107");
        return new Promise((resolve) => {
            if (stryMutAct_9fa48("6108")) {
                {
                }
            } else {
                stryCov_9fa48("6108");
                if (
                    stryMutAct_9fa48("6111")
                        ? !Office.context && !Office.context.document
                        : stryMutAct_9fa48("6110")
                          ? false
                          : stryMutAct_9fa48("6109")
                            ? true
                            : (stryCov_9fa48("6109", "6110", "6111"),
                              (stryMutAct_9fa48("6112")
                                  ? Office.context
                                  : (stryCov_9fa48("6112"), !Office.context)) ||
                                  (stryMutAct_9fa48("6113")
                                      ? Office.context.document
                                      : (stryCov_9fa48("6113"), !Office.context.document)))
                ) {
                    if (stryMutAct_9fa48("6114")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6114");
                        resolve(stryMutAct_9fa48("6115") ? "Stryker was here!" : (stryCov_9fa48("6115"), ""));
                        return;
                    }
                }
                Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
                    if (stryMutAct_9fa48("6116")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6116");
                        if (
                            stryMutAct_9fa48("6119")
                                ? result.status !== Office.AsyncResultStatus.Succeeded
                                : stryMutAct_9fa48("6118")
                                  ? false
                                  : stryMutAct_9fa48("6117")
                                    ? true
                                    : (stryCov_9fa48("6117", "6118", "6119"),
                                      result.status === Office.AsyncResultStatus.Succeeded)
                        ) {
                            if (stryMutAct_9fa48("6120")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6120");
                                resolve(
                                    String(
                                        stryMutAct_9fa48("6121")
                                            ? result.value && ""
                                            : (stryCov_9fa48("6121"),
                                              result.value ??
                                                  (stryMutAct_9fa48("6122")
                                                      ? "Stryker was here!"
                                                      : (stryCov_9fa48("6122"), "")))
                                    )
                                );
                            }
                        } else {
                            if (stryMutAct_9fa48("6123")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6123");
                                resolve(
                                    stryMutAct_9fa48("6124")
                                        ? "Stryker was here!"
                                        : (stryCov_9fa48("6124"), "")
                                );
                            }
                        }
                    }
                });
            }
        });
    }
}
function countWords(text: string): number {
    if (stryMutAct_9fa48("6125")) {
        {
        }
    } else {
        stryCov_9fa48("6125");
        if (
            stryMutAct_9fa48("6128")
                ? false
                : stryMutAct_9fa48("6127")
                  ? true
                  : stryMutAct_9fa48("6126")
                    ? text
                    : (stryCov_9fa48("6126", "6127", "6128"), !text)
        )
            return 0;
        const matches = text.match(
            stryMutAct_9fa48("6138")
                ? /[\p{L}\p{N}]+(?:[-’'][\p{L}\P{N}]+)*/gu
                : stryMutAct_9fa48("6137")
                  ? /[\p{L}\p{N}]+(?:[-’'][\P{L}\p{N}]+)*/gu
                  : stryMutAct_9fa48("6136")
                    ? /[\p{L}\p{N}]+(?:[-’'][^\p{L}\p{N}]+)*/gu
                    : stryMutAct_9fa48("6135")
                      ? /[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}])*/gu
                      : stryMutAct_9fa48("6134")
                        ? /[\p{L}\p{N}]+(?:[^-’'][\p{L}\p{N}]+)*/gu
                        : stryMutAct_9fa48("6133")
                          ? /[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)/gu
                          : stryMutAct_9fa48("6132")
                            ? /[\p{L}\P{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu
                            : stryMutAct_9fa48("6131")
                              ? /[\P{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu
                              : stryMutAct_9fa48("6130")
                                ? /[^\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu
                                : stryMutAct_9fa48("6129")
                                  ? /[\p{L}\p{N}](?:[-’'][\p{L}\p{N}]+)*/gu
                                  : (stryCov_9fa48(
                                        "6129",
                                        "6130",
                                        "6131",
                                        "6132",
                                        "6133",
                                        "6134",
                                        "6135",
                                        "6136",
                                        "6137",
                                        "6138"
                                    ),
                                    /[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu)
        );
        return matches ? matches.length : 0;
    }
}
function countNonSpaceChars(text: string): number {
    if (stryMutAct_9fa48("6139")) {
        {
        }
    } else {
        stryCov_9fa48("6139");
        return text.replace(
            stryMutAct_9fa48("6140") ? /\S/g : (stryCov_9fa48("6140"), /\s/g),
            stryMutAct_9fa48("6141") ? "Stryker was here!" : (stryCov_9fa48("6141"), "")
        ).length;
    }
}
function hasScriptContent(text: string) {
    if (stryMutAct_9fa48("6142")) {
        {
        }
    } else {
        stryCov_9fa48("6142");
        const hasLat = (
            stryMutAct_9fa48("6143") ? /[^A-Za-zČčĆćĐđŠšŽž]/ : (stryCov_9fa48("6143"), /[A-Za-zČčĆćĐđŠšŽž]/)
        ).test(text);
        const hasCyr = (
            stryMutAct_9fa48("6144") ? /[^\u0400-\u052F]/ : (stryCov_9fa48("6144"), /[\u0400-\u052F]/)
        ).test(text);
        return stryMutAct_9fa48("6145")
            ? {}
            : (stryCov_9fa48("6145"),
              {
                  hasLat,
                  hasCyr,
              });
    }
}
function formatCompact(n: number): string {
    if (stryMutAct_9fa48("6146")) {
        {
        }
    } else {
        stryCov_9fa48("6146");
        if (
            stryMutAct_9fa48("6150")
                ? n >= 10000
                : stryMutAct_9fa48("6149")
                  ? n <= 10000
                  : stryMutAct_9fa48("6148")
                    ? false
                    : stryMutAct_9fa48("6147")
                      ? true
                      : (stryCov_9fa48("6147", "6148", "6149", "6150"), n < 10000)
        )
            return n.toString();
        if (
            stryMutAct_9fa48("6154")
                ? n >= 1000000
                : stryMutAct_9fa48("6153")
                  ? n <= 1000000
                  : stryMutAct_9fa48("6152")
                    ? false
                    : stryMutAct_9fa48("6151")
                      ? true
                      : (stryCov_9fa48("6151", "6152", "6153", "6154"), n < 1000000)
        )
            return (
                (stryMutAct_9fa48("6155") ? n * 1000 : (stryCov_9fa48("6155"), n / 1000))
                    .toFixed(1)
                    .replace(
                        stryMutAct_9fa48("6156") ? /\.0/ : (stryCov_9fa48("6156"), /\.0$/),
                        stryMutAct_9fa48("6157") ? "Stryker was here!" : (stryCov_9fa48("6157"), "")
                    ) + (stryMutAct_9fa48("6158") ? "" : (stryCov_9fa48("6158"), "k"))
            );
        return (
            (stryMutAct_9fa48("6159") ? n * 1000000 : (stryCov_9fa48("6159"), n / 1000000))
                .toFixed(1)
                .replace(
                    stryMutAct_9fa48("6160") ? /\.0/ : (stryCov_9fa48("6160"), /\.0$/),
                    stryMutAct_9fa48("6161") ? "Stryker was here!" : (stryCov_9fa48("6161"), "")
                ) + (stryMutAct_9fa48("6162") ? "" : (stryCov_9fa48("6162"), "M"))
        );
    }
}
async function getDocInfoAsync(
    forceRefresh = stryMutAct_9fa48("6163") ? true : (stryCov_9fa48("6163"), false)
): Promise<{
    count: number;
    sample: string;
    hasLat: boolean;
    hasCyr: boolean;
}> {
    if (stryMutAct_9fa48("6164")) {
        {
        }
    } else {
        stryCov_9fa48("6164");
        const now = Date.now();
        if (
            stryMutAct_9fa48("6167")
                ? (!forceRefresh && cachedDocInfo !== null) || now - lastDocCheck < DOC_INFO_CACHE_MS
                : stryMutAct_9fa48("6166")
                  ? false
                  : stryMutAct_9fa48("6165")
                    ? true
                    : (stryCov_9fa48("6165", "6166", "6167"),
                      (stryMutAct_9fa48("6169")
                          ? !forceRefresh || cachedDocInfo !== null
                          : stryMutAct_9fa48("6168")
                            ? true
                            : (stryCov_9fa48("6168", "6169"),
                              (stryMutAct_9fa48("6170")
                                  ? forceRefresh
                                  : (stryCov_9fa48("6170"), !forceRefresh)) &&
                                  (stryMutAct_9fa48("6172")
                                      ? cachedDocInfo === null
                                      : stryMutAct_9fa48("6171")
                                        ? true
                                        : (stryCov_9fa48("6171", "6172"), cachedDocInfo !== null)))) &&
                          (stryMutAct_9fa48("6175")
                              ? now - lastDocCheck >= DOC_INFO_CACHE_MS
                              : stryMutAct_9fa48("6174")
                                ? now - lastDocCheck <= DOC_INFO_CACHE_MS
                                : stryMutAct_9fa48("6173")
                                  ? true
                                  : (stryCov_9fa48("6173", "6174", "6175"),
                                    (stryMutAct_9fa48("6176")
                                        ? now + lastDocCheck
                                        : (stryCov_9fa48("6176"), now - lastDocCheck)) < DOC_INFO_CACHE_MS)))
        ) {
            if (stryMutAct_9fa48("6177")) {
                {
                }
            } else {
                stryCov_9fa48("6177");
                return cachedDocInfo;
            }
        }
        try {
            if (stryMutAct_9fa48("6178")) {
                {
                }
            } else {
                stryCov_9fa48("6178");
                return await Word.run(async (context) => {
                    if (stryMutAct_9fa48("6179")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6179");
                        const body = context.document.body;
                        body.load(stryMutAct_9fa48("6180") ? "" : (stryCov_9fa48("6180"), "text"));
                        await context.sync();
                        const text = stryMutAct_9fa48("6183")
                            ? body.text && ""
                            : stryMutAct_9fa48("6182")
                              ? false
                              : stryMutAct_9fa48("6181")
                                ? true
                                : (stryCov_9fa48("6181", "6182", "6183"),
                                  body.text ||
                                      (stryMutAct_9fa48("6184")
                                          ? "Stryker was here!"
                                          : (stryCov_9fa48("6184"), "")));
                        const count = countWords(text);
                        const sample = stryMutAct_9fa48("6185")
                            ? text
                            : (stryCov_9fa48("6185"), text.slice(0, 1000));
                        const { hasLat, hasCyr } = hasScriptContent(text);
                        cachedDocInfo = stryMutAct_9fa48("6186")
                            ? {}
                            : (stryCov_9fa48("6186"),
                              {
                                  count,
                                  sample,
                                  hasLat,
                                  hasCyr,
                              });
                        lastDocCheck = Date.now();
                        return cachedDocInfo;
                    }
                });
            }
        } catch {
            if (stryMutAct_9fa48("6187")) {
                {
                }
            } else {
                stryCov_9fa48("6187");
                return stryMutAct_9fa48("6188")
                    ? {}
                    : (stryCov_9fa48("6188"),
                      {
                          count: 0,
                          sample: stryMutAct_9fa48("6189")
                              ? "Stryker was here!"
                              : (stryCov_9fa48("6189"), ""),
                          hasLat: stryMutAct_9fa48("6190") ? true : (stryCov_9fa48("6190"), false),
                          hasCyr: stryMutAct_9fa48("6191") ? true : (stryCov_9fa48("6191"), false),
                      });
            }
        }
    }
}
type DetectionResult = {
    label: string;
    icon: string;
    asciiLevel: "safe" | "yellow" | "red";
    isAuto: boolean;
};
function getTargetScriptInfo(): DetectionResult {
    if (stryMutAct_9fa48("6192")) {
        {
        }
    } else {
        stryCov_9fa48("6192");
        const settings = getSettingsFromUi();
        const dir = settings.direction;
        if (
            stryMutAct_9fa48("6195")
                ? dir !== "lat-to-cyr"
                : stryMutAct_9fa48("6194")
                  ? false
                  : stryMutAct_9fa48("6193")
                    ? true
                    : (stryCov_9fa48("6193", "6194", "6195"),
                      dir === (stryMutAct_9fa48("6196") ? "" : (stryCov_9fa48("6196"), "lat-to-cyr")))
        )
            return stryMutAct_9fa48("6197")
                ? {}
                : (stryCov_9fa48("6197"),
                  {
                      label: t(stryMutAct_9fa48("6198") ? "" : (stryCov_9fa48("6198"), "live_target_cyr")),
                      icon: stryMutAct_9fa48("6199") ? "Stryker was here!" : (stryCov_9fa48("6199"), ""),
                      asciiLevel: stryMutAct_9fa48("6200") ? "" : (stryCov_9fa48("6200"), "safe"),
                      isAuto: stryMutAct_9fa48("6201") ? true : (stryCov_9fa48("6201"), false),
                  });
        if (
            stryMutAct_9fa48("6204")
                ? dir !== "cyr-to-lat"
                : stryMutAct_9fa48("6203")
                  ? false
                  : stryMutAct_9fa48("6202")
                    ? true
                    : (stryCov_9fa48("6202", "6203", "6204"),
                      dir === (stryMutAct_9fa48("6205") ? "" : (stryCov_9fa48("6205"), "cyr-to-lat")))
        )
            return stryMutAct_9fa48("6206")
                ? {}
                : (stryCov_9fa48("6206"),
                  {
                      label: t(stryMutAct_9fa48("6207") ? "" : (stryCov_9fa48("6207"), "live_target_lat")),
                      icon: stryMutAct_9fa48("6208") ? "Stryker was here!" : (stryCov_9fa48("6208"), ""),
                      asciiLevel: stryMutAct_9fa48("6209") ? "" : (stryCov_9fa48("6209"), "safe"),
                      isAuto: stryMutAct_9fa48("6210") ? true : (stryCov_9fa48("6210"), false),
                  });
        if (
            stryMutAct_9fa48("6213")
                ? dir !== "to-ascii"
                : stryMutAct_9fa48("6212")
                  ? false
                  : stryMutAct_9fa48("6211")
                    ? true
                    : (stryCov_9fa48("6211", "6212", "6213"),
                      dir === (stryMutAct_9fa48("6214") ? "" : (stryCov_9fa48("6214"), "to-ascii")))
        )
            return stryMutAct_9fa48("6215")
                ? {}
                : (stryCov_9fa48("6215"),
                  {
                      label: t(stryMutAct_9fa48("6216") ? "" : (stryCov_9fa48("6216"), "live_target_ascii")),
                      icon: stryMutAct_9fa48("6217") ? "Stryker was here!" : (stryCov_9fa48("6217"), ""),
                      asciiLevel: stryMutAct_9fa48("6218") ? "" : (stryCov_9fa48("6218"), "safe"),
                      isAuto: stryMutAct_9fa48("6219") ? true : (stryCov_9fa48("6219"), false),
                  });
        return stryMutAct_9fa48("6220")
            ? {}
            : (stryCov_9fa48("6220"),
              {
                  label: t(stryMutAct_9fa48("6221") ? "" : (stryCov_9fa48("6221"), "dir_auto")),
                  icon: stryMutAct_9fa48("6222") ? "Stryker was here!" : (stryCov_9fa48("6222"), ""),
                  asciiLevel: stryMutAct_9fa48("6223") ? "" : (stryCov_9fa48("6223"), "safe"),
                  isAuto: stryMutAct_9fa48("6224") ? false : (stryCov_9fa48("6224"), true),
              });
    }
}
function detectDirectionInfo(text: string): DetectionResult {
    if (stryMutAct_9fa48("6225")) {
        {
        }
    } else {
        stryCov_9fa48("6225");
        const safeText = stryMutAct_9fa48("6228")
            ? text && ""
            : stryMutAct_9fa48("6227")
              ? false
              : stryMutAct_9fa48("6226")
                ? true
                : (stryCov_9fa48("6226", "6227", "6228"),
                  text || (stryMutAct_9fa48("6229") ? "Stryker was here!" : (stryCov_9fa48("6229"), "")));
        let cyr = 0;
        let lat = 0;
        let latSr = 0;
        const sample = stryMutAct_9fa48("6230") ? safeText : (stryCov_9fa48("6230"), safeText.slice(0, 500));
        for (const char of sample) {
            if (stryMutAct_9fa48("6231")) {
                {
                }
            } else {
                stryCov_9fa48("6231");
                if (
                    stryMutAct_9fa48("6233")
                        ? false
                        : stryMutAct_9fa48("6232")
                          ? true
                          : (stryCov_9fa48("6232", "6233"),
                            (stryMutAct_9fa48("6234")
                                ? /[^a-zA-Z]/
                                : (stryCov_9fa48("6234"), /[a-zA-Z]/)
                            ).test(char))
                )
                    stryMutAct_9fa48("6235") ? lat-- : (stryCov_9fa48("6235"), lat++);
                if (
                    stryMutAct_9fa48("6237")
                        ? false
                        : stryMutAct_9fa48("6236")
                          ? true
                          : (stryCov_9fa48("6236", "6237"),
                            (stryMutAct_9fa48("6238")
                                ? /[^čćžšđČĆŽŠĐ]/
                                : (stryCov_9fa48("6238"), /[čćžšđČĆŽŠĐ]/)
                            ).test(char))
                ) {
                    if (stryMutAct_9fa48("6239")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6239");
                        stryMutAct_9fa48("6240") ? lat-- : (stryCov_9fa48("6240"), lat++);
                        stryMutAct_9fa48("6241") ? latSr-- : (stryCov_9fa48("6241"), latSr++);
                    }
                }
                if (
                    stryMutAct_9fa48("6243")
                        ? false
                        : stryMutAct_9fa48("6242")
                          ? true
                          : (stryCov_9fa48("6242", "6243"),
                            (stryMutAct_9fa48("6244")
                                ? /[^\u0400-\u04FF]/
                                : (stryCov_9fa48("6244"), /[\u0400-\u04FF]/)
                            ).test(char))
                )
                    stryMutAct_9fa48("6245") ? cyr-- : (stryCov_9fa48("6245"), cyr++);
            }
        }
        const total = stryMutAct_9fa48("6246") ? lat - cyr : (stryCov_9fa48("6246"), lat + cyr);
        const base: DetectionResult = stryMutAct_9fa48("6247")
            ? {}
            : (stryCov_9fa48("6247"),
              {
                  label: t(stryMutAct_9fa48("6248") ? "" : (stryCov_9fa48("6248"), "dir_auto")),
                  icon: stryMutAct_9fa48("6249") ? "Stryker was here!" : (stryCov_9fa48("6249"), ""),
                  asciiLevel: stryMutAct_9fa48("6250") ? "" : (stryCov_9fa48("6250"), "safe"),
                  isAuto: stryMutAct_9fa48("6251") ? false : (stryCov_9fa48("6251"), true),
              });
        if (
            stryMutAct_9fa48("6254")
                ? total !== 0
                : stryMutAct_9fa48("6253")
                  ? false
                  : stryMutAct_9fa48("6252")
                    ? true
                    : (stryCov_9fa48("6252", "6253", "6254"), total === 0)
        )
            return base;
        if (
            stryMutAct_9fa48("6258")
                ? cyr <= lat
                : stryMutAct_9fa48("6257")
                  ? cyr >= lat
                  : stryMutAct_9fa48("6256")
                    ? false
                    : stryMutAct_9fa48("6255")
                      ? true
                      : (stryCov_9fa48("6255", "6256", "6257", "6258"), cyr > lat)
        ) {
            if (stryMutAct_9fa48("6259")) {
                {
                }
            } else {
                stryCov_9fa48("6259");
                return stryMutAct_9fa48("6260")
                    ? {}
                    : (stryCov_9fa48("6260"),
                      {
                          label: t(
                              stryMutAct_9fa48("6261") ? "" : (stryCov_9fa48("6261"), "live_auto_to_lat")
                          ),
                          icon: stryMutAct_9fa48("6262") ? "Stryker was here!" : (stryCov_9fa48("6262"), ""),
                          asciiLevel: stryMutAct_9fa48("6263") ? "" : (stryCov_9fa48("6263"), "safe"),
                          isAuto: stryMutAct_9fa48("6264") ? false : (stryCov_9fa48("6264"), true),
                      });
            }
        }
        if (
            stryMutAct_9fa48("6268")
                ? lat <= 35
                : stryMutAct_9fa48("6267")
                  ? lat >= 35
                  : stryMutAct_9fa48("6266")
                    ? false
                    : stryMutAct_9fa48("6265")
                      ? true
                      : (stryCov_9fa48("6265", "6266", "6267", "6268"), lat > 35)
        ) {
            if (stryMutAct_9fa48("6269")) {
                {
                }
            } else {
                stryCov_9fa48("6269");
                const ratio = stryMutAct_9fa48("6270") ? latSr * lat : (stryCov_9fa48("6270"), latSr / lat);
                if (
                    stryMutAct_9fa48("6273")
                        ? ratio !== 0
                        : stryMutAct_9fa48("6272")
                          ? false
                          : stryMutAct_9fa48("6271")
                            ? true
                            : (stryCov_9fa48("6271", "6272", "6273"), ratio === 0)
                )
                    return stryMutAct_9fa48("6274")
                        ? {}
                        : (stryCov_9fa48("6274"),
                          {
                              label: t(
                                  stryMutAct_9fa48("6275") ? "" : (stryCov_9fa48("6275"), "live_auto_to_cyr")
                              ),
                              icon: stryMutAct_9fa48("6276")
                                  ? "Stryker was here!"
                                  : (stryCov_9fa48("6276"), ""),
                              asciiLevel: stryMutAct_9fa48("6277") ? "" : (stryCov_9fa48("6277"), "red"),
                              isAuto: stryMutAct_9fa48("6278") ? false : (stryCov_9fa48("6278"), true),
                          });
                if (
                    stryMutAct_9fa48("6282")
                        ? ratio >= 0.012
                        : stryMutAct_9fa48("6281")
                          ? ratio <= 0.012
                          : stryMutAct_9fa48("6280")
                            ? false
                            : stryMutAct_9fa48("6279")
                              ? true
                              : (stryCov_9fa48("6279", "6280", "6281", "6282"), ratio < 0.012)
                )
                    return stryMutAct_9fa48("6283")
                        ? {}
                        : (stryCov_9fa48("6283"),
                          {
                              label: t(
                                  stryMutAct_9fa48("6284") ? "" : (stryCov_9fa48("6284"), "live_auto_to_cyr")
                              ),
                              icon: stryMutAct_9fa48("6285")
                                  ? "Stryker was here!"
                                  : (stryCov_9fa48("6285"), ""),
                              asciiLevel: stryMutAct_9fa48("6286") ? "" : (stryCov_9fa48("6286"), "yellow"),
                              isAuto: stryMutAct_9fa48("6287") ? false : (stryCov_9fa48("6287"), true),
                          });
            }
        }
        return stryMutAct_9fa48("6288")
            ? {}
            : (stryCov_9fa48("6288"),
              {
                  label: t(stryMutAct_9fa48("6289") ? "" : (stryCov_9fa48("6289"), "live_auto_to_cyr")),
                  icon: stryMutAct_9fa48("6290") ? "Stryker was here!" : (stryCov_9fa48("6290"), ""),
                  asciiLevel: stryMutAct_9fa48("6291") ? "" : (stryCov_9fa48("6291"), "safe"),
                  isAuto: stryMutAct_9fa48("6292") ? false : (stryCov_9fa48("6292"), true),
              });
    }
}
export async function checkSelectionAndUpdateButtons() {
    if (stryMutAct_9fa48("6293")) {
        {
        }
    } else {
        stryCov_9fa48("6293");
        try {
            if (stryMutAct_9fa48("6294")) {
                {
                }
            } else {
                stryCov_9fa48("6294");
                const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
                const prevBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;
                const liveStatus = document.getElementById(
                    stryMutAct_9fa48("6295") ? "" : (stryCov_9fa48("6295"), "liveStatus")
                );
                const liveTextLeft = document.getElementById(
                    stryMutAct_9fa48("6296") ? "" : (stryCov_9fa48("6296"), "liveTextLeft")
                );
                const liveTextRight = document.getElementById(
                    stryMutAct_9fa48("6297") ? "" : (stryCov_9fa48("6297"), "liveTextRight")
                );
                const liveAscii = document.getElementById(
                    stryMutAct_9fa48("6298") ? "" : (stryCov_9fa48("6298"), "liveAscii")
                );
                const liveAutoIcon = document.getElementById(
                    stryMutAct_9fa48("6299") ? "" : (stryCov_9fa48("6299"), "liveAutoIcon")
                );
                const liveIconLeft = document.getElementById(
                    stryMutAct_9fa48("6300") ? "" : (stryCov_9fa48("6300"), "liveIconLeft")
                );
                if (
                    stryMutAct_9fa48("6303")
                        ? !runBtn && !prevBtn
                        : stryMutAct_9fa48("6302")
                          ? false
                          : stryMutAct_9fa48("6301")
                            ? true
                            : (stryCov_9fa48("6301", "6302", "6303"),
                              (stryMutAct_9fa48("6304") ? runBtn : (stryCov_9fa48("6304"), !runBtn)) ||
                                  (stryMutAct_9fa48("6305") ? prevBtn : (stryCov_9fa48("6305"), !prevBtn)))
                )
                    return;
                const rawText = await getSelectedTextAsync();
                const isSelectionMode = stryMutAct_9fa48("6309")
                    ? rawText.trim().length <= 0
                    : stryMutAct_9fa48("6308")
                      ? rawText.trim().length >= 0
                      : stryMutAct_9fa48("6307")
                        ? false
                        : stryMutAct_9fa48("6306")
                          ? true
                          : (stryCov_9fa48("6306", "6307", "6308", "6309"),
                            (stryMutAct_9fa48("6310")
                                ? rawText.length
                                : (stryCov_9fa48("6310"), rawText.trim().length)) > 0);
                const settings = getSettingsFromUi();
                let detection: DetectionResult = getTargetScriptInfo();
                if (
                    stryMutAct_9fa48("6312")
                        ? false
                        : stryMutAct_9fa48("6311")
                          ? true
                          : (stryCov_9fa48("6311", "6312"), isSelectionMode)
                ) {
                    if (stryMutAct_9fa48("6313")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6313");
                        if (
                            stryMutAct_9fa48("6316")
                                ? settings.direction !== "auto"
                                : stryMutAct_9fa48("6315")
                                  ? false
                                  : stryMutAct_9fa48("6314")
                                    ? true
                                    : (stryCov_9fa48("6314", "6315", "6316"),
                                      settings.direction ===
                                          (stryMutAct_9fa48("6317") ? "" : (stryCov_9fa48("6317"), "auto")))
                        ) {
                            if (stryMutAct_9fa48("6318")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6318");
                                detection = detectDirectionInfo(rawText);
                            }
                        }
                    }
                } else {
                    if (stryMutAct_9fa48("6319")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6319");
                        const docInfo = await getDocInfoAsync(
                            stryMutAct_9fa48("6322")
                                ? cachedDocInfo !== null
                                : stryMutAct_9fa48("6321")
                                  ? false
                                  : stryMutAct_9fa48("6320")
                                    ? true
                                    : (stryCov_9fa48("6320", "6321", "6322"), cachedDocInfo === null)
                        );
                        const docSample = stryMutAct_9fa48("6325")
                            ? docInfo?.sample && ""
                            : stryMutAct_9fa48("6324")
                              ? false
                              : stryMutAct_9fa48("6323")
                                ? true
                                : (stryCov_9fa48("6323", "6324", "6325"),
                                  (stryMutAct_9fa48("6326")
                                      ? docInfo.sample
                                      : (stryCov_9fa48("6326"), docInfo?.sample)) ||
                                      (stryMutAct_9fa48("6327")
                                          ? "Stryker was here!"
                                          : (stryCov_9fa48("6327"), "")));
                        if (
                            stryMutAct_9fa48("6330")
                                ? settings.direction !== "auto"
                                : stryMutAct_9fa48("6329")
                                  ? false
                                  : stryMutAct_9fa48("6328")
                                    ? true
                                    : (stryCov_9fa48("6328", "6329", "6330"),
                                      settings.direction ===
                                          (stryMutAct_9fa48("6331") ? "" : (stryCov_9fa48("6331"), "auto")))
                        ) {
                            if (stryMutAct_9fa48("6332")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6332");
                                detection = detectDirectionInfo(docSample);
                            }
                        }
                    }
                }
                if (
                    stryMutAct_9fa48("6335")
                        ? settings.direction !== "to-ascii"
                        : stryMutAct_9fa48("6334")
                          ? false
                          : stryMutAct_9fa48("6333")
                            ? true
                            : (stryCov_9fa48("6333", "6334", "6335"),
                              settings.direction ===
                                  (stryMutAct_9fa48("6336") ? "" : (stryCov_9fa48("6336"), "to-ascii")))
                )
                    detection.asciiLevel = stryMutAct_9fa48("6337") ? "" : (stryCov_9fa48("6337"), "safe");
                let shouldEnable = stryMutAct_9fa48("6338") ? true : (stryCov_9fa48("6338"), false);
                const contentInfo = isSelectionMode
                    ? hasScriptContent(rawText)
                    : stryMutAct_9fa48("6341")
                      ? cachedDocInfo && {
                            hasLat: false,
                            hasCyr: false,
                        }
                      : stryMutAct_9fa48("6340")
                        ? false
                        : stryMutAct_9fa48("6339")
                          ? true
                          : (stryCov_9fa48("6339", "6340", "6341"),
                            cachedDocInfo ||
                                (stryMutAct_9fa48("6342")
                                    ? {}
                                    : (stryCov_9fa48("6342"),
                                      {
                                          hasLat: stryMutAct_9fa48("6343")
                                              ? true
                                              : (stryCov_9fa48("6343"), false),
                                          hasCyr: stryMutAct_9fa48("6344")
                                              ? true
                                              : (stryCov_9fa48("6344"), false),
                                      })));
                if (
                    stryMutAct_9fa48("6347")
                        ? settings.direction !== "lat-to-cyr"
                        : stryMutAct_9fa48("6346")
                          ? false
                          : stryMutAct_9fa48("6345")
                            ? true
                            : (stryCov_9fa48("6345", "6346", "6347"),
                              settings.direction ===
                                  (stryMutAct_9fa48("6348") ? "" : (stryCov_9fa48("6348"), "lat-to-cyr")))
                )
                    shouldEnable = stryMutAct_9fa48("6349")
                        ? !contentInfo.hasLat
                        : (stryCov_9fa48("6349"),
                          !(stryMutAct_9fa48("6350")
                              ? contentInfo.hasLat
                              : (stryCov_9fa48("6350"), !contentInfo.hasLat)));
                else if (
                    stryMutAct_9fa48("6353")
                        ? settings.direction !== "cyr-to-lat"
                        : stryMutAct_9fa48("6352")
                          ? false
                          : stryMutAct_9fa48("6351")
                            ? true
                            : (stryCov_9fa48("6351", "6352", "6353"),
                              settings.direction ===
                                  (stryMutAct_9fa48("6354") ? "" : (stryCov_9fa48("6354"), "cyr-to-lat")))
                )
                    shouldEnable = stryMutAct_9fa48("6355")
                        ? !contentInfo.hasCyr
                        : (stryCov_9fa48("6355"),
                          !(stryMutAct_9fa48("6356")
                              ? contentInfo.hasCyr
                              : (stryCov_9fa48("6356"), !contentInfo.hasCyr)));
                else
                    shouldEnable = stryMutAct_9fa48("6357")
                        ? !(contentInfo.hasLat || contentInfo.hasCyr)
                        : (stryCov_9fa48("6357"),
                          !(stryMutAct_9fa48("6358")
                              ? contentInfo.hasLat || contentInfo.hasCyr
                              : (stryCov_9fa48("6358"),
                                !(stryMutAct_9fa48("6361")
                                    ? contentInfo.hasLat && contentInfo.hasCyr
                                    : stryMutAct_9fa48("6360")
                                      ? false
                                      : stryMutAct_9fa48("6359")
                                        ? true
                                        : (stryCov_9fa48("6359", "6360", "6361"),
                                          contentInfo.hasLat || contentInfo.hasCyr)))));
                if (
                    stryMutAct_9fa48("6364")
                        ? (liveStatus && liveTextLeft && liveTextRight && liveIconLeft) || liveAutoIcon
                        : stryMutAct_9fa48("6363")
                          ? false
                          : stryMutAct_9fa48("6362")
                            ? true
                            : (stryCov_9fa48("6362", "6363", "6364"),
                              (stryMutAct_9fa48("6366")
                                  ? (liveStatus && liveTextLeft && liveTextRight) || liveIconLeft
                                  : stryMutAct_9fa48("6365")
                                    ? true
                                    : (stryCov_9fa48("6365", "6366"),
                                      (stryMutAct_9fa48("6368")
                                          ? (liveStatus && liveTextLeft) || liveTextRight
                                          : stryMutAct_9fa48("6367")
                                            ? true
                                            : (stryCov_9fa48("6367", "6368"),
                                              (stryMutAct_9fa48("6370")
                                                  ? liveStatus || liveTextLeft
                                                  : stryMutAct_9fa48("6369")
                                                    ? true
                                                    : (stryCov_9fa48("6369", "6370"),
                                                      liveStatus && liveTextLeft)) && liveTextRight)) &&
                                          liveIconLeft)) && liveAutoIcon)
                ) {
                    if (stryMutAct_9fa48("6371")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6371");
                        liveStatus.style.display = stryMutAct_9fa48("6372")
                            ? ""
                            : (stryCov_9fa48("6372"), "flex");
                        if (
                            stryMutAct_9fa48("6374")
                                ? false
                                : stryMutAct_9fa48("6373")
                                  ? true
                                  : (stryCov_9fa48("6373", "6374"), isSelectionMode)
                        ) {
                            if (stryMutAct_9fa48("6375")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6375");
                                liveIconLeft.innerHTML = ICON_SEL;
                                const words = countWords(rawText);
                                const label = (
                                    stryMutAct_9fa48("6379")
                                        ? words < 1
                                        : stryMutAct_9fa48("6378")
                                          ? words > 1
                                          : stryMutAct_9fa48("6377")
                                            ? false
                                            : stryMutAct_9fa48("6376")
                                              ? true
                                              : (stryCov_9fa48("6376", "6377", "6378", "6379"), words >= 1)
                                )
                                    ? tPlural(
                                          stryMutAct_9fa48("6380")
                                              ? ""
                                              : (stryCov_9fa48("6380"), "word_count"),
                                          words
                                      )
                                    : tPlural(
                                          stryMutAct_9fa48("6381")
                                              ? ""
                                              : (stryCov_9fa48("6381"), "char_count"),
                                          countNonSpaceChars(rawText)
                                      );
                                liveTextLeft.textContent = t(
                                    stryMutAct_9fa48("6382") ? "" : (stryCov_9fa48("6382"), "live_sel_words"),
                                    label
                                );
                            }
                        } else {
                            if (stryMutAct_9fa48("6383")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6383");
                                liveIconLeft.innerHTML = ICON_DOC;
                                const docInfo = stryMutAct_9fa48("6386")
                                    ? cachedDocInfo && {
                                          count: 0,
                                      }
                                    : stryMutAct_9fa48("6385")
                                      ? false
                                      : stryMutAct_9fa48("6384")
                                        ? true
                                        : (stryCov_9fa48("6384", "6385", "6386"),
                                          cachedDocInfo ||
                                              (stryMutAct_9fa48("6387")
                                                  ? {}
                                                  : (stryCov_9fa48("6387"),
                                                    {
                                                        count: 0,
                                                    })));
                                liveTextLeft.textContent = t(
                                    stryMutAct_9fa48("6388") ? "" : (stryCov_9fa48("6388"), "live_doc_words"),
                                    tPlural(
                                        stryMutAct_9fa48("6389") ? "" : (stryCov_9fa48("6389"), "word_count"),
                                        docInfo.count
                                    )
                                );
                            }
                        }
                        liveTextRight.textContent = detection.label;
                        liveAutoIcon.style.display = detection.isAuto
                            ? stryMutAct_9fa48("6390")
                                ? ""
                                : (stryCov_9fa48("6390"), "inline-block")
                            : stryMutAct_9fa48("6391")
                              ? ""
                              : (stryCov_9fa48("6391"), "none");
                        if (
                            stryMutAct_9fa48("6393")
                                ? false
                                : stryMutAct_9fa48("6392")
                                  ? true
                                  : (stryCov_9fa48("6392", "6393"), liveAscii)
                        ) {
                            if (stryMutAct_9fa48("6394")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6394");
                                liveAscii.className = stryMutAct_9fa48("6395")
                                    ? ""
                                    : (stryCov_9fa48("6395"), "live-ascii");
                                if (
                                    stryMutAct_9fa48("6398")
                                        ? detection.asciiLevel !== "red"
                                        : stryMutAct_9fa48("6397")
                                          ? false
                                          : stryMutAct_9fa48("6396")
                                            ? true
                                            : (stryCov_9fa48("6396", "6397", "6398"),
                                              detection.asciiLevel ===
                                                  (stryMutAct_9fa48("6399")
                                                      ? ""
                                                      : (stryCov_9fa48("6399"), "red")))
                                )
                                    liveAscii.classList.add(
                                        stryMutAct_9fa48("6400") ? "" : (stryCov_9fa48("6400"), "warning-red")
                                    );
                                else if (
                                    stryMutAct_9fa48("6403")
                                        ? detection.asciiLevel !== "yellow"
                                        : stryMutAct_9fa48("6402")
                                          ? false
                                          : stryMutAct_9fa48("6401")
                                            ? true
                                            : (stryCov_9fa48("6401", "6402", "6403"),
                                              detection.asciiLevel ===
                                                  (stryMutAct_9fa48("6404")
                                                      ? ""
                                                      : (stryCov_9fa48("6404"), "yellow")))
                                )
                                    liveAscii.classList.add(
                                        stryMutAct_9fa48("6405")
                                            ? ""
                                            : (stryCov_9fa48("6405"), "warning-yellow")
                                    );
                                liveAscii.style.display = stryMutAct_9fa48("6406")
                                    ? ""
                                    : (stryCov_9fa48("6406"), "block");
                            }
                        }
                        if (
                            stryMutAct_9fa48("6408")
                                ? false
                                : stryMutAct_9fa48("6407")
                                  ? true
                                  : (stryCov_9fa48("6407", "6408"), shouldEnable)
                        ) {
                            if (stryMutAct_9fa48("6409")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6409");
                                liveStatus.style.opacity = stryMutAct_9fa48("6410")
                                    ? ""
                                    : (stryCov_9fa48("6410"), "1");
                                liveIconLeft.style.color = stryMutAct_9fa48("6411")
                                    ? ""
                                    : (stryCov_9fa48("6411"), "var(--colorBrandForeground1)");
                                runBtn.disabled = stryMutAct_9fa48("6412")
                                    ? true
                                    : (stryCov_9fa48("6412"), false);
                                prevBtn.disabled = stryMutAct_9fa48("6413")
                                    ? true
                                    : (stryCov_9fa48("6413"), false);
                                runBtn.classList.add(
                                    stryMutAct_9fa48("6414") ? "" : (stryCov_9fa48("6414"), "pulse-action")
                                );
                            }
                        } else {
                            if (stryMutAct_9fa48("6415")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6415");
                                liveStatus.style.opacity = stryMutAct_9fa48("6416")
                                    ? ""
                                    : (stryCov_9fa48("6416"), "0.7");
                                liveIconLeft.style.color = stryMutAct_9fa48("6417")
                                    ? ""
                                    : (stryCov_9fa48("6417"), "inherit");
                                runBtn.disabled = stryMutAct_9fa48("6418")
                                    ? false
                                    : (stryCov_9fa48("6418"), true);
                                prevBtn.disabled = stryMutAct_9fa48("6419")
                                    ? false
                                    : (stryCov_9fa48("6419"), true);
                                runBtn.classList.remove(
                                    stryMutAct_9fa48("6420") ? "" : (stryCov_9fa48("6420"), "pulse-action")
                                );
                            }
                        }
                    }
                }
            }
        } catch (e) {
            if (stryMutAct_9fa48("6421")) {
                {
                }
            } else {
                stryCov_9fa48("6421");
                console.error(
                    stryMutAct_9fa48("6422") ? "" : (stryCov_9fa48("6422"), "Error updating UI:"),
                    e
                );
            }
        }
    }
}
export function normalizeWeirdBreaks(s: string): string {
    if (stryMutAct_9fa48("6423")) {
        {
        }
    } else {
        stryCov_9fa48("6423");
        return String(
            stryMutAct_9fa48("6426")
                ? s && ""
                : stryMutAct_9fa48("6425")
                  ? false
                  : stryMutAct_9fa48("6424")
                    ? true
                    : (stryCov_9fa48("6424", "6425", "6426"),
                      s || (stryMutAct_9fa48("6427") ? "Stryker was here!" : (stryCov_9fa48("6427"), "")))
        )
            .replace(/\u000b/g, stryMutAct_9fa48("6428") ? "" : (stryCov_9fa48("6428"), "\n"))
            .replace(/\u000c/g, stryMutAct_9fa48("6429") ? "" : (stryCov_9fa48("6429"), "\n"));
    }
}
export function normalizeNewlines(s: string): string {
    if (stryMutAct_9fa48("6430")) {
        {
        }
    } else {
        stryCov_9fa48("6430");
        return normalizeWeirdBreaks(s)
            .replace(/\r\n/g, stryMutAct_9fa48("6431") ? "" : (stryCov_9fa48("6431"), "\n"))
            .replace(/\r/g, stryMutAct_9fa48("6432") ? "" : (stryCov_9fa48("6432"), "\n"));
    }
}

/**
 * [HOTFIX] Normalize-safe hash funkcija
 */
export function normalizeForSelectionHash(s: unknown): string {
    if (stryMutAct_9fa48("6433")) {
        {
        }
    } else {
        stryCov_9fa48("6433");
        const text = String(
            stryMutAct_9fa48("6436")
                ? s && ""
                : stryMutAct_9fa48("6435")
                  ? false
                  : stryMutAct_9fa48("6434")
                    ? true
                    : (stryCov_9fa48("6434", "6435", "6436"),
                      s || (stryMutAct_9fa48("6437") ? "Stryker was here!" : (stryCov_9fa48("6437"), "")))
        );
        const cleaned = normalizeNewlines(text);
        let normalized = cleaned; // Default na nenormalizovan

        // [FIX] Provera postojanja funkcije pre poziva
        if (
            stryMutAct_9fa48("6440")
                ? typeof cleaned.normalize !== "function"
                : stryMutAct_9fa48("6439")
                  ? false
                  : stryMutAct_9fa48("6438")
                    ? true
                    : (stryCov_9fa48("6438", "6439", "6440"),
                      typeof cleaned.normalize ===
                          (stryMutAct_9fa48("6441") ? "" : (stryCov_9fa48("6441"), "function")))
        ) {
            if (stryMutAct_9fa48("6442")) {
                {
                }
            } else {
                stryCov_9fa48("6442");
                try {
                    if (stryMutAct_9fa48("6443")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6443");
                        normalized = cleaned.normalize(
                            stryMutAct_9fa48("6444") ? "" : (stryCov_9fa48("6444"), "NFC")
                        );
                    }
                } catch (e) {
                    if (stryMutAct_9fa48("6445")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6445");
                        console.warn(
                            stryMutAct_9fa48("6446")
                                ? ""
                                : (stryCov_9fa48("6446"),
                                  "Normalize failed in hashing, falling back to unnormalized segment."),
                            e
                        );
                    }
                }
            }
        }
        return normalized
            .replace(/\u0007/g, stryMutAct_9fa48("6447") ? "Stryker was here!" : (stryCov_9fa48("6447"), ""))
            .replace(
                stryMutAct_9fa48("6449")
                    ? /\n$/g
                    : stryMutAct_9fa48("6448")
                      ? /\n+/g
                      : (stryCov_9fa48("6448", "6449"), /\n+$/g),
                stryMutAct_9fa48("6450") ? "Stryker was here!" : (stryCov_9fa48("6450"), "")
            );
    }
}
interface CryptoSubtle {
    subtle?: {
        digest: (algorithm: string, data: BufferSource) => Promise<ArrayBuffer>;
    };
}
export async function sha256Hex(str: string): Promise<string> {
    if (stryMutAct_9fa48("6451")) {
        {
        }
    } else {
        stryCov_9fa48("6451");
        try {
            if (stryMutAct_9fa48("6452")) {
                {
                }
            } else {
                stryCov_9fa48("6452");
                const cryptoSubtle = globalThis.crypto as CryptoSubtle | undefined;
                if (
                    stryMutAct_9fa48("6455")
                        ? false
                        : stryMutAct_9fa48("6454")
                          ? true
                          : stryMutAct_9fa48("6453")
                            ? cryptoSubtle?.subtle
                            : (stryCov_9fa48("6453", "6454", "6455"),
                              !(stryMutAct_9fa48("6456")
                                  ? cryptoSubtle.subtle
                                  : (stryCov_9fa48("6456"), cryptoSubtle?.subtle)))
                )
                    return fnv1a32(str);
                const enc = new TextEncoder();
                const buf = await cryptoSubtle.subtle.digest(
                    stryMutAct_9fa48("6457") ? "" : (stryCov_9fa48("6457"), "SHA-256"),
                    enc.encode(str)
                );
                const bytes = new Uint8Array(buf);
                return Array.from(bytes)
                    .map(
                        stryMutAct_9fa48("6458")
                            ? () => undefined
                            : (stryCov_9fa48("6458"),
                              (b) =>
                                  b
                                      .toString(16)
                                      .padStart(
                                          2,
                                          stryMutAct_9fa48("6459") ? "" : (stryCov_9fa48("6459"), "0")
                                      ))
                    )
                    .join(stryMutAct_9fa48("6460") ? "Stryker was here!" : (stryCov_9fa48("6460"), ""));
            }
        } catch {
            if (stryMutAct_9fa48("6461")) {
                {
                }
            } else {
                stryCov_9fa48("6461");
                return fnv1a32(str);
            }
        }
    }
}
export function fnv1a32(str: string): string {
    if (stryMutAct_9fa48("6462")) {
        {
        }
    } else {
        stryCov_9fa48("6462");
        let h = 0x811c9dc5;
        for (
            let i = 0;
            stryMutAct_9fa48("6465")
                ? i >= str.length
                : stryMutAct_9fa48("6464")
                  ? i <= str.length
                  : stryMutAct_9fa48("6463")
                    ? false
                    : (stryCov_9fa48("6463", "6464", "6465"), i < str.length);
            stryMutAct_9fa48("6466") ? i-- : (stryCov_9fa48("6466"), i++)
        ) {
            if (stryMutAct_9fa48("6467")) {
                {
                }
            } else {
                stryCov_9fa48("6467");
                h ^= str.charCodeAt(i);
                h = Math.imul(h, 0x01000193);
            }
        }
        return (h >>> 0)
            .toString(16)
            .padStart(8, stryMutAct_9fa48("6468") ? "" : (stryCov_9fa48("6468"), "0"));
    }
}
