"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { RoleSelector } from "@/components/ui/RoleSelector";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AppleButton } from "@/components/auth/AppleButton";
import { useAuthStore } from "@/store/auth.store";
import { findUserByEmail } from "@/lib/mock/service";
import type { UserRole } from "@/lib/types";

const FIELD_CLASSES =
  "mt-1.5 w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const loginWithProvider = useAuthStore((s) => s.loginWithProvider);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("CLIENT");

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Purely a convenience for a known email — auto-selects the role its
  // account actually has, so most people never need to touch the selector.
  // The account's real role is still what's authoritative on submit (see
  // auth.service.ts's assertRoleMatches); this can't be used to "peek" at
  // someone else's role since it only ever moves the selection, never blocks
  // submission or reveals anything the login attempt itself wouldn't.
  function handleEmailBlur() {
    const existing = findUserByEmail(email.trim());
    if (existing) setRole(existing.role);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await login(email, password, role);
      router.push("/app");
    } catch {
      // error state is surfaced from the store below
    }
  }

  async function handleOAuth(provider: "google" | "apple", idToken: string, nameHint?: string) {
    try {
      await loginWithProvider(provider, idToken, role, nameHint);
      router.push("/app");
    } catch {
      // error state is surfaced from the store below
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-xl border border-line bg-white p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-ink">Log in</h1>
          <p className="mt-1 text-sm text-ink-secondary">Welcome back. Enter your details to continue.</p>

          <div className="mt-6">
            <RoleSelector selected={role} onChange={setRole} />
          </div>

          <div className="space-y-3">
            <GoogleButton onCredential={(idToken) => handleOAuth("google", idToken)} disabled={isLoading} />
            <AppleButton
              onCredential={(idToken, nameHint) => handleOAuth("apple", idToken, nameHint)}
              disabled={isLoading}
            />
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs font-medium uppercase tracking-wide text-ink-secondary">or continue with email</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          {error && (
            <p role="alert" className="mb-4 text-sm text-danger">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={handleEmailBlur}
                className={FIELD_CLASSES}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-ink">
                  Password
                </label>
                <Link href="/app/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={FIELD_CLASSES}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/app/signup" className="font-medium text-primary hover:text-primary-dark">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
