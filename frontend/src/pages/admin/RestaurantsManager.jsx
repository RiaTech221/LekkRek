import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * 📁 Fichier : RestaurantsManager.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour RestaurantsManager.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


export default function RestaurantsManager() {
  const [restaurants, setRestaurants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [commissionRate, setCommissionRate] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [subscriptionPlan, setSubscriptionPlan] = useState('Basic');
  const [subscriptionEndDate, setSubscriptionEndDate] = useState('');


  
  const handleEdit = (resto) => {
    setEditingId(resto.id);
    setIsModalOpen(true);
    setName(resto.name);
    setLocation(resto.location);
    setOperatorName(resto.operatorName || '');
    
    setCommissionRate(resto.commissionRate || 10);
    setSubscriptionPlan(resto.subscriptionPlan || 'Basic');
    setSubscriptionEndDate(resto.subscriptionEndDate || '');

    setIsActive(resto.active !== false);
  };
  
  const fetchRestaurants = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/v1/admin/restaurants', {
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

    const handleAddRestaurant = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    let finalImageUrl = image || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80';

    if (imageFile) {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', imageFile);
      
      try {
        const uploadRes = await fetch('http://localhost:8080/api/v1/upload', {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalImageUrl = uploadData.url;
        } else {
          throw new Error("Erreur lors de l'upload de l'image");
        }
      } catch (err) {
        alert(err.message);
        setUploadingImage(false);
        return;
      }
    }

    const newResto = { name, location, operatorName, image: finalImageUrl, commissionRate: parseFloat(commissionRate), active: isActive, subscriptionPlan, subscriptionEndDate: subscriptionEndDate || null };

    fetch('http://localhost:8080/api/v1/admin/restaurants', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(newResto)
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la création.");
        return res.json();
      })
      .then(() => {
        setIsModalOpen(false);
        setName('');
        setLocation('');
        setOperatorName('');
        setImage('');
        setImageFile(null);
        setUploadingImage(false);
        fetchRestaurants();
      })
      .catch(err => {
        alert(err.message);
        setUploadingImage(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce restaurant et TOUS ses plats associés ?")) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/v1/admin/restaurants/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => fetchRestaurants())
      .catch(err => alert("Erreur lors de la suppression. Ce restaurant a probablement des commandes liées."));
  };

  const toggleActive = (resto) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/v1/admin/restaurants/${resto.id}`, {
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
    <div className="p-8 h-full bg-gray-50 flex flex-col">
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
              setEditingId(null);
              setName(''); setLocation(''); setOperatorName('');
              setCommissionRate(10); setSubscriptionPlan('Basic'); setSubscriptionEndDate('');
              setIsActive(true); setImageFile(null);
              setIsModalOpen(true);
            }} 
            className="bg-red-600 text-white px-5 py-2 rounded-full font-bold shadow-sm shadow-red-600/20 hover:bg-red-700 hover:shadow-md transition-all flex items-center gap-2"
          >
            + Nouveau Restaurant
          </button>
        </div>
      </header>

      {/* Liste des restaurants (Grid full width) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start flex-1 overflow-y-auto pb-8">
        {restaurants.filter(r => (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (r.location || "").toLowerCase().includes(searchTerm.toLowerCase()) || (r.operatorName || "").toLowerCase().includes(searchTerm.toLowerCase())).map(resto => (
          <div key={resto.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md hover:border-red-200 transition-all">
            <div className="h-40 bg-gray-200 relative">
              <img src={resto.image} alt={resto.name} className="w-full h-full object-cover" />
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
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-black text-gray-900 text-xl group-hover:text-red-600 transition-colors">{resto.name}</h4>
              </div>

              <div className="space-y-1.5 mb-5">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {resto.location}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Gérant : <span className="font-medium text-gray-700">{resto.operatorName || 'Non assigné'}</span>
                </p>
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
                  onClick={() => handleDelete(resto.id)}
                  className="text-red-600 hover:text-white font-bold text-sm bg-red-50 hover:bg-red-600 px-4 py-2 rounded-xl transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
        {restaurants.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
            Aucun restaurant n'est configuré sur la plateforme.
          </div>
        )}
      </div>

      {/* MODAL AJOUT/EDITION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-lg">
                {editingId ? "Modifier le Restaurant" : "Nouveau Restaurant"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Photo du restaurant (Optionnel)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                    onChange={(e) => setImageFile(e.target.files[0])}
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
                onClick={() => setIsModalOpen(false)}
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
    </div>
  );
}
