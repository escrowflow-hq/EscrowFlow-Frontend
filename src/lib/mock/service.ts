import type {
  DepositMethod,
  Dispute,
  DisputeOutcome,
  KycData,
  KycStatus,
  Message,
  Notification,
  NotificationType,
  Payment,
  Project,
  ProjectFile,
  User,
  UserRole,
  WalletState,
  WithdrawDestination,
} from "@/lib/types";
import {
  INITIAL_DISPUTES,
  INITIAL_FILES,
  INITIAL_MESSAGES,
  INITIAL_PAYMENTS,
  INITIAL_PROJECTS,
  SEED_USERS,
} from "@/lib/mock/data";
import { DEPOSIT_FEES, releaseFee, WITHDRAW_FEES } from "@/lib/fees";
import { AppError } from "@/lib/errors";

export class MockServiceError extends AppError {}

/** Per-identity read model handed to the UI — a scoped view over the shared backend below. */
export interface MockState {
  currentUser: User;
  projects: Project[];
  payments: Payment[];
  messages: Message[];
  files: ProjectFile[];
  disputes: Dispute[];
}

interface SharedMockState {
  users: User[];
  projects: Project[];
  payments: Payment[];
  messages: Message[];
  files: ProjectFile[];
  disputes: Dispute[];
  notifications: Notification[];
}

const STORAGE_KEY = "escrowflow-mock-backend";
const AVATAR_COLORS = ["#3B6DF5", "#16A34A", "#F59E0B", "#DB2777", "#7C3AED", "#0EA5E9"];

function seedState(): SharedMockState {
  return {
    users: SEED_USERS.map((u) => ({ ...u })),
    projects: INITIAL_PROJECTS.map((p) => ({ ...p, milestones: p.milestones.map((m) => ({ ...m })) })),
    payments: [...INITIAL_PAYMENTS],
    messages: [...INITIAL_MESSAGES],
    files: [...INITIAL_FILES],
    disputes: INITIAL_DISPUTES.map((d) => ({ ...d })),
    notifications: [],
  };
}

function loadState(): SharedMockState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    return JSON.parse(raw) as SharedMockState;
  } catch {
    return seedState();
  }
}

// A single object shared by every identity in this browser — not one private
// copy per logged-in user. It's persisted to localStorage so it survives
// reloads and syncs across other tabs of the same browser (see the "storage"
// listener below), which is what lets a client's action show up for a
// freelancer immediately instead of each side working from its own silo.
let shared: SharedMockState = loadState();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shared));
}

function emit() {
  persist();
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      shared = JSON.parse(event.newValue) as SharedMockState;
      listeners.forEach((listener) => listener());
    } catch {
      // Ignore malformed payloads written by another tab mid-update.
    }
  });
}

/** Notifies on every mutation, whether it originated in this tab or another one. */
export function subscribeToBackend(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Test-only: reseed the shared backend so test files don't leak state into each other. */
export function __resetMockBackend(): void {
  shared = seedState();
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}

function pushNotification(
  userEmail: string,
  type: NotificationType,
  title: string,
  body: string,
  projectId?: string
) {
  const notification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userEmail,
    projectId,
    type,
    title,
    body,
    createdAt: new Date().toISOString(),
    read: false,
  };
  shared.notifications = [notification, ...shared.notifications].slice(0, 100);
}

/** Canonicalizes an email so the same identity is recognized regardless of case or stray whitespace. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findUserByEmail(email: string): User | undefined {
  const normalized = normalizeEmail(email);
  return shared.users.find((u) => u.email === normalized);
}

function nextAvatarColor(): string {
  return AVATAR_COLORS[shared.users.length % AVATAR_COLORS.length]!;
}

function ensureUser(email: string, fallbackName: string, role: UserRole): User {
  const normalized = normalizeEmail(email);
  const existing = findUserByEmail(normalized);
  if (existing) return existing;

  const user: User = {
    id: normalized,
    name: fallbackName,
    email: normalized,
    role,
    kycStatus: "NOT_STARTED",
    walletAddress: "",
    walletAvailable: 0,
    avatarColor: nextAvatarColor(),
    createdAt: new Date().toISOString(),
    notificationPreferences: { milestoneUpdates: true, payments: true, messages: true, marketing: false },
  };
  shared.users = [...shared.users, user];
  return user;
}

/**
 * Finds or creates the account behind an authenticated email. An identity's
 * role is fixed the first time it's established (at signup, at first mock
 * login, or when invited onto a project) — later calls never change it,
 * matching the "role is immutable after signup" rule.
 */
export function upsertUserForAuth(email: string, name: string, role: UserRole): User {
  const user = ensureUser(email, name, role);
  emit();
  return user;
}

function findProject(projectId: string): Project {
  const project = shared.projects.find((p) => p.id === projectId);
  if (!project) throw new MockServiceError(`Project ${projectId} not found`);
  return project;
}

function requireClient(project: Project, email: string) {
  if (project.clientEmail !== email) {
    throw new MockServiceError("Only this project's client can do that");
  }
}

function requireFreelancer(project: Project, email: string) {
  if (project.freelancerEmail !== email) {
    throw new MockServiceError("Only this project's freelancer can do that");
  }
}

function requireParty(project: Project, email: string) {
  if (project.clientEmail !== email && project.freelancerEmail !== email) {
    throw new MockServiceError("You don't have access to this project");
  }
}

function allReleased(project: Project): boolean {
  return project.milestones.every((m) => m.status === "RELEASED");
}

function replaceProject(updated: Project) {
  shared.projects = shared.projects.map((p) => (p.id === updated.id ? updated : p));
}

function creditWallet(email: string, delta: number) {
  shared.users = shared.users.map((u) =>
    u.email !== email ? u : { ...u, walletAvailable: Math.round((u.walletAvailable + delta) * 100) / 100 }
  );
}

export function listProjectsForUser(email: string): Project[] {
  const normalized = normalizeEmail(email);
  return shared.projects.filter((p) => p.clientEmail === normalized || p.freelancerEmail === normalized);
}

const SIGNED_OUT_USER: User = {
  id: "",
  name: "",
  email: "",
  role: "CLIENT",
  kycStatus: "NOT_STARTED",
  walletAddress: "",
  walletAvailable: 0,
  avatarColor: "#3B6DF5",
  createdAt: new Date(0).toISOString(),
  notificationPreferences: { milestoneUpdates: true, payments: true, messages: true, marketing: false },
};

/** Builds the scoped slice of the shared backend a given account is allowed to see. */
export function getViewForUser(email: string): MockState {
  // No session yet (store initializes before auth hydration finishes) — hand
  // back an inert placeholder rather than provisioning a "" identity.
  if (!email) {
    return { currentUser: SIGNED_OUT_USER, projects: [], payments: [], messages: [], files: [], disputes: [] };
  }

  const normalized = normalizeEmail(email);
  const currentUser = findUserByEmail(normalized) ?? ensureUser(normalized, normalized.split("@")[0] || "Member", "CLIENT");
  const projects = listProjectsForUser(normalized);
  const projectIds = new Set(projects.map((p) => p.id));

  return {
    currentUser,
    projects,
    payments: shared.payments.filter((p) => p.userEmail === normalized || projectIds.has(p.projectId)),
    messages: shared.messages.filter((m) => projectIds.has(m.projectId)),
    files: shared.files.filter((f) => projectIds.has(f.projectId)),
    disputes: shared.disputes.filter((d) => projectIds.has(d.projectId)),
  };
}

export function computeWalletSummary(state: MockState): WalletState {
  const inEscrow = state.projects
    .filter((p) => p.clientEmail === state.currentUser.email)
    .reduce((sum, p) => sum + p.escrowBalance, 0);

  const pendingEarnings = state.projects
    .filter((p) => p.freelancerEmail === state.currentUser.email)
    .flatMap((p) => p.milestones)
    .filter((m) => m.status === "SUBMITTED")
    .reduce((sum, m) => sum + (m.amount - releaseFee(m.amount)), 0);

  return {
    available: state.currentUser.walletAvailable,
    inEscrow: Math.round(inEscrow * 100) / 100,
    pendingEarnings: Math.round(pendingEarnings * 100) / 100,
  };
}

/**
 * RELEASE payments are visible to both sides of a project (see
 * getViewForUser), but they mean opposite things to each — money leaving the
 * client's escrow is money landing in the freelancer's balance. DEPOSIT/
 * WITHDRAWAL are always scoped to the account that made them, so they're
 * unambiguous.
 */
export function paymentDirection(payment: Payment, state: MockState): "in" | "out" {
  if (payment.type === "WITHDRAWAL") return "out";
  if (payment.type === "DEPOSIT" || payment.type === "REFUND") return "in";

  const project = state.projects.find((p) => p.id === payment.projectId);
  if (!project) return "in";
  return project.freelancerEmail === state.currentUser.email ? "in" : "out";
}

export function submitMilestone(projectId: string, milestoneId: string, note: string, actingEmail: string): void {
  const project = findProject(projectId);
  requireFreelancer(project, actingEmail);
  const milestone = project.milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new MockServiceError(`Milestone ${milestoneId} not found`);

  if (!project.escrowFunded) {
    throw new MockServiceError(
      "This project's escrow hasn't been funded yet. Ask the client to fund escrow before submitting work."
    );
  }
  if (milestone.status !== "PENDING" && milestone.status !== "REJECTED") {
    throw new MockServiceError(`Milestone cannot be submitted from status ${milestone.status}`);
  }

  const now = new Date().toISOString();
  replaceProject({
    ...project,
    milestones: project.milestones.map((m) =>
      m.id !== milestoneId
        ? m
        : { ...m, status: "SUBMITTED", submittedAt: now, submissionNote: note, rejectionReason: undefined }
    ),
  });

  pushNotification(
    project.clientEmail,
    "MILESTONE_SUBMITTED",
    "Milestone submitted for review",
    `${milestone.title} on ${project.title} is ready for your review.`,
    projectId
  );

  emit();
}

export function approveMilestone(projectId: string, milestoneId: string, actingEmail: string): void {
  const project = findProject(projectId);
  requireClient(project, actingEmail);
  const milestone = project.milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new MockServiceError(`Milestone ${milestoneId} not found`);
  if (milestone.status !== "SUBMITTED") {
    throw new MockServiceError(`Milestone cannot be approved from status ${milestone.status}`);
  }

  const now = new Date().toISOString();
  const fee = releaseFee(milestone.amount);
  const net = Math.round((milestone.amount - fee) * 100) / 100;

  const updatedProject: Project = {
    ...project,
    milestones: project.milestones.map((m) =>
      m.id !== milestoneId ? m : { ...m, status: "RELEASED" as const, approvedAt: now, releasedAt: now }
    ),
    escrowBalance: Math.round((project.escrowBalance - milestone.amount) * 100) / 100,
  };
  updatedProject.status = allReleased(updatedProject) ? "COMPLETED" : updatedProject.status;
  replaceProject(updatedProject);
  creditWallet(project.freelancerEmail, net);

  const payment: Payment = {
    id: `pay-${Date.now()}-${milestoneId}`,
    projectId,
    projectTitle: project.title,
    type: "RELEASE",
    amount: net,
    fee,
    status: "COMPLETED",
    createdAt: now,
    counterparty: project.clientName,
  };
  shared.payments = [payment, ...shared.payments];

  pushNotification(
    project.freelancerEmail,
    "MILESTONE_APPROVED",
    "Milestone approved",
    `${milestone.title} on ${project.title} was approved — $${net.toFixed(2)} was released to your balance.`,
    projectId
  );

  emit();
}

export function requestChanges(projectId: string, milestoneId: string, reason: string, actingEmail: string): void {
  const project = findProject(projectId);
  requireClient(project, actingEmail);
  const milestone = project.milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new MockServiceError(`Milestone ${milestoneId} not found`);
  if (milestone.status !== "SUBMITTED") {
    throw new MockServiceError(`Cannot request changes on milestone with status ${milestone.status}`);
  }

  const now = new Date().toISOString();
  replaceProject({
    ...project,
    milestones: project.milestones.map((m) =>
      m.id !== milestoneId ? m : { ...m, status: "REJECTED", rejectedAt: now, rejectionReason: reason }
    ),
  });

  pushNotification(
    project.freelancerEmail,
    "MILESTONE_REJECTED",
    "Changes requested",
    `The client asked for changes on ${milestone.title} (${project.title}).`,
    projectId
  );

  emit();
}

export function findDisputeForMilestone(state: MockState, projectId: string, milestoneId: string): Dispute | undefined {
  return state.disputes.find((d) => d.projectId === projectId && d.milestoneId === milestoneId);
}

export function openDispute(
  projectId: string,
  milestoneId: string,
  actingEmail: string,
  initiatorName: string,
  reason: string
): void {
  const project = findProject(projectId);
  requireParty(project, actingEmail);
  const milestone = project.milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new MockServiceError(`Milestone ${milestoneId} not found`);
  if (milestone.status === "DISPUTED") {
    throw new MockServiceError("This milestone already has an open dispute");
  }
  if (!reason.trim()) {
    throw new MockServiceError("Explain the reason for the dispute");
  }

  const now = new Date();
  const dispute: Dispute = {
    id: `dispute-${Date.now()}`,
    projectId,
    milestoneId,
    initiatorId: findUserByEmail(actingEmail)?.id ?? actingEmail,
    initiatorName,
    reason,
    createdAt: now.toISOString(),
    expectedResolutionAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  };
  shared.disputes = [dispute, ...shared.disputes];

  replaceProject({
    ...project,
    status: "DISPUTED",
    milestones: project.milestones.map((m) => (m.id !== milestoneId ? m : { ...m, status: "DISPUTED" })),
  });

  const counterpartyEmail = actingEmail === project.clientEmail ? project.freelancerEmail : project.clientEmail;
  pushNotification(
    counterpartyEmail,
    "DISPUTE_OPENED",
    "Dispute opened",
    `${initiatorName} opened a dispute on ${milestone.title} (${project.title}).`,
    projectId
  );

  emit();
}

export function resolveDispute(
  projectId: string,
  milestoneId: string,
  outcome: DisputeOutcome,
  split?: number
): void {
  const project = findProject(projectId);
  const dispute = shared.disputes.find(
    (d) => d.projectId === projectId && d.milestoneId === milestoneId && !d.resolved
  );
  if (!dispute) {
    throw new MockServiceError("No open dispute found for this milestone");
  }

  const now = new Date().toISOString();
  const clientSplitPercent = outcome === "SPLIT" ? Math.min(100, Math.max(0, split ?? 50)) : undefined;

  shared.disputes = shared.disputes.map((d) =>
    d.id !== dispute.id ? d : { ...d, resolved: true, resolvedAt: now, outcome, clientSplitPercent }
  );

  pushNotification(
    project.clientEmail,
    "DISPUTE_RESOLVED",
    "Dispute resolved",
    `The dispute on ${project.title} was resolved.`,
    projectId
  );
  pushNotification(
    project.freelancerEmail,
    "DISPUTE_RESOLVED",
    "Dispute resolved",
    `The dispute on ${project.title} was resolved.`,
    projectId
  );

  emit();
}

export function fundEscrow(projectId: string, actingEmail: string): void {
  const project = findProject(projectId);
  requireClient(project, actingEmail);
  if (project.status !== "AWAITING_DEPOSIT") {
    throw new MockServiceError("Only projects awaiting deposit can be funded");
  }
  const client = findUserByEmail(actingEmail);
  if (!client || client.walletAvailable < project.budget) {
    throw new MockServiceError("Insufficient balance to fund escrow. Deposit funds first.");
  }

  creditWallet(actingEmail, -project.budget);
  replaceProject({ ...project, escrowFunded: true, escrowBalance: project.budget, status: "ACTIVE" });

  pushNotification(
    project.freelancerEmail,
    "ESCROW_FUNDED",
    "Escrow funded",
    `${project.clientName} funded escrow for ${project.title} — you can start submitting work.`,
    projectId
  );

  emit();
}

export function withdraw(actingEmail: string, amount: number, destination: WithdrawDestination): void {
  if (amount <= 0) throw new MockServiceError("Enter an amount greater than zero");
  const user = findUserByEmail(actingEmail);
  if (!user) throw new MockServiceError("Account not found");

  const fee = WITHDRAW_FEES[destination].fee(amount);
  const total = Math.round((amount + fee) * 100) / 100;
  if (total > user.walletAvailable) {
    throw new MockServiceError("Insufficient balance for this withdrawal");
  }

  creditWallet(actingEmail, -total);

  const payment: Payment = {
    id: `pay-${Date.now()}-withdraw`,
    projectId: "",
    projectTitle: "Withdrawal",
    type: "WITHDRAWAL",
    amount,
    fee,
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
    counterparty: WITHDRAW_FEES[destination].label,
    userEmail: actingEmail,
  };
  shared.payments = [payment, ...shared.payments];

  emit();
}

export function deposit(actingEmail: string, amount: number, method: DepositMethod): void {
  if (amount <= 0) throw new MockServiceError("Enter an amount greater than zero");
  const fee = DEPOSIT_FEES[method].fee(amount);
  const net = Math.round((amount - fee) * 100) / 100;

  creditWallet(actingEmail, net);

  const payment: Payment = {
    id: `pay-${Date.now()}-deposit`,
    projectId: "",
    projectTitle: "Deposit",
    type: "DEPOSIT",
    amount,
    fee,
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
    counterparty: DEPOSIT_FEES[method].label,
    userEmail: actingEmail,
  };
  shared.payments = [payment, ...shared.payments];

  emit();
}

export interface CreateProjectInput {
  title: string;
  description: string;
  freelancerEmail: string;
  milestones: { title: string; description: string; amount: number }[];
}

export function createProject(clientEmail: string, input: CreateProjectInput): Project {
  const client = findUserByEmail(clientEmail);
  if (!client) throw new MockServiceError("Account not found");
  if (client.role !== "CLIENT") {
    throw new MockServiceError("Only client accounts can create projects");
  }
  if (normalizeEmail(input.freelancerEmail) === client.email) {
    throw new MockServiceError("You can't invite yourself as the freelancer");
  }

  const existingInvitee = findUserByEmail(input.freelancerEmail);
  if (existingInvitee && existingInvitee.role !== "FREELANCER") {
    throw new MockServiceError("This email belongs to a client account and can't be invited as a freelancer");
  }

  const derivedName = input.freelancerEmail.split("@")[0] || "Freelancer";
  const freelancer = ensureUser(
    input.freelancerEmail,
    derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
    "FREELANCER"
  );

  const now = new Date().toISOString();
  const budget = Math.round(input.milestones.reduce((sum, m) => sum + m.amount, 0) * 100) / 100;
  const id = `proj-${Date.now()}`;

  const project: Project = {
    id,
    title: input.title,
    description: input.description,
    clientId: client.id,
    clientName: client.name,
    clientEmail: client.email,
    freelancerId: freelancer.id,
    freelancerName: freelancer.name,
    freelancerEmail: freelancer.email,
    status: "AWAITING_DEPOSIT",
    budget,
    escrowFunded: false,
    escrowBalance: 0,
    createdAt: now,
    milestones: input.milestones.map((m, index) => ({
      id: `${id}-m-${index + 1}`,
      projectId: id,
      title: m.title,
      description: m.description,
      amount: m.amount,
      status: "PENDING",
      order: index + 1,
    })),
  };

  shared.projects = [project, ...shared.projects];

  pushNotification(
    freelancer.email,
    "PROJECT_CREATED",
    "You were invited to a new project",
    `${client.name} invited you to work on ${project.title}.`,
    id
  );

  emit();
  return project;
}

export function sendMessage(projectId: string, actingEmail: string, actingName: string, body: string): void {
  const project = findProject(projectId);
  requireParty(project, actingEmail);

  const message: Message = {
    id: `msg-${Date.now()}`,
    projectId,
    senderId: findUserByEmail(actingEmail)?.id ?? actingEmail,
    senderName: actingName,
    body,
    createdAt: new Date().toISOString(),
  };
  shared.messages = [...shared.messages, message];
  emit();
}

export function uploadFile(projectId: string, actingEmail: string, actingName: string, name: string, sizeKb: number): void {
  const project = findProject(projectId);
  requireParty(project, actingEmail);

  const file: ProjectFile = {
    id: `file-${Date.now()}`,
    projectId,
    name,
    sizeKb,
    uploadedBy: actingName,
    uploadedAt: new Date().toISOString(),
  };
  shared.files = [...shared.files, file];
  emit();
}

// Email is the identity key everything else (projects, payments, messages) is
// keyed by, so it's deliberately excluded here — changing it would orphan the
// account instead of renaming it. Only display fields like name are mutable.
export function updateProfile(actingEmail: string, updates: Partial<Pick<User, "name">>): void {
  shared.users = shared.users.map((u) => (u.email !== actingEmail ? u : { ...u, ...updates }));
  emit();
}

export function updateNotificationPreference(
  actingEmail: string,
  key: keyof User["notificationPreferences"],
  value: boolean
): void {
  shared.users = shared.users.map((u) =>
    u.email !== actingEmail ? u : { ...u, notificationPreferences: { ...u.notificationPreferences, [key]: value } }
  );
  emit();
}

// The document and selfie images themselves are never passed in here — they
// only ever live as in-memory previews in KYCModal. This backend persists
// its entire state as one JSON blob in localStorage (see `persist` above),
// and that blob holds every account ever created in the browser, forever;
// writing base64 image data into it risks blowing the localStorage quota and
// throwing on the next unrelated write, for a field no other part of the app
// reads. `kycData` here is metadata only.
export function submitKyc(actingEmail: string, kycData: Omit<KycData, "submittedAt">): User {
  const user = findUserByEmail(actingEmail);
  if (!user) throw new MockServiceError("Account not found");
  if (user.kycStatus === "PENDING" || user.kycStatus === "APPROVED") {
    throw new MockServiceError("Verification has already been submitted");
  }

  const updated: User = {
    ...user,
    kycStatus: "PENDING",
    kycData: { ...kycData, submittedAt: new Date().toISOString() },
  };
  shared.users = shared.users.map((u) => (u.email !== actingEmail ? u : updated));
  emit();
  return updated;
}

/** Simulates a reviewer's decision — there's no admin surface in this app, so tests call this directly. */
export function setKycStatus(actingEmail: string, status: KycStatus): void {
  shared.users = shared.users.map((u) => (u.email !== actingEmail ? u : { ...u, kycStatus: status }));
  emit();
}

export function createWallet(actingEmail: string, publicKey: string): void {
  const user = findUserByEmail(actingEmail);
  if (!user) throw new MockServiceError("Account not found");
  if (user.walletAddress) throw new MockServiceError("A wallet already exists for this account");

  shared.users = shared.users.map((u) =>
    u.email !== actingEmail ? u : { ...u, walletAddress: publicKey, walletCreatedAt: new Date().toISOString() }
  );
  emit();
}
