// scripts/update-manifest-version.js
const fs = require("fs");
const path = require("path");

// 1. Pročitaj verziju iz package.json
const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const version = pkg.version;
const officeVersion = version.split(".").length === 3 ? `${version}.0` : version;
const displayName = `Serbian Transliterator (v${version})`;

console.log(`🔄 Updating manifests to version: ${version}`);
console.log(`   DisplayName: ${displayName}`);

const files = [path.resolve(__dirname, "../manifest.xml"), path.resolve(__dirname, "../manifest.prod.xml")];

files.forEach((file) => {
    if (!fs.existsSync(file)) return;

    let content = fs.readFileSync(file, "utf8");

    // 1. Ažuriraj sistemsku <Version>
    content = content.replace(/<Version>.*?<\/Version>/, `<Version>${officeVersion}</Version>`);

    // 2. Ažuriraj glavni <DisplayName>
    content = content.replace(
        /<DisplayName DefaultValue=".*?"\/>/,
        `<DisplayName DefaultValue="${displayName}"/>`
    );

    // 3. Ažuriraj GetStarted.Title (u Resources sekciji)
    // Tražimo id="GetStarted.Title" i menjamo DefaultValue
    content = content.replace(
        /(<bt:String id="GetStarted.Title" DefaultValue=").*?("\/>)/,
        `$1${displayName}$2`
    );

    // 4. Ažuriraj TaskpaneButton.Label (opciono, ako želiš i dugme da ima verziju)
    // Ako ne želiš verziju na dugmetu (jer je dugačko), zakomentariši ovo:
    /*
    content = content.replace(
        /(<bt:String id="TaskpaneButton.Label" DefaultValue=").*?("\/>)/, 
        `$1${displayName}$2`
    );
    */

    fs.writeFileSync(file, content, "utf8");
    console.log(`✅ Updated ${path.basename(file)}`);
});
