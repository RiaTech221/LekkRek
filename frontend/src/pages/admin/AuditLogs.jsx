import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://192.168.1.6:8080/api/v1/admin/audit', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
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

  if (loading) {
    return <div className="p-8 w-full text-center text-gray-500">Chargement de l'audit...</div>;
  }

  return (
    <div className="p-8 w-full" style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>🕵️‍♂️</span> Journal d'Audit & Sécurité
        </h2>
        <p className="text-gray-500 text-sm mt-1">Traçabilité complète des actions sensibles sur la plateforme.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <span className="text-6xl mb-4">📭</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun événement enregistré</h3>
            <p className="text-gray-500 mb-6">Le journal d'audit est actuellement vide.</p>
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
                {logs.map(log => (
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
                        <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded font-mono">#{log.entityId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        {log.oldValue && (
                          <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100 line-through opacity-70">
                            {log.oldValue}
                          </span>
                        )}
                        {log.oldValue && log.newValue && <span className="text-gray-400">➔</span>}
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
