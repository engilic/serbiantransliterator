// @ts-nocheck
// src/core/protect.ts
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
import {
    EMAIL_RE_G,
    URL_RE_G,
    MAILTO_RE_G,
    URI_SCHEMES_NO_TEL_MAILTO_RE_G,
    trimLinkEnd,
} from "../shared/patterns/links";
export type Range = [start: number, end: number];
function escapeRegex(str: string): string {
    if (stryMutAct_9fa48("263")) {
        {
        }
    } else {
        stryCov_9fa48("263");
        return str.replace(
            stryMutAct_9fa48("264") ? /[^.*+?^${}()|[\]\\]/g : (stryCov_9fa48("264"), /[.*+?^${}()|[\]\\]/g),
            stryMutAct_9fa48("265") ? "" : (stryCov_9fa48("265"), "\\$&")
        );
    }
}
function addRangesFromRegex(text: string, re: RegExp, ranges: Range[], groupIndex: number | null = null) {
    if (stryMutAct_9fa48("266")) {
        {
        }
    } else {
        stryCov_9fa48("266");
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while (
            stryMutAct_9fa48("268")
                ? (m = re.exec(text)) === null
                : stryMutAct_9fa48("267")
                  ? false
                  : (stryCov_9fa48("267", "268"), (m = re.exec(text)) !== null)
        ) {
            if (stryMutAct_9fa48("269")) {
                {
                }
            } else {
                stryCov_9fa48("269");
                if (
                    stryMutAct_9fa48("272")
                        ? m.index !== undefined
                        : stryMutAct_9fa48("271")
                          ? false
                          : stryMutAct_9fa48("270")
                            ? true
                            : (stryCov_9fa48("270", "271", "272"), m.index === undefined)
                )
                    continue;
                if (
                    stryMutAct_9fa48("275")
                        ? groupIndex != null
                        : stryMutAct_9fa48("274")
                          ? false
                          : stryMutAct_9fa48("273")
                            ? true
                            : (stryCov_9fa48("273", "274", "275"), groupIndex == null)
                ) {
                    if (stryMutAct_9fa48("276")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("276");
                        ranges.push(
                            stryMutAct_9fa48("277")
                                ? []
                                : (stryCov_9fa48("277"),
                                  [
                                      m.index,
                                      stryMutAct_9fa48("278")
                                          ? m.index - m[0].length
                                          : (stryCov_9fa48("278"), m.index + m[0].length),
                                  ])
                        );
                    }
                } else {
                    if (stryMutAct_9fa48("279")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("279");
                        // očekujemo pattern (^|boundary)(group)
                        const prefixLen = (
                            stryMutAct_9fa48("280")
                                ? m[1] && ""
                                : (stryCov_9fa48("280"),
                                  m[1] ??
                                      (stryMutAct_9fa48("281")
                                          ? "Stryker was here!"
                                          : (stryCov_9fa48("281"), "")))
                        ).length;
                        const g = stryMutAct_9fa48("282")
                            ? m[groupIndex] && ""
                            : (stryCov_9fa48("282"),
                              m[groupIndex] ??
                                  (stryMutAct_9fa48("283")
                                      ? "Stryker was here!"
                                      : (stryCov_9fa48("283"), "")));
                        const start = stryMutAct_9fa48("284")
                            ? m.index - prefixLen
                            : (stryCov_9fa48("284"), m.index + prefixLen);
                        ranges.push(
                            stryMutAct_9fa48("285")
                                ? []
                                : (stryCov_9fa48("285"),
                                  [
                                      start,
                                      stryMutAct_9fa48("286")
                                          ? start - g.length
                                          : (stryCov_9fa48("286"), start + g.length),
                                  ])
                        );
                    }
                }
                if (
                    stryMutAct_9fa48("289")
                        ? re.lastIndex !== m.index
                        : stryMutAct_9fa48("288")
                          ? false
                          : stryMutAct_9fa48("287")
                            ? true
                            : (stryCov_9fa48("287", "288", "289"), re.lastIndex === m.index)
                )
                    stryMutAct_9fa48("290") ? re.lastIndex-- : (stryCov_9fa48("290"), re.lastIndex++);
            }
        }
    }
}
function addRangesFromRegexTrimEnd(
    text: string,
    re: RegExp,
    ranges: Range[],
    trimEndFn: (s: string) => string
) {
    if (stryMutAct_9fa48("291")) {
        {
        }
    } else {
        stryCov_9fa48("291");
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while (
            stryMutAct_9fa48("293")
                ? (m = re.exec(text)) === null
                : stryMutAct_9fa48("292")
                  ? false
                  : (stryCov_9fa48("292", "293"), (m = re.exec(text)) !== null)
        ) {
            if (stryMutAct_9fa48("294")) {
                {
                }
            } else {
                stryCov_9fa48("294");
                if (
                    stryMutAct_9fa48("297")
                        ? m.index !== undefined
                        : stryMutAct_9fa48("296")
                          ? false
                          : stryMutAct_9fa48("295")
                            ? true
                            : (stryCov_9fa48("295", "296", "297"), m.index === undefined)
                )
                    continue;
                const raw = stryMutAct_9fa48("298")
                    ? m[0] && ""
                    : (stryCov_9fa48("298"),
                      m[0] ?? (stryMutAct_9fa48("299") ? "Stryker was here!" : (stryCov_9fa48("299"), "")));
                const trimmed = trimEndFn(raw);
                if (
                    stryMutAct_9fa48("302")
                        ? false
                        : stryMutAct_9fa48("301")
                          ? true
                          : stryMutAct_9fa48("300")
                            ? trimmed
                            : (stryCov_9fa48("300", "301", "302"), !trimmed)
                )
                    continue;
                const len = stryMutAct_9fa48("303")
                    ? Math.min(0, trimmed.length)
                    : (stryCov_9fa48("303"), Math.max(0, trimmed.length));
                if (
                    stryMutAct_9fa48("306")
                        ? len !== 0
                        : stryMutAct_9fa48("305")
                          ? false
                          : stryMutAct_9fa48("304")
                            ? true
                            : (stryCov_9fa48("304", "305", "306"), len === 0)
                )
                    continue;
                ranges.push(
                    stryMutAct_9fa48("307")
                        ? []
                        : (stryCov_9fa48("307"),
                          [
                              m.index,
                              stryMutAct_9fa48("308") ? m.index - len : (stryCov_9fa48("308"), m.index + len),
                          ])
                );
                if (
                    stryMutAct_9fa48("311")
                        ? re.lastIndex !== m.index
                        : stryMutAct_9fa48("310")
                          ? false
                          : stryMutAct_9fa48("309")
                            ? true
                            : (stryCov_9fa48("309", "310", "311"), re.lastIndex === m.index)
                )
                    stryMutAct_9fa48("312") ? re.lastIndex-- : (stryCov_9fa48("312"), re.lastIndex++);
            }
        }
    }
}
function mergeRanges(ranges: Range[]): Range[] {
    if (stryMutAct_9fa48("313")) {
        {
        }
    } else {
        stryCov_9fa48("313");
        if (
            stryMutAct_9fa48("316")
                ? ranges.length !== 0
                : stryMutAct_9fa48("315")
                  ? false
                  : stryMutAct_9fa48("314")
                    ? true
                    : (stryCov_9fa48("314", "315", "316"), ranges.length === 0)
        )
            return stryMutAct_9fa48("317") ? ["Stryker was here"] : (stryCov_9fa48("317"), []);
        stryMutAct_9fa48("318")
            ? ranges
            : (stryCov_9fa48("318"),
              ranges.sort(
                  stryMutAct_9fa48("319")
                      ? () => undefined
                      : (stryCov_9fa48("319"),
                        (a, b) =>
                            stryMutAct_9fa48("320") ? a[0] + b[0] : (stryCov_9fa48("320"), a[0] - b[0]))
              ));
        const out: Range[] = stryMutAct_9fa48("321") ? ["Stryker was here"] : (stryCov_9fa48("321"), []);
        for (const r of ranges) {
            if (stryMutAct_9fa48("322")) {
                {
                }
            } else {
                stryCov_9fa48("322");
                const last =
                    out[stryMutAct_9fa48("323") ? out.length + 1 : (stryCov_9fa48("323"), out.length - 1)];
                if (
                    stryMutAct_9fa48("326")
                        ? !last && r[0] > last[1]
                        : stryMutAct_9fa48("325")
                          ? false
                          : stryMutAct_9fa48("324")
                            ? true
                            : (stryCov_9fa48("324", "325", "326"),
                              (stryMutAct_9fa48("327") ? last : (stryCov_9fa48("327"), !last)) ||
                                  (stryMutAct_9fa48("330")
                                      ? r[0] <= last[1]
                                      : stryMutAct_9fa48("329")
                                        ? r[0] >= last[1]
                                        : stryMutAct_9fa48("328")
                                          ? false
                                          : (stryCov_9fa48("328", "329", "330"), r[0] > last[1])))
                )
                    out.push(stryMutAct_9fa48("331") ? [] : (stryCov_9fa48("331"), [r[0], r[1]]));
                else
                    last[1] = stryMutAct_9fa48("332")
                        ? Math.min(last[1], r[1])
                        : (stryCov_9fa48("332"), Math.max(last[1], r[1]));
            }
        }
        return out;
    }
}
export function splitByRanges(
    text: string,
    ranges: Range[]
): Array<{
    text: string;
    protected: boolean;
}> {
    if (stryMutAct_9fa48("333")) {
        {
        }
    } else {
        stryCov_9fa48("333");
        if (
            stryMutAct_9fa48("336")
                ? ranges.length !== 0
                : stryMutAct_9fa48("335")
                  ? false
                  : stryMutAct_9fa48("334")
                    ? true
                    : (stryCov_9fa48("334", "335", "336"), ranges.length === 0)
        )
            return stryMutAct_9fa48("337")
                ? []
                : (stryCov_9fa48("337"),
                  [
                      stryMutAct_9fa48("338")
                          ? {}
                          : (stryCov_9fa48("338"),
                            {
                                text,
                                protected: stryMutAct_9fa48("339") ? true : (stryCov_9fa48("339"), false),
                            }),
                  ]);
        const out: Array<{
            text: string;
            protected: boolean;
        }> = stryMutAct_9fa48("340") ? ["Stryker was here"] : (stryCov_9fa48("340"), []);
        let i = 0;
        for (const [s, e] of ranges) {
            if (stryMutAct_9fa48("341")) {
                {
                }
            } else {
                stryCov_9fa48("341");
                if (
                    stryMutAct_9fa48("345")
                        ? s <= i
                        : stryMutAct_9fa48("344")
                          ? s >= i
                          : stryMutAct_9fa48("343")
                            ? false
                            : stryMutAct_9fa48("342")
                              ? true
                              : (stryCov_9fa48("342", "343", "344", "345"), s > i)
                )
                    out.push(
                        stryMutAct_9fa48("346")
                            ? {}
                            : (stryCov_9fa48("346"),
                              {
                                  text: stryMutAct_9fa48("347")
                                      ? text
                                      : (stryCov_9fa48("347"), text.slice(i, s)),
                                  protected: stryMutAct_9fa48("348") ? true : (stryCov_9fa48("348"), false),
                              })
                    );
                out.push(
                    stryMutAct_9fa48("349")
                        ? {}
                        : (stryCov_9fa48("349"),
                          {
                              text: stryMutAct_9fa48("350") ? text : (stryCov_9fa48("350"), text.slice(s, e)),
                              protected: stryMutAct_9fa48("351") ? false : (stryCov_9fa48("351"), true),
                          })
                );
                i = e;
            }
        }
        if (
            stryMutAct_9fa48("355")
                ? i >= text.length
                : stryMutAct_9fa48("354")
                  ? i <= text.length
                  : stryMutAct_9fa48("353")
                    ? false
                    : stryMutAct_9fa48("352")
                      ? true
                      : (stryCov_9fa48("352", "353", "354", "355"), i < text.length)
        )
            out.push(
                stryMutAct_9fa48("356")
                    ? {}
                    : (stryCov_9fa48("356"),
                      {
                          text: stryMutAct_9fa48("357") ? text : (stryCov_9fa48("357"), text.slice(i)),
                          protected: stryMutAct_9fa48("358") ? true : (stryCov_9fa48("358"), false),
                      })
            );
        return out;
    }
}
export type CurlyProtection = "placeholders" | "all" | "none";
export interface ProtectOptions {
    protectBrands: boolean;
    brandPhrases: string[];
    userProtectedPhrases: string[];
    preserveCodeBlocks: boolean;
    curlyProtection: CurlyProtection;
}
export function collectProtectedRanges(text: string, opts: ProtectOptions): Range[] {
    if (stryMutAct_9fa48("359")) {
        {
        }
    } else {
        stryCov_9fa48("359");
        const ranges: Range[] = stryMutAct_9fa48("360") ? ["Stryker was here"] : (stryCov_9fa48("360"), []);

        // 0) Code blocks (Markdown): ```...``` i `...`
        if (
            stryMutAct_9fa48("362")
                ? false
                : stryMutAct_9fa48("361")
                  ? true
                  : (stryCov_9fa48("361", "362"), opts.preserveCodeBlocks)
        ) {
            if (stryMutAct_9fa48("363")) {
                {
                }
            } else {
                stryCov_9fa48("363");
                addRangesFromRegex(
                    text,
                    stryMutAct_9fa48("367")
                        ? /```[\s\s]*?```/g
                        : stryMutAct_9fa48("366")
                          ? /```[\S\S]*?```/g
                          : stryMutAct_9fa48("365")
                            ? /```[^\s\S]*?```/g
                            : stryMutAct_9fa48("364")
                              ? /```[\s\S]```/g
                              : (stryCov_9fa48("364", "365", "366", "367"), /```[\s\S]*?```/g),
                    ranges
                );
                addRangesFromRegex(
                    text,
                    stryMutAct_9fa48("369")
                        ? /`[`\r\n]*`/g
                        : stryMutAct_9fa48("368")
                          ? /`[^`\r\n]`/g
                          : (stryCov_9fa48("368", "369"), /`[^`\r\n]*`/g),
                    ranges
                );
            }
        }

        // 1) HTML tagovi
        addRangesFromRegex(
            text,
            stryMutAct_9fa48("374")
                ? /<\/?[a-zA-Z0-9]+[>]*>/g
                : stryMutAct_9fa48("373")
                  ? /<\/?[a-zA-Z0-9]+[^>]>/g
                  : stryMutAct_9fa48("372")
                    ? /<\/?[^a-zA-Z0-9]+[^>]*>/g
                    : stryMutAct_9fa48("371")
                      ? /<\/?[a-zA-Z0-9][^>]*>/g
                      : stryMutAct_9fa48("370")
                        ? /<\/[a-zA-Z0-9]+[^>]*>/g
                        : (stryCov_9fa48("370", "371", "372", "373", "374"), /<\/?[a-zA-Z0-9]+[^>]*>/g),
            ranges
        );

        // 2) URL / Email + URI schemes (trim trailing punctuation)
        addRangesFromRegexTrimEnd(text, EMAIL_RE_G, ranges, trimLinkEnd);
        addRangesFromRegexTrimEnd(text, URL_RE_G, ranges, trimLinkEnd);
        addRangesFromRegexTrimEnd(text, MAILTO_RE_G, ranges, trimLinkEnd);
        addRangesFromRegexTrimEnd(
            text,
            stryMutAct_9fa48("383")
                ? /\btel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[^a-z0-9._+~:%-]+)*/giu
                : stryMutAct_9fa48("382")
                  ? /\btel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-])*/giu
                  : stryMutAct_9fa48("381")
                    ? /\btel:\+?[0-9][0-9().-]{5,}(?:;[^a-z0-9-]+=[a-z0-9._+~:%-]+)*/giu
                    : stryMutAct_9fa48("380")
                      ? /\btel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]=[a-z0-9._+~:%-]+)*/giu
                      : stryMutAct_9fa48("379")
                        ? /\btel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)/giu
                        : stryMutAct_9fa48("378")
                          ? /\btel:\+?[0-9][^0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*/giu
                          : stryMutAct_9fa48("377")
                            ? /\btel:\+?[0-9][0-9().-](?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*/giu
                            : stryMutAct_9fa48("376")
                              ? /\btel:\+?[^0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*/giu
                              : stryMutAct_9fa48("375")
                                ? /\btel:\+[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*/giu
                                : (stryCov_9fa48(
                                      "375",
                                      "376",
                                      "377",
                                      "378",
                                      "379",
                                      "380",
                                      "381",
                                      "382",
                                      "383"
                                  ),
                                  /\btel:\+?[0-9][0-9().-]{5,}(?:;[a-z0-9-]+=[a-z0-9._+~:%-]+)*/giu),
            ranges,
            trimLinkEnd
        );
        addRangesFromRegexTrimEnd(text, URI_SCHEMES_NO_TEL_MAILTO_RE_G, ranges, trimLinkEnd);

        // 3) Putanje (Windows/UNC/Unix)
        addRangesFromRegex(
            text,
            stryMutAct_9fa48("387")
                ? /\b[a-zA-Z0-9]+:\\[\r\n<>:"|?*]+/g
                : stryMutAct_9fa48("386")
                  ? /\b[a-zA-Z0-9]+:\\[^\r\n<>:"|?*]/g
                  : stryMutAct_9fa48("385")
                    ? /\b[^a-zA-Z0-9]+:\\[^\r\n<>:"|?*]+/g
                    : stryMutAct_9fa48("384")
                      ? /\b[a-zA-Z0-9]:\\[^\r\n<>:"|?*]+/g
                      : (stryCov_9fa48("384", "385", "386", "387"), /\b[a-zA-Z0-9]+:\\[^\r\n<>:"|?*]+/g),
            ranges
        ); // C:\..., Cert:\...
        addRangesFromRegex(
            text,
            stryMutAct_9fa48("391")
                ? /\\\\[a-zA-Z0-9.-]+\\[\r\n<>:"|?*]+/g
                : stryMutAct_9fa48("390")
                  ? /\\\\[a-zA-Z0-9.-]+\\[^\r\n<>:"|?*]/g
                  : stryMutAct_9fa48("389")
                    ? /\\\\[^a-zA-Z0-9.-]+\\[^\r\n<>:"|?*]+/g
                    : stryMutAct_9fa48("388")
                      ? /\\\\[a-zA-Z0-9.-]\\[^\r\n<>:"|?*]+/g
                      : (stryCov_9fa48("388", "389", "390", "391"), /\\\\[a-zA-Z0-9.-]+\\[^\r\n<>:"|?*]+/g),
            ranges
        ); // \\Server\Share

        /**
         * Unix paths:
         * Guard da ne matchuje unutar URL-a.
         */
        addRangesFromRegex(
            text,
            stryMutAct_9fa48("397")
                ? /(^|[^:/])(\/[a-zA-Z0-9._-]+\/[^a-zA-Z0-9._\-/]+)/g
                : stryMutAct_9fa48("396")
                  ? /(^|[^:/])(\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._\-/])/g
                  : stryMutAct_9fa48("395")
                    ? /(^|[^:/])(\/[^a-zA-Z0-9._-]+\/[a-zA-Z0-9._\-/]+)/g
                    : stryMutAct_9fa48("394")
                      ? /(^|[^:/])(\/[a-zA-Z0-9._-]\/[a-zA-Z0-9._\-/]+)/g
                      : stryMutAct_9fa48("393")
                        ? /(^|[:/])(\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._\-/]+)/g
                        : stryMutAct_9fa48("392")
                          ? /([^:/])(\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._\-/]+)/g
                          : (stryCov_9fa48("392", "393", "394", "395", "396", "397"),
                            /(^|[^:/])(\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._\-/]+)/g),
            ranges,
            2
        );

        // 4) Ekstenzije fajlova
        addRangesFromRegex(
            text,
            stryMutAct_9fa48("400")
                ? /\b[\W.-]+\.(exe|dll|js|ts|json|xml|html|css|docx|xlsx|pptx|pdf|jpg|png|zip|rar|vsto|md|txt|sql|cs|py|java|cpp)\b/giu
                : stryMutAct_9fa48("399")
                  ? /\b[^\w.-]+\.(exe|dll|js|ts|json|xml|html|css|docx|xlsx|pptx|pdf|jpg|png|zip|rar|vsto|md|txt|sql|cs|py|java|cpp)\b/giu
                  : stryMutAct_9fa48("398")
                    ? /\b[\w.-]\.(exe|dll|js|ts|json|xml|html|css|docx|xlsx|pptx|pdf|jpg|png|zip|rar|vsto|md|txt|sql|cs|py|java|cpp)\b/giu
                    : (stryCov_9fa48("398", "399", "400"),
                      /\b[\w.-]+\.(exe|dll|js|ts|json|xml|html|css|docx|xlsx|pptx|pdf|jpg|png|zip|rar|vsto|md|txt|sql|cs|py|java|cpp)\b/giu),
            ranges
        );

        // 5) Verzije i prečice
        addRangesFromRegex(
            text,
            stryMutAct_9fa48("405")
                ? /\bv\d+(\.\D+)*\b/giu
                : stryMutAct_9fa48("404")
                  ? /\bv\d+(\.\d)*\b/giu
                  : stryMutAct_9fa48("403")
                    ? /\bv\d+(\.\d+)\b/giu
                    : stryMutAct_9fa48("402")
                      ? /\bv\D+(\.\d+)*\b/giu
                      : stryMutAct_9fa48("401")
                        ? /\bv\d(\.\d+)*\b/giu
                        : (stryCov_9fa48("401", "402", "403", "404", "405"), /\bv\d+(\.\d+)*\b/giu),
            ranges
        );
        addRangesFromRegex(
            text,
            stryMutAct_9fa48("410")
                ? /\b(Ctrl|Alt|Shift|Cmd)\s*\+\s*[^A-Z0-9]\b/giu
                : stryMutAct_9fa48("409")
                  ? /\b(Ctrl|Alt|Shift|Cmd)\s*\+\S*[A-Z0-9]\b/giu
                  : stryMutAct_9fa48("408")
                    ? /\b(Ctrl|Alt|Shift|Cmd)\s*\+\s[A-Z0-9]\b/giu
                    : stryMutAct_9fa48("407")
                      ? /\b(Ctrl|Alt|Shift|Cmd)\S*\+\s*[A-Z0-9]\b/giu
                      : stryMutAct_9fa48("406")
                        ? /\b(Ctrl|Alt|Shift|Cmd)\s\+\s*[A-Z0-9]\b/giu
                        : (stryCov_9fa48("406", "407", "408", "409", "410"),
                          /\b(Ctrl|Alt|Shift|Cmd)\s*\+\s*[A-Z0-9]\b/giu),
            ranges
        );

        // 6) GUID
        addRangesFromRegex(
            text,
            stryMutAct_9fa48("420")
                ? /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[^0-9a-f]{12}\b/giu
                : stryMutAct_9fa48("419")
                  ? /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]\b/giu
                  : stryMutAct_9fa48("418")
                    ? /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[^0-9a-f]{4}-[0-9a-f]{12}\b/giu
                    : stryMutAct_9fa48("417")
                      ? /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]-[0-9a-f]{12}\b/giu
                      : stryMutAct_9fa48("416")
                        ? /\b[0-9a-f]{8}-[0-9a-f]{4}-[^0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/giu
                        : stryMutAct_9fa48("415")
                          ? /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]-[0-9a-f]{4}-[0-9a-f]{12}\b/giu
                          : stryMutAct_9fa48("414")
                            ? /\b[0-9a-f]{8}-[^0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/giu
                            : stryMutAct_9fa48("413")
                              ? /\b[0-9a-f]{8}-[0-9a-f]-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/giu
                              : stryMutAct_9fa48("412")
                                ? /\b[^0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/giu
                                : stryMutAct_9fa48("411")
                                  ? /\b[0-9a-f]-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/giu
                                  : (stryCov_9fa48(
                                        "411",
                                        "412",
                                        "413",
                                        "414",
                                        "415",
                                        "416",
                                        "417",
                                        "418",
                                        "419",
                                        "420"
                                    ),
                                    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/giu),
            ranges
        );

        // 7) Kod/placeholder blokovi
        if (
            stryMutAct_9fa48("423")
                ? opts.curlyProtection !== "all"
                : stryMutAct_9fa48("422")
                  ? false
                  : stryMutAct_9fa48("421")
                    ? true
                    : (stryCov_9fa48("421", "422", "423"),
                      opts.curlyProtection === (stryMutAct_9fa48("424") ? "" : (stryCov_9fa48("424"), "all")))
        ) {
            if (stryMutAct_9fa48("425")) {
                {
                }
            } else {
                stryCov_9fa48("425");
                addRangesFromRegex(
                    text,
                    stryMutAct_9fa48("429")
                        ? /\{[\s\s]*?\}/g
                        : stryMutAct_9fa48("428")
                          ? /\{[\S\S]*?\}/g
                          : stryMutAct_9fa48("427")
                            ? /\{[^\s\S]*?\}/g
                            : stryMutAct_9fa48("426")
                              ? /\{[\s\S]\}/g
                              : (stryCov_9fa48("426", "427", "428", "429"), /\{[\s\S]*?\}/g),
                    ranges
                );
            }
        } else if (
            stryMutAct_9fa48("432")
                ? opts.curlyProtection !== "placeholders"
                : stryMutAct_9fa48("431")
                  ? false
                  : stryMutAct_9fa48("430")
                    ? true
                    : (stryCov_9fa48("430", "431", "432"),
                      opts.curlyProtection ===
                          (stryMutAct_9fa48("433") ? "" : (stryCov_9fa48("433"), "placeholders")))
        ) {
            if (stryMutAct_9fa48("434")) {
                {
                }
            } else {
                stryCov_9fa48("434");
                // [FIX] Allow underscore at start
                addRangesFromRegex(
                    text,
                    stryMutAct_9fa48("437")
                        ? /\{[A-Za-z_][^A-Za-z0-9_:-]{0,120}\}/g
                        : stryMutAct_9fa48("436")
                          ? /\{[A-Za-z_][A-Za-z0-9_:-]\}/g
                          : stryMutAct_9fa48("435")
                            ? /\{[^A-Za-z_][A-Za-z0-9_:-]{0,120}\}/g
                            : (stryCov_9fa48("435", "436", "437"), /\{[A-Za-z_][A-Za-z0-9_:-]{0,120}\}/g),
                    ranges
                );
            }
        }
        addRangesFromRegex(
            text,
            stryMutAct_9fa48("439")
                ? /<[^a-zA-Z0-9_]+>/g
                : stryMutAct_9fa48("438")
                  ? /<[a-zA-Z0-9_]>/g
                  : (stryCov_9fa48("438", "439"), /<[a-zA-Z0-9_]+>/g),
            ranges
        );

        // 8) Fraze (brend + userProtected) - bez lookbehind
        const boundary = stryMutAct_9fa48("440") ? `` : (stryCov_9fa48("440"), `[^\\p{L}\\p{N}]`);
        const boundaryPrefix = stryMutAct_9fa48("441") ? `` : (stryCov_9fa48("441"), `(^|${boundary})`);
        const boundarySuffix = stryMutAct_9fa48("442") ? `` : (stryCov_9fa48("442"), `(?=$|${boundary})`);
        if (
            stryMutAct_9fa48("445")
                ? opts.protectBrands || opts.brandPhrases.length
                : stryMutAct_9fa48("444")
                  ? false
                  : stryMutAct_9fa48("443")
                    ? true
                    : (stryCov_9fa48("443", "444", "445"), opts.protectBrands && opts.brandPhrases.length)
        ) {
            if (stryMutAct_9fa48("446")) {
                {
                }
            } else {
                stryCov_9fa48("446");
                for (const phrase of opts.brandPhrases) {
                    if (stryMutAct_9fa48("447")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("447");
                        const parts = phrase
                            .split(
                                stryMutAct_9fa48("449")
                                    ? /\S+/
                                    : stryMutAct_9fa48("448")
                                      ? /\s/
                                      : (stryCov_9fa48("448", "449"), /\s+/)
                            )
                            .map(escapeRegex)
                            .join(stryMutAct_9fa48("450") ? "" : (stryCov_9fa48("450"), "\\s+"));
                        const re = new RegExp(
                            stryMutAct_9fa48("451")
                                ? ``
                                : (stryCov_9fa48("451"), `${boundaryPrefix}(${parts})${boundarySuffix}`),
                            stryMutAct_9fa48("452") ? "" : (stryCov_9fa48("452"), "giu")
                        );
                        addRangesFromRegex(text, re, ranges, 2);
                    }
                }
            }
        }
        if (
            stryMutAct_9fa48("454")
                ? false
                : stryMutAct_9fa48("453")
                  ? true
                  : (stryCov_9fa48("453", "454"), opts.userProtectedPhrases.length)
        ) {
            if (stryMutAct_9fa48("455")) {
                {
                }
            } else {
                stryCov_9fa48("455");
                for (const phrase of opts.userProtectedPhrases) {
                    if (stryMutAct_9fa48("456")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("456");
                        const parts = phrase
                            .split(
                                stryMutAct_9fa48("458")
                                    ? /\S+/
                                    : stryMutAct_9fa48("457")
                                      ? /\s/
                                      : (stryCov_9fa48("457", "458"), /\s+/)
                            )
                            .map(escapeRegex)
                            .join(stryMutAct_9fa48("459") ? "" : (stryCov_9fa48("459"), "\\s+"));
                        const re = new RegExp(
                            stryMutAct_9fa48("460")
                                ? ``
                                : (stryCov_9fa48("460"), `${boundaryPrefix}(${parts})${boundarySuffix}`),
                            stryMutAct_9fa48("461") ? "" : (stryCov_9fa48("461"), "giu")
                        );
                        addRangesFromRegex(text, re, ranges, 2);
                    }
                }
            }
        }
        return mergeRanges(ranges);
    }
}
