import { API_URL, USE_MOCK } from "@/lib/config";
import { upsertUserForAuth } from "@/lib/mock/service";
import type { User, UserRole } from "@/lib/types";

export interface AuthResult {
  user: User;
  token: string;
}

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

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return (body && typeof body.message === "string" && body.message) || fallback;
}

async function login(email: string, password: string): Promise<AuthResult> {
  assertEmail(email);
  assertPassword(password);

  if (USE_MOCK) {
    await delay(400);
    const name = email.split("@")[0] || "Member";
    // Login doesn't collect a role. If this email already has an account in
    // the shared mock backend (from signup, an earlier login, or being
    // invited onto a project), that account — and its role — is reused as-is;
    // otherwise a new CLIENT account is provisioned.
    return {
      user: upsertUserForAuth(email, name.charAt(0).toUpperCase() + name.slice(1), "CLIENT"),
      token: mockToken(email),
    };
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
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

export const authService = { login, register, requestPasswordReset };
