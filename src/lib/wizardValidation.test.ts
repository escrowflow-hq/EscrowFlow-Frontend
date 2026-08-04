import { describe, expect, it } from "vitest";
import {
  milestonesAreValid,
  validateDetails,
  validateFreelancerEmail,
  validateMilestone,
} from "@/lib/wizardValidation";

describe("validateDetails", () => {
  it("requires a title of at least 3 characters", () => {
    expect(validateDetails("ab", "A long enough description").title).toBeDefined();
    expect(validateDetails("Website build", "A long enough description").title).toBeUndefined();
  });

  it("requires a description of at least 10 characters", () => {
    expect(validateDetails("Website build", "short").description).toBeDefined();
    expect(validateDetails("Website build", "A long enough description").description).toBeUndefined();
  });
});

describe("validateFreelancerEmail", () => {
  it("rejects empty email", () => {
    expect(validateFreelancerEmail("")).toBeDefined();
  });

  it("rejects malformed email", () => {
    expect(validateFreelancerEmail("not-an-email")).toBeDefined();
  });

  it("accepts a valid email", () => {
    expect(validateFreelancerEmail("freelancer@example.com")).toBeUndefined();
  });
});

describe("validateMilestone / milestonesAreValid", () => {
  it("requires a title and a positive amount", () => {
    const errors = validateMilestone({ title: "", description: "", amount: "0" });
    expect(errors.title).toBeDefined();
    expect(errors.amount).toBeDefined();
  });

  it("accepts a valid milestone", () => {
    const errors = validateMilestone({ title: "Design phase", description: "Wireframes", amount: "250" });
    expect(errors.title).toBeUndefined();
    expect(errors.amount).toBeUndefined();
  });

  it("rejects an empty milestone list", () => {
    expect(milestonesAreValid([])).toBe(false);
  });

  it("is valid only when every milestone passes validation", () => {
    expect(
      milestonesAreValid([
        { title: "Design phase", description: "", amount: "250" },
        { title: "", description: "", amount: "100" },
      ])
    ).toBe(false);

    expect(
      milestonesAreValid([
        { title: "Design phase", description: "", amount: "250" },
        { title: "Build phase", description: "", amount: "100" },
      ])
    ).toBe(true);
  });
});
