'use client';

import { useState } from 'react';
import Link from 'next/link';
import RegisterForm from '../components/forms/RegisterForm';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (formData: any) => {
    setLoading(true);
    // TODO: Implement registration logic
    console.log('Registration attempt:', formData);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // TODO: Redirect to dashboard or show success message
    }, 2000);
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
