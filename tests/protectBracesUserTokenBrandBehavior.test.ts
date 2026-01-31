// tests/protectBracesUserTokenBrandBehavior.test.ts

import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("curly braces + protectBrands interaction: USER token stays latin", () => {
    it("curlyProtection='none' does not protect braces, but protectBrands=true keeps USER latin due to ALWAYS_LATIN (User)", () => {
        // Ključ: curlyProtection='none' znači da { ... } nije protected range,
        // ali i dalje prolazi kroz token pipeline gde protectBrands štiti ALWAYS_LATIN tokene.
        const r = convertPlainText("Ovo je {USER_NAME} test", "lat-to-cyr", {
            curlyProtection: "none",
            protectBrands: true, // default, eksplicitno zbog čitljivosti testa
        });

        // Očekivanje:
        // - "Ovo je" -> "Ово је"
        // - USER ostaje latinicom (ALWAYS_LATIN sadrži "User")
        // - NAME se preslovljava u "НАМЕ"
        // - underscore i braces ostaju
        expect(r.text).toBe("Ово је {USER_НАМЕ} тест");
    });

    it("same input, but protectBrands=false transliterates USER too", () => {
        const r = convertPlainText("Ovo je {USER_NAME} test", "lat-to-cyr", {
            curlyProtection: "none",
            protectBrands: false,
        });

        expect(r.text).toBe("Ово је {УСЕР_НАМЕ} тест");
    });
});
