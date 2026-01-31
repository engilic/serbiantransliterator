// @ts-nocheck
// src/taskpane/app/preview/convertPreviewPlain.ts
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
import { convertPlainText, type Direction } from "../../../core/textCore";
import { createInitialCodeState, transformTextRespectingCode } from "../../../shared/ooxml/code";
// UKLONJENI importi: formatSerbianDates, removeMultipleSpaces, toAscii
import { normalizeWeirdBreaks } from "../selection";
import type { UiSettings } from "../types";

// Lokalni toAscii (pošto smo obrisali format.ts)
function toAscii(text: string): string {
    if (stryMutAct_9fa48("5787")) {
        {
        }
    } else {
        stryCov_9fa48("5787");
        const map: Record<string, string> = stryMutAct_9fa48("5788")
            ? {}
            : (stryCov_9fa48("5788"),
              {
                  č: stryMutAct_9fa48("5789") ? "" : (stryCov_9fa48("5789"), "c"),
                  ć: stryMutAct_9fa48("5790") ? "" : (stryCov_9fa48("5790"), "c"),
                  š: stryMutAct_9fa48("5791") ? "" : (stryCov_9fa48("5791"), "s"),
                  đ: stryMutAct_9fa48("5792") ? "" : (stryCov_9fa48("5792"), "dj"),
                  ž: stryMutAct_9fa48("5793") ? "" : (stryCov_9fa48("5793"), "z"),
                  Č: stryMutAct_9fa48("5794") ? "" : (stryCov_9fa48("5794"), "C"),
                  Ć: stryMutAct_9fa48("5795") ? "" : (stryCov_9fa48("5795"), "C"),
                  Š: stryMutAct_9fa48("5796") ? "" : (stryCov_9fa48("5796"), "S"),
                  Đ: stryMutAct_9fa48("5797") ? "" : (stryCov_9fa48("5797"), "Dj"),
                  Ž: stryMutAct_9fa48("5798") ? "" : (stryCov_9fa48("5798"), "Z"),
              });
        return text.replace(
            stryMutAct_9fa48("5799") ? /[^čćšđžČĆŠĐŽ]/g : (stryCov_9fa48("5799"), /[čćšđžČĆŠĐŽ]/g),
            stryMutAct_9fa48("5800")
                ? () => undefined
                : (stryCov_9fa48("5800"),
                  (m) => (stryMutAct_9fa48("5801") ? map[m] && m : (stryCov_9fa48("5801"), map[m] ?? m)))
        );
    }
}
export function convertTextForPreviewPlain(
    input: string,
    s: UiSettings,
    userProtected: string[]
): {
    out: string;
    type: string;
} {
    if (stryMutAct_9fa48("5802")) {
        {
        }
    } else {
        stryCov_9fa48("5802");
        let temp = normalizeWeirdBreaks(
            stryMutAct_9fa48("5803")
                ? input && ""
                : (stryCov_9fa48("5803"),
                  input ?? (stryMutAct_9fa48("5804") ? "Stryker was here!" : (stryCov_9fa48("5804"), "")))
        );

        // Pošto smo izbacili fixDoubleSpaces i formatDates, transformFn je sada identitet (samo vraća input)
        // Ali ako imamo preserveCodeBlocks, i dalje moramo da parsiramo kod.
        // Zato zadržavamo strukturu, ali transformFn ne radi ništa osim što postoji.

        const applyFixesOutsideCode = (txt: string) => {
            if (stryMutAct_9fa48("5805")) {
                {
                }
            } else {
                stryCov_9fa48("5805");
                // Ovde je ranije bilo removeMultipleSpaces i formatDates.
                // Sada samo vraćamo tekst.
                return txt;
            }
        };
        if (
            stryMutAct_9fa48("5807")
                ? false
                : stryMutAct_9fa48("5806")
                  ? true
                  : (stryCov_9fa48("5806", "5807"), s.preserveCodeBlocks)
        ) {
            if (stryMutAct_9fa48("5808")) {
                {
                }
            } else {
                stryCov_9fa48("5808");
                const cs = createInitialCodeState();
                temp = transformTextRespectingCode(
                    temp,
                    cs,
                    stryMutAct_9fa48("5809")
                        ? () => undefined
                        : (stryCov_9fa48("5809"), (nonCode) => applyFixesOutsideCode(nonCode)),
                    stryMutAct_9fa48("5810") ? () => undefined : (stryCov_9fa48("5810"), (code) => code)
                );
            }
        } else {
            if (stryMutAct_9fa48("5811")) {
                {
                }
            } else {
                stryCov_9fa48("5811");
                temp = applyFixesOutsideCode(temp);
            }
        }
        const coreOpts = stryMutAct_9fa48("5812")
            ? {}
            : (stryCov_9fa48("5812"),
              {
                  userProtected,
                  protectBrands: s.protectBrands,
                  applySerbianQuotes: s.applySerbianQuotes,
                  preserveCodeBlocks: s.preserveCodeBlocks,
                  curlyProtection: s.curlyProtection,
              });
        if (
            stryMutAct_9fa48("5815")
                ? s.direction !== "to-ascii"
                : stryMutAct_9fa48("5814")
                  ? false
                  : stryMutAct_9fa48("5813")
                    ? true
                    : (stryCov_9fa48("5813", "5814", "5815"),
                      s.direction === (stryMutAct_9fa48("5816") ? "" : (stryCov_9fa48("5816"), "to-ascii")))
        ) {
            if (stryMutAct_9fa48("5817")) {
                {
                }
            } else {
                stryCov_9fa48("5817");
                const { text: lat } = convertPlainText(
                    temp,
                    stryMutAct_9fa48("5818") ? "" : (stryCov_9fa48("5818"), "cyr-to-lat"),
                    stryMutAct_9fa48("5819")
                        ? {}
                        : (stryCov_9fa48("5819"),
                          {
                              ...coreOpts,
                              applySerbianQuotes: stryMutAct_9fa48("5820")
                                  ? true
                                  : (stryCov_9fa48("5820"), false),
                          })
                );
                return stryMutAct_9fa48("5821")
                    ? {}
                    : (stryCov_9fa48("5821"),
                      {
                          out: toAscii(lat),
                          type: stryMutAct_9fa48("5822") ? "" : (stryCov_9fa48("5822"), "Ošišana latinica"),
                      });
            }
        }
        const dir: Direction = (
            stryMutAct_9fa48("5825")
                ? s.direction !== "auto"
                : stryMutAct_9fa48("5824")
                  ? false
                  : stryMutAct_9fa48("5823")
                    ? true
                    : (stryCov_9fa48("5823", "5824", "5825"),
                      s.direction === (stryMutAct_9fa48("5826") ? "" : (stryCov_9fa48("5826"), "auto")))
        )
            ? stryMutAct_9fa48("5827")
                ? ""
                : (stryCov_9fa48("5827"), "auto")
            : (s.direction as Direction);
        const { text, type } = convertPlainText(temp, dir, coreOpts);
        return stryMutAct_9fa48("5828")
            ? {}
            : (stryCov_9fa48("5828"),
              {
                  out: text,
                  type,
              });
    }
}
