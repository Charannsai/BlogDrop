import { create } from 'zustand';
import { User } from '../types';
import { 
  signInUser, 
  signUpUser, 
  signOutUser, 
  getCurrentUser,
  isSubdomainAvailable 
} from '../lib/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, subdomain: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  checkSubdomain: (subdomain: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await signInUser(email, password);
      const user = data.user;
      
      set({
        user: {
          id: user.id,
          email: user.email!,
          displayName: user.user_metadata.display_name || 'User',
          subdomain: user.user_metadata.subdomain,
          createdAt: user.created_at
        },
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signUp: async (email, password, displayName, subdomain) => {
    set({ isLoading: true, error: null });
    try {
      const isAvailable = await isSubdomainAvailable(subdomain);
      if (!isAvailable) {
        throw new Error('Subdomain already taken. Please choose another one.');
      }
      
      const data = await signUpUser(email, password, displayName, subdomain);
      const user = data.user;
      
      if (user) {
        set({
          user: {
            id: user.id,
            email: user.email!,
            displayName: user.user_metadata.display_name,
            subdomain: user.user_metadata.subdomain,
            createdAt: user.created_at
          },
          isLoading: false
        });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOutUser();
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getCurrentUser();
      if (user) {
        set({
          user: {
            id: user.id,
            email: user.email!,
            displayName: user.user_metadata.display_name || 'User',
            subdomain: user.user_metadata.subdomain,
            createdAt: user.created_at
          },
          isLoading: false
        });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },

  checkSubdomain: async (subdomain) => {
    try {
      return await isSubdomainAvailable(subdomain);
    } catch (error) {
      set({ error: (error as Error).message });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));