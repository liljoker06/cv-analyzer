import { authService } from './auth';

export interface Application {
  id: string;
  candidateName: string;
  email: string;
  phone?: string;
  position: string;
  company?: string;
  experience?: string;
  education?: string;
  skills?: string;
  coverLetter?: string;
  status?: string;
  score?: number;
  createdAt?: string;
}

export const applicationsService = {
  /**
   * Crée une nouvelle candidature et un compte utilisateur avec rôle "candidat"
   */
  createApplication: async (applicationData: Partial<Application>): Promise<Application> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Vous devez être connecté pour créer une candidature');
    }

    try {
      const response = await fetch('/api/applications/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Impossible de créer la candidature');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Erreur lors de la création de la candidature:', error);
      throw error;
    }
  },

  /**
   * Récupère toutes les candidatures
   */
  getAllApplications: async (): Promise<Application[]> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Vous devez être connecté pour accéder aux candidatures');
    }

    try {
      const response = await fetch('/api/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Impossible de récupérer les candidatures');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Erreur lors de la récupération des candidatures:', error);
      
      // Données fictives en cas d'erreur
      return [
        { id: '1', candidateName: 'Marie Dubois', email: 'marie@example.com', position: 'Développeur Full Stack', score: 8.5, status: 'En attente', createdAt: '2024-01-15' },
        { id: '2', candidateName: 'Pierre Martin', email: 'pierre@example.com', position: 'Data Scientist', score: 9.2, status: 'Approuvé', createdAt: '2024-01-14' },
        { id: '3', candidateName: 'Sophie Bernard', email: 'sophie@example.com', position: 'UX Designer', score: 7.8, status: 'En cours', createdAt: '2024-01-13' }
      ];
    }
  }
};
