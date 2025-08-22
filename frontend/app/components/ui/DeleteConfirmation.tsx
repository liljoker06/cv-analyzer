// frontend/app/components/ui/DeleteConfirmation.tsx
import React from 'react';
import Button from './Button';

interface DeleteConfirmationProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 animate-scale-in">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}
