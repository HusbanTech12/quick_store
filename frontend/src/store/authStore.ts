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
          // Token is invalid or expired
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
          set({ user: response.data, token, isLoading: false, isInitialized: true });
        } catch (error) {
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
