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
    // CRITICAL FIX: Added absolute top-0 left-0 w-full min-h-screen z-[9999] 
    // to break out of any centered container in App.jsx!
    <div className="flex min-h-screen w-full bg-white absolute top-0 left-0 z-[9999] overflow-hidden">
      
      {/* --- LEFT SIDE: COLORED BLOCK (Rocket/Premium Inspiration) --- */}
      {/* Changed md: to sm: to guarantee it shows even on very small laptop screens */}
      <div className="hidden sm:flex sm:w-1/2 bg-gradient-to-br from-[#d33a30] to-[#a8201a] flex-col justify-center items-center p-12 relative overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.1)] z-10">
        
        {/* Abstract decorative 3D-like shapes */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white rounded-full mix-blend-overlay opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black rounded-full mix-blend-overlay opacity-20 blur-3xl"></div>
        
        <div className="relative z-10 w-full max-w-md text-left">
          
          {/* Big Abstract Icon (Replacing the Rocket image) */}
          <div className="mb-10 w-28 h-28 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transform -rotate-3">
            <svg className="w-14 h-14 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h2 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight drop-shadow-sm">
            Accès à <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-white">LekkRek Pro</span>
          </h2>
          <p className="text-red-50 text-lg font-medium leading-relaxed mb-10 drop-shadow-sm">
            Débloquez la gestion de vos plats, le suivi de vos commandes en temps réel et l'analyse de vos ventes de la journée.
          </p>
          
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <span className="text-white font-bold tracking-wide">100% Sécurisé</span>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center relative px-8 sm:px-12 lg:px-24 bg-gray-50/50">
        
        {/* BOUTON RETOUR */}
        <a href="/" className="absolute top-6 right-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-600 transition-colors bg-white py-2 px-4 rounded-full shadow-sm border border-gray-100">
          Retour à l'accueil
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              Sign In
            </h1>
            <p className="text-gray-500 font-medium">Veuillez entrer vos identifiants.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold text-center shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="admin@lekkrek.com" 
                  className="w-full bg-white border-2 border-gray-100 rounded-[1.25rem] py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-semibold text-gray-900 placeholder-gray-400 shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <div className="relative group">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white border-2 border-gray-100 rounded-[1.25rem] py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-semibold text-gray-900 placeholder-gray-400 shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full bg-[#d33a30] text-white font-bold py-4 rounded-[1.25rem] hover:bg-red-700 shadow-lg shadow-red-600/30 transform transition-all active:scale-[0.98] text-base"
              >
                Login
              </button>
            </div>
            
            <div className="text-center mt-6">
              <span className="text-sm font-medium text-gray-500">
                Vous n'avez pas de compte ? <a href="#" className="text-red-600 hover:underline font-bold">Contactez l'admin</a>
              </span>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
