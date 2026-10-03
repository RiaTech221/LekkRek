import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <>
      <style>
        {`
          .login-wrapper {
            display: flex;
            width: 100vw;
            min-height: 100vh;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 99999;
            background-color: white;
            font-family: system-ui, -apple-system, sans-serif;
            overflow: hidden; /* Prevent scrollbars from rocket overflowing screen */
          }
          
          .login-left {
            display: none; 
            flex: 1;
            background: linear-gradient(135deg, #d33a30, #901a1e);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 3rem;
            color: white;
            position: relative; /* Essential for placing the rocket on the border */
          }
          
          .login-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            background: #ffffff;
            position: relative;
            z-index: 1; /* Keep it below the overlapping rocket */
          }

          @media (min-width: 768px) {
            .login-left {
              display: flex;
            }
          }

          /* ROCKET ON THE BORDER */
          .rocket-container {
            position: absolute;
            right: -130px; /* Overlaps exactly onto the white side */
            top: 50%;
            transform: translateY(-50%);
            z-index: 100;
            pointer-events: none; /* Prevents rocket from blocking clicks on the form */
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 260px;
          }

          .rocket-image {
            width: 220px;
            height: auto;
            transform: rotate(20deg);
            filter: drop-shadow(0 25px 35px rgba(0,0,0,0.4));
            position: relative;
            z-index: 2;
          }

          /* La fameuse "mousse blanche" / nuages */
          .rocket-foam {
            width: 160px;
            height: auto;
            margin-top: -60px; /* Pull it up under the rocket engine */
            margin-left: -40px;
            filter: drop-shadow(0 15px 25px rgba(0,0,0,0.15));
            position: relative;
            z-index: 1;
          }

          /* CHAMPS DE SAISIE LISSES ET ARRONDIS */
          .input-group {
            display: flex;
            align-items: center;
            background: #f3f4f6; /* Soft gray background */
            border: 2px solid transparent;
            border-radius: 9999px; /* Coins totalement arrondis (pilule) */
            padding: 0.25rem 1.5rem;
            transition: all 0.3s ease;
          }
          .input-group:focus-within {
            background: #ffffff;
            border-color: #d33a30;
            box-shadow: 0 0 0 4px rgba(211, 58, 48, 0.1);
          }
          .input-group input {
            flex: 1;
            padding: 1rem 0;
            border: none;
            outline: none;
            font-size: 1rem;
            background: transparent;
            color: #1f2937;
            font-weight: 600;
          }
          .input-icon {
            color: #9ca3af;
            font-size: 1.25rem;
            margin-right: 0.75rem;
            transition: color 0.3s ease;
          }
          .input-group:focus-within .input-icon {
            color: #d33a30;
          }

          /* BOUTON ARRONDIS ET LISSE */
          .submit-btn {
            background: linear-gradient(135deg, #d33a30, #a8201a);
            color: white;
            padding: 1.15rem;
            border: none;
            border-radius: 9999px; /* Pilule */
            font-weight: 800;
            font-size: 1.1rem;
            cursor: pointer;
            margin-top: 1rem;
            box-shadow: 0 10px 25px rgba(211, 58, 48, 0.3);
            transition: all 0.2s ease;
          }
          .submit-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(211, 58, 48, 0.4);
          }
          .submit-btn:active {
            transform: translateY(1px);
          }

          .social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 65px;
            height: 45px;
            border-radius: 9999px; /* Boutons sociaux arrondis aussi */
            border: 2px solid #f3f4f6;
            cursor: pointer;
            transition: all 0.2s ease;
            background: white;
          }
          .social-btn:hover {
            background-color: #f9fafb;
            border-color: #e5e7eb;
            transform: translateY(-2px);
          }
        `}
      </style>

      <div className="login-wrapper">
        
        {/* === LEFT SIDE (COLOR BLOCK) === */}
        <div className="login-left">
          
          {/* L'icône Avion/Fusée sur la frontière avec la mousse ! */}
          <div className="rocket-container">
            {/* Rocket 3D */}
            <img 
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png" 
              alt="Rocket" 
              className="rocket-image"
            />
            {/* Mousse blanche (Nuage 3D) */}
            <img 
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud/3D/cloud_3d.png" 
              alt="Smoke foam" 
              className="rocket-foam"
            />
          </div>

          <div style={{ maxWidth: '400px', width: '100%', position: 'relative', zIndex: 10, paddingRight: '40px' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Accès à <br/><span style={{ color: '#fca5a5' }}>LekkRek Pro</span>
            </h1>
            <p style={{ fontSize: '1.15rem', opacity: 0.95, lineHeight: 1.6, fontWeight: 500 }}>
              Débloquez la gestion de vos plats, le suivi de vos commandes en temps réel et analysez vos statistiques de ventes instantanément.
            </p>
          </div>
        </div>

        {/* === RIGHT SIDE (FORM) === */}
        <div className="login-right">
          
          <a href="/" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.6rem 1.25rem', background: '#f3f4f6', color: '#374151', textDecoration: 'none', borderRadius: '9999px', fontWeight: 'bold', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Retour
          </a>

          <div style={{ width: '100%', maxWidth: '380px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: '#111827', textAlign: 'center', letterSpacing: '-0.02em' }}>
              Sign In
            </h2>
            
            {error && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div className="input-group">
                <svg className="input-icon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <input 
                  type="email" 
                  placeholder="Adresse email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <svg className="input-icon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input 
                  type="password" 
                  placeholder="Mot de passe" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Connexion
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: '#9ca3af', fontSize: '0.875rem', fontWeight: 600 }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              <span style={{ padding: '0 1rem' }}>ou continuer avec</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <div className="social-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#DB4437"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </div>
              <div className="social-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#4267B2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem', color: '#6b7280' }}>
              Vous n'avez pas de compte ? <a href="#" style={{ color: '#d33a30', fontWeight: '800', textDecoration: 'none' }}>Contactez l'admin</a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
