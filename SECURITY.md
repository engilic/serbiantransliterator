# 🛡️ SECURITY POLICY — v1.0.0 (HARDENING PHASE)

---

**Project:** Serbian Transliterator (Universal Engine)
**Posture:** Privacy-First / Air-Gap Standard
**Standard:** MAX1 Guardian Verification

# 🟢 01 // SUPPORTED VERSIONS

---

Ovaj projekat se aktivno održava na `master` grani. Bezbednosne zakrpe su apsolutni prioritet.

| Verzija     | Status    | Podrška                                        |
| :---------- | :-------- | :--------------------------------------------- |
| **1.0.x**   | ✅ Stable | Aktivno održavanje i bezbednosni apdejti.      |
| **< 1.0.0** | ❌ Legacy | Više nije podržano. Obavezno pređite na 1.0.x. |

# 📨 02 // REPORTING A VULNERABILITY

---

Ako smatrate da ste pronašli bezbednosni propust, molimo vas da **NE** otvarate javni Issue. Koristite isključivo privatne kanale:

1.  **Email:** `iddj27510@gmail.com`
    - Subject: `Serbian Transliterator - Security Report`
2.  **GitHub Security Advisories:**
    - Kreirajte privatni thread kroz GitHub alat **“Report a vulnerability”**.

**Molimo uključite:**

- Detaljan opis propusta i potencijalni uticaj.
- Korake za reprodukciju (PoC).
- Cenzurišite osetljiv sadržaj dokumenata pre slanja bilo kakvih logova.

# 🦾 03 // DEFENSE-IN-DEPTH (HARDENING MEASURES)

---

Od verzije **v1.0.0**, primenjujemo sledeće rigorozne mere:

### A) XML & OOXML Safety

- **Pre-parse Validation:** Validacija XML-a na XXE konstrukte (`DOCTYPE` / `ENTITY`) pre ulaska u parser.
- **Structural Integrity:** Rekonstrukcija tokena sprečava korupciju OOXML strukture dokumenta.

### B) Execution Sandbox

- **WASM Memory Safety:** Jezgro u Rust-u eliminiše rizike od "buffer overflow" i sličnih grešaka.
- **Worker Isolation:** Obrada dokumenata se vrši u izolovanim nitima, štiteći glavni UI thread.

### C) MAX1 Guardian Pipeline

- **Automated Audit:** Svaka verifikacija koda automatski pokreće `pnpm audit` i `cargo audit`.
- **Secrets Sniffer:** Automatsko skeniranje koda na hardkodovane tajne i ključeve.
- **A11y Guard:** Osiguravamo da UI ne diskriminiše korisnike kroz loš kontrast ili nepristupačan dizajn.

# 🌐 04 // SYSTEM CONTEXT

---

- **Local Processing:** Sadržaj dokumenata se obrađuje isključivo u lokalnoj memoriji (RAM).
- **Air-Gap Policy:** Aplikacija ne šalje tekst dokumenata na eksterne servere nakon učitavanja.
- **Zero-Persistence:** Sirovi sadržaj dokumenata se nikada ne čuva na disku.

---

© 2026 Serbian Transliterator Project. Licensed under MIT.
