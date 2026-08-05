"use client";

import { useState } from "react";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { PaymentListItem } from "@/components/dashboard/PaymentListItem";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { DEPOSIT_FEES, formatUSD, WITHDRAW_FEES } from "@/lib/fees";
import { computeWalletSummary, paymentDirection } from "@/lib/mock/service";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/store/auth.store";
import type { DepositMethod, WithdrawDestination } from "@/lib/types";
import { Receipt } from "lucide-react";

const PRESETS = [50, 100, 250, 500];

type Flow = "withdraw" | "deposit";

export default function WalletPage() {
  const state = useAppStore((s) => s.state);
  const withdraw = useAppStore((s) => s.withdraw);
  const deposit = useAppStore((s) => s.deposit);
  const error = useAppStore((s) => s.error);
  const clearError = useAppStore((s) => s.clearError);
  const userRole = useAuthStore((s) => s.userRole);
  const canDeposit = userRole === "CLIENT";

  const wallet = computeWalletSummary(state);
  const [flow, setFlow] = useState<Flow>("withdraw");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState<WithdrawDestination>("BANK");
  const [method, setMethod] = useState<DepositMethod>("USDC");
  const [success, setSuccess] = useState<string | null>(null);

  const numericAmount = Number(amount) || 0;
  const withdrawFee = WITHDRAW_FEES[destination].fee(numericAmount);
  const depositFee = DEPOSIT_FEES[method].fee(numericAmount);
  const withdrawTotal = Math.round((numericAmount + withdrawFee) * 100) / 100;
  const depositNet = Math.round((numericAmount - depositFee) * 100) / 100;
  const insufficientBalance = flow === "withdraw" && numericAmount > 0 && withdrawTotal > wallet.available;

  function handleSubmit() {
    setSuccess(null);
    if (numericAmount <= 0) return;
    if (flow === "withdraw") {
      withdraw(numericAmount, destination);
      if (!useAppStore.getState().error) {
        setSuccess(`Withdrawal of ${formatUSD(numericAmount)} to ${WITHDRAW_FEES[destination].label} initiated.`);
        setAmount("");
      }
    } else {
      deposit(numericAmount, method);
      if (!useAppStore.getState().error) {
        setSuccess(`Deposited ${formatUSD(depositNet)} to your available balance.`);
        setAmount("");
      }
    }
  }

  const recentPayments = state.payments
    .filter((p) => p.type === "WITHDRAWAL" || p.type === "DEPOSIT")
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Wallet</h1>
        <p className="mt-1 text-sm text-ink-secondary">Manage your balance, withdrawals, and deposits.</p>
      </div>

      <BalanceCard wallet={wallet} />

      <div className="rounded-xl border border-line bg-white p-5 sm:p-6">
        {canDeposit && (
          <div className="mb-5 inline-flex rounded-xl border border-line bg-surface p-1" role="tablist">
            {(["withdraw", "deposit"] as Flow[]).map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={flow === f}
                onClick={() => {
                  setFlow(f);
                  setAmount("");
                  setSuccess(null);
                  clearError();
                }}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  flow === f ? "bg-white text-ink shadow-sm" : "text-ink-secondary"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="amount" className="text-sm font-medium text-ink">
              Amount (USD)
            </label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setSuccess(null);
                clearError();
              }}
              className="mt-1.5 w-full rounded-xl border border-line p-3 text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="0.00"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(String(preset));
                    setSuccess(null);
                    clearError();
                  }}
                  className="rounded-lg border border-line px-3 py-1 text-sm font-medium text-ink-secondary hover:border-primary hover:text-primary"
                >
                  {formatUSD(preset)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">
              {flow === "withdraw" ? "Withdraw to" : "Deposit from"}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {flow === "withdraw"
                ? (Object.keys(WITHDRAW_FEES) as WithdrawDestination[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDestination(key)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        destination === key ? "border-primary bg-primary-light" : "border-line hover:border-primary/40"
                      )}
                    >
                      <p className="text-sm font-medium text-ink">{WITHDRAW_FEES[key].label}</p>
                      <p className="mt-0.5 text-xs text-ink-secondary">{WITHDRAW_FEES[key].feeLabel}</p>
                    </button>
                  ))
                : (Object.keys(DEPOSIT_FEES) as DepositMethod[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMethod(key)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        method === key ? "border-primary bg-primary-light" : "border-line hover:border-primary/40"
                      )}
                    >
                      <p className="text-sm font-medium text-ink">{DEPOSIT_FEES[key].label}</p>
                      <p className="mt-0.5 text-xs text-ink-secondary">{DEPOSIT_FEES[key].feeLabel}</p>
                    </button>
                  ))}
            </div>
          </div>

          {numericAmount > 0 && (
            <div className="space-y-1.5 rounded-xl bg-surface p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Amount</span>
                <span className="font-medium text-ink">{formatUSD(numericAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Fee</span>
                <span className="font-medium text-ink">
                  {formatUSD(flow === "withdraw" ? withdrawFee : depositFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5 font-semibold text-ink">
                <span>{flow === "withdraw" ? "Total deducted" : "You'll receive"}</span>
                <span>{formatUSD(flow === "withdraw" ? withdrawTotal : depositNet)}</span>
              </div>
            </div>
          )}

          {(insufficientBalance || error) && (
            <p className="text-sm text-danger">{error ?? "Insufficient balance for this withdrawal."}</p>
          )}
          {success && <p className="text-sm text-success">{success}</p>}

          <Button
            onClick={handleSubmit}
            disabled={numericAmount <= 0 || insufficientBalance}
            className="w-full sm:w-auto"
          >
            {flow === "withdraw" ? "Withdraw" : "Deposit"}
          </Button>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">Wallet activity</h2>
        {recentPayments.length === 0 ? (
          <EmptyState icon={Receipt} title="No wallet activity yet" description="Withdrawals and deposits will show up here." />
        ) : (
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <PaymentListItem key={payment.id} payment={payment} direction={paymentDirection(payment, state)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
