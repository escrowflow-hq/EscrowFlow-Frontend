// jose's WebCrypto signing path checks `instanceof Uint8Array` against the
// realm's global constructor — under jsdom that's a different Uint8Array
// than Node's, so cross-realm signing fails with a confusing type error.
// Forcing the Node environment for this file keeps everything in one realm.
// @vitest-environment node

import { describe, expect, it } from "vitest";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import { OAuthVerificationError, verifyAppleIdToken, verifyGoogleIdToken } from "@/lib/oauth/verify";

const KID = "test-key";

async function buildTestJWKS() {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const jwk = await exportJWK(publicKey);
  jwk.kid = KID;
  jwk.alg = "RS256";
  jwk.use = "sig";
  return { privateKey, jwks: createLocalJWKSet({ keys: [jwk] }) };
}

async function signToken(
  privateKey: Awaited<ReturnType<typeof generateKeyPair>>["privateKey"],
  claims: Record<string, unknown>,
  { issuer, audience }: { issuer: string; audience: string }
) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid: KID })
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime("5m")
    .sign(privateKey);
}

describe("verifyGoogleIdToken", () => {
  it("accepts a validly signed token with matching issuer/audience and returns the identity", async () => {
    const { privateKey, jwks } = await buildTestJWKS();
    const token = await signToken(
      privateKey,
      { email: "person@example.com", email_verified: true, name: "Person Example" },
      { issuer: "https://accounts.google.com", audience: "test-client-id" }
    );

    await expect(verifyGoogleIdToken(token, "test-client-id", jwks)).resolves.toEqual({
      email: "person@example.com",
      emailVerified: true,
      name: "Person Example",
    });
  });

  it("rejects a token signed for a different client ID", async () => {
    const { privateKey, jwks } = await buildTestJWKS();
    const token = await signToken(
      privateKey,
      { email: "person@example.com", email_verified: true },
      { issuer: "https://accounts.google.com", audience: "someone-elses-client-id" }
    );

    await expect(verifyGoogleIdToken(token, "test-client-id", jwks)).rejects.toBeInstanceOf(OAuthVerificationError);
  });

  it("rejects a token from an untrusted issuer", async () => {
    const { privateKey, jwks } = await buildTestJWKS();
    const token = await signToken(
      privateKey,
      { email: "person@example.com", email_verified: true },
      { issuer: "https://not-google.example.com", audience: "test-client-id" }
    );

    await expect(verifyGoogleIdToken(token, "test-client-id", jwks)).rejects.toBeInstanceOf(OAuthVerificationError);
  });

  it("rejects a token with no email claim", async () => {
    const { privateKey, jwks } = await buildTestJWKS();
    const token = await signToken(
      privateKey,
      { email_verified: true },
      { issuer: "https://accounts.google.com", audience: "test-client-id" }
    );

    await expect(verifyGoogleIdToken(token, "test-client-id", jwks)).rejects.toBeInstanceOf(OAuthVerificationError);
  });

  it("throws when no client ID is configured, without attempting verification", async () => {
    const { jwks } = await buildTestJWKS();
    await expect(verifyGoogleIdToken("irrelevant-token", "", jwks)).rejects.toBeInstanceOf(OAuthVerificationError);
  });
});

describe("verifyAppleIdToken", () => {
  it("accepts a validly signed token and normalizes the stringly-typed email_verified claim", async () => {
    const { privateKey, jwks } = await buildTestJWKS();
    const token = await signToken(
      privateKey,
      { email: "person@example.com", email_verified: "true" },
      { issuer: "https://appleid.apple.com", audience: "test-services-id" }
    );

    await expect(verifyAppleIdToken(token, "test-services-id", jwks)).resolves.toEqual({
      email: "person@example.com",
      emailVerified: true,
    });
  });

  it("rejects a token from an untrusted issuer", async () => {
    const { privateKey, jwks } = await buildTestJWKS();
    const token = await signToken(
      privateKey,
      { email: "person@example.com", email_verified: "true" },
      { issuer: "https://not-apple.example.com", audience: "test-services-id" }
    );

    await expect(verifyAppleIdToken(token, "test-services-id", jwks)).rejects.toBeInstanceOf(OAuthVerificationError);
  });
});
