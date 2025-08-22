import { authService } from './auth';

// Types
export interface Experience {
  company: string;
  role: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone?: string;
  applied_position: string;
  skills: string[];
  experiences: Experience[];
  experience_years: number;
  created_at: string;
}

class CandidatesService {
  // Récupérer tous les candidats
  async getAllCandidates(): Promise<Candidate[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Vous devez être connecté pour accéder aux candidats');
    }

    try {
      // Utiliser notre route API Next.js
      const response = await fetch('/api/candidates/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des candidats');
      }
      
      return response.json();
    } catch (error: any) {
      console.error('Erreur lors de la récupération des candidats:', error);
      throw new Error(error.message || 'Erreur réseau');
    }
  }

  // Récupérer un candidat spécifique
  async getCandidate(candidateId: string): Promise<Candidate> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Vous devez être connecté pour accéder aux candidats');
    }

    try {
      const response = await fetch(`/api/candidates/${candidateId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération du candidat');
      }
      
      return response.json();
    } catch (error: any) {
      console.error('Erreur lors de la récupération du candidat:', error);
      throw new Error(error.message || 'Erreur réseau');
    }
  }

  getCandidateCvUrl(candidateId: string): string {
    return `/api/candidate-cv/${candidateId}/`;
  }
}

export const candidatesService = new CandidatesService();
