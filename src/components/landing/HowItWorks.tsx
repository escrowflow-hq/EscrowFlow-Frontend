import { FileCheck, Lock, Send, Zap } from "lucide-react";

const STEPS = [
  {
    icon: FileCheck,
    title: "Create project & milestones",
    description: "Client defines the scope and breaks payment into milestones with clear amounts.",
  },
  {
    icon: Lock,
    title: "Client funds escrow",
    description: "USDC is locked into a Soroban smart contract — funds are committed, not just promised.",
  },
  {
    icon: Send,
    title: "Freelancer delivers",
    description: "Work is submitted against a milestone for the client to review.",
  },
  {
    icon: Zap,
    title: "Funds release instantly on approval",
    description: "The client approves, and the contract releases payment immediately, minus a 3% fee.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-12 max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">How it works</h2>
        <p className="mt-3 text-ink-secondary">
          Four steps from kickoff to getting paid — all enforced by a smart contract, not a promise.
        </p>
      </div>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-xl border border-line p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
              <step.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-xs font-semibold text-primary">Step {index + 1}</p>
            <h3 className="mt-1 font-semibold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
