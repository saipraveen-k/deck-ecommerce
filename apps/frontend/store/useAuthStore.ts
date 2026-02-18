import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'CUSTOMER' | 'ADMIN';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (userData) => set({ user: userData, isAuthenticated: true }),
            logout: async () => {
                try {
                    // Call backend logout if endpoint exists (to clear cookie)
                    // await api.post('/auth/logout'); 
                } catch (e) { }
                set({ user: null, isAuthenticated: false });
            },
            checkAuth: async () => {
                // Optional: Verify token existence or validity via API
                // For now, persist handles state, but better to validate on mount
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);
