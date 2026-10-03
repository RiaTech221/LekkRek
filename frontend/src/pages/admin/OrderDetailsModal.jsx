import React from 'react';

/**
 * ============================================================================
 * 🚀 Fichier : OrderDetailsModal.jsx
 * 🚀 Description : Modal pour afficher et gérer les détails d'une commande
 * ============================================================================
 */

export default function OrderDetailsModal({ order, onClose, onUpdatePayment }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <div className="flex items-center gap-4">
            <h3 className="font-black text-gray-900 text-xl tracking-tight">Commande #{order.id}</h3>
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border 
              ${order.fullStatus === 'NOUVELLE' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                order.fullStatus === 'EN_PREPARATION' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                order.fullStatus === 'PRETE' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                order.fullStatus === 'LIVREE' ? 'bg-green-50 text-green-700 border-green-100' :
                'bg-gray-100 text-gray-700 border-gray-200'}`}>
              {order.fullStatus}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200/50 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* Client & Livraison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
              <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Client
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase">Nom Complet</div>
                  <div className="font-bold text-gray-900">{order.client}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase">Téléphone</div>
                  <div className="font-bold text-gray-900">{order.clientPhone || 'Non renseigné'}</div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100">
              <h4 className="text-xs font-black text-orange-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Livraison
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-bold text-orange-400 uppercase">Type</div>
                  <div className="font-bold text-gray-900 inline-flex items-center gap-1.5">
                    {order.type === 'LIVRAISON' ? '🛵 Livraison' : order.type === 'EMPORTER' ? '🛍️ À emporter' : '🍽️ Sur Place'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-orange-400 uppercase">Adresse / Repère</div>
                  <div className="font-bold text-gray-900 leading-snug">{order.clientAddress || 'Au restaurant'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Panier */}
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Contenu de la commande</h4>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <ul className="space-y-2">
                {order.plat.split(', ').map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center py-2 border-b border-gray-200/60 last:border-0 last:pb-0">
                    <span className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-500">Montant Total</span>
                <span className="text-xl font-black text-gray-900">{order.totalAmount?.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Paiement : {order.paymentMethod}</h4>
            
            <div className={`rounded-2xl p-5 border flex items-center justify-between ${
              order.paymentStatus === 'PAYE' ? 'bg-green-50 border-green-200' :
              order.paymentStatus === 'ATTENTE' ? 'bg-amber-50 border-amber-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  order.paymentStatus === 'PAYE' ? 'bg-green-100 text-green-600' :
                  order.paymentStatus === 'ATTENTE' ? 'bg-amber-100 text-amber-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {order.paymentStatus === 'PAYE' ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg> :
                   order.paymentStatus === 'ATTENTE' ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> :
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>}
                </div>
                <div>
                  <div className="text-[10px] font-bold opacity-70 uppercase">Statut actuel</div>
                  <div className={`font-black text-lg ${
                    order.paymentStatus === 'PAYE' ? 'text-green-700' :
                    order.paymentStatus === 'ATTENTE' ? 'text-amber-700' :
                    'text-red-700'
                  }`}>
                    {order.paymentStatus === 'PAYE' ? 'Paiement Validé' :
                     order.paymentStatus === 'ATTENTE' ? 'En attente de paiement' :
                     'Paiement Échoué'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {order.paymentStatus !== 'PAYE' && (
                  <button 
                    onClick={() => {
                      onUpdatePayment(order.realId, 'PAYE');
                      onClose();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm hover:shadow transition-all text-sm"
                  >
                    Valider Paiement
                  </button>
                )}
                {order.paymentStatus === 'ATTENTE' && (
                  <button 
                    onClick={() => {
                      onUpdatePayment(order.realId, 'ECHOUE');
                      onClose();
                    }}
                    className="bg-white text-red-600 border border-red-200 hover:bg-red-50 font-bold py-2 px-4 rounded-xl shadow-sm transition-all text-sm"
                  >
                    Échec
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
