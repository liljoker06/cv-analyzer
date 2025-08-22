import React from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface ApplicationCardProps {
  application: {
    id: number | string;
    candidateName: string;
    position: string;
    score: number;
    status: string;
    date: string;
    email?: string;
  };
  onView?: (id: number | string) => void;
  onAnalyze?: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
}

export default function ApplicationCard({
  application,
  onView,
  onAnalyze,
  onDelete
}: ApplicationCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approuvé':
        return 'success';
      case 'En cours':
        return 'warning';
      case 'Rejeté':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {application.candidateName}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">{application.position}</p>
          {application.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{application.email}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(application.status)}>
            {application.status}
          </Badge>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {application.score}/10
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Score IA</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Candidature du {application.date}
        </div>
        <div className="flex space-x-2">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(application.id)}
            >
              Voir
            </Button>
          )}
          {onAnalyze && (
            <Button
              size="sm"
              variant="success"
              onClick={() => onAnalyze(application.id)}
            >
              Analyser
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(application.id)}
            >
              Supprimer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
