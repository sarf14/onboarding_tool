import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  email: string | null;
  name: string;
  roles: string[];
  mentorId?: string;
  programStartDate?: string;
  currentDay: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (emailOrName: string, password: string, useName?: boolean) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,

  login: async (name: string, password: string, useName: boolean = true) => {
    set({ isLoading: true });
    try {
      // Always use name-based login
      const payload = { name, password };
      
      const response = await api.post('/auth/login', payload);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Clear any old localStorage data (including quiz scores from previous users)
      // Only keep the token - all other data comes from backend
      const oldToken = localStorage.getItem('token');
      localStorage.clear();
      localStorage.setItem('token', token);
      
      set({ token, user, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
      throw errorMessage;
    }
  },

  logout: () => {
    // Clear all localStorage items to prevent cross-user contamination
    localStorage.clear();
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user });
    } catch (error: any) {
      // Clear invalid token
      set({ user: null, token: null });
      localStorage.removeItem('token');
      // Re-throw so calling code can handle it
      throw error;
    }
  },
}));
