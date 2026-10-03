import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * 📁 Fichier : OperatorsManager.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour OperatorsManager.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


export default function OperatorsManager() {
  const [operators, setOperators] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [nomComplet, setNomComplet] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantAssigne, setRestaurantAssigne] = useState('');

  const fetchRestaurants = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/v1/admin/restaurants', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRestaurants(data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);


  
  const handleEdit = (op) => {
    setEditingId(op.id);
    setNomComplet(op.nomComplet || '');
    setEmail(op.email || '');
    setPassword(''); // optional to edit
    setIsActive(op.actif !== false);
    setImage(op.photoUrl || '');
    setImagePreview(op.photoUrl || '');
    setRestaurantAssigne(op.restaurantAssigne || '');
  };
  
  const fetchOperators = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/v1/admin/operators', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOperators(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const handleAddOperator = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    let finalImageUrl = image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80'; // default avatar

    if (imageFile) {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', imageFile);
      
      try {
        const uploadRes = await fetch('http://localhost:8080/api/v1/upload', {
          method: 'POST',
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

    const payload = { 
      nomComplet, 
      email, 
      motDePasse: password, 
      actif: isActive,
      photoUrl: finalImageUrl,
      restaurantAssigne: restaurantAssigne
    };

    const url = editingId ? `http://localhost:8080/api/v1/admin/operators/${editingId}` : 'http://localhost:8080/api/v1/admin/operators';
    
    fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur ou email déjà utilisé.");
        return res.json();
      })
      .then(() => {
        setEmail('');
        setPassword(''); 
        setEditingId(null); 
        setNomComplet(''); 
        setIsActive(true);
        setImage('');
        setImageFile(null);
        setRestaurantAssigne('');
        setUploadingImage(false);
        fetchOperators();
      })
      .catch(err => {
        alert(err.message);
        setUploadingImage(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet opérateur ?")) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/v1/admin/operators/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => fetchOperators())
      .catch(err => alert("Erreur lors de la suppression."));
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 w-full" style={{ background: '#f9fafb' }}>
      <header className="mb-8 flex flex-col gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Opérateurs</h2>
          <p className="text-gray-500 text-sm mt-1">Créez et supprimez les comptes pour vos prestataires (agents de saisie).</p>
        </div>
        <div className="w-full max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Rechercher un opérateur..." 
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
          <h4 className="font-bold text-gray-900 mb-6">{editingId ? "Modifier l'Opérateur" : "Ajouter un Opérateur"}</h4>
          <form onSubmit={handleAddOperator} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Nom Complet</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                value={nomComplet}
                onChange={(e) => setNomComplet(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Adresse Email</label>
              <input 
                type="email" 
                placeholder="agent@lekkrek.com" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Mot de passe temporaire</label>
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
              <label className="block text-xs font-bold text-gray-500 mb-1">Restaurant assigné</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                value={restaurantAssigne}
                onChange={(e) => setRestaurantAssigne(e.target.value)}
              >
                <option value="">-- Aucun restaurant (Global) --</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Photo de l'opérateur</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-gray-400">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:border-red-400 hover:bg-red-50 transition-all">
                      <p className="text-xs font-bold text-gray-500">Cliquez pour choisir</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG — Max 5 Mo</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input 
                  type="checkbox" 
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="text-sm font-bold text-gray-700">Opérateur Actif</span>
              </label>
            </div>
            <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors mt-4">{uploadingImage ? "Upload en cours..." : (editingId ? "Mettre à jour" : "Créer le compte")}</button>
            {editingId && (
              <button 
                type="button"
                onClick={() => {
                  setEditingId(null); setEmail(''); setPassword(''); setNomComplet(''); setIsActive(true);
                }}
                className="w-full mt-2 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            )}
          </form>
        </div>

        {/* Liste des opérateurs */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h4 className="font-bold text-gray-900">Liste des Opérateurs Actifs ({operators.length})</h4>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">Opérateur</th>
                <th className="p-4 font-semibold">Rôle</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {operators.filter(op => (op.nomComplet || "").toLowerCase().includes(searchTerm.toLowerCase()) || (op.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || (op.restaurantAssigne || "").toLowerCase().includes(searchTerm.toLowerCase())).map(op => (
                <tr key={op.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={op.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80'} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="avatar" />
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{op.nomComplet || "Agent LekkRek"}</div>
                        <div className="text-xs text-gray-500">{op.email}</div>
                        {op.restaurantAssigne && <div className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-0.5 inline-block">🍽️ {op.restaurantAssigne}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        {op.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className="text-green-600 text-xs font-bold">● Actif</span>
                  </td>
                  <td className="p-4 text-right">

                      <button type="button" onClick={() => handleEdit(op)} className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded text-xs hover:bg-blue-100 transition-colors mr-2">Modifier</button>
                      <button 
                        onClick={() => handleDelete(op.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {operators.length === 0 && (
                <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">Aucun opérateur n'a encore été créé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
