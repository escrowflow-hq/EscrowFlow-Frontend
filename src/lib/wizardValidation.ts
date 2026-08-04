export interface WizardMilestoneDraft {
  title: string;
  description: string;
  amount: string;
}

export interface DetailsErrors {
  title?: string;
  description?: string;
}

export interface MilestoneErrors {
  title?: string;
  amount?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateDetails(title: string, description: string): DetailsErrors {
  const errors: DetailsErrors = {};
  if (title.trim().length < 3) {
    errors.title = "Project title must be at least 3 characters";
  }
  if (description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }
  return errors;
}

export function validateFreelancerEmail(email: string): string | undefined {
  if (email.trim().length === 0) {
    return "Freelancer email is required";
  }
  if (!EMAIL_RE.test(email.trim())) {
    return "Enter a valid email address";
  }
  return undefined;
}

export function validateMilestone(milestone: WizardMilestoneDraft): MilestoneErrors {
  const errors: MilestoneErrors = {};
  if (milestone.title.trim().length < 2) {
    errors.title = "Milestone title is required";
  }
  const amount = Number(milestone.amount);
  if (!milestone.amount || Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than $0";
  }
  return errors;
}

export function validateMilestones(milestones: WizardMilestoneDraft[]): MilestoneErrors[] {
  return milestones.map(validateMilestone);
}

export function milestonesAreValid(milestones: WizardMilestoneDraft[]): boolean {
  if (milestones.length === 0) return false;
  return validateMilestones(milestones).every((e) => Object.keys(e).length === 0);
}
