'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import CreateUserForm from '../../components/forms/CreateUserForm';
import Button from '../../components/ui/Button';
import { authService } from '../../utils/auth';

export default function CreateUserPage() {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'recruiter' | 'admin'>('recruiter');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateUser = async (formData: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = authService.getToken();
      
      if (!token) {
        setError('Vous devez être connecté pour créer un utilisateur');
        setLoading(false);
        return;
      }

      // mdp correspondant
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }
      
      //  données à envoyer (uniquement celles attendues par l'API)
      const payload = {
        email: formData.email,
        password: formData.password,
        role: userType, 
      };
      
      console.log('Sending data:', payload);
      
      // créer l'utilisateur
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Échec de la création de l\'utilisateur');
      }
      
      // message de succès
      setSuccess(`Utilisateur ${formData.email} créé avec succès !`);
      
      setTimeout(() => {
        router.refresh(); // refresh pour montrer les changements
      }, 2000);
    } catch (err: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Créer un utilisateur"
        subtitle="Ajouter un nouveau recruteur ou administrateur"
        showBackButton
        backUrl="/dashboard"
      />

      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        {/* User Type Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Type d'utilisateur à créer
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setUserType('recruiter')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                userType === 'recruiter'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Recruteur</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Peut gérer les candidatures et analyser les CV
                </p>
              </div>
            </button>

            <button
              onClick={() => setUserType('admin')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                userType === 'admin'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Administrateur</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Accès complet à toutes les fonctionnalités
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Create User Form */}
        <CreateUserForm
          onSubmit={handleCreateUser}
          loading={loading}
          userRole={userType}
        />

        {/* Information */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            📋 Processus de création
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Un email sera envoyé à l'utilisateur avec ses identifiants</li>
            <li>• L'utilisateur devra changer son mot de passe lors de sa première connexion</li>
            <li>• Le compte sera automatiquement activé</li>
            <li>• L'utilisateur recevra un email de bienvenue avec les instructions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
