
import Link from 'next/link';
import PourquoiSection from '../components/PourquoiSection';
import FeatureSection from '../components/FeatureSection';
import { FaCloudUploadAlt, FaLightbulb, FaChartBar, FaFileAlt, FaEnvelope, FaBolt } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">


      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Trouvez vos meilleurs candidats avec{' '}
              <span className="text-blue-600 dark:text-blue-400">l'IA</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Uploadez vos CV, notre IA analyse et vous donne le Top 10 des meilleurs candidats
              pour votre poste avec des scores détaillés et des recommandations personnalisées.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/demo"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Voir la démo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              En 3 étapes simples, obtenez votre Top 10 des meilleurs candidats
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Uploadez vos CV
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Glissez-déposez tous vos CV pour le poste. Notre plateforme accepte PDF, DOC, DOCX.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                L'IA analyse
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Notre IA compare tous les profils, évalue les compétences, l'expérience et l'adéquation au poste.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recevez votre Top 10
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Obtenez un rapport détaillé avec le Top 10 des meilleurs candidats, leurs scores et nos recommandations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pourquoi nous utiliser
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PourquoiSection />
        </div>
      </div> */}

      {/* Features Section */}
      <FeatureSection
        title="Fonctionnalités principales"
        subtitle="Tout ce dont vous avez besoin pour optimiser votre recrutement"
        features={[
          {
            title: "Upload en masse",
            description: "Uploadez des centaines de CV en une fois. Support PDF, DOC, DOCX avec reconnaissance automatique.",
            icon: <FaCloudUploadAlt className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            bgColor: "bg-blue-100 dark:bg-blue-900",
            iconColor: "text-blue-600 dark:text-blue-400"
          },
          {
            title: "Analyse IA avancée",
            description: "Notre IA analyse compétences, expérience, formation et adéquation culturelle pour chaque candidat.",
            icon: <FaLightbulb className="w-6 h-6 text-green-600 dark:text-green-400" />,
            bgColor: "bg-green-100 dark:bg-green-900",
            iconColor: "text-green-600 dark:text-green-400"
          },
          {
            title: "Top 10 personnalisé",
            description: "Recevez un Top 10 adapté à votre poste avec scores détaillés et recommandations personnalisées.",
            icon: <FaChartBar className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
            bgColor: "bg-purple-100 dark:bg-purple-900",
            iconColor: "text-purple-600 dark:text-purple-400"
          },
          {
            title: "Rapports détaillés",
            description: "Rapports PDF complets avec analyses comparatives, points forts/faibles et suggestions d'entretien.",
            icon: <FaFileAlt className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
            bgColor: "bg-orange-100 dark:bg-orange-900",
            iconColor: "text-orange-600 dark:text-orange-400"
          },
          {
            title: "Notifications automatiques",
            description: "Recevez des emails quand l'analyse est terminée et partagez les résultats avec votre équipe.",
            icon: <FaEnvelope className="w-6 h-6 text-red-600 dark:text-red-400" />,
            bgColor: "bg-red-100 dark:bg-red-900",
            iconColor: "text-red-600 dark:text-red-400"
          },
          {
            title: "Gain de temps",
            description: "Économisez 80% du temps de tri manuel. Concentrez-vous sur les meilleurs candidats.",
            icon: <FaBolt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
            bgColor: "bg-indigo-100 dark:bg-indigo-900",
            iconColor: "text-indigo-600 dark:text-indigo-400"
          }
        ]}
      />

      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à révolutionner votre recrutement ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des centaines de RH qui font confiance à notre IA
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Commencer maintenant
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-4">CV Analyzer</h3>
              <p className="text-gray-400">
                L'IA qui révolutionne le recrutement en trouvant vos meilleurs candidats.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">RGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CV Analyzer. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
