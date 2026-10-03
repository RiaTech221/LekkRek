import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * 📁 Fichier : Settings.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour Settings.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


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
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    platformName: '',
    supportEmail: '',
    supportPhone: '',
    defaultCurrency: 'FCFA',
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: ''
  });

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Erreur", err));
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSavePreferences = () => {
    localStorage.setItem('lekkrek_notifs', notificationsEnabled);
    localStorage.setItem('lekkrek_refresh', autoRefresh);
    setMessage('Préférences sauvegardées.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Mots de passe différents.");
      return;
    }
    alert("Changement de mot de passe à relier.");
  };

  const handleSaveGlobal = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8080/api/v1/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        setMessage('Paramètres enregistrés avec succès.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-gray-50">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="text-red-600">⚙️</span> Paramètres
          </h2>
        </div>
        {message && (
          <div className="px-4 py-2 bg-green-50 text-green-700 text-sm font-bold rounded-lg border border-green-200 shadow-sm animate-fade-in-down">
            ✅ {message}
          </div>
        )}
      </header>

      <form onSubmit={handleSaveGlobal} className="space-y-6 w-full">
        
        {/* 1. IDENTITE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <span className="bg-red-50 text-red-600 p-1.5 rounded-md">🏢</span> Identité Plateforme
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Nom</label>
              <input type="text" name="platformName" value={settings.platformName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Email Support</label>
              <input type="email" name="supportEmail" value={settings.supportEmail} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Téléphone</label>
              <input type="tel" name="supportPhone" value={settings.supportPhone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Devise</label>
              <select name="defaultCurrency" value={settings.defaultCurrency} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500">
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. RESEAUX SOCIAUX */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <span className="bg-blue-50 text-blue-600 p-1.5 rounded-md">🌍</span> Réseaux Sociaux
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Instagram</label>
              <input type="text" name="instagramUrl" value={settings.instagramUrl} onChange={handleChange} placeholder="@username" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Facebook</label>
              <input type="text" name="facebookUrl" value={settings.facebookUrl} onChange={handleChange} placeholder="fb.com/page" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">TikTok</label>
              <input type="text" name="tiktokUrl" value={settings.tiktokUrl} onChange={handleChange} placeholder="@username" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 transition-all disabled:opacity-50">
            {loading ? '...' : '💾 Enregistrer Identité & Réseaux'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full">
        {/* 3. PREFERENCES */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <span className="bg-amber-50 text-amber-600 p-1.5 rounded-md">🎨</span> Préférences Interface
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={notificationsEnabled} onChange={e => setNotificationsEnabled(e.target.checked)} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
              <span className="text-sm font-medium text-gray-700">Activer les notifications sonores</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
              <span className="text-sm font-medium text-gray-700">Rafraîchissement auto du Kanban</span>
            </label>
            <button onClick={handleSavePreferences} className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-xs font-bold transition-colors">
              Appliquer les préférences
            </button>
          </div>
        </div>

        {/* 4. SÉCURITÉ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <span className="bg-green-50 text-green-600 p-1.5 rounded-md">🔐</span> Sécurité (Admin)
            </h3>
          </div>
          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Nouveau mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" required />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Confirmer</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" required />
              </div>
            </div>
            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white py-2 rounded-lg text-xs font-bold transition-colors">
              Changer le mot de passe
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
