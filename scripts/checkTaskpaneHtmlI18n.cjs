// scripts/checkTaskpaneHtmlI18n.cjs
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const FILE = path.join(ROOT, "src", "taskpane", "taskpane.html");

const LETTER_RE = /[A-Za-zČĆĐŠŽčćđšž\u0400-\u052F]/;

function posFromIndex(text, idx) {
    const before = text.slice(0, idx);
    const lines = before.split("\n");
    const line = lines.length; // 1-based
    const col = (lines[lines.length - 1] || "").length + 1; // 1-based
    return { line, col };
}

function snippetAt(text, idx, maxLen = 160) {
    const s = text.slice(idx, Math.min(text.length, idx + maxLen));
    return s.replace(/\s+/g, " ").trim();
}

function main() {
    if (!fs.existsSync(FILE)) {
        console.error("ERROR: taskpane.html not found:", FILE);
        process.exit(2);
    }

    let html = fs.readFileSync(FILE, "utf8");

    // Strip HtmlWebpackPlugin template tags (<%= ... %>) to avoid false positives.
    html = html.replace(/<%[\s\S]*?%>/g, "");

    const violations = [];

    // FIX: Ignoriši <title> tag ako ima data-i18n, jer nam treba neki tekst unutra za a11y pre JS-a.
    // Jednostavno brišemo ceo <title ...>...</title> blok pre analize teksta.
    html = html.replace(/<title\s+[^>]*data-i18n[^>]*>.*?<\/title>/gs, "");

    // 1) Visible text nodes: > ... <
    const reText = />[^<]*</g;
    let m;
    while ((m = reText.exec(html)) !== null) {
        const raw = m[0].slice(1, -1); // inside >...<
        const txt = raw.replace(/\s+/g, " ").trim();

        // Ignoriši CSS content unutar <style> (koji često ima tačke, zagrade, ali ne i user tekst na ovaj način)
        // Ali ovde je regex prost. Ako CSS klasa ima slova, okinuće.
        // Najbolje je ignorisati style blokove skroz.

        if (!txt) continue;

        // Ignoriši ako je samo interpunkcija ili brojevi
        if (!LETTER_RE.test(txt)) continue;

        // Ignoriši specifične tehničke stringove ako ih ima (npr. CSS klase u style tagu)
        // Ovde je teško bez pravog parsera.
        // Pretpostavljamo da <style> blokovi ne bi trebalo da imaju text node-ove u ovom regexu
        // osim ako nisu unutar >...<, što CSS nije (CSS je unutar <style>...</style>).
        // Regex />[^<]*</ hvata sadržaj između tagova. <style> sadržaj se hvata.

        // FIX: Ignoriši sadržaj ako smo unutar <style>
        // Prosta detekcija: ako prethodni tag počinje sa <style
        const before = html.slice(0, m.index);
        const lastTagOpen = before.lastIndexOf("<");
        const lastTag = before.slice(lastTagOpen);
        if (lastTag.startsWith("<style")) continue;
        if (lastTag.startsWith("<script")) continue;

        const idx = m.index;
        const { line, col } = posFromIndex(html, idx);

        violations.push({
            rule: "hardcoded-visible-text",
            line,
            col,
            snippet: snippetAt(html, idx),
        });

        if (reText.lastIndex === idx) reText.lastIndex++;
    }

    // 2) Attributes (title, placeholder, aria-label)
    const reAttr = /\b(title|placeholder|aria-label)\s*=\s*"([^"]*)"/g;
    while ((m = reAttr.exec(html)) !== null) {
        const attrVal = m[2] || "";
        if (!LETTER_RE.test(attrVal)) continue;

        // FIX: Ignoriši ako element ima data-i18n-attr koji pokriva ovaj atribut
        // Ovo je "heuristic" check - gledamo da li u istom tagu (oko matcha) postoji data-i18n-attr
        // Nije savršeno ali smanjuje false positives.

        // Za sada, samo prijavljujemo. Ako si svesno stavio aria-label kao fallback,
        // moramo ili dozvoliti ili koristiti data-i18n-attr striktno.

        // Zbog "advanced.html" gde smo dodali aria-label ručno:
        // Dozvoljavamo aria-label ako postoji data-i18n-attr u blizini.

        // Ali pošto je skripta striktna, najbolje je da se držimo pravila:
        // Sve što je user-facing MORA u data-i18n.
        // Fallback u HTML-u je tehnički "hardcoded string" koji se vidi ako JS pukne.
        // Za sada ćemo ovo ostaviti kao violation, a ti moraš odlučiti:
        // ili obriši aria-label iz HTML-a (i osloni se na JS), ili ignorisati grešku.

        const idx = m.index;
        const { line, col } = posFromIndex(html, idx);

        violations.push({
            rule: "hardcoded-attr-text",
            line,
            col,
            snippet: snippetAt(html, idx),
        });

        if (reAttr.lastIndex === idx) reAttr.lastIndex++;
    }

    if (violations.length === 0) {
        process.exit(0);
    }

    console.error(
        "ERROR: Hardcoded user-facing strings detected in src/taskpane/taskpane.html.\n" +
            "- Use data-i18n for element text.\n" +
            '- Use data-i18n-attr="title:KEY,placeholder:KEY,aria-label:KEY" for attributes.\n'
    );

    for (const v of violations.slice(0, 60)) {
        console.error(`taskpane.html:${v.line}:${v.col}  ${v.rule}\n  ${v.snippet}\n`);
    }

    process.exit(1);
}

main();
