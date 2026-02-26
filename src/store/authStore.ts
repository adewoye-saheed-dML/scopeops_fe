import { create } from "zustand";
import type { UserRead } from "@/types/api";

type AuthState = {
  user: UserRead | null;
  isAuthenticated: boolean;
  setAuth: (payload: { user?: UserRead | null; isAuthenticated: boolean }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: ({ user, isAuthenticated }) => {
    set({
      user: user ?? null,
      isAuthenticated,
    });
  },
  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));
