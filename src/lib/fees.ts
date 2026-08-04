export const PLATFORM_FEE_RATE = 0.03;

export function releaseFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
}

export function amountAfterReleaseFee(amount: number): number {
  return Math.round((amount - releaseFee(amount)) * 100) / 100;
}

export const WITHDRAW_FEES: Record<
  "BANK" | "MOBILE_MONEY" | "CRYPTO_WALLET",
  { label: string; feeLabel: string; fee: (amount: number) => number }
> = {
  BANK: {
    label: "Bank transfer",
    feeLabel: "$2.00 flat fee",
    fee: () => 2.0,
  },
  MOBILE_MONEY: {
    label: "Mobile money",
    feeLabel: "$0.50 flat fee",
    fee: () => 0.5,
  },
  CRYPTO_WALLET: {
    label: "Crypto wallet",
    feeLabel: "$0.02 flat fee",
    fee: () => 0.02,
  },
};

export const DEPOSIT_FEES: Record<
  "CARD" | "BANK" | "USDC",
  { label: string; feeLabel: string; fee: (amount: number) => number }
> = {
  CARD: {
    label: "Debit / credit card",
    feeLabel: "2.5% fee",
    fee: (amount) => Math.round(amount * 0.025 * 100) / 100,
  },
  BANK: {
    label: "Bank transfer",
    feeLabel: "$1.00 flat fee",
    fee: () => 1.0,
  },
  USDC: {
    label: "USDC wallet",
    feeLabel: "Free",
    fee: () => 0,
  },
};

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
