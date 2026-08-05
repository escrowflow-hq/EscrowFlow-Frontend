import { beforeEach, describe, expect, it } from "vitest";
import { projectsForRole, useAppStore } from "@/lib/store";
import { useAuthStore } from "@/store/auth.store";
import { __resetMockBackend } from "@/lib/mock/service";

const INITIAL_AUTH_STATE = useAuthStore.getState();

function resetStores() {
  useAuthStore.setState({ ...INITIAL_AUTH_STATE, hasHydrated: true }, true);
  window.localStorage.clear();
  document.cookie = "token=; path=/; max-age=0";
  __resetMockBackend();
}

// mock/service.test.ts already proves the backend's own data model is
// correct in isolation. This file instead drives the actual hooks the UI
// uses (useAuthStore + useAppStore together) and switches identity mid-test
// — the same thing opening a second browser tab and logging in as a
// different account does — to verify the reactive wiring between them, not
// just the underlying data.
describe("useAppStore reacts to switching the authenticated identity", () => {
  beforeEach(() => {
    resetStores();
  });

  it("shows a client-created project in the invited freelancer's own view after switching identity", async () => {
    await useAuthStore.getState().register("Casey Client", "casey-client@example.com", "password123", "CLIENT");

    useAppStore.getState().createProject({
      title: "Website Redesign",
      description: "New marketing site",
      freelancerEmail: "jordan-freelancer@example.com",
      milestones: [{ title: "Design", description: "Wireframes", amount: 500 }],
    });

    expect(useAppStore.getState().error).toBeNull();
    expect(useAppStore.getState().state.projects.map((p) => p.title)).toContain("Website Redesign");

    // Log in as the invited freelancer — a fresh session, same as opening a
    // second browser tab and logging into a different account there.
    await useAuthStore.getState().login("jordan-freelancer@example.com", "password123", "FREELANCER");

    const freelancerState = useAppStore.getState().state;
    expect(freelancerState.currentUser.email).toBe("jordan-freelancer@example.com");
    expect(freelancerState.projects.map((p) => p.title)).toContain("Website Redesign");
    expect(projectsForRole(freelancerState, "FREELANCER").map((p) => p.title)).toContain("Website Redesign");
  });

  it("does not leak a project to a freelancer account that was never invited to it", async () => {
    await useAuthStore.getState().register("Casey Client", "casey-client-2@example.com", "password123", "CLIENT");
    useAppStore.getState().createProject({
      title: "Private Project",
      description: "Only visible to the invited freelancer",
      freelancerEmail: "invited-freelancer@example.com",
      milestones: [{ title: "Design", description: "Wireframes", amount: 500 }],
    });

    await useAuthStore.getState().login("uninvolved-freelancer@example.com", "password123", "FREELANCER");

    expect(useAppStore.getState().state.projects.map((p) => p.title)).not.toContain("Private Project");
  });
});
