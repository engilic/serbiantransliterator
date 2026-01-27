# SERBIAN TRANSLITERATOR - THE NEURAL FRONTIER

**DATUM:** Januar 2026.
**VERZIJA:** 1.0.0 (Gold + MaxMaxMax)
**STATUS:** 🚀 DEPLOYED (Cloudflare Pages) & HOSTED (GitHub)
**MISIJA:** Transformacija iz "Preslovljivača" u "Inteligentnog Jezičkog Procesora".
**FILOZOFIJA:** Privacy First (Offline), Zero Latency, Universal Availability.

---

### 🟢 CORE PILLARS (PRIORITY - DEFINITE)

#### 1. CORE ENGINE 2.0 (STREAMING) - Q2 2026

- **Cilj:** Obrada fajlova od 1GB+ sa konstantnom memorijom (O(1) RAM).
- **Tehnologija:** Zamena `DOMParser` (JS) sa `quick-xml` (Rust).
- **Status:** Planirano. Trenutni limit od ~500MB je prihvatljiv za v1.0, ali nedovoljan za arhivsku obradu.

#### 2. EKOSISTEM (UNIVERSAL) - 2027

- **Cilj:** Dostupnost van Word-a. Isti WASM engine, novi hostovi.
- **Browser Extension:** Chrome/Edge/Firefox dodatak za preslovljavanje bilo koje web stranice, Gmail-a, Google Docs-a.
- **Tauri Desktop App:** Samostalna aplikacija za "batch" obradu foldera na disku (Drag & Drop hiljade fajlova).

#### 3. ENTERPRISE AUTOMATION (DEVOPS) - 2027+

- **Cilj:** Potpuna automatizacija izdavanja verzija i dokumentacije.
- **Tehnologija:** Semantic Release, Automated Changelog, GitHub Releases.

---

### 🟡 EXPERIMENTAL / SKEPTICAL (UNDER REVIEW)

#### 4. ON-DEVICE AI (NER) - Q3 2026?

- **Koncept:** Lokalni BERT model (ONNX Runtime) za prepoznavanje imena (Named Entity Recognition) bez ručnih pravila.
- **Arhitektonska Sumnja (Architect's Note):**
    - **Veličina:** Dodavanje modela povećava bundle za 20-50MB. Ovo može drastično usporiti inicijalno učitavanje.
    - **Alternativa:** Unapređenje postojećih heuristika (Regex/Logic) u Rustu. Trenutni sistem je već 95% tačan sa 0 bajtova overheada.
- **Status:** Ostaje kao "Research Spike". Implementirati samo ako heuristika udari u plafon preciznosti.

#### 5. CLOUD INTELLIGENCE (HYBRID)

- **Koncept:** Hibridni mod sa Cloudflare Workers + LLM API za stilsku analizu teških rečenica.
- **Arhitektonska Sumnja (Architect's Note):**
    - **Privatnost:** Narušava glavni "Offline & Privacy" adut proizvoda. Podaci bi morali da napuste uređaj.
    - **Kompleksnost:** Zahteva internet, API ključeve, hendlovanje grešaka mreže i troškove infrastrukture.
- **Status:** Nizak prioritet. Razmotriti samo kao "Opt-In" funkciju za Enterprise klijente.

---

### 🎯 FOKUS SADA (Q1 2026): LAUNCH & STABILITY

Kod je finalizovan (v1.0.0 Gold). Ne dodajemo nove velike funkcionalnosti dok ne dobijemo feedback korisnika.

**Immediate Next Steps:**

1.  **Telemetry Analysis:** Pratiti `skippedWrites` i `batchSize` metrike iz `PerformanceMonitor`-a u produkciji.
2.  **User Feedback:** Pratiti prijave grešaka vezane za specifične stilove ili formate dokumenata.
3.  **Marketing:** Priprema Store listinga (screenshots, video).

**UX Polish (v1.0.1 Candidate):**

- [ ] **Accordion Auto-Scroll Fine-Tuning:** Podesiti CSS `scroll-margin-block: 15px` za sekcije da bi `scrollIntoView` ostavljao malo više prostora oko elementa pri otvaranju.
