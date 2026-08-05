import Link from "next/link";
import { Badge, ProjectStatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatUSD, releaseFee } from "@/lib/fees";
import type { Project, UserRole } from "@/lib/types";

export function ProjectListItem({ project, role }: { project: Project; role: UserRole }) {
  const released = project.milestones.filter((m) => m.status === "RELEASED").length;
  const total = project.milestones.length;
  const progress = total === 0 ? 0 : (released / total) * 100;
  const counterparty = role === "CLIENT" ? project.freelancerName : project.clientName;
  const counterpartyLabel = role === "CLIENT" ? "Freelancer" : "Client";
  const earned = project.milestones
    .filter((m) => m.status === "RELEASED")
    .reduce((sum, m) => sum + (m.amount - releaseFee(m.amount)), 0);

  return (
    <Link
      href={`/app/projects/${project.id}`}
      className="block rounded-xl border border-line bg-white p-4 transition-colors hover:border-primary/40 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{project.title}</p>
          <p className="mt-0.5 text-sm text-ink-secondary">
            {counterpartyLabel}: {counterparty}
          </p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <ProgressBar value={progress} className="flex-1" />
        <span className="shrink-0 text-xs font-medium text-ink-secondary">
          {released}/{total} milestones
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        {role === "CLIENT" ? (
          <>
            <p className="text-sm font-semibold text-ink">{formatUSD(project.budget)} budget</p>
            <Badge tone={project.escrowFunded ? "success" : "warning"}>
              {project.escrowFunded ? "Escrow funded" : "Awaiting deposit"}
            </Badge>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-ink">{formatUSD(earned)} earned</p>
            <span className="text-xs text-ink-secondary">{formatUSD(project.budget)} total</span>
          </>
        )}
      </div>
    </Link>
  );
}
