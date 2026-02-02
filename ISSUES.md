# 🛠️ INTERNAL ISSUE TRACKER & TECHNICAL DEBT REGISTRY — v1.0.0 Gold

Ovaj dokument služi kao primarni registar svih identifikovanih sistemskih ograničenja, tehničkog duga i planiranih ispravki. Fokus je na prebacivanju sa "Functional" na "Bulletproof" stabilnost (Faza 2 Hardening).

---

## 🔴 CRITICAL: MEMORY & PERFORMANCE (Priority: P0)

### 1. DOMParser Memory Bloat (The "RAM Wall")
- **Opis:** Trenutna implementacija u `src/shared/ooxml/xmlParser.ts` koristi pretraživačev `DOMParser`. Za dokument od 100MB, DOM stablo u RAM-u može zauzeti preko 800MB zbog načina na koji V8 mapira čvorove.
- **Simptomi:** Pad Web Workera sa greškom `Out of Memory` ili totalno zamrzavanje WebView2 kontrole na računarima sa 8GB RAM-a.
- **Privremeno rešenje:** Adaptive Chunking (procesiranje po 50 paragrafa).
- **Finalno rešenje:** Implementacija **Rust Streaming Pull-Parsera** koristeći `quick-xml`. Cilj je procesiranje neograničeno velikih XML-ova uz konstantnu potrošnju memorije od <50MB.

### 2. Worker Lifecycle & Panic Recovery (Self-Healing)
- **Opis:** Ako WASM jezgro baci `panic!` (npr. zbog neočekivanog Unicode karaktera), Web Worker umire. Trenutni `WorkerClient.ts` prelazi na main-thread fallback, što rezultira blokiranjem UI-ja.
- **Zadatak:** Implementirati supervisor pattern. Ako Worker crash-uje, klijent mora automatski da instancira novi Worker, ponovo učita rečnike i pokuša operaciju još jednom pre nego što odustane.
- **Status:** Investigating (Potrebno u v1.1.0).

---

## 🟡 HIGH PRIORITY: UX & INTEGRATION (Priority: P1)

### 3. WebView2 Office Theme Sync Failure
- **Opis:** Na Windows desktop verziji Word-a, promena sistemske teme (Light -> Dark) se ne propagira u Taskpane u realnom vremenu. Korisnik vidi "stari" UI dok ne klikne na Add-in ili ne uradi reload.
- **Tehnički uzrok:** WebView2 ne ispaljuje uvek `media-query` change event unutar Office iframe-a.
- **Planirani fix:** Uvesti aktivni polling (svakih 2s) na `Office.context.officeTheme` ili uvesti osvežavanje stila pri `window.focus` eventu.

### 4. State Persistence (Recovery after Close)
- **Opis:** Ako korisnik zatvori Taskpane, gubi se istorija poslednje operacije, izabrani filteri u "Zaštićeno" sekciji i rezultati poslednje statistike.
- **Zadatak:** Implementirati `sessionStorage` sinhronizaciju za `AppState`. Pri inicijalizaciji (`init.ts`), proveriti postojanje sačuvanog stanja i uraditi "rehydration".

---

## 🟢 MEDIUM PRIORITY: LINGUISTICS & LOGIC (Priority: P2)

### 5. Digraph Ambiguity in Bridge Logic
- **Opis:** "Bridging" logika u `src/shared/ooxml/bridge` ponekad pogrešno spoji karaktere na granici run-ova koji nisu deo iste reči (npr. kraj reči 'n' i početak sledeće reči 'j').
- **Zadatak:** Poboljšati heuristiku u `digraphs.ts` tako da se spajanje vrši samo ako oba karaktera pripadaju istom leksičkom kontekstu (bez razmaka ili interpunkcije između njih, čak i ako su u različitim `<w:t>`).

### 6. I18n Bloat & Dead Keys
- **Opis:** Tokom brzog razvoja dodato je mnogo ključeva u `sr.ts` i `en.ts` koji se više ne koriste u UI.
- **Zadatak:** Pokrenuti skriptu `checkI18nKeys.cjs` i obrisati sve "orphan" ključeve radi smanjenja bundle veličine.

---

## ⚪ LOW PRIORITY: POLISH & TOOLING (Priority: P3)

### 7. Large File Fuzzing
- **Opis:** Trenutni testovi pokrivaju male OOXML fragmente. Nemamo automatizovan test za fajlove od 500+ strana u CI okruženju.
- **Zadatak:** Dodati `tests/stress` folder sa generisanim džinovskim XML fajlovima.

### 8. Custom Subs Separator Risk
- **Opis:** Korisnici u "Sopstvene zamene" koriste `->` kao separator. Ako reč sadrži taj niz karaktera, parser puca.
- **Zadatak:** Dodati validaciju ili escape mehanizam u `subsUi.ts`.

---

## 📋 BACKLOG ZA VERZIJU 1.1.0 (Summary)
1. [ ] Rust `quick-xml` integracija.
2. [ ] Worker restart logika (Self-healing).
3. [ ] Persistence layer (sessionStorage).
4. [ ] NER (Named Entity Recognition) research spike.
