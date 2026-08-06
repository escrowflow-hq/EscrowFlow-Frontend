import { describe, expect, it } from "vitest";
import { personalInfoIsValid } from "@/lib/kycValidation";

const VALID = {
  fullName: "Ada Lovelace",
  dateOfBirth: "1990-01-01",
  country: "NG",
  addressLine1: "1 Herbert Macaulay Way",
  city: "Lagos",
  postalCode: "100001",
};

describe("personalInfoIsValid", () => {
  it("accepts a fully filled form", () => {
    expect(personalInfoIsValid(VALID)).toBe(true);
  });

  it.each(["fullName", "dateOfBirth", "country", "addressLine1", "city", "postalCode"] as const)(
    "rejects a missing %s",
    (field) => {
      expect(personalInfoIsValid({ ...VALID, [field]: "" })).toBe(false);
    }
  );

  it("rejects whitespace-only text fields", () => {
    expect(personalInfoIsValid({ ...VALID, fullName: "   " })).toBe(false);
  });
});
