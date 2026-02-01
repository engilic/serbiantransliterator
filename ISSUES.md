# POZNATI PROBLEMI & ZADACI (TRACKING)

Ovde pratimo aktivne bagove, UX nedoumice i sitne zadatke koji nisu deo glavnog Roadmap-a.

---

## ✅ REŠENO (CLOSED)

1. **Preslovljavanje ne radi (`wasmModule.init_replacer` is not a function)**
    - **Status:** Fixovano u PR-u (Max3 Hardening). Provereni exporti u `lib.rs` i tipovi u TypeScript-u. Worker sada pravilno čeka inicijalizaciju.

2. **ASCII i Live Stats su "grayed out"**
    - **Status:** Rešeno. Logika `shouldEnable` u `selection.ts` je ažurirana da dozvoli ASCII konverziju ako tekst sadrži bilo kakvu latinicu (naša slova) ili ćirilicu.

3. **Tekst (Nema podataka) poravnanje**
    - **Status:** Rešeno kroz CSS (`global.css`). Padding je usaglašen sa ostatkom UI-ja.

4. **A11y (Axe) - `color-contrast` failure u Tour UI (flaky u E2E)**
    - **Status:** Rešeno. Podešen kontrast za tour tekst/naslov (WCAG AA) i stabilizovan A11y E2E test (čekanje da se stil/theme stabilizuje pre Axe analize).

---

## ⚠️ AKTIVNO (OPEN / INVESTIGATING)

5. **Dugme OK vs Cancel (Vizuelni stil)**
    - **Opis:** Postoji vizuelna nekonzistentnost. "Cancel" je outline dugme (`.secondary-btn`), dok je "OK" solid dugme (`.primary-btn`).
    - **Pitanje:** Da li želimo da oba budu outline ili oba solid?
    - **Preporuka:** Zadržati trenutno stanje (Fluent UI standard) — primarna akcija treba da bude istaknuta. Ako se menja, menjati globalno u `footer.css` / `modals.css`.

6. **Worker Error Reporting (`[object Event]`)**
    - **Opis:** Kada worker pukne (npr. mrežna greška), ponekad vrati `Event` objekat umesto jasne poruke greške, pa UI ispiše `[object Event]`.
    - **Status:** Delimično rešeno kroz `WorkerClient` refaktorizaciju (bolje hvatanje grešaka), ali treba pratiti u telemetriji da li se i dalje javlja.
    - **Next:** Standardizovati error serialization (`message`, `name`, `stack`, `cause`) i osigurati da se `Event` mapira u čitljivu poruku.

7. **WebView2 Theme Sync**
    - **Opis:** Na Windowsu, kada se promeni sistemska tema (Light/Dark), Taskpane ne reaguje momentalno dok se ne uradi reload ili fokusira prozor. Ovo je limitacija WebView2 kontrole.
    - **Moguće rešenje:** Polling ili oslanjanje na Office.js `Office.context.officeTheme` (ako postane pouzdaniji).

8. **DOMParser Memory Limit**
    - **Opis:** Pokušaj učitavanja fajla od 1GB u Web Mode-u će srušiti tab (Out of Memory).
    - **Plan:** Rešava se u Q2 2026 implementacijom Rust Streaming parsera.
