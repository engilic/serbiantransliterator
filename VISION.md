# 🚀 VISION 2026: THE NEURAL FRONTIER — THE ULTIMATE STRATEGIC BLUEPRINT

**Project:** Serbian Transliterator (Universal Engine)  
**Architectural Level:** God Mode (v1.1.0 Hardening → v2.0.0 Intelligent)  
**Motto:** "Absolute Privacy. Infinite Performance. Universal Reach."

---

## 1) STRATEŠKA FILOZOFIJA: "GALAXY MODE" IMPERATIVI

Cilj nije “još jedan konverter”. Cilj je univerzalni standard za procesiranje
srpskog jezika. Svaki red koda prati 4 stuba:

### I. Arhitektura nulte latencije (The 16ms Rule)

- Cilj: prosečna operacija po “stranici teksta” < 16ms
- Rust/WASM dominacija: eliminacija GC iz kritičnih putanja
- SIMD: paralelizam na nivou instrukcija za simultano procesiranje karaktera

### II. Privatnost kao ontološki status (Privacy by Design)

- Air-gap standard: funkcionalno bez ijednog eksternog bajta (nakon prvog load-a)
- Lokalna telemetrija: IndexedDB, korisnik jedini ima pristup export-u

### III. Strukturalni integritet (Preservation of Intent)

- Ne sme da se uništi formatiranje, metapodaci, kod
- Sistem razume razliku između rečenice i regex-a, brenda i imenice

---

## 2) DETALJNA TEHNIČKA MAPA PUTA (2026–2028)

### FAZA 1: ZLATNI TEMELJI (Completed — Q1 2026)

- Migracija na Rust Core v1.0
- FST: lookup kroz 100k reči u mikrosekundama uz memorijski otisak <2MB
- Status: Gold Master v1.0.0 u produkciji

### FAZA 2: ARHITEKTONSKO OJAČAVANJE (Current — Q2 2026)

- Cilj: rušenje “Memory Wall”
- Problem: JS DOMParser je eager (učitava sve odjednom)
- Rešenje: Rust streaming engine (quick-xml)
    - Pull-parser u Rust-u: JS šalje Uint8Array buffer, Rust parsira bajt‑po‑bajt
    - Memorijski cilj: O(1) memory usage; target <60MB RAM
- Self-healing workers:
    - supervisor pattern
    - restart <10ms + re-init + nastavak pipeline-a

### FAZA 3: UNIVERZALNI DOMAĆIN (Q3–Q4 2026)

- Decoupling od Office.js
- Proizvodi:
    1. Browser extension (Chrome/Edge/Firefox)
    2. Tauri desktop app (batch processing)
    3. CLI za automatizaciju

### FAZA 4: LOKALNA INTELIGENCIJA (2027+)

- ONNX runtime + quantized modeli
- Mini NER (~15MB) za zaštitu brendova/imenovanih entiteta bez clouda
- Morfološka analiza: ijekavica/ekavica uz razumevanje padeža i vremena

---

## 3) LINGVISTIČKI I LOGIČKI IMPERATIVI

- Advanced bridging: reči razbijene kroz w:r / w:t moraju ostati logički celovite
- Slojevita zaštita:
    - sloj 1: rigidne liste (ALWAYS_LATIN)
    - sloj 2: heuristike (MixedCase, CamelCase, underscore)
    - sloj 3: sintaksna svesnost (kod, URL, email)
    - sloj 4: lokalni AI (budućnost)

---

## 4) DEVOPS & KVALITET: "GUARDIAN" STANDARD

- Guardian pipeline: svaki PR mora proći verify-all
- Fuzz testing: random input da nikad ne dođe do crash/panic/segfault
- Binary size watchdog: WASM target <5MB; optimizacije kompresije rečnika

---

## 5) KRAJNJI UTICAJ (Impact)

Do kraja 2026:

- Najbrži: 1,000,000 karaktera u <50ms
- Najlakši: <4MB ukupno sa rečnicima
- Najsigurniji: bez eksternog saobraćaja
- Najpametniji: offline jezička svesnost

---

## 6) OPERATIVNI ZAKLJUČAK

Ne pišemo skripte — gradimo precizan inženjerski instrument:

- izbegni heap alokacije gde možeš
- koristi match umesto if kad je smisleno
- privatnost: pretpostavi da je sve osetljivo i drži lokalno

# 🛰️ VISION 2027: THE SOVEREIGN LINGUISTIC CORE (OMNIPRESENCE)

Dok je 2026. godina bila fokusirana na performanse i "sirovu snagu" streaming
engine-a, 2027. predstavlja godinu **Lokalne Inteligencije** i **Potpune
Dekaplacije (Decoupling)**.

U ovoj fazi, Serbian Transliterator prestaje da bude Word Add-in i postaje
univerzalna binarna biblioteka koja "živi" na nivou operativnog sistema ili
pretraživača.

---

## 1. NEURALNA INTEGRACIJA (ON-DEVICE AI)

U 2027. godini napuštamo oslanjanje isključivo na statičke liste zaštićenih reči
(ALWAYS_LATIN).

- **Quantized NER (Named Entity Recognition):** Integracija minijaturnog jezičkog
  modela (npr. DistilBERT ili TinyLLM kvantizovan na 4-bita) unutar WASM-a.
    - **Cilj:** Model automatski prepoznaje imena ljudi, stranih kompanija, ulica i
      tehničkih termina sa preciznošću od 99.8%, bez potrebe da korisnik ručno
      unosi "Microsoft" ili "Apple" u listu zaštićenih reči.
- **WASM SIMD Inference:** Korišćenje paralelizma procesorskih instrukcija za
  pokretanje AI modela lokalno u browser-u ili Word-u, sa latencijom manjom od
  50ms po pasusu.
- **Privacy-First Training:** Svi modeli su "frozen" i isporučuju se kao binarni
  resursi. Nema učenja na podacima korisnika; privatnost ostaje ontološki
  imperativ.

---

## 2. EKOSISTEM OMNIPRESENCE (POTPUNA DOSTUPNOST)

Transliterator postaje standardni "layer" kroz koji prolazi digitalni tekst na
Balkanu.

- **Sovereign CLI (Command Line Interface):** Rust binarna aplikacija za servere
  i CI/CD pipeline. Omogućava kompanijama da automatski preslovljavaju hiljade
  dokumenata ili baze podataka u realnom vremenu kao deo build procesa.
- **Browser Extension 2.0 (The Living Web):** Ekstenzija koja ne zahteva klik.
  Ona koristi `MutationObserver` i WASM jezgro da u realnom vremenu, dok
  skrolujete, preslovljava Twitter, LinkedIn, Facebook ili vesti, čuvajući pritom
  kod, linkove i tagove netaknutim.
- **Desktop Hub (Tauri Framework):** Standalone aplikacija izgrađena u Rust/Tauri
  koja služi kao "batch processor". Podrška za:
    - Masovnu konverziju `.docx`, `.pdf` (text layer), `.json`, `.md` i `.html`
      fajlova.
    - Drag-and-drop foldera sa hiljadama dokumenata.

---

## 3. DUBOKA LINGVISTIČKA SOVERENOST (MORPHOLOGICAL ANALYZER)

Transliteracija evoluira u razumevanje jezika.

- **Lematizacija i Stemming u Rustu:** Jezgro dobija sposobnost da prepozna koren
  reči i njene gramatičke oblike.
    - **Primer:** Prepoznavanje da su "vremena", "vremenu" i "vremenom" oblici reči
      "vreme", što drastično poboljšava preciznost konverzije ijekavica <-> ekavica.
- **Context-Aware Dialect Switching:** Rešavanje problema homonima. Sistem će
  razumeti da li je "kosa" u rečenici imenica (dlaka na glavi) ili pridjev
  (nagnuta), i na osnovu toga primeniti ispravna pravila za ijekavizaciju ako je
  potrebno.
- **Semantic Protected Buffers:** Automatska detekcija programskog koda unutar
  običnog teksta (npr. `System.out.println`) bez potrebe za Markdown
  backtick-ovima, štiteći tehničku semantiku.

---

## 4. BINARNA OPTIMIZACIJA (THE 2MB LIMIT)

Uprkos dodavanju AI modela, postavljamo rigorozne ciljeve za veličinu:

- **Dictionary Sharding:** Dinamičko učitavanje delova rečnika samo kada su
  potrebni (npr. medicinski ili pravni termini se učitavaju samo ako model
  detektuje taj domen).
- **WASM Stripping:** Napredna eliminacija mrtvog koda (LTO) kako bi osnovni
  engine ostao ispod 2MB, omogućavajući učitavanje u milisekundama na bilo kojoj
  vezi.

---

## 5. API ZA TREĆA LICA (THE TRANSLITERATOR SDK)

Omogućavamo drugim programerima da ugrade našu "God Mode" stabilnost u svoje
projekte.

- **JS/TS Wrapper:** NPM paket koji jednostavno uvozi naše WASM jezgro.
- **Rust Crate:** Dostupnost jezgra na `crates.io` za Rust zajednicu.

---

**Vision 2027 zaključak:** Naš softver više nije alat, on je **infrastruktura**.
Mi gradimo mostove preko pisama, spajajući ljude, digitalne sisteme i istorijske
zapise srpskog jezika u jednu koherentnu, visoko-performansnu celinu.
