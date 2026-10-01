import React, { useState, useEffect } from 'react';

export default function RestaurantsManager() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [image, setImage] = useState('');

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

  const handleAddRestaurant = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const newResto = { name, location, operatorName, image: image || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80' };

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
        fetchRestaurants();
      })
      .catch(err => alert(err.message));
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
      body: JSON.stringify({ ...resto, active: !resto.active })
    })
      .then(() => fetchRestaurants())
      .catch(err => console.error(err));
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 w-full" style={{ background: '#f9fafb' }}>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Restaurants</h2>
        <p className="text-gray-500 text-sm mt-1">Gérez le parc de restaurants partenaires. Les opérateurs géreront ensuite leurs plats.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Formulaire d'ajout */}
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h4 className="font-bold text-gray-900 mb-6">Ajouter un Restaurant</h4>
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
              <label className="block text-xs font-bold text-gray-500 mb-1">URL de l'image (Optionnel)</label>
              <input 
                type="url" 
                placeholder="https://..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors mt-4">
              Créer le restaurant
            </button>
          </form>
        </div>

        {/* Liste des restaurants */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
            {restaurants.map(resto => (
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
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{resto.name}</h4>
                        <p className="text-sm text-gray-500 mb-1">📍 {resto.location}</p>
                        <p className="text-sm text-gray-500 mb-4">👤 Gérant : {resto.operatorName || 'Non assigné'}</p>
                        
                        <div className="mt-auto flex justify-end">
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
