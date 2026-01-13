import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("textCore.ts - coverage edge branches", () => {
  it("protectRomanToken: Petar IV -> Петар IV (IV ne sme postati ИВ)", () => {
    const { text, type } = convertPlainText("Petar IV", "lat-to-cyr");

    expect(type).toBe("Lat → Ćir");
    expect(text).toBe("Петар IV");
    expect(text).not.toContain("ИВ");
  });

  it("protectRomanToken: V vek -> V век (V ne sme postati В)", () => {
    const { text, type } = convertPlainText("V vek", "lat-to-cyr");

    expect(type).toBe("Lat → Ćir");
    expect(text).toBe("V век");
    expect(text).not.toBe("В век");
  });

  it("roman bez konteksta se NE štiti: DIV test -> ДИВ тест", () => {
    const { text, type } = convertPlainText("DIV test", "lat-to-cyr");

    expect(type).toBe("Lat → Ćir");
    expect(text).toBe("ДИВ тест");
  });

  it("STRONG_FOREIGN (Q/W/X/Y) čuva ceo token: Qwerty test -> Qwerty тест", () => {
    const { text, type } = convertPlainText("Qwerty test", "lat-to-cyr");

    expect(type).toBe("Lat → Ćir");
    expect(text).toBe("Qwerty тест");
    expect(text).not.toContain("Qwер"); // indikacija parcijalne transliteracije
  });

  it("hasForeignLetter: Müller test ostaje Müller test (ne sme postati Мüller)", () => {
    const { text, type } = convertPlainText("Müller test", "lat-to-cyr");

    expect(type).toBe("Lat → Ćir");
    expect(text).toBe("Müller тест");
    expect(text).not.toContain("Мüller");
  });

  it("isMixedCaseBrandy: fooBar ostaje fooBar (ne sme postati фооБар)", () => {
    const { text, type } = convertPlainText("fooBar test", "lat-to-cyr");

    expect(type).toBe("Lat → Ćir");
    expect(text).toBe("fooBar тест");
    expect(text).not.toContain("фооБар");
  });

  it("isHashLike: 1a2b3c4d ostaje ASCII (ne sme postati 1а2...)", () => {
    const { text, type } = convertPlainText("1a2b3c4d test", "lat-to-cyr");

    expect(type).toBe("Lat → Ćir");
    expect(text).toBe("1a2b3c4d тест");
    expect(text).not.toContain("1а2"); // 'а' (ćirilica) bi značilo da je preslovljeno
  });
});
