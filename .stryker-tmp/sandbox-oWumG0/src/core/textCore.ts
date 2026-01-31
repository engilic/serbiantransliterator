// @ts-nocheck
// src/core/textCore.ts
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
import { ALWAYS_LATIN_PHRASES, ALWAYS_LATIN_TOKENS_STRICT } from "./rules";
import { applyPreCorrectionsLatToCyr } from "./corrections";
import { fixSerbianQuotes } from "./quotes";
import { collectProtectedRanges, splitByRanges, type CurlyProtection } from "./protect";
import { cyrillicToLatin, detectMajorityScript, latinToCyrillic } from "./serbian";
import { tokenize } from "./tokenizer";
import {
    normKey,
    shouldProtectRomanToken,
    shouldProtectAmbiguousBrandToken,
    shouldProtectHeuristic,
} from "./heuristics";
import * as wasmPkg from "../wasm-core/pkg";
import wasmBase64 from "../wasm-core/pkg/index_bg.wasm";
import dictE2iData from "../static/assets/dict_e2i.bin";
import dictI2eData from "../static/assets/dict_i2e.bin";
interface WasmModule {
    load_dictionary_bin: (mode: string, bin_data: Uint8Array) => void;
    to_cyrillic: (text: string) => string;
    to_latin: (text: string) => string;
    convert_dialect: (text: string, mode: string) => string;
    init_replacer: (json: string) => void;
    apply_replacements: (text: string) => string;
}
interface WasmPackage {
    initSync: (module: WebAssembly.Module) => unknown;
}

// Ovde čuvamo referencu na modul koji koristimo (Wrapperi)
let wasmModule: WasmModule | null = null;
export function detectScript(text: string): "latin" | "cyrillic" {
    if (stryMutAct_9fa48("1097")) {
        {
        }
    } else {
        stryCov_9fa48("1097");
        return detectMajorityScript(
            String(
                stryMutAct_9fa48("1100")
                    ? text && ""
                    : stryMutAct_9fa48("1099")
                      ? false
                      : stryMutAct_9fa48("1098")
                        ? true
                        : (stryCov_9fa48("1098", "1099", "1100"),
                          text ||
                              (stryMutAct_9fa48("1101") ? "Stryker was here!" : (stryCov_9fa48("1101"), "")))
            )
        );
    }
}
function dataUriToBytes(dataUri: string | null | undefined): Uint8Array {
    if (stryMutAct_9fa48("1102")) {
        {
        }
    } else {
        stryCov_9fa48("1102");
        const str = String(
            stryMutAct_9fa48("1105")
                ? dataUri && ""
                : stryMutAct_9fa48("1104")
                  ? false
                  : stryMutAct_9fa48("1103")
                    ? true
                    : (stryCov_9fa48("1103", "1104", "1105"),
                      dataUri ||
                          (stryMutAct_9fa48("1106") ? "Stryker was here!" : (stryCov_9fa48("1106"), "")))
        );
        const parts = str.split(stryMutAct_9fa48("1107") ? "" : (stryCov_9fa48("1107"), ","));
        const base64 = (
            stryMutAct_9fa48("1111")
                ? parts.length <= 1
                : stryMutAct_9fa48("1110")
                  ? parts.length >= 1
                  : stryMutAct_9fa48("1109")
                    ? false
                    : stryMutAct_9fa48("1108")
                      ? true
                      : (stryCov_9fa48("1108", "1109", "1110", "1111"), parts.length > 1)
        )
            ? parts[1]
            : null;
        if (
            stryMutAct_9fa48("1114")
                ? false
                : stryMutAct_9fa48("1113")
                  ? true
                  : stryMutAct_9fa48("1112")
                    ? base64
                    : (stryCov_9fa48("1112", "1113", "1114"), !base64)
        )
            return new Uint8Array(0);
        const binaryStr = window.atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (
            let i = 0;
            stryMutAct_9fa48("1117")
                ? i >= binaryStr.length
                : stryMutAct_9fa48("1116")
                  ? i <= binaryStr.length
                  : stryMutAct_9fa48("1115")
                    ? false
                    : (stryCov_9fa48("1115", "1116", "1117"), i < binaryStr.length);
            stryMutAct_9fa48("1118") ? i-- : (stryCov_9fa48("1118"), i++)
        ) {
            if (stryMutAct_9fa48("1119")) {
                {
                }
            } else {
                stryCov_9fa48("1119");
                bytes[i] = binaryStr.charCodeAt(i);
            }
        }
        return bytes;
    }
}
export function setWasmModule(module: unknown) {
    if (stryMutAct_9fa48("1120")) {
        {
        }
    } else {
        stryCov_9fa48("1120");
        wasmModule = module as WasmModule;
    }
}
export async function initWasm() {
    if (stryMutAct_9fa48("1121")) {
        {
        }
    } else {
        stryCov_9fa48("1121");
        if (
            stryMutAct_9fa48("1123")
                ? false
                : stryMutAct_9fa48("1122")
                  ? true
                  : (stryCov_9fa48("1122", "1123"), wasmModule)
        )
            return;
        try {
            if (stryMutAct_9fa48("1124")) {
                {
                }
            } else {
                stryCov_9fa48("1124");
                console.log(
                    stryMutAct_9fa48("1125")
                        ? ""
                        : (stryCov_9fa48("1125"),
                          "[textCore] Inicijalizacija WASM jezgra (Inline/Fallback)...")
                );
                const wasmBytes = dataUriToBytes(wasmBase64 as unknown as string);
                const module = new WebAssembly.Module(wasmBytes as BufferSource);

                // 1. Inicijalizujemo stanje unutar pkg modula
                (wasmPkg as unknown as WasmPackage).initSync(module);

                // [CRITICAL FIX] 2. Dodeljujemo CEO PAKET (wrappere), a ne rezultat initSync-a!
                // Stari kod: wasmModule = exports; -> GREŠKA "1,0"
                wasmModule = wasmPkg as unknown as WasmModule;
                const b1 = dataUriToBytes(dictE2iData as unknown as string);
                const b2 = dataUriToBytes(dictI2eData as unknown as string);
                wasmModule.load_dictionary_bin(
                    stryMutAct_9fa48("1126") ? "" : (stryCov_9fa48("1126"), "e2i"),
                    b1
                );
                wasmModule.load_dictionary_bin(
                    stryMutAct_9fa48("1127") ? "" : (stryCov_9fa48("1127"), "i2e"),
                    b2
                );
                wasmModule.init_replacer(stryMutAct_9fa48("1128") ? "" : (stryCov_9fa48("1128"), "{}"));
                console.log(
                    stryMutAct_9fa48("1129")
                        ? ""
                        : (stryCov_9fa48("1129"), "[textCore] WASM jezgro spremno (Fallback).")
                );
            }
        } catch (e) {
            if (stryMutAct_9fa48("1130")) {
                {
                }
            } else {
                stryCov_9fa48("1130");
                console.error(
                    stryMutAct_9fa48("1131")
                        ? ""
                        : (stryCov_9fa48("1131"), "[textCore] Neuspešna inicijalizacija WASM-a:"),
                    e
                );
            }
        }
    }
}
export type Direction = "auto" | "lat-to-cyr" | "cyr-to-lat";
export type Dialect = "none" | "ekavica_to_ijekavica" | "ijekavica_to_ekavica";
export interface CoreOptions {
    userProtected?: string[];
    protectBrands?: boolean;
    applySerbianQuotes?: boolean;
    preserveCodeBlocks?: boolean;
    curlyProtection?: CurlyProtection;
    customSubstitutions?: Record<string, string>;
    dialect?: Dialect;
    ignoredStyles?: string[];
}
export function convertPlainText(
    text: string,
    direction: Direction = stryMutAct_9fa48("1132") ? "" : (stryCov_9fa48("1132"), "auto"),
    options?: CoreOptions
): {
    text: string;
    type: string;
} {
    if (stryMutAct_9fa48("1133")) {
        {
        }
    } else {
        stryCov_9fa48("1133");
        const safeText = String(
            stryMutAct_9fa48("1136")
                ? text && ""
                : stryMutAct_9fa48("1135")
                  ? false
                  : stryMutAct_9fa48("1134")
                    ? true
                    : (stryCov_9fa48("1134", "1135", "1136"),
                      text || (stryMutAct_9fa48("1137") ? "Stryker was here!" : (stryCov_9fa48("1137"), "")))
        );
        if (
            stryMutAct_9fa48("1140")
                ? false
                : stryMutAct_9fa48("1139")
                  ? true
                  : stryMutAct_9fa48("1138")
                    ? safeText.trim()
                    : (stryCov_9fa48("1138", "1139", "1140"),
                      !(stryMutAct_9fa48("1141") ? safeText : (stryCov_9fa48("1141"), safeText.trim())))
        )
            return stryMutAct_9fa48("1142")
                ? {}
                : (stryCov_9fa48("1142"),
                  {
                      text: safeText,
                      type: stryMutAct_9fa48("1143") ? "" : (stryCov_9fa48("1143"), "Nema teksta"),
                  });
        const protectBrands = stryMutAct_9fa48("1146")
            ? options?.protectBrands === false
            : stryMutAct_9fa48("1145")
              ? false
              : stryMutAct_9fa48("1144")
                ? true
                : (stryCov_9fa48("1144", "1145", "1146"),
                  (stryMutAct_9fa48("1147")
                      ? options.protectBrands
                      : (stryCov_9fa48("1147"), options?.protectBrands)) !==
                      (stryMutAct_9fa48("1148") ? true : (stryCov_9fa48("1148"), false)));
        const preserveCodeBlocks = stryMutAct_9fa48("1151")
            ? options?.preserveCodeBlocks === false
            : stryMutAct_9fa48("1150")
              ? false
              : stryMutAct_9fa48("1149")
                ? true
                : (stryCov_9fa48("1149", "1150", "1151"),
                  (stryMutAct_9fa48("1152")
                      ? options.preserveCodeBlocks
                      : (stryCov_9fa48("1152"), options?.preserveCodeBlocks)) !==
                      (stryMutAct_9fa48("1153") ? true : (stryCov_9fa48("1153"), false)));
        const userProtected = stryMutAct_9fa48("1154")
            ? options?.userProtected && []
            : (stryCov_9fa48("1154"),
              (stryMutAct_9fa48("1155")
                  ? options.userProtected
                  : (stryCov_9fa48("1155"), options?.userProtected)) ??
                  (stryMutAct_9fa48("1156") ? ["Stryker was here"] : (stryCov_9fa48("1156"), [])));
        const curlyProtection: CurlyProtection = stryMutAct_9fa48("1157")
            ? options?.curlyProtection && "placeholders"
            : (stryCov_9fa48("1157"),
              (stryMutAct_9fa48("1158")
                  ? options.curlyProtection
                  : (stryCov_9fa48("1158"), options?.curlyProtection)) ??
                  (stryMutAct_9fa48("1159") ? "" : (stryCov_9fa48("1159"), "placeholders")));
        let toCyr: boolean;
        if (
            stryMutAct_9fa48("1162")
                ? direction !== "auto"
                : stryMutAct_9fa48("1161")
                  ? false
                  : stryMutAct_9fa48("1160")
                    ? true
                    : (stryCov_9fa48("1160", "1161", "1162"),
                      direction === (stryMutAct_9fa48("1163") ? "" : (stryCov_9fa48("1163"), "auto")))
        ) {
            if (stryMutAct_9fa48("1164")) {
                {
                }
            } else {
                stryCov_9fa48("1164");
                toCyr = stryMutAct_9fa48("1167")
                    ? detectMajorityScript(safeText) !== "latin"
                    : stryMutAct_9fa48("1166")
                      ? false
                      : stryMutAct_9fa48("1165")
                        ? true
                        : (stryCov_9fa48("1165", "1166", "1167"),
                          detectMajorityScript(safeText) ===
                              (stryMutAct_9fa48("1168") ? "" : (stryCov_9fa48("1168"), "latin")));
            }
        } else {
            if (stryMutAct_9fa48("1169")) {
                {
                }
            } else {
                stryCov_9fa48("1169");
                toCyr = stryMutAct_9fa48("1172")
                    ? direction !== "lat-to-cyr"
                    : stryMutAct_9fa48("1171")
                      ? false
                      : stryMutAct_9fa48("1170")
                        ? true
                        : (stryCov_9fa48("1170", "1171", "1172"),
                          direction ===
                              (stryMutAct_9fa48("1173") ? "" : (stryCov_9fa48("1173"), "lat-to-cyr")));
            }
        }
        const label = toCyr
            ? stryMutAct_9fa48("1174")
                ? ""
                : (stryCov_9fa48("1174"), "Lat → Ćir")
            : stryMutAct_9fa48("1175")
              ? ""
              : (stryCov_9fa48("1175"), "Ćir → Lat");
        const userProtectedPhrases = stryMutAct_9fa48("1176")
            ? userProtected
            : (stryCov_9fa48("1176"),
              userProtected.filter(
                  stryMutAct_9fa48("1177")
                      ? () => undefined
                      : (stryCov_9fa48("1177"),
                        (x) => (stryMutAct_9fa48("1178") ? /\S/ : (stryCov_9fa48("1178"), /\s/)).test(x))
              ));
        const protectedRanges = collectProtectedRanges(
            safeText,
            stryMutAct_9fa48("1179")
                ? {}
                : (stryCov_9fa48("1179"),
                  {
                      protectBrands,
                      brandPhrases: protectBrands
                          ? ALWAYS_LATIN_PHRASES
                          : stryMutAct_9fa48("1180")
                            ? ["Stryker was here"]
                            : (stryCov_9fa48("1180"), []),
                      userProtectedPhrases,
                      preserveCodeBlocks,
                      curlyProtection,
                  })
        );
        const parts = splitByRanges(safeText, protectedRanges);
        const outParts: string[] = stryMutAct_9fa48("1181")
            ? ["Stryker was here"]
            : (stryCov_9fa48("1181"), []);

        // [FIX] Provera da li postoji wasmModule pre poziva
        if (
            stryMutAct_9fa48("1183")
                ? false
                : stryMutAct_9fa48("1182")
                  ? true
                  : (stryCov_9fa48("1182", "1183"), wasmModule)
        ) {
            if (stryMutAct_9fa48("1184")) {
                {
                }
            } else {
                stryCov_9fa48("1184");
                try {
                    if (stryMutAct_9fa48("1185")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1185");
                        wasmModule.init_replacer(
                            JSON.stringify(
                                stryMutAct_9fa48("1188")
                                    ? options?.customSubstitutions && {}
                                    : stryMutAct_9fa48("1187")
                                      ? false
                                      : stryMutAct_9fa48("1186")
                                        ? true
                                        : (stryCov_9fa48("1186", "1187", "1188"),
                                          (stryMutAct_9fa48("1189")
                                              ? options.customSubstitutions
                                              : (stryCov_9fa48("1189"), options?.customSubstitutions)) || {})
                            )
                        );
                    }
                } catch (e) {
                    if (stryMutAct_9fa48("1190")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1190");
                        console.warn(
                            stryMutAct_9fa48("1191")
                                ? ""
                                : (stryCov_9fa48("1191"), "WASM init_replacer failed:"),
                            e
                        );
                    }
                }
            }
        }
        for (const part of parts) {
            if (stryMutAct_9fa48("1192")) {
                {
                }
            } else {
                stryCov_9fa48("1192");
                if (
                    stryMutAct_9fa48("1194")
                        ? false
                        : stryMutAct_9fa48("1193")
                          ? true
                          : (stryCov_9fa48("1193", "1194"), part.protected)
                ) {
                    if (stryMutAct_9fa48("1195")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1195");
                        outParts.push(part.text);
                        continue;
                    }
                }
                let seg = String(
                    stryMutAct_9fa48("1198")
                        ? part.text && ""
                        : stryMutAct_9fa48("1197")
                          ? false
                          : stryMutAct_9fa48("1196")
                            ? true
                            : (stryCov_9fa48("1196", "1197", "1198"),
                              part.text ||
                                  (stryMutAct_9fa48("1199")
                                      ? "Stryker was here!"
                                      : (stryCov_9fa48("1199"), "")))
                );
                if (
                    stryMutAct_9fa48("1202")
                        ? typeof seg.normalize !== "function"
                        : stryMutAct_9fa48("1201")
                          ? false
                          : stryMutAct_9fa48("1200")
                            ? true
                            : (stryCov_9fa48("1200", "1201", "1202"),
                              typeof seg.normalize ===
                                  (stryMutAct_9fa48("1203") ? "" : (stryCov_9fa48("1203"), "function")))
                ) {
                    if (stryMutAct_9fa48("1204")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1204");
                        try {
                            if (stryMutAct_9fa48("1205")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("1205");
                                seg = seg.normalize(
                                    stryMutAct_9fa48("1206") ? "" : (stryCov_9fa48("1206"), "NFC")
                                );
                            }
                        } catch (e) {
                            // Ignore failure
                        }
                    }
                }
                if (
                    stryMutAct_9fa48("1208")
                        ? false
                        : stryMutAct_9fa48("1207")
                          ? true
                          : (stryCov_9fa48("1207", "1208"), wasmModule)
                ) {
                    if (stryMutAct_9fa48("1209")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1209");
                        // [FIX] Wrapper poziv
                        seg = wasmModule.apply_replacements(seg);
                    }
                } else if (
                    stryMutAct_9fa48("1211")
                        ? false
                        : stryMutAct_9fa48("1210")
                          ? true
                          : (stryCov_9fa48("1210", "1211"), toCyr)
                ) {
                    if (stryMutAct_9fa48("1212")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1212");
                        seg = applyPreCorrectionsLatToCyr(seg);
                    }
                }
                if (
                    stryMutAct_9fa48("1215")
                        ? (options?.dialect && options.dialect !== "none") || wasmModule
                        : stryMutAct_9fa48("1214")
                          ? false
                          : stryMutAct_9fa48("1213")
                            ? true
                            : (stryCov_9fa48("1213", "1214", "1215"),
                              (stryMutAct_9fa48("1217")
                                  ? options?.dialect || options.dialect !== "none"
                                  : stryMutAct_9fa48("1216")
                                    ? true
                                    : (stryCov_9fa48("1216", "1217"),
                                      (stryMutAct_9fa48("1218")
                                          ? options.dialect
                                          : (stryCov_9fa48("1218"), options?.dialect)) &&
                                          (stryMutAct_9fa48("1220")
                                              ? options.dialect === "none"
                                              : stryMutAct_9fa48("1219")
                                                ? true
                                                : (stryCov_9fa48("1219", "1220"),
                                                  options.dialect !==
                                                      (stryMutAct_9fa48("1221")
                                                          ? ""
                                                          : (stryCov_9fa48("1221"), "none")))))) &&
                                  wasmModule)
                ) {
                    if (stryMutAct_9fa48("1222")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1222");
                        // [FIX] Wrapper poziv
                        seg = wasmModule.convert_dialect(seg, options.dialect);
                    }
                }
                seg = convertUnprotectedSegment(seg, toCyr, options);
                if (
                    stryMutAct_9fa48("1225")
                        ? toCyr || options?.applySerbianQuotes !== false
                        : stryMutAct_9fa48("1224")
                          ? false
                          : stryMutAct_9fa48("1223")
                            ? true
                            : (stryCov_9fa48("1223", "1224", "1225"),
                              toCyr &&
                                  (stryMutAct_9fa48("1227")
                                      ? options?.applySerbianQuotes === false
                                      : stryMutAct_9fa48("1226")
                                        ? true
                                        : (stryCov_9fa48("1226", "1227"),
                                          (stryMutAct_9fa48("1228")
                                              ? options.applySerbianQuotes
                                              : (stryCov_9fa48("1228"), options?.applySerbianQuotes)) !==
                                              (stryMutAct_9fa48("1229")
                                                  ? true
                                                  : (stryCov_9fa48("1229"), false)))))
                ) {
                    if (stryMutAct_9fa48("1230")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1230");
                        seg = fixSerbianQuotes(seg);
                    }
                }
                outParts.push(seg);
            }
        }
        return stryMutAct_9fa48("1231")
            ? {}
            : (stryCov_9fa48("1231"),
              {
                  text: outParts.join(
                      stryMutAct_9fa48("1232") ? "Stryker was here!" : (stryCov_9fa48("1232"), "")
                  ),
                  type: label,
              });
    }
}
function convertUnprotectedSegment(segment: string, toCyrillic: boolean, options?: CoreOptions): string {
    if (stryMutAct_9fa48("1233")) {
        {
        }
    } else {
        stryCov_9fa48("1233");
        const userProtected = stryMutAct_9fa48("1234")
            ? options?.userProtected && []
            : (stryCov_9fa48("1234"),
              (stryMutAct_9fa48("1235")
                  ? options.userProtected
                  : (stryCov_9fa48("1235"), options?.userProtected)) ??
                  (stryMutAct_9fa48("1236") ? ["Stryker was here"] : (stryCov_9fa48("1236"), [])));
        const protectBrands = stryMutAct_9fa48("1239")
            ? options?.protectBrands === false
            : stryMutAct_9fa48("1238")
              ? false
              : stryMutAct_9fa48("1237")
                ? true
                : (stryCov_9fa48("1237", "1238", "1239"),
                  (stryMutAct_9fa48("1240")
                      ? options.protectBrands
                      : (stryCov_9fa48("1240"), options?.protectBrands)) !==
                      (stryMutAct_9fa48("1241") ? true : (stryCov_9fa48("1241"), false)));
        const userProtectedLower = new Set(
            userProtected.map(
                stryMutAct_9fa48("1242") ? () => undefined : (stryCov_9fa48("1242"), (w) => normKey(w))
            )
        );
        const tokens = tokenize(segment);
        let out = stryMutAct_9fa48("1243") ? "Stryker was here!" : (stryCov_9fa48("1243"), "");
        for (
            let i = 0;
            stryMutAct_9fa48("1246")
                ? i >= tokens.length
                : stryMutAct_9fa48("1245")
                  ? i <= tokens.length
                  : stryMutAct_9fa48("1244")
                    ? false
                    : (stryCov_9fa48("1244", "1245", "1246"), i < tokens.length);
            stryMutAct_9fa48("1247") ? i-- : (stryCov_9fa48("1247"), i++)
        ) {
            if (stryMutAct_9fa48("1248")) {
                {
                }
            } else {
                stryCov_9fa48("1248");
                const t = tokens[i];
                if (
                    stryMutAct_9fa48("1251")
                        ? false
                        : stryMutAct_9fa48("1250")
                          ? true
                          : stryMutAct_9fa48("1249")
                            ? t
                            : (stryCov_9fa48("1249", "1250", "1251"), !t)
                )
                    continue;
                if (
                    stryMutAct_9fa48("1254")
                        ? t.type === "word"
                        : stryMutAct_9fa48("1253")
                          ? false
                          : stryMutAct_9fa48("1252")
                            ? true
                            : (stryCov_9fa48("1252", "1253", "1254"),
                              t.type !== (stryMutAct_9fa48("1255") ? "" : (stryCov_9fa48("1255"), "word")))
                ) {
                    if (stryMutAct_9fa48("1256")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1256");
                        stryMutAct_9fa48("1257")
                            ? (out -= t.value)
                            : (stryCov_9fa48("1257"), (out += t.value));
                        continue;
                    }
                }
                const tok = t.value;
                const tokLower = normKey(tok);
                if (
                    stryMutAct_9fa48("1259")
                        ? false
                        : stryMutAct_9fa48("1258")
                          ? true
                          : (stryCov_9fa48("1258", "1259"), userProtectedLower.has(tokLower))
                ) {
                    if (stryMutAct_9fa48("1260")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1260");
                        stryMutAct_9fa48("1261") ? (out -= tok) : (stryCov_9fa48("1261"), (out += tok));
                        continue;
                    }
                }
                if (
                    stryMutAct_9fa48("1264")
                        ? protectBrands ||
                          shouldProtectHeuristic(tok) ||
                          ALWAYS_LATIN_TOKENS_STRICT.has(tokLower) ||
                          shouldProtectAmbiguousBrandToken(tokens, i)
                        : stryMutAct_9fa48("1263")
                          ? false
                          : stryMutAct_9fa48("1262")
                            ? true
                            : (stryCov_9fa48("1262", "1263", "1264"),
                              protectBrands &&
                                  (stryMutAct_9fa48("1266")
                                      ? (shouldProtectHeuristic(tok) ||
                                            ALWAYS_LATIN_TOKENS_STRICT.has(tokLower)) &&
                                        shouldProtectAmbiguousBrandToken(tokens, i)
                                      : stryMutAct_9fa48("1265")
                                        ? true
                                        : (stryCov_9fa48("1265", "1266"),
                                          (stryMutAct_9fa48("1268")
                                              ? shouldProtectHeuristic(tok) &&
                                                ALWAYS_LATIN_TOKENS_STRICT.has(tokLower)
                                              : stryMutAct_9fa48("1267")
                                                ? false
                                                : (stryCov_9fa48("1267", "1268"),
                                                  shouldProtectHeuristic(tok) ||
                                                      ALWAYS_LATIN_TOKENS_STRICT.has(tokLower))) ||
                                              shouldProtectAmbiguousBrandToken(tokens, i))))
                ) {
                    if (stryMutAct_9fa48("1269")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1269");
                        stryMutAct_9fa48("1270") ? (out -= tok) : (stryCov_9fa48("1270"), (out += tok));
                        continue;
                    }
                }
                if (
                    stryMutAct_9fa48("1273")
                        ? toCyrillic || shouldProtectRomanToken(tokens, i)
                        : stryMutAct_9fa48("1272")
                          ? false
                          : stryMutAct_9fa48("1271")
                            ? true
                            : (stryCov_9fa48("1271", "1272", "1273"),
                              toCyrillic && shouldProtectRomanToken(tokens, i))
                ) {
                    if (stryMutAct_9fa48("1274")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1274");
                        stryMutAct_9fa48("1275") ? (out -= tok) : (stryCov_9fa48("1275"), (out += tok));
                        continue;
                    }
                }
                if (
                    stryMutAct_9fa48("1277")
                        ? false
                        : stryMutAct_9fa48("1276")
                          ? true
                          : (stryCov_9fa48("1276", "1277"), wasmModule)
                ) {
                    if (stryMutAct_9fa48("1278")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1278");
                        // [FIX] Ovde se dešava magija. wasmModule MORA biti paket wrappera.
                        stryMutAct_9fa48("1279")
                            ? (out -= toCyrillic ? wasmModule.to_cyrillic(tok) : wasmModule.to_latin(tok))
                            : (stryCov_9fa48("1279"),
                              (out += toCyrillic ? wasmModule.to_cyrillic(tok) : wasmModule.to_latin(tok)));
                    }
                } else {
                    if (stryMutAct_9fa48("1280")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1280");
                        stryMutAct_9fa48("1281")
                            ? (out -= toCyrillic ? latinToCyrillic(tok) : cyrillicToLatin(tok))
                            : (stryCov_9fa48("1281"),
                              (out += toCyrillic ? latinToCyrillic(tok) : cyrillicToLatin(tok)));
                    }
                }
            }
        }
        return out;
    }
}
