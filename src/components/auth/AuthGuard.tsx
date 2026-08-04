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
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    if (!hasHydrated || isAuthRoute) return;
    if (!isAuthenticated) {
      router.push("/app/login");
    }
  }, [hasHydrated, isAuthenticated, isAuthRoute, router]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
