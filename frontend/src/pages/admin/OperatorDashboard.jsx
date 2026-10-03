import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';
import MenuManager from './MenuManager';
import Accounting from './Accounting';
import OperatorsManager from './OperatorsManager';
import RestaurantsManager from './RestaurantsManager';
import Settings from './Settings';
import ContentManager from './ContentManager';
import Overview from './Overview';
import AuditLogs from './AuditLogs';
import PartnerRequests from './PartnerRequests';
import OrderDetailsModal from './OrderDetailsModal';

/**
 * ============================================================================
 * 📁 Fichier : OperatorDashboard.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour OperatorDashboard.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


export default function OperatorDashboard() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('lekkrek_admin_tab') || 'overview');
  useEffect(() => { localStorage.setItem('lekkrek_admin_tab', activeTab); }, [activeTab]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
  const [commandes, setCommandes] = useState({
    nouvelles: [],
    preparation: [],
    pretes: []
  });

  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { roles: [] };
  const isAdmin = user.roles.includes('ROLE_ADMIN');
  const roleLabel = isAdmin ? 'Administrateur' : 'Opérateur';

  // Supprime la barre de défilement globale du body (causée par index.css)
  useEffect(() => {
    document.body.classList.add('admin-mode');
    return () => {
      document.body.classList.remove('admin-mode');
    };
  }, []);

  const fetchCommandes = () => {
    const token = localStorage.getItem('token');
    fetch('http://192.168.1.6:8080/api/v1/operator/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403 || res.status === 400) {
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error("Session expirée");
        }
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) return;
        
        const formatCmd = (cmd) => ({
          id: (cmd.orderNumber || 'CMD-XXX').replace('CMD-', ''),
          realId: cmd.id,
          plat: (cmd.items || []).map(i => `${i.quantity || 1}x ${i.plat?.name || 'Plat inconnu'}`).join(', ') || 'Commande sans plat', 
          client: cmd.clientName || 'Client inconnu',
          type: cmd.type,
          paymentMethod: cmd.paymentMethod,
          paymentStatus: cmd.paymentStatus,
          clientPhone: cmd.clientPhone || 'Non renseigné',
          clientAddress: cmd.clientAddress,
          totalAmount: cmd.totalAmount,
          fullStatus: cmd.status,
          temps: "A l'instant"
        });

        setCommandes({
          nouvelles: data.filter(c => c.status === 'NOUVELLE').map(formatCmd),
          preparation: data.filter(c => c.status === 'EN_PREPARATION').map(formatCmd),
          pretes: data.filter(c => c.status === 'PRETE' || c.status === 'LIVREE').map(formatCmd)
        });
      })
      .catch(err => console.error("Erreur API:", err));
  };

  useEffect(() => {
    fetchCommandes();
    const interval = setInterval(fetchCommandes, 10000);
    return () => clearInterval(interval);
  }, []);


  const getPaymentBadge = (cmd) => {
    if (cmd.paymentStatus === 'PAYE') {
      return <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 text-[10px] font-black uppercase"><span className="text-[12px]">✅</span> Payé ({cmd.paymentMethod})</span>;
    }
    if (cmd.paymentStatus === 'ATTENTE') {
      return <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100 text-[10px] font-black uppercase"><span className="text-[12px]">⚠️</span> À encaisser ({cmd.paymentMethod})</span>;
    }
    return <span className="flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100 text-[10px] font-black uppercase"><span className="text-[12px]">❌</span> Échoué</span>;
  };

    const updatePaymentStatus = (id, newStatus) => {
    const token = localStorage.getItem('token');
    fetch(`http://192.168.1.6:8080/api/v1/operator/orders/${id}/payment-status?status=${newStatus}`, { 
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(() => fetchCommandes())
      .catch(err => alert("Erreur maj paiement"));
  };

  const updateStatus = (id, newStatus) => {
    const token = localStorage.getItem('token');
    fetch(`http://192.168.1.6:8080/api/v1/operator/orders/${id}/status?status=${newStatus}`, { 
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(() => fetchCommandes())
      .catch(err => alert("Erreur maj statut"));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div id="desktop-dashboard" className="flex bg-gray-50 font-sans" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 50 }}>
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0 transition-all duration-300 relative`}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-9 bg-white border border-gray-200 rounded-full p-1 shadow-sm text-gray-500 hover:text-red-600 z-50 hover:shadow transition-all flex items-center justify-center">
            {isSidebarOpen ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>}
          </button>
        <div className="p-6 shrink-0">
          <div className="flex items-center justify-center h-8 overflow-hidden">
              {isSidebarOpen ? (
                <h1 className="text-2xl font-black tracking-tighter text-red-600 cursor-pointer flex items-start" onClick={() => navigate('/')}>
                  Lekk<span className="text-gray-900">Rek</span>
                  <img src="/logo-square.png" alt="Logo" className="w-3.5 h-3.5 ml-1.5 mt-1.5 rounded-sm shadow-sm object-cover opacity-90" />
                </h1>
              ) : (
                <img src="/logo-square.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm object-cover cursor-pointer" onClick={() => navigate('/')} />
              )}
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-xl flex-shrink-0">🏠</span>
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Vue d'ensemble</span>}
              </button>
            <button onClick={() => setActiveTab('kanban')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'kanban' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-xl flex-shrink-0">📊</span>
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Kanban en direct</span>}
              </button>
            <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'menu' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-xl flex-shrink-0">🍽️</span>
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Menu & Plats</span>}
              </button>
            
            {/* Vues réservées à l'ADMIN */}
            {isAdmin && (
              <>
                {isSidebarOpen && <div className="pt-6 pb-2"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Administration</p></div>}

                <button onClick={() => setActiveTab('restaurants')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'restaurants' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-xl flex-shrink-0">🏪</span>
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Restaurants</span>}
              </button>
                <button onClick={() => setActiveTab('operateurs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'operateurs' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-xl flex-shrink-0">👥</span>
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Équipe & Rôles</span>}
              </button>
                <button onClick={() => setActiveTab('partners')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'partners' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-xl flex-shrink-0">🤝</span>
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Partenariats</span>}
              </button>
                <button onClick={() => setActiveTab('comptabilite')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'comptabilite' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-xl flex-shrink-0">📈</span>
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Comptabilité</span>}
              </button>
                <button onClick={() => setActiveTab('content')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'content' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-xl flex-shrink-0">📝</span>
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Pages & Contenu (CMS)</span>}
              </button>
  
  <button onClick={() => setActiveTab('audit')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'audit' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-xl flex-shrink-0">🕵️‍♂️</span>
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Audit & Sécurité</span>}
              </button>
<button onClick={() => setActiveTab('parametres')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors mt-8 ${activeTab === 'parametres' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-xl flex-shrink-0">⚙️</span>
                {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Paramètres</span>}
              </button>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100 shrink-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm text-gray-900 truncate" title={user.email}>{user.email || 'Utilisateur'}</h4>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors" title="Se déconnecter">
              ⏏️
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${activeTab === 'kanban' ? 'overflow-hidden' : 'overflow-y-auto'}`} style={{ background: '#f9fafb' }}>
        
        {activeTab === 'overview' ? (
          <Overview />
        ) : activeTab === 'kanban' ? (
          <div className="flex-1 p-8 flex flex-col h-full overflow-hidden">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  Commandes en direct
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </h2>
                <p className="text-gray-500 text-sm mt-1">Gérez le flux de vos commandes du jour en temps réel.</p>
              </div>
            </header>

            {/* Kanban Board */}
            <div className="flex-1 flex gap-6 overflow-x-auto pb-4 overflow-y-hidden" style={{ display: 'flex', height: '100%', alignItems: 'stretch' }}>
              
              {/* Colonne 1: Nouvelles */}
              <div className="w-[340px] flex-shrink-0 flex flex-col bg-gray-100/50 rounded-2xl p-4 border border-gray-200/60" style={{ maxHeight: '100%' }}>
                <div className="flex items-center justify-between mb-5 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <h3 className="font-bold text-gray-800 tracking-tight">Nouvelles</h3>
                  </div>
                  <span className="bg-white shadow-sm text-blue-700 px-2.5 py-1 rounded-full text-xs font-black border border-gray-200">{commandes.nouvelles.length}</span>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto px-1 hide-scrollbar">
                  {commandes.nouvelles.map(cmd => (
                    <div key={cmd.id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500 border-t border-r border-b border-gray-100 flex flex-col gap-3 group relative cursor-pointer" onClick={() => setSelectedOrder(cmd)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">#{cmd.id.substring(0,5)}</div>
                          <h4 className="font-black text-gray-900 text-lg leading-none">{cmd.client.split(' ')[0]}</h4>
                        </div>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap">A l'instant</span>
                      </div>
                      
                      <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100/80 text-sm font-semibold text-gray-700 leading-snug">
                         {cmd.plat.split(', ').map((item, idx) => (
                           <div key={idx} className="flex gap-2 items-start py-0.5">
                             <span className="text-blue-500 text-xs mt-0.5">▪</span>
                             <span>{item}</span>
                           </div>
                         ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">

                         {cmd.type === 'LIVRAISON' ? (
                           <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md"><span className="text-sm">🛵</span> Livraison</span>
                         ) : (
                           <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md"><span className="text-sm">🛍️</span> À emporter</span>
                         )}
                      </div>
                      {getPaymentBadge(cmd)}
                   </div>
                      
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(cmd.realId, "EN_PREPARATION"); }} className="mt-2 w-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                        <span>Accepter</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonne 2: En préparation */}
              <div className="w-[340px] flex-shrink-0 flex flex-col bg-gray-100/50 rounded-2xl p-4 border border-gray-200/60" style={{ maxHeight: '100%' }}>
                <div className="flex items-center justify-between mb-5 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                    <h3 className="font-bold text-gray-800 tracking-tight">En préparation</h3>
                  </div>
                  <span className="bg-white shadow-sm text-orange-700 px-2.5 py-1 rounded-full text-xs font-black border border-gray-200">{commandes.preparation.length}</span>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto px-1 hide-scrollbar">
                  {commandes.preparation.map(cmd => (
                    <div key={cmd.id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-500 border-t border-r border-b border-gray-100 flex flex-col gap-3 group relative cursor-pointer" onClick={() => setSelectedOrder(cmd)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">#{cmd.id.substring(0,5)}</div>
                          <h4 className="font-black text-gray-900 text-lg leading-none">{cmd.client.split(' ')[0]}</h4>
                        </div>
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full whitespace-nowrap animate-pulse">En cuisine</span>
                      </div>
                      
                      <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100/80 text-sm font-semibold text-gray-700 leading-snug">
                         {cmd.plat.split(', ').map((item, idx) => (
                           <div key={idx} className="flex gap-2 items-start py-0.5">
                             <span className="text-orange-500 text-xs mt-0.5">▪</span>
                             <span>{item}</span>
                           </div>
                         ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">

                         {cmd.type === 'LIVRAISON' ? (
                           <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md"><span className="text-sm">🛵</span> Livraison</span>
                         ) : (
                           <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md"><span className="text-sm">🛍️</span> À emporter</span>
                         )}
                      </div>
                      {getPaymentBadge(cmd)}
                   </div>
                      
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(cmd.realId, "PRETE"); }} className="mt-2 w-full bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/20 transition-all font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                        <span>Terminer</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonne 3: Prêtes */}
              <div className="w-[340px] flex-shrink-0 flex flex-col bg-gray-100/50 rounded-2xl p-4 border border-gray-200/60" style={{ maxHeight: '100%' }}>
                <div className="flex items-center justify-between mb-5 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <h3 className="font-bold text-gray-800 tracking-tight">Prêtes / En route</h3>
                  </div>
                  <span className="bg-white shadow-sm text-green-700 px-2.5 py-1 rounded-full text-xs font-black border border-gray-200">{commandes.pretes.length}</span>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto px-1 hide-scrollbar">
                   {commandes.pretes.map(cmd => (
                    <div key={cmd.id} className="bg-white p-5 rounded-2xl shadow-sm opacity-80 border-l-4 border-l-green-500 border-t border-r border-b border-gray-100 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOrder(cmd)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">#{cmd.id.substring(0,5)}</div>
                          <h4 className="font-black text-gray-900 text-lg leading-none line-through decoration-green-500/30">{cmd.client.split(' ')[0]}</h4>
                        </div>
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          Prêt
                        </span>
                      </div>
                      
                      <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100/80 text-sm font-semibold text-gray-500 leading-snug">
                         {cmd.plat.split(', ').map((item, idx) => (
                           <div key={idx} className="flex gap-2 items-start py-0.5">
                             <span className="text-green-500/50 text-xs mt-0.5">▪</span>
                             <span>{item}</span>
                           </div>
                         ))}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                         {cmd.type === 'LIVRAISON' ? (
                           <span className="flex items-center gap-1.5"><span className="text-sm grayscale opacity-70">🛵</span> En livraison</span>
                         ) : (
                           <span className="flex items-center gap-1.5"><span className="text-sm grayscale opacity-70">🛍️</span> Remis au client</span>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : activeTab === 'comptabilite' && isAdmin ? (
          <Accounting />
        ) : activeTab === 'operateurs' && isAdmin ? (
          <OperatorsManager />
        ) : activeTab === 'restaurants' && isAdmin ? (
          <RestaurantsManager />
        ) : activeTab === 'partners' && isAdmin ? (
          <PartnerRequests />
        ) : activeTab === 'content' && isAdmin ? (
          <ContentManager />
        ) : activeTab === 'audit' && isAdmin ? (
          <AuditLogs />
        ) : activeTab === 'parametres' && isAdmin ? (
          <Settings />
        ) : (
          <MenuManager />
        )}
      </div>
      <OrderDetailsModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onUpdatePayment={updatePaymentStatus} 
      />
    </div>
  );
}


