"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { logError } from "@/lib/errors";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logError(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-semibold text-ink">Something went wrong</h1>
      <p className="max-w-sm text-ink-secondary">
        An unexpected error occurred. You can try again, or head back to the dashboard.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
        <Button onClick={() => window.location.assign("/")}>Back to home</Button>
      </div>
    </div>
  );
}
