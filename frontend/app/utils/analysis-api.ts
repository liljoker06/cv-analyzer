import { authService } from './auth';

// Types pour les données des analyses
export interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  strengths: string;
  weaknesses: string;
  score: number;
  experience: string;
  recommendations: string;
  status: string;
}

export interface AnalysisJob {
  job_id: string;
  title: string;
  company: string;
  location: string;
  experience_required: string;
  analyzed_at: string;
  total_candidates: number;
  candidates: Candidate[];
}

export interface AnalysisDetail {
  job_id: string;
  title: string;
  company: string;
  location: string;
  experience_required: string;
  description: string;
  required_skills: string[];
  analyzed_at: string;
  total_candidates: number;
  candidates: Candidate[];
}

// Service API pour les analyses
class AnalysisService {
  // Récupérer toutes les analyses
  async getAllAnalyses(): Promise<AnalysisJob[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Vous devez être connecté pour accéder aux analyses');
    }

    try {
      const response = await fetch('/api/analysis-results', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des analyses');
      }
      
      return response.json();
    } catch (error: any) {
      console.error('Erreur lors de la récupération des analyses:', error);
      throw new Error(error.message || 'Erreur réseau');
    }
  }

  // Récupérer une analyse spécifique
  async getAnalysis(analysisId: string): Promise<AnalysisDetail> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Vous devez être connecté pour accéder aux analyses');
    }

    try {
      const response = await fetch(`/api/analysis-results/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération de l\'analyse');
      }
      
      return response.json();
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'analyse:', error);
      throw new Error(error.message || 'Erreur réseau');
    }
  }

  // Récup le CV d'un candidat (URL pour afficher le PDF)
  getCandidateCvUrl(candidateId: string): string {
    return `/api/candidate-cv/${candidateId}/`;
  }
}

export const analysisService = new AnalysisService();
