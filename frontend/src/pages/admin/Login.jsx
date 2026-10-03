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
          /* CSS pur pour garantir le layout, peu importe l'état du compilateur Tailwind ! */
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
          }
          
          .login-left {
            display: none; /* Caché sur mobile par défaut */
            flex: 1;
            background: linear-gradient(135deg, #d33a30, #901a1e);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 3rem;
            color: white;
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
          }

          /* Dès qu'on est sur tablette/PC, on force l'affichage 50/50 */
          @media (min-width: 768px) {
            .login-left {
              display: flex;
            }
          }

          .rocket-icon {
            font-size: 8rem;
            filter: drop-shadow(0 20px 30px rgba(0,0,0,0.4));
            margin-bottom: 2rem;
            transform: rotate(-10deg);
          }

          .input-group {
            display: flex;
            align-items: center;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            background: #fff;
            transition: 0.2s border-color;
          }
          .input-group:focus-within {
            border-color: #d33a30;
          }

          .social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 40px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            cursor: pointer;
            transition: 0.2s background-color;
          }
          .social-btn:hover {
            background-color: #f9fafb;
          }
        `}
      </style>

      <div className="login-wrapper">
        
        {/* === LEFT SIDE (ROCKET / COLOR BLOCK) === */}
        <div className="login-left">
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <div className="rocket-icon">🚀</div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
              Accès à <br/>LekkRek Pro
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.5 }}>
              Débloquez des milliers de maquettes et d'illustrations avec des ressources gratuites illimitées. (Gérez vos plats et commandes !)
            </p>
          </div>
        </div>

        {/* === RIGHT SIDE (FORM) === */}
        <div className="login-right">
          
          <a href="/" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.5rem 1rem', background: '#f3f4f6', color: '#374151', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.875rem' }}>
            Back to Home
          </a>

          <div style={{ width: '100%', maxWidth: '380px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', color: '#111827', textAlign: 'center' }}>
              Sign In
            </h2>
            
            {error && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div className="input-group">
                <span style={{ color: '#9ca3af', fontSize: '1.2rem', marginRight: '0.75rem' }}>✉</span>
                <input 
                  type="email" 
                  placeholder="Enter Email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ flex: 1, padding: '0.75rem 0', border: 'none', outline: 'none', fontSize: '0.95rem', background: 'transparent' }}
                />
              </div>

              <div className="input-group">
                <span style={{ color: '#9ca3af', fontSize: '1.2rem', marginRight: '0.75rem' }}>🔒</span>
                <input 
                  type="password" 
                  placeholder="Enter Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ flex: 1, padding: '0.75rem 0', border: 'none', outline: 'none', fontSize: '0.95rem', background: 'transparent' }}
                />
              </div>

              <button 
                type="submit"
                style={{ background: 'linear-gradient(to right, #d33a30, #901a1e)', color: 'white', padding: '1rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 14px rgba(211, 58, 48, 0.3)', transition: 'transform 0.1s' }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Sign in
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: '#9ca3af', fontSize: '0.875rem', fontWeight: 600 }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              <span style={{ padding: '0 1rem' }}>- OR -</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <div className="social-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#DB4437"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </div>
              <div className="social-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#4267B2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Already have an account? <a href="#" style={{ color: '#d33a30', fontWeight: 'bold', textDecoration: 'none' }}>Login</a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
