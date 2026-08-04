import { cn } from "@/lib/utils";
import type { MilestoneStatus, PaymentStatus, ProjectStatus } from "@/lib/types";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-primary-light text-primary",
  neutral: "bg-surface text-ink-secondary border border-line",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone]
      )}
    >
      {children}
    </span>
  );
}

const PROJECT_STATUS_TONE: Record<ProjectStatus, Tone> = {
  DRAFT: "neutral",
  AWAITING_DEPOSIT: "warning",
  ACTIVE: "info",
  COMPLETED: "success",
  CANCELLED: "neutral",
  DISPUTED: "danger",
};

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  AWAITING_DEPOSIT: "Awaiting deposit",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={PROJECT_STATUS_TONE[status]}>{PROJECT_STATUS_LABEL[status]}</Badge>;
}

const MILESTONE_STATUS_TONE: Record<MilestoneStatus, Tone> = {
  PENDING: "neutral",
  SUBMITTED: "warning",
  APPROVED: "info",
  RELEASED: "success",
  REJECTED: "danger",
  DISPUTED: "danger",
};

const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  PENDING: "Pending",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  RELEASED: "Released",
  REJECTED: "Changes requested",
  DISPUTED: "Disputed",
};

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  return <Badge tone={MILESTONE_STATUS_TONE[status]}>{MILESTONE_STATUS_LABEL[status]}</Badge>;
}

const PAYMENT_STATUS_TONE: Record<PaymentStatus, Tone> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "danger",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_STATUS_TONE[status]}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
}
