"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { KYCVerification } from "@/components/KYCVerification";
import { StellarWallet } from "@/components/StellarWallet";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/store/auth.store";
import type { User } from "@/lib/types";

const NOTIFICATION_LABELS: { key: keyof User["notificationPreferences"]; label: string; description: string }[] = [
  { key: "milestoneUpdates", label: "Milestone updates", description: "Submissions, approvals, and change requests." },
  { key: "payments", label: "Payments", description: "Deposits, withdrawals, and released funds." },
  { key: "messages", label: "Messages", description: "New messages from clients and freelancers." },
  { key: "marketing", label: "Product updates", description: "News about new EscrowFlow features." },
];

export default function SettingsPage() {
  const currentUser = useAppStore((s) => s.state.currentUser);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const updateNotificationPreference = useAppStore((s) => s.updateNotificationPreference);
  const userRole = useAuthStore((s) => s.userRole);

  const [name, setName] = useState(currentUser.name);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateProfile({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-secondary">Manage your profile, notifications, and wallet.</p>
      </div>

      <p className="text-[11px] uppercase tracking-wide text-ink-muted/60">
        Demo mode: {userRole === "CLIENT" ? "Client" : "Freelancer"}
      </p>

      <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.name} color={currentUser.avatarColor} size={56} />
          <div>
            <p className="font-medium text-ink">{currentUser.name}</p>
            <p className="text-sm text-ink-secondary">{currentUser.email}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-ink">
              Full name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={currentUser.email}
              disabled
              className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-line bg-surface p-3 text-sm text-ink-secondary"
            />
            <p className="mt-1.5 text-xs text-ink-secondary">
              Your email is your account identity and can&apos;t be changed here — contact support if you need to update it.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>Save changes</Button>
            {saved && <span className="text-sm text-success">Saved</span>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-ink">Notifications</h2>
        <div className="mt-4 divide-y divide-line">
          {NOTIFICATION_LABELS.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-ink">{item.label}</p>
                <p className="text-sm text-ink-secondary">{item.description}</p>
              </div>
              <Toggle
                checked={currentUser.notificationPreferences[item.key]}
                onChange={(value) => updateNotificationPreference(item.key, value)}
                label={item.label}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-ink">Identity verification (KYC)</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Verify your identity to withdraw funds and build trust on EscrowFlow.
        </p>
        <div className="mt-4">
          <KYCVerification />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-ink">Stellar wallet</h2>
        <p className="mt-1 text-sm text-ink-secondary">Your Stellar wallet receives payments from completed escrows.</p>
        <div className="mt-4">
          <StellarWallet />
        </div>
      </section>
    </div>
  );
}
