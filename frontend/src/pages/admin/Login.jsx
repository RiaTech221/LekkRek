import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    fetch('http://localhost:8080/api/v1/public/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => {
      if (!res.ok) throw new Error("Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.");
      return res.json();
    })
    .then(data => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ email: data.email, roles: data.roles }));
      navigate('/admin');
    })
    .catch(err => setError(err.message));
  };

  return (
    <div className="flex min-h-screen w-full bg-white absolute top-0 left-0 overflow-hidden" style={{ zIndex: 9999 }}>
      
      {/* --- LEFT SIDE: FORM --- */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white relative">
        
        {/* BOUTON RETOUR */}
        <a href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors group">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l'accueil
        </a>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              Connexion <span className="text-red-600">Admin</span>
            </h1>
            <p className="text-gray-500 font-medium">Connectez-vous pour gérer les menus et les commandes LekkRek.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Adresse E-mail</label>
              <input 
                type="email" 
                placeholder="votre@email.com" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Mot de passe</label>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-gray-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/30 transform transition-all active:scale-[0.98]"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>

      {/* --- RIGHT SIDE: CLEAN IMAGE SHOWCASE --- */}
      <div className="hidden md:block w-1/2 relative bg-gray-100">
        <img 
          src="https://images.unsplash.com/photo-1548943487-a2e4f43b4850?q=80&w=2000&auto=format&fit=crop" 
          alt="Gastronomie" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle overlay to make the image look premium without muddying it */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Simple elegant text at the bottom */}
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-3xl font-black text-white mb-2">Lekk Rek Dashboard</h2>
          <p className="text-white/80 font-medium text-lg">Centralisez la gestion de vos offres, suivez les tendances et répondez à l'appétit de Ziguinchor.</p>
        </div>
      </div>

    </div>
  );
}
