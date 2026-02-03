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
