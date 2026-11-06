import { API_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { validateSenegalPhone, normalizeSenegalPhone } from '../../utils/phoneUtils';
import ToastNotification from '../../components/ToastNotification';
import { handleApiResponse } from '../../utils/apiHelper';
import { TbSettings, TbBuilding, TbWorld, TbHome2, TbBrandWhatsapp, TbDeviceFloppy, TbLock } from 'react-icons/tb';


export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('lekkrek_notifs') === 'true'
  );
  const [autoRefresh, setAutoRefresh] = useState(
    localStorage.getItem('lekkrek_refresh') !== 'false'
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [settings, setSettings] = useState({
    platformName: '',
    supportEmail: '',
    supportPhone: '',
    defaultCurrency: 'FCFA',
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    whatsappMessageGreeting: "Bonjour l'équipe LekkRek, ",
    whatsappMessageCart: "J'ai actuellement {count} plat(s) dans mon panier pour un total de {total} FCFA et j'aimerais avoir de l'aide pour finaliser ma commande.",
    whatsappMessageOrder: "Je vous contacte concernant ma commande N° {orderNumber}.",
    whatsappMessageDefault: "j'aimerais avoir de plus amples informations s'il vous plaît.",
    heroTitle: "Les menus du jour à Ziguinchor.",
    heroSubtitle: "Qui cuisine quoi aujourd'hui, à quel prix et où le trouver. Menus publiés du lundi au samedi dès 10H30."
  });

  useEffect(() => {
    fetch(`${API_URL}/api/v1/settings`)
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
      showToast("Les mots de passe ne correspondent pas.", "error");
      return;
    }
    showToast("Fonctionnalité de changement de mot de passe à relier au backend.", "error");
  };

  const handleSaveGlobal = async (e) => {
    e.preventDefault();
    if (settings.supportPhone && !validateSenegalPhone(settings.supportPhone)) {
      showToast("Numéro de support invalide. Format attendu : 771234567 ou +221 77 123 45 67.", "error");
      return;
    }
    const cleanSettings = {
      ...settings,
      supportPhone: settings.supportPhone ? normalizeSenegalPhone(settings.supportPhone) : ''
    };
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanSettings)
      });
      if (response.ok) {
        showToast('Paramètres enregistrés avec succès.');
      } else {
        const errText = await response.text();
        showToast(errText || 'Erreur lors de la sauvegarde des paramètres.', 'error');
      }
    } catch (error) {
      showToast('Erreur réseau. Vérifiez votre connexion.', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-gray-50">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <TbSettings className="w-6 h-6 text-red-600" aria-hidden="true" /> Paramètres
          </h2>
        </div>
      </header>

      <form onSubmit={handleSaveGlobal} className="space-y-6 w-full">
        
        {/* 1. IDENTITE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <span className="bg-red-50 text-red-600 p-1.5 rounded-md"><TbBuilding className="w-4 h-4" aria-hidden="true" /></span> Identité Plateforme
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
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Téléphone (9 chiffres)</label>
              <input
                type="tel"
                name="supportPhone"
                inputMode="numeric"
                maxLength={9}
                placeholder="Ex: 771234567"
                value={settings.supportPhone || ''}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                  }
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
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
              <span className="bg-blue-50 text-blue-600 p-1.5 rounded-md"><TbWorld className="w-4 h-4" aria-hidden="true" /></span> Réseaux Sociaux
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
        
        
        {/* CONTENU PAGE D'ACCUEIL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full mt-6">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <span className="bg-blue-50 text-blue-600 p-1.5 rounded-md"><TbHome2 className="w-4 h-4" aria-hidden="true" /></span> Textes d'Accueil
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Titre principal</label>
              <input type="text" name="heroTitle" value={settings.heroTitle || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Sous-titre (Description)</label>
              <textarea name="heroSubtitle" value={settings.heroSubtitle || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" rows="3" />
            </div>
          </div>
        </div>

        {/* TEXTES WHATSAPP */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full mt-6">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <span className="bg-green-50 text-green-600 p-1.5 rounded-md"><TbBrandWhatsapp className="w-4 h-4" aria-hidden="true" /></span> Textes WhatsApp (Modèles)
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Salutation</label>
              <input type="text" name="whatsappMessageGreeting" value={settings.whatsappMessageGreeting || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Par défaut</label>
              <input type="text" name="whatsappMessageDefault" value={settings.whatsappMessageDefault || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Panier en cours (utiliser {`{count}`} et {`{total}`})</label>
              <textarea name="whatsappMessageCart" value={settings.whatsappMessageCart || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" rows="2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Suivi Commande (utiliser {`{orderNumber}`})</label>
              <textarea name="whatsappMessageOrder" value={settings.whatsappMessageOrder || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" rows="2" />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 transition-all disabled:opacity-50">
            {loading ? '...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full">
        {/* 3. PREFERENCES */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <span className="bg-amber-50 text-amber-600 p-1.5 rounded-md"><TbDeviceFloppy className="w-4 h-4" aria-hidden="true" /></span> Préférences Interface
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
              <span className="bg-green-50 text-green-600 p-1.5 rounded-md"><TbLock className="w-4 h-4" aria-hidden="true" /></span> Sécurité (Admin)
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
