import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { API_URL } from '../config';

/**
 * ============================================================================
 * 📁 Fichier : ProtectedRoute.jsx
 * 📝 Description : Composant de protection et de contrôle d'accès aux routes.
 * - Vérifie la session via GET /auth/me (cookie HttpOnly).
 * - Exige le changement de mot de passe obligatoire : si l'utilisateur doit changer
 *   son mot de passe provisoire, il est immédiatement redirigé vers /first-login.
 * - Contrôle des rôles autorisés (allowedRoles).
 * 💡 Auteur : Standard Enterprise Security
 * ============================================================================
 */
export default function ProtectedRoute({ children, allowedRoles = [], allowPendingPasswordChange = false }) {
  const [status, setStatus] = useState('checking'); // checking | ok | ko

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/v1/public/auth/me`, { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(user => {
        if (cancelled) return;
        if (user && user.email) {
          const prev = (() => {
            try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch (_) { return {}; }
          })();
          localStorage.setItem('user', JSON.stringify({
            ...prev,
            email: user.email,
            roles: user.roles || [],
            restaurants: user.restaurants || prev.restaurants || [],
            restaurantAssigne: (user.restaurants && user.restaurants.length > 0) ? user.restaurants[0].name : prev.restaurantAssigne,
            restaurantId: (user.restaurants && user.restaurants.length > 0) ? user.restaurants[0].id : prev.restaurantId,
            doitChangerMotDePasse: user.doitChangerMotDePasse !== undefined ? Boolean(user.doitChangerMotDePasse) : Boolean(prev.doitChangerMotDePasse)
          }));
          setStatus('ok');
        } else {
          localStorage.removeItem('user');
          setStatus('ko');
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem('user');
          setStatus('ko');
        }
      });
    return () => { cancelled = true; };
  }, []);

  if (status === 'checking') return null;

  if (status === 'ko') {
    return <Navigate to="/login" replace />;
  }

  const userStr = localStorage.getItem('user');
  let user = { roles: [] };

  try {
    if (userStr) {
      const parsed = JSON.parse(userStr);
      if (parsed && typeof parsed === 'object') {
        user = {
          ...parsed,
          roles: Array.isArray(parsed.roles) ? parsed.roles : [],
          doitChangerMotDePasse: Boolean(parsed.doitChangerMotDePasse)
        };
      }
    }
  } catch (e) {
    console.error("Erreur lecture utilisateur:", e);
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // 1. Contrôle du mot de passe provisoire obligatoire
  if (user.doitChangerMotDePasse && !allowPendingPasswordChange) {
    return <Navigate to="/first-login" replace />;
  }

  // 2. Si l'utilisateur a déjà changé son mot de passe et tente de revenir sur /first-login
  if (!user.doitChangerMotDePasse && allowPendingPasswordChange) {
    const isAdmin = user.roles.includes('ROLE_ADMIN');
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  // 3. Contrôle des rôles autorisés
  if (allowedRoles.length > 0) {
    const hasRequiredRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasRequiredRole) {
      const isOperator = user.roles.includes('ROLE_OPERATEUR');
      return <Navigate to={isOperator ? "/dashboard" : "/"} replace />;
    }
  }

  return children;
}
