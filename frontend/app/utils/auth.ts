// frontend/app/utils/auth.ts
import { getUserFromToken, isTokenExpired } from './jwt';

export interface User {
  id: string;
  username: string;
  email: string;
  token?: string;
  role?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL 
const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || 'cv_analyzer_token';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      const payload = {
        email: credentials.username, // email
        password: credentials.password,
      };
      
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to login');
      }

      const data = await response.json();
      
      // localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      
      const user = getUserFromToken(data.token);
      
      if (!user) {
        throw new Error("Impossible de décoder le token d'authentification");
      }
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<User> => {
    try {
      // Utiliser la route create-recruiter disponible sur le backend
      const payload = {
        email: userData.email,
        password: userData.password,
        role: "recruiter"  
      };
      
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Nous n'avons pas encore de token d'administrateur, donc cette opération pourrait échouer
          // mais nous adaptons le frontend pour utiliser la route existante
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          throw new Error("Cette fonctionnalité nécessite des droits d'administrateur. Veuillez contacter l'administrateur pour créer votre compte.");
        }
        throw new Error(error.error || error.detail || 'Échec de l\'inscription');
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      
      // Si token, l'utiliser pour créer l'utilisateur
      if (data.token) {
        const user = getUserFromToken(data.token);
        if (user) return user;
      }
      
      // Sinon, créer un utilisateur basique
      return {
        id: data.id || 'new-user',
        username: userData.username || userData.email.split('@')[0],
        email: userData.email,
        token: data.token,
        role: data.role || 'recruiter'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getCurrentUser: (): User | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    
    try {
      // Vérif token expiré
      if (isTokenExpired(token)) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
      
      // Décode le token pour récupérer les informations utilisateur
      return getUserFromToken(token);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }
};
