# 🚀 VISION 2026: THE NEURAL FRONTIER — THE ULTIMATE STRATEGIC BLUEPRINT

**Project:** Serbian Transliterator (Universal Engine)
**Architectural Level:** God Mode (v1.1.0 Hardening -> v2.0.0 Intelligent)
**Motto:** "Absolute Privacy. Infinite Performance. Universal Reach."

---

## 1. STRATEŠKA FILOZOFIJA: "GALAXY MODE" IMPERATIVI

Naš cilj nije da budemo "još jedan konverter". Naša vizija je stvaranje **univerzalnog standarda** za procesiranje srpskog jezika u digitalnom dobu. Da bismo to postigli, svaki red koda mora pratiti četiri stuba:

### I. Arhitektura nulte latencije (The 16ms Rule)
Ljudski mozak percipira odlaganje nakon 100ms. Naš cilj je da prosečna operacija nad stranicom teksta traje manje od **16ms**. Korisnik ne sme da oseti da softver "radi"; konverzija mora biti prirodna kao i renderovanje fonta.
- **Rust/WASM Dominacija:** Eliminacija JavaScript garbage collectora iz kritičnih putanja.
- **SIMD (Single Instruction, Multiple Data):** Korišćenje paralelizma na nivou procesorskih instrukcija za simultano procesiranje karaktera.

### II. Privatnost kao ontološki status (Privacy by Design)
U svetu gde je "Cloud" postao sinonim za nadzor i prodaju podataka, mi biramo **radikalnu lokalizaciju**. 
- **The Air-Gap Standard:** Softver mora biti funkcionalan u bunkerima, avionima i visoko obezbeđenim državnim mrežama bez ijednog poslatog bajta ka eksternim serverima.
- **Lokalna Telemetrija:** Dijagnostika se čuva u IndexedDB-u i samo je korisnik može videti ili izvesti. Mi nemamo uvid u to šta korisnik piše.

### III. Strukturalni Integritet (Preservation of Intent)
Transliteracija ne sme da uništi formatiranje, metapodatke ili programski kod. Naš sistem mora razumeti razliku između rečenice i regularnog izraza, između imena brenda i obične imenice.

---

## 2. DETALJNA TEHNIČKA MAPA PUTA (2026 - 2028)

### FAZA 1: ZLATNI TEMELJI (COMPLETED - Q1 2026)
*   **Postignuće:** Migracija na Rust Core v1.0.
*   **Ključna Tehnologija:** FST (Finite State Transducers) koji omogućavaju pretragu kroz 100.000 reči u mikrosekundama uz memorijski otisak manji od 2MB.
*   **Status:** Gold Master v1.0.0 je u produkciji.

### FAZA 2: ARHITEKTONSKO OJAČAVANJE (CURRENT - Q2 2026)
*   **Cilj:** Rušenje "Memorijskog Zida" (The Memory Wall).
*   **Problem:** JS `DOMParser` je "Eager" — on učitava sve odjednom. To ubija performanse na dokumentima od 1000+ strana.
*   **Rešenje: Rust Streaming Engine (`quick-xml`).**
    *   Implementacija **Pull-Parsera** direktno u Rust-u. Umesto da JS parsira XML i šalje objekte Rust-u, JS će slati sirovi `Uint8Array` stream (buffer), a Rust će ga "žvakati" bajt po bajt.
    *   **Memorijski cilj:** Constant O(1) Memory Usage. Bez obzira da li je fajl 100KB ili 1GB, aplikacija ne sme trošiti više od 60MB RAM-a.
*   **Self-Healing Workers:** Implementacija supervisor pattern-a. Ako WASM baci nepredviđenu grešku, Worker se restartuje za <10ms, re-inicijalizuje stanje i nastavlja tamo gde je stao, bez obzira na Word host.

### FAZA 3: UNIVERZALNI DOMAĆIN (Q3 - Q4 2026)
*   **Cilj:** Potpuna de-kaplacija (decoupling) od Office.js.
*   **Proizvodi:**
    1.  **Chrome/Edge/Firefox Extension:** Koristeći isti WASM core, omogućavamo transliteraciju celog Interneta (Facebook, Gmail, Novinski portali) jednim klikom, lokalno u browseru.
    2.  **Tauri Desktop App (Batch Processor):** Standalone aplikacija za Windows/Mac/Linux. Prevucite folder sa 5000 `.docx` ili `.json` fajlova, i preslovite ih sve za 10 sekundi.
    3.  **Transliterator CLI:** Alat za programere i sys-admine za automatizaciju kroz terminal.

### FAZA 4: LOKALNA INTELIGENCIJA (2027+)
*   **Cilj:** Kontekstualna svesnost bez clouda.
*   **Tehnologija: ONNX Runtime + Quantized Models.**
    *   Uvođenje minijaturnog, visoko optimizovanog modela za **NER (Named Entity Recognition)** od ~15MB.
    *   **Pametna zaštita:** Model automatski prepoznaje da je "Apple" u rečenici brend, a ne voće, i štiti ga od transliteracije bez potrebe da korisnik ručno dodaje reči u listu.
*   **Morfološka Analiza:** Inteligentna konverzija ijekavica <-> ekavica koja razume padeže i glagolska vremena kako bi se izbegle greške tipa "vreme -> vrijeme" tamo gde nije gramatički ispravno.

---

## 3. LINGVISTIČKI I LOGIČKI IMPERATIVI

Naš engine mora postati "jezički pismen":
1.  **Advanced Bridging:** Savršeno rukovanje rečima koje su razbijene kroz `w:r` (runs) zbog promene fonta ili spellcheck-a u Word-u. Naš parser mora "videti" kroz XML tagove.
2.  **Slojevita zaštita:**
    *   *Sloj 1:* Rigidne liste (ALWAYS_LATIN).
    *   *Sloj 2:* Heuristike (MixedCase, CamelCase, underscore_names).
    *   *Sloj 3:* Sintaksna svesnost (prepoznavanje koda, URL-ova, e-mailova).
    *   *Sloj 4 (Budućnost):* Lokalni AI.

---

## 4. DEVOPS & KVALITET: "GUARDIAN" STANDARD

Kvalitet koda je naša najveća odbrana od regresije:
*   **The Guardian Pipeline:** Svaki PR mora proći kroz `scripts/verify-all.js`. Ako coverage padne ispod 85%, build se automatski odbija.
*   **Fuzz Testing:** Generisanje miliona nasumičnih stringova (uključujući malformisane Unicode karaktere) i njihovo "hranjenje" WASM jezgru kako bi se osiguralo da **nikada** ne dođe do pucanja (segfault/panic).
*   **Binary Size Watchdog:** Svaki novi rečnik ili funkcija moraju biti opravdani. Ako WASM pređe 5MB, moramo tražiti nove metode kompresije rečnika.

---

## 5. KRAJNJI UTICAJ (THE IMPACT)

Do kraja 2026. godine, **Serbian Transliterator** će biti:
- **Najbrži:** 1.000.000 karaktera u < 50ms.
- **Najlakši:** < 4MB ukupno sa svim jezicima i rečnicima.
- **Najsigurniji:** Bez ikakvog eksternog saobraćaja.
- **Najpametniji:** Razumeće srpski jezik bolje od bilo kog drugog offline alata.

---

## 📋 OPERATIVNI ZAKLJUČAK ZA DEVELOPERE

Kada radite na ovom projektu, vi ne pišete skripte. Vi gradite **precizni inženjerski instrument**. 
- Ako možeš da koristiš `match` umesto `if`, uradi to (Rust optimization).
- Ako možeš da izbegneš alokaciju na heap-u, uradi to (Performance optimization).
- Ako sumnjaš da li je nešto privatno, pretpostavi da jeste i zadrži ga lokalno.

---

**Ovo je naša potraga za savršenstvom u digitalnoj lingvistici.**

---------

## 🛰️ VISION 2027: THE SOVEREIGN LINGUISTIC CORE (OMNIPRESENCE)

Dok je 2026. godina bila fokusirana na performanse i "sirovu snagu" streaming engine-a, 2027. predstavlja godinu **Lokalne Inteligencije** i **Potpune Dekaplacije (Decoupling)**. U ovoj fazi, Serbian Transliterator prestaje da bude Word Add-in i postaje univerzalna binarna biblioteka koja "živi" na nivou operativnog sistema ili pretraživača.

### 1. NEURALNA INTEGRACIJA (ON-DEVICE AI)
U 2027. godini napuštamo oslanjanje isključivo na statičke liste zaštićenih reči (ALWAYS_LATIN).
*   **Quantized NER (Named Entity Recognition):** Integracija minijaturnog jezičkog modela (npr. DistilBERT ili TinyLLM kvantizovan na 4-bita) unutar WASM-a. 
    *   **Cilj:** Model automatski prepoznaje imena ljudi, stranih kompanija, ulica i tehničkih termina sa preciznošću od 99.8%, bez potrebe da korisnik ručno unosi "Microsoft" ili "Apple" u listu zaštićenih reči.
*   **WASM SIMD Inference:** Korišćenje paralelizma procesorskih instrukcija za pokretanje AI modela lokalno u browser-u ili Word-u, sa latencijom manjom od 50ms po pasusu.
*   **Privacy-First Training:** Svi modeli su "frozen" i isporučuju se kao binarni resursi. Nema učenja na podacima korisnika; privatnost ostaje ontološki imperativ.

### 2. EKOSISTEM OMNIPRESENCE (POTPUNA DOSTUPNOST)
Transliterator postaje standardni "layer" kroz koji prolazi digitalni tekst na Balkanu.
*   **Sovereign CLI (Command Line Interface):** Rust binarna aplikacija za servere i CI/CD pipeline. Omogućava kompanijama da automatski preslovljavaju hiljade dokumenata ili baze podataka u realnom vremenu kao deo build procesa.
*   **Browser Extension 2.0 (The Living Web):** Ekstenzija koja ne zahteva klik. Ona koristi `MutationObserver` i WASM jezgro da u realnom vremenu, dok skrolujete, preslovljava Twitter, LinkedIn, Facebook ili vesti, čuvajući pritom kod, linkove i tagove netaknutim.
*   **Desktop Hub (Tauri Framework):** Standalone aplikacija izgrađena u Rust/Tauri koja služi kao "batch processor". Podrška za:
    *   Masovnu konverziju `.docx`, `.pdf` (text layer), `.json`, `.md` i `.html` fajlova.
    *   Drag-and-drop foldera sa hiljadama dokumenata.

### 3. DUBOKA LINGVISTIČKA SOVERENOST (MORPHOLOGICAL ANALYZER)
Transliteracija evoluira u razumevanje jezika.
*   **Lematizacija i Stemming u Rustu:** Jezgro dobija sposobnost da prepozna koren reči i njene gramatičke oblike. 
    *   **Primer:** Prepoznavanje da su "vremena", "vremenu" i "vremenom" oblici reči "vreme", što drastično poboljšava preciznost konverzije ijekavica <-> ekavica.
*   **Context-Aware Dialect Switching:** Rešavanje problema homonima. Sistem će razumeti da li je "kosa" u rečenici imenica (dlaka na glavi) ili pridjev (nagnuta), i na osnovu toga primeniti ispravna pravila za ijekavizaciju ako je potrebno.
*   **Semantic Protected Buffers:** Automatska detekcija programskog koda unutar običnog teksta (npr. `System.out.println`) bez potrebe za Markdown backtick-ovima, štiteći tehničku semantiku.

### 4. BINARNA OPTIMIZACIJA (THE 2MB LIMIT)
Uprkos dodavanju AI modela, postavljamo rigorozne ciljeve za veličinu:
*   **Dictionary Sharding:** Dinamičko učitavanje delova rečnika samo kada su potrebni (npr. medicinski ili pravni termini se učitavaju samo ako model detektuje taj domen).
*   **WASM Stripping:** Napredna eliminacija mrtvog koda (LTO) kako bi osnovni engine ostao ispod 2MB, omogućavajući učitavanje u milisekundama na bilo kojoj vezi.

### 5. API ZA TREĆA LICA (THE TRANSLITERATOR SDK)
Omogućavamo drugim programerima da ugrade našu "God Mode" stabilnost u svoje projekte.
*   **JS/TS Wrapper:** NPM paket koji jednostavno uvozi naše WASM jezgro.
*   **Rust Crate:** Dostupnost jezgra na `crates.io` za Rust zajednicu.

---

**Vision 2027 zaključak:** Naš softver više nije alat, on je **infrastruktura**. Mi gradimo mostove preko pisama, spajajući ljude, digitalne sisteme i istorijske zapise srpskog jezika u jednu koherentnu, visoko-performansnu celinu.
