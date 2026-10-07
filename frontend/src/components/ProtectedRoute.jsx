import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Composant ProtectedRoute pour protéger les routes React par rôle.
 * - Redirige vers /login si aucun token ou session invalide.
 * - Vérifie si l'utilisateur possède l'un des rôles autorisés (allowedRoles).
 * - En cas de rôle non autorisé, redirige vers la route de secours (fallbackPath).
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Vérification de la durée de vie du token JWT côté client
  try {
    const payloadBase64 = token.split('.')[1];
    if (payloadBase64) {
      const decodedPayload = JSON.parse(atob(payloadBase64));
      if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
        console.warn("Session expirée (token JWT expiré)");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
      }
    }
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    localStorage.removeItem('token');
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
