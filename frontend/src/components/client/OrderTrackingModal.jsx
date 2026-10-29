import { useEffect, useState, useCallback } from 'react';
import { API_URL } from '../../config';

const STEPS = [
  { status: 'NOUVELLE', label: 'Transmise', icon: '⏳', desc: 'Commande enregistrée par le restaurant.' },
  { status: 'EN_PREPARATION', label: 'En cuisine', icon: '🍳', desc: 'Le chef prépare vos délicieux plats.' },
  { status: 'PRETE', label: 'Livreur en route', icon: '🛵', desc: 'Prête pour la livraison ou le retrait.' },
  { status: 'LIVREE', label: 'Livrée', icon: '✅', desc: 'Bon appétit ! Commande réceptionnée.' },
];

function getStepIndex(status) {
  if (!status) return 0;
  if (status === 'ANNULEE') return -1;
  const idx = STEPS.findIndex((s) => s.status === status);
  return idx !== -1 ? idx : 0;
}

export default function OrderTrackingModal({ isOpen, onClose, initialOrderNumber, onOrderNumberChange }) {
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  // Charger les commandes enregistrées en local
  useEffect(() => {
    if (!isOpen) return;

    try {
      const rawRecent = localStorage.getItem('lekkrek_recent_orders');
      const rawActive = localStorage.getItem('lekkrek_active_order');
      const parsedRecent = rawRecent ? JSON.parse(rawRecent) : [];
      setRecentOrders(parsedRecent);

      let targetNumber = initialOrderNumber;
      if (!targetNumber && rawActive) {
        const parsedActive = JSON.parse(rawActive);
        targetNumber = parsedActive?.orderNumber;
      }
      if (!targetNumber && parsedRecent.length > 0) {
        targetNumber = parsedRecent[0]?.orderNumber;
      }

      if (targetNumber) {
        setTrackOrderNumber(targetNumber);
        void fetchOrderDetails(targetNumber);
      }
    } catch {
      // Ignorer l'erreur de lecture locale
    }
  }, [isOpen, initialOrderNumber]);

  const fetchOrderDetails = useCallback(async (num) => {
    if (!num || !num.trim()) return;
    setTrackError('');
    setIsSearching(true);

    try {
      const clean = num.trim();
      const response = await fetch(
        `${API_URL}/api/v1/public/orders/track/${encodeURIComponent(clean)}`,
        { credentials: 'include' }
      );

      if (response.status === 404) {
        throw new Error('Commande introuvable. Vérifiez le numéro saisi.');
      }

      if (!response.ok) {
        throw new Error('Erreur lors du suivi de commande.');
      }

      const data = await response.json();
      setTrackResult(data);

      // Mettre à jour dans l'historique local
      try {
        const rawRecent = localStorage.getItem('lekkrek_recent_orders');
        const parsedRecent = rawRecent ? JSON.parse(rawRecent) : [];
        const updated = parsedRecent.map(o => o.orderNumber === data.orderNumber ? { ...o, status: data.status, restaurantName: data.restaurantName } : o);
        localStorage.setItem('lekkrek_recent_orders', JSON.stringify(updated));
      } catch {
        // Ignorer
      }
    } catch (error) {
      setTrackResult(null);
      setTrackError(error.message || 'Erreur lors de la recherche.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!trackOrderNumber.trim()) return;
    if (onOrderNumberChange) onOrderNumberChange(trackOrderNumber.trim());
    void fetchOrderDetails(trackOrderNumber.trim());
    setIsManualOpen(false);
  };

  const handleSelectRecent = (orderNum) => {
    setTrackOrderNumber(orderNum);
    if (onOrderNumberChange) onOrderNumberChange(orderNum);
    void fetchOrderDetails(orderNum);
  };

  const handleCopy = () => {
    if (!trackOrderNumber) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackOrderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  const activeStepIdx = getStepIndex(trackResult?.status);
  const isCancelled = trackResult?.status === 'ANNULEE';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full relative my-auto animate-fade-in">
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🛵</span>
          <h2 className="text-2xl font-black text-gray-900">
            Suivi en direct
          </h2>
        </div>

        {/* Commandes récentes si plusieurs */}
        {recentOrders.length > 1 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Vos commandes récentes
            </p>
            <div className="flex flex-wrap gap-2">
              {recentOrders.map((ro) => (
                <button
                  key={ro.orderNumber}
                  type="button"
                  onClick={() => handleSelectRecent(ro.orderNumber)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    trackOrderNumber === ro.orderNumber
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  #{ro.orderNumber}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Carte du numéro actif & boutons copier/actualiser */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Numéro de commande
            </p>
            <p className="text-lg font-black text-red-600">
              #{trackOrderNumber || '---'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm'
              }`}
            >
              {copied ? '✅ Copié' : '📋 Copier'}
            </button>
            <button
              type="button"
              onClick={() => void fetchOrderDetails(trackOrderNumber)}
              disabled={isSearching}
              title="Actualiser le statut de la commande"
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm flex items-center gap-1.5 disabled:opacity-60"
            >
              <span className={`inline-block ${isSearching ? 'animate-spin' : ''}`}>↻</span>
              <span>{isSearching ? 'En cours...' : 'Actualiser'}</span>
            </button>
          </div>
        </div>

        {/* Chargement */}
        {isSearching && !trackResult && (
          <div className="text-center py-6">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-bold">Actualisation du statut…</p>
          </div>
        )}

        {/* Erreur */}
        {trackError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 text-center">
            ⚠️ {trackError}
          </div>
        )}

        {/* Commande annulée */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-5 mb-6 text-center">
            <h3 className="text-lg font-black text-red-600 mb-1">❌ Commande Annulée</h3>
            <p className="text-xs text-gray-500">Cette commande a été annulée par le restaurant.</p>
          </div>
        )}

        {/* Stepper visuel de progression */}
        {trackResult && !isCancelled && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Progression de la livraison
            </p>
            <div className="space-y-4">
              {STEPS.map((step, idx) => {
                const isPassed = idx <= activeStepIdx;
                const isCurrent = idx === activeStepIdx;
                return (
                  <div key={step.status} className="flex items-start gap-3 relative">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                          isPassed
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-red-100 border-red-600 bg-red-50' : ''}`}
                      >
                        {step.icon}
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-6 my-1 ${
                            idx < activeStepIdx ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-extrabold ${
                            isPassed ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                            En cours
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Détails complémentaires */}
            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Restaurant</p>
                <p className="font-extrabold text-gray-900 truncate">{trackResult.restaurantName}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Montant Total</p>
                <p className="font-black text-red-600">{Number(trackResult.totalAmount).toLocaleString()} FCFA</p>
              </div>
              {trackResult.type && (
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Mode</p>
                  <p className="font-bold text-gray-800">{trackResult.type}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section recherche manuelle repliable */}
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsManualOpen(prev => !prev)}
            className="w-full text-center text-xs font-bold text-red-600 hover:text-red-700 py-1 transition-colors"
          >
            {isManualOpen ? '▲ Masquer la recherche manuelle' : '🔍 Suivre une autre commande par numéro'}
          </button>

          {isManualOpen && (
            <form onSubmit={handleManualSubmit} className="flex gap-2 mt-3 animate-fade-in">
              <input
                type="text"
                placeholder="Ex: CMD-123456"
                required
                className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-gray-900 text-sm focus:outline-none focus:border-red-600 uppercase"
                value={trackOrderNumber}
                onChange={(e) => setTrackOrderNumber(e.target.value.toUpperCase())}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-gray-900 text-white px-5 rounded-xl font-bold hover:bg-black text-sm transition-colors disabled:opacity-60"
              >
                {isSearching ? '...' : 'OK'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
