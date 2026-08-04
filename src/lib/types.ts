export type UserRole = "CLIENT" | "FREELANCER";

export type KycStatus = "NOT_STARTED" | "PENDING" | "APPROVED" | "REJECTED";

export type ProjectStatus =
  | "DRAFT"
  | "AWAITING_DEPOSIT"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type MilestoneStatus =
  | "PENDING"
  | "SUBMITTED"
  | "APPROVED"
  | "RELEASED"
  | "REJECTED"
  | "DISPUTED";

export type DisputeOutcome = "CLIENT" | "FREELANCER" | "SPLIT";

export type PaymentType = "DEPOSIT" | "RELEASE" | "WITHDRAWAL" | "REFUND";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export type WithdrawDestination = "BANK" | "MOBILE_MONEY" | "CRYPTO_WALLET";

export type DepositMethod = "CARD" | "BANK" | "USDC";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  kycStatus: KycStatus;
  walletAddress: string;
  avatarColor: string;
  createdAt: string;
  notificationPreferences: {
    milestoneUpdates: boolean;
    payments: boolean;
    messages: boolean;
    marketing: boolean;
  };
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  order: number;
  submittedAt?: string;
  submissionNote?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  releasedAt?: string;
}

export interface Dispute {
  id: string;
  projectId: string;
  milestoneId: string;
  initiatorId: string;
  initiatorName: string;
  reason: string;
  createdAt: string;
  expectedResolutionAt: string;
  resolved: boolean;
  resolvedAt?: string;
  outcome?: DisputeOutcome;
  clientSplitPercent?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  status: ProjectStatus;
  budget: number;
  escrowFunded: boolean;
  escrowBalance: number;
  createdAt: string;
  milestones: Milestone[];
}

export interface Payment {
  id: string;
  projectId: string;
  projectTitle: string;
  type: PaymentType;
  amount: number;
  fee: number;
  status: PaymentStatus;
  createdAt: string;
  counterparty: string;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  sizeKb: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface WithdrawMethod {
  id: string;
  destination: WithdrawDestination;
  label: string;
  detail: string;
  feeLabel: string;
  fee: (amount: number) => number;
}

export interface DepositMethodOption {
  id: string;
  method: DepositMethod;
  label: string;
  detail: string;
  feeLabel: string;
  fee: (amount: number) => number;
}

export interface WalletState {
  available: number;
  pendingEarnings: number;
  inEscrow: number;
}
