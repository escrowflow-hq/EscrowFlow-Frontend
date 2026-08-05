import { describe, expect, it } from "vitest";
import {
  approveMilestone,
  createInitialState,
  createProject,
  fundEscrow,
  MockServiceError,
  submitMilestone,
} from "@/lib/mock/service";
import { projectsForRole } from "@/lib/store";
import { releaseFee } from "@/lib/fees";

function buildSingleMilestoneProject(amount: number) {
  const state = createInitialState();
  const withProject = createProject(state, {
    title: "Test project",
    description: "A project used for service tests",
    freelancerEmail: "freelancer@example.com",
    milestones: [{ title: "Only milestone", description: "The only deliverable", amount }],
  });
  const project = withProject.projects[0]!;
  const milestone = project.milestones[0]!;
  return { state: withProject, project, milestone };
}

describe("approveMilestone", () => {
  it("releases funds minus the platform fee and completes the project when all milestones are released", () => {
    const amount = 1000;
    const { state, project, milestone } = buildSingleMilestoneProject(amount);

    const funded = fundEscrow(state, project.id);
    const submitted = submitMilestone(funded, project.id, milestone.id, "Delivered the work");
    const approved = approveMilestone(submitted, project.id, milestone.id);

    const fee = releaseFee(amount);
    const updatedProject = approved.projects[0]!;
    const updatedMilestone = updatedProject.milestones[0]!;

    expect(updatedMilestone.status).toBe("RELEASED");
    expect(updatedProject.status).toBe("COMPLETED");
    expect(updatedProject.escrowBalance).toBe(0);

    const payment = approved.payments[0]!;
    expect(payment.type).toBe("RELEASE");
    expect(payment.fee).toBe(fee);
    expect(payment.amount).toBe(Math.round((amount - fee) * 100) / 100);
  });

  it("does not complete the project while other milestones remain unreleased", () => {
    const state = createInitialState();
    const withProject = createProject(state, {
      title: "Multi-milestone project",
      description: "Has two milestones",
      freelancerEmail: "freelancer@example.com",
      milestones: [
        { title: "First", description: "First milestone", amount: 400 },
        { title: "Second", description: "Second milestone", amount: 600 },
      ],
    });
    const project = withProject.projects[0]!;
    const first = project.milestones[0]!;

    const funded = fundEscrow(withProject, project.id);
    const submitted = submitMilestone(funded, project.id, first.id, "First half done");
    const approved = approveMilestone(submitted, project.id, first.id);
    const approvedProject = approved.projects[0]!;

    expect(approvedProject.status).not.toBe("COMPLETED");
    expect(approvedProject.status).toBe("ACTIVE");
  });

  it("throws when approving a milestone that has not been submitted", () => {
    const { state, project, milestone } = buildSingleMilestoneProject(200);
    const funded = fundEscrow(state, project.id);

    expect(() => approveMilestone(funded, project.id, milestone.id)).toThrow(MockServiceError);
  });
});

describe("createProject", () => {
  it("makes a client-created project visible in the freelancer's project list after switching roles", () => {
    const state = createInitialState();
    const withProject = createProject(state, {
      title: "Website Redesign",
      description: "New marketing site",
      freelancerEmail: "freelancer@example.com",
      milestones: [{ title: "Design", description: "Wireframes", amount: 500 }],
    });
    const project = withProject.projects[0]!;

    expect(projectsForRole(withProject, "CLIENT")).toContainEqual(project);
    expect(projectsForRole(withProject, "FREELANCER")).toContainEqual(project);
  });

  it("runs the full escrow flow: fund, submit, approve, and credit the wallet minus the platform fee", () => {
    const state = createInitialState();
    const withProject = createProject(state, {
      title: "Website Redesign",
      description: "New marketing site",
      freelancerEmail: "freelancer@example.com",
      milestones: [{ title: "Design", description: "Wireframes", amount: 500 }],
    });
    const project = withProject.projects[0]!;
    const milestone = project.milestones[0]!;

    const funded = fundEscrow(withProject, project.id);
    expect(projectsForRole(funded, "FREELANCER")[0]!.status).toBe("ACTIVE");

    const submitted = submitMilestone(funded, project.id, milestone.id, "Wireframes are ready");
    const approved = approveMilestone(submitted, project.id, milestone.id);

    const fee = releaseFee(500);
    expect(approved.wallet.available).toBe(
      Math.round((funded.wallet.available + (500 - fee)) * 100) / 100
    );
    expect(approved.projects[0]!.status).toBe("COMPLETED");
  });
});

describe("submitMilestone", () => {
  it("is blocked when the project's escrow has not been funded", () => {
    const { state, project, milestone } = buildSingleMilestoneProject(500);

    expect(project.escrowFunded).toBe(false);
    expect(() => submitMilestone(state, project.id, milestone.id, "Trying to submit early")).toThrow(
      MockServiceError
    );
    expect(() => submitMilestone(state, project.id, milestone.id, "Trying to submit early")).toThrow(
      /escrow/i
    );
  });

  it("succeeds once escrow is funded", () => {
    const { state, project, milestone } = buildSingleMilestoneProject(500);
    const funded = fundEscrow(state, project.id);

    const submitted = submitMilestone(funded, project.id, milestone.id, "Ready for review");
    expect(submitted.projects[0]!.milestones[0]!.status).toBe("SUBMITTED");
  });
});
