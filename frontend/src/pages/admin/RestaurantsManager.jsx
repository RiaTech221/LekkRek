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
    <div className="p-8 w-full" style={{ background: '#f9fafb' }}>
      <header className="mb-8 flex flex-col gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Restaurants</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez le parc de restaurants partenaires.</p>
        </div>
        <div className="w-full max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Rechercher un restaurant..." 
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 shadow-sm" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Formulaire d'ajout */}
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h4 className="font-bold text-gray-900 mb-6">{editingId ? "Modifier le Restaurant" : "Ajouter un Restaurant"}</h4>
          <form onSubmit={handleAddRestaurant} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Nom du Restaurant</label>
              <input 
                type="text" 
                placeholder="Ex: Le Kassa" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Adresse / Localisation</label>
              <input 
                type="text" 
                placeholder="Ex: Escale, Ziguinchor" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Manager / Contact</label>
              <input 
                type="text" 
                placeholder="Ex: Diallo" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
              />
            </div>
                                    <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Commission Plateforme (%)</label>
              <input 
                type="number" min="0" max="100" step="0.1" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 mt-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Abonnement</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  value={subscriptionPlan}
                  onChange={(e) => setSubscriptionPlan(e.target.value)}
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Date d'expiration</label>
                <input 
                  type="date" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  value={subscriptionEndDate}
                  onChange={(e) => setSubscriptionEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Photo du restaurant (Optionnel)</label>
              <input 
                type="file" 
                accept="image/*"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input 
                  type="checkbox" 
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="text-sm font-bold text-gray-700">Restaurant Actif (visible)</span>
              </label>
            </div>
            <button disabled={uploadingImage} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors mt-4 disabled:opacity-50">
              {uploadingImage ? "Upload en cours..." : (editingId ? "Mettre à jour" : "Créer le restaurant")}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={() => {
                  setEditingId(null); setName(''); setLocation(''); setOperatorName(''); 
        
        setCommissionRate(10);
        setSubscriptionPlan('Basic');
        setSubscriptionEndDate('');

        setSubscriptionPlan('Basic');
        setSubscriptionEndDate('');
 setIsActive(true);
                }}
                className="w-full mt-2 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            )}
          </form>
        </div>

        {/* Liste des restaurants */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurants.filter(r => (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (r.location || "").toLowerCase().includes(searchTerm.toLowerCase()) || (r.operatorName || "").toLowerCase().includes(searchTerm.toLowerCase())).map(resto => (
                <div key={resto.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="h-32 bg-gray-200 relative">
                        <img src={resto.image} alt={resto.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2">
                            <button 
                                onClick={() => toggleActive(resto)}
                                className={`px-2 py-1 text-xs font-bold rounded shadow-sm ${resto.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                            >
                                {resto.active ? 'Actif' : 'Désactivé'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900 text-lg">{resto.name}</h4>
                          {resto.subscriptionEndDate ? (
                             new Date(resto.subscriptionEndDate) >= new Date() 
                             ? <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200">{resto.subscriptionPlan} (Actif)</span>
                             : <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-1 rounded border border-red-200">Abonnement Expiré</span>
                          ) : (
                             <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">Sans abonnement</span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 mb-1">📍 {resto.location}</p>
                        <p className="text-sm text-gray-500 mb-4">👤 Gérant : {resto.operatorName || 'Non assigné'}</p>
                        <p className="text-sm text-gray-500 mb-4 font-bold text-red-600">💰 Commission : {resto.commissionRate}%</p>
                        
                        <div className="mt-auto flex justify-end gap-2">
                            <button 
                                type="button"
                                onClick={() => handleEdit(resto)}
                                className="text-blue-500 hover:text-blue-700 font-bold text-sm bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                            >
                                Modifier
                            </button>
                            <button 
                                onClick={() => handleDelete(resto.id)}
                                className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            {restaurants.length === 0 && (
                <div className="col-span-2 p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    Aucun restaurant n'est configuré sur la plateforme.
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
