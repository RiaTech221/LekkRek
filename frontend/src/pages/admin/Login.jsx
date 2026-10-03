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
      
      {/* --- LEFT SIDE: COLORED BLOCK (Inspired by the Rocket image) --- */}
      {/* Visible on md and larger screens. Takes left half. */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-600 to-red-800 flex-col justify-center items-center p-12 relative overflow-hidden">
        
        {/* Abstract decorative shapes */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-red-500 rounded-full mix-blend-screen opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-red-900 rounded-full mix-blend-multiply opacity-40 blur-3xl"></div>
        
        <div className="relative z-10 w-full max-w-md text-left">
          
          {/* Big Abstract SVG / Rocket-like icon */}
          <div className="mb-10 w-32 h-32 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transform -rotate-6">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h2 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            Accès à <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-white">LekkRek Pro</span>
          </h2>
          <p className="text-red-100 text-lg font-medium leading-relaxed mb-10">
            Débloquez la gestion de vos plats, le suivi de vos commandes en temps réel et l'analyse de vos ventes de la journée.
          </p>
          
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
             </div>
             <span className="text-white font-semibold">100% Sécurisé</span>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full md:w-1/2 flex flex-col justify-center relative px-8 sm:px-16 lg:px-24 bg-white">
        
        {/* BOUTON RETOUR */}
        <a href="/" className="absolute top-6 right-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-600 transition-colors">
          Retour à l'accueil
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              Sign Up / In
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
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="admin@lekkrek.com" 
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-red-500 transition-all font-medium text-gray-900 placeholder-gray-400 shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-red-500 transition-all font-medium text-gray-900 placeholder-gray-400 shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
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
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-xl hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-600/30 transform transition-all active:scale-[0.98] text-base"
              >
                Login
              </button>
            </div>
            
            <div className="text-center mt-6">
              <span className="text-sm font-medium text-gray-500">
                Already have an account? <a href="#" className="text-red-600 hover:underline font-bold">Sign in</a>
              </span>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
