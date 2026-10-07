import { API_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * ============================================================================
 * 📁 Fichier : Accounting.jsx
 * 📝 Description : Composant React gérant la comptabilité administrateur.
 * 🔒 Sécurité : Chiffre d'affaires, commissions et reversements calculés côté serveur.
 * ============================================================================
 */

export default function Accounting() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // States pour la vue détaillée d'un restaurant
  const [selectedResto, setSelectedResto] = useState(null);
  const [restaurantReport, setRestaurantReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Chargement du résumé global depuis le backend
  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/accounting/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur chargement comptabilité");
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Erreur comptabilité globale:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Chargement du rapport détaillé certifié par le serveur pour le restaurant sélectionné
  useEffect(() => {
    if (!selectedResto) {
      setRestaurantReport(null);
      return;
    }
    fetchRestaurantReport(selectedResto.id, startDate, endDate);
  }, [selectedResto, startDate, endDate]);

  const fetchRestaurantReport = async (restoId, start, end) => {
    setReportLoading(true);
    const token = localStorage.getItem('token');
    try {
      let url = `${API_URL}/api/v1/admin/accounting/restaurants/${restoId}`;
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur chargement rapport restaurant");
      const data = await res.json();
      setRestaurantReport(data);
    } catch (err) {
      console.error("Erreur rapport restaurant:", err);
    } finally {
      setReportLoading(false);
    }
  };

  // Données dérivées du résumé serveur
  const globalCa = summary?.globalCa || 0;
  const globalBenefice = summary?.globalBenefice || 0;
  const restaurants = summary?.restaurants || [];

  const filteredRestaurants = restaurants.filter(r =>
    (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- EXPORT PDF ---
  const exportPDF = () => {
    if (!restaurantReport || !restaurantReport.transactions || restaurantReport.transactions.length === 0) {
      return alert("Aucune transaction à exporter.");
    }

    const doc = new jsPDF();
    const rate = restaurantReport.commissionRate || 10;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(211, 58, 48); // Red-600
    doc.text("LekkRek - Rapport Comptable", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Restaurant : ${restaurantReport.restaurantName}`, 14, 30);
    doc.text(`Commission LekkRek : ${rate}%`, 14, 37);
    doc.text(`Edité le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 44);

    if (startDate) doc.text(`Du : ${new Date(startDate).toLocaleDateString('fr-FR')}`, 120, 30);
    if (endDate) doc.text(`Au : ${new Date(endDate).toLocaleDateString('fr-FR')}`, 120, 37);

    // Table
    const tableColumn = ["N° Cmd", "Date", "Statut", "Total Brut", "Com. LekkRek", "A Reverser"];
    const tableRows = restaurantReport.transactions.map(c => [
      (c.orderNumber || "").substring(0, 8),
      new Date(c.createdAt).toLocaleDateString('fr-FR'),
      c.status,
      `${Number(c.totalAmount || 0).toLocaleString('fr-FR')} F`,
      `${Number(c.beneficeLekkRek || 0).toLocaleString('fr-FR')} F`,
      `${Number(c.aReverser || 0).toLocaleString('fr-FR')} F`
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [211, 58, 48] },
    });

    const finalY = doc.lastAutoTable.finalY || 55;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Brut : ${Number(restaurantReport.caTotal || 0).toLocaleString('fr-FR')} FCFA`, 14, finalY + 15);
    doc.setTextColor(211, 58, 48);
    doc.text(`Part LekkRek : ${Number(restaurantReport.beneficeLekkRek || 0).toLocaleString('fr-FR')} FCFA`, 14, finalY + 25);
    doc.setTextColor(22, 163, 74);
    doc.text(`Montant à reverser : ${Number(restaurantReport.aReverser || 0).toLocaleString('fr-FR')} FCFA`, 14, finalY + 35);

    doc.save(`Compta_${(restaurantReport.restaurantName || "resto").replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // --- EXPORT CSV ---
  const exportCSV = () => {
    if (!restaurantReport || !restaurantReport.transactions || restaurantReport.transactions.length === 0) {
      return alert("Aucune transaction à exporter.");
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Num_Commande,Date,Statut,Paiement,Montant_Total,Commission_LekkRek,A_Reverser\n";

    restaurantReport.transactions.forEach(c => {
      const date = new Date(c.createdAt).toLocaleDateString('fr-FR');
      const row = [
        c.orderNumber,
        date,
        c.status,
        c.paymentMethod,
        c.totalAmount,
        c.beneficeLekkRek,
        c.aReverser
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Transactions_${(restaurantReport.restaurantName || "resto").replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-8">
        <div>
          <span className="text-red-600 text-xs font-bold uppercase tracking-wider">Dashboard Administrateur</span>
          <h1 className="text-3xl font-black text-gray-900 mt-1">Comptabilité & Commissions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Calculs financiers certifiés côté serveur (Spring Boot BigDecimal)
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-sm text-right">
             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Généré Brut</p>
             <p className="text-2xl font-black text-gray-900">{Number(globalCa).toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg text-right">
             <p className="text-xs text-red-200 font-bold uppercase tracking-wider mb-1">Bénéfice Net LekkRek</p>
             <p className="text-2xl font-black">{Number(globalBenefice).toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>
      </header>

      {selectedResto ? (
        /* VUE DÉTAILLÉE */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { setSelectedResto(null); setRestaurantReport(null); }}
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
              
              <div className="flex gap-2">
                <button onClick={exportCSV} className="bg-gray-100 text-gray-700 border border-gray-200 font-bold text-sm px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <span>📄</span> CSV
                </button>
                <button onClick={exportPDF} className="bg-gray-900 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-black transition-colors flex items-center gap-2">
                  <span>📑</span> Exporter PDF
                </button>
              </div>
            </div>
          </div>

          {reportLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <>
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
                    {(restaurantReport?.transactions || []).map(c => {
                      return (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4"><span className="bg-gray-100 text-gray-800 font-mono text-xs px-2 py-1 rounded border border-gray-200">{(c.orderNumber || "").substring(0,6).toUpperCase()}</span></td>
                          <td className="p-4 text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString('fr-FR')} {new Date(c.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</td>
                          <td className="p-4"><span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${c.status === 'LIVREE' ? 'bg-green-100 text-green-700' : c.status === 'ANNULEE' ? 'bg-gray-100 text-gray-400 line-through' : 'bg-blue-100 text-blue-700'}`}>{c.status}</span></td>
                          <td className="p-4 text-sm font-bold text-gray-900 text-right">{Number(c.totalAmount || 0).toLocaleString('fr-FR')} F</td>
                          <td className="p-4 text-sm font-bold text-red-600 text-right">+{Number(c.beneficeLekkRek || 0).toLocaleString('fr-FR')} F</td>
                          <td className="p-4 text-sm font-bold text-green-600 text-right">{Number(c.aReverser || 0).toLocaleString('fr-FR')} F</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totaux calculés par le serveur */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm text-gray-500 font-medium">
                  {restaurantReport?.nbCommandes || 0} commandes validées
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">CA Période</p>
                    <p className="text-lg font-black text-gray-900">{Number(restaurantReport?.caTotal || 0).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Part LekkRek</p>
                    <p className="text-lg font-black text-red-600">+{Number(restaurantReport?.beneficeLekkRek || 0).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">À Reverser</p>
                    <p className="text-lg font-black text-green-600">{Number(restaurantReport?.aReverser || 0).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* VUE MAITRE */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <input 
              type="text" 
              placeholder="Rechercher un restaurant par nom ou localisation..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-80 focus:outline-none focus:border-red-500"
            />
            <span className="text-xs text-gray-400 font-medium">{filteredRestaurants.length} restaurants</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(resto => (
              <div key={resto.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                <div className="h-32 relative">
                  <img src={resto.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'} alt={resto.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                    Com: {resto.commissionRate}%
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-xl">{resto.name}</h3>
                    <p className="text-xs text-gray-300">{resto.location}</p>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">CA Brut ({resto.nbCommandes} cmd)</p>
                      <p className="text-lg font-black text-gray-900">{Number(resto.caTotal || 0).toLocaleString('fr-FR')} F</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">À reverser</p>
                      <p className="text-lg font-black text-green-600">{Number(resto.aReverser || 0).toLocaleString('fr-FR')} F</p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-3 mb-6 flex justify-between items-center border border-red-100">
                    <span className="text-xs font-bold text-red-600 uppercase">Part LekkRek</span>
                    <span className="font-black text-red-600">+{Number(resto.beneficeLekkRek || 0).toLocaleString('fr-FR')} F</span>
                  </div>
                  
                  <button 
                    onClick={() => { setSelectedResto(resto); setStartDate(''); setEndDate(''); }}
                    className="mt-auto w-full bg-gray-50 text-gray-900 border border-gray-200 font-bold py-3 rounded-xl hover:bg-gray-900 hover:text-white transition-colors flex justify-center items-center gap-2"
                  >
                    <span>📊</span> Voir le détail & exporter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
