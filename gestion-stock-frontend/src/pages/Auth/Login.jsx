import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // 1. Zdna Link hna
import { useAuth } from '../../context/AuthContext';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .lg-root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --surface2: #f1f5f9;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #2563eb;
    --accent-h: #1d4ed8;
    --accent-light: #eff6ff;
    --red: #dc2626;
    --red-light: #fef2f2;
    --red-border: #fecaca;
    --mono: 'DM Mono', monospace;
    --sans: 'DM Sans', sans-serif;

    font-family: var(--sans);
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
  }

  /* ... (b9iyat les styles li kanu 3ndek) ... */
  
  .lg-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2.5rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
    animation: lgFadeUp 0.3s ease both;
    position: relative;
    z-index: 1;
  }

  .lg-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
  }
  .lg-logo-icon {
    width: 52px; height: 52px;
    background: var(--accent);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 20px rgba(37,99,235,0.25);
  }
  .lg-logo-name {
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
    line-height: 1;
  }
  .lg-logo-name span { color: var(--accent); }
  .lg-logo-sub {
    font-size: 0.8125rem;
    color: var(--muted);
    margin-top: 0.2rem;
    text-align: center;
  }

  .lg-divider {
    height: 1px;
    background: var(--border);
    margin-bottom: 1.75rem;
  }

  .lg-error {
    background: var(--red-light);
    border: 1px solid var(--red-border);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.875rem;
    color: var(--red);
    font-weight: 500;
    animation: lgShake 0.35s ease;
  }

  .lg-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin-bottom: 1rem;
  }
  .lg-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #475569;
  }
  .lg-input-wrap { position: relative; }
  .lg-input-icon {
    position: absolute;
    left: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
    display: flex;
    align-items: center;
  }
  .lg-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: var(--sans);
    font-size: 0.9375rem;
    padding: 0.75rem 0.875rem 0.75rem 2.5rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.15s;
  }
  .lg-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    background: var(--surface);
  }

  .lg-pw-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--muted);
    padding: 0.25rem;
    border-radius: 5px;
    transition: color 0.15s;
  }
  .lg-pw-toggle:hover { color: var(--accent); }

  .lg-submit {
    width: 100%;
    padding: 0.8125rem;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: var(--sans);
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 4px 14px rgba(37,99,235,0.25);
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
  }
  .lg-submit:hover:not(:disabled) {
    background: var(--accent-h);
    transform: translateY(-1px);
  }
  .lg-submit:disabled { opacity: 0.65; cursor: not-allowed; }

  /* 2. Zdna style dyal l-footer hna */
  .login-footer {
    margin-top: 1.75rem;
    text-align: center;
    font-size: 0.875rem;
    color: var(--muted);
  }
  .login-footer a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.25rem;
  }
  .login-footer a:hover {
    text-decoration: underline;
  }

  @keyframes lgSpin { to { transform: rotate(360deg); } }
  .lg-spinner {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: lgSpin 0.7s linear infinite;
  }

  @keyframes lgFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lgShake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    60%      { transform: translateX(6px); }
    80%      { transform: translateX(-3px); }
  }
`;

// Icons (kima huma...)
const IconBox   = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>;
const IconMail  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconLock  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IconEye   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IconWarn  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const Login = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const set = (k) => (e) => {
    setFormData(p => ({ ...p, [k]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(formData);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error ?? 'Email ou mot de passe incorrect');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="lg-root">
        <div className="lg-card">

          {/* Logo */}
          <div className="lg-logo">
            <div className="lg-logo-icon"><IconBox /></div>
            <div style={{ textAlign: 'center' }}>
              <p className="lg-logo-name">Gestion <span>Stock</span></p>
              <p className="lg-logo-sub">Connectez-vous à votre espace</p>
            </div>
          </div>

          <div className="lg-divider" />

          {error && (
            <div className="lg-error" key={error}>
              <IconWarn />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="lg-field">
              <label className="lg-label">Adresse email</label>
              <div className="lg-input-wrap">
                <span className="lg-input-icon"><IconMail /></span>
                <input
                  type="email" className="lg-input"
                  placeholder="exemple@email.com"
                  value={formData.email}
                  onChange={set('email')}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="lg-field">
              <label className="lg-label">Mot de passe</label>
              <div className="lg-input-wrap">
                <span className="lg-input-icon"><IconLock /></span>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="lg-input password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={set('password')}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="lg-pw-toggle"
                  onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? 'Masquer' : 'Afficher'}
                  tabIndex={-1}
                >
                  {showPw ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="lg-submit" disabled={loading}>
              {loading ? (
                <><div className="lg-spinner" /> Connexion en cours…</>
              ) : 'Se connecter'}
            </button>
          </form>

          {/* 3. Zdna lfooter hna ta7t l-form */}
          <div className="login-footer">
            Pas encore de compte? <Link to="/register">S'inscrire gratuitement</Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;