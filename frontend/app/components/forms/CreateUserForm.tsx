'use client';

import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface CreateUserFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  userRole?: 'admin' | 'recruiter';
}

export default function CreateUserForm({ onSubmit, loading = false, userRole = 'recruiter' }: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: userRole,
    company: '',
    position: ''
  });
  
  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      role: userRole
    }));
  }, [userRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="py-8 px-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Créer un nouveau {userRole === 'admin' ? 'administrateur' : 'recruteur'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Remplissez les informations pour créer un nouveau compte.
        </p>
      </div>

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
          placeholder="jean.dupont@entreprise.com"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />

        {userRole === 'recruiter' && (
          <>
            <Input
              id="company"
              name="company"
              type="text"
              label="Nom de l'entreprise"
              placeholder="Nom de l'entreprise"
              value={formData.company}
              onChange={handleChange}
              required
            />
            <Input
              id="position"
              name="position"
              type="text"
              label="Poste"
              placeholder="Responsable RH, Recruteur, etc."
              value={formData.position}
              onChange={handleChange}
              required
            />
          </>
        )}

        <Input
          id="password"
          name="password"
          type="password"
          label="Mot de passe temporaire"
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

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Information importante
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Un email sera envoyé à l'utilisateur avec ses identifiants de connexion. 
            Il devra changer son mot de passe lors de sa première connexion.
          </p>
        </div>

        <Button
          type="submit"
          disabled={!formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
          loading={loading}
          fullWidth
        >
          Créer le compte {userRole === 'admin' ? 'administrateur' : 'recruteur'}
        </Button>
      </form>
    </Card>
  );
}
