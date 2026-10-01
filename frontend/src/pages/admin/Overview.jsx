import React, { useState, useEffect } from 'react';

export default function Overview() {
  const [orders, setOrders] = useState([]);
  const [restaurantsCount, setRestaurantsCount] = useState(0);
  const [operatorsCount, setOperatorsCount] = useState(0);
  const [platsCount, setPlatsCount] = useState(0);
  
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

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="font-bold text-gray-900 mb-6">5 Dernières commandes</h4>
        <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">N° Cmd</th>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice().reverse().slice(0, 5).map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900 text-sm">{o.orderNumber}</td>
                  <td className="p-4 text-sm">{o.clientName}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                        o.status === 'LIVREE' ? 'bg-green-50 text-green-700' :
                        o.status === 'ANNULEE' ? 'bg-red-50 text-red-700' :
                        'bg-blue-50 text-blue-700'
                    }`}>
                        {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold">{o.totalAmount} FCFA</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">Aucune activité récente.</td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
}
