'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface RegisterFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export default function RegisterForm({ onSubmit, loading = false }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate', // Par défaut, seuls les candidats peuvent s'inscrire
    acceptTerms: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Card className="py-8 px-6">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="firstName"
            name="firstName"
            type="text"
            label="Prénom"
            placeholder="Jean"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            id="lastName"
            name="lastName"
            type="text"
            label="Nom"
            placeholder="Dupont"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          id="email"
          name="email"
          type="email"
          label="Adresse email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmer le mot de passe"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />

        {/* Information sur les rôles */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            📝 Inscription en tant que candidat
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Vous vous inscrivez en tant que candidat. Pour devenir recruteur ou administrateur, 
            contactez-nous ou attendez une invitation.
          </p>
        </div>

        <div className="flex items-center">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            required
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            J'accepte les{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              conditions d'utilisation
            </Link>{' '}
            et la{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              politique de confidentialité
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          disabled={!formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword || !formData.acceptTerms}
          loading={loading}
          fullWidth
        >
          Créer mon compte candidat
        </Button>

        {/* Lien pour les recruteurs */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vous êtes recruteur ?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
              Contactez-nous pour un accès
            </Link>
          </p>
        </div>
      </form>
    </Card>
  );
}
