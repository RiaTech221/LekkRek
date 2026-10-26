import React, { useState } from 'react';
import { API_URL } from '../config';
import { TbLock, TbShieldCheck, TbEye, TbEyeOff, TbAlertCircle, TbLogout } from 'react-icons/tb';

/**
 * ============================================================================
 * 📁 Fichier : ForceChangePasswordModal.jsx
 * 📝 Description : Modale bloquante exigeant le renouvellement du mot de passe
 *                 provisoire lors de la première connexion d'un opérateur.
 * 🔒 Rôle : Sécurité applicative - Empêche l'accès au tableau de bord tant que
 *           le mot de passe initial n'a pas été remplacé par un mot de passe personnel.
 * 💡 Auteur : Standard Enterprise Security
 * ============================================================================
 */
export default function ForceChangePasswordModal({ isOpen, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword && newPassword === confirmPassword;
  const isDifferent = newPassword && newPassword !== currentPassword;
  const isFormValid = isMinLength && isMatching && isDifferent && currentPassword.length > 0;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isMinLength) {
      setError("Le nouveau mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    if (!isMatching) {
      setError("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }
    if (!isDifferent) {
      setError("Le nouveau mot de passe doit être différent du mot de passe provisoire.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/api/v1/public/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du changement de mot de passe.");
      }

      // Mise à jour de l'état utilisateur en localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userObj.doitChangerMotDePasse = false;
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch (err) {
          console.error("Erreur mise à jour local storage user:", err);
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* En-tête de sécurité */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur mb-3 ring-4 ring-white/20">
            <TbLock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Première Connexion</h2>
          <p className="text-xs text-red-100 mt-1">Changement de mot de passe obligatoire</p>
        </div>

        {/* Corps de la modale */}
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex items-start gap-2.5">
            <TbAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Votre compte a été créé avec un <strong>mot de passe provisoire</strong>. Par mesure de sécurité, veuillez définir un nouveau mot de passe personnel pour accéder à votre espace de gestion.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <TbAlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mot de passe provisoire reçu *
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Saisissez le mot de passe actuel"
                  className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showCurrent ? <TbEyeOff className="w-4 h-4" /> : <TbEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nouveau mot de passe personnel *
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Au moins 6 caractères"
                  className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showNew ? <TbEyeOff className="w-4 h-4" /> : <TbEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmation nouveau mot de passe */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Confirmer le nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le nouveau mot de passe"
                  className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <TbEyeOff className="w-4 h-4" /> : <TbEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Indicateurs de critères */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-100 text-xs text-gray-600">
              <div className={`flex items-center gap-1.5 ${isMinLength ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isMinLength ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                Au moins 6 caractères
              </div>
              <div className={`flex items-center gap-1.5 ${isMatching && confirmPassword.length > 0 ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isMatching && confirmPassword.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                Mots de passe identiques
              </div>
              <div className={`flex items-center gap-1.5 ${isDifferent && newPassword.length > 0 ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isDifferent && newPassword.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                Différent du mot de passe provisoire
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-xl font-bold text-sm shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Mise à jour en cours...</span>
                  </>
                ) : (
                  <>
                    <TbShieldCheck className="w-5 h-5" />
                    <span>Enregistrer et continuer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center gap-1.5 font-medium"
              >
                <TbLogout className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
