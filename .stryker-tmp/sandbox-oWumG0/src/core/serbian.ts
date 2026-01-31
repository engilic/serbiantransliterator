// @ts-nocheck
// src/core/serbian.ts
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
export type ScriptMajority = "latin" | "cyrillic";
const LAT_TO_CYR_1: Record<string, string> = stryMutAct_9fa48("751")
    ? {}
    : (stryCov_9fa48("751"),
      {
          a: stryMutAct_9fa48("752") ? "" : (stryCov_9fa48("752"), "а"),
          b: stryMutAct_9fa48("753") ? "" : (stryCov_9fa48("753"), "б"),
          v: stryMutAct_9fa48("754") ? "" : (stryCov_9fa48("754"), "в"),
          g: stryMutAct_9fa48("755") ? "" : (stryCov_9fa48("755"), "г"),
          d: stryMutAct_9fa48("756") ? "" : (stryCov_9fa48("756"), "д"),
          đ: stryMutAct_9fa48("757") ? "" : (stryCov_9fa48("757"), "ђ"),
          e: stryMutAct_9fa48("758") ? "" : (stryCov_9fa48("758"), "е"),
          ž: stryMutAct_9fa48("759") ? "" : (stryCov_9fa48("759"), "ж"),
          z: stryMutAct_9fa48("760") ? "" : (stryCov_9fa48("760"), "з"),
          i: stryMutAct_9fa48("761") ? "" : (stryCov_9fa48("761"), "и"),
          j: stryMutAct_9fa48("762") ? "" : (stryCov_9fa48("762"), "ј"),
          k: stryMutAct_9fa48("763") ? "" : (stryCov_9fa48("763"), "к"),
          l: stryMutAct_9fa48("764") ? "" : (stryCov_9fa48("764"), "л"),
          m: stryMutAct_9fa48("765") ? "" : (stryCov_9fa48("765"), "м"),
          n: stryMutAct_9fa48("766") ? "" : (stryCov_9fa48("766"), "н"),
          o: stryMutAct_9fa48("767") ? "" : (stryCov_9fa48("767"), "о"),
          p: stryMutAct_9fa48("768") ? "" : (stryCov_9fa48("768"), "п"),
          r: stryMutAct_9fa48("769") ? "" : (stryCov_9fa48("769"), "р"),
          s: stryMutAct_9fa48("770") ? "" : (stryCov_9fa48("770"), "с"),
          t: stryMutAct_9fa48("771") ? "" : (stryCov_9fa48("771"), "т"),
          ć: stryMutAct_9fa48("772") ? "" : (stryCov_9fa48("772"), "ћ"),
          u: stryMutAct_9fa48("773") ? "" : (stryCov_9fa48("773"), "у"),
          f: stryMutAct_9fa48("774") ? "" : (stryCov_9fa48("774"), "ф"),
          h: stryMutAct_9fa48("775") ? "" : (stryCov_9fa48("775"), "х"),
          c: stryMutAct_9fa48("776") ? "" : (stryCov_9fa48("776"), "ц"),
          č: stryMutAct_9fa48("777") ? "" : (stryCov_9fa48("777"), "ч"),
          š: stryMutAct_9fa48("778") ? "" : (stryCov_9fa48("778"), "ш"),
          A: stryMutAct_9fa48("779") ? "" : (stryCov_9fa48("779"), "А"),
          B: stryMutAct_9fa48("780") ? "" : (stryCov_9fa48("780"), "Б"),
          V: stryMutAct_9fa48("781") ? "" : (stryCov_9fa48("781"), "В"),
          G: stryMutAct_9fa48("782") ? "" : (stryCov_9fa48("782"), "Г"),
          D: stryMutAct_9fa48("783") ? "" : (stryCov_9fa48("783"), "Д"),
          Đ: stryMutAct_9fa48("784") ? "" : (stryCov_9fa48("784"), "Ђ"),
          E: stryMutAct_9fa48("785") ? "" : (stryCov_9fa48("785"), "Е"),
          Ž: stryMutAct_9fa48("786") ? "" : (stryCov_9fa48("786"), "Ж"),
          Z: stryMutAct_9fa48("787") ? "" : (stryCov_9fa48("787"), "З"),
          I: stryMutAct_9fa48("788") ? "" : (stryCov_9fa48("788"), "И"),
          J: stryMutAct_9fa48("789") ? "" : (stryCov_9fa48("789"), "Ј"),
          K: stryMutAct_9fa48("790") ? "" : (stryCov_9fa48("790"), "К"),
          L: stryMutAct_9fa48("791") ? "" : (stryCov_9fa48("791"), "Л"),
          M: stryMutAct_9fa48("792") ? "" : (stryCov_9fa48("792"), "М"),
          N: stryMutAct_9fa48("793") ? "" : (stryCov_9fa48("793"), "Н"),
          O: stryMutAct_9fa48("794") ? "" : (stryCov_9fa48("794"), "О"),
          P: stryMutAct_9fa48("795") ? "" : (stryCov_9fa48("795"), "П"),
          R: stryMutAct_9fa48("796") ? "" : (stryCov_9fa48("796"), "Р"),
          S: stryMutAct_9fa48("797") ? "" : (stryCov_9fa48("797"), "С"),
          T: stryMutAct_9fa48("798") ? "" : (stryCov_9fa48("798"), "Т"),
          Ć: stryMutAct_9fa48("799") ? "" : (stryCov_9fa48("799"), "Ћ"),
          U: stryMutAct_9fa48("800") ? "" : (stryCov_9fa48("800"), "У"),
          F: stryMutAct_9fa48("801") ? "" : (stryCov_9fa48("801"), "Ф"),
          H: stryMutAct_9fa48("802") ? "" : (stryCov_9fa48("802"), "Х"),
          C: stryMutAct_9fa48("803") ? "" : (stryCov_9fa48("803"), "Ц"),
          Č: stryMutAct_9fa48("804") ? "" : (stryCov_9fa48("804"), "Ч"),
          Š: stryMutAct_9fa48("805") ? "" : (stryCov_9fa48("805"), "Ш"),
      });
const CYR_TO_LAT_1: Record<string, string> = stryMutAct_9fa48("806")
    ? {}
    : (stryCov_9fa48("806"),
      {
          а: stryMutAct_9fa48("807") ? "" : (stryCov_9fa48("807"), "a"),
          б: stryMutAct_9fa48("808") ? "" : (stryCov_9fa48("808"), "b"),
          в: stryMutAct_9fa48("809") ? "" : (stryCov_9fa48("809"), "v"),
          г: stryMutAct_9fa48("810") ? "" : (stryCov_9fa48("810"), "g"),
          д: stryMutAct_9fa48("811") ? "" : (stryCov_9fa48("811"), "d"),
          ђ: stryMutAct_9fa48("812") ? "" : (stryCov_9fa48("812"), "đ"),
          е: stryMutAct_9fa48("813") ? "" : (stryCov_9fa48("813"), "e"),
          ж: stryMutAct_9fa48("814") ? "" : (stryCov_9fa48("814"), "ž"),
          з: stryMutAct_9fa48("815") ? "" : (stryCov_9fa48("815"), "z"),
          и: stryMutAct_9fa48("816") ? "" : (stryCov_9fa48("816"), "i"),
          ј: stryMutAct_9fa48("817") ? "" : (stryCov_9fa48("817"), "j"),
          к: stryMutAct_9fa48("818") ? "" : (stryCov_9fa48("818"), "k"),
          л: stryMutAct_9fa48("819") ? "" : (stryCov_9fa48("819"), "l"),
          м: stryMutAct_9fa48("820") ? "" : (stryCov_9fa48("820"), "m"),
          н: stryMutAct_9fa48("821") ? "" : (stryCov_9fa48("821"), "n"),
          о: stryMutAct_9fa48("822") ? "" : (stryCov_9fa48("822"), "o"),
          п: stryMutAct_9fa48("823") ? "" : (stryCov_9fa48("823"), "p"),
          р: stryMutAct_9fa48("824") ? "" : (stryCov_9fa48("824"), "r"),
          с: stryMutAct_9fa48("825") ? "" : (stryCov_9fa48("825"), "s"),
          т: stryMutAct_9fa48("826") ? "" : (stryCov_9fa48("826"), "t"),
          ћ: stryMutAct_9fa48("827") ? "" : (stryCov_9fa48("827"), "ć"),
          у: stryMutAct_9fa48("828") ? "" : (stryCov_9fa48("828"), "u"),
          ф: stryMutAct_9fa48("829") ? "" : (stryCov_9fa48("829"), "f"),
          х: stryMutAct_9fa48("830") ? "" : (stryCov_9fa48("830"), "h"),
          ц: stryMutAct_9fa48("831") ? "" : (stryCov_9fa48("831"), "c"),
          ч: stryMutAct_9fa48("832") ? "" : (stryCov_9fa48("832"), "č"),
          ш: stryMutAct_9fa48("833") ? "" : (stryCov_9fa48("833"), "š"),
          А: stryMutAct_9fa48("834") ? "" : (stryCov_9fa48("834"), "A"),
          Б: stryMutAct_9fa48("835") ? "" : (stryCov_9fa48("835"), "B"),
          В: stryMutAct_9fa48("836") ? "" : (stryCov_9fa48("836"), "V"),
          Г: stryMutAct_9fa48("837") ? "" : (stryCov_9fa48("837"), "G"),
          Д: stryMutAct_9fa48("838") ? "" : (stryCov_9fa48("838"), "D"),
          Ђ: stryMutAct_9fa48("839") ? "" : (stryCov_9fa48("839"), "Đ"),
          Е: stryMutAct_9fa48("840") ? "" : (stryCov_9fa48("840"), "E"),
          Ж: stryMutAct_9fa48("841") ? "" : (stryCov_9fa48("841"), "Ž"),
          З: stryMutAct_9fa48("842") ? "" : (stryCov_9fa48("842"), "Z"),
          И: stryMutAct_9fa48("843") ? "" : (stryCov_9fa48("843"), "I"),
          Ј: stryMutAct_9fa48("844") ? "" : (stryCov_9fa48("844"), "J"),
          К: stryMutAct_9fa48("845") ? "" : (stryCov_9fa48("845"), "K"),
          Л: stryMutAct_9fa48("846") ? "" : (stryCov_9fa48("846"), "L"),
          М: stryMutAct_9fa48("847") ? "" : (stryCov_9fa48("847"), "M"),
          Н: stryMutAct_9fa48("848") ? "" : (stryCov_9fa48("848"), "N"),
          О: stryMutAct_9fa48("849") ? "" : (stryCov_9fa48("849"), "O"),
          П: stryMutAct_9fa48("850") ? "" : (stryCov_9fa48("850"), "P"),
          Р: stryMutAct_9fa48("851") ? "" : (stryCov_9fa48("851"), "R"),
          С: stryMutAct_9fa48("852") ? "" : (stryCov_9fa48("852"), "S"),
          Т: stryMutAct_9fa48("853") ? "" : (stryCov_9fa48("853"), "T"),
          Ћ: stryMutAct_9fa48("854") ? "" : (stryCov_9fa48("854"), "Ć"),
          У: stryMutAct_9fa48("855") ? "" : (stryCov_9fa48("855"), "U"),
          Ф: stryMutAct_9fa48("856") ? "" : (stryCov_9fa48("856"), "F"),
          Х: stryMutAct_9fa48("857") ? "" : (stryCov_9fa48("857"), "H"),
          Ц: stryMutAct_9fa48("858") ? "" : (stryCov_9fa48("858"), "C"),
          Ч: stryMutAct_9fa48("859") ? "" : (stryCov_9fa48("859"), "Č"),
          Ш: stryMutAct_9fa48("860") ? "" : (stryCov_9fa48("860"), "Š"),
      });
function isCyrillicLetter(ch: string): boolean {
    if (stryMutAct_9fa48("861")) {
        {
        }
    } else {
        stryCov_9fa48("861");
        const code = ch.codePointAt(0);
        if (
            stryMutAct_9fa48("864")
                ? code != null
                : stryMutAct_9fa48("863")
                  ? false
                  : stryMutAct_9fa48("862")
                    ? true
                    : (stryCov_9fa48("862", "863", "864"), code == null)
        ) {
            if (stryMutAct_9fa48("865")) {
                {
                }
            } else {
                stryCov_9fa48("865");
                return stryMutAct_9fa48("866") ? true : (stryCov_9fa48("866"), false);
            }
        }
        return stryMutAct_9fa48("869")
            ? code >= 0x0400 || code <= 0x052f
            : stryMutAct_9fa48("868")
              ? false
              : stryMutAct_9fa48("867")
                ? true
                : (stryCov_9fa48("867", "868", "869"),
                  (stryMutAct_9fa48("872")
                      ? code < 0x0400
                      : stryMutAct_9fa48("871")
                        ? code > 0x0400
                        : stryMutAct_9fa48("870")
                          ? true
                          : (stryCov_9fa48("870", "871", "872"), code >= 0x0400)) &&
                      (stryMutAct_9fa48("875")
                          ? code > 0x052f
                          : stryMutAct_9fa48("874")
                            ? code < 0x052f
                            : stryMutAct_9fa48("873")
                              ? true
                              : (stryCov_9fa48("873", "874", "875"), code <= 0x052f)));
    }
}
function isLatinLetterSr(ch: string): boolean {
    if (stryMutAct_9fa48("876")) {
        {
        }
    } else {
        stryCov_9fa48("876");
        return (
            stryMutAct_9fa48("877") ? /[^A-Za-zČčĆćĐđŠšŽž]/ : (stryCov_9fa48("877"), /[A-Za-zČčĆćĐđŠšŽž]/)
        ).test(ch);
    }
}
export function detectMajorityScript(text: string): ScriptMajority {
    if (stryMutAct_9fa48("878")) {
        {
        }
    } else {
        stryCov_9fa48("878");
        let lat = 0;
        let cyr = 0;
        for (const ch of text) {
            if (stryMutAct_9fa48("879")) {
                {
                }
            } else {
                stryCov_9fa48("879");
                if (
                    stryMutAct_9fa48("881")
                        ? false
                        : stryMutAct_9fa48("880")
                          ? true
                          : (stryCov_9fa48("880", "881"), isCyrillicLetter(ch))
                ) {
                    if (stryMutAct_9fa48("882")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("882");
                        stryMutAct_9fa48("883") ? cyr-- : (stryCov_9fa48("883"), cyr++);
                    }
                } else if (
                    stryMutAct_9fa48("885")
                        ? false
                        : stryMutAct_9fa48("884")
                          ? true
                          : (stryCov_9fa48("884", "885"), isLatinLetterSr(ch))
                ) {
                    if (stryMutAct_9fa48("886")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("886");
                        stryMutAct_9fa48("887") ? lat-- : (stryCov_9fa48("887"), lat++);
                    }
                }
            }
        }
        return (
            stryMutAct_9fa48("891")
                ? lat < cyr
                : stryMutAct_9fa48("890")
                  ? lat > cyr
                  : stryMutAct_9fa48("889")
                    ? false
                    : stryMutAct_9fa48("888")
                      ? true
                      : (stryCov_9fa48("888", "889", "890", "891"), lat >= cyr)
        )
            ? stryMutAct_9fa48("892")
                ? ""
                : (stryCov_9fa48("892"), "latin")
            : stryMutAct_9fa48("893")
              ? ""
              : (stryCov_9fa48("893"), "cyrillic");
    }
}
function latinDigraphLjNjToCyr(two: string): string | null {
    if (stryMutAct_9fa48("894")) {
        {
        }
    } else {
        stryCov_9fa48("894");
        if (
            stryMutAct_9fa48("898")
                ? two.length >= 2
                : stryMutAct_9fa48("897")
                  ? two.length <= 2
                  : stryMutAct_9fa48("896")
                    ? false
                    : stryMutAct_9fa48("895")
                      ? true
                      : (stryCov_9fa48("895", "896", "897", "898"), two.length < 2)
        )
            return null;
        const a = two[0];
        const b = two[1];
        const lower = stryMutAct_9fa48("899")
            ? (a + b).toUpperCase()
            : (stryCov_9fa48("899"),
              (stryMutAct_9fa48("900") ? a - b : (stryCov_9fa48("900"), a + b)).toLowerCase());
        if (
            stryMutAct_9fa48("903")
                ? lower !== "lj"
                : stryMutAct_9fa48("902")
                  ? false
                  : stryMutAct_9fa48("901")
                    ? true
                    : (stryCov_9fa48("901", "902", "903"),
                      lower === (stryMutAct_9fa48("904") ? "" : (stryCov_9fa48("904"), "lj")))
        ) {
            if (stryMutAct_9fa48("905")) {
                {
                }
            } else {
                stryCov_9fa48("905");
                const isUpper = stryMutAct_9fa48("908")
                    ? a === a.toUpperCase() && b === b.toUpperCase()
                    : stryMutAct_9fa48("907")
                      ? false
                      : stryMutAct_9fa48("906")
                        ? true
                        : (stryCov_9fa48("906", "907", "908"),
                          (stryMutAct_9fa48("910")
                              ? a !== a.toUpperCase()
                              : stryMutAct_9fa48("909")
                                ? false
                                : (stryCov_9fa48("909", "910"),
                                  a ===
                                      (stryMutAct_9fa48("911")
                                          ? a.toLowerCase()
                                          : (stryCov_9fa48("911"), a.toUpperCase())))) ||
                              (stryMutAct_9fa48("913")
                                  ? b !== b.toUpperCase()
                                  : stryMutAct_9fa48("912")
                                    ? false
                                    : (stryCov_9fa48("912", "913"),
                                      b ===
                                          (stryMutAct_9fa48("914")
                                              ? b.toLowerCase()
                                              : (stryCov_9fa48("914"), b.toUpperCase())))));
                return isUpper
                    ? stryMutAct_9fa48("915")
                        ? ""
                        : (stryCov_9fa48("915"), "Љ")
                    : stryMutAct_9fa48("916")
                      ? ""
                      : (stryCov_9fa48("916"), "љ");
            }
        }
        if (
            stryMutAct_9fa48("919")
                ? lower !== "nj"
                : stryMutAct_9fa48("918")
                  ? false
                  : stryMutAct_9fa48("917")
                    ? true
                    : (stryCov_9fa48("917", "918", "919"),
                      lower === (stryMutAct_9fa48("920") ? "" : (stryCov_9fa48("920"), "nj")))
        ) {
            if (stryMutAct_9fa48("921")) {
                {
                }
            } else {
                stryCov_9fa48("921");
                const isUpper = stryMutAct_9fa48("924")
                    ? a === a.toUpperCase() && b === b.toUpperCase()
                    : stryMutAct_9fa48("923")
                      ? false
                      : stryMutAct_9fa48("922")
                        ? true
                        : (stryCov_9fa48("922", "923", "924"),
                          (stryMutAct_9fa48("926")
                              ? a !== a.toUpperCase()
                              : stryMutAct_9fa48("925")
                                ? false
                                : (stryCov_9fa48("925", "926"),
                                  a ===
                                      (stryMutAct_9fa48("927")
                                          ? a.toLowerCase()
                                          : (stryCov_9fa48("927"), a.toUpperCase())))) ||
                              (stryMutAct_9fa48("929")
                                  ? b !== b.toUpperCase()
                                  : stryMutAct_9fa48("928")
                                    ? false
                                    : (stryCov_9fa48("928", "929"),
                                      b ===
                                          (stryMutAct_9fa48("930")
                                              ? b.toLowerCase()
                                              : (stryCov_9fa48("930"), b.toUpperCase())))));
                return isUpper
                    ? stryMutAct_9fa48("931")
                        ? ""
                        : (stryCov_9fa48("931"), "Њ")
                    : stryMutAct_9fa48("932")
                      ? ""
                      : (stryCov_9fa48("932"), "њ");
            }
        }
        return null;
    }
}
function latinDigraphDžToCyr(two: string): string | null {
    if (stryMutAct_9fa48("933")) {
        {
        }
    } else {
        stryCov_9fa48("933");
        if (
            stryMutAct_9fa48("937")
                ? two.length >= 2
                : stryMutAct_9fa48("936")
                  ? two.length <= 2
                  : stryMutAct_9fa48("935")
                    ? false
                    : stryMutAct_9fa48("934")
                      ? true
                      : (stryCov_9fa48("934", "935", "936", "937"), two.length < 2)
        )
            return null;
        const a = two[0];
        const b = two[1];
        if (
            stryMutAct_9fa48("940")
                ? (a + b).toLowerCase() === "dž"
                : stryMutAct_9fa48("939")
                  ? false
                  : stryMutAct_9fa48("938")
                    ? true
                    : (stryCov_9fa48("938", "939", "940"),
                      (stryMutAct_9fa48("941")
                          ? (a + b).toUpperCase()
                          : (stryCov_9fa48("941"),
                            (stryMutAct_9fa48("942")
                                ? a - b
                                : (stryCov_9fa48("942"), a + b)
                            ).toLowerCase())) !==
                          (stryMutAct_9fa48("943") ? "" : (stryCov_9fa48("943"), "dž")))
        ) {
            if (stryMutAct_9fa48("944")) {
                {
                }
            } else {
                stryCov_9fa48("944");
                return null;
            }
        }
        const isUpper = stryMutAct_9fa48("947")
            ? a === a.toUpperCase() && b === b.toUpperCase()
            : stryMutAct_9fa48("946")
              ? false
              : stryMutAct_9fa48("945")
                ? true
                : (stryCov_9fa48("945", "946", "947"),
                  (stryMutAct_9fa48("949")
                      ? a !== a.toUpperCase()
                      : stryMutAct_9fa48("948")
                        ? false
                        : (stryCov_9fa48("948", "949"),
                          a ===
                              (stryMutAct_9fa48("950")
                                  ? a.toLowerCase()
                                  : (stryCov_9fa48("950"), a.toUpperCase())))) ||
                      (stryMutAct_9fa48("952")
                          ? b !== b.toUpperCase()
                          : stryMutAct_9fa48("951")
                            ? false
                            : (stryCov_9fa48("951", "952"),
                              b ===
                                  (stryMutAct_9fa48("953")
                                      ? b.toLowerCase()
                                      : (stryCov_9fa48("953"), b.toUpperCase())))));
        return isUpper
            ? stryMutAct_9fa48("954")
                ? ""
                : (stryCov_9fa48("954"), "Џ")
            : stryMutAct_9fa48("955")
              ? ""
              : (stryCov_9fa48("955"), "џ");
    }
}
function cyrDigraphToLatin(cyr: "Љ" | "Њ" | "Џ" | "љ" | "њ" | "џ", nextChar?: string): string {
    if (stryMutAct_9fa48("956")) {
        {
        }
    } else {
        stryCov_9fa48("956");
        const isUpper = stryMutAct_9fa48("959")
            ? (cyr === "Љ" || cyr === "Њ") && cyr === "Џ"
            : stryMutAct_9fa48("958")
              ? false
              : stryMutAct_9fa48("957")
                ? true
                : (stryCov_9fa48("957", "958", "959"),
                  (stryMutAct_9fa48("961")
                      ? cyr === "Љ" && cyr === "Њ"
                      : stryMutAct_9fa48("960")
                        ? false
                        : (stryCov_9fa48("960", "961"),
                          (stryMutAct_9fa48("963")
                              ? cyr !== "Љ"
                              : stryMutAct_9fa48("962")
                                ? false
                                : (stryCov_9fa48("962", "963"),
                                  cyr === (stryMutAct_9fa48("964") ? "" : (stryCov_9fa48("964"), "Љ")))) ||
                              (stryMutAct_9fa48("966")
                                  ? cyr !== "Њ"
                                  : stryMutAct_9fa48("965")
                                    ? false
                                    : (stryCov_9fa48("965", "966"),
                                      cyr ===
                                          (stryMutAct_9fa48("967") ? "" : (stryCov_9fa48("967"), "Њ")))))) ||
                      (stryMutAct_9fa48("969")
                          ? cyr !== "Џ"
                          : stryMutAct_9fa48("968")
                            ? false
                            : (stryCov_9fa48("968", "969"),
                              cyr === (stryMutAct_9fa48("970") ? "" : (stryCov_9fa48("970"), "Џ")))));
        if (
            stryMutAct_9fa48("973")
                ? false
                : stryMutAct_9fa48("972")
                  ? true
                  : stryMutAct_9fa48("971")
                    ? isUpper
                    : (stryCov_9fa48("971", "972", "973"), !isUpper)
        ) {
            if (stryMutAct_9fa48("974")) {
                {
                }
            } else {
                stryCov_9fa48("974");
                if (
                    stryMutAct_9fa48("977")
                        ? cyr !== "љ"
                        : stryMutAct_9fa48("976")
                          ? false
                          : stryMutAct_9fa48("975")
                            ? true
                            : (stryCov_9fa48("975", "976", "977"),
                              cyr === (stryMutAct_9fa48("978") ? "" : (stryCov_9fa48("978"), "љ")))
                )
                    return stryMutAct_9fa48("979") ? "" : (stryCov_9fa48("979"), "lj");
                if (
                    stryMutAct_9fa48("982")
                        ? cyr !== "њ"
                        : stryMutAct_9fa48("981")
                          ? false
                          : stryMutAct_9fa48("980")
                            ? true
                            : (stryCov_9fa48("980", "981", "982"),
                              cyr === (stryMutAct_9fa48("983") ? "" : (stryCov_9fa48("983"), "њ")))
                )
                    return stryMutAct_9fa48("984") ? "" : (stryCov_9fa48("984"), "nj");
                return stryMutAct_9fa48("985") ? "" : (stryCov_9fa48("985"), "dž");
            }
        }
        const nextIsUpperCyr = stryMutAct_9fa48("988")
            ? (!!nextChar && isCyrillicLetter(nextChar)) || nextChar.toUpperCase() === nextChar
            : stryMutAct_9fa48("987")
              ? false
              : stryMutAct_9fa48("986")
                ? true
                : (stryCov_9fa48("986", "987", "988"),
                  (stryMutAct_9fa48("990")
                      ? !!nextChar || isCyrillicLetter(nextChar)
                      : stryMutAct_9fa48("989")
                        ? true
                        : (stryCov_9fa48("989", "990"),
                          (stryMutAct_9fa48("991")
                              ? !nextChar
                              : (stryCov_9fa48("991"),
                                !(stryMutAct_9fa48("992") ? nextChar : (stryCov_9fa48("992"), !nextChar)))) &&
                              isCyrillicLetter(nextChar))) &&
                      (stryMutAct_9fa48("994")
                          ? nextChar.toUpperCase() !== nextChar
                          : stryMutAct_9fa48("993")
                            ? true
                            : (stryCov_9fa48("993", "994"),
                              (stryMutAct_9fa48("995")
                                  ? nextChar.toLowerCase()
                                  : (stryCov_9fa48("995"), nextChar.toUpperCase())) === nextChar)));
        if (
            stryMutAct_9fa48("998")
                ? cyr !== "Љ"
                : stryMutAct_9fa48("997")
                  ? false
                  : stryMutAct_9fa48("996")
                    ? true
                    : (stryCov_9fa48("996", "997", "998"),
                      cyr === (stryMutAct_9fa48("999") ? "" : (stryCov_9fa48("999"), "Љ")))
        )
            return nextIsUpperCyr
                ? stryMutAct_9fa48("1000")
                    ? ""
                    : (stryCov_9fa48("1000"), "LJ")
                : stryMutAct_9fa48("1001")
                  ? ""
                  : (stryCov_9fa48("1001"), "Lj");
        if (
            stryMutAct_9fa48("1004")
                ? cyr !== "Њ"
                : stryMutAct_9fa48("1003")
                  ? false
                  : stryMutAct_9fa48("1002")
                    ? true
                    : (stryCov_9fa48("1002", "1003", "1004"),
                      cyr === (stryMutAct_9fa48("1005") ? "" : (stryCov_9fa48("1005"), "Њ")))
        )
            return nextIsUpperCyr
                ? stryMutAct_9fa48("1006")
                    ? ""
                    : (stryCov_9fa48("1006"), "NJ")
                : stryMutAct_9fa48("1007")
                  ? ""
                  : (stryCov_9fa48("1007"), "Nj");
        return nextIsUpperCyr
            ? stryMutAct_9fa48("1008")
                ? ""
                : (stryCov_9fa48("1008"), "DŽ")
            : stryMutAct_9fa48("1009")
              ? ""
              : (stryCov_9fa48("1009"), "Dž");
    }
}
export function latinToCyrillic(text: string): string {
    if (stryMutAct_9fa48("1010")) {
        {
        }
    } else {
        stryCov_9fa48("1010");
        let out = stryMutAct_9fa48("1011") ? "Stryker was here!" : (stryCov_9fa48("1011"), "");
        for (
            let i = 0;
            stryMutAct_9fa48("1014")
                ? i >= text.length
                : stryMutAct_9fa48("1013")
                  ? i <= text.length
                  : stryMutAct_9fa48("1012")
                    ? false
                    : (stryCov_9fa48("1012", "1013", "1014"), i < text.length);
        ) {
            if (stryMutAct_9fa48("1015")) {
                {
                }
            } else {
                stryCov_9fa48("1015");
                // 1) DŽ (2 chars) ima prioritet
                if (
                    stryMutAct_9fa48("1019")
                        ? i + 1 >= text.length
                        : stryMutAct_9fa48("1018")
                          ? i + 1 <= text.length
                          : stryMutAct_9fa48("1017")
                            ? false
                            : stryMutAct_9fa48("1016")
                              ? true
                              : (stryCov_9fa48("1016", "1017", "1018", "1019"),
                                (stryMutAct_9fa48("1020") ? i - 1 : (stryCov_9fa48("1020"), i + 1)) <
                                    text.length)
                ) {
                    if (stryMutAct_9fa48("1021")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1021");
                        const two = stryMutAct_9fa48("1022")
                            ? text
                            : (stryCov_9fa48("1022"),
                              text.slice(
                                  i,
                                  stryMutAct_9fa48("1023") ? i - 2 : (stryCov_9fa48("1023"), i + 2)
                              ));
                        const dž = latinDigraphDžToCyr(two);
                        if (
                            stryMutAct_9fa48("1025")
                                ? false
                                : stryMutAct_9fa48("1024")
                                  ? true
                                  : (stryCov_9fa48("1024", "1025"), dž)
                        ) {
                            if (stryMutAct_9fa48("1026")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("1026");
                                stryMutAct_9fa48("1027") ? (out -= dž) : (stryCov_9fa48("1027"), (out += dž));
                                stryMutAct_9fa48("1028") ? (i -= 2) : (stryCov_9fa48("1028"), (i += 2));
                                continue;
                            }
                        }
                    }
                }

                // 2) LJ / NJ
                if (
                    stryMutAct_9fa48("1032")
                        ? i + 1 >= text.length
                        : stryMutAct_9fa48("1031")
                          ? i + 1 <= text.length
                          : stryMutAct_9fa48("1030")
                            ? false
                            : stryMutAct_9fa48("1029")
                              ? true
                              : (stryCov_9fa48("1029", "1030", "1031", "1032"),
                                (stryMutAct_9fa48("1033") ? i - 1 : (stryCov_9fa48("1033"), i + 1)) <
                                    text.length)
                ) {
                    if (stryMutAct_9fa48("1034")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1034");
                        const two = stryMutAct_9fa48("1035")
                            ? text
                            : (stryCov_9fa48("1035"),
                              text.slice(
                                  i,
                                  stryMutAct_9fa48("1036") ? i - 2 : (stryCov_9fa48("1036"), i + 2)
                              ));
                        const dig = latinDigraphLjNjToCyr(two);
                        if (
                            stryMutAct_9fa48("1038")
                                ? false
                                : stryMutAct_9fa48("1037")
                                  ? true
                                  : (stryCov_9fa48("1037", "1038"), dig)
                        ) {
                            if (stryMutAct_9fa48("1039")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("1039");
                                stryMutAct_9fa48("1040")
                                    ? (out -= dig)
                                    : (stryCov_9fa48("1040"), (out += dig));
                                stryMutAct_9fa48("1041") ? (i -= 2) : (stryCov_9fa48("1041"), (i += 2));
                                continue;
                            }
                        }
                    }
                }

                // 3) single-char map
                const ch = text[i];
                if (
                    stryMutAct_9fa48("1044")
                        ? false
                        : stryMutAct_9fa48("1043")
                          ? true
                          : stryMutAct_9fa48("1042")
                            ? ch
                            : (stryCov_9fa48("1042", "1043", "1044"), !ch)
                )
                    continue;
                stryMutAct_9fa48("1045")
                    ? (out -= LAT_TO_CYR_1[ch] ?? ch)
                    : (stryCov_9fa48("1045"),
                      (out += stryMutAct_9fa48("1046")
                          ? LAT_TO_CYR_1[ch] && ch
                          : (stryCov_9fa48("1046"), LAT_TO_CYR_1[ch] ?? ch)));
                stryMutAct_9fa48("1047") ? i-- : (stryCov_9fa48("1047"), i++);
            }
        }
        return out;
    }
}
export function cyrillicToLatin(text: string): string {
    if (stryMutAct_9fa48("1048")) {
        {
        }
    } else {
        stryCov_9fa48("1048");
        let out = stryMutAct_9fa48("1049") ? "Stryker was here!" : (stryCov_9fa48("1049"), "");
        for (
            let i = 0;
            stryMutAct_9fa48("1052")
                ? i >= text.length
                : stryMutAct_9fa48("1051")
                  ? i <= text.length
                  : stryMutAct_9fa48("1050")
                    ? false
                    : (stryCov_9fa48("1050", "1051", "1052"), i < text.length);
            stryMutAct_9fa48("1053") ? i-- : (stryCov_9fa48("1053"), i++)
        ) {
            if (stryMutAct_9fa48("1054")) {
                {
                }
            } else {
                stryCov_9fa48("1054");
                const ch = text[i];
                if (
                    stryMutAct_9fa48("1057")
                        ? false
                        : stryMutAct_9fa48("1056")
                          ? true
                          : stryMutAct_9fa48("1055")
                            ? ch
                            : (stryCov_9fa48("1055", "1056", "1057"), !ch)
                )
                    continue;
                if (
                    stryMutAct_9fa48("1060")
                        ? (ch === "Љ" || ch === "Њ" || ch === "Џ" || ch === "љ" || ch === "њ") && ch === "џ"
                        : stryMutAct_9fa48("1059")
                          ? false
                          : stryMutAct_9fa48("1058")
                            ? true
                            : (stryCov_9fa48("1058", "1059", "1060"),
                              (stryMutAct_9fa48("1062")
                                  ? (ch === "Љ" || ch === "Њ" || ch === "Џ" || ch === "љ") && ch === "њ"
                                  : stryMutAct_9fa48("1061")
                                    ? false
                                    : (stryCov_9fa48("1061", "1062"),
                                      (stryMutAct_9fa48("1064")
                                          ? (ch === "Љ" || ch === "Њ" || ch === "Џ") && ch === "љ"
                                          : stryMutAct_9fa48("1063")
                                            ? false
                                            : (stryCov_9fa48("1063", "1064"),
                                              (stryMutAct_9fa48("1066")
                                                  ? (ch === "Љ" || ch === "Њ") && ch === "Џ"
                                                  : stryMutAct_9fa48("1065")
                                                    ? false
                                                    : (stryCov_9fa48("1065", "1066"),
                                                      (stryMutAct_9fa48("1068")
                                                          ? ch === "Љ" && ch === "Њ"
                                                          : stryMutAct_9fa48("1067")
                                                            ? false
                                                            : (stryCov_9fa48("1067", "1068"),
                                                              (stryMutAct_9fa48("1070")
                                                                  ? ch !== "Љ"
                                                                  : stryMutAct_9fa48("1069")
                                                                    ? false
                                                                    : (stryCov_9fa48("1069", "1070"),
                                                                      ch ===
                                                                          (stryMutAct_9fa48("1071")
                                                                              ? ""
                                                                              : (stryCov_9fa48("1071"),
                                                                                "Љ")))) ||
                                                                  (stryMutAct_9fa48("1073")
                                                                      ? ch !== "Њ"
                                                                      : stryMutAct_9fa48("1072")
                                                                        ? false
                                                                        : (stryCov_9fa48("1072", "1073"),
                                                                          ch ===
                                                                              (stryMutAct_9fa48("1074")
                                                                                  ? ""
                                                                                  : (stryCov_9fa48("1074"),
                                                                                    "Њ")))))) ||
                                                          (stryMutAct_9fa48("1076")
                                                              ? ch !== "Џ"
                                                              : stryMutAct_9fa48("1075")
                                                                ? false
                                                                : (stryCov_9fa48("1075", "1076"),
                                                                  ch ===
                                                                      (stryMutAct_9fa48("1077")
                                                                          ? ""
                                                                          : (stryCov_9fa48("1077"),
                                                                            "Џ")))))) ||
                                                  (stryMutAct_9fa48("1079")
                                                      ? ch !== "љ"
                                                      : stryMutAct_9fa48("1078")
                                                        ? false
                                                        : (stryCov_9fa48("1078", "1079"),
                                                          ch ===
                                                              (stryMutAct_9fa48("1080")
                                                                  ? ""
                                                                  : (stryCov_9fa48("1080"), "љ")))))) ||
                                          (stryMutAct_9fa48("1082")
                                              ? ch !== "њ"
                                              : stryMutAct_9fa48("1081")
                                                ? false
                                                : (stryCov_9fa48("1081", "1082"),
                                                  ch ===
                                                      (stryMutAct_9fa48("1083")
                                                          ? ""
                                                          : (stryCov_9fa48("1083"), "њ")))))) ||
                                  (stryMutAct_9fa48("1085")
                                      ? ch !== "џ"
                                      : stryMutAct_9fa48("1084")
                                        ? false
                                        : (stryCov_9fa48("1084", "1085"),
                                          ch ===
                                              (stryMutAct_9fa48("1086")
                                                  ? ""
                                                  : (stryCov_9fa48("1086"), "џ")))))
                ) {
                    if (stryMutAct_9fa48("1087")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1087");
                        const next = (
                            stryMutAct_9fa48("1091")
                                ? i + 1 >= text.length
                                : stryMutAct_9fa48("1090")
                                  ? i + 1 <= text.length
                                  : stryMutAct_9fa48("1089")
                                    ? false
                                    : stryMutAct_9fa48("1088")
                                      ? true
                                      : (stryCov_9fa48("1088", "1089", "1090", "1091"),
                                        (stryMutAct_9fa48("1092") ? i - 1 : (stryCov_9fa48("1092"), i + 1)) <
                                            text.length)
                        )
                            ? text[stryMutAct_9fa48("1093") ? i - 1 : (stryCov_9fa48("1093"), i + 1)]
                            : undefined;
                        stryMutAct_9fa48("1094")
                            ? (out -= cyrDigraphToLatin(ch as "Љ" | "Њ" | "Џ" | "љ" | "њ" | "џ", next))
                            : (stryCov_9fa48("1094"),
                              (out += cyrDigraphToLatin(ch as "Љ" | "Њ" | "Џ" | "љ" | "њ" | "џ", next)));
                        continue;
                    }
                }
                stryMutAct_9fa48("1095")
                    ? (out -= CYR_TO_LAT_1[ch] ?? ch)
                    : (stryCov_9fa48("1095"),
                      (out += stryMutAct_9fa48("1096")
                          ? CYR_TO_LAT_1[ch] && ch
                          : (stryCov_9fa48("1096"), CYR_TO_LAT_1[ch] ?? ch)));
            }
        }
        return out;
    }
}
