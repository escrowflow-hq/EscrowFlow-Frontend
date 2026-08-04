import { describe, expect, it } from "vitest";
import { authService, AuthError } from "@/services/auth.service";

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
    await expect(authService.register("  ", "alex@example.com", "password123")).rejects.toThrow(
      /enter your full name/i
    );
  });

  it("rejects an invalid email", async () => {
    await expect(authService.register("Alex Rivera", "not-an-email", "password123")).rejects.toBeInstanceOf(
      AuthError
    );
  });

  it("resolves with a user and token for valid input", async () => {
    const result = await authService.register("Alex Rivera", "alex@example.com", "password123");

    expect(result.user.name).toBe("Alex Rivera");
    expect(result.user.email).toBe("alex@example.com");
    expect(result.token).toEqual(expect.any(String));
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
