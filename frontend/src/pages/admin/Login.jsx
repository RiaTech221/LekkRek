import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ============================================================================
 * 📁 Fichier : Login.jsx
 * 📝 Description : Composant React gérant l'interface utilisateur pour Login.
 * 🎨 Rôle : Vue Frontend (Vite/Tailwind) pour l'expérience client/admin LekkRek.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */

import '../../index.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/v1/public/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => {
      if (!res.ok) throw new Error("Identifiants incorrects");
      return res.json();
    })
    .then(data => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ email: data.email, roles: data.roles }));
      navigate('/admin');
    })
    .catch(err => alert(err.message));
  };

  return (
    <div className="flex min-h-screen w-full bg-white absolute top-0 left-0 overflow-hidden" style={{ zIndex: 9999 }}>
      
      {/* --- LEFT SIDE: FORM --- */}
      <div className="w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white z-10 relative">
        
        {/* BOUTON RETOUR À LA VITRINE */}
        <a href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors group">
          <div className="bg-gray-100 p-2 rounded-full group-hover:bg-red-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          Retour au site public
        </a>

        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-red-100/50 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-[20%] -right-[20%] w-[400px] h-[400px] bg-orange-100/50 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="mb-12">
            <h1 className="text-5xl font-black tracking-tighter text-gray-900 mb-3 flex items-center gap-3">
              <span className="text-red-600">Lekk</span>Rek
              <span className="text-[11px] text-red-600 font-bold tracking-widest bg-red-50 border border-red-100 px-3 py-1.5 rounded-full uppercase shadow-sm">
                Espace Interne
              </span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">Plateforme d'administration et de supervision.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700 ml-1">Adresse E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-600 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  placeholder="admin@lekkrek.com" 
                  className="w-full bg-white border border-gray-200 shadow-sm rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-gray-900 placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700 ml-1 flex justify-between items-center">
                Mot de passe
                <a href="#" className="text-red-500 hover:text-red-700 hover:underline font-bold text-xs transition-colors">Oublié ?</a>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-600 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white border border-gray-200 shadow-sm rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-gray-900 placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="group w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-black transition-all transform hover:-translate-y-1 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] mt-8 flex items-center justify-center gap-3">
              Accéder à l'espace
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">Accès restreint au personnel autorisé</span>
            </div>
          </form>
        </div>
      </div>

      {/* --- RIGHT SIDE: PREMIUM DASHBOARD SHOWCASE --- */}
      <div className="w-1/2 bg-gray-900 relative flex flex-col justify-center items-center overflow-hidden">
        
        {/* Background Image of Personnel / Operator */}
        <img 
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2000&auto=format&fit=crop" 
          alt="Opérateur LekkRek" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Rich dark overlay to keep the tech vibe and make white text pop */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-red-900/60 to-gray-900/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
        
        {/* Abstract UI Elements Overlay */}
        <div className="relative z-10 w-full flex justify-center p-8">
          
          {/* Ultra-clean Secure Access Card */}
          <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[2.5rem] shadow-2xl border border-white/10 text-center max-w-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 shadow-inner">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Accès Sécurisé</h2>
            <p className="text-gray-300 font-medium text-base leading-relaxed">
              Veuillez vous authentifier pour accéder à l'interface d'administration LekkRek.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
