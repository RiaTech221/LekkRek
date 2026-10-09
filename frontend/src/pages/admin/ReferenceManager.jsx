import { API_URL } from '../../config';
import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * 🚀 Fichier : ReferenceManager.jsx
 * 🚀 Description : Gestion des Quartiers, Créneaux et Catégories (SOL-192/193)
 * 🚀 Rôle : Composant Frontend Admin (React)
 * ============================================================================
 */

const TYPES = [
  { key: 'QUARTIER', label: 'Quartiers', emoji: '📍' },
  { key: 'CRENEAU',  label: 'Créneaux horaires', emoji: '🕐' },
  { key: 'CATEGORIE', label: 'Catégories', emoji: '🏷️' },
];

export default function ReferenceManager() {
  const [activeType, setActiveType] = useState('QUARTIER');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [valeur, setValeur] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const token = () => localStorage.getItem('token');
  const headers = () => ({ 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' });

  const fetchItems = (type) => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/admin/reference/${type}`, {
      headers: { 'Authorization': `Bearer ${token()}` }
    })
      .then(res => res.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchItems(activeType); }, [activeType]);

  const openNew = () => {
    setEditingItem(null);
    setValeur('');
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setValeur(item.valeur);
    setDescription(item.description || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { type: activeType, valeur: valeur.trim(), description: description.trim(), actif: true };
    const url = editingItem
      ? `${API_URL}/api/v1/admin/reference/${editingItem.id}`
      : `${API_URL}/api/v1/admin/reference`;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(payload) });
      if (!res.ok) {
        const msg = await res.text();
        setError(msg || 'Erreur lors de l\'enregistrement.');
        setSaving(false);
        return;
      }
      setIsModalOpen(false);
      fetchItems(activeType);
    } catch {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    await fetch(`${API_URL}/api/v1/admin/reference/${item.id}/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token()}` }
    });
    fetchItems(activeType);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Supprimer "${item.valeur}" ?`)) return;
    await fetch(`${API_URL}/api/v1/admin/reference/${item.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token()}` }
    });
    fetchItems(activeType);
  };

  const activeLabel = TYPES.find(t => t.key === activeType);

  return (
    <div className="p-8 w-full min-h-screen" style={{ background: '#f8fafc' }}>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Données de Référence</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Gérez les quartiers, créneaux et catégories de la plateforme.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold shadow-sm transition-colors"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6">
        {TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveType(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
              activeType === t.key
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider font-bold text-gray-500">
                <th className="p-4 pl-6">Valeur</th>
                <th className="p-4">Description</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                  <td className="p-4 pl-6 font-bold text-gray-900">{item.valeur}</td>
                  <td className="p-4 text-sm text-gray-500">{item.description || <span className="italic text-gray-300">—</span>}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggle(item)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border transition-colors cursor-pointer ${
                        item.actif
                          ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.actif ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {item.actif ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(item)}
                        title="Modifier"
                        className="p-2 text-gray-400 hover:text-blue-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        title="Supprimer"
                        className="p-2 text-gray-400 hover:text-red-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-400">
                    Aucun(e) {activeLabel?.label.toLowerCase()} configuré(e).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL AJOUT / EDITION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-lg">
                {editingItem ? 'Modifier' : 'Ajouter'} — {activeLabel?.emoji} {activeLabel?.label}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Valeur *</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  value={valeur}
                  onChange={e => setValeur(e.target.value)}
                  placeholder={activeType === 'QUARTIER' ? 'ex: Boucotte' : activeType === 'CRENEAU' ? 'ex: dejeuner' : 'ex: Plats locaux'}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description (optionnel)</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Description courte..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : (editingItem ? 'Mettre à jour' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
