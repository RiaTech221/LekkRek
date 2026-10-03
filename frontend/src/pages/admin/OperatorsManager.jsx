import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * 🚀 Fichier : OperatorsManager.jsx
 * 🚀 Description : Gestion des Utilisateurs Internes (Opérateurs & Prestataires)
 * 🚀 Rôle : Composant Frontend (React) - Conforme à la section 10.2 du CDC.
 * ============================================================================
 */

export default function OperatorsManager() {
  const [operators, setOperators] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [restaurantAssigne, setRestaurantAssigne] = useState('');
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetchOperators();
    fetchRestaurants();
  }, []);

  const fetchOperators = () => {
    setLoading(true);
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

  const openModalForNew = () => {
    setEditingId(null);
    setNomComplet('');
    setEmail('');
    setPassword('');
    setIsActive(true);
    setImage('');
    setImageFile(null);
    setRestaurantAssigne('');
    setIsModalOpen(true);
  };

  const handleEdit = (op) => {
    setEditingId(op.id);
    setNomComplet(op.nomComplet || '');
    setEmail(op.email || '');
    setPassword(''); 
    setIsActive(op.actif !== false);
    setImage(op.photoUrl || '');
    setImageFile(null);
    setRestaurantAssigne(op.restaurantAssigne || '');
    setIsModalOpen(true);
  };

  const handleAddOperator = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    let finalImageUrl = image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nomComplet) + '&background=fef2f2&color=ef4444';

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
        if (!res.ok) throw new Error("Erreur lors de l'enregistrement. Email peut-être déjà utilisé.");
        return res.json();
      })
      .then(() => {
        setIsModalOpen(false);
        setUploadingImage(false);
        fetchOperators();
      })
      .catch(err => {
        alert(err.message);
        setUploadingImage(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir désactiver/supprimer cet opérateur ?")) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/v1/admin/operators/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => fetchOperators())
      .catch(err => alert("Erreur lors de la suppression."));
  };

  const filteredOperators = operators.filter(o => 
    (o.nomComplet || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 w-full min-h-screen" style={{ background: '#f8fafc' }}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Utilisateurs Internes</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Gestion des comptes Opérateurs et Prestataires pour la saisie.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-64 bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 shadow-sm transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button 
            onClick={openModalForNew}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold shadow-sm transition-colors"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Nouvel Utilisateur
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">Chargement des utilisateurs...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider font-bold text-gray-500">
                <th className="p-4 pl-6">Utilisateur</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Restaurant Assigné</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOperators.map(op => (
                <tr key={op.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={op.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(op.nomComplet)}&background=fef2f2&color=ef4444`} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{op.nomComplet}</div>
                        <div className="text-xs text-gray-500 font-medium">{op.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
                      {op.role || 'OPÉRATEUR'}
                    </span>
                  </td>
                  <td className="p-4">
                    {op.actif !== false ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-green-50 text-green-700 border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-600">
                    {op.restaurantAssigne || <span className="text-gray-400 italic">Aucun / Global</span>}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(op)} className="p-2 text-gray-400 hover:text-blue-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(op.id)} className="p-2 text-gray-400 hover:text-red-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOperators.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL AJOUT/EDITION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-lg">
                {editingId ? "Modifier l'Utilisateur" : "Nouvel Utilisateur"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="operator-form" onSubmit={handleAddOperator} className="space-y-5">
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                    {imageFile ? (
                      <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : image ? (
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Photo de profil</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom Complet</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={nomComplet}
                    onChange={(e) => setNomComplet(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Adresse Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mot de Passe {editingId && <span className="text-gray-400 font-normal">(Laisser vide pour ne pas modifier)</span>}
                  </label>
                  <input 
                    type="password" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!editingId}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Restaurant Assigné (Optionnel)</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    value={restaurantAssigne}
                    onChange={(e) => setRestaurantAssigne(e.target.value)}
                  >
                    <option value="">-- Administrateur Global --</option>
                    {restaurants.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm font-bold text-gray-700">Compte Actif</span>
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
                form="operator-form"
                disabled={uploadingImage}
                className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
              >
                {uploadingImage ? 'Enregistrement...' : (editingId ? 'Mettre à jour' : 'Créer l\'utilisateur')}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
