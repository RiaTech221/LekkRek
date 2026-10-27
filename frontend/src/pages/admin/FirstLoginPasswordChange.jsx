import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import {
  TbShieldLock,
  TbLock,
  TbKey,
  TbEye,
  TbEyeOff,
  TbAlertCircle,
  TbCheck,
  TbArrowRight,
  TbLogout,
  TbSparkles
} from 'react-icons/tb';

/**
 * ============================================================================
 * 📁 Fichier : FirstLoginPasswordChange.jsx
 * 📝 Description : Page dédiée et exclusive pour le premier changement obligatoire
 *                 de mot de passe lors de la première connexion d'un opérateur.
 * 🎨 Design : Adopte rigoureusement la charte graphique LekkRek (split-screen,
 *             fusée/nuage 3D, séparateur sinusoïdal, pilules et dégradés).
 * 🔒 Sécurité : Exigence stricte d'un mot de passe fort (8+ car., majuscule,
 *               minuscule, chiffre, caractère spécial) et support double auth (Cookie + Bearer).
 * 💡 Auteur : Standard Enterprise Security & Design System
 * ============================================================================
 */
export default function FirstLoginPasswordChange() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Critères stricts de mot de passe fort
  const isMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferent = newPassword.length > 0 && newPassword !== currentPassword;
  const hasCurrent = currentPassword.trim().length > 0;

  // Formulaire valide uniquement si tous les critères de sécurité sont réunis
  const isFormValid =
    isMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasDigit &&
    hasSpecial &&
    isMatching &&
    isDifferent &&
    hasCurrent;

  // Score de robustesse (0 à 4)
  const strengthScore = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (hasUppercase && hasLowercase) score += 1;
    if (hasDigit) score += 1;
    if (hasSpecial) score += 1;
    return score;
  }, [newPassword, hasUppercase, hasLowercase, hasDigit, hasSpecial]);

  const strengthLabel = useMemo(() => {
    if (strengthScore <= 1) return { label: 'Faible', color: 'text-amber-600', bar: 'bg-amber-500' };
    if (strengthScore === 2) return { label: 'Moyen', color: 'text-blue-600', bar: 'bg-blue-500' };
    if (strengthScore === 3) return { label: 'Robuste', color: 'text-indigo-600', bar: 'bg-indigo-500' };
    return { label: 'Très sécurisé', color: 'text-emerald-600', bar: 'bg-emerald-500' };
  }, [strengthScore]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    fetch(`${API_URL}/api/v1/public/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {});
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError("Veuillez respecter l'ensemble des critères de sécurité pour votre mot de passe.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/v1/public/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
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

      // 1. Mémorisation du nouveau token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // 2. Mise à jour de l'objet utilisateur en local
      const userStr = localStorage.getItem('user');
      let isAdmin = false;
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userObj.doitChangerMotDePasse = false;
          localStorage.setItem('user', JSON.stringify(userObj));
          isAdmin = Array.isArray(userObj.roles) && userObj.roles.includes('ROLE_ADMIN');
        } catch (err) {
          console.error("Erreur mise à jour local storage user:", err);
        }
      }

      // 3. Redirection directe et propre vers le dashboard
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || "Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .first-login-wrapper {
            display: flex;
            width: 100vw;
            min-height: 100vh;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 99999;
            background-color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
            overflow-x: hidden;
          }
          
          .first-login-left {
            display: none; 
            flex: 1;
            background: linear-gradient(135deg, #0f172a, #1e293b);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 3rem;
            color: white;
            position: relative;
          }
          
          .first-login-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2.5rem 1.5rem;
            background: #ffffff;
            position: relative;
            z-index: 1;
            overflow-y: auto;
          }

          @media (min-width: 1024px) {
            .first-login-left {
              display: flex;
            }
          }

          .rocket-container {
            position: absolute;
            right: -130px; 
            top: 50%;
            transform: translateY(-50%);
            z-index: 100;
            pointer-events: none;
            width: 300px;
            height: 380px;
          }

          .rocket-image {
            position: absolute;
            top: 20px;
            right: 0px;
            width: 230px;
            height: auto;
            transform: rotate(-35deg);
            filter: drop-shadow(10px 25px 25px rgba(0,0,0,0.4));
            z-index: 3;
          }

          .rocket-foam-top {
            position: absolute;
            bottom: 90px;
            left: 50px;
            width: 110px;
            height: auto;
            z-index: 2;
            filter: drop-shadow(0 10px 15px rgba(0,0,0,0.15));
          }
          
          .rocket-foam-bottom {
            position: absolute;
            bottom: 10px;
            left: 10px;
            width: 170px;
            height: auto;
            z-index: 1;
            filter: drop-shadow(0 15px 25px rgba(0,0,0,0.2));
          }

          .custom-input-group {
            display: flex;
            align-items: center;
            background: #f1f5f9;
            border: 2px solid transparent;
            border-radius: 1rem;
            padding: 0.25rem 1.25rem;
            transition: all 0.3s ease;
          }
          .custom-input-group:focus-within {
            background: #ffffff;
            border-color: #d33a30;
            box-shadow: 0 0 0 4px rgba(211, 58, 48, 0.1);
          }
          .custom-input-group input {
            flex: 1;
            padding: 0.85rem 0.5rem;
            border: none;
            outline: none;
            background: transparent;
            font-size: 0.925rem;
            color: #0f172a;
          }
        `}
      </style>

      <div className="first-login-wrapper">
        
        {/* === SECTION GAUCHE : IDENTITÉ VISUELLE LEKKREK === */}
        <div className="first-login-left">
          
          {/* Séparateur sinusoïdal */}
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            style={{ position: 'absolute', right: '-1px', top: 0, height: '100%', width: '12vw', zIndex: 1 }}
          >
            <path fill="#ffffff" d="M100,0 L100,100 L50,100 C -20,75 120,25 50,0 Z" />
          </svg>

          {/* Décoration fusée 3D LekkRek */}
          <div className="rocket-container">
            <img 
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png" 
              alt="Rocket" 
              className="rocket-image"
            />
            <img 
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud/3D/cloud_3d.png" 
              alt="Smoke foam top" 
              className="rocket-foam-top"
            />
            <img 
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud/3D/cloud_3d.png" 
              alt="Smoke foam base" 
              className="rocket-foam-bottom"
            />
          </div>

          <div style={{ maxWidth: '420px', width: '100%', position: 'relative', zIndex: 10, paddingRight: '8vw' }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-semibold mb-6">
              <TbShieldLock className="w-4 h-4 text-red-400" />
              <span>Protocole de Sécurité Opérateur</span>
            </div>

            <h1 style={{ fontSize: '2.75rem', fontWeight: 900, marginBottom: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Sécurisation <br /><span style={{ color: '#d33a30' }}>LEKK REK</span>
            </h1>
            
            <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, fontWeight: 400 }}>
              Bienvenue dans l'équipe ! Pour garantir la protection des données de nos restaurants et commandes, veuillez définir dès maintenant votre mot de passe personnel sécurisé.
            </p>
          </div>
        </div>

        {/* === SECTION DROITE : FORMULAIRE SÉCURISÉ === */}
        <div className="first-login-right">
          
          <button 
            type="button"
            onClick={handleLogout}
            style={{ 
              position: "absolute", 
              top: "1.5rem", 
              right: "1.5rem", 
              padding: "0.6rem 1.25rem", 
              background: "#fef2f2", 
              color: "#d33a30", 
              border: "1px solid #fecaca", 
              borderRadius: "9999px", 
              fontWeight: "bold", 
              fontSize: "0.825rem", 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              cursor: "pointer",
              transition: "all 0.2s" 
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }} 
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
          >
            <TbLogout className="w-4 h-4" />
            <span>Quitter</span>
          </button>

          <div style={{ width: '100%', maxWidth: '460px' }}>
            
            {/* Logo LekkRek */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <img src="/logo_lekkrek.png" alt="LekkRek Logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
                <TbSparkles className="w-3.5 h-3.5" /> Première connexion
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Définissez votre mot de passe
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                Votre mot de passe actuel est provisoire. Veuillez choisir un nouveau mot de passe fort pour activer votre accès.
              </p>
            </div>

            {/* Notification d'erreur */}
            {error && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.875rem 1rem', borderRadius: '14px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TbAlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {/* Champ 1 : Mot de passe provisoire */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Mot de passe provisoire reçu *
                </label>
                <div className="custom-input-group">
                  <TbKey className="w-5 h-5 text-gray-400 shrink-0" />
                  <input 
                    type={showCurrent ? "text" : "password"} 
                    placeholder="Saisissez le mot de passe actuel"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrent(!showCurrent)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}
                    tabIndex={-1}
                  >
                    {showCurrent ? <TbEyeOff className="w-5 h-5" /> : <TbEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Champ 2 : Nouveau mot de passe */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                    Nouveau mot de passe personnel *
                  </label>
                  {newPassword && (
                    <span className={`text-xs font-bold ${strengthLabel.color}`}>
                      Force : {strengthLabel.label}
                    </span>
                  )}
                </div>
                <div className="custom-input-group">
                  <TbLock className="w-5 h-5 text-gray-400 shrink-0" />
                  <input 
                    type={showNew ? "text" : "password"} 
                    placeholder="Au moins 8 caractères, 1 Maj, 1 Chiffre, 1 Spécial"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNew(!showNew)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}
                    tabIndex={-1}
                  >
                    {showNew ? <TbEyeOff className="w-5 h-5" /> : <TbEye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Jauge de sécurité */}
                {newPassword.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {[1, 2, 3, 4].map(seg => (
                      <div 
                        key={seg} 
                        style={{ 
                          flex: 1, 
                          height: '4px', 
                          borderRadius: '9999px', 
                          backgroundColor: strengthScore >= seg ? (seg === 4 ? '#10b981' : seg === 3 ? '#6366f1' : seg === 2 ? '#3b82f6' : '#f59e0b') : '#e2e8f0',
                          transition: 'all 0.3s'
                        }} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Champ 3 : Confirmer nouveau mot de passe */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Confirmer le nouveau mot de passe *
                </label>
                <div className="custom-input-group">
                  <TbLock className="w-5 h-5 text-gray-400 shrink-0" />
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    placeholder="Répétez le nouveau mot de passe"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}
                    tabIndex={-1}
                  >
                    {showConfirm ? <TbEyeOff className="w-5 h-5" /> : <TbEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Critères stricts de validation de mot de passe fort */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem', marginTop: '0.25rem' }}>
                <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Exigences obligatoires de sécurité
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                  
                  {/* Règle 1 : 8 caractères */}
                  <div className={`flex items-center gap-1.5 ${isMinLength ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <TbCheck className="w-2.5 h-2.5" />
                    </span>
                    <span>8 caractères min.</span>
                  </div>

                  {/* Règle 2 : Majuscule & Minuscule */}
                  <div className={`flex items-center gap-1.5 ${hasUppercase && hasLowercase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${hasUppercase && hasLowercase ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <TbCheck className="w-2.5 h-2.5" />
                    </span>
                    <span>1 Majuscule + 1 Min.</span>
                  </div>

                  {/* Règle 3 : Chiffre */}
                  <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${hasDigit ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <TbCheck className="w-2.5 h-2.5" />
                    </span>
                    <span>1 Chiffre (0-9)</span>
                  </div>

                  {/* Règle 4 : Caractère spécial */}
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${hasSpecial ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <TbCheck className="w-2.5 h-2.5" />
                    </span>
                    <span>1 Caractère spécial</span>
                  </div>

                  {/* Règle 5 : Identiques */}
                  <div className={`flex items-center gap-1.5 ${isMatching ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isMatching ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <TbCheck className="w-2.5 h-2.5" />
                    </span>
                    <span>Mots de passe identiques</span>
                  </div>

                  {/* Règle 6 : Différent du provisoire */}
                  <div className={`flex items-center gap-1.5 ${isDifferent ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isDifferent ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <TbCheck className="w-2.5 h-2.5" />
                    </span>
                    <span>Différent du provisoire</span>
                  </div>

                </div>
              </div>

              {/* Bouton de validation */}
              <button 
                type="submit" 
                disabled={loading || !isFormValid}
                style={{
                  background: isFormValid 
                    ? 'linear-gradient(135deg, #d33a30, #b91c1c)' 
                    : '#e2e8f0',
                  color: isFormValid ? '#ffffff' : '#94a3b8',
                  padding: '1rem',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                  boxShadow: isFormValid ? '0 10px 25px -5px rgba(211, 58, 48, 0.4)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Enregistrement sécurisé...</span>
                  </>
                ) : (
                  <>
                    <span>Valider et accéder à mon espace</span>
                    <TbArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

            </form>

          </div>

        </div>

      </div>
    </>
  );
}
