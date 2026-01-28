# SERBIAN TRANSLITERATOR - THE NEURAL FRONTIER

**DATUM:** Januar 2026.
**VERZIJA:** 1.0.0 (Gold + God Mode DevOps)
**STATUS:** 🚀 DEPLOYED (Cloudflare Pages) & HOSTED (GitHub)
**MISIJA:** Transformacija iz "Preslovljivača" u "Inteligentnog Jezičkog Procesora".
**FILOZOFIJA:** Privacy First (Offline), Zero Latency, Universal Availability.

---

### ✅ COMPLETED MILESTONES (WINS)

#### 🏆 ENTERPRISE AUTOMATION (DEVOPS) - Q1 2026

- **Status:** ZAVRŠENO (Godinu dana pre roka).
- **Implementirano:** Guardian System, Omega Sanitizer, Release Commander.
- **Rezultat:** Razvojni proces je automatizovan, bezbedan i brz.

---

### 🟢 CORE PILLARS (PRIORITY - DEFINITE)

#### 1. CODING STANDARDS & RESILIENCE (IMMEDIATE)

- **Cilj:** Kod mora biti samoodrživ, lak za navigaciju i "neprobojan".
- **File Identity:** Svaki fajl u projektu **MORA** počinjati komentarom sa svojom relativnom putanjom (npr. `// === FILE: src/core/textCore.ts ===`). Ovo je obavezno za lakše debagovanje i kontekst.
- **Total Error Observability:** Nijedna greška ne sme ostati sakrivena u konzoli.
    - Sve (Worker errors, WASM panics, JS exceptions) mora biti uhvaćeno.
    - **Prikaz:** Greška se mora prikazati korisniku u UI statusnoj traci (`#msg`) ili modalu, kako bi korisnik znao šta se dešava.

#### 2. CORE ENGINE 2.0 (STREAMING) - Q2 2026

- **Cilj:** Obrada fajlova od 1GB+ sa konstantnom memorijom (O(1) RAM).
- **Tehnologija:** Zamena `DOMParser` (JS) sa `quick-xml` (Rust).
- **Status:** Planirano. Trenutni limit od ~500MB je prihvatljiv za v1.0, ali nedovoljan za arhivsku obradu.

#### 3. CODEBASE MODERNIZATION (ESLINT 9) - Q3 2026

- **Cilj:** Migracija sa zastarelog ESLint 8 sistema na **ESLint 9 (Flat Config)**.
- **Razlog:** Uklanjanje svih `npm warn deprecated` poruka i priprema za buduće Node.js verzije.

#### 4. EKOSISTEM (UNIVERSAL) - 2027

- **Cilj:** Dostupnost van Word-a. Isti WASM engine, novi hostovi.
- **Browser Extension:** Chrome/Edge/Firefox dodatak za preslovljavanje bilo koje web stranice, Gmail-a, Google Docs-a.
- **Tauri Desktop App:** Samostalna aplikacija za "batch" obradu foldera na disku (Drag & Drop hiljade fajlova).

---

### 🟡 EXPERIMENTAL / SKEPTICAL (UNDER REVIEW)

#### 5. ON-DEVICE AI (NER) - Q3 2026?

- **Koncept:** Lokalni BERT model (ONNX Runtime) za prepoznavanje imena (Named Entity Recognition) bez ručnih pravila.
- **Arhitektonska Sumnja (Architect's Note):**
    - **Veličina:** Dodavanje modela povećava bundle za 20-50MB. Ovo može drastično usporiti inicijalno učitavanje.
    - **Alternativa:** Unapređenje postojećih heuristika (Regex/Logic) u Rustu. Trenutni sistem je već 95% tačan sa 0 bajtova overheada.
- **Status:** Ostaje kao "Research Spike". Implementirati samo ako heuristika udari u plafon preciznosti.

#### 6. CLOUD INTELLIGENCE (HYBRID)

- **Koncept:** Hibridni mod sa Cloudflare Workers + LLM API za stilsku analizu teških rečenica.
- **Arhitektonska Sumnja (Architect's Note):**
    - **Privatnost:** Narušava glavni "Offline & Privacy" adut proizvoda. Podaci bi morali da napuste uređaj.
    - **Kompleksnost:** Zahteva internet, API ključeve, hendlovanje grešaka mreže i troškove infrastrukture.
- **Status:** Nizak prioritet. Razmotriti samo kao "Opt-In" funkciju za Enterprise klijente.

---

### 🎯 FOKUS SADA (Q1 2026): LAUNCH & STABILITY

Infrastruktura je "God Tier". Vraćamo se na čišćenje koda i UX.

**Immediate Next Steps:**

1.  **Standardizacija:** Proći kroz sve fajlove i dodati `// === FILE: path ===` header.
2.  **Code Cleanup:** Obrisati 71 nekorišćen prevod (`bloat`) iz `sr.ts` koje je detektovao `checkI18nKeys`.
3.  **Telemetry Analysis:** Pratiti performanse u produkciji.
4.  **Marketing:** Priprema Store listinga (screenshots, video).

**UX Polish (v1.0.1 Candidate):**

- [ ] **Accordion Auto-Scroll Fine-Tuning:** Podesiti CSS `scroll-margin-block: 15px` za sekcije da bi `scrollIntoView` ostavljao malo više prostora oko elementa pri otvaranju.
