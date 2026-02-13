# 📊 PROJECT STATE — v1.1.0 (MAX1 HARDENED)

**Date:** February 12, 2026 (REV 2026-02-12)  
**Version:** 1.1.0 (MAX1 Engine Upgrade)  
**Codename:** “The Morphological Shift”  
**Pipeline Identity:** 🛡️ MAX1 Guardian (Morphological & Structural Aware)  
**Status:** 🟢 GREEN (Full local verification passing)

---

# 🏗️ 01 // SYSTEM ARCHITECTURE & INTERNALS

Sistem koristi **MAX Mode Hybrid Architecture** koja spaja TypeScript UI ljuske sa Rust/WASM jezgrom.

## A) The Core Engine (Rust/WASM) — [MAX1 UPGRADE]

- **Crate:** `src/wasm-core` (WASM build preko `wasm-pack`).
- **Morphological intelligence:** Engine prepoznaje određene prefiksalne/morfemske granice i time smanjuje rizik pogrešnog spajanja digrafa (Љ, Њ, Џ) u osetljivim kontekstima.
- **Word-level caching:** Uveden `FxHashMap` cache na nivou reči radi ubrzanja obrade ponovljenih tokena (dobitak zavisi od dokumenta i profila ponavljanja).
- **Case-aware protection:** Sistem je “case-aware” u zaštitnim/heurističkim pravilima (ALL CAPS / Title Case / MixedCase), gde je relevantno.

## B) The Frontend Shell (TypeScript)

- **Lint/Typecheck gates:** `pnpm run lint` i `pnpm run typecheck` su deo `verify` pipeline-a i očekuje se clean rezultat u strict režimu.
- **Unified binary loader:** Svi binarni aseti (rečnici i WASM) se učitavaju kroz `src/shared/utils/binary.ts`, čime se uklanja duplikacija i smanjuje rizik divergencije kroz thread/worker tokove.
- **Unicode normalization:** NFC normalizacija ulaza se koristi gde je potrebno da se izbegnu problemi sa “razbijenim” karakterima (ć/č/š) iz različitih izvora.

## C) Worker Pipeline (Supervisor Pattern)

- **Worker-first:** Teška obrada je izmeštena u Web Worker tokove.
- **Failsafe / fallback:** Postoji fallback strategija ako WASM inicijalizacija predugo traje ili ne uspe (timeout/fallback je definisan u kodu) kako bi UX ostao stabilan.

---

# 🧩 02 // MODULES & DATA FLOW

## OOXML Processing (“The Bridge”) — [STRUCTURAL UPGRADE]

- **Location:** `src/shared/ooxml`.
- **Greedy structural bridging:** Rekonstrukcija logičkih entiteta preko split OOXML run-ova (URL/email/URI schemes, brendovi, tokeni) pre slanja u engine.
- **URI scheme guard:** Zaštita za `mailto:`, `tel:`, `sms:`, `sip:`, `geo:`, `skype:`, `teams:` uz pametno trimovanje završne interpunkcije.
- **System path protection:** Prepoznavanje Windows (`C:\...`) i Unix (`/usr/bin/...`) putanja.
- **Namespace optimization:** Pametno upravljanje `xml:space="preserve"` atributom; uklanja se kada više nije potreban.

## Dictionary Management

- **Runtime:** Binarno kompajlirani rečnici (FST) sa podrškom za varijante (Ekavica/Ijekavica) i sufiksnu/morfološku obradu.

---

# 📉 03 // PERFORMANCE METRICS (INDICATIVE BASELINE)

Napomena: brojevi su indikativni i zavise od dokumenta, CPU-a, browsera i Office host-a. Precizno merenje raditi kroz profiling/bench i realne DOCX uzorke.

- **WASM init:** ~40ms cold, ~3ms warm (indikativno).
- **Startup latency:** uklonjen veštački delay tokom inicijalizacije (brži subjektivni start).
- **Throughput:** ubrzano na dokumentima sa mnogo ponavljanja zahvaljujući cache-u (benchmark/TBD).
- **Memory footprint:** varira sa veličinom i strukturom OOXML-a; ekstremni inputi mogu značajno povećati potrošnju.

---

# 🛡️ 04 // SECURITY & COMPLIANCE

- **Audit gates (strict):** `pnpm audit` i `cargo audit` su integrisani u strict `verify` tok i služe kao sigurnosni signal/gate.
- **XML hardening:** `xmlParser` je ojačan zaštitom od DTD/entity definicija i patoloških XML struktura (XXE / “billion laughs” klasa napada).
- **Privacy posture:** Offline-first obrada; osnovna konverzija i rečnici rade lokalno. (Ako se uvede telemetrija, mora biti eksplicitno odvojena i transparentna.)

---

# ✅ 05 // RECENT UPDATES (2026-02-12)

- **Structural stitching:** Greedy/recursive stitching preko OOXML run-ova (links/tokens/digraphs).
- **URI guard:** proširenje URI zaštite + trimovanje interpunkcije.
- **System path guard:** zaštita Windows/Unix putanja.
- **DevOps:** `verify-all.js` strict pipeline + jasniji report + uslovni push prompt.

---

**SUMMARY:** MAX1 milestone fokusiran je na OOXML strukturalnu ispravnost, morfološku preciznost i stroge verifikacione gate-ove.
