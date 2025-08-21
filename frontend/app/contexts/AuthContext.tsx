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
  const [isClient, setIsClient] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cv_analyzer_token');
      if (token) {
        try {
          const userData = authService.getCurrentUser();
          if (userData) {
            console.log("User initialized from localStorage:", userData.email);
            setUser(userData);
          }
        } catch (error) {
          console.error("Error initializing user from token:", error);
        }
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;
    
    const protectedRoutes = ['/dashboard'];
    const authRoutes = ['/login', '/register'];
    
    if (!pathname) return;
    
    const hasToken = !!localStorage.getItem('cv_analyzer_token');
    
    // Si n'a pas de token, rediriger vers login
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !hasToken) {
      window.location.href = '/login';
      return;
    }
    
    // Si token, rediriger vers dashboard
    if (authRoutes.includes(pathname) && hasToken) {
      window.location.href = '/dashboard';
      return;
    }
  }, [pathname, loading]);

  const checkAuth = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('cv_analyzer_token');
        if (token) {
          console.log("Found token during checkAuth");
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            console.log("User authenticated:", currentUser.email);
            setUser(currentUser);
          } else {
            console.log("Token invalid or expired");
            localStorage.removeItem('cv_analyzer_token');
          }
        } else {
          console.log("No token found during checkAuth");
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Error during auth check:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const userData = await authService.login({ username, password });
      console.log("Login successful, user data:", userData);
      
      if (userData) {
        setUser(userData);
        // Attendre que la mise à jour de l'état soit terminée
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log("User state updated after login");
      } else {
        console.error("Login returned no user data");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
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
