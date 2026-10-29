import { useState } from 'react';

export default function SuccessModal({ orderInfo, onClose, onTrackOrder }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!orderInfo?.orderNumber) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(orderInfo.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Commande Réussie !
        </h2>

        <p className="text-gray-500 mb-6">
          Votre commande a bien été transmise à la cuisine.
        </p>

        <div className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Numéro de Suivi
          </p>

          <p className="text-3xl font-black text-red-600 tracking-wider mb-3">
            {orderInfo.orderNumber}
          </p>

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs transition-all ${
              copied
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm'
            }`}
          >
            {copied ? '✅ Numéro copié !' : '📋 Copier le numéro'}
          </button>
        </div>

        <div className="space-y-3">
          {onTrackOrder && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onTrackOrder(orderInfo.orderNumber);
              }}
              className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>🛵</span> Suivre ma commande en direct
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Retour au menu
          </button>
        </div>
      </div>
    </div>
  );
}
