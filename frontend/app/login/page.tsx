'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '../components/forms/LoginForm';
import { authService } from '../utils/auth';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (formData: { email: string; password: string; rememberMe: boolean }) => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.login({
        username: formData.email,
        password: formData.password,
      });
      
      // redirection
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              CV Analyzer
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Accédez à votre tableau de bord
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Login Form Component */}
        <LoginForm onSubmit={handleLogin} loading={loading} />

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Pas encore de compte ?{' '}
            <Link 
              href="/register" 
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
