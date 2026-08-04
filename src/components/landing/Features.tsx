import { Banknote, Globe2, Scale, ShieldCheck, Wallet, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Milestone escrow",
    description: "Funds are locked per-project and only move when milestones are approved.",
  },
  {
    icon: Zap,
    title: "Instant releases",
    description: "Approved milestones pay out immediately, minus a flat 3% platform fee.",
  },
  {
    icon: Banknote,
    title: "Local withdrawals",
    description: "Cash out to a bank account, mobile money, or a crypto wallet — freelancer's choice.",
  },
  {
    icon: Wallet,
    title: "No blockchain knowledge needed",
    description: "Clients and freelancers interact with plain USD amounts. The contract handles the rest.",
  },
  {
    icon: Scale,
    title: "Dispute resolution",
    description: "If a milestone is contested, funds stay locked in escrow until it's resolved.",
  },
  {
    icon: Globe2,
    title: "Global by default",
    description: "Stellar settlement means a freelancer in Lagos gets paid as fast as one in London.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Everything escrow should be</h2>
          <p className="mt-3 text-ink-secondary">
            Built for freelance work specifically — not a generic payments product bolted onto crypto.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-line bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
