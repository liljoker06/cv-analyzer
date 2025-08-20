"use client";

import { useState } from "react";
import FileUploader from "../../components/FileUploader";
import AnalysisResult from "../../components/AnalysisResult";
import PourquoiSection from "../../components/PourquoiSection";

export default function AnalysePage() {
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
        // modif à mettre quand back finis
      setIsLoading(true);

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        score: 85,
        skills: ["Python", "Django", "React", "Next.js"],
        experience: "3 years",
        education: "Master's in Computer Science",
        recommendations: [
          "Strong match for technical roles",
          "Consider for senior developer positions"
        ]
      };
      
      setAnalysisResult(mockResult);
    } catch (error) {
      console.error("Error analyzing CV:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Analyse ton CV en un instant</h2>
              <p className="mt-1 text-sm text-gray-500">
                Notre IA analyse ton CV et te donne des conseils personnalisés pour améliorer tes chances d'être embauché.
              </p>
            </div>
            
            <FileUploader 
              onFileUpload={handleFileUpload} 
              isLoading={isLoading} 
            />

            {isLoading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {analysisResult && !isLoading && (
              <AnalysisResult result={analysisResult} />
            )}
          </div>
        </div>
        
        <PourquoiSection />
      </main>
    </div>
  );
}
