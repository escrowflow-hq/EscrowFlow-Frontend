"use client";

import { create } from "zustand";
import type { DepositMethod, DisputeOutcome, UserRole, WithdrawDestination } from "@/lib/types";
import {
  approveMilestone,
  createInitialState,
  createProject,
  CreateProjectInput,
  deposit,
  fundEscrow,
  MockServiceError,
  MockState,
  openDispute,
  requestChanges,
  resolveDispute,
  sendMessage,
  submitMilestone,
  updateNotificationPreference,
  updateProfile,
  uploadFile,
  withdraw,
} from "@/lib/mock/service";

interface AppStore {
  state: MockState;
  viewRole: UserRole;
  error: string | null;
  setViewRole: (role: UserRole) => void;
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
  updateProfile: (updates: { name?: string; email?: string }) => void;
  updateNotificationPreference: (key: string, value: boolean) => void;
}

function run(fn: () => MockState, set: (partial: Partial<AppStore>) => void, get: () => AppStore) {
  try {
    const nextState = fn();
    set({ state: nextState, error: null });
  } catch (err) {
    if (err instanceof MockServiceError) {
      set({ error: err.message });
    } else {
      throw err;
    }
  }
}

export const useAppStore = create<AppStore>((set, get) => ({
  state: createInitialState(),
  viewRole: "CLIENT",
  error: null,
  setViewRole: (role) => set({ viewRole: role, error: null }),
  clearError: () => set({ error: null }),
  approveMilestone: (projectId, milestoneId) =>
    run(() => approveMilestone(get().state, projectId, milestoneId), set, get),
  requestChanges: (projectId, milestoneId, reason) =>
    run(() => requestChanges(get().state, projectId, milestoneId, reason), set, get),
  submitMilestone: (projectId, milestoneId, note) =>
    run(() => submitMilestone(get().state, projectId, milestoneId, note), set, get),
  openDispute: (escrowId, milestoneId, initiator, reason) =>
    run(() => openDispute(get().state, escrowId, milestoneId, initiator, reason), set, get),
  resolveDispute: (escrowId, milestoneId, outcome, split) =>
    run(() => resolveDispute(get().state, escrowId, milestoneId, outcome, split), set, get),
  fundEscrow: (projectId) => run(() => fundEscrow(get().state, projectId), set, get),
  withdraw: (amount, destination) => run(() => withdraw(get().state, amount, destination), set, get),
  deposit: (amount, method) => run(() => deposit(get().state, amount, method), set, get),
  createProject: (input) => run(() => createProject(get().state, input), set, get),
  sendMessage: (projectId, body) => run(() => sendMessage(get().state, projectId, body), set, get),
  uploadFile: (projectId, name, sizeKb) => run(() => uploadFile(get().state, projectId, name, sizeKb), set, get),
  updateProfile: (updates) => run(() => updateProfile(get().state, updates), set, get),
  updateNotificationPreference: (key, value) =>
    run(
      () => updateNotificationPreference(get().state, key as never, value),
      set,
      get
    ),
}));

export function projectsForRole(state: MockState, role: UserRole) {
  return state.projects.filter((p) =>
    role === "CLIENT" ? p.clientId === state.currentUser.id : p.freelancerId === state.currentUser.id
  );
}
