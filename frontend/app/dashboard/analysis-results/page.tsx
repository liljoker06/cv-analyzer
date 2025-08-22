'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { authService } from '../../utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'; // brut mais bon
interface Candidate {
  id: string;
  name: string;
  email: string;
  score: number;
  experience: string;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  status: string;
  jobTitle?: string;  
  jobCompany?: string; 
  uniqueKey?: string;  
}

interface Analysis {
  job_id?: string;
  title?: string;
  company?: string;
  location?: string;
  total_candidates?: number;
  analyzed_at?: string;
  candidates?: any[];
  average_score?: number;  // Score moyen des candidats
}

interface AnalysisData {
  jobTitle: string;
  company: string;
  location: string;
  totalCandidates: number;
  analysisDate: string;
  top10: Candidate[];
}

// Composant Modal pour afficher le CV
function CVModal({ candidateId, candidateName, onClose }: { candidateId: string, candidateName: string, onClose: () => void }) {
  // Suppression de l'effet qui ouvrait automatiquement le PDF

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            CV de {candidateName}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mb-6 text-gray-700 dark:text-gray-300">
            <p className="text-center text-lg mb-2">CV de <span className="font-semibold">{candidateName}</span></p>
            <p className="text-sm text-center">Comment souhaitez-vous consulter ce document ?</p>
          </div>
          <div className="flex flex-col space-y-4">
            <a 
              href={`${API_URL.replace(/\/api\/?$/, '')}/api/candidate-cv/${candidateId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
              onClick={onClose}
            >
              <Button className="w-full flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ouvrir dans un nouvel onglet
              </Button>
            </a>
            <a 
              href={`${API_URL.replace(/\/api\/?$/, '')}/api/candidate-cv/${candidateId}/`}
              download={`CV_${candidateName.replace(/\s+/g, '_')}.pdf`}
              className="w-full"
              onClick={onClose}
            >
              <Button variant="outline" className="w-full flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger le CV
              </Button>
            </a>
          </div>
        </div>
        <div className="p-4 border-t flex justify-center">
          <Button 
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisResultsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('top10');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [jobSelectorOpen, setJobSelectorOpen] = useState(false);
  const [selectedCV, setSelectedCV] = useState<{ id: string, name: string } | null>(null);

  // Récupération des résultats d'analyse
  useEffect(() => {
    const fetchAnalysisResults = async () => {
      try {
        setLoading(true);
        
        // Récupérer le token d'authentification s'il existe
        const token = authService.getToken();
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        // Ajouter le token 
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/analysis-results', { headers });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des résultats');
        }
        
        const data = await response.json();
        console.log("Analyses reçues:", data.length);
        setAnalyses(data);
        
        // Créer une analyse combinée avec les 10 meilleurs candidats de toutes les analyses
        if (data && data.length > 0) {
          // Extraire tous les candidats de toutes les analyses
          const allCandidates = data.flatMap((analysis: Analysis, analysisIndex: number) => 
            (analysis.candidates || []).map((candidate: any, candidateIndex: number) => ({
              ...candidate,
              id: candidate.id || `generated-id-${analysisIndex}-${candidateIndex}-${Math.random().toString(36).substr(2, 9)}`,
              jobTitle: analysis.title || 'Poste non spécifié',
              jobCompany: analysis.company || 'Entreprise non spécifiée'
            }))
          );
          
          // Trier tous les candidats par score et prendre les 10 premiers
          const top10Candidates = allCandidates
            .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
            .slice(0, 10)
            // unicité des id
            .map((candidate: any, idx: number) => ({
              ...candidate,
              uniqueKey: `top-${idx}-${candidate.id}-${Math.random().toString(36).substr(2, 9)}`
            }));
            
          console.log(`Top 10 candidats extraits de ${data.length} analyses, total de ${allCandidates.length} candidats`);
          
          // Calculer le score moyen de tous les candidats
          const averageScore = allCandidates.length > 0 
            ? allCandidates.reduce((sum: number, candidate: any) => sum + (candidate.score || 0), 0) / allCandidates.length
            : 0;
          
          console.log(`Score moyen de tous les candidats: ${averageScore.toFixed(1)}/10`);
            
          // Créer une analyse combinée
          const combinedAnalysis = {
            title: "Top 10 global",
            company: "Toutes entreprises",
            total_candidates: allCandidates.length,
            candidates: top10Candidates,
            average_score: averageScore,
            analyzed_at: data[0].analyzed_at // Utiliser la date la plus récente
          };
          
          setSelectedAnalysis(combinedAnalysis);
        }
      } catch (err: any) {
        console.error('Erreur:', err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysisResults();
  }, []);

  // Afficher un message de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          title="Résultats d'analyse" 
          subtitle="Chargement des résultats..." 
          showBackButton 
          backUrl="/dashboard" 
        />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-300 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-300 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-300 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-300 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-slate-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error || !selectedAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          title="Résultats d'analyse" 
          subtitle="Une erreur est survenue" 
          showBackButton 
          backUrl="/dashboard" 
        />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {error || "Aucun résultat d'analyse disponible"}
              </h3>
              <div className="mt-5">
                <Button onClick={() => router.push('/dashboard/new-analysis')}>
                  Créer une nouvelle analyse
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formatter les données pour l'affichage
  const analysisData = {
    jobTitle: selectedAnalysis.title || 'Poste',
    company: selectedAnalysis.company || 'Entreprise',
    location: selectedAnalysis.location || 'Non spécifié',
    totalCandidates: selectedAnalysis.total_candidates || 0,
    analysisDate: selectedAnalysis.analyzed_at ? new Date(selectedAnalysis.analyzed_at).toLocaleDateString() : 'Non spécifié',
    top10: selectedAnalysis.candidates && selectedAnalysis.candidates.length > 0 
      ? selectedAnalysis.candidates.map((candidate: any, index: number) => ({
          id: candidate.id || `id-${index}-${Math.random().toString(36).substr(2, 9)}`,
          uniqueKey: candidate.uniqueKey || `unique-key-${index}-${Math.random().toString(36).substr(2, 9)}`,
          name: candidate.name || 'Nom du candidat',
          email: candidate.email || 'email@example.com',
          score: candidate.score || 0,
          experience: candidate.experience || 'Non spécifié',
          skills: candidate.skills || [],
          strengths: candidate.strengths ? candidate.strengths.split('\n').filter((s: string) => s.trim()) : [],
          weaknesses: candidate.weaknesses ? candidate.weaknesses.split('\n').filter((w: string) => w.trim()) : [],
          recommendations: candidate.recommendations ? candidate.recommendations.split('\n').filter((r: string) => r.trim()) : [],
          status: candidate.status === 'approved' ? 'Recommandé' : 
                  candidate.status === 'pending' ? 'En attente' : 
                  candidate.status === 'on_hold' ? 'À revoir' : 'Non recommandé',
          jobTitle: candidate.jobTitle || selectedAnalysis.title,
          jobCompany: candidate.jobCompany || selectedAnalysis.company
        }))
      : []
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Résultats de l'analyse"
        subtitle={analysisData.jobTitle === "Top 10 global" 
          ? "Top 10 des meilleurs candidats toutes offres confondues" 
          : `Top 10 pour ${analysisData.jobTitle} - ${analysisData.company}`}
        showBackButton
        backUrl="/dashboard"
        actions={
          <div className="flex space-x-3">
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => setJobSelectorOpen(!jobSelectorOpen)}
                className="bg-white dark:bg-gray-800"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Changer d'offre ({analyses.length} disponibles)
              </Button>
              
              {/* Menu déroulant pour sélectionner l'offre d'emploi */}
              {jobSelectorOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                  <div className="py-1">
                    {analyses.map((analysis, index) => (
                      <button
                        key={analysis.job_id || index}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          setSelectedAnalysis(analysis);
                          setJobSelectorOpen(false);
                        }}
                      >
                        <div className="font-medium">{analysis.title || 'Poste sans titre'}</div>
                        <div className="text-gray-500 text-xs">
                          {analysis.company || 'Entreprise'} • 
                          {analysis.total_candidates || 0} candidats • 
                          {analysis.analyzed_at ? new Date(analysis.analyzed_at).toLocaleDateString() : 'Date inconnue'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger le rapport
            </Button>
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Partager
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Candidats analysés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysisData.totalCandidates}
                  <span className="text-sm ml-1 text-gray-500">
                    (sur {analyses.reduce((total, analysis) => total + (analysis.total_candidates || 0), 0)} au total)
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Score moyen</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedAnalysis?.average_score ? (selectedAnalysis.average_score.toFixed(1) + '/10') : '0/10'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Offres d'emploi</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyses.length} 
                  <span className="text-sm ml-1 text-blue-500 cursor-pointer" onClick={() => setJobSelectorOpen(true)}>
                    (voir tout)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('top10')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'top10'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Top 10 Candidats
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'comparison'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Comparaison
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'top10' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Top 10 des meilleurs candidats
                </h3>
                
                {analysisData.top10.map((candidate: any, index: number) => (
                  <div key={candidate.uniqueKey || `candidate-${index}-${candidate.id}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {candidate.name}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">{candidate.email}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {candidate.experience} d&apos;expérience
                          </p>
                          {candidate.jobTitle && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Pour: {candidate.jobTitle} - {candidate.jobCompany}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {candidate.score.toFixed(1)}/10
                        </div>
                        <Badge 
                          variant={
                            candidate.status === 'Recommandé' ? 'success' :
                            candidate.status === 'En attente' ? 'warning' : 
                            candidate.status === 'À revoir' ? 'info' : 'danger'
                          }
                        >
                          {candidate.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Compétences principales</h5>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Points forts</h5>
                        <ul className="space-y-1">
                          {candidate.strengths.map((strength: string, i: number) => (
                            <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                              <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Recommandations IA</h5>
                      <ul className="space-y-1">
                        {candidate.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex space-x-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          console.log(`Ouverture du CV pour ${candidate.name}`);
                          setSelectedCV({ id: candidate.id, name: candidate.name });
                        }}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                        Afficher le CV
                      </Button>
                      <Button size="sm">
                        Planifier un entretien
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'comparison' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Comparaison des candidats
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 h-64 rounded flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">Graphique de comparaison</p>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Insights de l&apos;IA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Tendances observées</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• 60% des candidats ont une expérience React</li>
                      <li>• 40% manquent d&apos;expérience DevOps</li>
                      <li>• 70% ont une formation en informatique</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Recommandations générales</h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Privilégier les candidats avec expérience cloud</li>
                      <li>• Vérifier les compétences en gestion d&apos;équipe</li>
                      <li>• Considérer la formation continue</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal pour afficher le CV */}
      {selectedCV && (
        <CVModal
          candidateId={selectedCV.id}
          candidateName={selectedCV.name}
          onClose={() => setSelectedCV(null)}
        />
      )}
    </div>
  );
}
