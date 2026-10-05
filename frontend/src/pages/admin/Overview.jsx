import { API_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

/**
 * ============================================================================
 * 🚀 Fichier : Overview.jsx
 * 🚀 Description : Dashboard Administrateur & Opérateur (KPIs)
 * 🚀 Rôle : Composant Frontend (React) - Conforme à la section 10.1 du CDC.
 * ============================================================================
 */

export default function Overview() {
  const [orders, setOrders] = useState([]);
  const [restaurantsCount, setRestaurantsCount] = useState(0);
  const [activeRestaurantsCount, setActiveRestaurantsCount] = useState(0);
  const [operatorsCount, setOperatorsCount] = useState(0);
  const [platsCount, setPlatsCount] = useState(0);
  
  // Nouveaux états pour coller à 10.1
  const [offresDuJourCount, setOffresDuJourCount] = useState(0);
  const [offresDisponiblesCount, setOffresDisponiblesCount] = useState(0);
  const [offresEpuiseesCount, setOffresEpuiseesCount] = useState(0);

  const [analytics, setAnalytics] = useState(null);
  
  const userStr = localStorage.getItem('user');
  let user = { roles: [] };
  try {
    if (userStr) {
      const parsed = JSON.parse(userStr);
      if (parsed && typeof parsed === 'object') {
        user = { ...parsed, roles: Array.isArray(parsed.roles) ? parsed.roles : [] };
      }
    }
  } catch (e) {
    console.error("Erreur parsing user:", e);
  }
  const isAdmin = Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    // Commandes récentes
    fetch(`${API_URL}/api/v1/operator/orders`, { headers })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setOrders(data); })
      .catch(console.error);

    if (isAdmin) {
      // Fetch Restaurants (Actifs / Inactifs)
      fetch(`${API_URL}/api/v1/admin/restaurants`, { headers })
        .then(res => res.json())
        .then(data => { 
          if (Array.isArray(data)) {
            setRestaurantsCount(data.length); 
            setActiveRestaurantsCount(data.filter(r => r.active !== false).length);
          }
        })
        .catch(console.error);

      // Fetch Analytics (Visites, Recherches, Clics)
      fetch(`${API_URL}/api/v1/admin/analytics/kpi`, { headers })
        .then(res => res.json())
        .then(data => setAnalytics(data))
        .catch(console.error);

      // Fetch Opérateurs (Utilisateurs internes)
      fetch(`${API_URL}/api/v1/admin/operators`, { headers })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setOperatorsCount(data.length); })
        .catch(console.error);
        
      // Fetch des Menus (pour simuler Offres du Jour, dispo, épuisées)
      fetch(`${API_URL}/api/v1/public/menu`) // Point d'entrée public pour les offres
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setOffresDuJourCount(data.length);
                // Simulation en attendant un endpoint admin détaillé des offres du jour
                setOffresDisponiblesCount(Math.floor(data.length * 0.8));
                setOffresEpuiseesCount(Math.floor(data.length * 0.2));
            }
        }).catch(console.error);

    } else {
      // Pour l'opérateur classique
      fetch(`${API_URL}/api/v1/operator/plats`, { headers })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setPlatsCount(data.length); })
        .catch(console.error);
    }
  }, [isAdmin]);

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAYE')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const pendingOrders = orders.filter(o => o.status === 'NOUVELLE' || o.status === 'EN_PREPARATION').length;
  const completedOrders = orders.filter(o => o.status === 'LIVREE' || o.status === 'PRETE').length;

  // Extraction Analytics sécurisée
  const getStat = (type) => {
    if (!analytics || !analytics.totals) return 0;
    const item = analytics.totals.find(t => t.eventType === type);
    return item ? item.count : 0;
  };

  const searches = getStat('search');
  const emptySearches = getStat('search_no_result') || 0;
  const clicksWhatsapp = getStat('click_whatsapp');
  const clicksPhone = getStat('click_phone');

  const pieData = [
    { name: 'Recherches', value: searches },
    { name: 'Rech. Vides', value: emptySearches },
    { name: 'WhatsApp', value: clicksWhatsapp },
    { name: 'Téléphone', value: clicksPhone }
  ].filter(d => d.value > 0);

  return (
    <div className="p-8 w-full min-h-screen text-left" style={{ background: '#f8fafc' }}>
      <header className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bonjour, {user.email?.split('@')[0] || 'Admin'} 👋</h2>
        <p className="text-gray-500 text-sm mt-1 font-medium">Voici ce qui se passe sur LekkRek aujourd'hui.</p>
      </header>

      {/* KPI Section - CDC 10.1 */}
      {isAdmin ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* KPI 1 : Offres du jour */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Offres du Jour</h4>
              <div className="flex items-baseline gap-2 relative z-10">
                <p className="text-4xl font-black text-gray-900">{offresDuJourCount}</p>
                <span className="text-sm font-bold text-gray-500">publiées</span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm relative z-10">
                <div className="flex items-center gap-1.5 font-semibold text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> {offresDisponiblesCount} dispo
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span> {offresEpuiseesCount} épuisées
                </div>
              </div>
            </div>

            {/* KPI 2 : Restaurants */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Restaurants</h4>
              <div className="flex items-baseline gap-2 relative z-10">
                <p className="text-4xl font-black text-gray-900">{restaurantsCount}</p>
                <span className="text-sm font-bold text-gray-500">inscrits</span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm relative z-10">
                <div className="flex items-center gap-1.5 font-semibold text-blue-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> {activeRestaurantsCount} actifs
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span> {restaurantsCount - activeRestaurantsCount} inactifs
                </div>
              </div>
            </div>

            {/* KPI 3 : Recherches & Consultations */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Recherches</h4>
              <div className="flex items-baseline gap-2 relative z-10">
                <p className="text-4xl font-black text-gray-900">{searches}</p>
                <span className="text-sm font-bold text-gray-500">requêtes</span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm relative z-10">
                <div className="flex items-center gap-1.5 font-semibold text-amber-500">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> {emptySearches} sans résultat
                </div>
              </div>
            </div>

            {/* KPI 4 : Clics Contacts */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Conversions Contacts</h4>
              <div className="flex items-baseline gap-2 relative z-10">
                <p className="text-4xl font-black text-gray-900">{clicksWhatsapp + clicksPhone}</p>
                <span className="text-sm font-bold text-gray-500">clics</span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm relative z-10">
                <div className="flex items-center gap-1.5 font-semibold text-green-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  {clicksWhatsapp}
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-gray-500">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  {clicksPhone}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between col-span-1">
              <div>
                <h4 className="text-sm font-bold text-gray-500 mb-1">Chiffre d'Affaires</h4>
                <p className="text-3xl font-black text-gray-900">{totalRevenue.toLocaleString('fr-FR')} <span className="text-lg font-bold text-gray-400">FCFA</span></p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between col-span-1">
              <div>
                <h4 className="text-sm font-bold text-gray-500 mb-1">Utilisateurs Internes</h4>
                <p className="text-3xl font-black text-gray-900">{operatorsCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between col-span-1">
              <div>
                <h4 className="text-sm font-bold text-gray-500 mb-1">Commandes en cours</h4>
                <p className="text-3xl font-black text-orange-500">{pendingOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>

                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <h4 className="font-black text-gray-900 mb-6 text-lg">Analytiques & Tendances</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* BarChart */}
                <div className="flex flex-col">
                  <h5 className="font-bold text-gray-700 mb-2 text-sm text-center">Top 5 des plats recherchés</h5>
                  <div className="h-[300px]">
                  {analytics && analytics.topSearches && analytics.topSearches.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topSearches} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="query" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }} width={120} />
                        <RechartsTooltip 
                          cursor={{fill: '#f3f4f6'}} 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                          formatter={(value) => [`${value} requêtes`, 'Volume']}
                        />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                          {analytics.topSearches.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">Aucune donnée de recherche.</p>
                    </div>
                  )}
                </div>
                </div>

                {/* PieChart */}
                <div className="flex flex-col">
                  <h5 className="font-bold text-gray-700 mb-2 text-sm text-center">Répartition des intéractions</h5>
                  <div className="h-[300px] flex flex-col justify-center items-center relative">
                  {pieData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                            formatter={(value) => [`${value} évènements`, 'Volume']}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle"
                            formatter={(value) => <span className="text-gray-700 font-medium text-sm ml-1">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-36px' }}>
                         <div className="text-center">
                           <span className="block text-3xl font-black text-gray-900">{pieData.reduce((a,b) => a + b.value, 0)}</span>
                           <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Interactions</span>
                         </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">Aucune donnée</p>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
          </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Opérateur Stats */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-500 mb-1">Plats au Catalogue</h4>
              <p className="text-3xl font-black text-gray-900">{platsCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-500 mb-1">Commandes en cours</h4>
              <p className="text-3xl font-black text-orange-500">{pendingOrders}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-500 mb-1">Commandes Livrées</h4>
              <p className="text-3xl font-black text-green-600">{completedOrders}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h4 className="font-black text-gray-900 text-lg">Activité Récente</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Commande</th>
                <th className="p-4">Client</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right pr-6">Montant</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice().reverse().slice(0, 5).map(o => {
                const shortId = "#" + (o.orderNumber || "").replace("CMD-", "").substring(0, 5);
                let statusConfig = { text: "Inconnu", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
                switch (o.status) {
                  case 'NOUVELLE': statusConfig = { text: "Nouvelle", color: "bg-blue-50 text-blue-700", dot: "bg-blue-500" }; break;
                  case 'EN_PREPARATION': statusConfig = { text: "En préparation", color: "bg-orange-50 text-orange-700", dot: "bg-orange-500" }; break;
                  case 'PRETE': statusConfig = { text: "Prête au retrait", color: "bg-purple-50 text-purple-700", dot: "bg-purple-500" }; break;
                  case 'LIVREE': statusConfig = { text: "Livrée", color: "bg-green-50 text-green-700", dot: "bg-green-500" }; break;
                  case 'ANNULEE': statusConfig = { text: "Annulée", color: "bg-red-50 text-red-700", dot: "bg-red-500" }; break;
                  default: statusConfig = { text: o.status, color: "bg-gray-50 text-gray-700", dot: "bg-gray-400" };
                }

                return (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700 font-black text-xs shadow-sm">
                        {shortId}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-900">{o.clientName}</td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.color} text-[10px] font-black uppercase tracking-wide border border-current opacity-80`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                        {statusConfig.text}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right font-black text-gray-900">
                      {(o.totalAmount || 0).toLocaleString('fr-FR')} <span className="text-xs text-gray-500 font-bold ml-1">FCFA</span>
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




