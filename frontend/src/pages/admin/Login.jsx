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
            background: linear-gradient(135deg, #0f172a, #1e293b);
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
            right: -130px; 
            top: 50%;
            transform: translateY(-50%);
            z-index: 100;
            pointer-events: none;
            width: 300px;
            height: 380px;
          }

          .rocket-image {
            position: absolute;
            top: 20px;
            right: 0px;
            width: 230px;
            height: auto;
            transform: rotate(-35deg); /* Pointe vers le haut comme sur la capture */
            filter: drop-shadow(10px 25px 25px rgba(0,0,0,0.4));
            z-index: 3;
          }

          /* La fameuse "mousse blanche" / nuages compositée */
          .rocket-foam-top {
            position: absolute;
            bottom: 90px;
            left: 50px;
            width: 110px;
            height: auto;
            z-index: 2;
            filter: drop-shadow(0 10px 15px rgba(0,0,0,0.15));
          }
          
          .rocket-foam-bottom {
            position: absolute;
            bottom: 10px;
            left: 10px;
            width: 170px;
            height: auto;
            z-index: 1;
            filter: drop-shadow(0 15px 25px rgba(0,0,0,0.2));
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
          
          {/* SEPARATEUR COURBE SINUSOÏDALE (Vague) */}
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            style={{ position: 'absolute', right: '-1px', top: 0, height: '100%', width: '12vw', zIndex: 1 }}
          >
            <path fill="#ffffff" d="M100,0 L100,100 L50,100 C -20,75 120,25 50,0 Z" />
          </svg>

          {/* L'icône Avion/Fusée sur la frontière avec la mousse ! */}
          <div className="rocket-container">
            {/* Rocket 3D */}
            <img 
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png" 
              alt="Rocket" 
              className="rocket-image"
            />
            {/* Mousse blanche (Nuage 3D - partie haute) */}
            <img 
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud/3D/cloud_3d.png" 
              alt="Smoke foam top" 
              className="rocket-foam-top"
            />
            {/* Mousse blanche (Nuage 3D - base large) */}
            <img 
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud/3D/cloud_3d.png" 
              alt="Smoke foam base" 
              className="rocket-foam-bottom"
            />
          </div>

          <div style={{ maxWidth: '400px', width: '100%', position: 'relative', zIndex: 10, paddingRight: '10vw' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Accès à <br/><span style={{ color: '#d33a30' }}>LEKK REK</span>
            </h1>
            <p style={{ fontSize: '1.15rem', opacity: 0.95, lineHeight: 1.6, fontWeight: 500 }}>
              Débloquez la gestion de vos plats, le suivi de vos commandes en temps réel et analysez vos statistiques de ventes instantanément sur notre plateforme.
            </p>
          </div>
        </div>

        {/* === RIGHT SIDE (FORM) === */}
        <div className="login-right">
          
          <a href="/" style={{ position: "absolute", top: "1.5rem", right: "1.5rem", padding: "0.6rem 1.25rem", background: "#fef2f2", color: "#d33a30", border: "1px solid #fecaca", textDecoration: "none", borderRadius: "9999px", fontWeight: "bold", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Retour au site
          </a>

          <div style={{ width: '100%', maxWidth: '380px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: '#111827', textAlign: 'center', letterSpacing: '-0.02em' }}>
              Espace Pro
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
          </div>
        </div>

      </div>
    </>
  );
}




