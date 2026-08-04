import { API_URL, USE_MOCK } from "@/lib/config";
import type { User } from "@/lib/types";

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

function mockUser(name: string, email: string): User {
  return {
    id: `user-${Date.now()}`,
    name,
    email,
    role: "CLIENT",
    kycStatus: "NOT_STARTED",
    walletAddress: "",
    avatarColor: "#3B6DF5",
    createdAt: new Date().toISOString(),
    notificationPreferences: {
      milestoneUpdates: true,
      payments: true,
      messages: true,
      marketing: false,
    },
  };
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
    return {
      user: mockUser(name.charAt(0).toUpperCase() + name.slice(1), email),
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

async function register(name: string, email: string, password: string): Promise<AuthResult> {
  if (!name.trim()) {
    throw new AuthError("Enter your full name");
  }
  assertEmail(email);
  assertPassword(password);

  if (USE_MOCK) {
    await delay(400);
    return { user: mockUser(name.trim(), email), token: mockToken(email) };
  }

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    throw new AuthError(await parseErrorMessage(res, "Could not create your account"));
  }
  return res.json();
}

export const authService = { login, register };
