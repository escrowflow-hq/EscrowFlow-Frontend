"use client";

import { Logo } from "@/components/Logo";
import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomTabs } from "@/components/dashboard/BottomTabs";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-6 lg:hidden">
          <Logo />
          <RoleSwitcher />
        </header>
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <BottomTabs />
      </div>
    </div>
  );
}
