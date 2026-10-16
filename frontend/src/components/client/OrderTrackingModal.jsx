import { useState } from 'react';
import { API_URL } from '../../config';

export default function OrderTrackingModal({ isOpen, onClose, onOrderNumberChange }) {
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackResult(null);
    setIsSearching(true);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/public/orders/track/${encodeURIComponent(trackOrderNumber.trim())}`
      );

      if (response.status === 404) {
        throw new Error('Commande introuvable.');
      }

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche.');
      }

      const data = await response.json();
      setTrackResult(data);
    } catch (error) {
      setTrackError(error.message || 'Erreur lors de la recherche.');
    } finally {
      setIsSearching(false);
    }
  };

  const statusLabels = {
    NOUVELLE: 'En attente ⏳',
    EN_PREPARATION: 'En préparation 🍳',
    PRETE: 'Prête (Livreur en route) 🛵',
    LIVREE: 'Livrée ✅',
    ANNULEE: 'Annulée ❌',
  };

  const statusColors = {
    LIVREE: 'text-green-600',
    PRETE: 'text-blue-600',
    EN_PREPARATION: 'text-orange-500',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black text-gray-900 mb-6">
          Suivre une commande
        </h2>

        <form onSubmit={handleTrackOrder} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Ex: CMD-123456"
            required
            className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-900 focus:outline-none focus:border-red-600"
            value={trackOrderNumber}
                      onChange={(e) => {
              setTrackOrderNumber(e.target.value);
              if (onOrderNumberChange) onOrderNumberChange(e.target.value);
            }}
          />

          <button
            type="submit"
            disabled={isSearching}
            className="bg-red-600 text-white px-6 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {isSearching ? '...' : 'OK'}
          </button>
        </form>

        {trackError && (
          <p className="text-red-600 font-medium text-center bg-red-50 p-4 rounded-xl">
            {trackError}
          </p>
        )}

        {trackResult && (
          <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50">
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Statut actuel
              </p>

              <h3
                className={`text-xl font-black ${
                  statusColors[trackResult.status] || 'text-gray-900'
                }`}
              >
                {statusLabels[trackResult.status] || trackResult.status}
              </h3>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-bold text-gray-900 mb-1">
                Détails
              </p>

              <p className="text-gray-500 text-sm">
                 Restaurant : {trackResult.restaurantName}
              </p>

              <p className="text-gray-500 text-sm">
                Total :{' '}
                <span className="font-bold text-gray-900">
                  {trackResult.totalAmount} FCFA
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}