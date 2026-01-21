# Changelog

Sve značajne promene u projektu će biti dokumentovane u ovom fajlu.

## [1.0.0] - 2026-01-21

### Dodato (Added)

- **Offline Mode:** Rečnici za dijalekte su sada ugrađeni u aplikaciju. Internet nije potreban za konverziju.
- **Progress Bar:** Vizuelni prikaz napretka pri obradi velikih dokumenata.
- **Dijalekti:** Konverzija Ekavica ↔ Ijekavica (pokreće Rust/WASM engine).
- **Chunking:** Pametna obrada velikih dokumenata u delovima (ne blokira Word UI).
- **Custom Substitutions:** Mogućnost definisanja sopstvenih pravila za zamenu teksta.
- **Interaktivni Preview:** Pregled izmena sa mogućnošću odbacivanja pojedinačnih promena.

### Izmenjeno (Changed)

- Optimizovan algoritam za prepoznavanje "Code Block" sekcija.
- Unapređen UI za tamnu temu (Dark Mode).
- Ažurirana "Privacy Policy" stranica - potvrda da podaci ne napuštaju uređaj.

### Ispravljeno (Fixed)

- Rešen problem sa blokiranjem UI-a kod dokumenata većih od 100 strana.
- Ispravljeno procesiranje naslova (Header) i fusnota.
