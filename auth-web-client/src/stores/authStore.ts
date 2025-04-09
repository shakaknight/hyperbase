import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  fullName: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      set({ 
        token, 
        user, 
        isAuthenticated: true, 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.response?.data?.error || 'Login failed' 
      });
      throw error;
    }
  },
  
  register: async (email, password, fullName) => {
    try {
      set({ loading: true, error: null });
      
      await axios.post('/api/auth/register', { email, password, fullName });
      
      set({ loading: false });
      
      // Login after successful registration
      await get().login(email, password);
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.response?.data?.error || 'Registration failed' 
      });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      set({ loading: true });
      
      const token = get().token;
      if (token) {
        await axios.post('/api/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      localStorage.removeItem('token');
      
      set({ 
        token: null, 
        user: null, 
        isAuthenticated: false, 
        loading: false 
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still clear auth state even if the API call fails
      localStorage.removeItem('token');
      
      set({ 
        token: null, 
        user: null, 
        isAuthenticated: false, 
        loading: false 
      });
    }
  },
  
  checkAuth: async () => {
    try {
      set({ loading: true });
      
      const token = get().token;
      
      if (!token) {
        set({ 
          isAuthenticated: false, 
          user: null, 
          loading: false 
        });
        return;
      }
      
      const response = await axios.get('/api/auth/validate-token', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        loading: false 
      });
    } catch (error) {
      console.error('Auth check error:', error);
      
      // Clear auth state if token validation fails
      localStorage.removeItem('token');
      
      set({ 
        token: null, 
        user: null, 
        isAuthenticated: false, 
        loading: false 
      });
    }
  },
  
  clearError: () => set({ error: null }),
  
  updateUser: async (userData) => {
    try {
      set({ loading: true, error: null });
      
      const token = get().token;
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await axios.patch('/api/auth/user', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      set({ 
        user: response.data.user, 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.response?.data?.error || 'Failed to update profile' 
      });
      throw error;
    }
  }
})); 