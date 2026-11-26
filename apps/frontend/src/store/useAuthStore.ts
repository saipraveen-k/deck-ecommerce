import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role?: 'USER' | 'ADMIN' | string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Store the logged-in user (the auth token itself lives in an httpOnly cookie). */
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'deck-auth' },
  ),
);
