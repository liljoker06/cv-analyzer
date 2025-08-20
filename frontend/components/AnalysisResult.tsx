"use client";
import { FaStar, FaCheck } from 'react-icons/fa';

interface AnalysisResultProps {
  result: {
    score: number;
    skills: string[];
    experience: string;
    education: string;
    recommendations: string[];
  };
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const { score, skills, experience, education, recommendations } = result;
  
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="mt-8 border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Résultat de l'analyse
        </h3>
      </div>
      
      <div className="px-4 py-5 sm:p-6 space-y-6">
        {/* Score section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className={`text-5xl font-bold ${getScoreColorClass(score)}`}>
              {score}
            </div>
            <div className="text-gray-500 text-sm mt-1">Score global</div>
            <FaStar className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Skills */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Compétences</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          {/* Experience */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Expérience</h4>
            <p className="text-gray-600">{experience}</p>
          </div>
          
          {/* Education */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Formation</h4>
            <p className="text-gray-600">{education}</p>
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Recommandations</h4>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <FaCheck className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
