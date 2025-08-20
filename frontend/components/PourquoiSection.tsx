import { FaBolt, FaCheckCircle, FaChartPie } from 'react-icons/fa';

export default function PourquoiSection() {
  return (
    <section className="py-12 mt-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">Pourquoi utiliser l'outil d'analyse CV</h2>
        <div className="mt-2 h-1 w-20 bg-blue-500 mx-auto"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Raison 1 */}
        <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-lg bg-white">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <FaBolt className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-center mb-3">Analyse Rapide et Précise</h3>
          <p className="text-gray-600 text-center">
            Notre algorithme d'IA analyse votre CV en quelques secondes et identifie les compétences clés, l'expérience et les formations qui correspondent le mieux aux attentes des recruteurs dans votre domaine.
          </p>
        </div>

        {/* Raison 2 */}
        <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-lg bg-white">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <FaCheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-center mb-3">Recommandations Personnalisées</h3>
          <p className="text-gray-600 text-center">
            Recevez des suggestions concrètes pour améliorer votre CV et augmenter vos chances d'être remarqué par les recruteurs. Notre système identifie les points forts à mettre en avant et les lacunes à combler.
          </p>
        </div>

        {/* Raison 3 */}
        <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-lg bg-white">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <FaChartPie className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-center mb-3">Insights du Marché</h3>
          <p className="text-gray-600 text-center">
            Découvrez comment votre profil se positionne par rapport aux tendances actuelles du marché de l'emploi. Notre outil analyse en continu des milliers d'offres d'emploi pour vous fournir des conseils pertinents et à jour.
          </p>
        </div>
      </div>
    </section>
  );
}
