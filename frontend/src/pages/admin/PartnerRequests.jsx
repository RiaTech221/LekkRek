import React, { useState, useEffect } from "react";

export default function PartnerRequests() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8080/api/v1/admin/partner-requests", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = (id, newStatus) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/v1/admin/partner-requests/${id}/status?status=${newStatus}`, {
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
    <div className="p-8 h-full flex flex-col">
      <header className="flex flex-col gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demandes de Partenariat</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez les demandes entrantes des restaurants souhaitant rejoindre LekkRek.</p>
        </div>
        <div className="w-full max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Rechercher par restaurant, gérant ou ville..." 
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 shadow-sm" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Restaurant</th>
              <th className="p-4 font-medium">Gérant</th>
              <th className="p-4 font-medium">Téléphone</th>
              <th className="p-4 font-medium">Ville</th>
              <th className="p-4 font-medium">Statut</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">Aucune demande pour le moment.</td></tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString("fr-FR", {day: "2-digit", month: "short", year:"numeric"})}
                  </td>
                  <td className="p-4 font-bold text-gray-900">{req.nomRestaurant}</td>
                  <td className="p-4 text-gray-700">{req.nomContact}</td>
                  <td className="p-4 font-medium text-gray-900">{req.telephone}</td>
                  <td className="p-4 text-gray-500">{req.ville}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      req.status === "CONTACTED" ? "bg-blue-100 text-blue-700" :
                      req.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {req.status === "PENDING" ? "À Contacter" : 
                       req.status === "CONTACTED" ? "Contacté" : 
                       req.status === "REJECTED" ? "Refusé" : "Accepté"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {req.status === "PENDING" && (
                      <button onClick={() => updateStatus(req.id, "CONTACTED")} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded font-bold text-xs transition-colors">
                        Marquer Contacté
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
