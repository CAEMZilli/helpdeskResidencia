import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginResponse } from "@/types";

interface AuthState {
  user: LoginResponse["user"] | null;
  token: string | null;
  setSession: (session: LoginResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: ({ user, token }) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: "helpdesk-auth" }
  )
);
