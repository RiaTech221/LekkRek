import { API_URL } from '../../config';
import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * 📁 Fichier : MenuManager.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour MenuManager.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


export default function MenuManager() {
  const [plats, setPlats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPlat, setCurrentPlat] = useState(null);

  // Formulaire
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', image: '', moment: 'dejeuner', status: 'DISPO', restaurantId: ''
  });

  const fetchPlats = () => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/v1/operator/plats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPlats(data))
      .catch(err => console.error(err));
  };

  const fetchRestaurants = () => {
    fetch(`${API_URL}/api/v1/public/menu`)
      .then(res => res.json())
      .then(data => {
        const uniqueRestos = [];
        const map = new Map();
        for (const item of data) {
            if(!map.has(item.restaurant.id)){
                map.set(item.restaurant.id, true);
                uniqueRestos.push(item.restaurant);
            }
        }
        setRestaurants(uniqueRestos);
      });
  };

  useEffect(() => {
    fetchPlats();
    fetchRestaurants();
  }, []);

  const openModal = (plat = null) => {
    if (plat) {
      setCurrentPlat(plat);
      setFormData({
        name: plat.name,
        description: plat.description,
        price: plat.price,
        image: plat.image,
        moment: plat.moment,
        status: plat.status,
        restaurantId: plat.restaurant.id
      });
    } else {
      setCurrentPlat(null);
      setFormData({ 
        name: '', description: '', price: '', image: '', moment: 'dejeuner', status: 'DISPO', 
        restaurantId: selectedRestaurant ? selectedRestaurant.id : (restaurants.length > 0 ? restaurants[0].id : '') 
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = currentPlat 
      ? `${API_URL}/api/v1/operator/plats/${currentPlat.id}`
      : `${API_URL}/api/v1/operator/plats`;
    const method = currentPlat ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(() => {
      setModalOpen(false);
      fetchPlats();
    })
    .catch(err => alert("Erreur d'enregistrement"));
  };

  const toggleStatus = (plat) => {
    const token = localStorage.getItem('token');
    const newStatus = plat.status === 'DISPO' ? 'EPUISE' : 'DISPO';
    fetch(`${API_URL}/api/v1/operator/plats/${plat.id}/status?status=${newStatus}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => fetchPlats())
    .catch(err => alert("Erreur"));
  };

    const duplicatePlats = () => {
    if (!selectedRestaurant) return;
    if (!window.confirm("Voulez-vous marquer tous les plats de ce restaurant comme disponibles (dupliquer le menu de la veille) ?")) return;
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/v1/operator/restaurants/${selectedRestaurant.id}/plats/duplicate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => fetchPlats())
    .catch(err => alert("Erreur lors de la duplication"));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer ce plat ?")) return;
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/v1/operator/plats/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => fetchPlats())
    .catch(err => alert("Erreur de suppression"));
  };

  // VUE 1 : Sélection du restaurant
  if (!selectedRestaurant) {
    const filteredRestaurants = restaurants.filter(r => 
      (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r.location || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="p-8 w-full flex flex-col h-full bg-gray-50">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion des Restaurants</h1>
            <p className="text-gray-500 text-sm mt-1">Sélectionnez un restaurant pour gérer sa carte de plats.</p>
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
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Restaurant</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Lieu / Ville</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRestaurants.map(resto => (
                <tr key={resto.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                        <img src={resto.image || "https://placehold.co/100x100?text=R"} alt={resto.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{resto.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-600">{resto.location || "Non spécifié"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedRestaurant(resto);
                      }}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
                    >
                      Voir le Menu
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRestaurants.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-12 text-center text-gray-500 font-medium">
                    Aucun restaurant trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // VUE 2 : Gestion des plats du restaurant sélectionné
  const platsDuResto = plats.filter(p => p.restaurant.id === selectedRestaurant.id);

  return (
    <div className="p-8 w-full" style={{ background: '#f9fafb' }}>
      <header className="flex justify-between items-center mb-8">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Menu - {selectedRestaurant.name}</h2>
                <p className="text-gray-500 text-sm mt-1">Gérez les plats de ce restaurant.</p>
              </div>
              <div className="w-full max-w-md">
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Rechercher un plat..." 
                    className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 shadow-sm" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setSelectedRestaurant(null)} className="text-gray-500 font-bold hover:text-gray-700">
                &larr; Retour aux restaurants
              </button>
              <button onClick={() => duplicatePlats()} className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold shadow-sm shadow-red-100 hover:bg-red-100 transition">🪄 Dupliquer la veille</button>
              <button onClick={() => openModal()} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm shadow-red-600/20 hover:bg-red-700 transition">
                + Nouveau Plat
              </button>
            </div>
          </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {platsDuResto.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <span className="text-6xl mb-4">🍽️</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun plat au menu</h3>
            <p className="text-gray-500 mb-6">Ce restaurant n'a pas encore de plats enregistrés.</p>
            <button onClick={() => openModal()} className="bg-red-50 text-red-600 font-bold px-6 py-2 rounded-full hover:bg-red-100 transition-colors">
              + Ajouter un premier plat
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">Image</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Plat & Description</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Prix</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Catégorie</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Disponibilité</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {platsDuResto.map(plat => (
                  <tr key={plat.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm border border-gray-100 shrink-0 relative">
                        <img src={plat.image} alt={plat.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=Plat'; }} />
                        {plat.status !== 'DISPO' && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]"></div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`font-black text-base mb-0.5 ${plat.status === 'DISPO' ? 'text-gray-900' : 'text-gray-500'}`}>{plat.name}</div>
                      <div className="text-xs font-medium text-gray-500 line-clamp-1 max-w-xs" title={plat.description}>{plat.description || 'Aucune description fournie.'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-gray-900 text-base whitespace-nowrap">
                        {Number(plat.price).toLocaleString('fr-FR')} <span className="text-xs text-gray-500 font-bold ml-0.5">FCFA</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-bold capitalize whitespace-nowrap border border-gray-200">
                        {plat.moment === 'fast food' ? '🍔 Fast food' : 
                         plat.moment === 'boisson' ? '🍹 Boisson' : 
                         plat.moment === 'dessert' ? '🍰 Dessert' : 
                         plat.moment}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => toggleStatus(plat)}
                        title="Cliquer pour changer le statut"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all border ${plat.status === 'DISPO' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${plat.status === 'DISPO' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {plat.status === 'DISPO' ? 'En ligne' : 'Épuisé'}
                      </button>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(plat)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(plat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Ajout/Modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[95vh] flex flex-col">
            <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">{currentPlat ? 'Modifier le plat' : 'Nouveau Plat'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto pr-2" style={{ maxHeight: "calc(95vh - 200px)" }}>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du plat</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm text-gray-800" placeholder="Ex: Thiéboudienne Penda Mbaye" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Variantes / Synonymes</label>
                  <input type="text" placeholder="Ex: tiep, thieb, tiep bou dien (séparés par des virgules)" value={formData.variantes || ''} onChange={e => setFormData({...formData, variantes: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm text-gray-800" />
                  <p className="text-xs text-gray-400 mt-1">Aide la recherche client à trouver ce plat avec d'autres mots.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Prix (FCFA)</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value.replace(/\D/g, '')})}
                      onKeyDown={e => {
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full border border-gray-200 p-3 pr-12 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm text-gray-800 font-medium"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">FCFA</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
                  <select value={formData.moment} onChange={e => setFormData({...formData, moment: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm text-gray-800 cursor-pointer">
                    <option value="dejeuner">🍽️ Déjeuner</option>
                    <option value="diner">🌙 Dîner</option>
                    <option value="gouter">🍪 Goûter</option>
                    <option value="fast food">🍔 Fast food</option>
                    <option value="boisson">🍹 Cocktails & Jus</option>
                    <option value="dessert">🍰 Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Statut Initial</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm text-gray-800 cursor-pointer">
                    <option value="DISPO">🟢 Disponible</option>
                    <option value="EPUISE">🔴 Épuisé</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Photo</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-3 hover:bg-gray-50 transition-colors group cursor-pointer text-center">
                    <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const formDataUpload = new FormData();
                        formDataUpload.append('file', file);
                        fetch(`${API_URL}/api/v1/upload`, {
                          method: 'POST',
                          body: formDataUpload
                        }).then(res => res.text()).then(url => setFormData({...formData, image: url}));
                      }} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <div className="flex items-center justify-center gap-2 text-gray-500 group-hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      <span className="text-sm font-medium">Choisir une image</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">URL de l'image</label>
                  <input required type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-500 focus:outline-none focus:ring-0 text-sm" readOnly />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description appétissante</label>
                  <textarea rows="3" placeholder="Décrivez les saveurs de ce plat..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm text-gray-800 resize-none"></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 shrink-0">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Annuler</button>
                <button type="submit" className="px-6 py-2.5 bg-red-600 text-white font-bold hover:bg-red-700 rounded-xl shadow-md shadow-red-200 transition-colors">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
