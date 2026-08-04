"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, AuthError } from "@/services/auth.service";
import type { User } from "@/lib/types";

const TOKEN_COOKIE = "token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function setTokenCookie(token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function clearTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

interface AuthStore {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      isLoading: false,
      error: null,
      hasHydrated: false,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authService.login(email, password);
          setTokenCookie(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          const message = err instanceof AuthError ? err.message : "Something went wrong. Try again.";
          set({ isLoading: false, error: message });
          throw err;
        }
      },
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authService.register(name, email, password);
          setTokenCookie(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          const message = err instanceof AuthError ? err.message : "Something went wrong. Try again.";
          set({ isLoading: false, error: message });
          throw err;
        }
      },
      requestPasswordReset: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authService.requestPasswordReset(email);
          set({ isLoading: false });
        } catch (err) {
          const message = err instanceof AuthError ? err.message : "Something went wrong. Try again.";
          set({ isLoading: false, error: message });
          throw err;
        }
      },
      logout: () => {
        clearTokenCookie();
        set({ user: null, token: null, isAuthenticated: false, error: null });
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },
      clearError: () => set({ error: null }),
      hydrate: () => {
        void useAuthStore.persist.rehydrate();
      },
    }),
    {
      name: "escrowflow-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
      // The server has no localStorage, so it always renders the "not hydrated yet"
      // state. If the client rehydrated automatically at module-eval time (before
      // React's first paint), its first render would already show the persisted
      // auth state — mismatching the server's HTML and breaking hydration. Skipping
      // auto-hydration and triggering it explicitly from an effect (see AuthGuard)
      // keeps the client's first render identical to the server's.
      skipHydration: true,
    }
  )
);
