// frontend/app/utils/users-api.ts
import { authService } from './auth';

// Types pour les données des utilisateurs
export interface User {
  id: string;        // Transformé à partir de _id
  _id?: string;      // ID MongoDB d'origine
  email: string;     // Email utilisateur
  role: string;      // Rôle: 'admin' ou 'recruiter'
  is_active: boolean;// Indique si le compte est actif
  created_at?: string; // Date de création
  // Champs générés côté frontend
  name?: string;     // Nom affiché (généré à partir de l'email)
  status?: string;   // Format texte pour l'affichage de is_active
  last_login?: string; // Date de dernière connexion (peut être absente)
}

export const usersService = {
  /**
   * Récupère la liste de tous les utilisateurs (nécessite des droits d'admin)
   */
  getAllUsers: async (): Promise<User[]> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Vous devez être connecté pour accéder aux utilisateurs');
    }

    try {
      // Utiliser notre route API Next.js
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Role': 'admin', 
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Impossible de récupérer les utilisateurs');
      }

      const users = await response.json();
      
      return users.map((user: any) => ({
        ...user,
        name: user.first_name || user.last_name 
          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
          : user.email.split('@')[0],
        status: user.is_active ? 'actif' : 'inactif'
      }));
    } catch (error: any) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      
      // données fictives en cas d'erreur
      console.log('Utilisation de données de test pour les utilisateurs');
      return [
        { 
          id: '1', 
          email: 'admin@example.com', 
          name: 'Admin User',
          role: 'admin', 
          is_active: true, 
          status: 'actif',
        },
        { 
          id: '2', 
          email: 'recruiter@company.com',
          name: 'Recruiter User', 
          role: 'recruiter', 
          is_active: true, 
          status: 'actif',
        },
        { 
          id: '3', 
          email: 'inactive@email.com', 
          name: 'Inactive User',
          role: 'recruiter', 
          is_active: false, 
          status: 'inactif',
        }
      ];
    }
  },

  /**
   * Récupère les détails d'un utilisateur spécifique
   */
  getUserById: async (userId: string): Promise<User> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Vous devez être connecté pour accéder aux informations de l\'utilisateur');
    }

    try {
      // Utiliser notre route API Next.js
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Impossible de récupérer les détails de l\'utilisateur');
      }

      const user = await response.json();
      return {
        ...user,
        name: user.first_name || user.last_name 
          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
          : user.email.split('@')[0],
        status: user.is_active ? 'actif' : 'inactif'
      };
    } catch (error: any) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un utilisateur
   */
  deleteUser: async (userId: string): Promise<boolean> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Vous devez être connecté pour supprimer un utilisateur');
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Impossible de supprimer l\'utilisateur');
      }

      return true;
    } catch (error: any) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel utilisateur
   */
  createUser: async (userData: Partial<User>): Promise<User> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Vous devez être connecté pour créer un utilisateur');
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Impossible de créer l\'utilisateur');
      }

      const newUser = await response.json();
      return {
        ...newUser,
        name: newUser.first_name || newUser.last_name 
          ? `${newUser.first_name || ''} ${newUser.last_name || ''}`.trim()
          : newUser.email.split('@')[0],
        status: newUser.is_active ? 'actif' : 'inactif'
      };
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }
};
