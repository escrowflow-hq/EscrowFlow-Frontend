"use client";

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { LinkButton } from "@/components/ui/Button";

// Three.js needs a real browser (WebGL/canvas), so this can only ever run on
// the client. ssr: false skips it during the server render entirely, and the
// loading fallback covers the gap until the chunk arrives.
const HeroAnimation = dynamic(() => import("@/components/HeroAnimation").then((mod) => mod.HeroAnimation), {
  ssr: false,
  loading: () => <HeroVisualPlaceholder />,
});

function HeroVisualPlaceholder() {
  return <div className="h-full w-full bg-gradient-to-br from-primary-light via-white to-success-bg" />;
}

// getDerivedStateFromError only exists on class components — there's no hook
// equivalent — so this catches a WebGL init failure at runtime (e.g. no GPU/
// WebGL support) and swaps in the same gradient used while the chunk loads.
class HeroVisualBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <HeroVisualPlaceholder />;
    return this.props.children;
  }
}

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

        <div
          aria-hidden="true"
          className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-line"
        >
          <HeroVisualBoundary>
            <HeroAnimation />
          </HeroVisualBoundary>
        </div>
      </div>
    </section>
  );
}
