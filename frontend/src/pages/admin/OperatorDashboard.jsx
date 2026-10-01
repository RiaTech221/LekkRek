import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';
import MenuManager from './MenuManager';
import Accounting from './Accounting';
import OperatorsManager from './OperatorsManager';
import RestaurantsManager from './RestaurantsManager';
import Settings from './Settings';
import Overview from './Overview';
import PartnerRequests from './PartnerRequests';

export default function OperatorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
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

  const fetchCommandes = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/v1/operator/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error("Session expirée");
        }
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) return;
        
        const formatCmd = (cmd) => ({
          id: cmd.orderNumber.replace('CMD-', ''),
          realId: cmd.id,
          plat: cmd.items.map(i => `${i.quantity}x ${i.plat.name}`).join(', '),
          client: cmd.clientName,
          type: cmd.type,
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

  const updateStatus = (id, newStatus) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/v1/operator/orders/${id}/status?status=${newStatus}`, { 
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
    <div id="desktop-dashboard" className="screen flex h-screen bg-gray-50 font-sans" style={{ margin: '-100px -20px 0 -20px', minHeight: '100vh', paddingTop: '0' }}>
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full sticky top-0" style={{ padding: '20px' }}>
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tighter text-red-600 mb-10 cursor-pointer" onClick={() => navigate('/')}>
            Lekk<span className="text-gray-900">Rek</span> <span className="text-xs text-gray-400 font-medium tracking-normal ml-1 border border-gray-200 px-2 py-0.5 rounded-full">PRO</span>
          </h1>
          
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <span className="text-xl">🏠</span> Vue d'ensemble
            </button>
            <button onClick={() => setActiveTab('kanban')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'kanban' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <span className="text-xl">📊</span> Kanban en direct
            </button>
            <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'menu' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <span className="text-xl">🍽️</span> Menu & Plats
            </button>
            
            {/* Vues réservées à l'ADMIN */}
            {isAdmin && (
              <>
                <div className="pt-6 pb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Administration</p>
                </div>
                <button onClick={() => setActiveTab('restaurants')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'restaurants' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <span className="text-xl">🏪</span> Restaurants
                </button>
                <button onClick={() => setActiveTab('operateurs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'operateurs' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <span className="text-xl">👥</span> Opérateurs
                </button>
                <button onClick={() => setActiveTab('partners')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'partners' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <span className="text-xl">🤝</span> Partenariats
                </button>
                <button onClick={() => setActiveTab('comptabilite')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'comptabilite' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <span className="text-xl">📈</span> Comptabilité
                </button>
                <button onClick={() => setActiveTab('parametres')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors mt-8 ${activeTab === 'parametres' ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <span className="text-xl">⚙️</span> Paramètres
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
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
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#f9fafb' }}>
        
        {activeTab === 'overview' ? (
          <Overview />
        ) : activeTab === 'kanban' ? (
          <div className="flex-1 p-8 flex flex-col h-full">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Commandes en direct</h2>
                <p className="text-gray-500 text-sm mt-1">Gérez le flux de vos commandes du jour</p>
              </div>
              <button onClick={() => setActiveTab('menu')} className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm hover:bg-red-700 transition">
                <span>+</span> Nouveau plat du jour
              </button>
            </header>

            {/* Kanban Board */}
            <div className="flex-1 flex gap-6 overflow-x-auto pb-4" style={{ display: 'flex', height: '100%', alignItems: 'flex-start' }}>
              {/* Colonne 1: Nouvelles */}
              <div className="w-80 flex-shrink-0 flex flex-col" style={{ width: '320px' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Nouvelles (Payées)</h3>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{commandes.nouvelles.length}</span>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {commandes.nouvelles.map(cmd => (
                    <div key={cmd.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100" style={{ borderLeft: '4px solid #3b82f6', marginBottom: '15px' }}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-sm">#{cmd.id}</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{cmd.temps}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{cmd.plat}</h4>
                      <p className="text-sm text-gray-500 mb-3">{cmd.client} • {cmd.type}</p>
                      <button onClick={() => updateStatus(cmd.realId, 'EN_PREPARATION')} className="w-full bg-gray-100 hover:bg-red-600 hover:text-white transition-colors text-gray-700 font-medium py-2 rounded-lg text-sm">
                        Accepter & Préparer
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonne 2: En préparation */}
              <div className="w-80 flex-shrink-0 flex flex-col" style={{ width: '320px' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">En préparation</h3>
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">{commandes.preparation.length}</span>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {commandes.preparation.map(cmd => (
                    <div key={cmd.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100" style={{ borderLeft: '4px solid #f97316', marginBottom: '15px' }}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-sm">#{cmd.id}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{cmd.plat}</h4>
                      <p className="text-sm text-gray-500 mb-3">{cmd.client} • {cmd.type}</p>
                      <button onClick={() => updateStatus(cmd.realId, 'PRETE')} className="w-full bg-orange-100 hover:bg-black hover:text-white text-orange-700 transition-colors font-medium py-2 rounded-lg text-sm">
                        Marquer comme Prêt
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonne 3: Prêtes / En route */}
              <div className="w-80 flex-shrink-0 flex flex-col" style={{ width: '320px' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Prêtes / Livreur en route</h3>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">{commandes.pretes.length}</span>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto">
                   {commandes.pretes.map(cmd => (
                    <div key={cmd.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 opacity-70" style={{ borderLeft: '4px solid #10b981', marginBottom: '15px' }}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-sm">#{cmd.id}</span>
                        <span className="text-green-500">✓</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{cmd.plat}</h4>
                      <p className="text-sm text-gray-500 mb-3">{cmd.client}</p>
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
        ) : activeTab === 'parametres' && isAdmin ? (
          <Settings />
        ) : (
          <MenuManager />
        )}
      </div>
    </div>
  );
}
