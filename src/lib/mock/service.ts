import type {
  DepositMethod,
  Message,
  Payment,
  Project,
  ProjectFile,
  User,
  WalletState,
  WithdrawDestination,
} from "@/lib/types";
import { CURRENT_USER, INITIAL_FILES, INITIAL_MESSAGES, INITIAL_PAYMENTS, INITIAL_PROJECTS, INITIAL_WALLET } from "@/lib/mock/data";
import { DEPOSIT_FEES, releaseFee, WITHDRAW_FEES } from "@/lib/fees";

export interface MockState {
  currentUser: User;
  wallet: WalletState;
  projects: Project[];
  payments: Payment[];
  messages: Message[];
  files: ProjectFile[];
}

export class MockServiceError extends Error {}

export function createInitialState(): MockState {
  return {
    currentUser: CURRENT_USER,
    wallet: { ...INITIAL_WALLET },
    projects: INITIAL_PROJECTS.map((p) => ({ ...p, milestones: p.milestones.map((m) => ({ ...m })) })),
    payments: [...INITIAL_PAYMENTS],
    messages: [...INITIAL_MESSAGES],
    files: [...INITIAL_FILES],
  };
}

function findProject(state: MockState, projectId: string): Project {
  const project = state.projects.find((p) => p.id === projectId);
  if (!project) throw new MockServiceError(`Project ${projectId} not found`);
  return project;
}

function allReleased(project: Project): boolean {
  return project.milestones.every((m) => m.status === "RELEASED");
}

export function computeWalletSummary(state: MockState): WalletState {
  const inEscrow = state.projects
    .filter((p) => p.clientId === state.currentUser.id)
    .reduce((sum, p) => sum + p.escrowBalance, 0);

  const pendingEarnings = state.projects
    .filter((p) => p.freelancerId === state.currentUser.id)
    .flatMap((p) => p.milestones)
    .filter((m) => m.status === "SUBMITTED")
    .reduce((sum, m) => sum + (m.amount - releaseFee(m.amount)), 0);

  return {
    available: state.wallet.available,
    inEscrow: Math.round(inEscrow * 100) / 100,
    pendingEarnings: Math.round(pendingEarnings * 100) / 100,
  };
}

export function submitMilestone(
  state: MockState,
  projectId: string,
  milestoneId: string,
  note: string
): MockState {
  const project = findProject(state, projectId);
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

  return {
    ...state,
    projects: state.projects.map((p) =>
      p.id !== projectId
        ? p
        : {
            ...p,
            milestones: p.milestones.map((m) =>
              m.id !== milestoneId
                ? m
                : { ...m, status: "SUBMITTED", submittedAt: now, submissionNote: note, rejectionReason: undefined }
            ),
          }
    ),
  };
}

export function approveMilestone(state: MockState, projectId: string, milestoneId: string): MockState {
  const project = findProject(state, projectId);
  const milestone = project.milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new MockServiceError(`Milestone ${milestoneId} not found`);
  if (milestone.status !== "SUBMITTED") {
    throw new MockServiceError(`Milestone cannot be approved from status ${milestone.status}`);
  }

  const now = new Date().toISOString();
  const fee = releaseFee(milestone.amount);
  const net = Math.round((milestone.amount - fee) * 100) / 100;
  const isCurrentUserFreelancer = project.freelancerId === state.currentUser.id;

  const updatedMilestones = project.milestones.map((m) =>
    m.id !== milestoneId ? m : { ...m, status: "RELEASED" as const, approvedAt: now, releasedAt: now }
  );
  const updatedProject: Project = {
    ...project,
    milestones: updatedMilestones,
    escrowBalance: Math.round((project.escrowBalance - milestone.amount) * 100) / 100,
  };
  updatedProject.status = allReleased(updatedProject) ? "COMPLETED" : updatedProject.status;

  const payment: Payment = {
    id: `pay-${Date.now()}-${milestoneId}`,
    projectId,
    projectTitle: project.title,
    type: "RELEASE",
    amount: net,
    fee,
    status: "COMPLETED",
    createdAt: now,
    counterparty: isCurrentUserFreelancer ? project.clientName : project.freelancerName,
  };

  return {
    ...state,
    wallet: isCurrentUserFreelancer
      ? { ...state.wallet, available: Math.round((state.wallet.available + net) * 100) / 100 }
      : state.wallet,
    projects: state.projects.map((p) => (p.id === projectId ? updatedProject : p)),
    payments: [payment, ...state.payments],
  };
}

export function requestChanges(
  state: MockState,
  projectId: string,
  milestoneId: string,
  reason: string
): MockState {
  const project = findProject(state, projectId);
  const milestone = project.milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new MockServiceError(`Milestone ${milestoneId} not found`);
  if (milestone.status !== "SUBMITTED") {
    throw new MockServiceError(`Cannot request changes on milestone with status ${milestone.status}`);
  }

  const now = new Date().toISOString();

  return {
    ...state,
    projects: state.projects.map((p) =>
      p.id !== projectId
        ? p
        : {
            ...p,
            milestones: p.milestones.map((m) =>
              m.id !== milestoneId ? m : { ...m, status: "REJECTED", rejectedAt: now, rejectionReason: reason }
            ),
          }
    ),
  };
}

export function fundEscrow(state: MockState, projectId: string): MockState {
  const project = findProject(state, projectId);
  if (project.status !== "AWAITING_DEPOSIT") {
    throw new MockServiceError("Only projects awaiting deposit can be funded");
  }
  if (state.wallet.available < project.budget) {
    throw new MockServiceError("Insufficient balance to fund escrow. Deposit funds first.");
  }

  return {
    ...state,
    wallet: { ...state.wallet, available: Math.round((state.wallet.available - project.budget) * 100) / 100 },
    projects: state.projects.map((p) =>
      p.id !== projectId
        ? p
        : { ...p, escrowFunded: true, escrowBalance: project.budget, status: "ACTIVE" }
    ),
  };
}

export function withdraw(state: MockState, amount: number, destination: WithdrawDestination): MockState {
  if (amount <= 0) throw new MockServiceError("Enter an amount greater than zero");
  const fee = WITHDRAW_FEES[destination].fee(amount);
  const total = Math.round((amount + fee) * 100) / 100;
  if (total > state.wallet.available) {
    throw new MockServiceError("Insufficient balance for this withdrawal");
  }

  const now = new Date().toISOString();
  const payment: Payment = {
    id: `pay-${Date.now()}-withdraw`,
    projectId: "",
    projectTitle: "Withdrawal",
    type: "WITHDRAWAL",
    amount,
    fee,
    status: "COMPLETED",
    createdAt: now,
    counterparty: WITHDRAW_FEES[destination].label,
  };

  return {
    ...state,
    wallet: { ...state.wallet, available: Math.round((state.wallet.available - total) * 100) / 100 },
    payments: [payment, ...state.payments],
  };
}

export function deposit(state: MockState, amount: number, method: DepositMethod): MockState {
  if (amount <= 0) throw new MockServiceError("Enter an amount greater than zero");
  const fee = DEPOSIT_FEES[method].fee(amount);
  const net = Math.round((amount - fee) * 100) / 100;

  const now = new Date().toISOString();
  const payment: Payment = {
    id: `pay-${Date.now()}-deposit`,
    projectId: "",
    projectTitle: "Deposit",
    type: "DEPOSIT",
    amount,
    fee,
    status: "COMPLETED",
    createdAt: now,
    counterparty: DEPOSIT_FEES[method].label,
  };

  return {
    ...state,
    wallet: { ...state.wallet, available: Math.round((state.wallet.available + net) * 100) / 100 },
    payments: [payment, ...state.payments],
  };
}

export interface CreateProjectInput {
  title: string;
  description: string;
  freelancerEmail: string;
  milestones: { title: string; description: string; amount: number }[];
}

export function createProject(state: MockState, input: CreateProjectInput): MockState {
  const now = new Date().toISOString();
  const budget = Math.round(input.milestones.reduce((sum, m) => sum + m.amount, 0) * 100) / 100;
  const id = `proj-${Date.now()}`;
  const freelancerName = input.freelancerEmail.split("@")[0] ?? "Freelancer";

  const project: Project = {
    id,
    title: input.title,
    description: input.description,
    clientId: state.currentUser.id,
    clientName: state.currentUser.name,
    freelancerId: `pending-${id}`,
    freelancerName: freelancerName.charAt(0).toUpperCase() + freelancerName.slice(1),
    freelancerEmail: input.freelancerEmail,
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

  return { ...state, projects: [project, ...state.projects] };
}

export function sendMessage(state: MockState, projectId: string, body: string): MockState {
  const message: Message = {
    id: `msg-${Date.now()}`,
    projectId,
    senderId: state.currentUser.id,
    senderName: state.currentUser.name,
    body,
    createdAt: new Date().toISOString(),
  };
  return { ...state, messages: [...state.messages, message] };
}

export function uploadFile(state: MockState, projectId: string, name: string, sizeKb: number): MockState {
  const file: ProjectFile = {
    id: `file-${Date.now()}`,
    projectId,
    name,
    sizeKb,
    uploadedBy: state.currentUser.name,
    uploadedAt: new Date().toISOString(),
  };
  return { ...state, files: [...state.files, file] };
}

export function updateProfile(state: MockState, updates: Partial<Pick<User, "name" | "email">>): MockState {
  return { ...state, currentUser: { ...state.currentUser, ...updates } };
}

export function updateNotificationPreference(
  state: MockState,
  key: keyof User["notificationPreferences"],
  value: boolean
): MockState {
  return {
    ...state,
    currentUser: {
      ...state.currentUser,
      notificationPreferences: { ...state.currentUser.notificationPreferences, [key]: value },
    },
  };
}
