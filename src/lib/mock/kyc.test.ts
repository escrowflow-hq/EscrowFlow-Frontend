import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetMockBackend,
  findUserByEmail,
  MockServiceError,
  setKycStatus,
  submitKyc,
  upsertUserForAuth,
} from "@/lib/mock/service";
import type { KycDocumentType } from "@/lib/types";

const EMAIL = "kyc-applicant@example.com";

const SUBMISSION = {
  fullName: "Ada Lovelace",
  dateOfBirth: "1990-01-01",
  country: "NG",
  addressLine1: "1 Herbert Macaulay Way",
  city: "Lagos",
  postalCode: "100001",
  documentType: "PASSPORT" as KycDocumentType,
};

describe("KYC verification flow", () => {
  beforeEach(() => {
    __resetMockBackend();
    upsertUserForAuth(EMAIL, "Ada Lovelace", "FREELANCER");
  });

  it("starts NOT_STARTED and moves to PENDING on submission", () => {
    expect(findUserByEmail(EMAIL)?.kycStatus).toBe("NOT_STARTED");

    submitKyc(EMAIL, SUBMISSION);

    const user = findUserByEmail(EMAIL);
    expect(user?.kycStatus).toBe("PENDING");
    expect(user?.kycData).toMatchObject(SUBMISSION);
  });

  it("moves from PENDING to APPROVED once a reviewer decides", () => {
    submitKyc(EMAIL, SUBMISSION);
    setKycStatus(EMAIL, "APPROVED");

    expect(findUserByEmail(EMAIL)?.kycStatus).toBe("APPROVED");
  });

  it("cannot be submitted twice while a submission is still pending", () => {
    submitKyc(EMAIL, SUBMISSION);

    expect(() => submitKyc(EMAIL, SUBMISSION)).toThrow(MockServiceError);
  });

  it("cannot be resubmitted once approved", () => {
    submitKyc(EMAIL, SUBMISSION);
    setKycStatus(EMAIL, "APPROVED");

    expect(() => submitKyc(EMAIL, SUBMISSION)).toThrow(MockServiceError);
  });

  it("can be resubmitted after a rejection", () => {
    submitKyc(EMAIL, SUBMISSION);
    setKycStatus(EMAIL, "REJECTED");

    submitKyc(EMAIL, SUBMISSION);

    expect(findUserByEmail(EMAIL)?.kycStatus).toBe("PENDING");
  });
});
