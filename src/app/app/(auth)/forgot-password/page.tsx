"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";

const FIELD_CLASSES =
  "mt-1.5 w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default function ForgotPasswordPage() {
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
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
          {submitted ? (
            <>
              <h1 className="text-xl font-semibold text-ink">Check your email</h1>
              <p className="mt-2 text-sm text-ink-secondary">
                If an account exists for <span className="font-medium text-ink">{email}</span>, we&apos;ve sent a
                link to reset your password.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-ink">Reset your password</h1>
              <p className="mt-1 text-sm text-ink-secondary">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
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

                {error && (
                  <p role="alert" className="text-sm text-danger">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-ink-secondary">
            <Link href="/app/login" className="font-medium text-primary hover:text-primary-dark">
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
