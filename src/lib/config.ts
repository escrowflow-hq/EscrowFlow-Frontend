export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web
// application). Add http://localhost:3000 as an authorized JavaScript origin
// to test locally.
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// Apple Developer → Certificates, IDs & Profiles → Identifiers → Services ID,
// with "Sign in with Apple" enabled. Apple requires a verified HTTPS domain
// and rejects localhost outright, so this (and APPLE_REDIRECT_URI) can only
// be exercised end-to-end once deployed.
export const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? "";
export const APPLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ?? "";

// Stellar network EscrowFlow's Soroban contracts are deployed to, and the
// contract IDs the app talks to once on-chain escrow is wired up.
export const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";
export const STELLAR_CONTRACT_ID = process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID ?? "";
export const USDC_CONTRACT_ID = process.env.NEXT_PUBLIC_USDC_CONTRACT_ID ?? "";

export const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID ?? "";
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";

export const FEATURE_KYC_ENABLED = process.env.NEXT_PUBLIC_FEATURE_KYC === "true";
export const FEATURE_MESSAGING_ENABLED = process.env.NEXT_PUBLIC_FEATURE_MESSAGING === "true";

export const APP_NAME = "EscrowFlow";
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
export const ENVIRONMENT = process.env.NODE_ENV ?? "development";

// Contract IDs are only load-bearing once Soroban escrow replaces the mock
// backend; don't hard-fail production builds on them until that lands.
if (ENVIRONMENT === "production" && !USE_MOCK) {
  const required = { STELLAR_CONTRACT_ID, USDC_CONTRACT_ID };
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      throw new Error(`Missing required environment variable: NEXT_PUBLIC_${key}`);
    }
  }
}
