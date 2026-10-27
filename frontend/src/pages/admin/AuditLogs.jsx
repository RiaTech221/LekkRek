import { API_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { TbShieldSearch, TbInbox, TbArrowRight } from 'react-icons/tb';

/**
 * ============================================================================
 * 📁 Fichier : AuditLogs.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour AuditLogs.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/v1/admin/audit`)
      .then(res => {
        if (!res.ok) throw new Error("Erreur");
        return res.json();
      })
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
  };

  // Filtrage multi-critères : personne (acteur), activité (action), date, entité ou détails
  const filteredLogs = logs.filter(log => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();

    // 1. Recherche par personne (email de l'acteur, rôle)
    const actorMatch = (log.actorEmail || "").toLowerCase().includes(term) ||
                       (log.role || "").toLowerCase().includes(term);

    // 2. Recherche par activité / action (ex: CHANGE_PASSWORD, CREATE_OPERATOR...)
    const actionMatch = (log.action || "").toLowerCase().includes(term);

    // 3. Recherche par date (date formatée ex: 27/10/2026 ou date brute ISO)
    const formattedDate = formatDate(log.timestamp).toLowerCase();
    const rawDate = (log.timestamp || "").toLowerCase();
    const dateMatch = formattedDate.includes(term) || rawDate.includes(term);

    // 4. Recherche par entité ou détails de modification
    const entityMatch = (log.entityType || "").toLowerCase().includes(term) ||
                        (log.entityId ? String(log.entityId).toLowerCase().includes(term) : false) ||
                        (log.details || "").toLowerCase().includes(term);

    return actorMatch || actionMatch || dateMatch || entityMatch;
  });

  if (loading) {
    return <div className="p-8 w-full text-center text-gray-500">Chargement de l'audit...</div>;
  }

  return (
    <div className="p-8 w-full" style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <header 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          width: '100%',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2" style={{ justifyContent: 'flex-start' }}>
            <TbShieldSearch className="w-6 h-6 text-gray-700" aria-hidden="true" />
            <span>Journal d'Audit & Sécurité</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Traçabilité complète des actions sensibles sur la plateforme.</p>
        </div>

        {/* Barre de recherche (Personne, Activité, Date) positionnée à droite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span className="text-xs text-gray-400 font-medium">
            {filteredLogs.length} événement{filteredLogs.length > 1 ? 's' : ''}
          </span>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une personne, action ou date..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm shadow-xs focus:outline-none focus:border-red-500 font-medium"
              style={{ width: '320px' }}
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 text-xs"
                title="Effacer la recherche"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <TbInbox className="w-16 h-16 mb-4 text-gray-300 stroke-1" aria-hidden="true" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun événement enregistré</h3>
            <p className="text-gray-500 mb-6">Le journal d'audit est actuellement vide.</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <TbShieldSearch className="w-16 h-16 mb-4 text-gray-300 stroke-1" aria-hidden="true" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-500 mb-4">Aucun événement ne correspond à « <span className="font-semibold text-gray-800">{searchTerm}</span> ».</p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Heure</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Acteur</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Entité (ID)</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Modifications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{log.actorEmail}</span>
                        <span className="text-xs text-gray-500 font-mono">{log.role}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                        log.action.includes('UPDATE') ? 'bg-blue-50 text-blue-700' :
                        log.action.includes('DEACTIVATE') || log.action.includes('DELETE') ? 'bg-red-50 text-red-700' :
                        log.action.includes('CREATE') ? 'bg-green-50 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">{log.entityType}</span>
                        <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded font-mono">{log.entityId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        {log.oldValue && (
                          <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100 line-through opacity-70">
                            {log.oldValue}
                          </span>
                        )}
                        {log.oldValue && log.newValue && <TbArrowRight className="w-4 h-4 text-gray-400 inline" aria-hidden="true" />}
                        {log.newValue && (
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100 font-bold">
                            {log.newValue}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
