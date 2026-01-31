// @ts-nocheck
// src/core/rules.ts
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
export const ALWAYS_LATIN = stryMutAct_9fa48("470")
    ? []
    : (stryCov_9fa48("470"),
      [
          // --- BRENDOVI I TEHNOLOGIJE ---
          stryMutAct_9fa48("471") ? "" : (stryCov_9fa48("471"), "iPhone"),
          stryMutAct_9fa48("472") ? "" : (stryCov_9fa48("472"), "iPad"),
          stryMutAct_9fa48("473") ? "" : (stryCov_9fa48("473"), "iMac"),
          stryMutAct_9fa48("474") ? "" : (stryCov_9fa48("474"), "iOS"),
          stryMutAct_9fa48("475") ? "" : (stryCov_9fa48("475"), "macOS"),
          stryMutAct_9fa48("476") ? "" : (stryCov_9fa48("476"), "MacBook"),
          stryMutAct_9fa48("477") ? "" : (stryCov_9fa48("477"), "Android"),
          stryMutAct_9fa48("478") ? "" : (stryCov_9fa48("478"), "YouTube"),
          stryMutAct_9fa48("479") ? "" : (stryCov_9fa48("479"), "Facebook"),
          stryMutAct_9fa48("480") ? "" : (stryCov_9fa48("480"), "Twitter"),
          stryMutAct_9fa48("481") ? "" : (stryCov_9fa48("481"), "LinkedIn"),
          stryMutAct_9fa48("482") ? "" : (stryCov_9fa48("482"), "WhatsApp"),
          stryMutAct_9fa48("483") ? "" : (stryCov_9fa48("483"), "Viber"),
          stryMutAct_9fa48("484") ? "" : (stryCov_9fa48("484"), "TikTok"),
          stryMutAct_9fa48("485") ? "" : (stryCov_9fa48("485"), "Instagram"),
          stryMutAct_9fa48("486") ? "" : (stryCov_9fa48("486"), "Word"),
          stryMutAct_9fa48("487") ? "" : (stryCov_9fa48("487"), "Excel"),
          stryMutAct_9fa48("488") ? "" : (stryCov_9fa48("488"), "PowerPoint"),
          stryMutAct_9fa48("489") ? "" : (stryCov_9fa48("489"), "Outlook"),
          stryMutAct_9fa48("490") ? "" : (stryCov_9fa48("490"), "Office"),
          stryMutAct_9fa48("491") ? "" : (stryCov_9fa48("491"), "OneNote"),
          stryMutAct_9fa48("492") ? "" : (stryCov_9fa48("492"), "Access"),
          stryMutAct_9fa48("493") ? "" : (stryCov_9fa48("493"), "Publisher"),
          stryMutAct_9fa48("494") ? "" : (stryCov_9fa48("494"), "Windows"),
          stryMutAct_9fa48("495") ? "" : (stryCov_9fa48("495"), "Microsoft"),
          stryMutAct_9fa48("496") ? "" : (stryCov_9fa48("496"), "Google"),
          stryMutAct_9fa48("497") ? "" : (stryCov_9fa48("497"), "Adobe"),
          stryMutAct_9fa48("498") ? "" : (stryCov_9fa48("498"), "Photoshop"),
          stryMutAct_9fa48("499") ? "" : (stryCov_9fa48("499"), "Illustrator"),
          stryMutAct_9fa48("500") ? "" : (stryCov_9fa48("500"), "InDesign"),
          stryMutAct_9fa48("501") ? "" : (stryCov_9fa48("501"), "Premiere"),
          stryMutAct_9fa48("502") ? "" : (stryCov_9fa48("502"), "Java"),
          stryMutAct_9fa48("503") ? "" : (stryCov_9fa48("503"), "JavaScript"),
          stryMutAct_9fa48("504") ? "" : (stryCov_9fa48("504"), "TypeScript"),
          stryMutAct_9fa48("505") ? "" : (stryCov_9fa48("505"), "Python"),
          stryMutAct_9fa48("506") ? "" : (stryCov_9fa48("506"), "React"),
          stryMutAct_9fa48("507") ? "" : (stryCov_9fa48("507"), "Angular"),
          stryMutAct_9fa48("508") ? "" : (stryCov_9fa48("508"), "Vue"),
          stryMutAct_9fa48("509") ? "" : (stryCov_9fa48("509"), "Node.js"),
          stryMutAct_9fa48("510") ? "" : (stryCov_9fa48("510"), "C#"),
          stryMutAct_9fa48("511") ? "" : (stryCov_9fa48("511"), "C++"),
          stryMutAct_9fa48("512") ? "" : (stryCov_9fa48("512"), ".NET"),
          stryMutAct_9fa48("513") ? "" : (stryCov_9fa48("513"), "PHP"),
          stryMutAct_9fa48("514") ? "" : (stryCov_9fa48("514"), "Ruby"),
          stryMutAct_9fa48("515") ? "" : (stryCov_9fa48("515"), "Go"),
          stryMutAct_9fa48("516") ? "" : (stryCov_9fa48("516"), "Swift"),
          stryMutAct_9fa48("517") ? "" : (stryCov_9fa48("517"), "Kotlin"),
          stryMutAct_9fa48("518") ? "" : (stryCov_9fa48("518"), "HTML"),
          stryMutAct_9fa48("519") ? "" : (stryCov_9fa48("519"), "CSS"),
          stryMutAct_9fa48("520") ? "" : (stryCov_9fa48("520"), "SQL"),
          stryMutAct_9fa48("521") ? "" : (stryCov_9fa48("521"), "XML"),
          stryMutAct_9fa48("522") ? "" : (stryCov_9fa48("522"), "JSON"),
          stryMutAct_9fa48("523") ? "" : (stryCov_9fa48("523"), "API"),
          stryMutAct_9fa48("524") ? "" : (stryCov_9fa48("524"), "SDK"),
          stryMutAct_9fa48("525") ? "" : (stryCov_9fa48("525"), "USB"),
          stryMutAct_9fa48("526") ? "" : (stryCov_9fa48("526"), "HDMI"),
          stryMutAct_9fa48("527") ? "" : (stryCov_9fa48("527"), "WiFi"),
          stryMutAct_9fa48("528") ? "" : (stryCov_9fa48("528"), "Wi-Fi"),
          stryMutAct_9fa48("529") ? "" : (stryCov_9fa48("529"), "Bluetooth"),
          stryMutAct_9fa48("530") ? "" : (stryCov_9fa48("530"), "NFC"),
          stryMutAct_9fa48("531") ? "" : (stryCov_9fa48("531"), "GPS"),
          stryMutAct_9fa48("532") ? "" : (stryCov_9fa48("532"), "LTE"),
          stryMutAct_9fa48("533") ? "" : (stryCov_9fa48("533"), "5G"),
          stryMutAct_9fa48("534") ? "" : (stryCov_9fa48("534"), "4G"),
          stryMutAct_9fa48("535") ? "" : (stryCov_9fa48("535"), "VBA"),
          stryMutAct_9fa48("536") ? "" : (stryCov_9fa48("536"), "VSTO"),
          stryMutAct_9fa48("537") ? "" : (stryCov_9fa48("537"), "COM"),
          stryMutAct_9fa48("538") ? "" : (stryCov_9fa48("538"), "Add-in"),
          stryMutAct_9fa48("539") ? "" : (stryCov_9fa48("539"), "Plugin"),
          stryMutAct_9fa48("540") ? "" : (stryCov_9fa48("540"), "Extension"),
          stryMutAct_9fa48("541") ? "" : (stryCov_9fa48("541"), "Guid"),
          stryMutAct_9fa48("542") ? "" : (stryCov_9fa48("542"), "GUID"),
          stryMutAct_9fa48("543") ? "" : (stryCov_9fa48("543"), "Uuid"),
          stryMutAct_9fa48("544") ? "" : (stryCov_9fa48("544"), "UUID"),
          stryMutAct_9fa48("545") ? "" : (stryCov_9fa48("545"), "Hash"),
          stryMutAct_9fa48("546") ? "" : (stryCov_9fa48("546"), "Base64"), // --- UI TERMINI I KOMANDE ---
          stryMutAct_9fa48("547") ? "" : (stryCov_9fa48("547"), "File"),
          stryMutAct_9fa48("548") ? "" : (stryCov_9fa48("548"), "Edit"),
          stryMutAct_9fa48("549") ? "" : (stryCov_9fa48("549"), "View"),
          stryMutAct_9fa48("550") ? "" : (stryCov_9fa48("550"), "Insert"),
          stryMutAct_9fa48("551") ? "" : (stryCov_9fa48("551"), "Format"),
          stryMutAct_9fa48("552") ? "" : (stryCov_9fa48("552"), "Tools"),
          stryMutAct_9fa48("553") ? "" : (stryCov_9fa48("553"), "Table"),
          stryMutAct_9fa48("554") ? "" : (stryCov_9fa48("554"), "Window"),
          stryMutAct_9fa48("555") ? "" : (stryCov_9fa48("555"), "Help"),
          stryMutAct_9fa48("556") ? "" : (stryCov_9fa48("556"), "Save"),
          stryMutAct_9fa48("557") ? "" : (stryCov_9fa48("557"), "Save As"),
          stryMutAct_9fa48("558") ? "" : (stryCov_9fa48("558"), "Open"),
          stryMutAct_9fa48("559") ? "" : (stryCov_9fa48("559"), "Close"),
          stryMutAct_9fa48("560") ? "" : (stryCov_9fa48("560"), "Print"),
          stryMutAct_9fa48("561") ? "" : (stryCov_9fa48("561"), "Export"),
          stryMutAct_9fa48("562") ? "" : (stryCov_9fa48("562"), "Import"),
          stryMutAct_9fa48("563") ? "" : (stryCov_9fa48("563"), "Exit"),
          stryMutAct_9fa48("564") ? "" : (stryCov_9fa48("564"), "Undo"),
          stryMutAct_9fa48("565") ? "" : (stryCov_9fa48("565"), "Redo"),
          stryMutAct_9fa48("566") ? "" : (stryCov_9fa48("566"), "Cut"),
          stryMutAct_9fa48("567") ? "" : (stryCov_9fa48("567"), "Copy"),
          stryMutAct_9fa48("568") ? "" : (stryCov_9fa48("568"), "Paste"),
          stryMutAct_9fa48("569") ? "" : (stryCov_9fa48("569"), "Find"),
          stryMutAct_9fa48("570") ? "" : (stryCov_9fa48("570"), "Replace"),
          stryMutAct_9fa48("571") ? "" : (stryCov_9fa48("571"), "Select All"),
          stryMutAct_9fa48("572") ? "" : (stryCov_9fa48("572"), "Ctrl"),
          stryMutAct_9fa48("573") ? "" : (stryCov_9fa48("573"), "Alt"),
          stryMutAct_9fa48("574") ? "" : (stryCov_9fa48("574"), "Shift"),
          stryMutAct_9fa48("575") ? "" : (stryCov_9fa48("575"), "Esc"),
          stryMutAct_9fa48("576") ? "" : (stryCov_9fa48("576"), "Enter"),
          stryMutAct_9fa48("577") ? "" : (stryCov_9fa48("577"), "Tab"),
          stryMutAct_9fa48("578") ? "" : (stryCov_9fa48("578"), "Backspace"),
          stryMutAct_9fa48("579") ? "" : (stryCov_9fa48("579"), "Delete"),
          stryMutAct_9fa48("580") ? "" : (stryCov_9fa48("580"), "Home"),
          stryMutAct_9fa48("581") ? "" : (stryCov_9fa48("581"), "End"),
          stryMutAct_9fa48("582") ? "" : (stryCov_9fa48("582"), "PgUp"),
          stryMutAct_9fa48("583") ? "" : (stryCov_9fa48("583"), "PgDn"),
          stryMutAct_9fa48("584") ? "" : (stryCov_9fa48("584"), "Ins"),
          stryMutAct_9fa48("585") ? "" : (stryCov_9fa48("585"), "Del"),
          stryMutAct_9fa48("586") ? "" : (stryCov_9fa48("586"), "Button"),
          stryMutAct_9fa48("587") ? "" : (stryCov_9fa48("587"), "Checkbox"),
          stryMutAct_9fa48("588") ? "" : (stryCov_9fa48("588"), "Radio"),
          stryMutAct_9fa48("589") ? "" : (stryCov_9fa48("589"), "Input"),
          stryMutAct_9fa48("590") ? "" : (stryCov_9fa48("590"), "Label"),
          stryMutAct_9fa48("591") ? "" : (stryCov_9fa48("591"), "Form"),
          stryMutAct_9fa48("592") ? "" : (stryCov_9fa48("592"), "Frame"),
          stryMutAct_9fa48("593") ? "" : (stryCov_9fa48("593"), "Panel"),
          stryMutAct_9fa48("594") ? "" : (stryCov_9fa48("594"), "Menu"),
          stryMutAct_9fa48("595") ? "" : (stryCov_9fa48("595"), "Ribbon"),
          stryMutAct_9fa48("596") ? "" : (stryCov_9fa48("596"), "Toolbar"),
          stryMutAct_9fa48("597") ? "" : (stryCov_9fa48("597"), "StatusBar"),
          stryMutAct_9fa48("598") ? "" : (stryCov_9fa48("598"), "Browser"),
          stryMutAct_9fa48("599") ? "" : (stryCov_9fa48("599"), "Cache"),
          stryMutAct_9fa48("600") ? "" : (stryCov_9fa48("600"), "Cookie"),
          stryMutAct_9fa48("601") ? "" : (stryCov_9fa48("601"), "Session"),
          stryMutAct_9fa48("602") ? "" : (stryCov_9fa48("602"), "Local Storage"),
          stryMutAct_9fa48("603") ? "" : (stryCov_9fa48("603"), "Server"),
          stryMutAct_9fa48("604") ? "" : (stryCov_9fa48("604"), "Client"),
          stryMutAct_9fa48("605") ? "" : (stryCov_9fa48("605"), "Database"),
          stryMutAct_9fa48("606") ? "" : (stryCov_9fa48("606"), "Host"),
          stryMutAct_9fa48("607") ? "" : (stryCov_9fa48("607"), "Port"),
          stryMutAct_9fa48("608") ? "" : (stryCov_9fa48("608"), "Domain"),
          stryMutAct_9fa48("609") ? "" : (stryCov_9fa48("609"), "Error"),
          stryMutAct_9fa48("610") ? "" : (stryCov_9fa48("610"), "Warning"),
          stryMutAct_9fa48("611") ? "" : (stryCov_9fa48("611"), "Info"),
          stryMutAct_9fa48("612") ? "" : (stryCov_9fa48("612"), "Debug"),
          stryMutAct_9fa48("613") ? "" : (stryCov_9fa48("613"), "Console"),
          stryMutAct_9fa48("614") ? "" : (stryCov_9fa48("614"), "Terminal"),
          stryMutAct_9fa48("615") ? "" : (stryCov_9fa48("615"), "Shell"),
          stryMutAct_9fa48("616") ? "" : (stryCov_9fa48("616"), "Command"),
          stryMutAct_9fa48("617") ? "" : (stryCov_9fa48("617"), "Prompt"),
          stryMutAct_9fa48("618") ? "" : (stryCov_9fa48("618"), "Login"),
          stryMutAct_9fa48("619") ? "" : (stryCov_9fa48("619"), "Logout"),
          stryMutAct_9fa48("620") ? "" : (stryCov_9fa48("620"), "Sign In"),
          stryMutAct_9fa48("621") ? "" : (stryCov_9fa48("621"), "Sign Out"),
          stryMutAct_9fa48("622") ? "" : (stryCov_9fa48("622"), "Register"),
          stryMutAct_9fa48("623") ? "" : (stryCov_9fa48("623"), "Password"),
          stryMutAct_9fa48("624") ? "" : (stryCov_9fa48("624"), "Username"),
          stryMutAct_9fa48("625") ? "" : (stryCov_9fa48("625"), "Users"),
          stryMutAct_9fa48("626") ? "" : (stryCov_9fa48("626"), "User"),
          stryMutAct_9fa48("627") ? "" : (stryCov_9fa48("627"), "admin"),
          stryMutAct_9fa48("628") ? "" : (stryCov_9fa48("628"), "root"),
          stryMutAct_9fa48("629") ? "" : (stryCov_9fa48("629"), "id"),
          stryMutAct_9fa48("630") ? "" : (stryCov_9fa48("630"), "ID"),
          stryMutAct_9fa48("631") ? "" : (stryCov_9fa48("631"), "null"),
          stryMutAct_9fa48("632") ? "" : (stryCov_9fa48("632"), "true"),
          stryMutAct_9fa48("633") ? "" : (stryCov_9fa48("633"), "false"),
          stryMutAct_9fa48("634") ? "" : (stryCov_9fa48("634"), "Cert"),
          stryMutAct_9fa48("635") ? "" : (stryCov_9fa48("635"), "CurrentUser"),
          stryMutAct_9fa48("636") ? "" : (stryCov_9fa48("636"), "TrustedPublisher"),
          stryMutAct_9fa48("637") ? "" : (stryCov_9fa48("637"), "ChildItem"), // --- JEDINICE I KRATICE ---
          stryMutAct_9fa48("638") ? "" : (stryCov_9fa48("638"), "Copyright"),
          stryMutAct_9fa48("639") ? "" : (stryCov_9fa48("639"), "Made in Serbia"),
          stryMutAct_9fa48("640") ? "" : (stryCov_9fa48("640"), "MB"),
          stryMutAct_9fa48("641") ? "" : (stryCov_9fa48("641"), "GB"),
          stryMutAct_9fa48("642") ? "" : (stryCov_9fa48("642"), "TB"),
          stryMutAct_9fa48("643") ? "" : (stryCov_9fa48("643"), "PB"),
          stryMutAct_9fa48("644") ? "" : (stryCov_9fa48("644"), "KB"),
          stryMutAct_9fa48("645") ? "" : (stryCov_9fa48("645"), "Mbps"),
          stryMutAct_9fa48("646") ? "" : (stryCov_9fa48("646"), "Gbps"),
          stryMutAct_9fa48("647") ? "" : (stryCov_9fa48("647"), "GHz"),
          stryMutAct_9fa48("648") ? "" : (stryCov_9fa48("648"), "MHz"),
          stryMutAct_9fa48("649") ? "" : (stryCov_9fa48("649"), "kHz"),
          stryMutAct_9fa48("650") ? "" : (stryCov_9fa48("650"), "Hz"),
          stryMutAct_9fa48("651") ? "" : (stryCov_9fa48("651"), "km/h"),
          stryMutAct_9fa48("652") ? "" : (stryCov_9fa48("652"), "m/s"),
          stryMutAct_9fa48("653") ? "" : (stryCov_9fa48("653"), "kWh"),
          stryMutAct_9fa48("654") ? "" : (stryCov_9fa48("654"), "E-mail"),
          stryMutAct_9fa48("655") ? "" : (stryCov_9fa48("655"), "e-mail"),
          stryMutAct_9fa48("656") ? "" : (stryCov_9fa48("656"), "Email"),
          stryMutAct_9fa48("657") ? "" : (stryCov_9fa48("657"), "email"),
          stryMutAct_9fa48("658") ? "" : (stryCov_9fa48("658"), "X-Ray"),
          stryMutAct_9fa48("659") ? "" : (stryCov_9fa48("659"), "X Ray"),
          stryMutAct_9fa48("660") ? "" : (stryCov_9fa48("660"), "Blue-Ray"),
          stryMutAct_9fa48("661") ? "" : (stryCov_9fa48("661"), "Blu-ray"), // ⚠️ Ovi su AMBIGUOUS (ne želimo da budu “uvek latinica” bez konteksta),
          // ali ih i dalje držimo u ALWAYS_LATIN listi radi backward kompatibilnosti sa postojećim sadržajem.
          // Pravo ponašanje kontrolišemo ispod kroz AMBIGUOUS_LATIN.
          stryMutAct_9fa48("662") ? "" : (stryCov_9fa48("662"), "Pro"),
          stryMutAct_9fa48("663") ? "" : (stryCov_9fa48("663"), "Air"),
          stryMutAct_9fa48("664") ? "" : (stryCov_9fa48("664"), "Mini"),
          stryMutAct_9fa48("665") ? "" : (stryCov_9fa48("665"), "Ultra"),
          stryMutAct_9fa48("666") ? "" : (stryCov_9fa48("666"), "Plus"),
          stryMutAct_9fa48("667") ? "" : (stryCov_9fa48("667"), "Max"),
          stryMutAct_9fa48("668") ? "" : (stryCov_9fa48("668"), "Lite"),
          stryMutAct_9fa48("669") ? "" : (stryCov_9fa48("669"), "°C"),
          stryMutAct_9fa48("670") ? "" : (stryCov_9fa48("670"), "°F"), // --- STRANE FRAZE I IMENA ---
          stryMutAct_9fa48("671") ? "" : (stryCov_9fa48("671"), "München"),
          stryMutAct_9fa48("672") ? "" : (stryCov_9fa48("672"), "Zürich"),
          stryMutAct_9fa48("673") ? "" : (stryCov_9fa48("673"), "Straße"),
          stryMutAct_9fa48("674") ? "" : (stryCov_9fa48("674"), "Façade"),
          stryMutAct_9fa48("675") ? "" : (stryCov_9fa48("675"), "Déjà vu"),
          stryMutAct_9fa48("676") ? "" : (stryCov_9fa48("676"), "über"), // --- SQL KLJUČNE REČI (Izbačeni "ON" i "AS" jer prave probleme u srpskom) ---
          stryMutAct_9fa48("677") ? "" : (stryCov_9fa48("677"), "SELECT"),
          stryMutAct_9fa48("678") ? "" : (stryCov_9fa48("678"), "FROM"),
          stryMutAct_9fa48("679") ? "" : (stryCov_9fa48("679"), "WHERE"),
          stryMutAct_9fa48("680") ? "" : (stryCov_9fa48("680"), "UPDATE"),
          stryMutAct_9fa48("681") ? "" : (stryCov_9fa48("681"), "DELETE"),
          stryMutAct_9fa48("682") ? "" : (stryCov_9fa48("682"), "INSERT"),
          stryMutAct_9fa48("683") ? "" : (stryCov_9fa48("683"), "INTO"),
          stryMutAct_9fa48("684") ? "" : (stryCov_9fa48("684"), "VALUES"),
          stryMutAct_9fa48("685") ? "" : (stryCov_9fa48("685"), "TABLE"),
          stryMutAct_9fa48("686") ? "" : (stryCov_9fa48("686"), "DROP"),
          stryMutAct_9fa48("687") ? "" : (stryCov_9fa48("687"), "ALTER"),
          stryMutAct_9fa48("688") ? "" : (stryCov_9fa48("688"), "CREATE"),
          stryMutAct_9fa48("689") ? "" : (stryCov_9fa48("689"), "JOIN"),
          stryMutAct_9fa48("690") ? "" : (stryCov_9fa48("690"), "GROUP"),
          stryMutAct_9fa48("691") ? "" : (stryCov_9fa48("691"), "ORDER"),
          stryMutAct_9fa48("692") ? "" : (stryCov_9fa48("692"), "BY"),
          stryMutAct_9fa48("693") ? "" : (stryCov_9fa48("693"), "LIMIT"),
          stryMutAct_9fa48("694") ? "" : (stryCov_9fa48("694"), "DESC"),
          stryMutAct_9fa48("695") ? "" : (stryCov_9fa48("695"), "function"),
          stryMutAct_9fa48("696") ? "" : (stryCov_9fa48("696"), "return"),
          stryMutAct_9fa48("697") ? "" : (stryCov_9fa48("697"), "var"),
          stryMutAct_9fa48("698") ? "" : (stryCov_9fa48("698"), "let"),
          stryMutAct_9fa48("699") ? "" : (stryCov_9fa48("699"), "const"),
          stryMutAct_9fa48("700") ? "" : (stryCov_9fa48("700"), "if"),
          stryMutAct_9fa48("701") ? "" : (stryCov_9fa48("701"), "else"),
          stryMutAct_9fa48("702") ? "" : (stryCov_9fa48("702"), "for"),
          stryMutAct_9fa48("703") ? "" : (stryCov_9fa48("703"), "while"),
          stryMutAct_9fa48("704") ? "" : (stryCov_9fa48("704"), "switch"),
          stryMutAct_9fa48("705") ? "" : (stryCov_9fa48("705"), "case"),
          stryMutAct_9fa48("706") ? "" : (stryCov_9fa48("706"), "break"),
          stryMutAct_9fa48("707") ? "" : (stryCov_9fa48("707"), "continue"),
          stryMutAct_9fa48("708") ? "" : (stryCov_9fa48("708"), "try"),
          stryMutAct_9fa48("709") ? "" : (stryCov_9fa48("709"), "catch"),
          stryMutAct_9fa48("710") ? "" : (stryCov_9fa48("710"), "finally"),
          stryMutAct_9fa48("711") ? "" : (stryCov_9fa48("711"), "throw"),
          stryMutAct_9fa48("712") ? "" : (stryCov_9fa48("712"), "new"),
          stryMutAct_9fa48("713") ? "" : (stryCov_9fa48("713"), "this"),
          stryMutAct_9fa48("714") ? "" : (stryCov_9fa48("714"), "class"),
          stryMutAct_9fa48("715") ? "" : (stryCov_9fa48("715"), "interface"),
          stryMutAct_9fa48("716") ? "" : (stryCov_9fa48("716"), "extends"),
          stryMutAct_9fa48("717") ? "" : (stryCov_9fa48("717"), "implements"),
          stryMutAct_9fa48("718") ? "" : (stryCov_9fa48("718"), "public"),
          stryMutAct_9fa48("719") ? "" : (stryCov_9fa48("719"), "private"),
          stryMutAct_9fa48("720") ? "" : (stryCov_9fa48("720"), "protected"),
          stryMutAct_9fa48("721") ? "" : (stryCov_9fa48("721"), "void"),
          stryMutAct_9fa48("722") ? "" : (stryCov_9fa48("722"), "int"),
          stryMutAct_9fa48("723") ? "" : (stryCov_9fa48("723"), "string"),
          stryMutAct_9fa48("724") ? "" : (stryCov_9fa48("724"), "bool"),
          stryMutAct_9fa48("725") ? "" : (stryCov_9fa48("725"), "boolean"),
          stryMutAct_9fa48("726") ? "" : (stryCov_9fa48("726"), "float"),
          stryMutAct_9fa48("727") ? "" : (stryCov_9fa48("727"), "double"),
          stryMutAct_9fa48("728") ? "" : (stryCov_9fa48("728"), "char"),
      ]);

// Tokeni koji su često “obične reči” u srpskom i ne treba da budu UVEK zaštićeni.
// Štitimo ih samo kad imaju brend/model kontekst (npr. iPhone Pro, MacBook Air).
export const AMBIGUOUS_LATIN = stryMutAct_9fa48("729")
    ? []
    : (stryCov_9fa48("729"),
      [
          stryMutAct_9fa48("730") ? "" : (stryCov_9fa48("730"), "Pro"),
          stryMutAct_9fa48("731") ? "" : (stryCov_9fa48("731"), "Air"),
          stryMutAct_9fa48("732") ? "" : (stryCov_9fa48("732"), "Mini"),
          stryMutAct_9fa48("733") ? "" : (stryCov_9fa48("733"), "Ultra"),
          stryMutAct_9fa48("734") ? "" : (stryCov_9fa48("734"), "Plus"),
          stryMutAct_9fa48("735") ? "" : (stryCov_9fa48("735"), "Max"),
          stryMutAct_9fa48("736") ? "" : (stryCov_9fa48("736"), "Lite"),
      ]);
const normKey = stryMutAct_9fa48("737")
    ? () => undefined
    : (stryCov_9fa48("737"),
      (() => {
          const normKey = (s: string) =>
              stryMutAct_9fa48("738")
                  ? s.normalize("NFC").toUpperCase()
                  : (stryCov_9fa48("738"),
                    s.normalize(stryMutAct_9fa48("739") ? "" : (stryCov_9fa48("739"), "NFC")).toLowerCase());
          return normKey;
      })());
const AMBIGUOUS_LATIN_SET = new Set(AMBIGUOUS_LATIN.map(normKey));
export const ALWAYS_LATIN_TOKENS_AMBIGUOUS = new Set(AMBIGUOUS_LATIN.map(normKey));

// STRICT tokeni (uvek zaštiti): svi tokeni iz ALWAYS_LATIN bez razmaka, osim ambiguous
export const ALWAYS_LATIN_TOKENS_STRICT = new Set(
    stryMutAct_9fa48("741")
        ? ALWAYS_LATIN.map(normKey).filter((k) => !AMBIGUOUS_LATIN_SET.has(k))
        : stryMutAct_9fa48("740")
          ? ALWAYS_LATIN.filter((x) => !/\s/.test(x)).map(normKey)
          : (stryCov_9fa48("740", "741"),
            ALWAYS_LATIN.filter(
                stryMutAct_9fa48("742")
                    ? () => undefined
                    : (stryCov_9fa48("742"),
                      (x) =>
                          stryMutAct_9fa48("743")
                              ? /\s/.test(x)
                              : (stryCov_9fa48("743"),
                                !(stryMutAct_9fa48("744") ? /\S/ : (stryCov_9fa48("744"), /\s/)).test(x)))
            )
                .map(normKey)
                .filter(
                    stryMutAct_9fa48("745")
                        ? () => undefined
                        : (stryCov_9fa48("745"),
                          (k) =>
                              stryMutAct_9fa48("746")
                                  ? AMBIGUOUS_LATIN_SET.has(k)
                                  : (stryCov_9fa48("746"), !AMBIGUOUS_LATIN_SET.has(k)))
                ))
);

// BRIDGE tokeni: sve što želimo da OOXML bridging spaja preko run-ova pre konverzije
export const ALWAYS_LATIN_TOKENS_BRIDGE = new Set<string>(
    stryMutAct_9fa48("747")
        ? []
        : (stryCov_9fa48("747"),
          [...Array.from(ALWAYS_LATIN_TOKENS_STRICT), ...Array.from(ALWAYS_LATIN_TOKENS_AMBIGUOUS)])
);

// Fraze sa razmakom (npr. "Save As", "Made in Serbia")
export const ALWAYS_LATIN_PHRASES = stryMutAct_9fa48("748")
    ? ALWAYS_LATIN
    : (stryCov_9fa48("748"),
      ALWAYS_LATIN.filter(
          stryMutAct_9fa48("749")
              ? () => undefined
              : (stryCov_9fa48("749"),
                (x) => (stryMutAct_9fa48("750") ? /\S/ : (stryCov_9fa48("750"), /\s/)).test(x))
      ));
