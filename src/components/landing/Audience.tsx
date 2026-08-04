import { Check } from "lucide-react";

const FREELANCER_BENEFITS = [
  "Funds are locked before you start work — no chasing invoices",
  "Get paid the moment a milestone is approved",
  "Withdraw to your bank, mobile money, or a crypto wallet",
  "Dispute protection if a client goes quiet",
];

const CLIENT_BENEFITS = [
  "Only pay for milestones you've actually approved",
  "Funds stay in your control until work is delivered",
  "No blockchain wallet or crypto experience required",
  "Full visibility into project progress and messages",
];

function BenefitList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-ink-secondary">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Audience() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-line p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">For freelancers</p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">Work with confidence</h3>
          <BenefitList items={FREELANCER_BENEFITS} />
        </div>
        <div className="rounded-xl border border-line p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">For clients</p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">Pay with control</h3>
          <BenefitList items={CLIENT_BENEFITS} />
        </div>
      </div>
    </section>
  );
}
