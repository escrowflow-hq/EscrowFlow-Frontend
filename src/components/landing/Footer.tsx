import { Logo } from "@/components/Logo";

const REPOS = [
  { name: "EscrowflowContract", href: "https://github.com/escrowflow-hq/EscrowflowContract" },
  { name: "escrowflow-api", href: "https://github.com/escrowflow-hq/escrowflow-api" },
  { name: "EscrowFlow-mobile", href: "https://github.com/escrowflow-hq/EscrowFlow-mobile" },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink-secondary">
              Decentralized escrow for freelance payments, built on Stellar and Soroban.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Repositories</p>
            <ul className="mt-3 space-y-2">
              {REPOS.map((repo) => (
                <li key={repo.name}>
                  <a
                    href={repo.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-ink-secondary hover:text-ink"
                  >
                    {repo.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Product</p>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#how-it-works" className="text-sm text-ink-secondary hover:text-ink">
                  How it works
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm text-ink-secondary hover:text-ink">
                  Features
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm text-ink-secondary hover:text-ink">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Built on Stellar. Settled in USDC.</p>
          <p>&copy; {new Date().getFullYear()} EscrowFlow — MIT licensed</p>
        </div>
      </div>
    </footer>
  );
}
