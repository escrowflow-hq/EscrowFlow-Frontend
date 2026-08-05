import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

export class OAuthVerificationError extends Error {}

export interface VerifiedIdentity {
  email: string;
  emailVerified: boolean;
  /** Only Google's ID token carries a name; Apple's does not (see apple.ts). */
  name?: string;
}

const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const APPLE_ISSUER = "https://appleid.apple.com";

// This app has no backend of its own (see lib/config.ts's USE_MOCK), so
// verification happens here in the browser instead of on a server. That's
// still real cryptographic proof — jose fetches each provider's public keys
// and checks the token's signature, issuer, audience, and expiry, so a
// forged or tampered token is rejected — but a production deployment with a
// real backend should move this verification server-side, where a
// compromised client bundle can't be made to skip it. These functions accept
// an injected JWKS for exactly that migration (or for testing).
const googleJWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const appleJWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

async function verifyIdToken(
  idToken: string,
  jwks: JWTVerifyGetKey,
  issuer: string | string[],
  audience: string
): Promise<Record<string, unknown>> {
  if (!audience) {
    throw new OAuthVerificationError("Sign-in isn't configured (missing client ID)");
  }
  try {
    const { payload } = await jwtVerify(idToken, jwks, { issuer, audience });
    return payload;
  } catch {
    throw new OAuthVerificationError("Could not verify sign-in with this provider");
  }
}

export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string,
  jwks: JWTVerifyGetKey = googleJWKS
): Promise<VerifiedIdentity> {
  const payload = await verifyIdToken(idToken, jwks, GOOGLE_ISSUERS, clientId);
  const email = typeof payload.email === "string" ? payload.email : undefined;
  if (!email) throw new OAuthVerificationError("This Google account has no email on file");

  return {
    email,
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === "string" ? payload.name : undefined,
  };
}

export async function verifyAppleIdToken(
  idToken: string,
  clientId: string,
  jwks: JWTVerifyGetKey = appleJWKS
): Promise<VerifiedIdentity> {
  const payload = await verifyIdToken(idToken, jwks, APPLE_ISSUER, clientId);
  const email = typeof payload.email === "string" ? payload.email : undefined;
  if (!email) throw new OAuthVerificationError("This Apple account has no email on file");

  return {
    email,
    // Apple sends this as the string "true"/"false" on some token versions.
    emailVerified: payload.email_verified === true || payload.email_verified === "true",
  };
}
