// @ts-nocheck
// src/shared/ooxml/dom.ts
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
export const XML_NS = stryMutAct_9fa48("4059")
    ? ""
    : (stryCov_9fa48("4059"), "http://www.w3.org/XML/1998/namespace");
export const WORD_NS = stryMutAct_9fa48("4060")
    ? ""
    : (stryCov_9fa48("4060"), "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
export function needsXmlSpacePreserve(text: string): boolean {
    if (stryMutAct_9fa48("4061")) {
        {
        }
    } else {
        stryCov_9fa48("4061");
        return stryMutAct_9fa48("4064")
            ? /^\s/.test(text) && /\s$/.test(text)
            : stryMutAct_9fa48("4063")
              ? false
              : stryMutAct_9fa48("4062")
                ? true
                : (stryCov_9fa48("4062", "4063", "4064"),
                  (stryMutAct_9fa48("4066")
                      ? /^\S/
                      : stryMutAct_9fa48("4065")
                        ? /\s/
                        : (stryCov_9fa48("4065", "4066"), /^\s/)
                  ).test(text) ||
                      (stryMutAct_9fa48("4068")
                          ? /\S$/
                          : stryMutAct_9fa48("4067")
                            ? /\s/
                            : (stryCov_9fa48("4067", "4068"), /\s$/)
                      ).test(text));
    }
}
export function isInsideTag(el: Element, localName: string): boolean {
    if (stryMutAct_9fa48("4069")) {
        {
        }
    } else {
        stryCov_9fa48("4069");
        let cur: Element | null = el;
        while (stryMutAct_9fa48("4070") ? false : (stryCov_9fa48("4070"), cur)) {
            if (stryMutAct_9fa48("4071")) {
                {
                }
            } else {
                stryCov_9fa48("4071");
                if (
                    stryMutAct_9fa48("4074")
                        ? cur.localName !== localName
                        : stryMutAct_9fa48("4073")
                          ? false
                          : stryMutAct_9fa48("4072")
                            ? true
                            : (stryCov_9fa48("4072", "4073", "4074"), cur.localName === localName)
                )
                    return stryMutAct_9fa48("4075") ? false : (stryCov_9fa48("4075"), true);
                cur = cur.parentElement;
            }
        }
        return stryMutAct_9fa48("4076") ? true : (stryCov_9fa48("4076"), false);
    }
}

// [OPTIMIZED] Brže čitanje stila bez querySelector-a
function getStyleIdFromPr(prElement: Element): string | null {
    if (stryMutAct_9fa48("4077")) {
        {
        }
    } else {
        stryCov_9fa48("4077");
        for (
            let i = 0;
            stryMutAct_9fa48("4080")
                ? i >= prElement.children.length
                : stryMutAct_9fa48("4079")
                  ? i <= prElement.children.length
                  : stryMutAct_9fa48("4078")
                    ? false
                    : (stryCov_9fa48("4078", "4079", "4080"), i < prElement.children.length);
            stryMutAct_9fa48("4081") ? i-- : (stryCov_9fa48("4081"), i++)
        ) {
            if (stryMutAct_9fa48("4082")) {
                {
                }
            } else {
                stryCov_9fa48("4082");
                const child = prElement.children[i];
                // Provera localName je brža od string match-a
                if (
                    stryMutAct_9fa48("4085")
                        ? child.localName === "pStyle" && child.localName === "rStyle"
                        : stryMutAct_9fa48("4084")
                          ? false
                          : stryMutAct_9fa48("4083")
                            ? true
                            : (stryCov_9fa48("4083", "4084", "4085"),
                              (stryMutAct_9fa48("4087")
                                  ? child.localName !== "pStyle"
                                  : stryMutAct_9fa48("4086")
                                    ? false
                                    : (stryCov_9fa48("4086", "4087"),
                                      child.localName ===
                                          (stryMutAct_9fa48("4088")
                                              ? ""
                                              : (stryCov_9fa48("4088"), "pStyle")))) ||
                                  (stryMutAct_9fa48("4090")
                                      ? child.localName !== "rStyle"
                                      : stryMutAct_9fa48("4089")
                                        ? false
                                        : (stryCov_9fa48("4089", "4090"),
                                          child.localName ===
                                              (stryMutAct_9fa48("4091")
                                                  ? ""
                                                  : (stryCov_9fa48("4091"), "rStyle")))))
                ) {
                    if (stryMutAct_9fa48("4092")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4092");
                        return child.getAttributeNS(
                            WORD_NS,
                            stryMutAct_9fa48("4093") ? "" : (stryCov_9fa48("4093"), "val")
                        );
                    }
                }
            }
        }
        return null;
    }
}
export function getParagraphStyleId(para: Element): string | null {
    if (stryMutAct_9fa48("4094")) {
        {
        }
    } else {
        stryCov_9fa48("4094");
        // Structure: <w:p> -> <w:pPr> -> <w:pStyle w:val="Code"/>
        for (
            let i = 0;
            stryMutAct_9fa48("4097")
                ? i >= para.children.length
                : stryMutAct_9fa48("4096")
                  ? i <= para.children.length
                  : stryMutAct_9fa48("4095")
                    ? false
                    : (stryCov_9fa48("4095", "4096", "4097"), i < para.children.length);
            stryMutAct_9fa48("4098") ? i-- : (stryCov_9fa48("4098"), i++)
        ) {
            if (stryMutAct_9fa48("4099")) {
                {
                }
            } else {
                stryCov_9fa48("4099");
                const child = para.children[i];
                if (
                    stryMutAct_9fa48("4102")
                        ? child.localName !== "pPr"
                        : stryMutAct_9fa48("4101")
                          ? false
                          : stryMutAct_9fa48("4100")
                            ? true
                            : (stryCov_9fa48("4100", "4101", "4102"),
                              child.localName ===
                                  (stryMutAct_9fa48("4103") ? "" : (stryCov_9fa48("4103"), "pPr")))
                ) {
                    if (stryMutAct_9fa48("4104")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4104");
                        return getStyleIdFromPr(child);
                    }
                }
            }
        }
        return null;
    }
}

// [NEW] Podrška za Character Styles (Inline Code)
export function getRunStyleId(run: Element): string | null {
    if (stryMutAct_9fa48("4105")) {
        {
        }
    } else {
        stryCov_9fa48("4105");
        // Structure: <w:r> -> <w:rPr> -> <w:rStyle w:val="CodeChar"/>
        for (
            let i = 0;
            stryMutAct_9fa48("4108")
                ? i >= run.children.length
                : stryMutAct_9fa48("4107")
                  ? i <= run.children.length
                  : stryMutAct_9fa48("4106")
                    ? false
                    : (stryCov_9fa48("4106", "4107", "4108"), i < run.children.length);
            stryMutAct_9fa48("4109") ? i-- : (stryCov_9fa48("4109"), i++)
        ) {
            if (stryMutAct_9fa48("4110")) {
                {
                }
            } else {
                stryCov_9fa48("4110");
                const child = run.children[i];
                if (
                    stryMutAct_9fa48("4113")
                        ? child.localName !== "rPr"
                        : stryMutAct_9fa48("4112")
                          ? false
                          : stryMutAct_9fa48("4111")
                            ? true
                            : (stryCov_9fa48("4111", "4112", "4113"),
                              child.localName ===
                                  (stryMutAct_9fa48("4114") ? "" : (stryCov_9fa48("4114"), "rPr")))
                ) {
                    if (stryMutAct_9fa48("4115")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4115");
                        return getStyleIdFromPr(child);
                    }
                }
            }
        }
        return null;
    }
}
export function collectTextNodes(doc: Document): Element[] {
    if (stryMutAct_9fa48("4116")) {
        {
        }
    } else {
        stryCov_9fa48("4116");
        let allTextNodes = Array.from(
            doc.getElementsByTagNameNS(WORD_NS, stryMutAct_9fa48("4117") ? "" : (stryCov_9fa48("4117"), "t"))
        );
        if (
            stryMutAct_9fa48("4120")
                ? allTextNodes.length !== 0
                : stryMutAct_9fa48("4119")
                  ? false
                  : stryMutAct_9fa48("4118")
                    ? true
                    : (stryCov_9fa48("4118", "4119", "4120"), allTextNodes.length === 0)
        )
            allTextNodes = Array.from(
                doc.getElementsByTagName(stryMutAct_9fa48("4121") ? "" : (stryCov_9fa48("4121"), "w:t"))
            );
        if (
            stryMutAct_9fa48("4124")
                ? allTextNodes.length !== 0
                : stryMutAct_9fa48("4123")
                  ? false
                  : stryMutAct_9fa48("4122")
                    ? true
                    : (stryCov_9fa48("4122", "4123", "4124"), allTextNodes.length === 0)
        )
            allTextNodes = Array.from(
                doc.getElementsByTagName(stryMutAct_9fa48("4125") ? "" : (stryCov_9fa48("4125"), "t"))
            );
        return stryMutAct_9fa48("4126")
            ? allTextNodes
            : (stryCov_9fa48("4126"),
              allTextNodes.filter((n) => {
                  if (stryMutAct_9fa48("4127")) {
                      {
                      }
                  } else {
                      stryCov_9fa48("4127");
                      if (
                          stryMutAct_9fa48("4129")
                              ? false
                              : stryMutAct_9fa48("4128")
                                ? true
                                : (stryCov_9fa48("4128", "4129"),
                                  isInsideTag(
                                      n,
                                      stryMutAct_9fa48("4130") ? "" : (stryCov_9fa48("4130"), "instrText")
                                  ))
                      )
                          return stryMutAct_9fa48("4131") ? true : (stryCov_9fa48("4131"), false);
                      if (
                          stryMutAct_9fa48("4133")
                              ? false
                              : stryMutAct_9fa48("4132")
                                ? true
                                : (stryCov_9fa48("4132", "4133"),
                                  isInsideTag(
                                      n,
                                      stryMutAct_9fa48("4134") ? "" : (stryCov_9fa48("4134"), "fldSimple")
                                  ))
                      )
                          return stryMutAct_9fa48("4135") ? true : (stryCov_9fa48("4135"), false);
                      if (
                          stryMutAct_9fa48("4137")
                              ? false
                              : stryMutAct_9fa48("4136")
                                ? true
                                : (stryCov_9fa48("4136", "4137"),
                                  isInsideTag(
                                      n,
                                      stryMutAct_9fa48("4138") ? "" : (stryCov_9fa48("4138"), "fldChar")
                                  ))
                      )
                          return stryMutAct_9fa48("4139") ? true : (stryCov_9fa48("4139"), false);
                      if (
                          stryMutAct_9fa48("4141")
                              ? false
                              : stryMutAct_9fa48("4140")
                                ? true
                                : (stryCov_9fa48("4140", "4141"),
                                  isInsideTag(
                                      n,
                                      stryMutAct_9fa48("4142") ? "" : (stryCov_9fa48("4142"), "delText")
                                  ))
                      )
                          return stryMutAct_9fa48("4143") ? true : (stryCov_9fa48("4143"), false);
                      return stryMutAct_9fa48("4144") ? false : (stryCov_9fa48("4144"), true);
                  }
              }));
    }
}
export function getFullText(textNodes: Element[]): string {
    if (stryMutAct_9fa48("4145")) {
        {
        }
    } else {
        stryCov_9fa48("4145");
        let fullText = stryMutAct_9fa48("4146") ? "Stryker was here!" : (stryCov_9fa48("4146"), "");
        for (const node of textNodes) {
            if (stryMutAct_9fa48("4147")) {
                {
                }
            } else {
                stryCov_9fa48("4147");
                stryMutAct_9fa48("4148")
                    ? (fullText -= node.textContent ?? "")
                    : (stryCov_9fa48("4148"),
                      (fullText += stryMutAct_9fa48("4149")
                          ? node.textContent && ""
                          : (stryCov_9fa48("4149"),
                            node.textContent ??
                                (stryMutAct_9fa48("4150")
                                    ? "Stryker was here!"
                                    : (stryCov_9fa48("4150"), "")))));
            }
        }
        return fullText;
    }
}
