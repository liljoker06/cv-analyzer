"use client";

import ContributorProfile from "../../components/ContributorProfile";

export default function ContactPage() {
  const contributors = [
    {
      name: "Liljoker",
      role: "Backend & IA",
      description: "Chef d'équipe | Développement backend et de l'intégration des modèles d'IA pour l'analyse des CV.",
      githubUrl: "https://github.com/liljoker06",
    },
    {
      name: "Ahmed",
      role: "Frontend & Backend",
      description: "Développeur frontend et backend, impliqué dans l'architecture et l'intégration des services.",
      githubUrl: "https://github.com/ahamie71",
    },
    {
      name: "Batyste",
      role: "Frontend & Backend",
      description: "Développeur frontend et backend, impliqué dans l'expérience utilisateur et interfaces.",
      githubUrl: "https://github.com/Batyeste",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Notre équipe
          </h1>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Rencontrez les esprits créatifs derrière CV Analyzer, passionnés par l'IA et dédiés à révolutionner le processus de recrutement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contributors.map((contributor, index) => (
            <ContributorProfile
              key={index}
              name={contributor.name}
              role={contributor.role}
              description={contributor.description}
              githubUrl={contributor.githubUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
