import React, { useState, useEffect } from 'react';

export default function OperatorsManager() {
  const [operators, setOperators] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleAddOperator = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/v1/admin/operators', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ email: email, motDePasse: password, nomComplet: "Opérateur " + email.split('@')[0] })
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur ou email déjà utilisé.");
        return res.json();
      })
      .then(() => {
        setEmail('');
        setPassword('');
        fetchOperators();
      })
      .catch(err => alert(err.message));
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
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Opérateurs</h2>
        <p className="text-gray-500 text-sm mt-1">Créez et supprimez les comptes pour vos prestataires (agents de saisie).</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Formulaire d'ajout */}
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h4 className="font-bold text-gray-900 mb-6">Ajouter un Opérateur</h4>
          <form onSubmit={handleAddOperator} className="space-y-4">
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
            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors mt-4">
              Créer le compte
            </button>
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
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Rôle</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {operators.map(op => (
                <tr key={op.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900 text-sm">{op.email}</td>
                  <td className="p-4 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        {op.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className="text-green-600 text-xs font-bold">● Actif</span>
                  </td>
                  <td className="p-4 text-right">
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
