import { describe, expect, it } from "vitest";
import { isValidEmail, isValidUsdcAmount, sanitizeText } from "@/lib/validation";

describe("isValidEmail", () => {
  it("accepts a well-formed email", () => {
    expect(isValidEmail("alex@example.com")).toBe(true);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(isValidEmail("  alex@example.com  ")).toBe(true);
  });

  it.each(["not-an-email", "missing@domain", "@example.com", ""])("rejects %s", (value) => {
    expect(isValidEmail(value)).toBe(false);
  });
});

describe("isValidUsdcAmount", () => {
  it("accepts a positive amount within the cap", () => {
    expect(isValidUsdcAmount(500)).toBe(true);
  });

  it("rejects zero, negative, non-finite, and over-the-cap amounts", () => {
    expect(isValidUsdcAmount(0)).toBe(false);
    expect(isValidUsdcAmount(-10)).toBe(false);
    expect(isValidUsdcAmount(NaN)).toBe(false);
    expect(isValidUsdcAmount(Infinity)).toBe(false);
    expect(isValidUsdcAmount(1_000_001)).toBe(false);
  });

  it("accepts exactly the cap", () => {
    expect(isValidUsdcAmount(1_000_000)).toBe(true);
  });
});

describe("sanitizeText", () => {
  it("trims surrounding whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });

  it("strips control characters", () => {
    expect(sanitizeText("hello\x00world\x7F")).toBe("helloworld");
  });

  it("leaves normal punctuation and unicode untouched", () => {
    expect(sanitizeText("Café — 50% done!")).toBe("Café — 50% done!");
  });
});
