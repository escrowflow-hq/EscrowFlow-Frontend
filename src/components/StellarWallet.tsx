"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, ShieldAlert } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/account";

export function StellarWallet() {
  const currentUser = useAppStore((s) => s.state.currentUser);
  const createWallet = useAppStore((s) => s.createWallet);
  const error = useAppStore((s) => s.error);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const address = currentUser.walletAddress;

  async function handleCopy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCreate() {
    setIsCreating(true);
    createWallet();
    setIsCreating(false);
  }

  if (!address) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-secondary">No wallet yet.</p>
        <Button onClick={handleCreate} disabled={isCreating}>
          Create Stellar wallet
        </Button>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-3">
        <code className="min-w-0 flex-1 truncate text-sm text-ink">{address}</code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy wallet address"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-white hover:text-ink"
        >
          {copied ? <Check className="h-4 w-4 text-success" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {copied && <p className="text-xs text-success">Copied!</p>}

      <div className="flex flex-wrap items-center gap-4">
        <div className="rounded-xl border border-line bg-white p-3">
          <QRCodeSVG value={address} size={112} />
        </div>
        <a
          href={`${EXPLORER_BASE}/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          View on explorer
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <p className="flex items-start gap-2 text-xs text-ink-secondary">
        <ShieldAlert className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        Never share your secret key with anyone. EscrowFlow will never ask for it.
      </p>
    </div>
  );
}
