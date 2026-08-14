"use client";

import { create } from "zustand";
import type { DepositMethod, DisputeOutcome, KycData, UserRole, WithdrawDestination } from "@/lib/types";
import {
  approveMilestone,
  createProject,
  CreateProjectInput,
  createWallet as createWalletRecord,
  deposit,
  fundEscrow,
  getViewForUser,
  MockServiceError,
  MockState,
  openDispute,
  requestChanges,
  resolveDispute,
  sendMessage,
  subscribeToBackend,
  submitKyc,
  submitMilestone,
  updateNotificationPreference,
  updateProfile,
  uploadFile,
  withdraw,
} from "@/lib/mock/service";
import { generateStellarKeypair, storeWalletSecret } from "@/lib/wallet";
import { logError } from "@/lib/errors";
import { useAuthStore } from "@/store/auth.store";

interface AppStore {
  state: MockState;
  error: string | null;
  clearError: () => void;
  approveMilestone: (projectId: string, milestoneId: string) => void;
  requestChanges: (projectId: string, milestoneId: string, reason: string) => void;
  submitMilestone: (projectId: string, milestoneId: string, note: string) => void;
  openDispute: (escrowId: string, milestoneId: string, initiator: string, reason: string) => void;
  resolveDispute: (escrowId: string, milestoneId: string, outcome: DisputeOutcome, split?: number) => void;
  fundEscrow: (projectId: string) => void;
  withdraw: (amount: number, destination: WithdrawDestination) => void;
  deposit: (amount: number, method: DepositMethod) => void;
  createProject: (input: CreateProjectInput) => void;
  sendMessage: (projectId: string, body: string) => void;
  uploadFile: (projectId: string, name: string, sizeKb: number) => void;
  updateProfile: (updates: { name?: string }) => void;
  updateNotificationPreference: (key: string, value: boolean) => void;
  submitKyc: (data: Omit<KycData, "submittedAt">) => void;
  createWallet: () => void;
}

// The shared mock backend (lib/mock/service.ts) doesn't know who's "logged
// in" — every mutation is keyed to an explicit email. This store just
// resolves that email from the authenticated session on each call.
function currentEmail(): string {
  return useAuthStore.getState().user?.email ?? "";
}

function run(fn: () => void, set: (partial: Partial<AppStore>) => void) {
  try {
    fn();
    set({ state: getViewForUser(currentEmail()), error: null });
  } catch (err) {
    if (err instanceof MockServiceError) {
      set({ error: err.message });
    } else {
      logError(err);
      throw err;
    }
  }
}

export const useAppStore = create<AppStore>((set, get) => {
  if (typeof window !== "undefined") {
    // Refreshes this identity's view whenever the shared backend changes —
    // including changes written by another browser tab (see the "storage"
    // listener in mock/service.ts) — so updates show up without a reload.
    subscribeToBackend(() => set({ state: getViewForUser(currentEmail()) }));
    useAuthStore.subscribe((authState, prevAuthState) => {
      if (authState.user?.email !== prevAuthState.user?.email) {
        set({ state: getViewForUser(currentEmail()) });
      }
    });
  }

  return {
    state: getViewForUser(currentEmail()),
    error: null,
    clearError: () => set({ error: null }),
    approveMilestone: (projectId, milestoneId) =>
      run(() => approveMilestone(projectId, milestoneId, currentEmail()), set),
    requestChanges: (projectId, milestoneId, reason) =>
      run(() => requestChanges(projectId, milestoneId, reason, currentEmail()), set),
    submitMilestone: (projectId, milestoneId, note) =>
      run(() => submitMilestone(projectId, milestoneId, note, currentEmail()), set),
    openDispute: (escrowId, milestoneId, initiator, reason) =>
      run(() => openDispute(escrowId, milestoneId, currentEmail(), initiator, reason), set),
    resolveDispute: (escrowId, milestoneId, outcome, split) =>
      run(() => resolveDispute(escrowId, milestoneId, outcome, split), set),
    fundEscrow: (projectId) => run(() => fundEscrow(projectId, currentEmail()), set),
    withdraw: (amount, destination) => run(() => withdraw(currentEmail(), amount, destination), set),
    deposit: (amount, method) => run(() => deposit(currentEmail(), amount, method), set),
    createProject: (input) =>
      run(() => {
        createProject(currentEmail(), input);
      }, set),
    sendMessage: (projectId, body) =>
      run(() => sendMessage(projectId, currentEmail(), get().state.currentUser.name, body), set),
    uploadFile: (projectId, name, sizeKb) =>
      run(() => uploadFile(projectId, currentEmail(), get().state.currentUser.name, name, sizeKb), set),
    updateProfile: (updates) => run(() => updateProfile(currentEmail(), updates), set),
    updateNotificationPreference: (key, value) =>
      run(() => updateNotificationPreference(currentEmail(), key as never, value), set),
    submitKyc: (data) => run(() => submitKyc(currentEmail(), data), set),
    createWallet: () =>
      run(() => {
        const { publicKey, secretKey } = generateStellarKeypair();
        createWalletRecord(currentEmail(), publicKey);
        storeWalletSecret(currentEmail(), secretKey);
      }, set),
  };
});

export function projectsForRole(state: MockState, role: UserRole) {
  return state.projects.filter((p) =>
    role === "CLIENT" ? p.clientEmail === state.currentUser.email : p.freelancerEmail === state.currentUser.email
  );
}
