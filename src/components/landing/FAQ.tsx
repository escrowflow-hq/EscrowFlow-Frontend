import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
  {
    question: "What is escrow, exactly?",
    answer:
      "Escrow means the client's payment is held by a neutral third party — in this case, a Soroban smart contract — until agreed-upon conditions are met. Neither side can unilaterally move the funds.",
  },
  {
    question: "Is my money safe?",
    answer:
      "Funds are locked in an on-chain smart contract, not in a company bank account. Release logic is enforced by the contract itself based on milestone approvals, and disputed funds stay locked until resolved.",
  },
  {
    question: "Which countries can I use EscrowFlow in?",
    answer:
      "EscrowFlow works anywhere Stellar and USDC are accessible, which is most of the world. Withdrawal options (bank, mobile money, crypto wallet) vary by country based on local payment rails.",
  },
  {
    question: "What currency is used?",
    answer:
      "All projects and milestones are priced and settled in USDC. Freelancers can withdraw to local currency via bank transfer or mobile money, or keep funds as USDC in a crypto wallet.",
  },
  {
    question: "What happens if there's a dispute?",
    answer:
      "If a client and freelancer disagree on a milestone, either party can flag it as disputed. The milestone funds stay locked in escrow — unreleased to either side — until the dispute is resolved.",
  },
  {
    question: "Do I need a crypto wallet to use EscrowFlow?",
    answer:
      "No. Clients can fund escrow by card or bank transfer, and freelancers can withdraw straight to a bank account or mobile money. A crypto wallet is only needed if you want to hold or send USDC directly.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="mb-10">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
      </div>
      <Accordion items={FAQ_ITEMS} />
    </section>
  );
}
