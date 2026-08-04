import { LinkButton } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Get paid safely for work, anywhere in the world
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-secondary">
            EscrowFlow locks client funds into Soroban smart contracts on Stellar the moment a
            project starts. Money releases automatically as milestones are approved — no invoicing
            back-and-forth, no wondering if you&apos;ll get paid.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="/app/login" size="lg">
              Open app
            </LinkButton>
          </div>
        </div>

        <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
          <div className="rounded-2xl border border-line bg-white p-6">
            <p className="text-sm text-ink-secondary">Available balance</p>
            <p className="mt-1 text-3xl font-semibold text-ink">$1,840.50</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-ink-secondary">Pending earnings</p>
                <p className="mt-1 text-base font-semibold text-ink">$1,455.00</p>
              </div>
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-ink-secondary">In escrow</p>
                <p className="mt-1 text-base font-semibold text-ink">$2,700.00</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-line p-3">
                <div>
                  <p className="text-sm font-medium text-ink">Homepage & pricing build</p>
                  <p className="text-xs text-ink-secondary">Milestone 2 of 3</p>
                </div>
                <span className="rounded-full bg-warning-bg px-2.5 py-1 text-xs font-medium text-warning">
                  Submitted
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                <div className="h-full w-2/3 rounded-full bg-primary" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-line bg-white px-4 py-3 shadow-sm sm:block">
            <p className="text-xs text-ink-secondary">Milestone released</p>
            <p className="text-sm font-semibold text-success">+$1,455.00</p>
          </div>
        </div>
      </div>
    </section>
  );
}
