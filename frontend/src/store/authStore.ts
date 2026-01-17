import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      console.log('Attempting login with:', { email, apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' });
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
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
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      });
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
      console.log('Fetching user...');
      const response = await api.get('/auth/me');
      console.log('User fetched:', response.data.user);
      set({ user: response.data.user });
    } catch (error: any) {
      console.error('Failed to fetch user:', error);
      console.error('Error details:', error.response?.data);
      set({ user: null, token: null });
      localStorage.removeItem('token');
      throw error;
    }
  },
}));
