"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatUSD } from "@/lib/fees";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import {
  validateDetails,
  validateFreelancerEmail,
  validateMilestones,
  milestonesAreValid,
  type WizardMilestoneDraft,
} from "@/lib/wizardValidation";

const STEPS = ["Details", "Freelancer", "Milestones", "Review"] as const;
const NETWORK_FEE = 0.02;

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useAppStore((s) => s.createProject);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [freelancerEmail, setFreelancerEmail] = useState("");
  const [milestones, setMilestones] = useState<WizardMilestoneDraft[]>([
    { title: "", description: "", amount: "" },
  ]);
  const [touched, setTouched] = useState(false);

  const detailsErrors = validateDetails(title, description);
  const emailError = validateFreelancerEmail(freelancerEmail);
  const milestoneErrors = validateMilestones(milestones);
  const milestonesValid = milestonesAreValid(milestones);

  const budget = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const platformFee = Math.round(budget * 0.03 * 100) / 100;
  const totalToFund = Math.round((budget + NETWORK_FEE) * 100) / 100;

  function canAdvance(): boolean {
    if (step === 0) return Object.keys(detailsErrors).length === 0;
    if (step === 1) return !emailError;
    if (step === 2) return milestonesValid;
    return true;
  }

  function next() {
    setTouched(false);
    if (!canAdvance()) {
      setTouched(true);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setTouched(false);
    setStep((s) => Math.max(s - 1, 0));
  }

  function updateMilestone(index: number, updates: Partial<WizardMilestoneDraft>) {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, ...updates } : m)));
  }

  function addMilestone() {
    setMilestones((prev) => [...prev, { title: "", description: "", amount: "" }]);
  }

  function removeMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCreate() {
    createProject({
      title,
      description,
      freelancerEmail,
      milestones: milestones.map((m) => ({
        title: m.title,
        description: m.description,
        amount: Math.round(Number(m.amount) * 100) / 100,
      })),
    });
    router.push("/app");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Create project</h1>
        <p className="mt-1 text-sm text-ink-secondary">Set up milestones and invite a freelancer to get started.</p>
      </div>

      <ol className="flex items-center gap-2" aria-label="Wizard progress">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                index <= step ? "bg-primary text-white" : "bg-line text-ink-secondary"
              )}
              aria-current={index === step ? "step" : undefined}
            >
              {index + 1}
            </div>
            <span className={cn("hidden text-sm sm:inline", index === step ? "font-medium text-ink" : "text-ink-secondary")}>
              {label}
            </span>
            {index < STEPS.length - 1 && <div className="h-px flex-1 bg-line" />}
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-line bg-white p-5 sm:p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium text-ink">
                Project title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="e.g. Marketing site redesign"
              />
              {touched && detailsErrors.title && <p className="mt-1 text-sm text-danger">{detailsErrors.title}</p>}
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium text-ink">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="What does this project involve?"
              />
              {touched && detailsErrors.description && (
                <p className="mt-1 text-sm text-danger">{detailsErrors.description}</p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <label htmlFor="freelancer-email" className="text-sm font-medium text-ink">
              Freelancer email
            </label>
            <input
              id="freelancer-email"
              type="email"
              value={freelancerEmail}
              onChange={(e) => setFreelancerEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="freelancer@example.com"
            />
            {touched && emailError && <p className="mt-1 text-sm text-danger">{emailError}</p>}
            <p className="mt-2 text-sm text-ink-secondary">
              We&apos;ll invite them to this project once escrow is funded.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {milestones.map((milestone, index) => (
              <div key={index} className="space-y-3 rounded-xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Milestone {index + 1}</p>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      aria-label={`Remove milestone ${index + 1}`}
                      className="text-ink-muted hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <div>
                  <label htmlFor={`m-title-${index}`} className="text-sm font-medium text-ink">
                    Title
                  </label>
                  <input
                    id={`m-title-${index}`}
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, { title: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="e.g. Homepage build"
                  />
                  {touched && milestoneErrors[index]?.title && (
                    <p className="mt-1 text-sm text-danger">{milestoneErrors[index]?.title}</p>
                  )}
                </div>
                <div>
                  <label htmlFor={`m-desc-${index}`} className="text-sm font-medium text-ink">
                    Description
                  </label>
                  <textarea
                    id={`m-desc-${index}`}
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, { description: e.target.value })}
                    rows={2}
                    className="mt-1.5 w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="What's delivered in this milestone?"
                  />
                </div>
                <div>
                  <label htmlFor={`m-amount-${index}`} className="text-sm font-medium text-ink">
                    Amount (USDC)
                  </label>
                  <input
                    id={`m-amount-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={milestone.amount}
                    onChange={(e) => updateMilestone(index, { amount: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="0.00"
                  />
                  {touched && milestoneErrors[index]?.amount && (
                    <p className="mt-1 text-sm text-danger">{milestoneErrors[index]?.amount}</p>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addMilestone}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add milestone
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <p className="font-semibold text-ink">{title}</p>
              <p className="mt-1 text-sm text-ink-secondary">{description}</p>
              <p className="mt-2 text-sm text-ink-secondary">Freelancer: {freelancerEmail}</p>
            </div>
            <ul className="divide-y divide-line rounded-xl border border-line">
              {milestones.map((m, index) => (
                <li key={index} className="flex items-center justify-between p-3 text-sm">
                  <span className="text-ink">{m.title || `Milestone ${index + 1}`}</span>
                  <span className="font-medium text-ink">{formatUSD(Number(m.amount) || 0)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 rounded-xl bg-surface p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Budget</span>
                <span className="font-medium text-ink">{formatUSD(budget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Platform fee (3%, deducted on each release)</span>
                <span className="font-medium text-ink">{formatUSD(platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Network fee (fund escrow)</span>
                <span className="font-medium text-ink">{formatUSD(NETWORK_FEE)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-semibold text-ink">
                <span>Total to fund escrow</span>
                <span>{formatUSD(totalToFund)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 0}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button onClick={handleCreate}>Create project</Button>
        )}
      </div>
    </div>
  );
}
