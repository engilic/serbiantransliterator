# 🚀 VISION 2026–2028: THE NEURAL FRONTIER — THE ULTIMATE STRATEGIC BLUEPRINT (REV 2026-02-10)

Projekat: Serbian Transliterator (Universal Engine)
Arhitektonski nivo: MAX Mode (v7.7)
Operativni status: Phase 2 — Architectural Hardening
Motto: “Absolute Privacy. Infinite Performance. Universal Reach.”


============================================================
1) STRATEŠKA FILOZOFIJA: “GALAXY MODE” IMPERATIVI
============================================================

Sistem ne gradimo kao “plugin”, već kao suvereni sloj za procesiranje jezika.
Svaki red koda mora biti u skladu sa 4 stuba MAX arhitekture.

I) Arhitektura nulte latencije (The 16ms Rule)
Problem:
- Main Thread (Word UI + Web UI) ne sme da se blokira. Svaki blokirajući poziv >16ms pravi “stutter”.

Rešenje (pravila):
- Worker-First: 100% compute (konverzija, parse, diff) ide u Web Worker/Worker pool.
- WASM init ne sme blokirati UI: “lazy init” + “background warmup” (npr. ensureWasmReady u pozadini).
- Adaptive Chunking: dinamički batch size na osnovu realnog vremena povratka iz workera.
- Zero-Lock caching u Rust-u: thread_local cache po WASM instanci (svaki worker ima izolovan memorijski prostor).
- WASM SIMD (kada je dostupno): v128 optimizacije za skeniranje/klasifikaciju (URL/email/tag/quote/code).

II) Privatnost kao ontološki status (Privacy by Design)
Pravila:
- Air-gap standard: nakon inicijalizacije, nema poziva ka spoljnim API-jima za sadržaj dokumenta.
- Local persistence: samo localStorage + IndexedDB za podešavanja i perf telemetriju.
- No Cloud AI: sva “inteligencija” mora biti upakovana lokalno (WASM ili ONNX runtime on-device).
- Analytics transparency:
  - Dozvoljena je samo agregirana, anonimna statistika (bez PII, bez sadržaja dokumenata).
  - Endpointi moraju imati eksplicitni “PII guard” (schema + allowlist polja).

III) Strukturalni integritet (Preservation of Intent)
Princip:
- Sistem ne vidi “tekst”, već strukturu dokumenta (OOXML).
- OOXML parse mora razlikovati:
  - w:t u hyperlink-u vs običan tekst
  - field code sekcije, proofing run-ove, sdt content, headers/footers/notes
- Atomic bridging:
  - tokeni razbijeni stilovima (npr. <b>i</b>Phone) rekonstrušu se u memoriji
  - zaštite se (brands, romans, code, links, placeholders)
  - vraćaju se u originalne XML run-ove bez gubitka formatiranja

IV) Dual-UX Paradigm (v1.x)
- Office Add-in: duboka Word integracija (profesionalni tok rada).
- Web App: standalone (povremeni korisnici + batch DOCX + plain text).
- Unified Engine: isti Rust/WASM core + isti TS engine interfejs; nula dupliranja logike.
- “Environment detection” mora biti robustan:
  - Office runtime nije garantovan u testovima/web-u, pa se koristi runtime guard (unknown + type guard).
  - Office tipovi su compile-time (TypeScript) preko @types/office-js + triple-slash reference u src/global.d.ts.


============================================================
2) DETALJNA TEHNIČKA MAPA PUTA (2026–2028)
============================================================

FAZA 1: ZLATNI TEMELJI (Završeno — Q1 2026) ✅
- Rust Core 1.0: prelazak sa regex-based na FST pristup gde ima smisla.
- Kompresovani rečnici: agresivno smanjenje footprint-a (gzip/bin) bez žrtvovanja brzine.
- Dual-UX launch: Add-in + Web, zajednički engine.
- Telemetry/analytics minimalno i transparentno (agregatno, anonimno).
- Gold Master: v1.0.0 u produkciji.

FAZA 2: ARHITEKTONSKO OJAČAVANJE (Trenutni sprint — Q2 2026)

2.1 Rušenje “Memorijskog zida” (Large DOCX / Large XML)
Problem:
- DOMParser gradi kompletno stablo objekata u RAM-u.
- Veliki OOXML part-ovi eksplodiraju memoriju (100MB XML može da ode u stotine MB heap-a).

Cilj:
- Streaming parse u Rust/WASM (quick-xml / pull parser).
- JS šalje bytes (Uint8Array) ili chunked stream, Rust procesuira “u letu”, vraća modifikovane bytes.
- Memorijska kompleksnost: O(1) u odnosu na veličinu inputa (gornja granica memorije je fiksirana limitima pipeline-a).

Deliverables:
- Streaming “read → protect → convert → write” pipeline.
- Fail-safe fallback na postojeći parser (feature flag) dok streaming ne postane default.
- Perf/Memory testovi: “100MB part” scenario + regression gates.

2.2 Adaptive Chunking 2.0
- Worker roundtrip time measurement.
- Dynamic batch size: smanji batch kad CPU uspori ili kad UI signalizira busy.
- Hard limit: main thread nikad ne sme da blokira.

2.3 PWA Hardening (Web App)
- Service Worker offline-first:
  - precache critical assets
  - background update detection
  - user-friendly “update available” banner (refresh/later/release notes)
- “Simulated offline” toggle za testiranje UX-a i fallback grana.

2.4 DevEx Hardening (Quality Gates)
- ESLint: max-warnings 0 (warning = build fail), cilj: 0 noise.
- Type safety: zabrana any; unknown + guards.
- Test stabilnost:
  - smoke testovi čekaju realne async signale (onReady + setTimeout + lazy imports).
- Office.js tipovi:
  - @types/office-js u devDependencies
  - src/global.d.ts uključuje `/// <reference types="office-js" />`
  - ESLint override za **/*.d.ts (triple-slash reference off, ako zatreba)

FAZA 3: EKOSISTEM OMNIPRESENCE (Q3–Q4 2026)
3.1 Decoupling
- 100% razdvajanje core logike od Office.js specifičnosti.
- Jasni portovi/adapters: document adapter (Office/Web), settings store, telemetry, engine.

3.2 Novi proizvodi (isti core)
1) Browser Extension 2.0:
   - MutationObserver transliteration (real-time feed translit)
   - strogi “protection layer” (code/urls/emails) u DOM kontekstu
2) Tauri Desktop Hub:
   - masovna konverzija lokalnih foldera (DOCX, plain text; PDF ako se doda bezbedan pipeline)
3) MAX CLI (Rust):
   - integracija u pipeline-ove (lokalno, offline-first)
   - determinističan output (reproducible builds)

3.3 AppSource Submission
- hardening manifest-a, privacy policy, support, security posture.
- enterprise-friendly release notes i compatibility matrix.

VISION 2027: THE SOVEREIGN LINGUISTIC CORE
1) Duboka lingvistička suverenost
- Morphological analyzer u Rustu (lematizacija i gramatički oblici) kao opt-in modul.
- Context-aware dialect switching (disambiguation model: pravila + statistika, lokalno).
- Smart quote correction (kontekstualno, strukturano, OOXML-safe).

2) SDK za treća lica
- NPM paket: @serbian-transliterator/core (JS/TS wrapper + types).
- Rust crate: serbian-transliterator (crates.io).
- REST API (optional, opt-in cloud): stroga privatnost, “no content logging”, rate limit.

3) Binarna optimizacija (The 2MB–5MB discipline)
- Dictionary sharding: učitaj samo potrebne shard-ove.
- LTO, dead-code elimination, wasm-opt.
- Tree shaking i modularni build.

4) Enterprise features
- Multi-language UI (SR/EN + regionalne varijante kao UI sloj).
- Custom dictionary upload (lokalno; enterprise politika gde je dozvoljeno).
- Batch API u desktop/CLI kontekstu.
- Audit logging (opt-in, jasno definisano šta se loguje i gde se čuva).

VISION 2028: THE NEURAL LINGUISTIC LAYER
1) Lokalna inteligencija (On-device AI)
- Quantized NER (~10–30MB ONNX) za prepoznavanje entiteta bez cloud-a.
- Contextual disambiguation (transformer-lite; striktno lokalno).
- Neural suffix prediction (morfološki svesno, za nepoznate reči).

2) Cross-platform domination
- Mobile (iOS/Android) sa offline engine-om (WASM/ONNX).
- VS extension / VS Code extension za dokumentaciju i tekst.
- Obsidian/Notion plugin (ako imaju stabilne plugin API-je).
- Google Docs integracija (ako politika platforme dozvoljava i ako privatnost može ostati netaknuta).

3) Federated learning (privacy-preserving, opt-in)
- Anonymous improvements: nikad sirovi tekst; samo agregati/gradijenti uz privatnosne garancije.
- On-device fine-tuning: personalizacija, lokalni modeli.

4) Open source ecosystem
- Core engine: MIT, striktan contribution model.
- Plugin architecture: standardizovan API.
- Language packs: community-maintained rečnici i pravila.


============================================================
3) LINGVISTIČKI I LOGIČKI IMPERATIVI (Protection Layer)
============================================================

Nivoi zaštite:

1) Rigidni nivo:
- ALWAYS_LATIN liste (Microsoft, Windows, iPhone…)
- korisničke “protected tags” i “userProtected” liste

2) Sintaksni nivo:
- automatska detekcija code blocks / inline code
- URL, email, file paths (C:\...), telefonski brojevi gde ima smisla

3) Heuristički nivo:
- MixedCase / CamelCase / tokens sa brojevima (word1)
- rimskih brojevi (opciono protectRomans)

4) Kontekstualni nivo:
- bridging ambiguous sufiksa (npr. “Pro” zaštićen samo ako je deo brenda ili obrasca)
- all-caps hints (OOXML bridge)

5) Semantički nivo (2028+):
- NER-bazirano prepoznavanje entiteta bez eksplicitnih lista (lokalno)


============================================================
4) DEVOPS & KVALITET: “MAX1 GUARDIAN” STANDARD
============================================================

Nijedna promena ne ulazi u master bez prolaska kroz MAX1 pipeline.

Must-pass gates:
- I18n guard: svi stringovi u sr.ts + en.ts
- Security sniffer: secrets, nebezbedni HTML sink-ovi (innerHTML allowlist + sanitizer)
- Binary size watchdog: WASM size + bundle size
- Unit + fuzz: vitest (coverage gde je enforced), fuzz testovi (core + ooxml)
- E2E: Playwright smoke + fuzz UI tokovi (kontrolisana randomizacija)
- Analytics verification: track endpoint ne prima PII (schema enforcement)
- Dependency audit: pnpm audit + cargo audit (policy: block high severity)


============================================================
5) METRIKE USPEHA (KPIs)
============================================================

Tehničke metrike (mereno lokalno; perf monitor + real docs):
- WASM init (cold): cilj 2027 = 25ms, cilj 2028 = 15ms
- Throughput: cilj 2027 = 50k words/sec, cilj 2028 = 100k words/sec
- Bundle size: cilj 2027 = 1.5MB, cilj 2028 = 2.0MB (sa AI)
- Memory (large doc): cilj 2027 = ~50MB, cilj 2028 = ~50MB (streaming)
- Offline capability: 2027 Full PWA, 2028 Full + AI

Korisničke metrike (agregatno, anonimno):
- MAU: Q4 2026 = 1k, 2027 = 10k, 2028 = 100k
- Conversions/month: Q4 2026 = 10k, 2027 = 100k, 2028 = 1M+
- AppSource rating: 2027 = 4.5★, 2028 = 4.8★
- Enterprise customers: 2027 = 5, 2028 = 50


============================================================
6) OPERATIVNI ZAKLJUČAK: TRANSLITERATOR KAO INFRASTRUKTURA
============================================================

Mi ne pravimo alat za promenu pisma. Mi gradimo most:
- između digitalne sadašnjosti (latinica/kod) i kulturnog nasleđa (ćirilica),
- između enterprise compliance-a i korisničke brzine,
- između offline privatnosti i univerzalnog reach-a.

Ovo je MAX MODE. Ovo je Neural Frontier.


============================================================
7) TIMELINE SUMMARY (High-level)
============================================================

2026 Q1  v1.0.0 GOLD MASTER ✅
- Dual-UX launch (Office + Web)
- Analytics infra (minimal, anonymous)
- MAX1 gates

2026 Q2  CURRENT: Phase 2 Hardening
- Streaming OOXML parser (Rust/WASM)
- Memory optimization
- PWA hardening + update UX
- Strict Type/ESLint/Test stability

2026 Q3  Ecosystem expansion
- Browser Extension 2.0
- Tauri Desktop Hub
- MAX CLI

2026 Q4  Distribution + enterprise surface
- AppSource submission
- enterprise-ready policies (audit, privacy, logging opt-in)

2027     Sovereign linguistic core + SDK
2028     On-device AI + plugin ecosystem


Dokument kreirao: Serbian Transliterator Architecture Team
Poslednja revizija: 2026-02-10
Sledeća revizija: nakon v1.1.0 (Q2 2026)

© 2026 Serbian Transliterator Project. Licensed under MIT.
