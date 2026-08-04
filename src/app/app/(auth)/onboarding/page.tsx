"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, ShieldCheck, Zap, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Slide {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SLIDES: readonly [Slide, Slide, Slide] = [
  {
    icon: ShieldCheck,
    title: "Your funds are protected",
    description:
      "Client payments lock into Soroban smart contracts on Stellar the moment a project starts — no one can touch them until milestones are approved.",
  },
  {
    icon: Globe,
    title: "Work worldwide",
    description:
      "Take on clients anywhere in the world. EscrowFlow handles the cross-border details so you don't have to.",
  },
  {
    icon: Zap,
    title: "Instant payouts",
    description:
      "The moment a milestone is approved, funds release automatically. Withdraw to a bank, mobile money, or crypto wallet.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState<0 | 1 | 2>(0);
  const slide = SLIDES[index];
  const isLast = index === 2;

  function handleNext() {
    if (index === 0) {
      setIndex(1);
    } else if (index === 1) {
      setIndex(2);
    } else {
      router.push("/app");
    }
  }

  function handleSkip() {
    router.push("/app");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-surface px-4 py-10">
      <div className="flex w-full max-w-sm justify-end">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm font-medium text-ink-secondary hover:text-ink"
        >
          Skip
        </button>
      </div>

      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <slide.icon className="h-10 w-10" aria-hidden="true" />
        </div>
        <h1 className="mt-8 text-2xl font-semibold text-ink">{slide.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{slide.description}</p>
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex items-center gap-2" role="tablist" aria-label="Onboarding progress">
          {SLIDES.map((s, i) => (
            <span
              key={s.title}
              role="tab"
              aria-selected={i === index}
              className={cn("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-primary" : "w-1.5 bg-line")}
            />
          ))}
        </div>
        <Button onClick={handleNext} size="lg" className="w-full">
          {isLast ? "Done" : "Next"}
        </Button>
      </div>
    </div>
  );
}
