const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

// Deposits have no other cap (withdrawals are already bounded by wallet
// balance) — this stops a runaway/spoofed amount from being accepted as-is.
const MAX_USDC_AMOUNT = 1_000_000;

export function isValidUsdcAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0 && amount <= MAX_USDC_AMOUNT;
}

/** Strips control characters and trims — the mock backend's boundary check for free-text input. */
export function sanitizeText(input: string): string {
  return input.trim().replace(/[\x00-\x1F\x7F]/g, "");
}
