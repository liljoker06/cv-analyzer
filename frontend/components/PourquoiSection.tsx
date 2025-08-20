import { FaBolt, FaCheckCircle, FaChartPie } from 'react-icons/fa';

export default function PourquoiSection() {
  return (
    <section className="py-12">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Pourquoi utiliser l'outil d'analyse CV</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Des avantages concrets pour votre recherche d'emploi
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Raison 1 */}
        <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <FaBolt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-center mb-3 text-gray-900 dark:text-white">Analyse Rapide et Précise</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Notre algorithme d'IA analyse votre CV en quelques secondes et identifie les compétences clés, l'expérience et les formations qui correspondent le mieux aux attentes des recruteurs dans votre domaine.
          </p>
        </div>

        {/* Raison 2 */}
        <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <FaCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-center mb-3 text-gray-900 dark:text-white">Recommandations Personnalisées</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Recevez des suggestions concrètes pour améliorer votre CV et augmenter vos chances d'être remarqué par les recruteurs. Notre système identifie les points forts à mettre en avant et les lacunes à combler.
          </p>
        </div>

        {/* Raison 3 */}
        <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <FaChartPie className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-center mb-3 text-gray-900 dark:text-white">Insights du Marché</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Découvrez comment votre profil se positionne par rapport aux tendances actuelles du marché de l'emploi. Notre outil analyse en continu des milliers d'offres d'emploi pour vous fournir des conseils pertinents et à jour.
          </p>
        </div>
      </div>
    </section>
  );
}
