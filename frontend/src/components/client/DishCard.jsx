import { formatImageUrl } from '../../config';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800';

export default function DishCard({ plat, onAdd }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
      <div className="relative h-56 overflow-hidden bg-gray-100 shrink-0">
        <img
          src={formatImageUrl(plat.image)}
          alt={plat.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full shadow-md backdrop-blur-md ${plat.status === 'DISPO' ? 'bg-white/90 text-green-600' : 'bg-red-600/90 text-white'}`}>
            {plat.status === 'DISPO' ? 'Disponible' : 'Épuisé'}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">🏪</span>
          <span className="text-sm font-bold text-gray-500">{plat.restaurant?.name || 'Restaurant Partenaire'}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{plat.name}</h3>
        <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2">{plat.description || 'Un délicieux plat préparé avec soin.'}</p>

        <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-50">
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prix</span>
            <span className="text-2xl font-black text-gray-900">{plat.price.toLocaleString()} <span className="text-base text-gray-500">FCFA</span></span>
          </div>
          {plat.status === 'DISPO' ? (
            <button onClick={() => onAdd(plat)} className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-light hover:bg-red-600 hover:shadow-lg hover:shadow-red-600/30 transition-all transform hover:-translate-y-1">
              +
            </button>
          ) : (
            <button disabled className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-xl font-light cursor-not-allowed">
              —
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
