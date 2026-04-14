import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import fournisseurService from '../../services/fournisseurService';
import { useToast } from '../../components/Common/Toast';

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .pf-root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --surface2: #f1f5f9;
    --border: #e2e8f0;
    --border-focus: #2563eb;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --accent-light: #eff6ff;
    --green: #16a34a;
    --red: #dc2626; --red-light: #fef2f2;
    --yellow: #d97706; --yellow-light: #fffbeb;
    --mono: 'DM Mono', monospace;
    --sans: 'DM Sans', sans-serif;
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 2.5rem 1rem;
  }
  .pf-root *, .pf-root *::before, .pf-root *::after { box-sizing: border-box; }
  .pf-container { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 0; }

  /* Header */
  .pf-header { margin-bottom: 2rem; }
  .pf-back-wrap { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .pf-back-btn {
    width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--surface); display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: all 0.15s;
  }
  .pf-back-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .pf-title { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
  .pf-title span { color: var(--accent); }
  .pf-breadcrumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--muted); margin-top: 0.3rem; }
  .pf-breadcrumb a { color: var(--muted); text-decoration: none; transition: color 0.15s; }
  .pf-breadcrumb a:hover { color: var(--accent); }
  .pf-breadcrumb-sep { opacity: 0.4; }
  .pf-breadcrumb-cur { color: var(--text); font-weight: 500; }

  /* Form card */
  .pf-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }

  /* Sections */
  .pf-section { padding: 1.75rem; border-bottom: 1px solid var(--border); }
  .pf-section:last-child { border-bottom: none; }
  .pf-section-title {
    font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--muted); margin-bottom: 1.25rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .pf-section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* Grid */
  .pf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .pf-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
  @media (max-width: 640px) { .pf-grid-2, .pf-grid-3 { grid-template-columns: 1fr; } }

  /* Field */
  .pf-field { display: flex; flex-direction: column; gap: 0.375rem; }
  .pf-label {
    font-size: 0.8125rem; font-weight: 600; color: #475569;
    display: flex; align-items: center; gap: 0.25rem;
  }
  .pf-required { color: var(--red); font-size: 0.75rem; }
  .pf-input, .pf-select, .pf-textarea {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text); font-family: var(--sans);
    font-size: 0.9375rem; padding: 0.7rem 0.875rem;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.15s;
  }
  .pf-input::placeholder, .pf-textarea::placeholder { color: var(--muted); font-size: 0.875rem; }
  .pf-input:focus, .pf-select:focus, .pf-textarea:focus {
    border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    background: var(--surface);
  }
  .pf-input.error, .pf-select.error, .pf-textarea.error {
    border-color: var(--red); background: #fff8f8;
  }
  .pf-input.error:focus, .pf-select.error:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
  .pf-select {
    appearance: none; cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 0.875rem center;
    padding-right: 2.25rem;
  }
  .pf-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
  .pf-input-prefix-wrap { position: relative; }
  .pf-input-prefix {
    position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
    font-family: var(--mono); font-size: 0.875rem; color: var(--muted); pointer-events: none;
  }
  .pf-input-with-prefix { padding-left: 2.5rem; }
  .pf-err { font-size: 0.75rem; color: var(--red); display: flex; align-items: center; gap: 0.25rem; }

  /* Image upload */
  .pf-image-zone {
    display: flex; gap: 1.25rem; align-items: flex-start; flex-wrap: wrap;
  }
  .pf-image-preview {
    width: 100px; height: 100px; border-radius: 12px; overflow: hidden;
    border: 2px solid var(--border); flex-shrink: 0; background: var(--surface2);
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s;
  }
  .pf-image-preview.has-image { border-color: var(--accent); }
  .pf-image-preview img { width: 100%; height: 100%; object-fit: cover; }
  .pf-image-placeholder { opacity: 0.25; }
  .pf-drop-area {
    flex: 1; min-width: 200px; border: 2px dashed var(--border); border-radius: 12px;
    padding: 1.5rem 1rem; text-align: center; cursor: pointer;
    transition: border-color 0.2s, background 0.15s;
  }
  .pf-drop-area:hover, .pf-drop-area.dragover { border-color: var(--accent); background: var(--accent-light); }
  .pf-drop-area input { display: none; }
  .pf-drop-icon { opacity: 0.35; display: flex; justify-content: center; margin-bottom: 0.5rem; }
  .pf-drop-text { font-size: 0.875rem; font-weight: 500; color: var(--text); }
  .pf-drop-sub  { font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem; }
  .pf-drop-change { font-size: 0.75rem; color: var(--accent); margin-top: 0.4rem; text-decoration: underline; }

  /* Required note */
  .pf-note { font-size: 0.75rem; color: var(--muted); padding: 1rem 1.75rem; }

  /* Footer buttons */
  .pf-footer {
    padding: 1.5rem 1.75rem; background: var(--surface2);
    border-top: 1px solid var(--border);
    display: flex; gap: 0.75rem; justify-content: flex-end;
  }
  .pf-btn-cancel {
    padding: 0.75rem 1.5rem; border: 1px solid var(--border); border-radius: 9px;
    background: var(--surface); color: var(--text); font-family: var(--sans);
    font-size: 0.9rem; font-weight: 500; cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .pf-btn-cancel:hover { background: var(--surface2); border-color: #94a3b8; }
  .pf-btn-submit {
    padding: 0.75rem 2rem; border: none; border-radius: 9px;
    background: var(--accent); color: #fff; font-family: var(--sans);
    font-size: 0.9rem; font-weight: 700; cursor: pointer;
    box-shadow: 0 4px 12px rgba(37,99,235,0.25);
    transition: background 0.15s, box-shadow 0.15s;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .pf-btn-submit:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 6px 16px rgba(37,99,235,0.35); }
  .pf-btn-submit:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

  /* Spinner */
  @keyframes pfSpin { to { transform: rotate(360deg); } }
  .pf-spin { animation: pfSpin 0.7s linear infinite; display: inline-block; }
  @keyframes pfFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .pf-card { animation: pfFadeUp 0.25s ease both; }

  @keyframes pfSpin2 { to { transform: rotate(360deg); } }
  .pf-page-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid #e2e8f0; border-top-color: var(--accent);
    animation: pfSpin2 0.7s linear infinite;
    margin: 6rem auto;
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBack   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconCamera = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconImg    = () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconSpinner = () => <svg className="pf-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="50" strokeDashoffset="20" strokeLinecap="round"/></svg>;

// ─── Main Component ────────────────────────────────────────────────────────────
const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const isEdit = Boolean(id);

  const showErrorRef = useRef(showError);
  useEffect(() => { showErrorRef.current = showError; }, [showError]);

  const [formData, setFormData] = useState({
    nom: '', description: '', prix: '',
    quantite_stock: '', categorie_id: '',
    fournisseur_id: '', seuil_alerte: '', code_barre: '',
  });
  const [categories, setCategories]   = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [currentImage, setCurrentImage]   = useState(null);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchMeta = useCallback(async () => {
    try {
      const [catRes, fournRes] = await Promise.all([
        categoryService.getAllCategories(),
        fournisseurService.getAllFournisseurs(),
      ]);
      setCategories(Array.isArray(catRes?.data) ? catRes.data : Array.isArray(catRes) ? catRes : []);
      setFournisseurs(Array.isArray(fournRes?.data) ? fournRes.data : Array.isArray(fournRes) ? fournRes : []);
    } catch {
      showErrorRef.current('Erreur lors du chargement des données');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchMeta();
    if (!isEdit || !id) return;

    (async () => {
      setLoading(true);
      try {
        const data = await productService.getProduct(id);
        if (cancelled) return;
        const p = data?.data ?? data;
        if (!p) throw new Error('No data');
        setFormData({
          nom:            p.nom            ?? '',
          description:    p.description    ?? '',
          prix:           p.prix           ?? '',
          quantite_stock: p.quantite_stock ?? '',
          categorie_id:   p.categorie_id   ?? '',
          fournisseur_id: p.fournisseur_id ?? '',
          seuil_alerte:   p.seuil_alerte   ?? '',
          code_barre:     p.code_barre     ?? '',
        });
        if (p.image) setCurrentImage(`http://localhost:8000/storage/${p.image}`);
      } catch {
        if (!cancelled) {
          showErrorRef.current('Erreur lors du chargement du produit');
          setTimeout(() => navigate('/produits'), 2000);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isEdit, fetchMeta, navigate]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const processImageFile = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
      setErrors(p => ({ ...p, image: 'Format invalide (JPG, PNG, GIF uniquement)' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(p => ({ ...p, image: 'Taille max : 2MB' }));
      return;
    }
    setErrors(p => ({ ...p, image: '' }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setSelectedImage(file);
  };

  const validate = () => {
    const e = {};
    if (!formData.nom.trim())                                          e.nom            = 'Nom requis';
    if (!formData.prix || parseFloat(formData.prix) <= 0)             e.prix           = 'Prix doit être > 0';
    if (formData.quantite_stock === '' || parseInt(formData.quantite_stock) < 0) e.quantite_stock = 'Quantité invalide';
    if (!formData.categorie_id)                                        e.categorie_id   = 'Catégorie requise';
    if (!formData.fournisseur_id)                                      e.fournisseur_id = 'Fournisseur requis';
    if (!formData.seuil_alerte || parseInt(formData.seuil_alerte) < 1) e.seuil_alerte  = 'Seuil doit être ≥ 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { showErrorRef.current('Veuillez corriger les erreurs'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (selectedImage) fd.append('image', selectedImage);

      if (isEdit) {
        await productService.updateProduct(id, fd);
        success('Produit modifié avec succès');
      } else {
        await productService.createProduct(fd);
        success('Produit ajouté avec succès');
      }

      window.dispatchEvent(new Event('productUpdated'));
      localStorage.setItem('productListNeedsRefresh', 'true');
      setTimeout(() => navigate('/produits', { state: { refresh: true }, replace: true }), 900);
    } catch (err) {
      showErrorRef.current(err.response?.data?.message ?? err.response?.data?.error ?? "Erreur lors de l'enregistrement");
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <>
      <style>{STYLES}</style>
      <div className="pf-root"><div className="pf-page-spinner" /></div>
    </>
  );

  const previewSrc = imagePreview || currentImage;

  return (
    <>
      <style>{STYLES}</style>
      <div className="pf-root">
        <div className="pf-container">

          {/* ── Header ── */}
          <header className="pf-header">
            <div className="pf-back-wrap">
              <button className="pf-back-btn" onClick={() => navigate('/produits')} aria-label="Retour">
                <IconBack />
              </button>
              <div>
                <h1 className="pf-title">
                  {isEdit ? <>Modifier le <span>Produit</span></> : <>Ajouter un <span>Produit</span></>}
                </h1>
                <nav className="pf-breadcrumb" aria-label="Breadcrumb">
                  <a href="/dashboard">Dashboard</a>
                  <span className="pf-breadcrumb-sep">/</span>
                  <a href="/produits">Produits</a>
                  <span className="pf-breadcrumb-sep">/</span>
                  <span className="pf-breadcrumb-cur">{isEdit ? 'Modifier' : 'Ajouter'}</span>
                </nav>
              </div>
            </div>
          </header>

          {/* ── Form card ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="pf-card">

              {/* ── Section 1: Infos générales ── */}
              <div className="pf-section">
                <p className="pf-section-title">Informations générales</p>

                <div className="pf-field" style={{ marginBottom: '1rem' }}>
                  <label className="pf-label">Nom du produit <span className="pf-required">*</span></label>
                  <input
                    type="text" name="nom" className={`pf-input${errors.nom ? ' error' : ''}`}
                    value={formData.nom} onChange={handleChange}
                    placeholder="Ex: Laptop HP Pavilion"
                    autoFocus
                  />
                  {errors.nom && <p className="pf-err">⚠ {errors.nom}</p>}
                </div>

                <div className="pf-field">
                  <label className="pf-label">Description</label>
                  <textarea
                    name="description" className="pf-textarea"
                    value={formData.description} onChange={handleChange}
                    placeholder="Description détaillée du produit…"
                    rows={4}
                  />
                </div>
              </div>

              {/* ── Section 2: Prix & Stock ── */}
              <div className="pf-section">
                <p className="pf-section-title">Prix & Stock</p>
                <div className="pf-grid-3">

                  <div className="pf-field">
                    <label className="pf-label">Prix (DH) <span className="pf-required">*</span></label>
                    <div className="pf-input-prefix-wrap">
                      <span className="pf-input-prefix">DH</span>
                      <input
                        type="number" name="prix" min="0" step="0.01"
                        className={`pf-input pf-input-with-prefix${errors.prix ? ' error' : ''}`}
                        value={formData.prix} onChange={handleChange}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.prix && <p className="pf-err">⚠ {errors.prix}</p>}
                  </div>

                  <div className="pf-field">
                    <label className="pf-label">Quantité stock <span className="pf-required">*</span></label>
                    <input
                      type="number" name="quantite_stock" min="0"
                      className={`pf-input${errors.quantite_stock ? ' error' : ''}`}
                      value={formData.quantite_stock} onChange={handleChange}
                      placeholder="0"
                    />
                    {errors.quantite_stock && <p className="pf-err">⚠ {errors.quantite_stock}</p>}
                  </div>

                  <div className="pf-field">
                    <label className="pf-label">Seuil d'alerte <span className="pf-required">*</span></label>
                    <input
                      type="number" name="seuil_alerte" min="1"
                      className={`pf-input${errors.seuil_alerte ? ' error' : ''}`}
                      value={formData.seuil_alerte} onChange={handleChange}
                      placeholder="5"
                    />
                    {errors.seuil_alerte && <p className="pf-err">⚠ {errors.seuil_alerte}</p>}
                  </div>
                </div>
              </div>

              {/* ── Section 3: Catégorie & Fournisseur ── */}
              <div className="pf-section">
                <p className="pf-section-title">Classification</p>
                <div className="pf-grid-2">

                  <div className="pf-field">
                    <label className="pf-label">Catégorie <span className="pf-required">*</span></label>
                    <select
                      name="categorie_id"
                      className={`pf-select${errors.categorie_id ? ' error' : ''}`}
                      value={formData.categorie_id} onChange={handleChange}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                    {errors.categorie_id && <p className="pf-err">⚠ {errors.categorie_id}</p>}
                  </div>

                  <div className="pf-field">
                    <label className="pf-label">Fournisseur <span className="pf-required">*</span></label>
                    <select
                      name="fournisseur_id"
                      className={`pf-select${errors.fournisseur_id ? ' error' : ''}`}
                      value={formData.fournisseur_id} onChange={handleChange}
                    >
                      <option value="">Sélectionner un fournisseur</option>
                      {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                    </select>
                    {errors.fournisseur_id && <p className="pf-err">⚠ {errors.fournisseur_id}</p>}
                  </div>
                </div>
              </div>

              {/* ── Section 4: Code barre ── */}
              <div className="pf-section">
                <p className="pf-section-title">Identification</p>
                <div style={{ maxWidth: '320px' }}>
                  <div className="pf-field">
                    <label className="pf-label">Code barre</label>
                    <input
                      type="text" name="code_barre"
                      className="pf-input"
                      value={formData.code_barre} onChange={handleChange}
                      placeholder="Ex: 1234567890123"
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 5: Image ── */}
              <div className="pf-section">
                <p className="pf-section-title">Image du produit</p>
                <div className="pf-image-zone">

                  {/* Preview */}
                  <div className={`pf-image-preview${previewSrc ? ' has-image' : ''}`}>
                    {previewSrc
                      ? <img src={previewSrc} alt="Aperçu" />
                      : <span className="pf-image-placeholder"><IconImg /></span>
                    }
                  </div>

                  {/* Drop zone */}
                  <label
                    className={`pf-drop-area${dragOver ? ' dragover' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); processImageFile(e.dataTransfer.files[0]); }}
                  >
                    <input type="file" accept="image/*" onChange={e => processImageFile(e.target.files[0])} />
                    <div className="pf-drop-icon"><IconCamera /></div>
                    <p className="pf-drop-text">
                      {previewSrc
                        ? isEdit ? "Changer l'image" : 'Changer l\'aperçu'
                        : 'Glisser-déposer ou cliquer'}
                    </p>
                    <p className="pf-drop-sub">PNG, JPG, GIF — max 2MB</p>
                    {previewSrc && <p className="pf-drop-change">Choisir un autre fichier</p>}
                  </label>
                </div>
                {errors.image && <p className="pf-err" style={{ marginTop: '0.5rem' }}>⚠ {errors.image}</p>}
              </div>

              {/* Required note */}
              <p className="pf-note"><span style={{ color: 'var(--red)' }}>*</span> Champs obligatoires</p>

              {/* ── Footer ── */}
              <div className="pf-footer">
                <button type="button" className="pf-btn-cancel" onClick={() => navigate('/produits')}>
                  Annuler
                </button>
                <button type="submit" className="pf-btn-submit" disabled={submitting}>
                  {submitting
                    ? <><IconSpinner /> Enregistrement…</>
                    : isEdit ? 'Enregistrer les modifications' : 'Ajouter le produit'
                  }
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProductForm;