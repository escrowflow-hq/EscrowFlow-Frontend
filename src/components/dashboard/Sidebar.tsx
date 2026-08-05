"use client";

import { LayoutDashboard, LogOut, Settings, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";

const NAV_ITEMS = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/wallet", label: "Wallet", icon: Wallet },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.state.currentUser);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-line px-6">
        <Logo />
      </div>
      <nav className="flex-1 px-3 py-4" aria-label="Dashboard">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-primary-light text-primary" : "text-ink-secondary hover:bg-surface hover:text-ink"
                  )}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3">
          <Avatar name={currentUser.name} color={currentUser.avatarColor} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{currentUser.name}</p>
            <p className="truncate text-xs text-ink-secondary">{currentUser.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            title="Log out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface hover:text-ink"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
