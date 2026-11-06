import React, { useState } from 'react';
import { formatImageUrl } from '../../config';

export function DishCardImage({
  plat,
  className = "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500",
  showPlaceholderText = true
}) {
  const [imgError, setImgError] = useState(false);
  const formatted = formatImageUrl(plat?.image);
  const [lastSrc, setLastSrc] = useState(formatted);

  if (lastSrc !== formatted) {
    setLastSrc(formatted);
    setImgError(false);
  }

  const hasImage = Boolean(formatted && !imgError);

  if (!hasImage) {
    const initial = (plat?.name || 'P').trim().charAt(0).toUpperCase();
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-gray-900 to-rose-950 flex flex-col items-center justify-center text-white select-none">
        <span className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-lg sm:text-2xl font-black text-rose-400 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
          {initial}
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-gray-300 mt-2 tracking-wider uppercase opacity-75 truncate max-w-[85%] text-center px-2">
          {plat?.name || 'Plat'}
        </span>
        {showPlaceholderText && (
          <span className="text-[9px] font-medium text-rose-300/80 mt-0.5 tracking-wide">
            Photo en attente
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={formatted}
      alt=""
      className={className}
      onError={() => setImgError(true)}
    />
  );
}

export default function DishCard({ plat, onAdd }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
      {/* Image */}
      <div className="relative h-36 sm:h-56 overflow-hidden bg-gray-100 shrink-0">
        <DishCardImage plat={plat} />
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-1">
          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full shadow-md backdrop-blur-md ${plat.status === 'DISPO' ? 'bg-white/90 text-green-600' : 'bg-red-600/90 text-white'}`}>
            {plat.status === 'DISPO' ? 'Dispo' : 'Épuisé'}
          </span>
          {plat.isOffreSpeciale && (
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full shadow-md bg-amber-500 text-white">
              Plat du jour
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">🏪</span>
          <span className="text-xs font-bold text-gray-700 truncate">{plat.restaurant?.name || 'Restaurant Partenaire'}</span>
        </div>

        {plat.restaurant?.repere && (
          <p className="text-[11px] text-gray-500 flex items-center gap-1 mb-2 truncate">
            <span className="text-[10px]">📍</span> {plat.restaurant.repere}
          </p>
        )}

        {/* Badges modes de service */}
        <div className="flex flex-wrap items-center gap-1 mb-2.5">
          {plat.restaurant?.surPlace !== false && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600" title="Sur place disponible">
              🍽️ Sur place
            </span>
          )}
          {(plat.restaurant?.aEmporter ?? plat.restaurant?.aemporter) !== false && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600" title="À emporter disponible">
              🛍️ À emporter
            </span>
          )}
          {plat.restaurant?.livraison !== false && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700" title="Livraison disponible">
              🛵 Livr. {plat.restaurant?.supplementLivraison > 0 ? `(+${plat.restaurant.supplementLivraison} F)` : ''}
            </span>
          )}
        </div>

        <h3 className="text-sm sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight line-clamp-2">{plat.name}</h3>
        <p className="hidden sm:block text-gray-500 text-sm mb-4 flex-1 line-clamp-2">{plat.description || 'Un délicieux plat préparé avec soin.'}</p>

        <div className="flex justify-between items-center mt-auto pt-2 sm:pt-4 border-t border-gray-50">
          <div>
            <span className="hidden sm:block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prix</span>
            <span className="text-base sm:text-2xl font-black text-red-600 sm:text-gray-900">{plat.price ? plat.price.toLocaleString() : 0} <span className="text-xs sm:text-base text-gray-500">FCFA</span></span>
          </div>
          {plat.status === 'DISPO' ? (
            <button onClick={() => onAdd(plat)} className="w-9 h-9 sm:w-12 sm:h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-light hover:bg-red-600 hover:shadow-lg hover:shadow-red-600/30 transition-all transform hover:-translate-y-1">
              +
            </button>
          ) : (
            <button disabled className="w-9 h-9 sm:w-12 sm:h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-xl font-light cursor-not-allowed">
              —
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
