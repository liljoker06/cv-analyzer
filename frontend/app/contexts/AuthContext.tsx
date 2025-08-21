'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, authService } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/dashboard/'];
    const authRoutes = ['/login', '/register'];
    
    if (loading) return;
    
    if (protectedRoutes.some(route => pathname?.startsWith(route)) && !user) {
      router.push('/login');
    }
    
    if (authRoutes.includes(pathname || '') && user) {
      router.push('/dashboard');
    }
  }, [pathname, user, loading, router]);

  const checkAuth = async () => {
    setLoading(true);
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const userData = await authService.login({ username, password });
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth a utiliser avec AuthProvider');
  }
  return context;
}
