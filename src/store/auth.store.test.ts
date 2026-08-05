import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/auth.store";
import { __resetMockBackend } from "@/lib/mock/service";

const INITIAL_STATE = useAuthStore.getState();

function resetStore() {
  useAuthStore.setState(
    { ...INITIAL_STATE, hasHydrated: true },
    true
  );
  window.localStorage.clear();
  document.cookie = "token=; path=/; max-age=0";
  // The mock auth service resolves identities through the shared mock
  // backend, which persists by email independent of this store — reset it
  // too so re-registering the same address in a later test starts fresh.
  __resetMockBackend();
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
    expect(state.userRole).toBe("CLIENT");
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

  it("authenticates on successful register and stores the selected role", async () => {
    await useAuthStore.getState().register("Alex Rivera", "alex@example.com", "password123", "FREELANCER");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe("Alex Rivera");
    expect(state.userRole).toBe("FREELANCER");
    expect(state.user?.role).toBe("FREELANCER");

    const persisted = window.localStorage.getItem("escrowflow-auth");
    expect(persisted).toContain("FREELANCER");
  });

  it("clears state, including role, on logout", async () => {
    await useAuthStore.getState().register("Alex Rivera", "alex@example.com", "password123", "FREELANCER");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().userRole).toBe("FREELANCER");

    vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      href: "",
    } as Location);

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.userRole).toBe("CLIENT");
  });

  it("requests a password reset without authenticating", async () => {
    await useAuthStore.getState().requestPasswordReset("alex@example.com");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it("sets an error when the reset email is invalid", async () => {
    await expect(useAuthStore.getState().requestPasswordReset("not-an-email")).rejects.toThrow();

    expect(useAuthStore.getState().error).toMatch(/valid email/i);
  });

  it("restores persisted auth state via hydrate(), simulating a fresh page load", async () => {
    await useAuthStore.getState().login("alex@example.com", "password123");
    const { token, user } = useAuthStore.getState();
    const persistedSession = window.localStorage.getItem("escrowflow-auth");

    // Wipe the in-memory state the way a fresh page load would start from the
    // store's defaults. useAuthStore.setState() writes through to localStorage
    // too (it's the same persist-wrapped `set`), so restore the previously
    // persisted session afterwards — simulating localStorage still holding a
    // valid session from before the "reload".
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, hasHydrated: false });
    if (persistedSession) window.localStorage.setItem("escrowflow-auth", persistedSession);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // hydrate() is fire-and-forget (matches how it's called from a useEffect),
    // but internally always resolves via a microtask chain, even for
    // synchronous storage like localStorage — so the test awaits the same
    // underlying promise rather than the void-returning action.
    await useAuthStore.persist.rehydrate();

    const state = useAuthStore.getState();
    expect(state.hasHydrated).toBe(true);
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(token);
    expect(state.user?.email).toBe(user?.email);
  });
});
