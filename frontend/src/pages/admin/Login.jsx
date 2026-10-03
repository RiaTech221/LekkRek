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
    <div className="flex min-h-screen w-full bg-white overflow-hidden">
      
      {/* --- LEFT SIDE: FORM --- */}
      <div className="w-full md:w-1/2 flex flex-col justify-center relative px-8 sm:px-16 lg:px-24">
        
        {/* BOUTON RETOUR */}
        <a href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l'accueil
        </a>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              Welcome <span className="text-red-600">Back</span>
            </h1>
            <p className="text-gray-500 font-medium">Veuillez entrer vos identifiants.</p>
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
                  className="w-full bg-gray-50 border-2 border-transparent rounded-full py-4 pl-6 pr-12 text-sm focus:outline-none focus:border-red-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
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
                  className="w-full bg-gray-50 border-2 border-transparent rounded-full py-4 pl-6 pr-12 text-sm focus:outline-none focus:border-red-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
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
                className="w-full bg-red-600 text-white font-bold py-4 rounded-full hover:bg-red-700 shadow-xl shadow-red-600/30 transform transition-all active:scale-[0.98] text-base"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- RIGHT SIDE: COLORED BLOCK (No external images) --- */}
      {/* Changed lg:flex to md:flex to ensure it shows up on smaller laptops! */}
      <div className="hidden md:flex md:w-1/2 bg-red-600 flex-col justify-center items-center p-12 relative">
        
        {/* Abstract background shapes for a premium look without images */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-red-700 rounded-full mix-blend-multiply opacity-50 blur-3xl"></div>
        
        <div className="relative z-10 text-center max-w-md">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl border border-white/20">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Nouveau ici ?</h2>
          <p className="text-red-100 text-lg font-medium leading-relaxed mb-10">
            LekkRek est la première plateforme de découverte de plats à Ziguinchor. Rejoignez-nous pour digitaliser vos menus.
          </p>
          <a href="#" className="inline-block px-10 py-4 rounded-full bg-white text-red-600 font-bold hover:bg-gray-50 transition-colors shadow-lg">
            Créer un compte
          </a>
        </div>
      </div>

    </div>
  );
}
