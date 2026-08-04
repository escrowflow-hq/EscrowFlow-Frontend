const ROWS = [
  { label: "Milestone release", detail: "Platform fee on release", value: "3%" },
  { label: "Withdraw · Bank transfer", detail: "Flat fee per withdrawal", value: "$2.00" },
  { label: "Withdraw · Mobile money", detail: "Flat fee per withdrawal", value: "$0.50" },
  { label: "Withdraw · Crypto wallet", detail: "Flat fee per withdrawal", value: "$0.02" },
  { label: "Deposit · Card", detail: "Percentage fee per deposit", value: "2.5%" },
  { label: "Deposit · Bank transfer", detail: "Flat fee per deposit", value: "$1.00" },
  { label: "Deposit · USDC", detail: "No conversion needed", value: "Free" },
];

export function Fees() {
  return (
    <section className="border-t border-line bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Simple, transparent fees</h2>
          <p className="mt-3 text-ink-secondary">No subscriptions, no hidden spreads. Pay only when money moves.</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-ink-secondary">
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Detail</th>
                <th className="px-5 py-3 text-right font-medium">Fee</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{row.label}</td>
                  <td className="hidden px-5 py-3 text-ink-secondary sm:table-cell">{row.detail}</td>
                  <td className="px-5 py-3 text-right font-semibold text-ink">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
