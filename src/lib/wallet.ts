import { Keypair } from "@stellar/stellar-sdk";

const SECRET_KEY_PREFIX = "escrowflow-wallet-secret:";

export function generateStellarKeypair(): { publicKey: string; secretKey: string } {
  const keypair = Keypair.random();
  return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
}

// Demo-only "at rest" obfuscation, not real encryption — this is a mock,
// testnet-oriented wallet flow with no backend, so there's no secure vault to
// put a secret key in. Kept out of the shared mock/service.ts backend (which
// broadcasts to other tabs and is trivially readable from React state) so it
// at least isn't casually exposed alongside the rest of the app's data.
export function storeWalletSecret(email: string, secretKey: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${SECRET_KEY_PREFIX}${email}`, btoa(secretKey));
}
