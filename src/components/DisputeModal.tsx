"use client";

import { CheckCircle2, Clock, Loader2, Scale, User, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { Dispute, DisputeOutcome } from "@/lib/types";

const OUTCOME_LABEL: Record<DisputeOutcome, string> = {
  CLIENT: "Ruled in favor of the client",
  FREELANCER: "Ruled in favor of the freelancer",
  SPLIT: "Split decision",
};

export function DisputeModal({ dispute, onClose }: { dispute: Dispute; onClose: () => void }) {
  const containerRef = useFocusTrap<HTMLDivElement>(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dispute-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning-bg text-warning">
              <Scale className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 id="dispute-modal-title" className="text-lg font-semibold text-ink">
              Dispute details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-secondary hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2 text-sm text-ink">
            <User className="h-4 w-4 shrink-0 text-ink-secondary" aria-hidden="true" />
            <span>
              Raised by <span className="font-medium">{dispute.initiatorName}</span>
            </span>
          </div>

          <p className="rounded-xl bg-surface p-3 text-sm text-ink-secondary">&ldquo;{dispute.reason}&rdquo;</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-secondary">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Opened {formatDate(dispute.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Expected resolution {formatDate(dispute.expectedResolutionAt)}
            </span>
          </div>

          {!dispute.resolved && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning-bg p-4">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-warning" aria-hidden="true" />
              <p className="text-sm font-medium text-warning">Waiting for arbitrator&hellip;</p>
            </div>
          )}

          {dispute.resolved && dispute.outcome && (
            <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success-bg p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-success">Resolved</p>
                <p className="mt-0.5 text-sm text-ink">
                  {OUTCOME_LABEL[dispute.outcome]}
                  {dispute.outcome === "SPLIT" && dispute.clientSplitPercent !== undefined && (
                    <> — {dispute.clientSplitPercent}% client / {100 - dispute.clientSplitPercent}% freelancer</>
                  )}
                </p>
                {dispute.resolvedAt && (
                  <p className="mt-1 text-xs text-ink-secondary">Resolved {formatDate(dispute.resolvedAt)}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
