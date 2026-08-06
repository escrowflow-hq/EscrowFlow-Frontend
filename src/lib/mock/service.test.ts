import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetMockBackend,
  approveMilestone,
  createProject,
  deposit,
  fundEscrow,
  getViewForUser,
  MockServiceError,
  paymentDirection,
  submitMilestone,
  upsertUserForAuth,
} from "@/lib/mock/service";
import { projectsForRole } from "@/lib/store";
import { releaseFee } from "@/lib/fees";

const CLIENT_EMAIL = "client@example.com";
const FREELANCER_EMAIL = "freelancer@example.com";

function fundClientWallet(amount: number) {
  deposit(CLIENT_EMAIL, amount, "USDC");
}

function buildSingleMilestoneProject(amount: number) {
  upsertUserForAuth(CLIENT_EMAIL, "Test Client", "CLIENT");
  fundClientWallet(amount);
  const project = createProject(CLIENT_EMAIL, {
    title: "Test project",
    description: "A project used for service tests",
    freelancerEmail: FREELANCER_EMAIL,
    milestones: [{ title: "Only milestone", description: "The only deliverable", amount }],
  });
  return { project, milestone: project.milestones[0]! };
}

describe("shared mock backend", () => {
  beforeEach(() => {
    __resetMockBackend();
  });

  describe("approveMilestone", () => {
    it("releases funds minus the platform fee and completes the project when all milestones are released", () => {
      const amount = 1000;
      const { project, milestone } = buildSingleMilestoneProject(amount);

      fundEscrow(project.id, CLIENT_EMAIL);
      submitMilestone(project.id, milestone.id, "Delivered the work", FREELANCER_EMAIL);
      approveMilestone(project.id, milestone.id, CLIENT_EMAIL);

      const clientView = getViewForUser(CLIENT_EMAIL);
      const updatedProject = clientView.projects.find((p) => p.id === project.id)!;
      const updatedMilestone = updatedProject.milestones[0]!;

      const fee = releaseFee(amount);
      expect(updatedMilestone.status).toBe("RELEASED");
      expect(updatedProject.status).toBe("COMPLETED");
      expect(updatedProject.escrowBalance).toBe(0);

      const payment = clientView.payments.find((p) => p.type === "RELEASE")!;
      expect(payment.fee).toBe(fee);
      expect(payment.amount).toBe(Math.round((amount - fee) * 100) / 100);
    });

    it("does not complete the project while other milestones remain unreleased", () => {
      upsertUserForAuth(CLIENT_EMAIL, "Test Client", "CLIENT");
      fundClientWallet(1000);
      const project = createProject(CLIENT_EMAIL, {
        title: "Multi-milestone project",
        description: "Has two milestones",
        freelancerEmail: FREELANCER_EMAIL,
        milestones: [
          { title: "First", description: "First milestone", amount: 400 },
          { title: "Second", description: "Second milestone", amount: 600 },
        ],
      });
      const first = project.milestones[0]!;

      fundEscrow(project.id, CLIENT_EMAIL);
      submitMilestone(project.id, first.id, "First half done", FREELANCER_EMAIL);
      approveMilestone(project.id, first.id, CLIENT_EMAIL);

      const approvedProject = getViewForUser(CLIENT_EMAIL).projects.find((p) => p.id === project.id)!;
      expect(approvedProject.status).not.toBe("COMPLETED");
      expect(approvedProject.status).toBe("ACTIVE");
    });

    it("throws when approving a milestone that has not been submitted", () => {
      const { project, milestone } = buildSingleMilestoneProject(200);
      fundEscrow(project.id, CLIENT_EMAIL);

      expect(() => approveMilestone(project.id, milestone.id, CLIENT_EMAIL)).toThrow(MockServiceError);
    });

    it("rejects approval attempts from someone other than the project's client", () => {
      const { project, milestone } = buildSingleMilestoneProject(300);
      fundEscrow(project.id, CLIENT_EMAIL);
      submitMilestone(project.id, milestone.id, "Done", FREELANCER_EMAIL);

      expect(() => approveMilestone(project.id, milestone.id, FREELANCER_EMAIL)).toThrow(MockServiceError);
    });
  });

  describe("createProject", () => {
    it("makes a client-created project visible in the freelancer's own project list immediately", () => {
      upsertUserForAuth(CLIENT_EMAIL, "Test Client", "CLIENT");
      const project = createProject(CLIENT_EMAIL, {
        title: "Website Redesign",
        description: "New marketing site",
        freelancerEmail: FREELANCER_EMAIL,
        milestones: [{ title: "Design", description: "Wireframes", amount: 500 }],
      });

      expect(projectsForRole(getViewForUser(CLIENT_EMAIL), "CLIENT")).toContainEqual(project);
      expect(projectsForRole(getViewForUser(FREELANCER_EMAIL), "FREELANCER")).toContainEqual(project);
    });

    it("is visible to the freelancer even when the invite email and login email differ in case or whitespace", () => {
      upsertUserForAuth(CLIENT_EMAIL, "Test Client", "CLIENT");
      const project = createProject(CLIENT_EMAIL, {
        title: "Website Redesign",
        description: "New marketing site",
        freelancerEmail: "  Test.Freelancer@Example.com  ",
        milestones: [{ title: "Design", description: "Wireframes", amount: 500 }],
      });

      const freelancerView = getViewForUser("test.freelancer@example.com");
      expect(projectsForRole(freelancerView, "FREELANCER")).toContainEqual(project);
    });

    it("rejects creation from a freelancer account", () => {
      upsertUserForAuth(FREELANCER_EMAIL, "Test Freelancer", "FREELANCER");

      expect(() =>
        createProject(FREELANCER_EMAIL, {
          title: "Should not work",
          description: "Freelancers can't create projects",
          freelancerEmail: "someone-else@example.com",
          milestones: [{ title: "Design", description: "Wireframes", amount: 500 }],
        })
      ).toThrow(MockServiceError);
    });

    it("rejects inviting an existing client account as the freelancer", () => {
      upsertUserForAuth(CLIENT_EMAIL, "Test Client", "CLIENT");
      const otherClientEmail = "other-client@example.com";
      upsertUserForAuth(otherClientEmail, "Other Client", "CLIENT");

      expect(() =>
        createProject(CLIENT_EMAIL, {
          title: "Website Redesign",
          description: "New marketing site",
          freelancerEmail: otherClientEmail,
          milestones: [{ title: "Design", description: "Wireframes", amount: 500 }],
        })
      ).toThrow(MockServiceError);
    });

    it("rejects inviting yourself as the freelancer", () => {
      upsertUserForAuth(CLIENT_EMAIL, "Test Client", "CLIENT");

      expect(() =>
        createProject(CLIENT_EMAIL, {
          title: "Website Redesign",
          description: "New marketing site",
          freelancerEmail: CLIENT_EMAIL,
          milestones: [{ title: "Design", description: "Wireframes", amount: 500 }],
        })
      ).toThrow(MockServiceError);
    });

    it("runs the full escrow flow: fund, submit, approve, and credit the freelancer's balance minus the platform fee", () => {
      upsertUserForAuth(CLIENT_EMAIL, "Test Client", "CLIENT");
      fundClientWallet(500);
      const project = createProject(CLIENT_EMAIL, {
        title: "Website Redesign",
        description: "New marketing site",
        freelancerEmail: FREELANCER_EMAIL,
        milestones: [{ title: "Design", description: "Wireframes", amount: 500 }],
      });
      const milestone = project.milestones[0]!;
      const freelancerBefore = getViewForUser(FREELANCER_EMAIL).currentUser.walletAvailable;

      fundEscrow(project.id, CLIENT_EMAIL);
      expect(getViewForUser(FREELANCER_EMAIL).projects.find((p) => p.id === project.id)!.status).toBe("ACTIVE");

      submitMilestone(project.id, milestone.id, "Wireframes are ready", FREELANCER_EMAIL);
      approveMilestone(project.id, milestone.id, CLIENT_EMAIL);

      const fee = releaseFee(500);
      const freelancerAfter = getViewForUser(FREELANCER_EMAIL).currentUser.walletAvailable;
      expect(freelancerAfter).toBe(Math.round((freelancerBefore + (500 - fee)) * 100) / 100);
      expect(getViewForUser(CLIENT_EMAIL).projects.find((p) => p.id === project.id)!.status).toBe("COMPLETED");
    });
  });

  describe("submitMilestone", () => {
    it("is blocked when the project's escrow has not been funded", () => {
      const { project, milestone } = buildSingleMilestoneProject(500);

      expect(project.escrowFunded).toBe(false);
      expect(() => submitMilestone(project.id, milestone.id, "Trying to submit early", FREELANCER_EMAIL)).toThrow(
        MockServiceError
      );
      expect(() => submitMilestone(project.id, milestone.id, "Trying to submit early", FREELANCER_EMAIL)).toThrow(
        /escrow/i
      );
    });

    it("succeeds once escrow is funded", () => {
      const { project, milestone } = buildSingleMilestoneProject(500);
      fundEscrow(project.id, CLIENT_EMAIL);

      submitMilestone(project.id, milestone.id, "Ready for review", FREELANCER_EMAIL);
      const submittedMilestone = getViewForUser(FREELANCER_EMAIL)
        .projects.find((p) => p.id === project.id)!
        .milestones.find((m) => m.id === milestone.id)!;
      expect(submittedMilestone.status).toBe("SUBMITTED");
    });

    it("rejects submissions from someone other than the project's freelancer", () => {
      const { project, milestone } = buildSingleMilestoneProject(500);
      fundEscrow(project.id, CLIENT_EMAIL);

      expect(() => submitMilestone(project.id, milestone.id, "Not my project", CLIENT_EMAIL)).toThrow(
        MockServiceError
      );
    });
  });

  describe("paymentDirection", () => {
    it("shows a milestone release as money in for the freelancer and money out for the client", () => {
      const { project, milestone } = buildSingleMilestoneProject(500);
      fundEscrow(project.id, CLIENT_EMAIL);
      submitMilestone(project.id, milestone.id, "Done", FREELANCER_EMAIL);
      approveMilestone(project.id, milestone.id, CLIENT_EMAIL);

      const clientView = getViewForUser(CLIENT_EMAIL);
      const freelancerView = getViewForUser(FREELANCER_EMAIL);
      const releasePayment = clientView.payments.find((p) => p.type === "RELEASE")!;

      expect(paymentDirection(releasePayment, clientView)).toBe("out");
      expect(paymentDirection(releasePayment, freelancerView)).toBe("in");
    });
  });
});
