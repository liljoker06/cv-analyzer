import Image from "next/image";
import Link from "next/link";
import { FaFileAlt, FaMagic, FaChartLine } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Section principale */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                Optimisez votre CV avec l'intelligence artificielle
              </h1>
              <p className="text-xl text-gray-500">
                Notre outil d'analyse intelligent évalue votre CV et vous donne des conseils personnalisés pour maximiser vos chances de décrocher l'emploi idéal.
              </p>
              <div className="flex space-x-4">
                <Link href="/analyse" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Analyser mon CV
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              {/* en attendant une image */}
              <Image
                src="/file.svg"
                alt="CV Analysis"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Section pourquoi */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Améliorez vos chances grâce à l'IA
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Notre outil utilise des algorithmes avancés pour vous aider à créer un CV qui se démarque
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="bg-white shadow overflow-hidden rounded-lg p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <FaFileAlt className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Analyse Intelligente</h3>
                <p className="mt-2 text-gray-500">
                  Notre IA analyse votre CV et identifie les points forts et les points à améliorer.
                </p>
              </div>

              <div className="bg-white shadow overflow-hidden rounded-lg p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <FaMagic className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Recommandations Personnalisées</h3>
                <p className="mt-2 text-gray-500">
                  Recevez des conseils adaptés à votre profil et au poste que vous visez.
                </p>
              </div>

              <div className="bg-white shadow overflow-hidden rounded-lg p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <FaChartLine className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Suivi de Progression</h3>
                <p className="mt-2 text-gray-500">
                  Suivez l'évolution de votre CV et mesurez son impact sur vos candidatures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section cta */}
        <section className="bg-blue-600">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Prêt à booster votre carrière?</span>
              <span className="block text-blue-200">Analysez votre CV dès aujourd'hui.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link href="/analyse" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50">
                  Commencer maintenant
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
