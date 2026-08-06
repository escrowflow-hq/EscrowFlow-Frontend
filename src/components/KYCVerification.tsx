"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { KYCModal } from "@/components/KYCModal";
import { useAppStore } from "@/lib/store";
import type { KycStatus } from "@/lib/types";

const STATUS_CONFIG: Record<KycStatus, { tone: "neutral" | "warning" | "success" | "danger"; label: string }> = {
  NOT_STARTED: { tone: "neutral", label: "Start verification" },
  PENDING: { tone: "warning", label: "Verification in progress" },
  APPROVED: { tone: "success", label: "Verified" },
  REJECTED: { tone: "danger", label: "Verification rejected" },
};

export function KYCVerification() {
  const currentUser = useAppStore((s) => s.state.currentUser);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const status = currentUser.kycStatus;
  const config = STATUS_CONFIG[status];
  const canStart = status === "NOT_STARTED" || status === "REJECTED";

  return (
    <div className="space-y-3">
      <Badge tone={config.tone}>{config.label}</Badge>

      {status === "PENDING" && (
        <p className="text-sm text-ink-secondary">
          Your verification is being reviewed. This typically takes 24-48 hours.
        </p>
      )}

      {canStart && (
        <div>
          <Button onClick={() => setIsModalOpen(true)}>
            {status === "REJECTED" ? "Resubmit verification" : "Start KYC verification"}
          </Button>
        </div>
      )}

      {isModalOpen && <KYCModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
