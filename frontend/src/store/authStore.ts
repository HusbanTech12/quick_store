import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Token, UserCreate } from "@/types";
import { authAPI } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: UserCreate) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(email, password);
          const { access_token } = response.data;
          localStorage.setItem("token", access_token);
          // Fetch user data
          const userResponse = await authAPI.me();
          const user = userResponse.data;
          set({ user, token: access_token, isLoading: false });
          return true;
        } catch (error: any) {
          const message = error.response?.data?.detail || "Login failed";
          set({ error: message, isLoading: false });
          return false;
        }
      },

      register: async (userData: UserCreate) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const user = response.data;
          // Auto login after register? Usually you might auto login or ask to login.
          set({ user, token: null, isLoading: false });
          return true;
        } catch (error: any) {
          const message = error.response?.data?.detail || "Registration failed";
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          set({ user: null });
          return;
        }
        set({ isLoading: true });
        try {
          const response = await authAPI.me();
          set({ user: response.data, token, isLoading: false });
        } catch (error) {
          localStorage.removeItem("token");
          set({ user: null, token: null, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
