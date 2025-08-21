'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterForm from '../components/forms/RegisterForm';
import { authService } from '../utils/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (formData: any) => {
    setLoading(true);
    setError(null);
    
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }
    
    try {
      setError("L'inscription est réservée aux administrateurs. Contacter l'admin pour créer un compte.");
      setLoading(false);

      await authService.register({
        username: `${formData.firstName.toLowerCase()}_${formData.lastName.toLowerCase()}`,
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword
      });
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription");
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
            Créer votre compte
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Rejoignez notre plateforme de recrutement intelligent
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Register Form Component */}
        <RegisterForm onSubmit={handleRegister} loading={loading} />

        {/* Login link */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Déjà un compte ?{' '}
            <Link 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
