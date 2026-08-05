interface RoleSelectorProps {
  selected: "CLIENT" | "FREELANCER";
  onChange: (role: "CLIENT" | "FREELANCER") => void;
}

export const RoleSelector = ({ selected, onChange }: RoleSelectorProps) => (
  <div className="mb-8">
    <label className="mb-4 block text-sm font-semibold text-ink">I am a...</label>
    <div className="grid grid-cols-2 gap-4" role="group" aria-label="I am a...">
      <button
        type="button"
        onClick={() => onChange("CLIENT")}
        aria-pressed={selected === "CLIENT"}
        className={`rounded-2xl border-2 p-6 text-left transition ${
          selected === "CLIENT" ? "border-primary bg-primary-light" : "border-line bg-surface hover:border-primary"
        }`}
      >
        <div className={`text-lg font-semibold ${selected === "CLIENT" ? "text-primary" : "text-ink"}`}>Client</div>
        <div className="mt-1 text-sm text-ink-secondary">Hire freelancers and pay for milestones</div>
      </button>

      <button
        type="button"
        onClick={() => onChange("FREELANCER")}
        aria-pressed={selected === "FREELANCER"}
        className={`rounded-2xl border-2 p-6 text-left transition ${
          selected === "FREELANCER" ? "border-primary bg-primary-light" : "border-line bg-surface hover:border-primary"
        }`}
      >
        <div className={`text-lg font-semibold ${selected === "FREELANCER" ? "text-primary" : "text-ink"}`}>
          Freelancer
        </div>
        <div className="mt-1 text-sm text-ink-secondary">Get hired and withdraw payments safely</div>
      </button>
    </div>
  </div>
);
