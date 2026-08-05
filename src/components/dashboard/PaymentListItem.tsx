import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatUSD } from "@/lib/fees";
import { formatDate } from "@/lib/utils";
import type { Payment } from "@/lib/types";

export function PaymentListItem({ payment, direction }: { payment: Payment; direction: "in" | "out" }) {
  const isInbound = direction === "in";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isInbound ? "bg-success-bg text-success" : "bg-surface text-ink-secondary"
        }`}
      >
        {isInbound ? (
          <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{payment.projectTitle}</p>
        <p className="text-xs text-ink-secondary">
          {payment.counterparty} · {formatDate(payment.createdAt)}
        </p>
      </div>
      <p className={`shrink-0 text-sm font-semibold ${isInbound ? "text-success" : "text-ink"}`}>
        {isInbound ? "+" : "-"}
        {formatUSD(payment.amount)}
      </p>
    </div>
  );
}
