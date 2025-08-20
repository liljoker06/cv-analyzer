import React from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface UserCardProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string;
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function UserCard({
  user,
  onEdit,
  onDelete
}: UserCardProps) {
  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'recruiter':
        return 'info';
      case 'candidate':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusVariant = (status: string) => {
    return status === 'actif' ? 'success' : 'default';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'recruiter':
        return 'Recruteur';
      case 'candidate':
        return 'Candidat';
      default:
        return role;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Badge variant={getRoleVariant(user.role)}>
            {getRoleLabel(user.role)}
          </Badge>
          <Badge variant={getStatusVariant(user.status)}>
            {user.status === 'actif' ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Dernière connexion : {user.lastLogin}
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(user.id)}
            >
              Modifier
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(user.id)}
            >
              Supprimer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
