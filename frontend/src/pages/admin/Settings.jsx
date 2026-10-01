import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('lekkrek_notifs') === 'true'
  );
  const [autoRefresh, setAutoRefresh] = useState(
    localStorage.getItem('lekkrek_refresh') !== 'false'
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSavePreferences = () => {
    localStorage.setItem('lekkrek_notifs', notificationsEnabled);
    localStorage.setItem('lekkrek_refresh', autoRefresh);
    setMessage('✅ Préférences sauvegardées avec succès.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    // Simulation pour le MVP
    alert("Fonctionnalité de changement de mot de passe à relier à l'API dans la v2.");
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="p-8 w-full" style={{ background: '#f9fafb' }}>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Paramètres de la plateforme</h2>
        <p className="text-gray-500 text-sm mt-1">Gérez vos préférences de tableau de bord et la sécurité de votre compte.</p>
      </header>

      {message && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl font-medium border border-green-100">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PRÉFÉRENCES DU TABLEAU DE BORD */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-xl">🎛️</span> Préférences d'affichage
          </h4>
          
          <div className="space-y-6">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-bold text-gray-900 text-sm">Notifications Sonores</p>
                <p className="text-xs text-gray-500">Jouer un son lors d'une nouvelle commande (Kanban).</p>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={notificationsEnabled} 
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-red-600' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationsEnabled ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-bold text-gray-900 text-sm">Actualisation automatique</p>
                <p className="text-xs text-gray-500">Recharger les commandes et revenus toutes les 10 secondes.</p>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={autoRefresh} 
                  onChange={() => setAutoRefresh(!autoRefresh)} 
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${autoRefresh ? 'bg-red-600' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoRefresh ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>

            <button onClick={handleSavePreferences} className="w-full bg-gray-100 text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors mt-4">
              Sauvegarder les préférences
            </button>
          </div>
        </div>

        {/* SÉCURITÉ DU COMPTE */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-xl">🔐</span> Sécurité du compte
          </h4>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Nouveau mot de passe</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Confirmer le mot de passe</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors mt-4">
              Mettre à jour le mot de passe
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
