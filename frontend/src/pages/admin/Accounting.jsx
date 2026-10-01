import React, { useState, useEffect } from 'react';

export default function Accounting() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/v1/operator/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCommandes(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Calculs financiers
  const commandesLivrees = commandes.filter(c => c.status === 'LIVREE');
  const commandesAnnulees = commandes.filter(c => c.status === 'ANNULEE');
  
  const chiffreAffaires = commandesLivrees.reduce((acc, cmd) => acc + (cmd.totalAmount || 0), 0);
  const panierMoyen = commandesLivrees.length > 0 ? (chiffreAffaires / commandesLivrees.length).toFixed(0) : 0;
  
  // Répartition par méthode de paiement
  const paymentStats = commandesLivrees.reduce((acc, cmd) => {
      const method = cmd.paymentMethod || 'AUTRE';
      acc[method] = (acc[method] || 0) + (cmd.totalAmount || 0);
      return acc;
  }, {});

  if (loading) return <div className="p-8">Chargement des données financires...</div>;

  return (
    <div className="p-8 w-full" style={{ background: '#f9fafb' }}>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Comptabilité & Finances</h2>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble sur le chiffre d'affaires et l'historique des commandes.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">Chiffre d'Affaires</p>
          <h3 className="text-3xl font-black text-gray-900">{chiffreAffaires.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">Commandes Livrées</p>
          <h3 className="text-3xl font-black text-green-600">{commandesLivrees.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">Panier Moyen</p>
          <h3 className="text-3xl font-black text-gray-900">{panierMoyen} <span className="text-lg">FCFA</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">Commandes Annulées</p>
          <h3 className="text-3xl font-black text-red-600">{commandesAnnulees.length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Graphique répartition (Simulation via barres) */}
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-900 mb-6">Revenus par méthode</h4>
          <div className="space-y-4">
            {Object.entries(paymentStats).map(([method, amount]) => {
                const percentage = chiffreAffaires > 0 ? (amount / chiffreAffaires) * 100 : 0;
                return (
                  <div key={method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">{method.replace('_', ' ')}</span>
                      <span className="font-bold">{amount.toLocaleString('fr-FR')} F</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
            })}
            {Object.keys(paymentStats).length === 0 && (
                <p className="text-sm text-gray-500 text-center">Aucune donnée de paiement.</p>
            )}
          </div>
        </div>

        {/* Historique récent */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h4 className="font-bold text-gray-900">Historique des Livraisons</h4>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">N° Cmd</th>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Paiement</th>
                <th className="p-4 font-semibold text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {commandesLivrees.slice().reverse().map(cmd => (
                <tr key={cmd.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900 text-sm">{cmd.orderNumber}</td>
                  <td className="p-4 text-gray-600 text-sm">
                    {cmd.clientName}
                    <div className="text-xs text-gray-400">{cmd.type}</div>
                  </td>
                  <td className="p-4 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        {cmd.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-gray-900">
                    {cmd.totalAmount} F
                  </td>
                </tr>
              ))}
              {commandesLivrees.length === 0 && (
                <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">Aucune commande livrée pour le moment.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
