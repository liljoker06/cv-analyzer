'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, authService } from '../utils/auth';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Vérifier l'état d'authentification au chargement
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (err: any) {
        console.error('Error checking auth status:', err);
        setError(err.message || 'Une erreur est survenue lors de la vérification de votre session');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await authService.login({ username: email, password });
      setUser(user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
