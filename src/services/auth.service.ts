import { API_URL, APPLE_CLIENT_ID, GOOGLE_CLIENT_ID, USE_MOCK } from "@/lib/config";
import { findUserByEmail, upsertUserForAuth } from "@/lib/mock/service";
import { OAuthVerificationError, verifyAppleIdToken, verifyGoogleIdToken } from "@/lib/oauth/verify";
import type { User, UserRole } from "@/lib/types";

export interface AuthResult {
  user: User;
  token: string;
}

export type OAuthProvider = "google" | "apple";

export class AuthError extends Error {}

function assertEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthError("Enter a valid email address");
  }
}

function assertPassword(password: string) {
  if (password.length < 8) {
    throw new AuthError("Password must be at least 8 characters");
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockToken(email: string): string {
  return `mock-${Math.random().toString(36).slice(2)}-${Date.now()}-${email.length}`;
}

const ROLE_LABEL: Record<UserRole, string> = { CLIENT: "Client", FREELANCER: "Freelancer" };

// Role is fixed on an account from the moment it's created — the selector on
// login/OAuth is a real precondition, not a cosmetic default, so a mismatch
// against an existing account is rejected rather than silently honored (which
// would let a login form quietly relabel someone's account) or silently
// ignored (which would make the selector pointless).
function assertRoleMatches(existingRole: UserRole | undefined, expectedRole: UserRole) {
  if (existingRole && existingRole !== expectedRole) {
    throw new AuthError(
      `This account is registered as a ${ROLE_LABEL[existingRole]}. Select ${ROLE_LABEL[existingRole]} to continue.`
    );
  }
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return (body && typeof body.message === "string" && body.message) || fallback;
}

async function login(email: string, password: string, expectedRole: UserRole): Promise<AuthResult> {
  assertEmail(email);
  assertPassword(password);

  if (USE_MOCK) {
    await delay(400);
    assertRoleMatches(findUserByEmail(email)?.role, expectedRole);
    const name = email.split("@")[0] || "Member";
    // If this email already has an account in the shared mock backend (from
    // signup, an earlier login, or being invited onto a project), that
    // account is reused as-is; otherwise a new account is provisioned with
    // the selected role.
    return {
      user: upsertUserForAuth(email, name.charAt(0).toUpperCase() + name.slice(1), expectedRole),
      token: mockToken(email),
    };
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: expectedRole }),
  });
  if (!res.ok) {
    throw new AuthError(await parseErrorMessage(res, "Invalid email or password"));
  }
  return res.json();
}

async function register(name: string, email: string, password: string, role: UserRole): Promise<AuthResult> {
  if (!name.trim()) {
    throw new AuthError("Enter your full name");
  }
  assertEmail(email);
  assertPassword(password);

  if (USE_MOCK) {
    await delay(400);
    // Role is immutable once an account exists — if this email was already
    // registered (or seeded, or invited onto a project as a freelancer), the
    // requested role is ignored in favor of the account's existing one.
    return { user: upsertUserForAuth(email, name.trim(), role), token: mockToken(email) };
  }

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.ok) {
    throw new AuthError(await parseErrorMessage(res, "Could not create your account"));
  }
  return res.json();
}

/**
 * Handles both "sign in with Google/Apple" and "sign up with Google/Apple" —
 * there's no separate endpoint for each because the shared mock backend's
 * upsertUserForAuth() already does the right thing either way: an existing
 * account is logged into as-is, a new email is provisioned with
 * `expectedRole` (whichever the page's role selector is set to). A mismatch
 * against an existing account is rejected — see assertRoleMatches.
 */
async function oauthAuthenticate(
  provider: OAuthProvider,
  idToken: string,
  expectedRole: UserRole,
  nameHint?: string
): Promise<AuthResult> {
  let identity;
  try {
    identity =
      provider === "google"
        ? await verifyGoogleIdToken(idToken, GOOGLE_CLIENT_ID)
        : await verifyAppleIdToken(idToken, APPLE_CLIENT_ID);
  } catch (err) {
    throw err instanceof OAuthVerificationError ? new AuthError(err.message) : err;
  }

  if (!identity.emailVerified) {
    throw new AuthError("Your email address isn't verified with your provider yet");
  }

  const name = (nameHint || identity.name || identity.email.split("@")[0] || "Member").trim();

  if (USE_MOCK) {
    await delay(300);
    assertRoleMatches(findUserByEmail(identity.email)?.role, expectedRole);
    return { user: upsertUserForAuth(identity.email, name, expectedRole), token: mockToken(identity.email) };
  }

  const res = await fetch(`${API_URL}/auth/oauth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, idToken, name, role: expectedRole }),
  });
  if (!res.ok) {
    throw new AuthError(await parseErrorMessage(res, "Could not sign in"));
  }
  return res.json();
}

async function requestPasswordReset(email: string): Promise<void> {
  assertEmail(email);

  if (USE_MOCK) {
    await delay(400);
    return;
  }

  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new AuthError(await parseErrorMessage(res, "Could not send the reset email"));
  }
}

export const authService = { login, register, oauthAuthenticate, requestPasswordReset };
