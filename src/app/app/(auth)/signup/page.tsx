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
import type { UserRole } from "@/lib/types";

const FIELD_CLASSES =
  "mt-1.5 w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default function SignupPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const loginWithProvider = useAuthStore((s) => s.loginWithProvider);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("CLIENT");

  useEffect(() => {
    clearError();
  }, [clearError]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await register(name, email, password, role);
      router.push("/app");
    } catch {
      // error state is surfaced from the store below
    }
  }

  // The role picked above applies regardless of which method finishes the
  // signup — it's only used if this email doesn't already have an account
  // (upsertUserForAuth keeps an existing account's role untouched either way).
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
          <h1 className="text-xl font-semibold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-ink-secondary">Get paid safely for work, anywhere in the world.</p>

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
              <label htmlFor="name" className="text-sm font-medium text-ink">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={FIELD_CLASSES}
              />
            </div>

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
                className={FIELD_CLASSES}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={FIELD_CLASSES}
              />
              <p className="mt-1.5 text-xs text-ink-secondary">Must be at least 8 characters.</p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-secondary">
            Already have an account?{" "}
            <Link href="/app/login" className="font-medium text-primary hover:text-primary-dark">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
