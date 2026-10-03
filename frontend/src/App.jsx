import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import des pages (Views)
import ClientView from './pages/client/ClientView';
import MobileClientView from './pages/client/MobileClientView';
import PublicPage from './pages/client/PublicPage';
import OperatorDashboard from './pages/admin/OperatorDashboard';
import Login from './pages/admin/Login';

/**
 * ============================================================================
 * 📁 Fichier : App.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour App.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


// Style global
import './index.css';

// Composant pour protéger les routes Admin
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Espace Client (Public) */}
        <Route path="/" element={<ClientView />} />
        <Route path="/mobile" element={<MobileClientView />} />
        <Route path="/pages/:slug" element={<PublicPage />} />
        
        {/* Connexion Opérateur */}
        <Route path="/login" element={<Login />} />
        
        {/* Espace Administration (Opérateur) - Protégé */}
        <Route path="/admin" element={
          <PrivateRoute>
            <OperatorDashboard />
          </PrivateRoute>
        } />

        {/* Fallback : Redirection vers l'accueil si route introuvable */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
