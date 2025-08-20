'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import DataTable from '../components/dashboard/DataTable';
import ApplicationCard from '../components/dashboard/ApplicationCard';
import UserCard from '../components/dashboard/UserCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data
  const stats = {
    totalCandidates: 1247,
    totalRecruiters: 89,
    totalApplications: 3421,
    averageScore: 7.8
  }; 
  

  const recentApplications = [
    {
      id: 1,
      candidateName: 'Marie Dubois',
      position: 'Développeur Full Stack',
      score: 8.5,
      status: 'En attente',
      date: '2024-01-15'
    },
    {
      id: 2,
      candidateName: 'Pierre Martin',
      position: 'Data Scientist',
      score: 9.2,
      status: 'Approuvé',
      date: '2024-01-14'
    },
    {
      id: 3,
      candidateName: 'Sophie Bernard',
      position: 'UX Designer',
      score: 7.8,
      status: 'En cours',
      date: '2024-01-13'
    }
  ];

  const users = [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      role: 'admin',
      status: 'actif',
      lastLogin: '2024-01-15'
    },
    {
      id: 2,
      name: 'Marie Martin',
      email: 'marie.martin@company.com',
      role: 'recruiter',
      status: 'actif',
      lastLogin: '2024-01-14'
    },
    {
      id: 3,
      name: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      role: 'candidate',
      status: 'inactif',
      lastLogin: '2024-01-10'
    }
  ];

  // Sidebar items
  const sidebarItems = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      id: 'users',
      label: 'Gestion des Utilisateurs',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'applications',
      label: 'Candidatures',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  // Table columns for applications
  const applicationColumns = [
    { key: 'candidateName', label: 'Candidat' },
    { key: 'position', label: 'Poste' },
    { 
      key: 'score', 
      label: 'Score',
      render: (value: number) => (
        <Badge variant="success">{value}/10</Badge>
      )
    },
    { 
      key: 'status', 
      label: 'Statut',
      render: (value: string) => {
        const variant = value === 'Approuvé' ? 'success' : value === 'En cours' ? 'warning' : 'default';
        return <Badge variant={variant}>{value}</Badge>;
      }
    },
    { key: 'date', label: 'Date' }
  ];

  // Table columns for users
  const userColumns = [
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Rôle',
      render: (value: string) => {
        const variant = value === 'admin' ? 'danger' : value === 'recruiter' ? 'info' : 'success';
        const label = value === 'admin' ? 'Administrateur' : value === 'recruiter' ? 'Recruteur' : 'Candidat';
        return <Badge variant={variant}>{label}</Badge>;
      }
    },
    { 
      key: 'status', 
      label: 'Statut',
      render: (value: string) => (
        <Badge variant={value === 'actif' ? 'success' : 'default'}>
          {value === 'actif' ? 'Actif' : 'Inactif'}
        </Badge>
      )
    },
    { key: 'lastLogin', label: 'Dernière connexion' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">Modifier</Button>
          <Button size="sm" variant="danger">Supprimer</Button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        activeItem={activeTab}
        onItemClick={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <Header
          showBackButton={false}
          actions={
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2zM10 7h10V5H10v2zM10 11h10V9H10v2zM10 15h10v-2H10v2zM10 19h10v-2H10v2z" />
                </svg>
              </button>
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    JD
                  </div>
                  <span className="hidden md:block">Jean Dupont</span>
                </button>
              </div>
            </div>
          }
        />

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vue d'ensemble</h1>
              
              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Candidats"
                  value={stats.totalCandidates}
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  }
                  color="blue"
                />

                <StatsCard
                  title="Recruteurs"
                  value={stats.totalRecruiters}
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                  color="green"
                />

                <StatsCard
                  title="Candidatures"
                  value={stats.totalApplications}
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  color="purple"
                />

                <StatsCard
                  title="Score moyen"
                  value={`${stats.averageScore}/10`}
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  }
                  color="orange"
                />
              </div>

              {/* Recent applications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Candidatures récentes</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentApplications.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        application={app}
                        onView={(id) => console.log('View application:', id)}
                        onAnalyze={(id) => console.log('Analyze application:', id)}
                        onDelete={(id) => console.log('Delete application:', id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
                <Link href="/dashboard/create-user">
                  <Button>Ajouter un utilisateur</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onEdit={(id) => console.log('Edit user:', id)}
                    onDelete={(id) => console.log('Delete user:', id)}
                  />
                ))}
              </div>
            </div>
          )}

                           {activeTab === 'applications' && (
                   <div className="space-y-6">
                     <div className="flex justify-between items-center">
                       <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analyses IA</h1>
                       <div className="flex space-x-3">
                         <Link href="/dashboard/new-analysis">
                           <Button>Nouvelle analyse</Button>
                         </Link>
                         <Link href="/dashboard/new-application">
                           <Button variant="outline">Ajouter candidature</Button>
                         </Link>
                       </div>
                     </div>

              <DataTable
                columns={applicationColumns}
                data={recentApplications}
                onRowClick={(row) => console.log('Row clicked:', row)}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Évolution des candidatures</h3>
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Graphique des candidatures</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Répartition par poste</h3>
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Graphique en camembert</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
