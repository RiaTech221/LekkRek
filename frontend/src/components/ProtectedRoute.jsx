import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { API_URL } from '../config';

/**
 * Composant ProtectedRoute pour protéger les routes React par rôle.
 * - Vérifie la session via GET /auth/me : le JWT étant en cookie HttpOnly, le JS
 *   ne peut ni le lire ni en vérifier l'expiration — c'est le serveur qui valide.
 * - En cas d'échec (401) : on purge le profil local et on redirige vers /login.
 * - Vérifie ensuite si l'utilisateur possède l'un des rôles autorisés (allowedRoles).
 * - En cas de rôle non autorisé, redirige vers la route de secours (fallbackPath).
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [status, setStatus] = useState('checking'); // checking | ok | ko

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/v1/public/auth/me`)
      .then(res => (res.ok ? res.json() : null))
      .then(user => {
        if (cancelled) return;
        if (user && user.email) {
          localStorage.setItem('user', JSON.stringify({ email: user.email, roles: user.roles || [] }));
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
          roles: Array.isArray(parsed.roles) ? parsed.roles : []
        };
      }
    }
  } catch (e) {
    console.error("Erreur lecture utilisateur:", e);
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Si des rôles spécifiques sont requis, vérifier l'autorisation
  if (allowedRoles.length > 0) {
    const hasRequiredRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasRequiredRole) {
      // Redirection intelligente selon le rôle possédé
      const isOperator = user.roles.includes('ROLE_OPERATEUR');
      return <Navigate to={isOperator ? "/dashboard" : "/"} replace />;
    }
  }

  return children;
}
