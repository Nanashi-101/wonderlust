import { describe, expect, it } from "vitest";
import { assertPriceMatches, fromMinor, formatMoney, toMinor } from "@/lib/payments/money";

describe("toMinor / fromMinor", () => {
  it("converts a rupee amount to paise", () => {
    expect(toMinor(1499.99, "INR")).toBe(149999);
  });

  it("round-trips exactly for whole-paise amounts", () => {
    for (let i = 0; i < 1000; i++) {
      const rupees = Math.round(Math.random() * 100000) / 100; // 2dp, like a real price
      const minor = toMinor(rupees, "INR");
      expect(fromMinor(minor, "INR")).toBeCloseTo(rupees, 2);
    }
  });

  it("rounds instead of truncating", () => {
    expect(toMinor(10.005, "INR")).toBe(1001); // 1000.5 -> rounds up
  });
});

describe("formatMoney", () => {
  it("formats INR for an Indian locale", () => {
    expect(formatMoney(149999, "INR", "en-IN")).toBe("₹1,499.99");
  });

  it("formats EUR for a French locale with a comma decimal", () => {
    const formatted = formatMoney(150000, "EUR", "fr-FR");
    expect(formatted).toContain("1"); // exact spacing varies by ICU data; just sanity-check it renders
    expect(formatted).toMatch(/1[\s ]?500,00/);
  });

  it("formats USD for en-US", () => {
    expect(formatMoney(150000, "USD", "en-US")).toBe("$1,500.00");
  });
});

describe("assertPriceMatches", () => {
  it("does not throw when amounts match", () => {
    expect(() => assertPriceMatches(1000, 1000)).not.toThrow();
  });

  it("throws on any mismatch, including off-by-one", () => {
    expect(() => assertPriceMatches(1000, 1001)).toThrow(/PRICE_MISMATCH/);
    expect(() => assertPriceMatches(999, 1000)).toThrow(/PRICE_MISMATCH/);
  });
});
