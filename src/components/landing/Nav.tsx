import { Github } from "lucide-react";
import { Logo } from "@/components/Logo";
import { LinkButton } from "@/components/ui/Button";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Primary">
        <Logo />
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sm font-medium text-ink-secondary hover:text-ink">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/escrowflow-hq"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-surface sm:inline-flex"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            GitHub
          </a>
          <LinkButton href="/app" size="sm">
            Open app
          </LinkButton>
        </div>
      </nav>
    </header>
  );
}
