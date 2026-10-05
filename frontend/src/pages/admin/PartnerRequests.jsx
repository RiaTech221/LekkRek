import { API_URL } from '../../config';
import React, { useState, useEffect } from "react";

/**
 * ============================================================================
 * ?? Fichier : PartnerRequests.jsx
 * ?? Description : Composant React g�rant l'interface utilisateur pour PartnerRequests.
 * ?? R�le : Vue Frontend (Vite/Tailwind) pour l'exp�rience client/admin LekkRek.
 * ?? Auteur : Document� automatiquement (Standard Enterprise)
 * ============================================================================
 */


export default function PartnerRequests() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/v1/admin/partner-requests`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRequests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setRequests([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = (id, newStatus) => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/v1/admin/partner-requests/${id}/status?status=${newStatus}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(() => {
        fetchRequests();
      })
      .catch(err => console.error(err));
  };

  if (loading) return <div className="p-8">Chargement des demandes...</div>;

  return (
    <div className="p-8 h-full flex flex-col bg-gray-50">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Demandes de Partenariat</h1>
          <p className="text-gray-500 text-sm mt-1">G�rez les demandes entrantes des restaurants souhaitant rejoindre LekkRek.</p>
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-xs font-black uppercase tracking-widest">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Restaurant</th>
              <th className="px-6 py-4">G�rant</th>
              <th className="px-6 py-4">T�l�phone</th>
              <th className="px-6 py-4">Ville</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
                      <tbody>
              {(() => {
                const filtered = requests.filter(req => 
                  (req.nomRestaurant || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (req.nomGerant || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (req.telephone || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (req.ville || "").toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (filtered.length === 0) return <tr><td colSpan="7" className="p-8 text-center text-gray-500">Aucune demande pour le moment.</td></tr>;
                return filtered.map(req => (
                <tr key={req.id} className="hover:bg-gray-50/80 transition-colors group border-b border-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString("fr-FR", {day: "2-digit", month: "short", year:"numeric"})}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{req.nomRestaurant}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{req.nomContact}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{req.telephone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{req.ville}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      req.status === "CONTACTED" ? "bg-blue-100 text-blue-700" :
                      req.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {req.status === "PENDING" ? "� Contacter" : 
                       req.status === "CONTACTED" ? "Contact�" : 
                       req.status === "REJECTED" ? "Refus�" : "Accept�"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {req.status === "PENDING" && (
                      <button onClick={() => updateStatus(req.id, "CONTACTED")} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded font-bold text-xs transition-colors">
                        Marquer Contact�
                      </button>
                    )}
                    {req.status === "CONTACTED" && (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => updateStatus(req.id, "ACCEPTED")} className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded font-bold text-xs transition-colors">
                          Accepter
                        </button>
                        <button onClick={() => updateStatus(req.id, "REJECTED")} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded font-bold text-xs transition-colors">
                          Refuser
                        </button>
                      </div>
                    )}
                  </td>
                </tr>)); })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}



