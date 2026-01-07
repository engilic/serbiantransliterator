import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("Opcije core engine-a (protectBrands, applySerbianQuotes, direction)", () => {
  it("protectBrands: kada je uključen, 'Pro' ostaje latinicom", () => {
    const input = "Pro";

    const { text, type } = convertPlainText(input, "lat-to-cyr", {
      protectBrands: true,
    });

    // Smer je forsiran Lat → Ćir
    expect(type).toBe("Lat → Ćir");
    // "Pro" je u ALWAYS_LATIN i kada je protectBrands = true, mora ostati latinicom
    expect(text).toBe("Pro");
  });

  it("protectBrands: kada je isključen, 'Pro' se preslovljava u 'Про'", () => {
    const input = "Pro";

    const { text, type } = convertPlainText(input, "lat-to-cyr", {
      protectBrands: false,
    });

    expect(type).toBe("Lat → Ćir");
    // Sada se "Pro" ne štiti preko ALWAYS_LATIN i prevodi se
    expect(text).toBe("Про");
  });

  it('applySerbianQuotes: kada je uključen, "Test" postaje „Тест”', () => {
    const input = `"Test"`;

    const { text, type } = convertPlainText(input, "lat-to-cyr", {
      applySerbianQuotes: true,
    });

    expect(type).toBe("Lat → Ćir");
    // Očekujemo srpske navodnike oko ćiriličnog teksta
    expect(text).toBe("„Тест”");
  });

  it('applySerbianQuotes: kada je isključen, "Test" ostaje sa ASCII navodnicima', () => {
    const input = `"Test"`;

    const { text, type } = convertPlainText(input, "lat-to-cyr", {
      applySerbianQuotes: false,
    });

    expect(type).toBe("Lat → Ćir");

    // Tekst treba da bude u ćirilici, ali navodnici ostaju ASCII "
    // Zavisi od trenutne implementacije fixQuotes – ovde proveravamo da NEMA srpskih navodnika
    expect(text).not.toContain("„");
    expect(text).not.toContain("”");
    expect(text).toContain("Тест");
  });

  it("direction override: 'Zdravo' uz direction='cyr-to-lat' se NE SME promeniti (jer nije ćirilica)", () => {
    const input = "Zdravo";

    const { text, type } = convertPlainText(input, "cyr-to-lat");

    // Forsiran je smer Ćir → Lat, ali ulaz je već latinica,
    // tako da se transliteracija neće promeniti tekst (mapiranje latinice na latinicu ne radi ništa).
    expect(type).toBe("Ćir → Lat");
    expect(text).toBe("Zdravo");
  });

  it("direction override: 'Здраво' uz direction='lat-to-cyr' se NE SME promeniti (jer već jeste ćirilica)", () => {
    const input = "Здраво";

    const { text, type } = convertPlainText(input, "lat-to-cyr");

    // Forsiran je smer Lat → Ćir, ali ulaz je već ćirilica.
    // Mape rade karakter-po-karakter, ali ćirilična slova ne mapiraju na ništa drugo u ovom smeru.
    expect(type).toBe("Lat → Ćir");
    expect(text).toBe("Здраво");
  });
});