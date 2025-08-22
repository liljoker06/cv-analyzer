'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function NewAnalysisPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    description: '',
    requirements: '',
    experience: '',
    location: ''
  });

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Veuillez sélectionner au moins un CV');
      return;
    }

    setIsAnalyzing(true);
    console.log('Starting analysis:', { formData, files });
    
    try {
      const formDataToSend = new FormData();

      // texte
      formDataToSend.append("title", formData.jobTitle);
      formDataToSend.append("company", formData.company);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("experience_required", formData.experience);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("required_skills", formData.requirements);

      // Fichiers
      files.forEach((file) => {
        formDataToSend.append("file", file);
      });

      // Appel à notre API
      const response = await fetch("/api/analysis", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'analyse");
      }

      const data = await response.json();
      console.log('Analyse terminée avec succès:', data);
      
      // Redirection vers la page des résultats d'analyse
      if (data && data.persisted && data.persisted.analysis_id) {
        router.push(`/dashboard/analysis-results/${data.persisted.analysis_id}`);
      } else {
        router.push('/dashboard/analysis-results');
      }
      
    } catch (error: any) {
      console.error('Erreur lors de l\'analyse:', error);
      alert(`Erreur: ${error?.message || 'Une erreur est survenue lors de l\'analyse'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Nouvelle analyse"
        subtitle="Uploadez vos CV et obtenez votre Top 10 des meilleurs candidats"
        showBackButton
        backUrl="/dashboard"
      />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Informations du poste
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Décrivez le poste pour que l'IA puisse analyser l'adéquation des candidats
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Job Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="jobTitle"
                name="jobTitle"
                type="text"
                label="Titre du poste *"
                placeholder="Développeur Full Stack"
                value={formData.jobTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                required
              />

              <Input
                id="company"
                name="company"
                type="text"
                label="Entreprise"
                placeholder="Nom de votre entreprise"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />

              <Input
                id="location"
                name="location"
                type="text"
                label="Localisation"
                placeholder="Paris, France"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />

              <Input
                id="experience"
                name="experience"
                type="text"
                label="Expérience requise"
                placeholder="3-5 ans"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description du poste
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Décrivez les missions principales, les responsabilités..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Compétences et exigences
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                placeholder="Listez les compétences techniques, soft skills, diplômes requis..."
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CV à analyser *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Télécharger des fichiers</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX jusqu'à 10MB par fichier</p>
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  CV sélectionnés ({files.length})
                </h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                🤖 Analyse IA
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• L'IA analysera {files.length} CV en quelques minutes</li>
                <li>• Comparaison automatique des compétences et expériences</li>
                <li>• Génération d'un Top 10 avec scores détaillés</li>
                <li>• Rapport complet avec recommandations</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Annuler
              </Link>
              <Button
                type="submit"
                disabled={files.length === 0 || isAnalyzing}
                loading={isAnalyzing}
              >
                {isAnalyzing ? 'Analyse en cours...' : 'Lancer l\'analyse'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
