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
