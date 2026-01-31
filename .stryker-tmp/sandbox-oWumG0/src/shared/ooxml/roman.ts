// @ts-nocheck
// src/shared/ooxml/roman.ts
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
export const ROMAN_REGEX_STRICT = stryMutAct_9fa48("4412")
    ? /\b(?!I\b)(?=[MDCLXVI]+\b)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I)\b/g
    : stryMutAct_9fa48("4411")
      ? /\b(?!I\b)(?=[MDCLXVI]+\b)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|VI{0,3})\b/g
      : stryMutAct_9fa48("4410")
        ? /\b(?!I\b)(?=[MDCLXVI]+\b)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X)(IX|IV|V?I{0,3})\b/g
        : stryMutAct_9fa48("4409")
          ? /\b(?!I\b)(?=[MDCLXVI]+\b)M{0,4}(CM|CD|D?C{0,3})(XC|XL|LX{0,3})(IX|IV|V?I{0,3})\b/g
          : stryMutAct_9fa48("4408")
            ? /\b(?!I\b)(?=[MDCLXVI]+\b)M{0,4}(CM|CD|D?C)(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/g
            : stryMutAct_9fa48("4407")
              ? /\b(?!I\b)(?=[MDCLXVI]+\b)M{0,4}(CM|CD|DC{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/g
              : stryMutAct_9fa48("4406")
                ? /\b(?!I\b)(?=[MDCLXVI]+\b)M(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/g
                : stryMutAct_9fa48("4405")
                  ? /\b(?!I\b)(?=[^MDCLXVI]+\b)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/g
                  : stryMutAct_9fa48("4404")
                    ? /\b(?!I\b)(?=[MDCLXVI]\b)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/g
                    : stryMutAct_9fa48("4403")
                      ? /\b(?!I\b)(?![MDCLXVI]+\b)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/g
                      : stryMutAct_9fa48("4402")
                        ? /\b(?=I\b)(?=[MDCLXVI]+\b)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/g
                        : (stryCov_9fa48(
                              "4402",
                              "4403",
                              "4404",
                              "4405",
                              "4406",
                              "4407",
                              "4408",
                              "4409",
                              "4410",
                              "4411",
                              "4412"
                          ),
                          /\b(?!I\b)(?=[MDCLXVI]+\b)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/g);
const ROMAN_I_PREFIXES = stryMutAct_9fa48("4413")
    ? []
    : (stryCov_9fa48("4413"),
      [
          stryMutAct_9fa48("4414") ? "" : (stryCov_9fa48("4414"), "Petar"),
          stryMutAct_9fa48("4415") ? "" : (stryCov_9fa48("4415"), "Aleksandar"),
          stryMutAct_9fa48("4416") ? "" : (stryCov_9fa48("4416"), "Pavle"),
          stryMutAct_9fa48("4417") ? "" : (stryCov_9fa48("4417"), "Đorđe"),
          stryMutAct_9fa48("4418") ? "" : (stryCov_9fa48("4418"), "Djordje"),
          stryMutAct_9fa48("4419") ? "" : (stryCov_9fa48("4419"), "Milan"),
          stryMutAct_9fa48("4420") ? "" : (stryCov_9fa48("4420"), "Miloš"),
          stryMutAct_9fa48("4421") ? "" : (stryCov_9fa48("4421"), "Milos"),
          stryMutAct_9fa48("4422") ? "" : (stryCov_9fa48("4422"), "Katarina"),
          stryMutAct_9fa48("4423") ? "" : (stryCov_9fa48("4423"), "Elizabeta"),
          stryMutAct_9fa48("4424") ? "" : (stryCov_9fa48("4424"), "Viktorija"),
          stryMutAct_9fa48("4425") ? "" : (stryCov_9fa48("4425"), "Marija"),
          stryMutAct_9fa48("4426") ? "" : (stryCov_9fa48("4426"), "Ana"),
          stryMutAct_9fa48("4427") ? "" : (stryCov_9fa48("4427"), "Luj"),
          stryMutAct_9fa48("4428") ? "" : (stryCov_9fa48("4428"), "Šarl"),
          stryMutAct_9fa48("4429") ? "" : (stryCov_9fa48("4429"), "Sarl"),
          stryMutAct_9fa48("4430") ? "" : (stryCov_9fa48("4430"), "Anri"),
          stryMutAct_9fa48("4431") ? "" : (stryCov_9fa48("4431"), "Filip"),
          stryMutAct_9fa48("4432") ? "" : (stryCov_9fa48("4432"), "Felipe"),
          stryMutAct_9fa48("4433") ? "" : (stryCov_9fa48("4433"), "Huan"),
          stryMutAct_9fa48("4434") ? "" : (stryCov_9fa48("4434"), "Karlos"),
          stryMutAct_9fa48("4435") ? "" : (stryCov_9fa48("4435"), "Viljem"),
          stryMutAct_9fa48("4436") ? "" : (stryCov_9fa48("4436"), "Fridrih"),
          stryMutAct_9fa48("4437") ? "" : (stryCov_9fa48("4437"), "Oskar"),
          stryMutAct_9fa48("4438") ? "" : (stryCov_9fa48("4438"), "Gustav"),
          stryMutAct_9fa48("4439") ? "" : (stryCov_9fa48("4439"), "Erik"),
          stryMutAct_9fa48("4440") ? "" : (stryCov_9fa48("4440"), "Jovan"),
          stryMutAct_9fa48("4441") ? "" : (stryCov_9fa48("4441"), "Jozef"),
          stryMutAct_9fa48("4442") ? "" : (stryCov_9fa48("4442"), "Benedikt"),
          stryMutAct_9fa48("4443") ? "" : (stryCov_9fa48("4443"), "Pije"),
          stryMutAct_9fa48("4444") ? "" : (stryCov_9fa48("4444"), "Lav"),
          stryMutAct_9fa48("4445") ? "" : (stryCov_9fa48("4445"), "Grgur"),
          stryMutAct_9fa48("4446") ? "" : (stryCov_9fa48("4446"), "Klement"),
          stryMutAct_9fa48("4447") ? "" : (stryCov_9fa48("4447"), "Inoćentije"),
          stryMutAct_9fa48("4448") ? "" : (stryCov_9fa48("4448"), "Nikola"),
          stryMutAct_9fa48("4449") ? "" : (stryCov_9fa48("4449"), "Napoleon"),
          stryMutAct_9fa48("4450") ? "" : (stryCov_9fa48("4450"), "Konstantin"),
          stryMutAct_9fa48("4451") ? "" : (stryCov_9fa48("4451"), "Stefan"),
          stryMutAct_9fa48("4452") ? "" : (stryCov_9fa48("4452"), "Uroš"),
          stryMutAct_9fa48("4453") ? "" : (stryCov_9fa48("4453"), "Uros"),
          stryMutAct_9fa48("4454") ? "" : (stryCov_9fa48("4454"), "Dušan"),
          stryMutAct_9fa48("4455") ? "" : (stryCov_9fa48("4455"), "Dusan"),
          stryMutAct_9fa48("4456") ? "" : (stryCov_9fa48("4456"), "Član"),
          stryMutAct_9fa48("4457") ? "" : (stryCov_9fa48("4457"), "Clan"),
          stryMutAct_9fa48("4458") ? "" : (stryCov_9fa48("4458"), "Glava"),
          stryMutAct_9fa48("4459") ? "" : (stryCov_9fa48("4459"), "Deo"),
          stryMutAct_9fa48("4460") ? "" : (stryCov_9fa48("4460"), "Stav"),
          stryMutAct_9fa48("4461") ? "" : (stryCov_9fa48("4461"), "Tačka"),
          stryMutAct_9fa48("4462") ? "" : (stryCov_9fa48("4462"), "Tacka"),
          stryMutAct_9fa48("4463") ? "" : (stryCov_9fa48("4463"), "Odeljak"),
          stryMutAct_9fa48("4464") ? "" : (stryCov_9fa48("4464"), "Aneks"),
          stryMutAct_9fa48("4465") ? "" : (stryCov_9fa48("4465"), "Klasa"),
          stryMutAct_9fa48("4466") ? "" : (stryCov_9fa48("4466"), "Grupa"),
          stryMutAct_9fa48("4467") ? "" : (stryCov_9fa48("4467"), "Tom"),
          stryMutAct_9fa48("4468") ? "" : (stryCov_9fa48("4468"), "Knjiga"),
          stryMutAct_9fa48("4469") ? "" : (stryCov_9fa48("4469"), "Sveska"),
          stryMutAct_9fa48("4470") ? "" : (stryCov_9fa48("4470"), "Partija"),
          stryMutAct_9fa48("4471") ? "" : (stryCov_9fa48("4471"), "Zona"),
          stryMutAct_9fa48("4472") ? "" : (stryCov_9fa48("4472"), "Sektor"),
          stryMutAct_9fa48("4473") ? "" : (stryCov_9fa48("4473"), "Svetski rat"),
          stryMutAct_9fa48("4474") ? "" : (stryCov_9fa48("4474"), "Boj"),
          stryMutAct_9fa48("4475") ? "" : (stryCov_9fa48("4475"), "Put"),
      ]);
export const ROMAN_I_REGEX = new RegExp(
    stryMutAct_9fa48("4476")
        ? ``
        : (stryCov_9fa48("4476"),
          `\\b(${ROMAN_I_PREFIXES.join(stryMutAct_9fa48("4477") ? "" : (stryCov_9fa48("4477"), "|"))})\\s+I\\b`),
    stryMutAct_9fa48("4478") ? "" : (stryCov_9fa48("4478"), "g")
);
