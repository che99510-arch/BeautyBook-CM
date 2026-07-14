'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiService from '@/services/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

interface AuthStore {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AdminUser | null) => void;
  clearError: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        console.log('Attempting login for:', email);
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.login(email, password);
          console.log('Login response:', response);

          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
        } catch (error) {
          console.error('Login error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
        apiService.logout();
      },

      setUser: (user: AdminUser | null) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// React Context for providing store to components
interface AuthContextType {
  store: AuthStore;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();

  return (
    <AuthContext.Provider value={{ store }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthStore {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context.store;
}
