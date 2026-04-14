import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Common/Toast';
import userService from '../../services/userService';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .uf-root {
    --bg: #f8fafc; --surface: #ffffff; --surface2: #f1f5f9; --border: #e2e8f0;
    --text: #0f172a; --muted: #64748b;
    --accent: #2563eb; --accent-h: #1d4ed8; --accent-light: #eff6ff;
    --green: #16a34a; --green-light: #f0fdf4; --green-border: #bbf7d0;
    --yellow: #d97706; --yellow-light: #fffbeb; --yellow-border: #fde68a;
    --red: #dc2626; --red-light: #fef2f2; --red-border: #fecaca;
    --purple: #7c3aed; --purple-light: #f3f0ff; --purple-border: #ddd6fe;
    --mono: 'DM Mono', monospace; --sans: 'DM Sans', sans-serif;

    font-family: var(--sans); background: var(--bg); color: var(--text);
    min-height: 100vh; padding: 2.5rem 1rem;
  }

  .uf-container { max-width: 800px; margin: 0 auto; }

  /* Header */
  .uf-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
  .uf-back-btn {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.65rem 1.1rem; background: var(--surface);
    border: 1px solid var(--border); border-radius: 9px;
    font-family: var(--sans); font-size: 0.875rem; font-weight: 500;
    color: var(--text); cursor: pointer; transition: all 0.15s;
  }
  .uf-back-btn:hover { background: var(--surface2); border-color: #94a3b8; }
  .uf-title { font-size: 1.625rem; font-weight: 700; letter-spacing: -0.02em; }
  .uf-title span { color: var(--accent); }

  /* Form */
  .uf-form-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    animation: ufFadeUp 0.28s ease both;
  }

  .uf-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  @media (max-width: 640px) { .uf-form-grid { grid-template-columns: 1fr; } }
  .uf-form-full { grid-column: 1 / -1; }

  .uf-field { display: flex; flex-direction: column; gap: 0.375rem; }
  .uf-label {
    font-size: 0.8125rem; font-weight: 600; color: #475569;
    display: flex; align-items: center; gap: 0.25rem;
  }
  .uf-required { color: var(--red); }
  .uf-input, .uf-select {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text); font-family: var(--sans);
    font-size: 0.9375rem; padding: 0.65rem 0.875rem; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.15s;
  }
  .uf-input::placeholder, .uf-select::placeholder { color: var(--muted); font-size: 0.875rem; }
  .uf-input:focus, .uf-select:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: var(--surface);
  }
  .uf-input.error, .uf-select.error { border-color: var(--red); }
  .uf-select { cursor: pointer; }

  /* Password strength indicator */
  .uf-password-strength {
    display: flex; gap: 0.25rem; margin-top: 0.5rem;
  }
  .uf-strength-bar {
    flex: 1; height: 3px; border-radius: 2px; background: var(--border);
    transition: background 0.2s;
  }
  .uf-strength-bar.weak { background: var(--red); }
  .uf-strength-bar.medium { background: var(--yellow); }
  .uf-strength-bar.strong { background: var(--green); }

  /* Field validation */
  .uf-field-error {
    font-size: 0.75rem; color: var(--red); font-weight: 500;
    display: flex; align-items: center; gap: 0.25rem;
    margin-top: 0.25rem;
  }
  .uf-field-success {
    font-size: 0.75rem; color: var(--green); font-weight: 500;
    display: flex; align-items: center; gap: 0.25rem;
    margin-top: 0.25rem;
  }

  /* Actions */
  .uf-actions {
    display: flex; gap: 0.75rem; margin-top: 2rem;
    padding-top: 1.5rem; border-top: 1px solid var(--border);
  }
  @media (max-width: 640px) { .uf-actions { flex-direction: column; } }

  .uf-btn {
    flex: 1; display: inline-flex; align-items: center; justify-content: center;
    gap: 0.5rem; padding: 0.75rem 1rem; border-radius: 9px;
    font-family: var(--sans); font-size: 0.875rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s; border: 1.5px solid transparent;
  }
  .uf-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .uf-btn-secondary {
    background: var(--surface); color: var(--text); border-color: var(--border);
  }
  .uf-btn-secondary:hover:not(:disabled) { background: var(--surface2); border-color: #94a3b8; }
  .uf-btn-primary {
    background: var(--accent); color: #fff; border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  }
  .uf-btn-primary:hover:not(:disabled) { background: var(--accent-h); box-shadow: 0 6px 16px rgba(37,99,235,0.32); }

  /* Loading spinner */
  @keyframes ufSpin { to { transform: rotate(360deg); } }
  .uf-spinner {
    width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff; border-radius: 50%;
    animation: ufSpin 0.7s linear infinite;
  }

  /* Animations */
  @keyframes ufFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconArrowLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconError = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;
  
  if (score <= 2) return { strength: 1, label: 'Faible' };
  if (score <= 3) return { strength: 2, label: 'Moyen' };
  return { strength: 3, label: 'Fort' };
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user',
  });

  // Field validation
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldSuccess, setFieldSuccess] = useState({});

  // Load user data for edit
  useEffect(() => {
    if (isEdit) {
      const loadUser = async () => {
        try {
          const response = await userService.getUserById(id);
          const user = response.data || response;
          setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            password_confirmation: '',
            role: user.role || 'user',
          });
        } catch (err) {
          setError(err.response?.data?.message || 'Erreur lors du chargement de l\'utilisateur');
        } finally {
          setLoading(false);
        }
      };

      loadUser();
    }
  }, [id, isEdit]);

  // Handle input change
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors for this field
    setFieldErrors(prev => ({ ...prev, [field]: null }));
    setFieldSuccess(prev => ({ ...prev, [field]: null }));

    // Real-time validation
    if (field === 'email') {
      if (value && !validateEmail(value)) {
        setFieldErrors(prev => ({ ...prev, email: 'Format d\'email invalide' }));
      } else if (value && validateEmail(value)) {
        setFieldSuccess(prev => ({ ...prev, email: 'Format valide' }));
      }
    }

    if (field === 'password_confirmation' && formData.password) {
      if (value && value !== formData.password) {
        setFieldErrors(prev => ({ ...prev, password_confirmation: 'Les mots de passe ne correspondent pas' }));
      } else if (value && value === formData.password) {
        setFieldSuccess(prev => ({ ...prev, password_confirmation: 'Les mots de passe correspondent' }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!isEdit && !formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password && formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.role) {
      errors.role = 'Le rôle est requis';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
      };

      // Only include password if it's provided (for edit)
      if (formData.password) {
        submitData.password = formData.password;
        submitData.password_confirmation = formData.password_confirmation;
      }

      if (isEdit) {
        await userService.updateUser(id, submitData);
        success('Utilisateur mis à jour avec succès');
      } else {
        await userService.createUser(submitData);
        success('Utilisateur créé avec succès');
      }

      navigate('/utilisateurs');
    } catch (err) {
      if (err.response?.data?.errors) {
        // Laravel validation errors
        const apiErrors = err.response.data.errors;
        const formattedErrors = {};
        Object.keys(apiErrors).forEach(key => {
          formattedErrors[key] = apiErrors[key][0];
        });
        setFieldErrors(formattedErrors);
        showError('Corrigez les erreurs dans le formulaire');
      } else {
        showError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Password strength
  const passwordStrength = getPasswordStrength(formData.password);

  if (loading) return <Loading text="Chargement de l'utilisateur..." />;
  if (error) return <ErrorMessage message={error} variant="error" />;

  return (
    <>
      <style>{STYLES}</style>
      <div className="uf-root">
        <div className="uf-container">

          {/* Header */}
          <header className="uf-header">
            <button className="uf-back-btn" onClick={() => navigate('/utilisateurs')}>
              <IconArrowLeft />
              Retour
            </button>
            <h1 className="uf-title">
              {isEdit ? <>Modifier l'<span>Utilisateur</span></> : <>Nouvel <span>Utilisateur</span></>}
            </h1>
          </header>

          {/* Form */}
          <div className="uf-form-card">
            <form onSubmit={handleSubmit} noValidate>
              <div className="uf-form-grid">

                {/* Name */}
                <div className="uf-field">
                  <label className="uf-label">
                    Nom <span className="uf-required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`uf-input ${fieldErrors.name ? 'error' : ''}`}
                    value={formData.name}
                    onChange={handleChange('name')}
                    placeholder="Nom complet"
                    autoFocus
                    required
                  />
                  {fieldErrors.name && (
                    <div className="uf-field-error">
                      <IconError /> {fieldErrors.name}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="uf-field">
                  <label className="uf-label">
                    Email <span className="uf-required">*</span>
                  </label>
                  <input
                    type="email"
                    className={`uf-input ${fieldErrors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="email@exemple.com"
                    required
                  />
                  {fieldErrors.email && (
                    <div className="uf-field-error">
                      <IconError /> {fieldErrors.email}
                    </div>
                  )}
                  {fieldSuccess.email && (
                    <div className="uf-field-success">
                      <IconCheck /> {fieldSuccess.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="uf-field">
                  <label className="uf-label">
                    Mot de passe {!isEdit && <span className="uf-required">*</span>}
                  </label>
                  <input
                    type="password"
                    className={`uf-input ${fieldErrors.password ? 'error' : ''}`}
                    value={formData.password}
                    onChange={handleChange('password')}
                    placeholder={isEdit ? 'Laisser vide pour ne pas modifier' : '••••••••'}
                    required={!isEdit}
                  />
                  {fieldErrors.password && (
                    <div className="uf-field-error">
                      <IconError /> {fieldErrors.password}
                    </div>
                  )}
                  {formData.password && (
                    <>
                      <div className="uf-password-strength">
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className={`uf-strength-bar ${
                              i <= passwordStrength.strength 
                                ? passwordStrength.strength === 1 ? 'weak' 
                                : passwordStrength.strength === 2 ? 'medium' 
                                : 'strong'
                                : ''
                            }`}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                        Force: {passwordStrength.label}
                      </div>
                    </>
                  )}
                </div>

                {/* Password Confirmation */}
                <div className="uf-field">
                  <label className="uf-label">
                    Confirmer le mot de passe {!isEdit && <span className="uf-required">*</span>}
                  </label>
                  <input
                    type="password"
                    className={`uf-input ${fieldErrors.password_confirmation ? 'error' : ''}`}
                    value={formData.password_confirmation}
                    onChange={handleChange('password_confirmation')}
                    placeholder="••••••••"
                    required={!isEdit}
                  />
                  {fieldErrors.password_confirmation && (
                    <div className="uf-field-error">
                      <IconError /> {fieldErrors.password_confirmation}
                    </div>
                  )}
                  {fieldSuccess.password_confirmation && (
                    <div className="uf-field-success">
                      <IconCheck /> {fieldSuccess.password_confirmation}
                    </div>
                  )}
                </div>

                {/* Role */}
                <div className="uf-field uf-form-full">
                  <label className="uf-label">
                    Rôle <span className="uf-required">*</span>
                  </label>
                  <select
                    className={`uf-select ${fieldErrors.role ? 'error' : ''}`}
                    value={formData.role}
                    onChange={handleChange('role')}
                    required
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                  {fieldErrors.role && (
                    <div className="uf-field-error">
                      <IconError /> {fieldErrors.role}
                    </div>
                  )}
                </div>

              </div>

              {/* Actions */}
              <div className="uf-actions">
                <button
                  type="button"
                  className="uf-btn uf-btn-secondary"
                  onClick={() => navigate('/utilisateurs')}
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="uf-btn uf-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="uf-spinner" />
                      {isEdit ? 'Mise à jour...' : 'Création...'}
                    </>
                  ) : (
                    isEdit ? 'Mettre à jour' : 'Créer l\'utilisateur'
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </>
  );
};

export default UserForm;
