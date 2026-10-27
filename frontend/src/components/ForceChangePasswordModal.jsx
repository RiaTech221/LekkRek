import React, { useState, useMemo } from 'react';
import { API_URL } from '../config';
import {
  TbShieldLock,
  TbLock,
  TbKey,
  TbEye,
  TbEyeOff,
  TbAlertCircle,
  TbLogout,
  TbCheck,
  TbArrowRight,
  TbSparkles
} from 'react-icons/tb';

/**
 * ============================================================================
 * 📁 Fichier : ForceChangePasswordModal.jsx
 * 📝 Description : Modale d'accueil et de sécurisation obligatoire dès la première
 *                 connexion d'un opérateur avec un mot de passe provisoire.
 * 🎨 Design : Interface épurée et moderne alignée sur l'identité visuelle LekkRek
 *             (cartes arrondies, micro-badges dynamiques, jauge de sécurité).
 * 🔒 Sécurité : Envoi avec cookie HttpOnly ('credentials: include') et Bearer token.
 * 💡 Auteur : Standard Enterprise Security & UI/UX
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

  // Critères de validation en temps réel
  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferent = newPassword.length > 0 && newPassword !== currentPassword;
  const hasCurrent = currentPassword.trim().length > 0;
  const isFormValid = isMinLength && isMatching && isDifferent && hasCurrent;

  // Calcul du score de force du mot de passe (1 à 3)
  const strength = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword) && newPassword.length >= 8) score += 1;
    return Math.max(1, score);
  }, [newPassword]);

  const strengthLabel = useMemo(() => {
    if (!newPassword) return '';
    if (strength === 1) return 'Faible';
    if (strength === 2) return 'Moyen';
    return 'Robuste';
  }, [newPassword, strength]);

  const strengthColor = useMemo(() => {
    if (strength === 1) return 'bg-amber-500';
    if (strength === 2) return 'bg-blue-500';
    return 'bg-emerald-500';
  }, [strength]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    fetch(`${API_URL}/api/v1/public/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {});
    window.location.href = '/login';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!hasCurrent) {
      setError("Veuillez saisir votre mot de passe provisoire.");
      return;
    }
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

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      // Si un token JWT valide existe en localStorage, l'ajouter pour double compatibilité (Bearer + Cookie)
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/v1/public/auth/change-password`, {
        method: 'POST',
        credentials: 'include', // Indispensable pour transmettre le cookie HttpOnly lekkrek_token
        headers,
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du changement de mot de passe.");
      }

      // Si le backend renvoie un nouveau token mis à jour
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Mise à jour de l'état de l'utilisateur dans le localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userObj.doitChangerMotDePasse = false;
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch (err) {
          console.error("Erreur de mise à jour du stockage local:", err);
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Liseré supérieur de marque LekkRek */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* En-tête épuré et rassurant */}
        <div className="pt-7 pb-4 px-6 sm:px-8 text-center bg-gradient-to-b from-gray-50/70 to-white">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100/80 flex items-center justify-center mx-auto mb-3 text-red-600 shadow-sm">
            <TbShieldLock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-[11px] font-bold uppercase tracking-wider mb-2">
            <TbSparkles className="w-3.5 h-3.5" /> Première connexion
          </div>

          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Sécurisez votre compte
          </h2>

          <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Pour accéder à votre espace opérateur, veuillez remplacer le mot de passe provisoire par votre mot de passe personnel.
          </p>
        </div>

        {/* Corps du formulaire */}
        <div className="p-6 sm:p-8 pt-2">
          
          {/* Note d'information sobre et chaleureuse */}
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-3 shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <TbKey className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              Saisissez le mot de passe provisoire qui vous a été transmis, puis choisissez votre mot de passe personnel définitif.
            </p>
          </div>

          {/* Bannière d'erreur si échec */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <TbAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Champ 1 : Mot de passe provisoire */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Mot de passe provisoire reçu <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <TbKey className="w-4 h-4" />
                </span>
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Saisissez le mot de passe provisoire actuel"
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-all shadow-xs"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  tabIndex={-1}
                  aria-label="Afficher ou masquer"
                >
                  {showCurrent ? <TbEyeOff className="w-4 h-4" /> : <TbEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Champ 2 : Nouveau mot de passe personnel */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Nouveau mot de passe personnel <span className="text-red-500">*</span>
                </label>
                {newPassword && (
                  <span className="text-[11px] font-bold text-gray-500">
                    Force : <span className={strength === 3 ? 'text-emerald-600' : strength === 2 ? 'text-blue-600' : 'text-amber-600'}>{strengthLabel}</span>
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <TbLock className="w-4 h-4" />
                </span>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Choisissez au moins 6 caractères"
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-all shadow-xs"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  tabIndex={-1}
                  aria-label="Afficher ou masquer"
                >
                  {showNew ? <TbEyeOff className="w-4 h-4" /> : <TbEye className="w-4 h-4" />}
                </button>
              </div>

              {/* Jauge de sécurité à 3 niveaux */}
              {newPassword.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength >= 1 ? strengthColor : 'bg-transparent'}`} />
                  </div>
                  <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength >= 2 ? strengthColor : 'bg-transparent'}`} />
                  </div>
                  <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength >= 3 ? strengthColor : 'bg-transparent'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Champ 3 : Confirmer le nouveau mot de passe */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <TbLock className="w-4 h-4" />
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le nouveau mot de passe"
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-all shadow-xs"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  tabIndex={-1}
                  aria-label="Afficher ou masquer"
                >
                  {showConfirm ? <TbEyeOff className="w-4 h-4" /> : <TbEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Liste dynamique des exigences de sécurité */}
            <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Critères de validation
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Règle 1 */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                  isMinLength
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60'
                    : 'bg-white/80 text-gray-500 border border-gray-200/60'
                }`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    isMinLength ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <TbCheck className="w-2.5 h-2.5" />
                  </span>
                  <span className="truncate">Au moins 6 car.</span>
                </div>

                {/* Règle 2 */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                  isMatching
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60'
                    : 'bg-white/80 text-gray-500 border border-gray-200/60'
                }`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    isMatching ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <TbCheck className="w-2.5 h-2.5" />
                  </span>
                  <span className="truncate">Identiques</span>
                </div>

                {/* Règle 3 */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                  isDifferent
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60'
                    : 'bg-white/80 text-gray-500 border border-gray-200/60'
                }`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    isDifferent ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <TbCheck className="w-2.5 h-2.5" />
                  </span>
                  <span className="truncate">Pass distinct</span>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer disabled:cursor-not-allowed bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 active:scale-[0.99] disabled:bg-none disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
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
                    <span>Valider et accéder à mon espace</span>
                    <TbArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 font-semibold"
              >
                <TbLogout className="w-3.5 h-3.5" />
                <span>Se déconnecter pour le moment</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
