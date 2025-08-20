'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function AnalysisResultsPage() {
  const [activeTab, setActiveTab] = useState('top10');

  // Mock data for analysis results
  const analysisData = {
    jobTitle: 'Développeur fulle Stack',
    company: 'TechCorp',
    totalCandidates: 45,
    analysisDate: '2024-01-15',
    top10: [
      {
        id: 1,
        name: 'Marie Dubois',
        email: 'marie.dubois@email.com',
        score: 9.2,
        experience: '5 ans',
        skills: ['React', 'Node.js', 'Python', 'Docker'],
        strengths: ['Expertise technique avancée', 'Expérience en projets similaires', 'Leadership'],
        weaknesses: ['Communication en anglais à améliorer'],
        recommendations: ['Excellent profil, recommander pour un entretien', 'Poser des questions sur la gestion d\'équipe'],
        status: 'Recommandé'
      },
      {
        id: 2,
        name: 'Thomas Martin',
        email: 'thomas.martin@email.com',
        score: 8.8,
        experience: '4 ans',
        skills: ['Vue.js', 'Express.js', 'MongoDB', 'AWS'],
        strengths: ['Compétences DevOps', 'Expérience cloud', 'Autonomie'],
        weaknesses: ['Manque d\'expérience en gestion'],
        recommendations: ['Profil solide, bon pour l\'équipe technique'],
        status: 'Recommandé'
      },
      {
        id: 3,
        name: 'Sophie Bernard',
        email: 'sophie.bernard@email.com',
        score: 8.5,
        experience: '6 ans',
        skills: ['Angular', 'Java', 'Spring Boot', 'Kubernetes'],
        strengths: ['Expérience senior', 'Architecture microservices', 'Mentorat'],
        weaknesses: ['Stack technologique différente'],
        recommendations: ['Vérifier l\'adaptabilité aux technologies'],
        status: 'À considérer'
      },
      {
        id: 4,
        name: 'Lucas Petit',
        email: 'lucas.petit@email.com',
        score: 8.1,
        experience: '3 ans',
        skills: ['React', 'TypeScript', 'GraphQL', 'PostgreSQL'],
        strengths: ['Code propre', 'Documentation', 'Tests'],
        weaknesses: ['Expérience limitée'],
        recommendations: ['Bon potentiel, à suivre'],
        status: 'À considérer'
      },
      {
        id: 5,
        name: 'Emma Rousseau',
        email: 'emma.rousseau@email.com',
        score: 7.9,
        experience: '4 ans',
        skills: ['JavaScript', 'PHP', 'MySQL', 'Laravel'],
        strengths: ['Polyvalence', 'Résolution de problèmes'],
        weaknesses: ['Stack legacy', 'Pas d\'expérience moderne'],
        recommendations: ['Vérifier l\'apprentissage des nouvelles technologies'],
        status: 'À considérer'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Résultats de l'analyse"
        subtitle={`Top 10 pour ${analysisData.jobTitle} - ${analysisData.company}`}
        showBackButton
        backUrl="/dashboard"
        actions={
          <div className="flex space-x-3">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Candidats analysés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analysisData.totalCandidates}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">8.1/10</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top 10 généré</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">10/10</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Temps d'analyse</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2m 30s</p>
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
              <button
                onClick={() => setActiveTab('insights')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'insights'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Insights IA
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'top10' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Top 10 des meilleurs candidats
                </h3>
                
                {analysisData.top10.map((candidate, index) => (
                  <div key={candidate.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
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
                            {candidate.experience} d'expérience
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {candidate.score}/10
                        </div>
                        <Badge 
                          variant={candidate.status === 'Recommandé' ? 'success' : 'warning'}
                        >
                          {candidate.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Compétences principales</h5>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Points forts</h5>
                        <ul className="space-y-1">
                          {candidate.strengths.map((strength, i) => (
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
                        {candidate.recommendations.map((rec, i) => (
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
                      <Button size="sm" variant="outline">
                        Voir le CV complet
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
                  Insights de l'IA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Tendances observées</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• 60% des candidats ont une expérience React</li>
                      <li>• 40% manquent d'expérience DevOps</li>
                      <li>• 70% ont une formation en informatique</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Recommandations générales</h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Privilégier les candidats avec expérience cloud</li>
                      <li>• Vérifier les compétences en gestion d'équipe</li>
                      <li>• Considérer la formation continue</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
