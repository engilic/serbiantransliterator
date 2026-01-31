// @ts-nocheck
// src/taskpane/app/settings/defaults.ts
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
import type { UiSettings } from "../types";
export const SETTINGS_KEY = stryMutAct_9fa48("6469")
    ? ""
    : (stryCov_9fa48("6469"), "serbiantransliterator.settings.v2");
export const DEFAULT_SETTINGS: UiSettings = stryMutAct_9fa48("6470")
    ? {}
    : (stryCov_9fa48("6470"),
      {
          schemaVersion: 2,
          profile: stryMutAct_9fa48("6471") ? "" : (stryCov_9fa48("6471"), "custom"),
          userWordsCustom: stryMutAct_9fa48("6472") ? ["Stryker was here"] : (stryCov_9fa48("6472"), []),
          theme: stryMutAct_9fa48("6473") ? "" : (stryCov_9fa48("6473"), "auto"),
          customSubstitutions: stryMutAct_9fa48("6474") ? "Stryker was here!" : (stryCov_9fa48("6474"), ""),
          dialect: stryMutAct_9fa48("6475") ? "" : (stryCov_9fa48("6475"), "none"),
          // [NEW] Default styles to ignore
          ignoredStyles: stryMutAct_9fa48("6476")
              ? []
              : (stryCov_9fa48("6476"),
                [
                    stryMutAct_9fa48("6477") ? "" : (stryCov_9fa48("6477"), "Code"),
                    stryMutAct_9fa48("6478") ? "" : (stryCov_9fa48("6478"), "Macro Text"),
                    stryMutAct_9fa48("6479") ? "" : (stryCov_9fa48("6479"), "Source Code"),
                ]),
          confirmWholeDoc: stryMutAct_9fa48("6480") ? false : (stryCov_9fa48("6480"), true),
          includeHeadersFooters: stryMutAct_9fa48("6481") ? true : (stryCov_9fa48("6481"), false),
          includeFootnotes: stryMutAct_9fa48("6482") ? true : (stryCov_9fa48("6482"), false),
          includeEndnotes: stryMutAct_9fa48("6483") ? true : (stryCov_9fa48("6483"), false),
          direction: stryMutAct_9fa48("6484") ? "" : (stryCov_9fa48("6484"), "auto"),
          protectBrands: stryMutAct_9fa48("6485") ? false : (stryCov_9fa48("6485"), true),
          preserveCodeBlocks: stryMutAct_9fa48("6486") ? false : (stryCov_9fa48("6486"), true),
          protectRomans: stryMutAct_9fa48("6487") ? false : (stryCov_9fa48("6487"), true),
          applySerbianQuotes: stryMutAct_9fa48("6488") ? false : (stryCov_9fa48("6488"), true),
          curlyProtection: stryMutAct_9fa48("6489") ? "" : (stryCov_9fa48("6489"), "placeholders"),
          setProofingLanguage: stryMutAct_9fa48("6490") ? false : (stryCov_9fa48("6490"), true),
      });
export const PROFILE_NAMES: Record<string, string> = stryMutAct_9fa48("6491")
    ? {}
    : (stryCov_9fa48("6491"),
      {
          custom: stryMutAct_9fa48("6492") ? "" : (stryCov_9fa48("6492"), "Ručno"),
          it: stryMutAct_9fa48("6493") ? "" : (stryCov_9fa48("6493"), "IT / Tehnologija"),
          finance: stryMutAct_9fa48("6494") ? "" : (stryCov_9fa48("6494"), "Finansije / Bankarstvo"),
          medical: stryMutAct_9fa48("6495") ? "" : (stryCov_9fa48("6495"), "Medicina / Farmacija"),
          legal: stryMutAct_9fa48("6496") ? "" : (stryCov_9fa48("6496"), "Pravo / Administracija"),
          marketing: stryMutAct_9fa48("6497") ? "" : (stryCov_9fa48("6497"), "Marketing / Društvene mreže"),
          journalism: stryMutAct_9fa48("6498") ? "" : (stryCov_9fa48("6498"), "Novinarstvo / Mediji"),
      });
export const PRESETS: Record<
    string,
    Partial<UiSettings> & {
        userWords: string[];
    }
> = stryMutAct_9fa48("6499")
    ? {}
    : (stryCov_9fa48("6499"),
      {
          it: stryMutAct_9fa48("6500")
              ? {}
              : (stryCov_9fa48("6500"),
                {
                    direction: stryMutAct_9fa48("6501") ? "" : (stryCov_9fa48("6501"), "auto"),
                    protectBrands: stryMutAct_9fa48("6502") ? false : (stryCov_9fa48("6502"), true),
                    applySerbianQuotes: stryMutAct_9fa48("6503") ? true : (stryCov_9fa48("6503"), false),
                    preserveCodeBlocks: stryMutAct_9fa48("6504") ? false : (stryCov_9fa48("6504"), true),
                    setProofingLanguage: stryMutAct_9fa48("6505") ? false : (stryCov_9fa48("6505"), true),
                    protectRomans: stryMutAct_9fa48("6506") ? false : (stryCov_9fa48("6506"), true),
                    confirmWholeDoc: stryMutAct_9fa48("6507") ? false : (stryCov_9fa48("6507"), true),
                    curlyProtection: stryMutAct_9fa48("6508") ? "" : (stryCov_9fa48("6508"), "placeholders"),
                    dialect: stryMutAct_9fa48("6509") ? "" : (stryCov_9fa48("6509"), "none"),
                    // [NEW] IT preset ignores Code by default
                    ignoredStyles: stryMutAct_9fa48("6510")
                        ? []
                        : (stryCov_9fa48("6510"),
                          [
                              stryMutAct_9fa48("6511") ? "" : (stryCov_9fa48("6511"), "Code"),
                              stryMutAct_9fa48("6512") ? "" : (stryCov_9fa48("6512"), "Macro Text"),
                              stryMutAct_9fa48("6513") ? "" : (stryCov_9fa48("6513"), "Source Code"),
                              stryMutAct_9fa48("6514") ? "" : (stryCov_9fa48("6514"), "HTML Preformatted"),
                          ]),
                    userWords: stryMutAct_9fa48("6515")
                        ? []
                        : (stryCov_9fa48("6515"),
                          [
                              stryMutAct_9fa48("6516") ? "" : (stryCov_9fa48("6516"), "Git"),
                              stryMutAct_9fa48("6517") ? "" : (stryCov_9fa48("6517"), "GitHub"),
                              stryMutAct_9fa48("6518") ? "" : (stryCov_9fa48("6518"), "GitLab"),
                              stryMutAct_9fa48("6519") ? "" : (stryCov_9fa48("6519"), "Azure"),
                              stryMutAct_9fa48("6520") ? "" : (stryCov_9fa48("6520"), "AWS"),
                              stryMutAct_9fa48("6521") ? "" : (stryCov_9fa48("6521"), "GCP"),
                              stryMutAct_9fa48("6522") ? "" : (stryCov_9fa48("6522"), "DevOps"),
                              stryMutAct_9fa48("6523") ? "" : (stryCov_9fa48("6523"), "Docker"),
                              stryMutAct_9fa48("6524") ? "" : (stryCov_9fa48("6524"), "Kubernetes"),
                              stryMutAct_9fa48("6525") ? "" : (stryCov_9fa48("6525"), "CI/CD"),
                              stryMutAct_9fa48("6526") ? "" : (stryCov_9fa48("6526"), "YAML"),
                              stryMutAct_9fa48("6527") ? "" : (stryCov_9fa48("6527"), "REST"),
                              stryMutAct_9fa48("6528") ? "" : (stryCov_9fa48("6528"), "GraphQL"),
                              stryMutAct_9fa48("6529") ? "" : (stryCov_9fa48("6529"), "PowerShell"),
                              stryMutAct_9fa48("6530") ? "" : (stryCov_9fa48("6530"), "VS Code"),
                              stryMutAct_9fa48("6531") ? "" : (stryCov_9fa48("6531"), "Visual Studio"),
                              stryMutAct_9fa48("6532") ? "" : (stryCov_9fa48("6532"), "Windows Server"),
                              stryMutAct_9fa48("6533") ? "" : (stryCov_9fa48("6533"), "Linux"),
                              stryMutAct_9fa48("6534")
                                  ? ""
                                  : (stryCov_9fa48("6534"), "SerbianTransliterator"),
                              stryMutAct_9fa48("6535") ? "" : (stryCov_9fa48("6535"), "Python"),
                              stryMutAct_9fa48("6536") ? "" : (stryCov_9fa48("6536"), "JavaScript"),
                              stryMutAct_9fa48("6537") ? "" : (stryCov_9fa48("6537"), "Typescript"),
                              stryMutAct_9fa48("6538") ? "" : (stryCov_9fa48("6538"), "Node.js"),
                              stryMutAct_9fa48("6539") ? "" : (stryCov_9fa48("6539"), "React"),
                              stryMutAct_9fa48("6540") ? "" : (stryCov_9fa48("6540"), "Angular"),
                              stryMutAct_9fa48("6541") ? "" : (stryCov_9fa48("6541"), "Vue"),
                              stryMutAct_9fa48("6542") ? "" : (stryCov_9fa48("6542"), "Frontend"),
                              stryMutAct_9fa48("6543") ? "" : (stryCov_9fa48("6543"), "Backend"),
                              stryMutAct_9fa48("6544") ? "" : (stryCov_9fa48("6544"), "Fullstack"),
                              stryMutAct_9fa48("6545") ? "" : (stryCov_9fa48("6545"), "Database"),
                              stryMutAct_9fa48("6546") ? "" : (stryCov_9fa48("6546"), "Cache"),
                              stryMutAct_9fa48("6547") ? "" : (stryCov_9fa48("6547"), "Cookie"),
                              stryMutAct_9fa48("6548") ? "" : (stryCov_9fa48("6548"), "Token"),
                              stryMutAct_9fa48("6549") ? "" : (stryCov_9fa48("6549"), "API"),
                              stryMutAct_9fa48("6550") ? "" : (stryCov_9fa48("6550"), "Endpoint"),
                          ]),
                }),
          // ... (ostali preseti ostaju isti, default ignoredStyles se primenjuje ako nije override-ovan)
          finance: stryMutAct_9fa48("6551")
              ? {}
              : (stryCov_9fa48("6551"),
                {
                    direction: stryMutAct_9fa48("6552") ? "" : (stryCov_9fa48("6552"), "auto"),
                    protectBrands: stryMutAct_9fa48("6553") ? false : (stryCov_9fa48("6553"), true),
                    applySerbianQuotes: stryMutAct_9fa48("6554") ? false : (stryCov_9fa48("6554"), true),
                    preserveCodeBlocks: stryMutAct_9fa48("6555") ? false : (stryCov_9fa48("6555"), true),
                    setProofingLanguage: stryMutAct_9fa48("6556") ? false : (stryCov_9fa48("6556"), true),
                    protectRomans: stryMutAct_9fa48("6557") ? false : (stryCov_9fa48("6557"), true),
                    confirmWholeDoc: stryMutAct_9fa48("6558") ? false : (stryCov_9fa48("6558"), true),
                    curlyProtection: stryMutAct_9fa48("6559") ? "" : (stryCov_9fa48("6559"), "placeholders"),
                    dialect: stryMutAct_9fa48("6560") ? "" : (stryCov_9fa48("6560"), "none"),
                    userWords: stryMutAct_9fa48("6561")
                        ? []
                        : (stryCov_9fa48("6561"),
                          [
                              stryMutAct_9fa48("6562") ? "" : (stryCov_9fa48("6562"), "SWIFT"),
                              stryMutAct_9fa48("6563") ? "" : (stryCov_9fa48("6563"), "IBAN"),
                              stryMutAct_9fa48("6564") ? "" : (stryCov_9fa48("6564"), "EUR"),
                              stryMutAct_9fa48("6565") ? "" : (stryCov_9fa48("6565"), "USD"),
                              stryMutAct_9fa48("6566") ? "" : (stryCov_9fa48("6566"), "RSD"),
                              stryMutAct_9fa48("6567") ? "" : (stryCov_9fa48("6567"), "CHF"),
                              stryMutAct_9fa48("6568") ? "" : (stryCov_9fa48("6568"), "GBP"),
                              stryMutAct_9fa48("6569") ? "" : (stryCov_9fa48("6569"), "MasterCard"),
                              stryMutAct_9fa48("6570") ? "" : (stryCov_9fa48("6570"), "Visa"),
                              stryMutAct_9fa48("6571") ? "" : (stryCov_9fa48("6571"), "PayPal"),
                              stryMutAct_9fa48("6572") ? "" : (stryCov_9fa48("6572"), "Intesa"),
                              stryMutAct_9fa48("6573") ? "" : (stryCov_9fa48("6573"), "Raiffeisen"),
                              stryMutAct_9fa48("6574") ? "" : (stryCov_9fa48("6574"), "OTP"),
                              stryMutAct_9fa48("6575") ? "" : (stryCov_9fa48("6575"), "NLB"),
                              stryMutAct_9fa48("6576") ? "" : (stryCov_9fa48("6576"), "AIK"),
                              stryMutAct_9fa48("6577") ? "" : (stryCov_9fa48("6577"), "Erste"),
                              stryMutAct_9fa48("6578") ? "" : (stryCov_9fa48("6578"), "UniCredit"),
                              stryMutAct_9fa48("6579") ? "" : (stryCov_9fa48("6579"), "Western Union"),
                              stryMutAct_9fa48("6580") ? "" : (stryCov_9fa48("6580"), "E-banking"),
                              stryMutAct_9fa48("6581") ? "" : (stryCov_9fa48("6581"), "M-banking"),
                              stryMutAct_9fa48("6582") ? "" : (stryCov_9fa48("6582"), "Leasing"),
                              stryMutAct_9fa48("6583") ? "" : (stryCov_9fa48("6583"), "Factoring"),
                              stryMutAct_9fa48("6584") ? "" : (stryCov_9fa48("6584"), "Equity"),
                              stryMutAct_9fa48("6585") ? "" : (stryCov_9fa48("6585"), "Forex"),
                          ]),
                }),
          medical: stryMutAct_9fa48("6586")
              ? {}
              : (stryCov_9fa48("6586"),
                {
                    direction: stryMutAct_9fa48("6587") ? "" : (stryCov_9fa48("6587"), "auto"),
                    protectBrands: stryMutAct_9fa48("6588") ? false : (stryCov_9fa48("6588"), true),
                    applySerbianQuotes: stryMutAct_9fa48("6589") ? false : (stryCov_9fa48("6589"), true),
                    preserveCodeBlocks: stryMutAct_9fa48("6590") ? false : (stryCov_9fa48("6590"), true),
                    setProofingLanguage: stryMutAct_9fa48("6591") ? false : (stryCov_9fa48("6591"), true),
                    protectRomans: stryMutAct_9fa48("6592") ? false : (stryCov_9fa48("6592"), true),
                    confirmWholeDoc: stryMutAct_9fa48("6593") ? false : (stryCov_9fa48("6593"), true),
                    curlyProtection: stryMutAct_9fa48("6594") ? "" : (stryCov_9fa48("6594"), "placeholders"),
                    dialect: stryMutAct_9fa48("6595") ? "" : (stryCov_9fa48("6595"), "none"),
                    userWords: stryMutAct_9fa48("6596")
                        ? []
                        : (stryCov_9fa48("6596"),
                          [
                              stryMutAct_9fa48("6597") ? "" : (stryCov_9fa48("6597"), "mg"),
                              stryMutAct_9fa48("6598") ? "" : (stryCov_9fa48("6598"), "ml"),
                              stryMutAct_9fa48("6599") ? "" : (stryCov_9fa48("6599"), "kg"),
                              stryMutAct_9fa48("6600") ? "" : (stryCov_9fa48("6600"), "Covid"),
                              stryMutAct_9fa48("6601") ? "" : (stryCov_9fa48("6601"), "SARS"),
                              stryMutAct_9fa48("6602") ? "" : (stryCov_9fa48("6602"), "Hemofarm"),
                              stryMutAct_9fa48("6603") ? "" : (stryCov_9fa48("6603"), "Galenika"),
                              stryMutAct_9fa48("6604") ? "" : (stryCov_9fa48("6604"), "Pfizer"),
                              stryMutAct_9fa48("6605") ? "" : (stryCov_9fa48("6605"), "Actavis"),
                              stryMutAct_9fa48("6606") ? "" : (stryCov_9fa48("6606"), "Alkaloid"),
                              stryMutAct_9fa48("6607") ? "" : (stryCov_9fa48("6607"), "Bayer"),
                              stryMutAct_9fa48("6608") ? "" : (stryCov_9fa48("6608"), "Roche"),
                              stryMutAct_9fa48("6609") ? "" : (stryCov_9fa48("6609"), "Stada"),
                              stryMutAct_9fa48("6610") ? "" : (stryCov_9fa48("6610"), "Anamnesis"),
                              stryMutAct_9fa48("6611") ? "" : (stryCov_9fa48("6611"), "Diagnosis"),
                              stryMutAct_9fa48("6612") ? "" : (stryCov_9fa48("6612"), "Therapia"),
                              stryMutAct_9fa48("6613") ? "" : (stryCov_9fa48("6613"), "CT"),
                              stryMutAct_9fa48("6614") ? "" : (stryCov_9fa48("6614"), "MRI"),
                              stryMutAct_9fa48("6615") ? "" : (stryCov_9fa48("6615"), "EKG"),
                              stryMutAct_9fa48("6616") ? "" : (stryCov_9fa48("6616"), "EEG"),
                              stryMutAct_9fa48("6617") ? "" : (stryCov_9fa48("6617"), "In vitro"),
                              stryMutAct_9fa48("6618") ? "" : (stryCov_9fa48("6618"), "In vivo"),
                          ]),
                }),
          marketing: stryMutAct_9fa48("6619")
              ? {}
              : (stryCov_9fa48("6619"),
                {
                    direction: stryMutAct_9fa48("6620") ? "" : (stryCov_9fa48("6620"), "auto"),
                    protectBrands: stryMutAct_9fa48("6621") ? false : (stryCov_9fa48("6621"), true),
                    applySerbianQuotes: stryMutAct_9fa48("6622") ? false : (stryCov_9fa48("6622"), true),
                    preserveCodeBlocks: stryMutAct_9fa48("6623") ? false : (stryCov_9fa48("6623"), true),
                    setProofingLanguage: stryMutAct_9fa48("6624") ? false : (stryCov_9fa48("6624"), true),
                    protectRomans: stryMutAct_9fa48("6625") ? false : (stryCov_9fa48("6625"), true),
                    confirmWholeDoc: stryMutAct_9fa48("6626") ? false : (stryCov_9fa48("6626"), true),
                    curlyProtection: stryMutAct_9fa48("6627") ? "" : (stryCov_9fa48("6627"), "placeholders"),
                    dialect: stryMutAct_9fa48("6628") ? "" : (stryCov_9fa48("6628"), "none"),
                    userWords: stryMutAct_9fa48("6629")
                        ? []
                        : (stryCov_9fa48("6629"),
                          [
                              stryMutAct_9fa48("6630") ? "" : (stryCov_9fa48("6630"), "Facebook"),
                              stryMutAct_9fa48("6631") ? "" : (stryCov_9fa48("6631"), "Instagram"),
                              stryMutAct_9fa48("6632") ? "" : (stryCov_9fa48("6632"), "LinkedIn"),
                              stryMutAct_9fa48("6633") ? "" : (stryCov_9fa48("6633"), "TikTok"),
                              stryMutAct_9fa48("6634") ? "" : (stryCov_9fa48("6634"), "Twitter"),
                              stryMutAct_9fa48("6635") ? "" : (stryCov_9fa48("6635"), "X"),
                              stryMutAct_9fa48("6636") ? "" : (stryCov_9fa48("6636"), "YouTube"),
                              stryMutAct_9fa48("6637") ? "" : (stryCov_9fa48("6637"), "Google"),
                              stryMutAct_9fa48("6638") ? "" : (stryCov_9fa48("6638"), "SEO"),
                              stryMutAct_9fa48("6639") ? "" : (stryCov_9fa48("6639"), "PR"),
                              stryMutAct_9fa48("6640") ? "" : (stryCov_9fa48("6640"), "Copywriter"),
                              stryMutAct_9fa48("6641") ? "" : (stryCov_9fa48("6641"), "Content"),
                              stryMutAct_9fa48("6642") ? "" : (stryCov_9fa48("6642"), "Ads"),
                              stryMutAct_9fa48("6643") ? "" : (stryCov_9fa48("6643"), "Influencer"),
                              stryMutAct_9fa48("6644") ? "" : (stryCov_9fa48("6644"), "Giveaway"),
                              stryMutAct_9fa48("6645") ? "" : (stryCov_9fa48("6645"), "Hashtag"),
                              stryMutAct_9fa48("6646") ? "" : (stryCov_9fa48("6646"), "Story"),
                              stryMutAct_9fa48("6647") ? "" : (stryCov_9fa48("6647"), "Reel"),
                              stryMutAct_9fa48("6648") ? "" : (stryCov_9fa48("6648"), "Post"),
                              stryMutAct_9fa48("6649") ? "" : (stryCov_9fa48("6649"), "Follow"),
                              stryMutAct_9fa48("6650") ? "" : (stryCov_9fa48("6650"), "Like"),
                              stryMutAct_9fa48("6651") ? "" : (stryCov_9fa48("6651"), "Share"),
                              stryMutAct_9fa48("6652") ? "" : (stryCov_9fa48("6652"), "Subscribe"),
                              stryMutAct_9fa48("6653") ? "" : (stryCov_9fa48("6653"), "Timeline"),
                              stryMutAct_9fa48("6654") ? "" : (stryCov_9fa48("6654"), "Feed"),
                          ]),
                }),
          legal: stryMutAct_9fa48("6655")
              ? {}
              : (stryCov_9fa48("6655"),
                {
                    direction: stryMutAct_9fa48("6656") ? "" : (stryCov_9fa48("6656"), "auto"),
                    protectBrands: stryMutAct_9fa48("6657") ? false : (stryCov_9fa48("6657"), true),
                    applySerbianQuotes: stryMutAct_9fa48("6658") ? false : (stryCov_9fa48("6658"), true),
                    preserveCodeBlocks: stryMutAct_9fa48("6659") ? false : (stryCov_9fa48("6659"), true),
                    setProofingLanguage: stryMutAct_9fa48("6660") ? false : (stryCov_9fa48("6660"), true),
                    protectRomans: stryMutAct_9fa48("6661") ? false : (stryCov_9fa48("6661"), true),
                    confirmWholeDoc: stryMutAct_9fa48("6662") ? false : (stryCov_9fa48("6662"), true),
                    curlyProtection: stryMutAct_9fa48("6663") ? "" : (stryCov_9fa48("6663"), "placeholders"),
                    dialect: stryMutAct_9fa48("6664") ? "" : (stryCov_9fa48("6664"), "none"),
                    userWords: stryMutAct_9fa48("6665")
                        ? []
                        : (stryCov_9fa48("6665"),
                          [
                              stryMutAct_9fa48("6666")
                                  ? ""
                                  : (stryCov_9fa48("6666"), "Ustav Republike Srbije"),
                              stryMutAct_9fa48("6667")
                                  ? ""
                                  : (stryCov_9fa48("6667"), "Zakon o obligacionim odnosima"),
                              stryMutAct_9fa48("6668") ? "" : (stryCov_9fa48("6668"), "Zakon o radu"),
                              stryMutAct_9fa48("6669") ? "" : (stryCov_9fa48("6669"), "Ministarstvo pravde"),
                              stryMutAct_9fa48("6670") ? "" : (stryCov_9fa48("6670"), "Privredni sud"),
                              stryMutAct_9fa48("6671")
                                  ? ""
                                  : (stryCov_9fa48("6671"), "Advokatska komora Srbije"),
                              stryMutAct_9fa48("6672") ? "" : (stryCov_9fa48("6672"), "Službeni glasnik"),
                              stryMutAct_9fa48("6673") ? "" : (stryCov_9fa48("6673"), "Bona fide"),
                              stryMutAct_9fa48("6674") ? "" : (stryCov_9fa48("6674"), "De facto"),
                              stryMutAct_9fa48("6675") ? "" : (stryCov_9fa48("6675"), "Ex officio"),
                              stryMutAct_9fa48("6676") ? "" : (stryCov_9fa48("6676"), "Copyright"),
                              stryMutAct_9fa48("6677") ? "" : (stryCov_9fa48("6677"), "Trademark"),
                              stryMutAct_9fa48("6678") ? "" : (stryCov_9fa48("6678"), "Disclaimer"),
                              stryMutAct_9fa48("6679") ? "" : (stryCov_9fa48("6679"), "Policy"),
                              stryMutAct_9fa48("6680") ? "" : (stryCov_9fa48("6680"), "Terms"),
                              stryMutAct_9fa48("6681") ? "" : (stryCov_9fa48("6681"), "Conditions"),
                              stryMutAct_9fa48("6682") ? "" : (stryCov_9fa48("6682"), "GDPR"),
                          ]),
                }),
          journalism: stryMutAct_9fa48("6683")
              ? {}
              : (stryCov_9fa48("6683"),
                {
                    direction: stryMutAct_9fa48("6684") ? "" : (stryCov_9fa48("6684"), "auto"),
                    protectBrands: stryMutAct_9fa48("6685") ? false : (stryCov_9fa48("6685"), true),
                    applySerbianQuotes: stryMutAct_9fa48("6686") ? false : (stryCov_9fa48("6686"), true),
                    preserveCodeBlocks: stryMutAct_9fa48("6687") ? false : (stryCov_9fa48("6687"), true),
                    setProofingLanguage: stryMutAct_9fa48("6688") ? false : (stryCov_9fa48("6688"), true),
                    protectRomans: stryMutAct_9fa48("6689") ? false : (stryCov_9fa48("6689"), true),
                    confirmWholeDoc: stryMutAct_9fa48("6690") ? false : (stryCov_9fa48("6690"), true),
                    curlyProtection: stryMutAct_9fa48("6691") ? "" : (stryCov_9fa48("6691"), "placeholders"),
                    dialect: stryMutAct_9fa48("6692") ? "" : (stryCov_9fa48("6692"), "none"),
                    userWords: stryMutAct_9fa48("6693")
                        ? []
                        : (stryCov_9fa48("6693"),
                          [
                              stryMutAct_9fa48("6694") ? "" : (stryCov_9fa48("6694"), "Reuters"),
                              stryMutAct_9fa48("6695") ? "" : (stryCov_9fa48("6695"), "Associated Press"),
                              stryMutAct_9fa48("6696") ? "" : (stryCov_9fa48("6696"), "BBC"),
                              stryMutAct_9fa48("6697") ? "" : (stryCov_9fa48("6697"), "CNN"),
                              stryMutAct_9fa48("6698") ? "" : (stryCov_9fa48("6698"), "Euronews"),
                              stryMutAct_9fa48("6699") ? "" : (stryCov_9fa48("6699"), "N1"),
                              stryMutAct_9fa48("6700") ? "" : (stryCov_9fa48("6700"), "RTS"),
                              stryMutAct_9fa48("6701") ? "" : (stryCov_9fa48("6701"), "Tanjug"),
                              stryMutAct_9fa48("6702") ? "" : (stryCov_9fa48("6702"), "NBA"),
                              stryMutAct_9fa48("6703") ? "" : (stryCov_9fa48("6703"), "UEFA"),
                              stryMutAct_9fa48("6704") ? "" : (stryCov_9fa48("6704"), "FIFA"),
                              stryMutAct_9fa48("6705") ? "" : (stryCov_9fa48("6705"), "FIBA"),
                              stryMutAct_9fa48("6706") ? "" : (stryCov_9fa48("6706"), "ATP"),
                              stryMutAct_9fa48("6707") ? "" : (stryCov_9fa48("6707"), "WTA"),
                              stryMutAct_9fa48("6708") ? "" : (stryCov_9fa48("6708"), "Olimpijske igre"),
                          ]),
                }),
      });
