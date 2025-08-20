'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for the application
  const application = {
    id: params.id,
    candidateName: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    phone: '+33 6 12 34 56 78',
    position: 'Développeur Full Stack',
    company: 'TechCorp',
    experience: '3-5 ans',
    education: 'Master en Informatique - École Centrale Paris (2020)',
    skills: 'JavaScript, React, Node.js, Python, Docker, AWS',
    coverLetter: 'Passionnée par le développement web et les nouvelles technologies, je souhaite rejoindre votre équipe pour contribuer à des projets innovants...',
    score: 8.5,
    status: 'En attente',
    date: '2024-01-15',
    analysis: {
      technicalSkills: 9.2,
      experience: 8.8,
      education: 9.0,
      communication: 7.5,
      culturalFit: 8.0
    },
    recommendations: [
      'Excellent profil technique avec une forte expertise en React et Node.js',
      'Expérience pertinente dans le domaine du développement web',
      'Formation solide avec un master d\'une école reconnue',
      'Compétences en DevOps (Docker, AWS) appréciées',
      'Lettre de motivation bien structurée mais pourrait être plus personnalisée'
    ],
    strengths: [
      'Expertise technique avancée',
      'Expérience dans des projets similaires',
      'Formation de qualité',
      'Compétences DevOps',
      'Motivation évidente'
    ],
    weaknesses: [
      'Lettre de motivation générique',
      'Manque d\'expérience en gestion d\'équipe',
      'Compétences en communication à améliorer'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Candidature #{application.id}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {application.candidateName} - {application.position}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              application.status === 'Approuvé' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : application.status === 'En cours'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              {application.status}
            </span>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Modifier le statut
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Score IA</h2>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {application.score}/10
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(application.score / 10) * 100}%` }}
                ></div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Compétences</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{application.analysis.technicalSkills}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Expérience</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{application.analysis.experience}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Formation</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{application.analysis.education}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Communication</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{application.analysis.communication}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Culture</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{application.analysis.culturalFit}</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Vue d'ensemble
                  </button>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'analysis'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Analyse détaillée
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'documents'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Documents
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Points forts</h3>
                        <ul className="space-y-2">
                          {application.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Points d'amélioration</h3>
                        <ul className="space-y-2">
                          {application.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recommandations</h3>
                      <ul className="space-y-2">
                        {application.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'analysis' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Analyse des compétences</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Le candidat démontre une expertise technique solide avec une maîtrise avancée des technologies web modernes.
                          Ses compétences en React et Node.js sont particulièrement remarquables.
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Évaluation de l'expérience</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Avec 3-5 ans d'expérience, le candidat a une base solide pour le poste.
                          Son expérience dans des projets similaires est un atout majeur.
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Analyse de la lettre de motivation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        La lettre de motivation est bien structurée mais pourrait être plus personnalisée.
                        Le candidat montre une bonne compréhension du poste mais manque de détails sur ses réalisations spécifiques.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">CV - Marie_Dubois.pdf</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">2.3 MB • Téléchargé le 15/01/2024</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          Télécharger
                        </button>
                      </div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-8 h-8 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Lettre de motivation - Marie_Dubois.pdf</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">1.1 MB • Téléchargé le 15/01/2024</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          Télécharger
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Candidate Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Informations du candidat</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom complet</label>
                  <p className="text-gray-900 dark:text-white">{application.candidateName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white">{application.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</label>
                  <p className="text-gray-900 dark:text-white">{application.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Poste recherché</label>
                  <p className="text-gray-900 dark:text-white">{application.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Entreprise actuelle</label>
                  <p className="text-gray-900 dark:text-white">{application.company}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Expérience</label>
                  <p className="text-gray-900 dark:text-white">{application.experience}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Formation</label>
                  <p className="text-gray-900 dark:text-white">{application.education}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Compétences</label>
                  <p className="text-gray-900 dark:text-white">{application.skills}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Approuver
                </button>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Mettre en attente
                </button>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Rejeter
                </button>
                <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Planifier un entretien
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
