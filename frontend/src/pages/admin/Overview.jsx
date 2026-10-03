import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * 📁 Fichier : Overview.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour Overview.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


export default function Overview() {
  const [orders, setOrders] = useState([]);
  const [restaurantsCount, setRestaurantsCount] = useState(0);
  const [operatorsCount, setOperatorsCount] = useState(0);
  const [platsCount, setPlatsCount] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { roles: [] };
  const isAdmin = user.roles.includes('ROLE_ADMIN');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    // Fetch Orders
    fetch('http://localhost:8080/api/v1/operator/orders', { headers })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setOrders(data); })
      .catch(console.error);

    if (isAdmin) {
      // Fetch Restaurants
      fetch('http://localhost:8080/api/v1/admin/restaurants', { headers })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setRestaurantsCount(data.length); })
        .catch(console.error);


      // Fetch Analytics
      fetch('http://localhost:8080/api/v1/admin/analytics/kpi', { headers })
        .then(res => res.json())
        .then(data => setAnalytics(data))
        .catch(console.error);

      // Fetch Operators
      fetch('http://localhost:8080/api/v1/admin/operators', { headers })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setOperatorsCount(data.length); })
        .catch(console.error);
    } else {
      // Fetch Plats for Operator
      fetch('http://localhost:8080/api/v1/operator/plats', { headers })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setPlatsCount(data.length); })
        .catch(console.error);
    }
  }, [isAdmin]);

  // Calculations
  const totalRevenue = orders.filter(o => o.status === 'LIVREE').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => ['NOUVELLE', 'EN_PREPARATION'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'LIVREE').length;

  return (
    <div className="p-8 w-full" style={{ background: '#f9fafb' }}>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h2>
        <p className="text-gray-500 text-sm mt-1">
          {isAdmin ? "Performances globales de la plateforme LekkRek." : "Résumé de votre activité opérationnelle du jour."}
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {isAdmin && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-gray-500 mb-2">Chiffre d'Affaires Global</h4>
            <p className="text-3xl font-black text-gray-900">{totalRevenue.toLocaleString()} <span className="text-lg">FCFA</span></p>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h4 className="text-sm font-bold text-gray-500 mb-2">Commandes en cours</h4>
          <p className="text-3xl font-black text-blue-600">{pendingOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h4 className="text-sm font-bold text-gray-500 mb-2">Commandes Livrées</h4>
          <p className="text-3xl font-black text-green-600">{completedOrders}</p>
        </div>

        {isAdmin ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-gray-500 mb-2">Réseau</h4>
            <p className="text-xl font-black text-gray-900">{restaurantsCount} <span className="text-sm font-normal text-gray-500">Restos</span> / {operatorsCount} <span className="text-sm font-normal text-gray-500">Agents</span></p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-gray-500 mb-2">Plats au catalogue</h4>
            <p className="text-3xl font-black text-gray-900">{platsCount}</p>
          </div>
        )}
      </div>

      
      {/* Analytics KPIs (Admin Only) */}
      {isAdmin && analytics && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📈</span> Statistiques & Analytics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Événements</h5>
              <div className="space-y-4">
                {analytics.totals.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="font-semibold text-gray-700">
                      {item.eventType === 'click_whatsapp' ? '🟢 Clics WhatsApp' : 
                       item.eventType === 'search' ? '🔍 Recherches' : item.eventType}
                    </span>
                    <span className="font-black text-xl text-gray-900">{item.count}</span>
                  </div>
                ))}
                {analytics.totals.length === 0 && <p className="text-gray-400 text-sm">Aucun événement enregistré.</p>}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Top 5 Recherches</h5>
              <div className="space-y-3">
                {analytics.topSearches.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-gray-400 font-bold">#{idx + 1}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 flex items-center px-3 relative overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-red-100" style={{ width: `${(item.count / analytics.topSearches[0].count) * 100}%` }}></div>
                      <span className="relative z-10 font-bold text-gray-800">{item.query}</span>
                    </div>
                    <span className="font-black text-gray-900 w-8 text-right">{item.count}</span>
                  </div>
                ))}
                {analytics.topSearches.length === 0 && <p className="text-gray-400 text-sm">Aucune recherche effectuée.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="font-bold text-gray-900 mb-6">5 Dernières commandes</h4>
        
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Commande</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice().reverse().slice(0, 5).map(o => {
                  
                  // Format the ID nicely
                  const shortId = "#" + (o.orderNumber || "").replace("CMD-", "").substring(0, 5);
                  
                  // Pretty status configurations
                  let statusConfig = { text: "Inconnu", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
                  switch (o.status) {
                    case 'NOUVELLE':
                      statusConfig = { text: "Nouvelle", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500 animate-pulse" };
                      break;
                    case 'EN_PREPARATION':
                      statusConfig = { text: "En préparation", color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" };
                      break;
                    case 'PRETE':
                      statusConfig = { text: "Prête au retrait", color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" };
                      break;
                    case 'LIVREE':
                      statusConfig = { text: "Livrée", color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" };
                      break;
                    case 'ANNULEE':
                      statusConfig = { text: "Annulée", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" };
                      break;
                    default:
                      statusConfig = { text: o.status, color: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-400" };
                  }

                  return (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                      <td className="p-4">
                        <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-black text-xs tracking-wider border border-gray-200 group-hover:bg-white transition-colors">
                          {shortId}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{o.clientName}</div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.color} text-xs font-bold shadow-sm`}>
                          <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                          {statusConfig.text}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-black text-gray-900 text-base">
                          {o.totalAmount.toLocaleString('fr-FR')} <span className="text-xs text-gray-500 font-bold ml-1">FCFA</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                      <td colSpan="4" className="p-12 text-center">
                        <div className="text-4xl mb-3">📭</div>
                        <div className="text-gray-900 font-bold mb-1">Aucune activité</div>
                        <div className="text-gray-500 text-sm">Les nouvelles commandes apparaîtront ici.</div>
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
