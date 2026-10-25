import { API_URL, formatImageUrl } from '../../config';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { validateSenegalPhone, normalizeSenegalPhone } from '../../utils/phoneUtils';
import ConfirmModal from '../../components/ConfirmModal';
import ToastNotification from '../../components/ToastNotification';
import { handleApiResponse } from '../../utils/apiHelper';
import { TbPhone } from 'react-icons/tb';

export default function RestaurantsManager() {
  const [restaurants, setRestaurants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Notifications et Confirmation
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    isDestructive: true,
    isLoading: false,
    onConfirm: null
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [commissionRate, setCommissionRate] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [subscriptionPlan, setSubscriptionPlan] = useState('Basic');
  const [subscriptionEndDate, setSubscriptionEndDate] = useState('');
  const fileInputRef = useRef(null);

  const previewUrl = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    if (image) {
      return formatImageUrl(image);
    }
    return null;
  }, [imageFile, image]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("L'image est trop volumineuse (maximum 5 Mo).", "error");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast("Format non supporté. Veuillez choisir un fichier JPG, PNG ou WEBP.", "error");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setImageFile(file);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setLocation('');
    setOperatorName('');
    setTelephone('');
    setImage('');
    setImageFile(null);
    setCommissionRate(10);
    setSubscriptionPlan('Basic');
    setSubscriptionEndDate('');
    setIsActive(true);
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleEdit = (resto) => {
    setEditingId(resto.id);
    setName(resto.name || '');
    setLocation(resto.location || '');
    setOperatorName(resto.operatorName || '');
    setTelephone(resto.telephone || '');
    setImage(resto.image || '');
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setCommissionRate(resto.commissionRate || 10);
    setSubscriptionPlan(resto.subscriptionPlan || 'Basic');
    setSubscriptionEndDate(resto.subscriptionEndDate || '');

    setIsActive(resto.active !== false);
    setIsModalOpen(true);
  };
  
  const fetchRestaurants = () => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/v1/admin/restaurants`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRestaurants(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    let finalImageUrl = image || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80';

    if (imageFile) {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', imageFile);
      
      try {
        const uploadRes = await fetch(`${API_URL}/api/v1/upload`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token },
          body: formData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalImageUrl = uploadData.url;
        } else {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || "Erreur lors de l'upload de l'image.");
        }
      } catch (err) {
        showToast(err.message, "error");
        setUploadingImage(false);
        return;
      }
    }

    if (telephone && !validateSenegalPhone(telephone)) {
      showToast("Numéro du restaurant invalide. Format attendu : 771234567 ou +221 77 123 45 67.", "error");
      setUploadingImage(false);
      return;
    }

    const payload = { 
      name, 
      location, 
      operatorName, 
      telephone: telephone ? normalizeSenegalPhone(telephone) : null,
      image: finalImageUrl, 
      commissionRate: parseFloat(commissionRate), 
      active: isActive, 
      subscriptionPlan, 
      subscriptionEndDate: subscriptionEndDate || null 
    };

    const url = editingId 
      ? `${API_URL}/api/v1/admin/restaurants/` + editingId
      : `${API_URL}/api/v1/admin/restaurants`;
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token 
      },
      body: JSON.stringify(payload)
    })
      .then(res => handleApiResponse(res, "Erreur lors de l'enregistrement."))
      .then(() => {
        closeModal();
        showToast(editingId ? "Restaurant modifié avec succès !" : "Restaurant créé avec succès !");
        fetchRestaurants();
      })
      .catch(err => {
        showToast(err.message, "error");
        setUploadingImage(false);
      });
  };

  const handleDelete = (id, restoName = "ce restaurant") => {
    setConfirmModal({
      isOpen: true,
      title: "Supprimer ce restaurant ?",
      message: `Êtes-vous sûr de vouloir supprimer "${restoName}" et TOUS ses plats associés ? Cette action est irréversible.`,
      confirmText: "Supprimer définitivement",
      isDestructive: true,
      isLoading: false,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/api/v1/admin/restaurants/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => handleApiResponse(res, "Impossible de supprimer ce restaurant (commandes liées ou droits insuffisants)."))
          .then(() => {
            setConfirmModal({ isOpen: false });
            showToast("Restaurant et plats associés supprimés !");
            fetchRestaurants();
          })
          .catch(err => {
            setConfirmModal({ isOpen: false });
            showToast(err.message, "error");
          });
      }
    });
  };

  const toggleActive = (resto) => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/v1/admin/restaurants/${resto.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ ...resto, active: !resto.active, subscriptionPlan: resto.subscriptionPlan, subscriptionEndDate: resto.subscriptionEndDate })
    })
      .then(() => fetchRestaurants())
      .catch(err => console.error(err));
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 w-full" style={{ background: "#f9fafb" }}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion des Restaurants</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez le parc de restaurants partenaires.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-64 bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              closeModal();
              setIsModalOpen(true);
            }} 
            className="bg-red-600 text-white px-5 py-2 rounded-full font-bold shadow-sm shadow-red-600/20 hover:bg-red-700 hover:shadow-md transition-all flex items-center gap-2"
          >
            + Nouveau Restaurant
          </button>
        </div>
      </header>

      {/* Liste des restaurants (Grid full width) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.filter(r => (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (r.location || "").toLowerCase().includes(searchTerm.toLowerCase()) || (r.operatorName || "").toLowerCase().includes(searchTerm.toLowerCase())).map(resto => (
          <div key={resto.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-0 flex flex-col overflow-hidden">
            <div className="h-32 bg-gray-200 relative">
              <img src={formatImageUrl(resto.image)} alt={resto.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 flex gap-2">
                {resto.subscriptionEndDate ? (
                   new Date(resto.subscriptionEndDate) >= new Date() 
                   ? <span className="text-[10px] font-black tracking-widest uppercase bg-purple-100/90 backdrop-blur-sm text-purple-700 px-3 py-1.5 rounded-full shadow-sm">VIP Actif</span>
                   : <span className="text-[10px] font-black tracking-widest uppercase bg-red-100/90 backdrop-blur-sm text-red-700 px-3 py-1.5 rounded-full shadow-sm">Expiré</span>
                ) : (
                   <span className="text-[10px] font-black tracking-widest uppercase bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full shadow-sm">Standard</span>
                )}
                <button 
                  onClick={() => toggleActive(resto)}
                  className={`px-3 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-full shadow-sm backdrop-blur-sm ${resto.active ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
                >
                  {resto.active ? 'Actif' : 'Inactif'}
                </button>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-black text-gray-900 text-xl group-hover:text-red-600 transition-colors">{resto.name}</h4>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {resto.location}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Gérant : <span className="font-medium text-gray-700">{resto.operatorName || 'Non assigné'}</span>
                </p>
                {resto.telephone && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <TbPhone className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    Tél : <span className="font-medium text-gray-700">{resto.telephone}</span>
                  </p>
                )}
                <p className="text-sm font-bold text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Commission : {resto.commissionRate}%
                </p>
              </div>
              
              <div className="mt-auto flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => handleEdit(resto)}
                  className="text-gray-600 hover:text-gray-900 font-bold text-sm bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors"
                >
                  Modifier
                </button>
                <button 
                  onClick={() => handleDelete(resto.id, resto.name)}
                  className="text-red-600 hover:text-white font-bold text-sm bg-red-50 hover:bg-red-600 px-4 py-2 rounded-xl transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
        {restaurants.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            Aucun restaurant n'est configuré sur la plateforme.
          </div>
        )}
      </div>

      {/* MODAL AJOUT/EDITION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-lg">
                {editingId ? "Modifier le Restaurant" : "Nouveau Restaurant"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="resto-form" onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom du Restaurant</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Adresse / Localisation</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Manager / Contact</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone de Contact (Optionnel, 9 chiffres)</label>
                  <input 
                    type="tel" 
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="Ex: 771234567"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Commission Plateforme (%)</label>
                  <input 
                    type="number" min="0" max="100" step="0.1" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 mt-4 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Abonnement</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                      value={subscriptionPlan}
                      onChange={(e) => setSubscriptionPlan(e.target.value)}
                    >
                      <option value="Basic">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Date d'expiration</label>
                    <input 
                      type="date" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                      value={subscriptionEndDate}
                      onChange={(e) => setSubscriptionEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Photo du restaurant (Optionnel)</label>
                  {previewUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex flex-col">
                      <div className="relative w-full h-40 bg-gray-100">
                        <img 
                          src={previewUrl} 
                          alt="Aperçu du restaurant" 
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                          {imageFile ? "Nouvelle photo sélectionnée" : "Photo actuelle"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white border-t border-gray-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-bold text-gray-700 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Changer la photo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImage('');
                            setImageFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 hover:border-red-400 bg-gray-50 hover:bg-red-50/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all group text-center"
                    >
                      <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-red-600 transition-colors">
                          Cliquez pour sélectionner une photo
                        </span>
                        <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG ou WEBP (max. 5 Mo)</p>
                      </div>
                    </div>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm font-bold text-gray-700">Restaurant Actif (visible)</span>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit"
                form="resto-form"
                disabled={uploadingImage}
                className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
              >
                {uploadingImage ? 'Enregistrement...' : (editingId ? 'Mettre à jour' : 'Créer le restaurant')}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* MODALE DE CONFIRMATION DESIGNÉE */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ isOpen: false })}
      />

      {/* TOAST DE NOTIFICATION DESIGNÉ */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
