import { formatUSD } from "@/lib/fees";
import type { WalletState } from "@/lib/types";

export function BalanceCard({ wallet }: { wallet: WalletState }) {
  return (
    <div className="rounded-xl border border-line bg-white p-6">
      <p className="text-sm text-ink-secondary">Available balance</p>
      <p className="mt-1 text-3xl font-semibold text-ink">{formatUSD(wallet.available)}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface p-3">
          <p className="text-xs text-ink-secondary">Pending earnings</p>
          <p className="mt-1 text-base font-semibold text-ink">{formatUSD(wallet.pendingEarnings)}</p>
        </div>
        <div className="rounded-xl bg-surface p-3">
          <p className="text-xs text-ink-secondary">In escrow</p>
          <p className="mt-1 text-base font-semibold text-ink">{formatUSD(wallet.inEscrow)}</p>
        </div>
      </div>
    </div>
  );
}
