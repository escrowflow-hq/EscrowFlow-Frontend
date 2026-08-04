"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProjectStatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { MilestoneItem } from "@/components/dashboard/MilestoneItem";
import { ChatThread } from "@/components/dashboard/ChatThread";
import { FileList } from "@/components/dashboard/FileList";
import { formatUSD } from "@/lib/fees";
import { formatDate, cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const TABS = ["overview", "milestones", "messages", "files"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  milestones: "Milestones",
  messages: "Messages",
  files: "Files",
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<Tab>("overview");
  const project = useAppStore((s) => s.state.projects.find((p) => p.id === params.id));
  const messages = useAppStore((s) => s.state.messages.filter((m) => m.projectId === params.id));
  const files = useAppStore((s) => s.state.files.filter((f) => f.projectId === params.id));
  const viewRole = useAppStore((s) => s.viewRole);
  const fundEscrow = useAppStore((s) => s.fundEscrow);
  const error = useAppStore((s) => s.error);

  if (!project) {
    notFound();
  }

  const released = project.milestones.filter((m) => m.status === "RELEASED").length;
  const canFundEscrow = viewRole === "CLIENT" && project.status === "AWAITING_DEPOSIT";

  return (
    <div className="space-y-6">
      <Link href="/app" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to projects
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{project.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-secondary">{project.description}</p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      {canFundEscrow && (
        <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning-bg p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Escrow isn&apos;t funded yet</p>
            <p className="text-sm text-ink-secondary">
              Fund escrow with {formatUSD(project.budget)} so {project.freelancerName} can start submitting work.
            </p>
          </div>
          <Button size="sm" onClick={() => fundEscrow(project.id)} className="shrink-0">
            Fund escrow
          </Button>
        </div>
      )}
      {error && canFundEscrow && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t ? "bg-primary-light text-primary" : "text-ink-secondary hover:text-ink"
            )}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="text-xs text-ink-secondary">Budget</p>
            <p className="mt-1 text-xl font-semibold text-ink">{formatUSD(project.budget)}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="text-xs text-ink-secondary">In escrow</p>
            <p className="mt-1 text-xl font-semibold text-ink">{formatUSD(project.escrowBalance)}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="text-xs text-ink-secondary">Milestones released</p>
            <p className="mt-1 text-xl font-semibold text-ink">
              {released}/{project.milestones.length}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 sm:col-span-3">
            <p className="mb-3 text-xs text-ink-secondary">
              {viewRole === "CLIENT" ? "Freelancer" : "Client"}
            </p>
            <div className="flex items-center gap-3">
              <Avatar
                name={viewRole === "CLIENT" ? project.freelancerName : project.clientName}
                size={40}
              />
              <div>
                <p className="font-medium text-ink">
                  {viewRole === "CLIENT" ? project.freelancerName : project.clientName}
                </p>
                <p className="text-sm text-ink-secondary">Project started {formatDate(project.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "milestones" && (
        <ul className="space-y-4">
          {project.milestones
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((milestone) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                viewRole={viewRole}
                escrowFunded={project.escrowFunded}
              />
            ))}
        </ul>
      )}

      {tab === "messages" && <ChatThread projectId={project.id} messages={messages} />}

      {tab === "files" && <FileList projectId={project.id} files={files} />}
    </div>
  );
}
