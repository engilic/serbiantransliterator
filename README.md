# Serbian Transliterator (v1.0.0)

Najbrži i najsigurniji način za preslovljavanje ćirilice i latinice u Microsoft Word-u.

Ovaj Office add-in omogućava preslovljavanje selekcije ili celog dokumenta jednim klikom, uz pametnu zaštitu imena, brendova, URL-ova i programskog koda.

Web Mode (Cloudflare Pages):

- `serbiantransliterator.pages.dev`

---

## Key Features (v1.0.0)

- Offline & privatno: tekst se obrađuje lokalno (u Word host-u / browser-u).
- High-performance engine: Rust + WebAssembly.
- Pametna zaštita:
    - URL-ovi i e-mail adrese se prepoznaju i čuvaju.
    - Brendovi i “strane reči” se štite kroz heuristike i rečnike.
    - Tekst unutar code blokova se ne dira.
- Web Batch Mode: prevuci `.docx` u browser i preuzmi obrađen fajl.
- PWA: možeš instalirati aplikaciju (desktop/mobile) za brži pristup.

Napomena: “Ekavica ↔ Ijekavica” ako postoji u UI kao opcija, smatra se beta funkcionalnošću (kvalitet zavisi od teksta i konteksta).

---

## Install / Use

### Option A: Word Add-in (Sideload)

Za lokalni razvoj i testiranje koristi sideload manifest.

1. Instaliraj zavisnosti:
    ```bash
    npm ci
    ```
