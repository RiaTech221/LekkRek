import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * 📁 Fichier : Accounting.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour Accounting.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


export default function Accounting() {
  const [commandes, setCommandes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // States pour la vue détaillée
  const [selectedResto, setSelectedResto] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const resOrders = await fetch('http://localhost:8080/api/v1/operator/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataOrders = await resOrders.json();
      
      const resRestos = await fetch('http://localhost:8080/api/v1/admin/restaurants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataRestos = await resRestos.json();

      setCommandes(Array.isArray(dataOrders) ? dataOrders : []);
      setRestaurants(Array.isArray(dataRestos) ? dataRestos : []);
    } catch (err) {
      console.error("Erreur", err);
    } finally {
      setLoading(false);
    }
  };

  // --- CALCUL DES STATISTIQUES ---
  const statsParRestaurant = restaurants.map(resto => {
    const cmds = commandes.filter(c => c.restaurant && c.restaurant.id === resto.id && c.status !== 'ANNULEE');
    const caTotal = cmds.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const nbCommandes = cmds.length;
    const commissionRate = resto.commissionRate != null ? resto.commissionRate : 10.0;
    const beneficeLekkRek = caTotal * (commissionRate / 100);
    const aReverser = caTotal - beneficeLekkRek;
    
    return { ...resto, caTotal, nbCommandes, commissionRate, beneficeLekkRek, aReverser };
  });

  const globalCa = statsParRestaurant.reduce((acc, r) => acc + r.caTotal, 0);
  const globalBenefice = statsParRestaurant.reduce((acc, r) => acc + r.beneficeLekkRek, 0);

  // --- FILTRES ---
  const getFilteredTransactions = () => {
    if (!selectedResto) return [];
    let filtered = commandes.filter(c => c.restaurant && c.restaurant.id === selectedResto.id);
    if (startDate) filtered = filtered.filter(c => new Date(c.createdAt) >= new Date(startDate));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(c => new Date(c.createdAt) <= end);
    }
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filtered;
  };

  const getFilteredStats = () => {
    const transactions = getFilteredTransactions();
    const caTotal = transactions.reduce((acc, curr) => acc + (curr.status !== 'ANNULEE' ? curr.totalAmount : 0), 0);
    const commissionRate = selectedResto?.commissionRate || 10;
    const beneficeLekkRek = caTotal * (commissionRate / 100);
    return { caTotal, beneficeLekkRek, aReverser: caTotal - beneficeLekkRek };
  };

  // --- EXPORT CSV ---
  const exportCSV = () => {
    const transactions = getFilteredTransactions();
    if (transactions.length === 0) return alert("Aucune transaction à exporter.");

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Num_Commande,Date,Heure,Client,Statut,Paiement,Montant_Total,Commission_LekkRek,A_Reverser\n";

    const rate = selectedResto.commissionRate || 10;

    transactions.forEach(c => {
      const montant = c.status !== 'ANNULEE' ? c.totalAmount : 0;
      const date = new Date(c.createdAt).toLocaleDateString();
      const time = new Date(c.createdAt).toLocaleTimeString();
      const benef = montant * (rate / 100);
      const reverser = montant - benef;
      
      const row = `${c.orderNumber},${date},${time},"${c.clientName}",${c.status},${c.paymentStatus},${montant},${benef},${reverser}`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Export_${selectedResto.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Chargement...</div>;

  return (
    <div className="p-8 w-full h-full overflow-y-auto" style={{ background: '#f4f6f8' }}>
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Comptabilité & Statistiques</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Revenus, commissions et versements par restaurant.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-sm text-right">
             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Généré Brut</p>
             <p className="text-2xl font-black text-gray-900">{globalCa.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg text-right">
             <p className="text-xs text-red-200 font-bold uppercase tracking-wider mb-1">Bénéfice Net LekkRek</p>
             <p className="text-2xl font-black">{globalBenefice.toLocaleString()} FCFA</p>
          </div>
        </div>
      </header>

      {selectedResto ? (
        /* VUE DÉTAILLÉE */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedResto(null)}
                className="bg-white border border-gray-200 text-gray-700 w-10 h-10 rounded-full font-bold flex items-center justify-center hover:bg-gray-100 hover:text-black transition-colors"
                title="Retour"
              >
                ←
              </button>
              <div>
                <h3 className="font-bold text-xl text-gray-900">{selectedResto.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">
                     Commission: {selectedResto.commissionRate || 10}%
                   </span>
                   {selectedResto.subscriptionPlan && (
                     <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                       Plan {selectedResto.subscriptionPlan}
                     </span>
                   )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 items-center">
              <div>
                <input type="date" className="bg-white border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-red-500" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <input type="date" className="bg-white border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-red-500" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <button onClick={exportCSV} className="bg-gray-900 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-black transition-colors flex items-center gap-2">
                <span>⬇️</span> Exporter CSV
              </button>
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="p-4 font-bold">N° Cmd</th>
                  <th className="p-4 font-bold">Date & Heure</th>
                  <th className="p-4 font-bold">Statut</th>
                  <th className="p-4 font-bold text-right">Total Brut</th>
                  <th className="p-4 font-bold text-right text-red-600">Com. LekkRek</th>
                  <th className="p-4 font-bold text-right text-green-600">À Reverser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getFilteredTransactions().map(c => {
                  const isValid = c.status !== 'ANNULEE';
                  const montant = isValid ? c.totalAmount : 0;
                  const rate = selectedResto.commissionRate || 10;
                  const benef = montant * (rate / 100);
                  const reverser = montant - benef;
                  
                  return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4"><span className="bg-gray-100 text-gray-800 font-mono text-xs px-2 py-1 rounded border border-gray-200">{c.orderNumber.substring(0,6).toUpperCase()}</span></td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(c.createdAt).toLocaleDateString()} à {new Date(c.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1 ${
                        c.status === 'LIVREE' ? 'bg-green-50 text-green-700 border border-green-200' :
                        c.status === 'ANNULEE' ? 'bg-red-50 text-red-700 border border-red-200' : 
                        c.status === 'EN_PREPARATION' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        c.status === 'PRETE' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {c.status === 'LIVREE' && '✅ Livrée'}
                        {c.status === 'ANNULEE' && '❌ Annulée'}
                        {c.status === 'EN_PREPARATION' && '👨‍🍳 En préparation'}
                        {c.status === 'PRETE' && '🍱 Prête'}
                        {c.status === 'NOUVELLE' && '🆕 Nouvelle'}
                        {!['LIVREE', 'ANNULEE', 'EN_PREPARATION', 'PRETE', 'NOUVELLE'].includes(c.status) && c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-900">{montant.toLocaleString()} F</td>
                    <td className="p-4 text-right font-bold text-red-600">+{benef.toLocaleString()} F</td>
                    <td className="p-4 text-right font-black text-green-600">{reverser.toLocaleString()} F</td>
                  </tr>
                )})}
                {getFilteredTransactions().length === 0 && (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400 font-medium">Aucune transaction trouvée.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Totaux Période */}
          {(() => {
            const stats = getFilteredStats();
            return (
              <div className="bg-gray-900 p-6 flex flex-wrap justify-end gap-8 md:gap-12 text-white items-center">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1"><span className="text-sm">💶</span> Total Brut Période</p>
                  <p className="text-xl font-bold text-gray-100">{stats.caTotal.toLocaleString()} <span className="text-sm font-normal text-gray-500">FCFA</span></p>
                </div>
                <div className="w-px h-10 bg-gray-700 hidden md:block"></div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1"><span className="text-sm">📈</span> Part LekkRek ({selectedResto.commissionRate || 10}%)</p>
                  <p className="text-xl font-bold text-red-400">+{stats.beneficeLekkRek.toLocaleString()} <span className="text-sm font-normal text-red-900/50">FCFA</span></p>
                </div>
                <div className="w-px h-10 bg-gray-700 hidden md:block"></div>
                <div className="text-right bg-green-500/10 px-6 py-3 rounded-xl border border-green-500/20">
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1"><span className="text-sm">🏦</span> À Reverser au Restaurant</p>
                  <p className="text-2xl font-black text-green-400">{stats.aReverser.toLocaleString()} <span className="text-sm font-bold text-green-700">FCFA</span></p>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* VUE MAITRE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsParRestaurant.map(resto => (
            <div key={resto.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              <div className="h-32 relative">
                <img src={resto.image} alt={resto.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                  Com: {resto.commissionRate}%
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold text-xl">{resto.name}</h3>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">CA Brut</p>
                    <p className="text-lg font-black text-gray-900">{resto.caTotal.toLocaleString()} F</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">À reverser</p>
                    <p className="text-lg font-black text-green-600">{resto.aReverser.toLocaleString()} F</p>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-3 mb-6 flex justify-between items-center border border-red-100">
                  <span className="text-xs font-bold text-red-600 uppercase">Part LekkRek</span>
                  <span className="font-black text-red-600">+{resto.beneficeLekkRek.toLocaleString()} F</span>
                </div>
                
                <button 
                  onClick={() => { setSelectedResto(resto); setStartDate(''); setEndDate(''); }}
                  className="mt-auto w-full bg-gray-50 text-gray-900 border border-gray-200 font-bold py-3 rounded-xl hover:bg-gray-900 hover:text-white transition-colors flex justify-center items-center gap-2"
                >
                  <span>📊</span> Voir le détail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
