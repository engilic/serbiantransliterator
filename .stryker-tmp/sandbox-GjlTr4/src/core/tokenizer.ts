// @ts-nocheck
// src/core/tokenizer.ts
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
export type Tok = {
    type: "word" | "other";
    value: string;
};
function isLetterOrDigit(ch: string): boolean {
    if (stryMutAct_9fa48("1282")) {
        {
        }
    } else {
        stryCov_9fa48("1282");
        return (
            stryMutAct_9fa48("1284")
                ? /\p{L}|\P{N}/u
                : stryMutAct_9fa48("1283")
                  ? /\P{L}|\p{N}/u
                  : (stryCov_9fa48("1283", "1284"), /\p{L}|\p{N}/u)
        ).test(ch);
    }
}
export function tokenize(text: string): Tok[] {
    if (stryMutAct_9fa48("1285")) {
        {
        }
    } else {
        stryCov_9fa48("1285");
        const out: Tok[] = stryMutAct_9fa48("1286") ? ["Stryker was here"] : (stryCov_9fa48("1286"), []);
        let i = 0;
        const push = (type: Tok["type"], value: string) => {
            if (stryMutAct_9fa48("1287")) {
                {
                }
            } else {
                stryCov_9fa48("1287");
                if (
                    stryMutAct_9fa48("1290")
                        ? false
                        : stryMutAct_9fa48("1289")
                          ? true
                          : stryMutAct_9fa48("1288")
                            ? value
                            : (stryCov_9fa48("1288", "1289", "1290"), !value)
                )
                    return;
                const last =
                    out[stryMutAct_9fa48("1291") ? out.length + 1 : (stryCov_9fa48("1291"), out.length - 1)];
                if (
                    stryMutAct_9fa48("1294")
                        ? last || last.type === type
                        : stryMutAct_9fa48("1293")
                          ? false
                          : stryMutAct_9fa48("1292")
                            ? true
                            : (stryCov_9fa48("1292", "1293", "1294"),
                              last &&
                                  (stryMutAct_9fa48("1296")
                                      ? last.type !== type
                                      : stryMutAct_9fa48("1295")
                                        ? true
                                        : (stryCov_9fa48("1295", "1296"), last.type === type)))
                )
                    stryMutAct_9fa48("1297")
                        ? (last.value -= value)
                        : (stryCov_9fa48("1297"), (last.value += value));
                else
                    out.push(
                        stryMutAct_9fa48("1298")
                            ? {}
                            : (stryCov_9fa48("1298"),
                              {
                                  type,
                                  value,
                              })
                    );
            }
        };
        while (
            stryMutAct_9fa48("1301")
                ? i >= text.length
                : stryMutAct_9fa48("1300")
                  ? i <= text.length
                  : stryMutAct_9fa48("1299")
                    ? false
                    : (stryCov_9fa48("1299", "1300", "1301"), i < text.length)
        ) {
            if (stryMutAct_9fa48("1302")) {
                {
                }
            } else {
                stryCov_9fa48("1302");
                // FIX: Koristimo ?? "" umesto !
                const ch = stryMutAct_9fa48("1303")
                    ? text[i] && ""
                    : (stryCov_9fa48("1303"),
                      text[i] ??
                          (stryMutAct_9fa48("1304") ? "Stryker was here!" : (stryCov_9fa48("1304"), "")));
                if (
                    stryMutAct_9fa48("1307")
                        ? false
                        : stryMutAct_9fa48("1306")
                          ? true
                          : stryMutAct_9fa48("1305")
                            ? ch
                            : (stryCov_9fa48("1305", "1306", "1307"), !ch)
                )
                    break;

                // FIX: Osiguravamo da su prev i next uvek stringovi, nikad undefined
                const prev = (
                    stryMutAct_9fa48("1311")
                        ? i <= 0
                        : stryMutAct_9fa48("1310")
                          ? i >= 0
                          : stryMutAct_9fa48("1309")
                            ? false
                            : stryMutAct_9fa48("1308")
                              ? true
                              : (stryCov_9fa48("1308", "1309", "1310", "1311"), i > 0)
                )
                    ? stryMutAct_9fa48("1312")
                        ? text[i - 1] && ""
                        : (stryCov_9fa48("1312"),
                          text[stryMutAct_9fa48("1313") ? i + 1 : (stryCov_9fa48("1313"), i - 1)] ??
                              (stryMutAct_9fa48("1314") ? "Stryker was here!" : (stryCov_9fa48("1314"), "")))
                    : stryMutAct_9fa48("1315")
                      ? "Stryker was here!"
                      : (stryCov_9fa48("1315"), "");
                const next = (
                    stryMutAct_9fa48("1319")
                        ? i + 1 >= text.length
                        : stryMutAct_9fa48("1318")
                          ? i + 1 <= text.length
                          : stryMutAct_9fa48("1317")
                            ? false
                            : stryMutAct_9fa48("1316")
                              ? true
                              : (stryCov_9fa48("1316", "1317", "1318", "1319"),
                                (stryMutAct_9fa48("1320") ? i - 1 : (stryCov_9fa48("1320"), i + 1)) <
                                    text.length)
                )
                    ? stryMutAct_9fa48("1321")
                        ? text[i + 1] && ""
                        : (stryCov_9fa48("1321"),
                          text[stryMutAct_9fa48("1322") ? i - 1 : (stryCov_9fa48("1322"), i + 1)] ??
                              (stryMutAct_9fa48("1323") ? "Stryker was here!" : (stryCov_9fa48("1323"), "")))
                    : stryMutAct_9fa48("1324")
                      ? "Stryker was here!"
                      : (stryCov_9fa48("1324"), "");
                const isJoiner = stryMutAct_9fa48("1327")
                    ? (ch === "-" ||
                          ch === "‑" ||
                          ch === "‐" ||
                          ch === "‒" ||
                          ch === "–" ||
                          ch === "—" ||
                          ch === "'" ||
                          ch === "’" ||
                          ch === "." ||
                          ch === "+" ||
                          ch === "#") &&
                      ch === "/"
                    : stryMutAct_9fa48("1326")
                      ? false
                      : stryMutAct_9fa48("1325")
                        ? true
                        : (stryCov_9fa48("1325", "1326", "1327"),
                          (stryMutAct_9fa48("1329")
                              ? (ch === "-" ||
                                    ch === "‑" ||
                                    ch === "‐" ||
                                    ch === "‒" ||
                                    ch === "–" ||
                                    ch === "—" ||
                                    ch === "'" ||
                                    ch === "’" ||
                                    ch === "." ||
                                    ch === "+") &&
                                ch === "#"
                              : stryMutAct_9fa48("1328")
                                ? false
                                : (stryCov_9fa48("1328", "1329"),
                                  (stryMutAct_9fa48("1331")
                                      ? (ch === "-" ||
                                            ch === "‑" ||
                                            ch === "‐" ||
                                            ch === "‒" ||
                                            ch === "–" ||
                                            ch === "—" ||
                                            ch === "'" ||
                                            ch === "’" ||
                                            ch === ".") &&
                                        ch === "+"
                                      : stryMutAct_9fa48("1330")
                                        ? false
                                        : (stryCov_9fa48("1330", "1331"),
                                          (stryMutAct_9fa48("1333")
                                              ? (ch === "-" ||
                                                    ch === "‑" ||
                                                    ch === "‐" ||
                                                    ch === "‒" ||
                                                    ch === "–" ||
                                                    ch === "—" ||
                                                    ch === "'" ||
                                                    ch === "’") &&
                                                ch === "."
                                              : stryMutAct_9fa48("1332")
                                                ? false
                                                : (stryCov_9fa48("1332", "1333"),
                                                  (stryMutAct_9fa48("1335")
                                                      ? (ch === "-" ||
                                                            ch === "‑" ||
                                                            ch === "‐" ||
                                                            ch === "‒" ||
                                                            ch === "–" ||
                                                            ch === "—" ||
                                                            ch === "'") &&
                                                        ch === "’"
                                                      : stryMutAct_9fa48("1334")
                                                        ? false
                                                        : (stryCov_9fa48("1334", "1335"),
                                                          (stryMutAct_9fa48("1337")
                                                              ? (ch === "-" ||
                                                                    ch === "‑" ||
                                                                    ch === "‐" ||
                                                                    ch === "‒" ||
                                                                    ch === "–" ||
                                                                    ch === "—") &&
                                                                ch === "'"
                                                              : stryMutAct_9fa48("1336")
                                                                ? false
                                                                : (stryCov_9fa48("1336", "1337"),
                                                                  (stryMutAct_9fa48("1339")
                                                                      ? (ch === "-" ||
                                                                            ch === "‑" ||
                                                                            ch === "‐" ||
                                                                            ch === "‒" ||
                                                                            ch === "–") &&
                                                                        ch === "—"
                                                                      : stryMutAct_9fa48("1338")
                                                                        ? false
                                                                        : (stryCov_9fa48("1338", "1339"),
                                                                          (stryMutAct_9fa48("1341")
                                                                              ? (ch === "-" ||
                                                                                    ch === "‑" ||
                                                                                    ch === "‐" ||
                                                                                    ch === "‒") &&
                                                                                ch === "–"
                                                                              : stryMutAct_9fa48("1340")
                                                                                ? false
                                                                                : (stryCov_9fa48(
                                                                                      "1340",
                                                                                      "1341"
                                                                                  ),
                                                                                  (stryMutAct_9fa48("1343")
                                                                                      ? (ch === "-" ||
                                                                                            ch === "‑" ||
                                                                                            ch === "‐") &&
                                                                                        ch === "‒"
                                                                                      : stryMutAct_9fa48(
                                                                                              "1342"
                                                                                          )
                                                                                        ? false
                                                                                        : (stryCov_9fa48(
                                                                                              "1342",
                                                                                              "1343"
                                                                                          ),
                                                                                          (stryMutAct_9fa48(
                                                                                              "1345"
                                                                                          )
                                                                                              ? (ch === "-" ||
                                                                                                    ch ===
                                                                                                        "‑") &&
                                                                                                ch === "‐"
                                                                                              : stryMutAct_9fa48(
                                                                                                      "1344"
                                                                                                  )
                                                                                                ? false
                                                                                                : (stryCov_9fa48(
                                                                                                      "1344",
                                                                                                      "1345"
                                                                                                  ),
                                                                                                  (stryMutAct_9fa48(
                                                                                                      "1347"
                                                                                                  )
                                                                                                      ? ch ===
                                                                                                            "-" &&
                                                                                                        ch ===
                                                                                                            "‑"
                                                                                                      : stryMutAct_9fa48(
                                                                                                              "1346"
                                                                                                          )
                                                                                                        ? false
                                                                                                        : (stryCov_9fa48(
                                                                                                              "1346",
                                                                                                              "1347"
                                                                                                          ),
                                                                                                          (stryMutAct_9fa48(
                                                                                                              "1349"
                                                                                                          )
                                                                                                              ? ch !==
                                                                                                                "-"
                                                                                                              : stryMutAct_9fa48(
                                                                                                                      "1348"
                                                                                                                  )
                                                                                                                ? false
                                                                                                                : (stryCov_9fa48(
                                                                                                                      "1348",
                                                                                                                      "1349"
                                                                                                                  ),
                                                                                                                  ch ===
                                                                                                                      (stryMutAct_9fa48(
                                                                                                                          "1350"
                                                                                                                      )
                                                                                                                          ? ""
                                                                                                                          : (stryCov_9fa48(
                                                                                                                                "1350"
                                                                                                                            ),
                                                                                                                            "-")))) ||
                                                                                                              (stryMutAct_9fa48(
                                                                                                                  "1352"
                                                                                                              )
                                                                                                                  ? ch !==
                                                                                                                    "‑"
                                                                                                                  : stryMutAct_9fa48(
                                                                                                                          "1351"
                                                                                                                      )
                                                                                                                    ? false
                                                                                                                    : (stryCov_9fa48(
                                                                                                                          "1351",
                                                                                                                          "1352"
                                                                                                                      ),
                                                                                                                      ch ===
                                                                                                                          (stryMutAct_9fa48(
                                                                                                                              "1353"
                                                                                                                          )
                                                                                                                              ? ""
                                                                                                                              : (stryCov_9fa48(
                                                                                                                                    "1353"
                                                                                                                                ),
                                                                                                                                "‑")))))) ||
                                                                                                      (stryMutAct_9fa48(
                                                                                                          "1355"
                                                                                                      )
                                                                                                          ? ch !==
                                                                                                            "‐"
                                                                                                          : stryMutAct_9fa48(
                                                                                                                  "1354"
                                                                                                              )
                                                                                                            ? false
                                                                                                            : (stryCov_9fa48(
                                                                                                                  "1354",
                                                                                                                  "1355"
                                                                                                              ),
                                                                                                              ch ===
                                                                                                                  (stryMutAct_9fa48(
                                                                                                                      "1356"
                                                                                                                  )
                                                                                                                      ? ""
                                                                                                                      : (stryCov_9fa48(
                                                                                                                            "1356"
                                                                                                                        ),
                                                                                                                        "‐")))))) ||
                                                                                              (stryMutAct_9fa48(
                                                                                                  "1358"
                                                                                              )
                                                                                                  ? ch !== "‒"
                                                                                                  : stryMutAct_9fa48(
                                                                                                          "1357"
                                                                                                      )
                                                                                                    ? false
                                                                                                    : (stryCov_9fa48(
                                                                                                          "1357",
                                                                                                          "1358"
                                                                                                      ),
                                                                                                      ch ===
                                                                                                          (stryMutAct_9fa48(
                                                                                                              "1359"
                                                                                                          )
                                                                                                              ? ""
                                                                                                              : (stryCov_9fa48(
                                                                                                                    "1359"
                                                                                                                ),
                                                                                                                "‒")))))) ||
                                                                                      (stryMutAct_9fa48(
                                                                                          "1361"
                                                                                      )
                                                                                          ? ch !== "–"
                                                                                          : stryMutAct_9fa48(
                                                                                                  "1360"
                                                                                              )
                                                                                            ? false
                                                                                            : (stryCov_9fa48(
                                                                                                  "1360",
                                                                                                  "1361"
                                                                                              ),
                                                                                              ch ===
                                                                                                  (stryMutAct_9fa48(
                                                                                                      "1362"
                                                                                                  )
                                                                                                      ? ""
                                                                                                      : (stryCov_9fa48(
                                                                                                            "1362"
                                                                                                        ),
                                                                                                        "–")))))) ||
                                                                              (stryMutAct_9fa48("1364")
                                                                                  ? ch !== "—"
                                                                                  : stryMutAct_9fa48("1363")
                                                                                    ? false
                                                                                    : (stryCov_9fa48(
                                                                                          "1363",
                                                                                          "1364"
                                                                                      ),
                                                                                      ch ===
                                                                                          (stryMutAct_9fa48(
                                                                                              "1365"
                                                                                          )
                                                                                              ? ""
                                                                                              : (stryCov_9fa48(
                                                                                                    "1365"
                                                                                                ),
                                                                                                "—")))))) ||
                                                                      (stryMutAct_9fa48("1367")
                                                                          ? ch !== "'"
                                                                          : stryMutAct_9fa48("1366")
                                                                            ? false
                                                                            : (stryCov_9fa48("1366", "1367"),
                                                                              ch ===
                                                                                  (stryMutAct_9fa48("1368")
                                                                                      ? ""
                                                                                      : (stryCov_9fa48(
                                                                                            "1368"
                                                                                        ),
                                                                                        "'")))))) ||
                                                              (stryMutAct_9fa48("1370")
                                                                  ? ch !== "’"
                                                                  : stryMutAct_9fa48("1369")
                                                                    ? false
                                                                    : (stryCov_9fa48("1369", "1370"),
                                                                      ch ===
                                                                          (stryMutAct_9fa48("1371")
                                                                              ? ""
                                                                              : (stryCov_9fa48("1371"),
                                                                                "’")))))) ||
                                                      (stryMutAct_9fa48("1373")
                                                          ? ch !== "."
                                                          : stryMutAct_9fa48("1372")
                                                            ? false
                                                            : (stryCov_9fa48("1372", "1373"),
                                                              ch ===
                                                                  (stryMutAct_9fa48("1374")
                                                                      ? ""
                                                                      : (stryCov_9fa48("1374"), ".")))))) ||
                                              (stryMutAct_9fa48("1376")
                                                  ? ch !== "+"
                                                  : stryMutAct_9fa48("1375")
                                                    ? false
                                                    : (stryCov_9fa48("1375", "1376"),
                                                      ch ===
                                                          (stryMutAct_9fa48("1377")
                                                              ? ""
                                                              : (stryCov_9fa48("1377"), "+")))))) ||
                                      (stryMutAct_9fa48("1379")
                                          ? ch !== "#"
                                          : stryMutAct_9fa48("1378")
                                            ? false
                                            : (stryCov_9fa48("1378", "1379"),
                                              ch ===
                                                  (stryMutAct_9fa48("1380")
                                                      ? ""
                                                      : (stryCov_9fa48("1380"), "#")))))) ||
                              (stryMutAct_9fa48("1382")
                                  ? ch !== "/"
                                  : stryMutAct_9fa48("1381")
                                    ? false
                                    : (stryCov_9fa48("1381", "1382"),
                                      ch ===
                                          (stryMutAct_9fa48("1383") ? "" : (stryCov_9fa48("1383"), "/")))));

                // FIX: Uklonjeni svi uzvičnici (prev! -> prev) jer su promenljive sada sigurne
                const joinerOk = stryMutAct_9fa48("1386")
                    ? isJoiner ||
                      (ch === "." &&
                          (isLetterOrDigit(next) || (isLetterOrDigit(prev) && isLetterOrDigit(next)))) ||
                      ((ch === "+" || ch === "#") && (isLetterOrDigit(prev) || isLetterOrDigit(next))) ||
                      (ch === "/" && isLetterOrDigit(prev) && isLetterOrDigit(next)) ||
                      ((ch === "-" ||
                          ch === "‑" ||
                          ch === "‐" ||
                          ch === "‒" ||
                          ch === "–" ||
                          ch === "—" ||
                          ch === "'" ||
                          ch === "’") &&
                          (isLetterOrDigit(prev) || isLetterOrDigit(next)))
                    : stryMutAct_9fa48("1385")
                      ? false
                      : stryMutAct_9fa48("1384")
                        ? true
                        : (stryCov_9fa48("1384", "1385", "1386"),
                          isJoiner &&
                              (stryMutAct_9fa48("1388")
                                  ? ((ch === "." &&
                                        (isLetterOrDigit(next) ||
                                            (isLetterOrDigit(prev) && isLetterOrDigit(next)))) ||
                                        ((ch === "+" || ch === "#") &&
                                            (isLetterOrDigit(prev) || isLetterOrDigit(next))) ||
                                        (ch === "/" && isLetterOrDigit(prev) && isLetterOrDigit(next))) &&
                                    (ch === "-" ||
                                        ch === "‑" ||
                                        ch === "‐" ||
                                        ch === "‒" ||
                                        ch === "–" ||
                                        ch === "—" ||
                                        ch === "'" ||
                                        ch === "’") &&
                                    (isLetterOrDigit(prev) || isLetterOrDigit(next))
                                  : stryMutAct_9fa48("1387")
                                    ? true
                                    : (stryCov_9fa48("1387", "1388"),
                                      (stryMutAct_9fa48("1390")
                                          ? ((ch === "." &&
                                                (isLetterOrDigit(next) ||
                                                    (isLetterOrDigit(prev) && isLetterOrDigit(next)))) ||
                                                ((ch === "+" || ch === "#") &&
                                                    (isLetterOrDigit(prev) || isLetterOrDigit(next)))) &&
                                            ch === "/" &&
                                            isLetterOrDigit(prev) &&
                                            isLetterOrDigit(next)
                                          : stryMutAct_9fa48("1389")
                                            ? false
                                            : (stryCov_9fa48("1389", "1390"),
                                              (stryMutAct_9fa48("1392")
                                                  ? ch === "." &&
                                                    (isLetterOrDigit(next) ||
                                                        (isLetterOrDigit(prev) && isLetterOrDigit(next))) &&
                                                    (ch === "+" || ch === "#") &&
                                                    (isLetterOrDigit(prev) || isLetterOrDigit(next))
                                                  : stryMutAct_9fa48("1391")
                                                    ? false
                                                    : (stryCov_9fa48("1391", "1392"),
                                                      (stryMutAct_9fa48("1394")
                                                          ? ch === "." ||
                                                            isLetterOrDigit(next) ||
                                                            (isLetterOrDigit(prev) && isLetterOrDigit(next))
                                                          : stryMutAct_9fa48("1393")
                                                            ? false
                                                            : (stryCov_9fa48("1393", "1394"),
                                                              (stryMutAct_9fa48("1396")
                                                                  ? ch !== "."
                                                                  : stryMutAct_9fa48("1395")
                                                                    ? true
                                                                    : (stryCov_9fa48("1395", "1396"),
                                                                      ch ===
                                                                          (stryMutAct_9fa48("1397")
                                                                              ? ""
                                                                              : (stryCov_9fa48("1397"),
                                                                                ".")))) &&
                                                                  (stryMutAct_9fa48("1399")
                                                                      ? isLetterOrDigit(next) &&
                                                                        isLetterOrDigit(prev) &&
                                                                        isLetterOrDigit(next)
                                                                      : stryMutAct_9fa48("1398")
                                                                        ? true
                                                                        : (stryCov_9fa48("1398", "1399"),
                                                                          isLetterOrDigit(next) ||
                                                                              (stryMutAct_9fa48("1401")
                                                                                  ? isLetterOrDigit(prev) ||
                                                                                    isLetterOrDigit(next)
                                                                                  : stryMutAct_9fa48("1400")
                                                                                    ? false
                                                                                    : (stryCov_9fa48(
                                                                                          "1400",
                                                                                          "1401"
                                                                                      ),
                                                                                      isLetterOrDigit(prev) &&
                                                                                          isLetterOrDigit(
                                                                                              next
                                                                                          ))))))) ||
                                                          (stryMutAct_9fa48("1403")
                                                              ? ch === "+" ||
                                                                ch === "#" ||
                                                                isLetterOrDigit(prev) ||
                                                                isLetterOrDigit(next)
                                                              : stryMutAct_9fa48("1402")
                                                                ? false
                                                                : (stryCov_9fa48("1402", "1403"),
                                                                  (stryMutAct_9fa48("1405")
                                                                      ? ch === "+" && ch === "#"
                                                                      : stryMutAct_9fa48("1404")
                                                                        ? true
                                                                        : (stryCov_9fa48("1404", "1405"),
                                                                          (stryMutAct_9fa48("1407")
                                                                              ? ch !== "+"
                                                                              : stryMutAct_9fa48("1406")
                                                                                ? false
                                                                                : (stryCov_9fa48(
                                                                                      "1406",
                                                                                      "1407"
                                                                                  ),
                                                                                  ch ===
                                                                                      (stryMutAct_9fa48(
                                                                                          "1408"
                                                                                      )
                                                                                          ? ""
                                                                                          : (stryCov_9fa48(
                                                                                                "1408"
                                                                                            ),
                                                                                            "+")))) ||
                                                                              (stryMutAct_9fa48("1410")
                                                                                  ? ch !== "#"
                                                                                  : stryMutAct_9fa48("1409")
                                                                                    ? false
                                                                                    : (stryCov_9fa48(
                                                                                          "1409",
                                                                                          "1410"
                                                                                      ),
                                                                                      ch ===
                                                                                          (stryMutAct_9fa48(
                                                                                              "1411"
                                                                                          )
                                                                                              ? ""
                                                                                              : (stryCov_9fa48(
                                                                                                    "1411"
                                                                                                ),
                                                                                                "#")))))) &&
                                                                      (stryMutAct_9fa48("1413")
                                                                          ? isLetterOrDigit(prev) &&
                                                                            isLetterOrDigit(next)
                                                                          : stryMutAct_9fa48("1412")
                                                                            ? true
                                                                            : (stryCov_9fa48("1412", "1413"),
                                                                              isLetterOrDigit(prev) ||
                                                                                  isLetterOrDigit(
                                                                                      next
                                                                                  ))))))) ||
                                                  (stryMutAct_9fa48("1415")
                                                      ? (ch === "/" && isLetterOrDigit(prev)) ||
                                                        isLetterOrDigit(next)
                                                      : stryMutAct_9fa48("1414")
                                                        ? false
                                                        : (stryCov_9fa48("1414", "1415"),
                                                          (stryMutAct_9fa48("1417")
                                                              ? ch === "/" || isLetterOrDigit(prev)
                                                              : stryMutAct_9fa48("1416")
                                                                ? true
                                                                : (stryCov_9fa48("1416", "1417"),
                                                                  (stryMutAct_9fa48("1419")
                                                                      ? ch !== "/"
                                                                      : stryMutAct_9fa48("1418")
                                                                        ? true
                                                                        : (stryCov_9fa48("1418", "1419"),
                                                                          ch ===
                                                                              (stryMutAct_9fa48("1420")
                                                                                  ? ""
                                                                                  : (stryCov_9fa48("1420"),
                                                                                    "/")))) &&
                                                                      isLetterOrDigit(prev))) &&
                                                              isLetterOrDigit(next))))) ||
                                          (stryMutAct_9fa48("1422")
                                              ? ch === "-" ||
                                                ch === "‑" ||
                                                ch === "‐" ||
                                                ch === "‒" ||
                                                ch === "–" ||
                                                ch === "—" ||
                                                ch === "'" ||
                                                ch === "’" ||
                                                isLetterOrDigit(prev) ||
                                                isLetterOrDigit(next)
                                              : stryMutAct_9fa48("1421")
                                                ? false
                                                : (stryCov_9fa48("1421", "1422"),
                                                  (stryMutAct_9fa48("1424")
                                                      ? (ch === "-" ||
                                                            ch === "‑" ||
                                                            ch === "‐" ||
                                                            ch === "‒" ||
                                                            ch === "–" ||
                                                            ch === "—" ||
                                                            ch === "'") &&
                                                        ch === "’"
                                                      : stryMutAct_9fa48("1423")
                                                        ? true
                                                        : (stryCov_9fa48("1423", "1424"),
                                                          (stryMutAct_9fa48("1426")
                                                              ? (ch === "-" ||
                                                                    ch === "‑" ||
                                                                    ch === "‐" ||
                                                                    ch === "‒" ||
                                                                    ch === "–" ||
                                                                    ch === "—") &&
                                                                ch === "'"
                                                              : stryMutAct_9fa48("1425")
                                                                ? false
                                                                : (stryCov_9fa48("1425", "1426"),
                                                                  (stryMutAct_9fa48("1428")
                                                                      ? (ch === "-" ||
                                                                            ch === "‑" ||
                                                                            ch === "‐" ||
                                                                            ch === "‒" ||
                                                                            ch === "–") &&
                                                                        ch === "—"
                                                                      : stryMutAct_9fa48("1427")
                                                                        ? false
                                                                        : (stryCov_9fa48("1427", "1428"),
                                                                          (stryMutAct_9fa48("1430")
                                                                              ? (ch === "-" ||
                                                                                    ch === "‑" ||
                                                                                    ch === "‐" ||
                                                                                    ch === "‒") &&
                                                                                ch === "–"
                                                                              : stryMutAct_9fa48("1429")
                                                                                ? false
                                                                                : (stryCov_9fa48(
                                                                                      "1429",
                                                                                      "1430"
                                                                                  ),
                                                                                  (stryMutAct_9fa48("1432")
                                                                                      ? (ch === "-" ||
                                                                                            ch === "‑" ||
                                                                                            ch === "‐") &&
                                                                                        ch === "‒"
                                                                                      : stryMutAct_9fa48(
                                                                                              "1431"
                                                                                          )
                                                                                        ? false
                                                                                        : (stryCov_9fa48(
                                                                                              "1431",
                                                                                              "1432"
                                                                                          ),
                                                                                          (stryMutAct_9fa48(
                                                                                              "1434"
                                                                                          )
                                                                                              ? (ch === "-" ||
                                                                                                    ch ===
                                                                                                        "‑") &&
                                                                                                ch === "‐"
                                                                                              : stryMutAct_9fa48(
                                                                                                      "1433"
                                                                                                  )
                                                                                                ? false
                                                                                                : (stryCov_9fa48(
                                                                                                      "1433",
                                                                                                      "1434"
                                                                                                  ),
                                                                                                  (stryMutAct_9fa48(
                                                                                                      "1436"
                                                                                                  )
                                                                                                      ? ch ===
                                                                                                            "-" &&
                                                                                                        ch ===
                                                                                                            "‑"
                                                                                                      : stryMutAct_9fa48(
                                                                                                              "1435"
                                                                                                          )
                                                                                                        ? false
                                                                                                        : (stryCov_9fa48(
                                                                                                              "1435",
                                                                                                              "1436"
                                                                                                          ),
                                                                                                          (stryMutAct_9fa48(
                                                                                                              "1438"
                                                                                                          )
                                                                                                              ? ch !==
                                                                                                                "-"
                                                                                                              : stryMutAct_9fa48(
                                                                                                                      "1437"
                                                                                                                  )
                                                                                                                ? false
                                                                                                                : (stryCov_9fa48(
                                                                                                                      "1437",
                                                                                                                      "1438"
                                                                                                                  ),
                                                                                                                  ch ===
                                                                                                                      (stryMutAct_9fa48(
                                                                                                                          "1439"
                                                                                                                      )
                                                                                                                          ? ""
                                                                                                                          : (stryCov_9fa48(
                                                                                                                                "1439"
                                                                                                                            ),
                                                                                                                            "-")))) ||
                                                                                                              (stryMutAct_9fa48(
                                                                                                                  "1441"
                                                                                                              )
                                                                                                                  ? ch !==
                                                                                                                    "‑"
                                                                                                                  : stryMutAct_9fa48(
                                                                                                                          "1440"
                                                                                                                      )
                                                                                                                    ? false
                                                                                                                    : (stryCov_9fa48(
                                                                                                                          "1440",
                                                                                                                          "1441"
                                                                                                                      ),
                                                                                                                      ch ===
                                                                                                                          (stryMutAct_9fa48(
                                                                                                                              "1442"
                                                                                                                          )
                                                                                                                              ? ""
                                                                                                                              : (stryCov_9fa48(
                                                                                                                                    "1442"
                                                                                                                                ),
                                                                                                                                "‑")))))) ||
                                                                                                      (stryMutAct_9fa48(
                                                                                                          "1444"
                                                                                                      )
                                                                                                          ? ch !==
                                                                                                            "‐"
                                                                                                          : stryMutAct_9fa48(
                                                                                                                  "1443"
                                                                                                              )
                                                                                                            ? false
                                                                                                            : (stryCov_9fa48(
                                                                                                                  "1443",
                                                                                                                  "1444"
                                                                                                              ),
                                                                                                              ch ===
                                                                                                                  (stryMutAct_9fa48(
                                                                                                                      "1445"
                                                                                                                  )
                                                                                                                      ? ""
                                                                                                                      : (stryCov_9fa48(
                                                                                                                            "1445"
                                                                                                                        ),
                                                                                                                        "‐")))))) ||
                                                                                              (stryMutAct_9fa48(
                                                                                                  "1447"
                                                                                              )
                                                                                                  ? ch !== "‒"
                                                                                                  : stryMutAct_9fa48(
                                                                                                          "1446"
                                                                                                      )
                                                                                                    ? false
                                                                                                    : (stryCov_9fa48(
                                                                                                          "1446",
                                                                                                          "1447"
                                                                                                      ),
                                                                                                      ch ===
                                                                                                          (stryMutAct_9fa48(
                                                                                                              "1448"
                                                                                                          )
                                                                                                              ? ""
                                                                                                              : (stryCov_9fa48(
                                                                                                                    "1448"
                                                                                                                ),
                                                                                                                "‒")))))) ||
                                                                                      (stryMutAct_9fa48(
                                                                                          "1450"
                                                                                      )
                                                                                          ? ch !== "–"
                                                                                          : stryMutAct_9fa48(
                                                                                                  "1449"
                                                                                              )
                                                                                            ? false
                                                                                            : (stryCov_9fa48(
                                                                                                  "1449",
                                                                                                  "1450"
                                                                                              ),
                                                                                              ch ===
                                                                                                  (stryMutAct_9fa48(
                                                                                                      "1451"
                                                                                                  )
                                                                                                      ? ""
                                                                                                      : (stryCov_9fa48(
                                                                                                            "1451"
                                                                                                        ),
                                                                                                        "–")))))) ||
                                                                              (stryMutAct_9fa48("1453")
                                                                                  ? ch !== "—"
                                                                                  : stryMutAct_9fa48("1452")
                                                                                    ? false
                                                                                    : (stryCov_9fa48(
                                                                                          "1452",
                                                                                          "1453"
                                                                                      ),
                                                                                      ch ===
                                                                                          (stryMutAct_9fa48(
                                                                                              "1454"
                                                                                          )
                                                                                              ? ""
                                                                                              : (stryCov_9fa48(
                                                                                                    "1454"
                                                                                                ),
                                                                                                "—")))))) ||
                                                                      (stryMutAct_9fa48("1456")
                                                                          ? ch !== "'"
                                                                          : stryMutAct_9fa48("1455")
                                                                            ? false
                                                                            : (stryCov_9fa48("1455", "1456"),
                                                                              ch ===
                                                                                  (stryMutAct_9fa48("1457")
                                                                                      ? ""
                                                                                      : (stryCov_9fa48(
                                                                                            "1457"
                                                                                        ),
                                                                                        "'")))))) ||
                                                              (stryMutAct_9fa48("1459")
                                                                  ? ch !== "’"
                                                                  : stryMutAct_9fa48("1458")
                                                                    ? false
                                                                    : (stryCov_9fa48("1458", "1459"),
                                                                      ch ===
                                                                          (stryMutAct_9fa48("1460")
                                                                              ? ""
                                                                              : (stryCov_9fa48("1460"),
                                                                                "’")))))) &&
                                                      (stryMutAct_9fa48("1462")
                                                          ? isLetterOrDigit(prev) && isLetterOrDigit(next)
                                                          : stryMutAct_9fa48("1461")
                                                            ? true
                                                            : (stryCov_9fa48("1461", "1462"),
                                                              isLetterOrDigit(prev) ||
                                                                  isLetterOrDigit(next))))))));
                if (
                    stryMutAct_9fa48("1465")
                        ? isLetterOrDigit(ch) && joinerOk
                        : stryMutAct_9fa48("1464")
                          ? false
                          : stryMutAct_9fa48("1463")
                            ? true
                            : (stryCov_9fa48("1463", "1464", "1465"), isLetterOrDigit(ch) || joinerOk)
                )
                    push(stryMutAct_9fa48("1466") ? "" : (stryCov_9fa48("1466"), "word"), ch);
                else push(stryMutAct_9fa48("1467") ? "" : (stryCov_9fa48("1467"), "other"), ch);
                stryMutAct_9fa48("1468") ? i-- : (stryCov_9fa48("1468"), i++);
            }
        }
        return out;
    }
}
export function prevNextWord(
    tokens: Tok[],
    idx: number
): {
    prev?: string;
    next?: string;
} {
    if (stryMutAct_9fa48("1469")) {
        {
        }
    } else {
        stryCov_9fa48("1469");
        let prev: string | undefined;
        let next: string | undefined;
        for (
            let i = stryMutAct_9fa48("1470") ? idx + 1 : (stryCov_9fa48("1470"), idx - 1);
            stryMutAct_9fa48("1473")
                ? i < 0
                : stryMutAct_9fa48("1472")
                  ? i > 0
                  : stryMutAct_9fa48("1471")
                    ? false
                    : (stryCov_9fa48("1471", "1472", "1473"), i >= 0);
            stryMutAct_9fa48("1474") ? i++ : (stryCov_9fa48("1474"), i--)
        ) {
            if (stryMutAct_9fa48("1475")) {
                {
                }
            } else {
                stryCov_9fa48("1475");
                const tok = tokens[i];
                if (
                    stryMutAct_9fa48("1478")
                        ? tok || tok.type === "word"
                        : stryMutAct_9fa48("1477")
                          ? false
                          : stryMutAct_9fa48("1476")
                            ? true
                            : (stryCov_9fa48("1476", "1477", "1478"),
                              tok &&
                                  (stryMutAct_9fa48("1480")
                                      ? tok.type !== "word"
                                      : stryMutAct_9fa48("1479")
                                        ? true
                                        : (stryCov_9fa48("1479", "1480"),
                                          tok.type ===
                                              (stryMutAct_9fa48("1481")
                                                  ? ""
                                                  : (stryCov_9fa48("1481"), "word")))))
                ) {
                    if (stryMutAct_9fa48("1482")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1482");
                        prev = tok.value;
                        break;
                    }
                }
            }
        }
        for (
            let i = stryMutAct_9fa48("1483") ? idx - 1 : (stryCov_9fa48("1483"), idx + 1);
            stryMutAct_9fa48("1486")
                ? i >= tokens.length
                : stryMutAct_9fa48("1485")
                  ? i <= tokens.length
                  : stryMutAct_9fa48("1484")
                    ? false
                    : (stryCov_9fa48("1484", "1485", "1486"), i < tokens.length);
            stryMutAct_9fa48("1487") ? i-- : (stryCov_9fa48("1487"), i++)
        ) {
            if (stryMutAct_9fa48("1488")) {
                {
                }
            } else {
                stryCov_9fa48("1488");
                const tok = tokens[i];
                if (
                    stryMutAct_9fa48("1491")
                        ? tok || tok.type === "word"
                        : stryMutAct_9fa48("1490")
                          ? false
                          : stryMutAct_9fa48("1489")
                            ? true
                            : (stryCov_9fa48("1489", "1490", "1491"),
                              tok &&
                                  (stryMutAct_9fa48("1493")
                                      ? tok.type !== "word"
                                      : stryMutAct_9fa48("1492")
                                        ? true
                                        : (stryCov_9fa48("1492", "1493"),
                                          tok.type ===
                                              (stryMutAct_9fa48("1494")
                                                  ? ""
                                                  : (stryCov_9fa48("1494"), "word")))))
                ) {
                    if (stryMutAct_9fa48("1495")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1495");
                        next = tok.value;
                        break;
                    }
                }
            }
        }
        return stryMutAct_9fa48("1496")
            ? {}
            : (stryCov_9fa48("1496"),
              {
                  prev,
                  next,
              });
    }
}
export function getPrevWord(tokens: Tok[], idx: number, n: number): string | undefined {
    if (stryMutAct_9fa48("1497")) {
        {
        }
    } else {
        stryCov_9fa48("1497");
        let seen = 0;
        for (
            let i = stryMutAct_9fa48("1498") ? idx + 1 : (stryCov_9fa48("1498"), idx - 1);
            stryMutAct_9fa48("1501")
                ? i < 0
                : stryMutAct_9fa48("1500")
                  ? i > 0
                  : stryMutAct_9fa48("1499")
                    ? false
                    : (stryCov_9fa48("1499", "1500", "1501"), i >= 0);
            stryMutAct_9fa48("1502") ? i++ : (stryCov_9fa48("1502"), i--)
        ) {
            if (stryMutAct_9fa48("1503")) {
                {
                }
            } else {
                stryCov_9fa48("1503");
                const t = tokens[i];
                if (
                    stryMutAct_9fa48("1506")
                        ? t?.type !== "word"
                        : stryMutAct_9fa48("1505")
                          ? false
                          : stryMutAct_9fa48("1504")
                            ? true
                            : (stryCov_9fa48("1504", "1505", "1506"),
                              (stryMutAct_9fa48("1507") ? t.type : (stryCov_9fa48("1507"), t?.type)) ===
                                  (stryMutAct_9fa48("1508") ? "" : (stryCov_9fa48("1508"), "word")))
                ) {
                    if (stryMutAct_9fa48("1509")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1509");
                        stryMutAct_9fa48("1510") ? seen-- : (stryCov_9fa48("1510"), seen++);
                        if (
                            stryMutAct_9fa48("1513")
                                ? seen !== n
                                : stryMutAct_9fa48("1512")
                                  ? false
                                  : stryMutAct_9fa48("1511")
                                    ? true
                                    : (stryCov_9fa48("1511", "1512", "1513"), seen === n)
                        )
                            return t.value;
                    }
                }
            }
        }
        return undefined;
    }
}
export function getNextWord(tokens: Tok[], idx: number, n: number): string | undefined {
    if (stryMutAct_9fa48("1514")) {
        {
        }
    } else {
        stryCov_9fa48("1514");
        let seen = 0;
        for (
            let i = stryMutAct_9fa48("1515") ? idx - 1 : (stryCov_9fa48("1515"), idx + 1);
            stryMutAct_9fa48("1518")
                ? i >= tokens.length
                : stryMutAct_9fa48("1517")
                  ? i <= tokens.length
                  : stryMutAct_9fa48("1516")
                    ? false
                    : (stryCov_9fa48("1516", "1517", "1518"), i < tokens.length);
            stryMutAct_9fa48("1519") ? i-- : (stryCov_9fa48("1519"), i++)
        ) {
            if (stryMutAct_9fa48("1520")) {
                {
                }
            } else {
                stryCov_9fa48("1520");
                const t = tokens[i];
                if (
                    stryMutAct_9fa48("1523")
                        ? t?.type !== "word"
                        : stryMutAct_9fa48("1522")
                          ? false
                          : stryMutAct_9fa48("1521")
                            ? true
                            : (stryCov_9fa48("1521", "1522", "1523"),
                              (stryMutAct_9fa48("1524") ? t.type : (stryCov_9fa48("1524"), t?.type)) ===
                                  (stryMutAct_9fa48("1525") ? "" : (stryCov_9fa48("1525"), "word")))
                ) {
                    if (stryMutAct_9fa48("1526")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1526");
                        stryMutAct_9fa48("1527") ? seen-- : (stryCov_9fa48("1527"), seen++);
                        if (
                            stryMutAct_9fa48("1530")
                                ? seen !== n
                                : stryMutAct_9fa48("1529")
                                  ? false
                                  : stryMutAct_9fa48("1528")
                                    ? true
                                    : (stryCov_9fa48("1528", "1529", "1530"), seen === n)
                        )
                            return t.value;
                    }
                }
            }
        }
        return undefined;
    }
}
