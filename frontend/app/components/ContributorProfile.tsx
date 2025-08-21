"use client";

import { FaGithub } from 'react-icons/fa';
import Image from 'next/image';

interface ContributorProfileProps {
  name: string;
  role: string;
  description: string;
  githubUrl: string;
  linkedinUrl?: string;
}

export default function ContributorProfile({
  name,
  role,
  description,
  githubUrl,
  linkedinUrl
}: ContributorProfileProps) {
  // Extraction du nom d'utilisateur GitHub de l'URL
  const githubUsername = githubUrl.split('/').pop() || '';
  // Construction de l'URL de l'avatar GitHub
  const avatarUrl = `https://avatars.githubusercontent.com/${githubUsername}`;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-48 sm:h-56">
        <Image
          src={avatarUrl}
          alt={`Photo de ${name}`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black opacity-50"></div>
      </div>
      
      <div className="p-6 relative -mt-12">
        <div className="bg-white rounded-full w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg overflow-hidden">
          <Image
            src={avatarUrl}
            alt={`Avatar de ${name}`}
            width={96}
            height={96}
            className="object-cover"
          />
        </div>
        
        <h3 className="text-xl font-bold text-center text-gray-900">{name}</h3>
        <p className="text-center text-blue-600 font-medium mb-4">{role}</p>
        
        <p className="text-gray-600 text-center mb-6">{description}</p>
        
        <div className="flex justify-center space-x-4">
          <a 
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-900 text-white transition-colors"
          >
            <FaGithub size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}
