"use client";

import { useState, useCallback } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export default function FileUploader({ onFileUpload, isLoading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  }, [isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (isLoading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
        onFileUpload(file);
      } else {
        alert("Veuillez télécharger uniquement des fichiers PDF ou Word (.doc, .docx)");
      }
    }
  }, [isLoading, onFileUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
        onFileUpload(file);
      } else {
        alert("Veuillez télécharger uniquement des fichiers PDF ou Word (.doc, .docx)");
      }
    }
  }, [isLoading, onFileUpload]);

  return (
    <div 
      className={`
        border-2 border-dashed rounded-lg p-8 text-center
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} 
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
        transition-all duration-200
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-4">
        <div className="flex justify-center">
          <FaCloudUploadAlt className="w-12 h-12 text-gray-400" />
        </div>
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Cliquez pour télécharger</span> ou glissez-déposez
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF ou Word uniquement (max. 10MB)
          </p>
        </div>
        
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        
        <label 
          htmlFor="file-upload" 
          className={`
            inline-flex items-center px-4 py-2 border border-transparent
            text-sm font-medium rounded-md shadow-sm text-white
            ${isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {selectedFile ? 'Changer de fichier' : 'Sélectionner un fichier'}
        </label>
        
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">
            Fichier sélectionné: <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}
      </div>
    </div>
  );
}
