import React, { useState, useEffect } from 'react';

export default function MenuManager() {
  const [plats, setPlats] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPlat, setCurrentPlat] = useState(null);

  // Formulaire
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', image: '', moment: 'dejeuner', status: 'DISPO', restaurantId: ''
  });

  const fetchPlats = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/v1/operator/plats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPlats(data))
      .catch(err => console.error(err));
  };

  const fetchRestaurants = () => {
    fetch('http://localhost:8080/api/v1/public/menu')
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
      ? `http://localhost:8080/api/v1/operator/plats/${currentPlat.id}`
      : 'http://localhost:8080/api/v1/operator/plats';
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
    fetch(`http://localhost:8080/api/v1/operator/plats/${plat.id}/status?status=${newStatus}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => fetchPlats())
    .catch(err => alert("Erreur"));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer ce plat ?")) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/v1/operator/plats/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => fetchPlats())
    .catch(err => alert("Erreur de suppression"));
  };

  // VUE 1 : Sélection du restaurant
  if (!selectedRestaurant) {
    return (
      <div className="p-8 w-full" style={{ background: '#f9fafb' }}>
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Restaurants</h2>
          <p className="text-gray-500 text-sm mt-1">Sélectionnez un restaurant pour gérer sa carte.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {restaurants.map(resto => (
            <div 
              key={resto.id} 
              onClick={() => setSelectedRestaurant(resto)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-red-200 transition-all group"
            >
              <div className="flex items-center gap-4">
                <img src={resto.image || "https://placehold.co/100x100?text=Resto"} alt={resto.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors">{resto.name}</h3>
                  <p className="text-sm text-gray-500">{resto.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VUE 2 : Gestion des plats du restaurant sélectionné
  const platsDuResto = plats.filter(p => p.restaurant.id === selectedRestaurant.id);

  return (
    <div className="p-8 w-full" style={{ background: '#f9fafb' }}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <button onClick={() => setSelectedRestaurant(null)} className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1">
            ← Retour aux restaurants
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Menu : {selectedRestaurant.name}</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez les plats pour ce restaurant spécifique.</p>
        </div>
        <button onClick={() => openModal()} className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm hover:bg-red-700 transition">
          <span>+</span> Nouveau plat
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {platsDuResto.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun plat dans ce restaurant pour le moment.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-semibold">Image</th>
                <th className="p-4 font-semibold">Nom du Plat</th>
                <th className="p-4 font-semibold">Prix</th>
                <th className="p-4 font-semibold">Catégorie</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {platsDuResto.map(plat => (
                <tr key={plat.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <img src={plat.image} alt={plat.name} className="w-12 h-12 rounded-lg object-cover" />
                  </td>
                  <td className="p-4 font-bold text-gray-900">{plat.name}</td>
                  <td className="p-4 text-gray-600 font-medium">{plat.price} F</td>
                  <td className="p-4 text-sm text-gray-500 capitalize">{plat.moment}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleStatus(plat)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${plat.status === 'DISPO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {plat.status === 'DISPO' ? 'Disponible' : 'Épuisé'}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openModal(plat)} className="text-blue-600 hover:underline text-sm font-medium">Modifier</button>
                    <button onClick={() => handleDelete(plat.id)} className="text-red-600 hover:underline text-sm font-medium">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Ajout/Modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-6">{currentPlat ? 'Modifier le plat' : 'Nouveau Plat'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 p-2 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-200 p-2 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select value={formData.moment} onChange={e => setFormData({...formData, moment: e.target.value})} className="w-full border border-gray-200 p-2 rounded-lg">
                    <option value="dejeuner">Déjeuner</option>
                    <option value="diner">Dîner</option>
                    <option value="gouter">Goûter</option>
                    <option value="Fast food">Fast food</option>
                    <option value="cocktails_jus">Cocktails & Jus</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut Initial</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-200 p-2 rounded-lg">
                        <option value="DISPO">Disponible</option>
                        <option value="EPUISE">Épuisé</option>
                      </select>
                  </div>
                  {/* On masque le select restaurant car il est géré par la vue en cours */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
                <input required type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border border-gray-200 p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 p-2 rounded-lg h-24 resize-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
