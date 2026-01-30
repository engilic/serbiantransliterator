# POZNATI PROBLEMI & ZADACI (TRACKING)

Ovde pratimo aktivne bagove, UX nedoumice i zadatke koji nisu deo glavnog Roadmap-a.

---

### ✅ REŠENO (CLOSED - v1.0.0 God Mode)

1. **Accessibility (A11y) Violations**
    - **Status:** FIXOVANO. Svi modalni prozori su sada Axe-core compliant. Dodate labele za čitače ekrana i rešen problem praznih naslova.
2. **Protected Branch Push Failure**
    - **Status:** FIXOVANO. Guardian sistem sada automatski prepoznaje master granu i nudi kreiranje PR grane sa automatskim push-om.
3. **Double Header Corruption**
    - **Status:** FIXOVANO. `add-headers.ps1` sada ima preciznu detekciju i ne duplira linije u root fajlovima i skriptama.
4. **Binary Data Corruption (os error 216)**
    - **Status:** FIXOVANO. Integrisan `cargo clean` u glavni build pipeline.
5. **Worker Selection Lag**
    - **Status:** FIXOVANO. Selekcija se sada obrađuje u workeru uz binarni prenos podataka.

---

### ⚠️ AKTIVNO (OPEN / INVESTIGATING)

6. **WebView2 Theme Sync**
    - **Opis:** Windows tema se ne osvežava u Add-in-u bez fokusa na prozor. Istražuje se Office.js `onThemeChanged` event.
7. **Vitest v8 Coverage Noise**
    - **Opis:** Vitest ispisuje 'v8' u žutoj boji (fiksni branding). Iako estetski smeta, ne utiče na funkcionalnost.
8. **DOMParser Memory Limit**
    - **Opis:** Fajlovi > 500MB mogu izazvati OOM (Out of Memory).
    - **Plan:** Rešava se u Q2 2026 kroz Streaming Engine.
