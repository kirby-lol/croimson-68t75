import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/supabase';
import { lastWatchedService } from '../services/lastWatched';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user
    authService.getCurrentUser().then((currentUser) => {
      console.log('Current user on load:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (user) => {
      console.log('Auth state changed:', user);
      setUser(user);
      setLoading(false);

      // Migrate guest data when user logs in
      if (user) {
        try {
          await lastWatchedService.migrateGuestToUser(user.id);
        } catch (error) {
          console.error('Failed to migrate guest data:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext signIn called');
    const { data, error } = await authService.signIn(email, password);
    console.log('AuthContext signIn result:', { data, error });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    console.log('AuthContext signUp called');
    const { data, error } = await authService.signUp(email, password);
    console.log('AuthContext signUp result:', { data, error });
    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};