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
      if (!res.ok) throw new Error("Identifiants incorrects. Veuillez vérifier votre e-mail et mot de passe.");
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
    <div className="min-h-screen w-full bg-white flex p-4 sm:p-6 lg:p-8">
      
      {/* --- LEFT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center relative">
        
        {/* BOUTON RETOUR */}
        <a href="/" className="absolute top-2 left-2 sm:top-6 sm:left-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </a>

        <div className="w-full max-w-sm mt-12 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 flex items-center justify-center lg:justify-start gap-3">
              <span className="text-red-600">Welcome</span> Back <span className="text-3xl animate-bounce">👋</span>
            </h1>
            <p className="text-gray-500 font-medium">Please enter your details to sign in.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-4">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="admin@lekkrek.com" 
                  className="w-full bg-white border-2 border-gray-200 rounded-full py-4 pl-6 pr-12 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-gray-900 placeholder-gray-400 shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-4">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white border-2 border-gray-200 rounded-full py-4 pl-6 pr-12 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-gray-900 placeholder-gray-400 shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-[#d33a30] text-white font-bold py-4 rounded-full hover:bg-red-700 shadow-xl shadow-red-600/30 transform transition-all active:scale-[0.98] text-base"
              >
                Log in
              </button>
            </div>
            
            <div className="text-center mt-6">
              <span className="text-sm font-medium text-gray-500">
                Vous n'avez pas de compte ? <a href="#" className="text-[#d33a30] hover:underline font-bold">Contactez l'admin</a>
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* --- RIGHT SIDE: STYLED IMAGE CORNER (Inspired by screenshot) --- */}
      <div className="hidden lg:block lg:w-1/2 p-2 h-[calc(100vh-2rem)] sticky top-4">
        {/* We use a gradient fallback just in case Unsplash is blocked by network */}
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative shadow-2xl bg-gradient-to-br from-red-500 to-orange-400">
          <img 
            src="https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=1000&auto=format&fit=crop" 
            alt="Design Food" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90"
            onError={(e) => {
               // Fallback: If image fails to load (network block), just hide it and show the gradient
               e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          
          <div className="absolute bottom-12 left-12 right-12">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Lekk Rek Admin</h2>
            <p className="text-white/90 font-medium text-lg leading-relaxed">Gérez vos commandes, mettez à jour vos menus et suivez votre activité en temps réel.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
