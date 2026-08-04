"use client";

import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "CLIENT", label: "Client" },
  { value: "FREELANCER", label: "Freelancer" },
];

export function RoleSwitcher({ className }: { className?: string }) {
  const viewRole = useAppStore((s) => s.viewRole);
  const setViewRole = useAppStore((s) => s.setViewRole);

  return (
    <div
      role="tablist"
      aria-label="View as"
      className={cn("inline-flex rounded-xl border border-line bg-surface p-1", className)}
    >
      {ROLES.map((role) => {
        const isActive = viewRole === role.value;
        return (
          <button
            key={role.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => setViewRole(role.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isActive ? "bg-white text-ink shadow-sm" : "text-ink-secondary hover:text-ink"
            )}
          >
            {role.label}
          </button>
        );
      })}
    </div>
  );
}
