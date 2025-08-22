'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import DataTable from '../components/dashboard/DataTable';
import ApplicationCard from '../components/dashboard/ApplicationCard';
import UserCard from '../components/dashboard/UserCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DeleteConfirmation from '../components/ui/DeleteConfirmation';
import { usersService, User } from '../utils/users-api';
import { jobsService, StatsData } from '../utils/jobs-api';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{userId: string, open: boolean}>({ userId: '', open: false });
  const [stats, setStats] = useState<StatsData>({
    totalAdmins: 0,
    totalRecruiters: 0,
    totalApplications: 0,
    averageScore: 0
  });
  const router = useRouter();
  
  // Vérification d'authentification côté client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cv_analyzer_token');
      console.log("Dashboard page - token check:", token ? "Token exists" : "No token");
      if (!token) {
        console.log("No token found, redirecting from dashboard to login");
        window.location.href = '/login';
      }
    }
  }, []);

  // Chargement des utilisateurs
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // Compte les utilisateurs par rôle (recruteurs, administrateurs)
  const countUsersByRole = (usersList: User[], role: string): number => {
    return usersList.filter(user => user.role === role).length;
  };

  // statistiques et utilisateurs
  const loadStats = async () => {
    try {
      setLoading(true);
      
      const allUsers = await usersService.getAllUsers();
      
      const recruitersCount = countUsersByRole(allUsers, 'recruiter');
      const adminsCount = countUsersByRole(allUsers, 'admin');
      
      setStats(prev => ({
        ...prev,
        totalRecruiters: recruitersCount,
        totalAdmins: adminsCount
      }));

      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setStats({
        totalAdmins: 8,
        totalRecruiters: 0,
        totalApplications: 3421,
        averageScore: 7.8
      });
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
    
    if (activeTab === 'overview') {
      loadStats();
    }
  }, [activeTab]);

  // Fonction pour gérer la suppression d'un utilisateur
  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      await usersService.deleteUser(userId);
      await loadUsers();
      setDeleteConfirmation({ userId: '', open: false });
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      setError('Impossible de supprimer l\'utilisateur');
      setLoading(false);
    }
  };

  // Mock data pour les applications récentes
  const recentApplications = [
    { id: 1, candidateName: 'Marie Dubois', position: 'Développeur Full Stack', score: 8.5, status: 'En attente', date: '2024-01-15' },
    { id: 2, candidateName: 'Pierre Martin', position: 'Data Scientist', score: 9.2, status: 'Approuvé', date: '2024-01-14' },
    { id: 3, candidateName: 'Sophie Bernard', position: 'UX Designer', score: 7.8, status: 'En cours', date: '2024-01-13' }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" /></svg> },
    { id: 'users', label: 'Gestion des Utilisateurs', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg> },
    { id: 'applications', label: 'Candidatures', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'analytics', label: 'Analytics', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> }
  ];

  const applicationColumns = [
    { key: 'candidateName', label: 'Candidat' },
    { key: 'position', label: 'Poste' },
    { key: 'score', label: 'Score', render: (v: number) => <Badge variant="success">{v}/10</Badge> },
    { key: 'status', label: 'Statut', render: (v: string) => <Badge variant={v === 'Approuvé' ? 'success' : v === 'En cours' ? 'warning' : 'default'}>{v}</Badge> },
    { key: 'date', label: 'Date' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        activeItem={activeTab}
        onItemClick={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        
        {/* Boîte de dialogue de confirmation de suppression */}
        <DeleteConfirmation
          isOpen={deleteConfirmation.open}
          title="Supprimer l'utilisateur"
          message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
          onConfirm={() => handleDeleteUser(deleteConfirmation.userId)}
          onCancel={() => setDeleteConfirmation({ userId: '', open: false })}
        />

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {/* === OVERVIEW === */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vue d&apos;ensemble</h1>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Administrateurs" value={stats.totalAdmins} color="blue" icon={undefined} />
                <StatsCard title="Recruteurs" value={stats.totalRecruiters} color="green" icon={undefined} />
                <StatsCard title="Candidatures" value={stats.totalApplications} color="purple" icon={undefined} />
                <StatsCard title="Score moyen" value={`${stats.averageScore}/10`} color="orange" icon={undefined} />
              </div>

              {/* Applications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Candidatures récentes</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentApplications.map(app => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === USERS === */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
                <Link href="/dashboard/create-user">
                  <Button>Ajouter un utilisateur</Button>
                </Link>
              </div>
              
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
              
              {!loading && !error && users.length === 0 && (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-center">
                  <p className="text-gray-600 dark:text-gray-300">Aucun utilisateur trouvé</p>
                </div>
              )}
              
              {!loading && !error && users.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map(user => {
                    const userWithRequiredProps = {
                      ...user,
                      name: user.name || user.email.split('@')[0],
                      status: user.status || (user.is_active ? 'actif' : 'inactif')
                    };
                    
                    return <UserCard 
                      key={user.id} 
                      user={userWithRequiredProps as User & { name: string, status: string }}
                      onEdit={(id) => window.location.href = `/dashboard/edit-user/${id}`}
                      onDelete={(id) => setDeleteConfirmation({ userId: id, open: true })}
                    />;
                  })}
                </div>
              )}
            </div>
          )}

          {/* === APPLICATIONS === */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analyses IA</h1>
                <div className="flex space-x-3">
                  <Link href="/dashboard/new-analysis"><Button>Nouvelle analyse</Button></Link>
                  <Link href="/dashboard/new-application"><Button variant="outline">Ajouter candidature</Button></Link>
                </div>
              </div>
              <DataTable columns={applicationColumns} data={recentApplications} />
            </div>
          )}

          {/* === ANALYTICS === */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm h-64 flex items-center justify-center">
                  Graphique des candidatures
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm h-64 flex items-center justify-center">
                  Graphique en camembert
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
