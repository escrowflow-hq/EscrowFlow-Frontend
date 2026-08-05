"use client";

import { useEffect, useState } from "react";
import { Download, FolderKanban, Plus, Upload } from "lucide-react";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { ProjectListItem } from "@/components/dashboard/ProjectListItem";
import { PaymentListItem } from "@/components/dashboard/PaymentListItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { projectsForRole, useAppStore } from "@/lib/store";
import { useAuthStore } from "@/store/auth.store";
import { computeWalletSummary } from "@/lib/mock/service";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-line/60 ${className ?? ""}`} />;
}

export default function OverviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const state = useAppStore((s) => s.state);
  const userRole = useAuthStore((s) => s.userRole);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const wallet = computeWalletSummary(state);
  const projects = projectsForRole(state, userRole);
  const recentPayments = [...state.payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Overview</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {userRole === "CLIENT" ? "Manage your projects and escrow." : "Track your projects and earnings."}
        </p>
      </div>

      <BalanceCard wallet={wallet} />

      <div className="flex flex-wrap gap-3">
        {userRole === "CLIENT" && (
          <LinkButton href="/app/projects/new" size="md">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create project
          </LinkButton>
        )}
        <LinkButton href="/app/wallet" variant="secondary" size="md">
          <Upload className="h-4 w-4" aria-hidden="true" />
          Withdraw
        </LinkButton>
        {userRole === "CLIENT" && (
          <LinkButton href="/app/wallet" variant="secondary" size="md">
            <Download className="h-4 w-4" aria-hidden="true" />
            Deposit
          </LinkButton>
        )}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Projects</h2>
        </div>
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description={
              userRole === "CLIENT"
                ? "Create your first project to start funding escrow and working with a freelancer."
                : "Projects you're hired on will show up here once a client adds you."
            }
            action={
              userRole === "CLIENT" ? (
                <LinkButton href="/app/projects/new" size="sm">
                  Create project
                </LinkButton>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectListItem key={project.id} project={project} role={userRole} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">Recent payments</h2>
        {recentPayments.length === 0 ? (
          <EmptyState
            icon={Download}
            title="No payments yet"
            description="Payments from milestone releases, deposits, and withdrawals will appear here."
          />
        ) : (
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <PaymentListItem key={payment.id} payment={payment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
