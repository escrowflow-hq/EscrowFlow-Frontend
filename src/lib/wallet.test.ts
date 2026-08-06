// @vitest-environment node
//
// jsdom's environment swaps in its own realm-local Uint8Array, which breaks
// @noble/ed25519's `instanceof Uint8Array` check against Node's native
// Buffer (used internally by @stellar/stellar-sdk) — a jsdom test-harness
// quirk, not a bug in the library or in a real browser (which has no Node
// Buffer to conflict with). This file doesn't touch the DOM, so it runs
// under plain Node instead.
import { describe, expect, it } from "vitest";
import { Keypair, StrKey } from "@stellar/stellar-sdk";
import { generateStellarKeypair } from "@/lib/wallet";

describe("generateStellarKeypair", () => {
  it("creates a valid Ed25519 public/secret keypair", () => {
    const { publicKey, secretKey } = generateStellarKeypair();

    expect(StrKey.isValidEd25519PublicKey(publicKey)).toBe(true);
    expect(StrKey.isValidEd25519SecretSeed(secretKey)).toBe(true);
    expect(Keypair.fromSecret(secretKey).publicKey()).toBe(publicKey);
  });

  it("creates a different keypair on each call", () => {
    const first = generateStellarKeypair();
    const second = generateStellarKeypair();

    expect(first.publicKey).not.toBe(second.publicKey);
  });
});
