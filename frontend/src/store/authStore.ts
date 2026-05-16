import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Token, UserCreate } from "@/types";
import { authAPI } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean; // Track if state has been rehydrated
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: UserCreate) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: async () => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        // This runs after rehydration to validate the token
        const token = localStorage.getItem("token");
        if (!token) {
          set({ isInitialized: true, user: null, token: null });
          return;
        }

        // Check if we already have valid user data from persist (don't re-validate immediately after login)
        const state = useAuthStore.getState();
        if (state.user && state.token === token) {
          set({ isInitialized: true });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authAPI.me();
          set({
            user: response.data,
            token,
            isLoading: false,
            isInitialized: true
          });
        } catch (error) {
          // Don't immediately clear token on error - could be network issue
          // Keep the token and user data if they exist in localStorage
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              set({ user: userData, token, isLoading: false, isInitialized: true });
              return;
            } catch {
              // Invalid stored user data
            }
          }
          // Only clear if truly invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          set({
            user: null,
            token: null,
            isLoading: false,
            isInitialized: true
          });
        }
      },

      login: async (email: string, password: string) => {
        if (typeof window === 'undefined') return false;
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(email, password);
          const { access_token } = response.data;
          localStorage.setItem("token", access_token);

          // Fetch user data
          const userResponse = await authAPI.me();
          const user = userResponse.data;

          // Store user data for persistence
          localStorage.setItem("user", JSON.stringify(user));

          set({ user, token: access_token, isLoading: false, isInitialized: true });
          return true;
        } catch (error: any) {
          const message = error?.response?.data?.detail || error.message || "Login failed";
          set({ error: message, isLoading: false });
          return false;
        }
      },

      register: async (userData: UserCreate) => {
        if (typeof window === 'undefined') return false;
        set({ isLoading: true, error: null });
        try {
          // Register user
          const registerResponse = await authAPI.register(userData);

          // Auto-login after successful registration
          const loginResponse = await authAPI.login(userData.email, userData.password);
          const { access_token } = loginResponse.data;
          localStorage.setItem("token", access_token);

          // Fetch complete user data
          const userResponse = await authAPI.me();
          const user = userResponse.data;

          // Store user data for persistence
          localStorage.setItem("user", JSON.stringify(user));

          set({ user, token: access_token, isLoading: false, isInitialized: true });
          return true;
        } catch (error: any) {
          const message = error?.response?.data?.detail || error.message || "Registration failed";
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem("token");
        if (!token) {
          set({ user: null, isInitialized: true });
          return;
        }
        set({ isLoading: true });
        try {
          const response = await authAPI.me();
          const user = response.data;
          // Store user data for persistence
          localStorage.setItem("user", JSON.stringify(user));
          set({ user, token, isLoading: false, isInitialized: true });
        } catch (error) {
          // Don't clear token immediately - could be network issue
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              set({ user: userData, token, isLoading: false, isInitialized: true });
              return;
            } catch {
              // Invalid stored user data
            }
          }
          localStorage.removeItem("token");
          set({ user: null, token: null, isLoading: false, isInitialized: true });
        }
      },

      setUser: (user: User) => set({ user }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, initialize to validate token
        if (state) {
          state.initialize();
        }
      },
    }
  )
);
