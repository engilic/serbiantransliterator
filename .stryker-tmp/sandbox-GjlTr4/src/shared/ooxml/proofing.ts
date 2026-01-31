// @ts-nocheck
// src/shared/ooxml/proofing.ts
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
import { XML_NS, WORD_NS, needsXmlSpacePreserve } from "./dom";
import { type Direction } from "../../core/textCore";
import { extractLetterWordSpans, findAncestor, getDirectChild, ensureLangOnRPr } from "./converterUtils";
const RE_CYR = stryMutAct_9fa48("4171") ? /[^\u0400-\u052F]/u : (stryCov_9fa48("4171"), /[\u0400-\u052F]/u);
const RE_LAT = stryMutAct_9fa48("4172")
    ? /[^A-Za-zČčĆćĐđŠšŽž]/u
    : (stryCov_9fa48("4172"), /[A-Za-zČčĆćĐđŠšŽž]/u);
function isSimpleRun(run: Element): boolean {
    if (stryMutAct_9fa48("4173")) {
        {
        }
    } else {
        stryCov_9fa48("4173");
        for (const el of Array.from(run.children)) {
            if (stryMutAct_9fa48("4174")) {
                {
                }
            } else {
                stryCov_9fa48("4174");
                if (
                    stryMutAct_9fa48("4177")
                        ? el.localName !== "rPr" || el.localName !== "t"
                        : stryMutAct_9fa48("4176")
                          ? false
                          : stryMutAct_9fa48("4175")
                            ? true
                            : (stryCov_9fa48("4175", "4176", "4177"),
                              (stryMutAct_9fa48("4179")
                                  ? el.localName === "rPr"
                                  : stryMutAct_9fa48("4178")
                                    ? true
                                    : (stryCov_9fa48("4178", "4179"),
                                      el.localName !==
                                          (stryMutAct_9fa48("4180")
                                              ? ""
                                              : (stryCov_9fa48("4180"), "rPr")))) &&
                                  (stryMutAct_9fa48("4182")
                                      ? el.localName === "t"
                                      : stryMutAct_9fa48("4181")
                                        ? true
                                        : (stryCov_9fa48("4181", "4182"),
                                          el.localName !==
                                              (stryMutAct_9fa48("4183")
                                                  ? ""
                                                  : (stryCov_9fa48("4183"), "t")))))
                )
                    return stryMutAct_9fa48("4184") ? true : (stryCov_9fa48("4184"), false);
            }
        }
        return stryMutAct_9fa48("4185") ? false : (stryCov_9fa48("4185"), true);
    }
}
function getRunTextFromTChildren(run: Element): string {
    if (stryMutAct_9fa48("4186")) {
        {
        }
    } else {
        stryCov_9fa48("4186");
        let out = stryMutAct_9fa48("4187") ? "Stryker was here!" : (stryCov_9fa48("4187"), "");
        for (const ch of Array.from(run.children)) {
            if (stryMutAct_9fa48("4188")) {
                {
                }
            } else {
                stryCov_9fa48("4188");
                if (
                    stryMutAct_9fa48("4191")
                        ? ch.localName !== "t"
                        : stryMutAct_9fa48("4190")
                          ? false
                          : stryMutAct_9fa48("4189")
                            ? true
                            : (stryCov_9fa48("4189", "4190", "4191"),
                              ch.localName === (stryMutAct_9fa48("4192") ? "" : (stryCov_9fa48("4192"), "t")))
                )
                    stryMutAct_9fa48("4193")
                        ? (out -= ch.textContent ?? "")
                        : (stryCov_9fa48("4193"),
                          (out += stryMutAct_9fa48("4194")
                              ? ch.textContent && ""
                              : (stryCov_9fa48("4194"),
                                ch.textContent ??
                                    (stryMutAct_9fa48("4195")
                                        ? "Stryker was here!"
                                        : (stryCov_9fa48("4195"), "")))));
            }
        }
        return out;
    }
}
function wasWordTransliterated(orig: string, fin: string, direction: Direction | "to-ascii"): boolean {
    if (stryMutAct_9fa48("4196")) {
        {
        }
    } else {
        stryCov_9fa48("4196");
        if (
            stryMutAct_9fa48("4199")
                ? orig !== fin
                : stryMutAct_9fa48("4198")
                  ? false
                  : stryMutAct_9fa48("4197")
                    ? true
                    : (stryCov_9fa48("4197", "4198", "4199"), orig === fin)
        )
            return stryMutAct_9fa48("4200") ? true : (stryCov_9fa48("4200"), false);
        if (
            stryMutAct_9fa48("4203")
                ? direction !== "lat-to-cyr"
                : stryMutAct_9fa48("4202")
                  ? false
                  : stryMutAct_9fa48("4201")
                    ? true
                    : (stryCov_9fa48("4201", "4202", "4203"),
                      direction === (stryMutAct_9fa48("4204") ? "" : (stryCov_9fa48("4204"), "lat-to-cyr")))
        )
            return stryMutAct_9fa48("4207")
                ? RE_LAT.test(orig) || RE_CYR.test(fin)
                : stryMutAct_9fa48("4206")
                  ? false
                  : stryMutAct_9fa48("4205")
                    ? true
                    : (stryCov_9fa48("4205", "4206", "4207"), RE_LAT.test(orig) && RE_CYR.test(fin));
        if (
            stryMutAct_9fa48("4210")
                ? direction === "cyr-to-lat" && direction === "to-ascii"
                : stryMutAct_9fa48("4209")
                  ? false
                  : stryMutAct_9fa48("4208")
                    ? true
                    : (stryCov_9fa48("4208", "4209", "4210"),
                      (stryMutAct_9fa48("4212")
                          ? direction !== "cyr-to-lat"
                          : stryMutAct_9fa48("4211")
                            ? false
                            : (stryCov_9fa48("4211", "4212"),
                              direction ===
                                  (stryMutAct_9fa48("4213") ? "" : (stryCov_9fa48("4213"), "cyr-to-lat")))) ||
                          (stryMutAct_9fa48("4215")
                              ? direction !== "to-ascii"
                              : stryMutAct_9fa48("4214")
                                ? false
                                : (stryCov_9fa48("4214", "4215"),
                                  direction ===
                                      (stryMutAct_9fa48("4216") ? "" : (stryCov_9fa48("4216"), "to-ascii")))))
        )
            return stryMutAct_9fa48("4219")
                ? RE_CYR.test(orig) || RE_LAT.test(fin)
                : stryMutAct_9fa48("4218")
                  ? false
                  : stryMutAct_9fa48("4217")
                    ? true
                    : (stryCov_9fa48("4217", "4218", "4219"), RE_CYR.test(orig) && RE_LAT.test(fin));
        if (
            stryMutAct_9fa48("4222")
                ? direction !== "auto"
                : stryMutAct_9fa48("4221")
                  ? false
                  : stryMutAct_9fa48("4220")
                    ? true
                    : (stryCov_9fa48("4220", "4221", "4222"),
                      direction === (stryMutAct_9fa48("4223") ? "" : (stryCov_9fa48("4223"), "auto")))
        )
            return stryMutAct_9fa48("4226")
                ? RE_LAT.test(orig) && RE_CYR.test(fin) && RE_CYR.test(orig) && RE_LAT.test(fin)
                : stryMutAct_9fa48("4225")
                  ? false
                  : stryMutAct_9fa48("4224")
                    ? true
                    : (stryCov_9fa48("4224", "4225", "4226"),
                      (stryMutAct_9fa48("4228")
                          ? RE_LAT.test(orig) || RE_CYR.test(fin)
                          : stryMutAct_9fa48("4227")
                            ? false
                            : (stryCov_9fa48("4227", "4228"), RE_LAT.test(orig) && RE_CYR.test(fin))) ||
                          (stryMutAct_9fa48("4230")
                              ? RE_CYR.test(orig) || RE_LAT.test(fin)
                              : stryMutAct_9fa48("4229")
                                ? false
                                : (stryCov_9fa48("4229", "4230"), RE_CYR.test(orig) && RE_LAT.test(fin))));
        return stryMutAct_9fa48("4231") ? true : (stryCov_9fa48("4231"), false);
    }
}
export function targetLangForDirection(
    direction: Direction | "to-ascii"
): "sr-Cyrl-RS" | "sr-Latn-RS" | null {
    if (stryMutAct_9fa48("4232")) {
        {
        }
    } else {
        stryCov_9fa48("4232");
        if (
            stryMutAct_9fa48("4235")
                ? direction !== "lat-to-cyr"
                : stryMutAct_9fa48("4234")
                  ? false
                  : stryMutAct_9fa48("4233")
                    ? true
                    : (stryCov_9fa48("4233", "4234", "4235"),
                      direction === (stryMutAct_9fa48("4236") ? "" : (stryCov_9fa48("4236"), "lat-to-cyr")))
        )
            return stryMutAct_9fa48("4237") ? "" : (stryCov_9fa48("4237"), "sr-Cyrl-RS");
        if (
            stryMutAct_9fa48("4240")
                ? direction === "cyr-to-lat" && direction === "to-ascii"
                : stryMutAct_9fa48("4239")
                  ? false
                  : stryMutAct_9fa48("4238")
                    ? true
                    : (stryCov_9fa48("4238", "4239", "4240"),
                      (stryMutAct_9fa48("4242")
                          ? direction !== "cyr-to-lat"
                          : stryMutAct_9fa48("4241")
                            ? false
                            : (stryCov_9fa48("4241", "4242"),
                              direction ===
                                  (stryMutAct_9fa48("4243") ? "" : (stryCov_9fa48("4243"), "cyr-to-lat")))) ||
                          (stryMutAct_9fa48("4245")
                              ? direction !== "to-ascii"
                              : stryMutAct_9fa48("4244")
                                ? false
                                : (stryCov_9fa48("4244", "4245"),
                                  direction ===
                                      (stryMutAct_9fa48("4246") ? "" : (stryCov_9fa48("4246"), "to-ascii")))))
        )
            return stryMutAct_9fa48("4247") ? "" : (stryCov_9fa48("4247"), "sr-Latn-RS");
        return null;
    }
}
export type ProofingApplyResult = {
    changedRuns: number;
    skippedRuns: number;
    skippedByReason: Record<string, number>;
};
export function applyProofingLanguagePreserveUnchanged(
    doc: Document,
    textNodes: Element[],
    originalRunText: Map<Element, string>,
    direction: Direction | "to-ascii"
): ProofingApplyResult {
    if (stryMutAct_9fa48("4248")) {
        {
        }
    } else {
        stryCov_9fa48("4248");
        const target = targetLangForDirection(direction);
        if (
            stryMutAct_9fa48("4251")
                ? false
                : stryMutAct_9fa48("4250")
                  ? true
                  : stryMutAct_9fa48("4249")
                    ? target
                    : (stryCov_9fa48("4249", "4250", "4251"), !target)
        )
            return stryMutAct_9fa48("4252")
                ? {}
                : (stryCov_9fa48("4252"),
                  {
                      changedRuns: 0,
                      skippedRuns: 0,
                      skippedByReason: {},
                  });
        const runs: Element[] = stryMutAct_9fa48("4253") ? ["Stryker was here"] : (stryCov_9fa48("4253"), []);
        const seen = new WeakSet<Element>();
        for (const t of textNodes) {
            if (stryMutAct_9fa48("4254")) {
                {
                }
            } else {
                stryCov_9fa48("4254");
                const run = findAncestor(t, stryMutAct_9fa48("4255") ? "" : (stryCov_9fa48("4255"), "r"));
                if (
                    stryMutAct_9fa48("4258")
                        ? false
                        : stryMutAct_9fa48("4257")
                          ? true
                          : stryMutAct_9fa48("4256")
                            ? run
                            : (stryCov_9fa48("4256", "4257", "4258"), !run)
                )
                    continue;
                if (
                    stryMutAct_9fa48("4260")
                        ? false
                        : stryMutAct_9fa48("4259")
                          ? true
                          : (stryCov_9fa48("4259", "4260"), seen.has(run))
                )
                    continue;
                seen.add(run);
                runs.push(run);
            }
        }
        let changedRuns = 0;
        let skippedRuns = 0;
        const skippedByReason: Record<string, number> = {};
        const skip = (reason: string) => {
            if (stryMutAct_9fa48("4261")) {
                {
                }
            } else {
                stryCov_9fa48("4261");
                stryMutAct_9fa48("4262") ? skippedRuns-- : (stryCov_9fa48("4262"), skippedRuns++);
                skippedByReason[reason] = stryMutAct_9fa48("4263")
                    ? (skippedByReason[reason] ?? 0) - 1
                    : (stryCov_9fa48("4263"),
                      (stryMutAct_9fa48("4264")
                          ? skippedByReason[reason] && 0
                          : (stryCov_9fa48("4264"), skippedByReason[reason] ?? 0)) + 1);
            }
        };
        for (const run of runs) {
            if (stryMutAct_9fa48("4265")) {
                {
                }
            } else {
                stryCov_9fa48("4265");
                if (
                    stryMutAct_9fa48("4268")
                        ? false
                        : stryMutAct_9fa48("4267")
                          ? true
                          : stryMutAct_9fa48("4266")
                            ? isSimpleRun(run)
                            : (stryCov_9fa48("4266", "4267", "4268"), !isSimpleRun(run))
                ) {
                    if (stryMutAct_9fa48("4269")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4269");
                        skip(stryMutAct_9fa48("4270") ? "" : (stryCov_9fa48("4270"), "notSimpleRun"));
                        continue;
                    }
                }
                const orig = originalRunText.get(run);
                if (
                    stryMutAct_9fa48("4273")
                        ? orig != null
                        : stryMutAct_9fa48("4272")
                          ? false
                          : stryMutAct_9fa48("4271")
                            ? true
                            : (stryCov_9fa48("4271", "4272", "4273"), orig == null)
                ) {
                    if (stryMutAct_9fa48("4274")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4274");
                        skip(stryMutAct_9fa48("4275") ? "" : (stryCov_9fa48("4275"), "missingOriginal"));
                        continue;
                    }
                }
                const fin = getRunTextFromTChildren(run);
                const origWords = extractLetterWordSpans(orig);
                const finWords = extractLetterWordSpans(fin);
                if (
                    stryMutAct_9fa48("4278")
                        ? origWords.length === 0 && finWords.length === 0
                        : stryMutAct_9fa48("4277")
                          ? false
                          : stryMutAct_9fa48("4276")
                            ? true
                            : (stryCov_9fa48("4276", "4277", "4278"),
                              (stryMutAct_9fa48("4280")
                                  ? origWords.length !== 0
                                  : stryMutAct_9fa48("4279")
                                    ? false
                                    : (stryCov_9fa48("4279", "4280"), origWords.length === 0)) ||
                                  (stryMutAct_9fa48("4282")
                                      ? finWords.length !== 0
                                      : stryMutAct_9fa48("4281")
                                        ? false
                                        : (stryCov_9fa48("4281", "4282"), finWords.length === 0)))
                ) {
                    if (stryMutAct_9fa48("4283")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4283");
                        skip(stryMutAct_9fa48("4284") ? "" : (stryCov_9fa48("4284"), "noWordSpans"));
                        continue;
                    }
                }
                if (
                    stryMutAct_9fa48("4287")
                        ? origWords.length === finWords.length
                        : stryMutAct_9fa48("4286")
                          ? false
                          : stryMutAct_9fa48("4285")
                            ? true
                            : (stryCov_9fa48("4285", "4286", "4287"), origWords.length !== finWords.length)
                ) {
                    if (stryMutAct_9fa48("4288")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4288");
                        skip(
                            stryMutAct_9fa48("4289") ? "" : (stryCov_9fa48("4289"), "wordSpanCountMismatch")
                        );
                        continue;
                    }
                }
                const changedWord: boolean[] = (
                    stryMutAct_9fa48("4290")
                        ? new Array()
                        : (stryCov_9fa48("4290"), new Array(finWords.length))
                ).fill(stryMutAct_9fa48("4291") ? true : (stryCov_9fa48("4291"), false));
                let anyChanged = stryMutAct_9fa48("4292") ? true : (stryCov_9fa48("4292"), false);
                for (
                    let i = 0;
                    stryMutAct_9fa48("4295")
                        ? i >= finWords.length
                        : stryMutAct_9fa48("4294")
                          ? i <= finWords.length
                          : stryMutAct_9fa48("4293")
                            ? false
                            : (stryCov_9fa48("4293", "4294", "4295"), i < finWords.length);
                    stryMutAct_9fa48("4296") ? i-- : (stryCov_9fa48("4296"), i++)
                ) {
                    if (stryMutAct_9fa48("4297")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4297");
                        const origWord = origWords[i];
                        const finWord = finWords[i];
                        if (
                            stryMutAct_9fa48("4300")
                                ? !origWord && !finWord
                                : stryMutAct_9fa48("4299")
                                  ? false
                                  : stryMutAct_9fa48("4298")
                                    ? true
                                    : (stryCov_9fa48("4298", "4299", "4300"),
                                      (stryMutAct_9fa48("4301")
                                          ? origWord
                                          : (stryCov_9fa48("4301"), !origWord)) ||
                                          (stryMutAct_9fa48("4302")
                                              ? finWord
                                              : (stryCov_9fa48("4302"), !finWord)))
                        )
                            continue;
                        const isChanged = wasWordTransliterated(origWord.text, finWord.text, direction);
                        changedWord[i] = isChanged;
                        if (
                            stryMutAct_9fa48("4304")
                                ? false
                                : stryMutAct_9fa48("4303")
                                  ? true
                                  : (stryCov_9fa48("4303", "4304"), isChanged)
                        )
                            anyChanged = stryMutAct_9fa48("4305") ? false : (stryCov_9fa48("4305"), true);
                    }
                }
                if (
                    stryMutAct_9fa48("4308")
                        ? false
                        : stryMutAct_9fa48("4307")
                          ? true
                          : stryMutAct_9fa48("4306")
                            ? anyChanged
                            : (stryCov_9fa48("4306", "4307", "4308"), !anyChanged)
                ) {
                    if (stryMutAct_9fa48("4309")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4309");
                        skip(stryMutAct_9fa48("4310") ? "" : (stryCov_9fa48("4310"), "noChangedWords"));
                        continue;
                    }
                }
                const parent = run.parentNode;
                if (
                    stryMutAct_9fa48("4313")
                        ? false
                        : stryMutAct_9fa48("4312")
                          ? true
                          : stryMutAct_9fa48("4311")
                            ? parent
                            : (stryCov_9fa48("4311", "4312", "4313"), !parent)
                ) {
                    if (stryMutAct_9fa48("4314")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4314");
                        skip(stryMutAct_9fa48("4315") ? "" : (stryCov_9fa48("4315"), "missingParent"));
                        continue;
                    }
                }
                const baseRPr = getDirectChild(
                    run,
                    stryMutAct_9fa48("4316") ? "" : (stryCov_9fa48("4316"), "rPr")
                );
                const finCps = Array.from(
                    fin.normalize(stryMutAct_9fa48("4317") ? "" : (stryCov_9fa48("4317"), "NFC"))
                );
                type Seg = {
                    text: string;
                    changed: boolean;
                };
                const segs: Seg[] = stryMutAct_9fa48("4318")
                    ? ["Stryker was here"]
                    : (stryCov_9fa48("4318"), []);
                let cursorCp = 0;
                for (
                    let i = 0;
                    stryMutAct_9fa48("4321")
                        ? i >= finWords.length
                        : stryMutAct_9fa48("4320")
                          ? i <= finWords.length
                          : stryMutAct_9fa48("4319")
                            ? false
                            : (stryCov_9fa48("4319", "4320", "4321"), i < finWords.length);
                    stryMutAct_9fa48("4322") ? i-- : (stryCov_9fa48("4322"), i++)
                ) {
                    if (stryMutAct_9fa48("4323")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4323");
                        const w = finWords[i];
                        if (
                            stryMutAct_9fa48("4326")
                                ? false
                                : stryMutAct_9fa48("4325")
                                  ? true
                                  : stryMutAct_9fa48("4324")
                                    ? w
                                    : (stryCov_9fa48("4324", "4325", "4326"), !w)
                        )
                            continue;
                        const segStart = cursorCp;
                        const segEnd = w.endCp;
                        const segText = stryMutAct_9fa48("4327")
                            ? finCps.join("")
                            : (stryCov_9fa48("4327"),
                              finCps
                                  .slice(segStart, segEnd)
                                  .join(
                                      stryMutAct_9fa48("4328")
                                          ? "Stryker was here!"
                                          : (stryCov_9fa48("4328"), "")
                                  ));
                        segs.push(
                            stryMutAct_9fa48("4329")
                                ? {}
                                : (stryCov_9fa48("4329"),
                                  {
                                      text: segText,
                                      changed: stryMutAct_9fa48("4330")
                                          ? changedWord[i] && false
                                          : (stryCov_9fa48("4330"),
                                            changedWord[i] ??
                                                (stryMutAct_9fa48("4331")
                                                    ? true
                                                    : (stryCov_9fa48("4331"), false))),
                                  })
                        );
                        cursorCp = segEnd;
                    }
                }
                if (
                    stryMutAct_9fa48("4334")
                        ? cursorCp < finCps.length || segs.length
                        : stryMutAct_9fa48("4333")
                          ? false
                          : stryMutAct_9fa48("4332")
                            ? true
                            : (stryCov_9fa48("4332", "4333", "4334"),
                              (stryMutAct_9fa48("4337")
                                  ? cursorCp >= finCps.length
                                  : stryMutAct_9fa48("4336")
                                    ? cursorCp <= finCps.length
                                    : stryMutAct_9fa48("4335")
                                      ? true
                                      : (stryCov_9fa48("4335", "4336", "4337"), cursorCp < finCps.length)) &&
                                  segs.length)
                ) {
                    if (stryMutAct_9fa48("4338")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4338");
                        const lastSeg =
                            segs[
                                stryMutAct_9fa48("4339")
                                    ? segs.length + 1
                                    : (stryCov_9fa48("4339"), segs.length - 1)
                            ];
                        if (
                            stryMutAct_9fa48("4341")
                                ? false
                                : stryMutAct_9fa48("4340")
                                  ? true
                                  : (stryCov_9fa48("4340", "4341"), lastSeg)
                        ) {
                            if (stryMutAct_9fa48("4342")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("4342");
                                stryMutAct_9fa48("4343")
                                    ? (lastSeg.text -= finCps.slice(cursorCp).join(""))
                                    : (stryCov_9fa48("4343"),
                                      (lastSeg.text += stryMutAct_9fa48("4344")
                                          ? finCps.join("")
                                          : (stryCov_9fa48("4344"),
                                            finCps
                                                .slice(cursorCp)
                                                .join(
                                                    stryMutAct_9fa48("4345")
                                                        ? "Stryker was here!"
                                                        : (stryCov_9fa48("4345"), "")
                                                ))));
                            }
                        }
                    }
                }
                for (const seg of segs) {
                    if (stryMutAct_9fa48("4346")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4346");
                        const newRun = doc.createElementNS(
                            WORD_NS,
                            stryMutAct_9fa48("4347") ? "" : (stryCov_9fa48("4347"), "w:r")
                        );
                        let newRPr: Element | null = null;
                        if (
                            stryMutAct_9fa48("4349")
                                ? false
                                : stryMutAct_9fa48("4348")
                                  ? true
                                  : (stryCov_9fa48("4348", "4349"), baseRPr)
                        ) {
                            if (stryMutAct_9fa48("4350")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("4350");
                                newRPr = baseRPr.cloneNode(true) as Element;
                                newRun.appendChild(newRPr);
                            }
                        } else if (
                            stryMutAct_9fa48("4352")
                                ? false
                                : stryMutAct_9fa48("4351")
                                  ? true
                                  : (stryCov_9fa48("4351", "4352"), seg.changed)
                        ) {
                            if (stryMutAct_9fa48("4353")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("4353");
                                newRPr = doc.createElementNS(
                                    WORD_NS,
                                    stryMutAct_9fa48("4354") ? "" : (stryCov_9fa48("4354"), "w:rPr")
                                );
                                newRun.appendChild(newRPr);
                            }
                        }
                        if (
                            stryMutAct_9fa48("4357")
                                ? seg.changed || newRPr
                                : stryMutAct_9fa48("4356")
                                  ? false
                                  : stryMutAct_9fa48("4355")
                                    ? true
                                    : (stryCov_9fa48("4355", "4356", "4357"), seg.changed && newRPr)
                        ) {
                            if (stryMutAct_9fa48("4358")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("4358");
                                ensureLangOnRPr(doc, newRPr, target);
                            }
                        }
                        const tEl = doc.createElementNS(
                            WORD_NS,
                            stryMutAct_9fa48("4359") ? "" : (stryCov_9fa48("4359"), "w:t")
                        );
                        if (
                            stryMutAct_9fa48("4361")
                                ? false
                                : stryMutAct_9fa48("4360")
                                  ? true
                                  : (stryCov_9fa48("4360", "4361"), needsXmlSpacePreserve(seg.text))
                        ) {
                            if (stryMutAct_9fa48("4362")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("4362");
                                tEl.setAttributeNS(
                                    XML_NS,
                                    stryMutAct_9fa48("4363") ? "" : (stryCov_9fa48("4363"), "xml:space"),
                                    stryMutAct_9fa48("4364") ? "" : (stryCov_9fa48("4364"), "preserve")
                                );
                            }
                        }
                        tEl.textContent = seg.text;
                        newRun.appendChild(tEl);
                        parent.insertBefore(newRun, run);
                    }
                }
                parent.removeChild(run);
                stryMutAct_9fa48("4365") ? changedRuns-- : (stryCov_9fa48("4365"), changedRuns++);
            }
        }
        return stryMutAct_9fa48("4366")
            ? {}
            : (stryCov_9fa48("4366"),
              {
                  changedRuns,
                  skippedRuns,
                  skippedByReason,
              });
    }
}
