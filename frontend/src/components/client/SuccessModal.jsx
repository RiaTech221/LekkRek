export default function SuccessModal({ orderInfo, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Commande Réussie !
        </h2>

        <p className="text-gray-500 mb-8">
          Votre commande a été envoyée au restaurant. Merci pour votre confiance.
        </p>

        <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            Numéro de Suivi
          </p>

          <p className="text-3xl font-black text-red-600 tracking-wider">
            {orderInfo.orderNumber}
          </p>

          <p className="text-xs text-gray-500 mt-4 bg-white p-2 rounded-lg border border-gray-200">
            Conservez ce numéro pour suivre votre commande !
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
