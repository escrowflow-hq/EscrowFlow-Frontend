"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuthStore } from "@/store/auth.store";

const AUTH_ROUTES = ["/app/login", "/app/signup", "/app/register", "/app/onboarding", "/app/forgot-password"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Auth state lives in localStorage, which the server can't read, so the store
  // starts "not hydrated" on both the server and the client's first render (see
  // auth.store.ts). Only pull the persisted state in after mount, once hydration
  // is guaranteed not to cause a mismatch with the server-rendered HTML.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hasHydrated || isAuthRoute) return;
    if (!isAuthenticated) {
      router.push("/app/login");
    }
  }, [hasHydrated, isAuthenticated, isAuthRoute, router]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!hasHydrated) {
    return <Splash />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
