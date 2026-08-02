import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id?: string | number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
}

interface AuthState {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null }),
    }),
    { 
      name: 'auth-storage',
      skipHydration: true,
      // Store in localStorage
    }
  )
);
