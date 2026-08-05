import { beforeEach, describe, expect, it, vi } from "vitest";
import { authService, AuthError } from "@/services/auth.service";
import { __resetMockBackend } from "@/lib/mock/service";

// The real verifiers do genuine cryptographic verification against each
// provider's live JWKS (see lib/oauth/verify.test.ts for that) — here we
// stub them so these tests exercise authService's own orchestration (role
// handling on new vs. existing accounts, unverified-email rejection, error
// mapping) without depending on the network.
vi.mock("@/lib/oauth/verify", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/oauth/verify")>();
  return { ...actual, verifyGoogleIdToken: vi.fn(), verifyAppleIdToken: vi.fn() };
});

import { verifyAppleIdToken, verifyGoogleIdToken, OAuthVerificationError } from "@/lib/oauth/verify";

const mockedVerifyGoogle = vi.mocked(verifyGoogleIdToken);
const mockedVerifyApple = vi.mocked(verifyAppleIdToken);

beforeEach(() => {
  // authService resolves identities through the shared mock backend, which
  // persists by email — reset it so tests reusing the same address don't see
  // an account left over from an earlier test.
  __resetMockBackend();
  mockedVerifyGoogle.mockReset();
  mockedVerifyApple.mockReset();
});

describe("authService.login", () => {
  it("rejects an invalid email", async () => {
    await expect(authService.login("not-an-email", "password123")).rejects.toBeInstanceOf(AuthError);
  });

  it("rejects a short password", async () => {
    await expect(authService.login("alex@example.com", "short")).rejects.toThrow(/at least 8 characters/);
  });

  it("resolves with a user and token for valid credentials", async () => {
    const result = await authService.login("alex@example.com", "password123");

    expect(result.user.email).toBe("alex@example.com");
    expect(result.user.name).toBe("Alex");
    expect(result.token).toEqual(expect.any(String));
    expect(result.token.length).toBeGreaterThan(0);
  });
});

describe("authService.register", () => {
  it("rejects an empty name", async () => {
    await expect(authService.register("  ", "alex@example.com", "password123", "CLIENT")).rejects.toThrow(
      /enter your full name/i
    );
  });

  it("rejects an invalid email", async () => {
    await expect(
      authService.register("Alex Rivera", "not-an-email", "password123", "CLIENT")
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("resolves with a user and token for valid input", async () => {
    const result = await authService.register("Alex Rivera", "alex@example.com", "password123", "CLIENT");

    expect(result.user.name).toBe("Alex Rivera");
    expect(result.user.email).toBe("alex@example.com");
    expect(result.user.role).toBe("CLIENT");
    expect(result.token).toEqual(expect.any(String));
  });

  it("sets the freelancer role when selected", async () => {
    const result = await authService.register("Sam Lee", "sam@example.com", "password123", "FREELANCER");

    expect(result.user.role).toBe("FREELANCER");
  });
});

describe("authService.oauthAuthenticate", () => {
  it("provisions a new account with the given role when the email hasn't been seen before", async () => {
    mockedVerifyGoogle.mockResolvedValue({
      email: "new-oauth-user@example.com",
      emailVerified: true,
      name: "New User",
    });

    const result = await authService.oauthAuthenticate("google", "fake-token", "FREELANCER");

    expect(result.user.email).toBe("new-oauth-user@example.com");
    expect(result.user.name).toBe("New User");
    expect(result.user.role).toBe("FREELANCER");
    expect(result.token).toEqual(expect.any(String));
  });

  it("falls back to a name derived from the email when the provider doesn't supply one", async () => {
    mockedVerifyApple.mockResolvedValue({ email: "no-name@example.com", emailVerified: true });

    const result = await authService.oauthAuthenticate("apple", "fake-token", "CLIENT");

    expect(result.user.name).toBe("no-name");
  });

  it("logs into an existing account and leaves its role untouched", async () => {
    mockedVerifyGoogle.mockResolvedValue({ email: "repeat@example.com", emailVerified: true, name: "Repeat User" });
    const first = await authService.oauthAuthenticate("google", "fake-token", "CLIENT");
    expect(first.user.role).toBe("CLIENT");

    const second = await authService.oauthAuthenticate("google", "fake-token", "FREELANCER");
    expect(second.user.role).toBe("CLIENT");
    expect(second.user.email).toBe(first.user.email);
  });

  it("rejects sign-in when the provider reports an unverified email", async () => {
    mockedVerifyApple.mockResolvedValue({ email: "unverified@example.com", emailVerified: false });

    await expect(authService.oauthAuthenticate("apple", "fake-token", "CLIENT")).rejects.toBeInstanceOf(AuthError);
  });

  it("wraps token verification failures as AuthError", async () => {
    mockedVerifyGoogle.mockRejectedValue(new OAuthVerificationError("Could not verify sign-in with this provider"));

    await expect(authService.oauthAuthenticate("google", "bad-token", "CLIENT")).rejects.toBeInstanceOf(AuthError);
  });
});

describe("authService.requestPasswordReset", () => {
  it("rejects an invalid email", async () => {
    await expect(authService.requestPasswordReset("not-an-email")).rejects.toBeInstanceOf(AuthError);
  });

  it("resolves for a valid email", async () => {
    await expect(authService.requestPasswordReset("alex@example.com")).resolves.toBeUndefined();
  });
});
