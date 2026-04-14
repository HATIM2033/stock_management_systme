import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../components/Common/Toast';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .reg-root {
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --accent-light: #eff6ff;
    --surface: #ffffff;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --red: #dc2626;
    --green: #16a34a;
    --sans: 'DM Sans', sans-serif;
    --mono: 'DM Mono', monospace;
    
    font-family: var(--sans);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #f3f1f5ff 100%);
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
  }

  .reg-root::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: regFloat 20s ease-in-out infinite;
  }

  @keyframes regFloat {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-30px, 30px); }
  }

  .reg-container {
    width: 100%;
    max-width: 480px;
    position: relative;
    z-index: 1;
  }

  .reg-card {
    background: var(--surface);
    border-radius: 24px;
    padding: 3rem 2.5rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: regSlideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes regSlideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Header */
  .reg-logo-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .reg-logo {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 20px rgba(37,99,235,0.3);
  }

  .reg-title {
    font-size: 1.75rem;
    font-weight: 700;
    text-align: center;
    color: var(--text);
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .reg-subtitle {
    text-align: center;
    color: var(--muted);
    font-size: 0.9375rem;
    margin-bottom: 2rem;
  }

  /* Form */
  .reg-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .reg-form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .reg-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    .reg-form-row {
      grid-template-columns: 1fr;
    }
  }

  .reg-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text);
  }

  .reg-required {
    color: var(--red);
    margin-left: 0.25rem;
  }

  .reg-input-wrap {
    position: relative;
  }

  .reg-input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-size: 0.9375rem;
    font-family: var(--sans);
    color: var(--text);
    transition: all 0.2s;
    outline: none;
    background: var(--surface);
  }

  .reg-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-light);
  }

  .reg-input.error {
    border-color: var(--red);
  }

  .reg-input.success {
    border-color: var(--green);
  }

  .reg-input-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
  }

  .reg-input-icon.success {
    color: var(--green);
  }

  .reg-input-icon.error {
    color: var(--red);
  }

  .reg-error {
    font-size: 0.8125rem;
    color: var(--red);
    margin-top: 0.25rem;
  }

  .reg-hint {
    font-size: 0.8125rem;
    color: var(--muted);
    margin-top: 0.25rem;
  }

  /* Password Strength */
  .reg-password-strength {
    margin-top: 0.5rem;
  }

  .reg-strength-bar {
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .reg-strength-fill {
    height: 100%;
    transition: width 0.3s, background 0.3s;
  }

  .reg-strength-fill.weak {
    background: var(--red);
  }

  .reg-strength-fill.medium {
    background: #d97706;
  }

  .reg-strength-fill.strong {
    background: var(--green);
  }

  .reg-strength-text {
    font-size: 0.75rem;
    font-weight: 600;
  }

  .reg-strength-text.weak {
    color: var(--red);
  }

  .reg-strength-text.medium {
    color: #d97706;
  }

  .reg-strength-text.strong {
    color: var(--green);
  }

  /* Checkbox */
  .reg-checkbox-wrap {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .reg-checkbox {
    width: 18px;
    height: 18px;
    border: 1.5px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .reg-checkbox:checked {
    background: var(--accent);
    border-color: var(--accent);
  }

  .reg-checkbox-label {
    font-size: 0.875rem;
    color: var(--muted);
    line-height: 1.5;
  }

  .reg-checkbox-label a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
  }

  .reg-checkbox-label a:hover {
    text-decoration: underline;
  }

  /* Button */
  .reg-submit {
    width: 100%;
    padding: 0.875rem;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    margin-top: 0.5rem;
  }

  .reg-submit:hover:not(:disabled) {
    background: var(--accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37,99,235,0.4);
  }

  .reg-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* Footer */
  .reg-footer {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    font-size: 0.875rem;
    color: var(--muted);
  }

  .reg-footer a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
  }

  .reg-footer a:hover {
    text-decoration: underline;
  }

  /* Loading */
  .reg-loading {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Icons
const IconBox = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
  </svg>
);

const IconCheck = () => (
  <svg className="reg-input-icon success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconX = () => (
  <svg className="reg-input-icon error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    company_name: '',
    phone: '',
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // 'checking', 'available', 'taken'
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '' });

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Check email availability
    if (name === 'email' && value.includes('@')) {
      checkEmailDebounced(value);
    }

    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // Debounce email check
  let emailTimeout;
  const checkEmailDebounced = (email) => {
    clearTimeout(emailTimeout);
    setEmailStatus('checking');
    
    emailTimeout = setTimeout(async () => {
      try {
        const response = await api.post('/auth/check-email', { email });
        setEmailStatus(response.data.available ? 'available' : 'taken');
        if (!response.data.available) {
          setErrors(prev => ({ ...prev, email: 'Cet email est déjà utilisé' }));
        }
      } catch (err) {
        setEmailStatus(null);
      }
    }, 500);
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    let score = 0;
    let text = '';

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      text = 'Faible';
    } else if (score <= 3) {
      text = 'Moyen';
    } else {
      text = 'Fort';
    }

    setPasswordStrength({ score: score * 20, text });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Le nom est obligatoire';
    if (!formData.email) newErrors.email = 'L\'email est obligatoire';
    if (!formData.password) newErrors.password = 'Le mot de passe est obligatoire';
    if (formData.password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.terms) newErrors.terms = 'Vous devez accepter les conditions';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      
      if (response.data.success) {
        // Save token and user
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Login user
        login(response.data.user, response.data.token);
        
        success('Inscription réussie! Bienvenue ' + response.data.user.name);
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        showError(err.response?.data?.message || 'Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthClass = () => {
    if (passwordStrength.score <= 40) return 'weak';
    if (passwordStrength.score <= 60) return 'medium';
    return 'strong';
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="reg-root">
        <div className="reg-container">
          <div className="reg-card">
            
            {/* Header */}
            <div className="reg-logo-wrap">
              <div className="reg-logo">
                <IconBox />
              </div>
            </div>
            
            <h1 className="reg-title">Créer un compte</h1>
            <p className="reg-subtitle">Commencez à gérer votre stock gratuitement</p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="reg-form">
              
              {/* Name */}
              <div className="reg-form-group">
                <label className="reg-label">
                  Nom complet <span className="reg-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`reg-input ${errors.name ? 'error' : ''}`}
                  placeholder="Jean Dupont"
                />
                {errors.name && <div className="reg-error">{errors.name}</div>}
              </div>

              {/* Email */}
              <div className="reg-form-group">
                <label className="reg-label">
                  Email <span className="reg-required">*</span>
                </label>
                <div className="reg-input-wrap">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`reg-input ${errors.email ? 'error' : emailStatus === 'available' ? 'success' : ''}`}
                    placeholder="vous@exemple.com"
                  />
                  {emailStatus === 'available' && <IconCheck />}
                  {emailStatus === 'taken' && <IconX />}
                </div>
                {errors.email && <div className="reg-error">{errors.email}</div>}
              </div>

              {/* Company & Phone */}
              <div className="reg-form-row">
                <div className="reg-form-group">
                  <label className="reg-label">Entreprise</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="reg-input"
                    placeholder="Ma Société SARL"
                  />
                </div>

                <div className="reg-form-group">
                  <label className="reg-label">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="reg-input"
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="reg-form-group">
                <label className="reg-label">
                  Mot de passe <span className="reg-required">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`reg-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                />
                {errors.password && <div className="reg-error">{errors.password}</div>}
                
                {formData.password && (
                  <div className="reg-password-strength">
                    <div className="reg-strength-bar">
                      <div 
                        className={`reg-strength-fill ${getPasswordStrengthClass()}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    <div className={`reg-strength-text ${getPasswordStrengthClass()}`}>
                      Force: {passwordStrength.text}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="reg-form-group">
                <label className="reg-label">
                  Confirmer le mot de passe <span className="reg-required">*</span>
                </label>
                <div className="reg-input-wrap">
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className={`reg-input ${errors.password_confirmation ? 'error' : formData.password_confirmation && formData.password === formData.password_confirmation ? 'success' : ''}`}
                    placeholder="••••••••"
                  />
                  {formData.password_confirmation && formData.password === formData.password_confirmation && <IconCheck />}
                </div>
                {errors.password_confirmation && <div className="reg-error">{errors.password_confirmation}</div>}
              </div>

              {/* Terms */}
              <div className="reg-checkbox-wrap">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="reg-checkbox"
                  id="terms"
                />
                <label htmlFor="terms" className="reg-checkbox-label">
                  J'accepte les <a href="#">Conditions d'utilisation</a> et la <a href="#">Politique de confidentialité</a>
                </label>
              </div>
              {errors.terms && <div className="reg-error">{errors.terms}</div>}

              {/* Submit */}
              <button type="submit" className="reg-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="reg-loading" /> Création du compte...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </button>

            </form>

            {/* Footer */}
            <div className="reg-footer">
              Vous avez déjà un compte? <Link to="/login">Se connecter</Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Register;