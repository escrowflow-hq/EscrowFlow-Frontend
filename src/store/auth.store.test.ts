import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/auth.store";

const INITIAL_STATE = useAuthStore.getState();

function resetStore() {
  useAuthStore.setState(
    { ...INITIAL_STATE, hasHydrated: true },
    true
  );
  window.localStorage.clear();
  document.cookie = "token=; path=/; max-age=0";
}

describe("useAuthStore", () => {
  beforeEach(() => {
    resetStore();
  });

  it("starts unauthenticated", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it("authenticates on successful login and persists to localStorage", async () => {
    await useAuthStore.getState().login("alex@example.com", "password123");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe("alex@example.com");
    expect(state.token).toEqual(expect.any(String));

    const persisted = window.localStorage.getItem("escrowflow-auth");
    expect(persisted).toContain("alex@example.com");
  });

  it("sets an error and stays unauthenticated on failed login", async () => {
    await expect(useAuthStore.getState().login("alex@example.com", "short")).rejects.toThrow();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toMatch(/at least 8 characters/i);
  });

  it("authenticates on successful register", async () => {
    await useAuthStore.getState().register("Alex Rivera", "alex@example.com", "password123");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe("Alex Rivera");
  });

  it("clears state on logout", async () => {
    await useAuthStore.getState().login("alex@example.com", "password123");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      href: "",
    } as Location);

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});
