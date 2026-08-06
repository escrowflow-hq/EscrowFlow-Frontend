import { beforeEach, describe, expect, it } from "vitest";
import { __resetMockBackend, createWallet, findUserByEmail, MockServiceError, upsertUserForAuth } from "@/lib/mock/service";

const EMAIL = "wallet-owner@example.com";
const PUBLIC_KEY = "GABCDEXAMPLE0000000000000000000000000000000000000000000";

describe("createWallet", () => {
  beforeEach(() => {
    __resetMockBackend();
    upsertUserForAuth(EMAIL, "Wallet Owner", "FREELANCER");
  });

  it("attaches a public key to an account with no wallet yet", () => {
    expect(findUserByEmail(EMAIL)?.walletAddress).toBe("");

    createWallet(EMAIL, PUBLIC_KEY);

    const user = findUserByEmail(EMAIL);
    expect(user?.walletAddress).toBe(PUBLIC_KEY);
    expect(user?.walletCreatedAt).toBeDefined();
  });

  it("refuses to overwrite an existing wallet", () => {
    createWallet(EMAIL, PUBLIC_KEY);

    expect(() => createWallet(EMAIL, "GSECONDKEY000000000000000000000000000000000000000000000")).toThrow(
      MockServiceError
    );
  });
});
