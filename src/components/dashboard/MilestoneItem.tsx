"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { DisputeBadge, MilestoneStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DisputeModal } from "@/components/DisputeModal";
import { formatUSD, releaseFee } from "@/lib/fees";
import { formatDate } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Milestone, UserRole } from "@/lib/types";

export function MilestoneItem({
  milestone,
  viewRole,
  escrowFunded,
}: {
  milestone: Milestone;
  viewRole: UserRole;
  escrowFunded: boolean;
}) {
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"idle" | "submit" | "reject">("idle");
  const [disputeOpen, setDisputeOpen] = useState(false);
  const approveMilestone = useAppStore((s) => s.approveMilestone);
  const requestChanges = useAppStore((s) => s.requestChanges);
  const submitMilestone = useAppStore((s) => s.submitMilestone);
  const dispute = useAppStore((s) =>
    s.state.disputes.find((d) => d.projectId === milestone.projectId && d.milestoneId === milestone.id)
  );
  const error = useAppStore((s) => s.error);

  const canSubmit =
    viewRole === "FREELANCER" && (milestone.status === "PENDING" || milestone.status === "REJECTED");
  const canReview = viewRole === "CLIENT" && milestone.status === "SUBMITTED";
  const fee = releaseFee(milestone.amount);

  return (
    <li className="rounded-xl border border-line bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{milestone.title}</p>
          <p className="mt-1 text-sm text-ink-secondary">{milestone.description}</p>
        </div>
        {milestone.status === "DISPUTED" ? (
          <DisputeBadge onClick={() => setDisputeOpen(true)} />
        ) : (
          <MilestoneStatusBadge status={milestone.status} />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary">
        <span className="font-semibold text-ink">{formatUSD(milestone.amount)}</span>
        <span>Fee on release: {formatUSD(fee)}</span>
        {milestone.submittedAt && <span>Submitted {formatDate(milestone.submittedAt)}</span>}
        {milestone.releasedAt && <span>Released {formatDate(milestone.releasedAt)}</span>}
      </div>

      {milestone.submissionNote && milestone.status === "SUBMITTED" && (
        <p className="mt-3 rounded-lg bg-surface p-3 text-sm text-ink-secondary">
          &ldquo;{milestone.submissionNote}&rdquo;
        </p>
      )}

      {milestone.status === "REJECTED" && milestone.rejectionReason && (
        <p className="mt-3 rounded-lg bg-danger-bg p-3 text-sm text-danger">{milestone.rejectionReason}</p>
      )}

      {canSubmit && !escrowFunded && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-warning-bg p-3 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Escrow isn&apos;t funded yet. The client needs to fund escrow before you can submit work.
        </p>
      )}

      {canSubmit && escrowFunded && (
        <div className="mt-4">
          {mode === "submit" ? (
            <div className="space-y-2">
              <label htmlFor={`note-${milestone.id}`} className="text-sm font-medium text-ink">
                Submission note
              </label>
              <textarea
                id={`note-${milestone.id}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Describe what you're submitting for review"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    submitMilestone(milestone.projectId, milestone.id, note);
                    setMode("idle");
                    setNote("");
                  }}
                  disabled={note.trim().length === 0}
                >
                  Submit for review
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setMode("idle")}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" onClick={() => setMode("submit")}>
              Submit work
            </Button>
          )}
        </div>
      )}

      {canReview && (
        <div className="mt-4">
          {mode === "reject" ? (
            <div className="space-y-2">
              <label htmlFor={`reason-${milestone.id}`} className="text-sm font-medium text-ink">
                What needs to change?
              </label>
              <textarea
                id={`reason-${milestone.id}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Explain what the freelancer should revise"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    requestChanges(milestone.projectId, milestone.id, reason);
                    setMode("idle");
                    setReason("");
                  }}
                  disabled={reason.trim().length === 0}
                >
                  Request changes
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setMode("idle")}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => approveMilestone(milestone.projectId, milestone.id)}>
                Approve & release {formatUSD(milestone.amount - fee)}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setMode("reject")}>
                Request changes
              </Button>
            </div>
          )}
        </div>
      )}

      {error && (canSubmit || canReview) && <p className="mt-2 text-sm text-danger">{error}</p>}

      {disputeOpen && dispute && <DisputeModal dispute={dispute} onClose={() => setDisputeOpen(false)} />}
    </li>
  );
}
