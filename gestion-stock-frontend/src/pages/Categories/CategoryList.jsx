import React, { useState, useEffect, useRef, useCallback } from 'react';
import categoryService from '../../services/categoryService';
import { useToast } from '../../components/Common/Toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PALETTE = [
  '#2563eb','#16a34a','#d97706','#7c3aed','#db2777','#0891b2','#ea580c','#65a30d',
];
const getColor = (str) => PALETTE[(str?.charCodeAt(0) ?? 0) % PALETTE.length];
const getInitials = (nom) => (nom ?? '?').slice(0, 2).toUpperCase();

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .cl-root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --surface2: #f1f5f9;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --accent-light: #eff6ff;
    --green: #16a34a; --green-light: #f0fdf4;
    --yellow: #d97706; --yellow-light: #fffbeb;
    --red: #dc2626;   --red-light: #fef2f2;
    --mono: 'DM Mono', monospace;
    --sans: 'DM Sans', sans-serif;
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 2.5rem 1rem;
  }
  .cl-root *, .cl-root *::before, .cl-root *::after { box-sizing: border-box; }
  .cl-container { max-width: 1100px; margin: 0 auto; }

  /* Header */
  .cl-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
  .cl-title { font-size: 1.625rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
  .cl-title span { color: var(--accent); }
  .cl-subtitle { font-size: 0.8125rem; color: var(--muted); margin-top: 0.35rem; }
  .cl-add-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.65rem 1.1rem; background: var(--accent); color: #fff;
    border: none; border-radius: 9px; font-family: var(--sans);
    font-size: 0.875rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 4px 12px rgba(37,99,235,0.2);
    transition: background 0.15s, box-shadow 0.15s;
  }
  .cl-add-btn:hover { background: var(--accent-hover); box-shadow: 0 6px 16px rgba(37,99,235,0.3); }

  /* Grid */
  .cl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.125rem;
  }

  /* Card */
  .cl-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
    animation: clFadeUp 0.25s ease both;
    display: flex; flex-direction: column;
  }
  .cl-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.09); transform: translateY(-2px); border-color: #cbd5e1; }

  /* Card top strip */
  .cl-card-strip { height: 6px; width: 100%; }

  /* Card body */
  .cl-card-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; gap: 0.875rem; }

  /* Avatar + info */
  .cl-card-top { display: flex; align-items: center; gap: 0.875rem; }
  .cl-avatar {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; font-weight: 700; color: #fff; flex-shrink: 0;
    letter-spacing: -0.02em;
  }
  .cl-card-name { font-size: 1rem; font-weight: 700; color: var(--text); line-height: 1.2; }
  .cl-card-count {
    display: inline-flex; align-items: center; gap: 0.25rem;
    font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem;
  }
  .cl-card-count-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--muted); opacity: 0.5; }

  /* Description */
  .cl-card-desc {
    font-size: 0.8125rem; color: var(--muted); line-height: 1.6;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    flex: 1;
  }
  .cl-card-desc-empty { font-size: 0.8125rem; color: var(--border); font-style: italic; flex: 1; }

  /* Actions */
  .cl-card-actions { display: flex; gap: 0.5rem; }
  .cl-btn {
    flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem;
    padding: 0.5rem; border-radius: 8px; font-family: var(--sans);
    font-size: 0.75rem; font-weight: 600; cursor: pointer;
    border: 1.5px solid transparent; transition: all 0.15s;
  }
  .cl-btn-edit   { background: var(--yellow-light); color: var(--yellow); border-color: #fde68a; }
  .cl-btn-edit:hover { background: var(--yellow); color: #fff; border-color: var(--yellow); }
  .cl-btn-del    { background: var(--red-light); color: var(--red); border-color: #fecaca; }
  .cl-btn-del:hover { background: var(--red); color: #fff; border-color: var(--red); }

  /* Empty */
  .cl-empty {
    grid-column: 1 / -1; padding: 4rem 1.5rem; text-align: center;
    background: var(--surface); border: 1px dashed var(--border); border-radius: 16px;
    color: var(--muted);
  }
  .cl-empty-icon { opacity: 0.18; display: flex; justify-content: center; margin-bottom: 0.875rem; }
  .cl-empty-title { font-size: 0.9375rem; font-weight: 600; color: var(--text); }
  .cl-empty-sub { font-size: 0.8125rem; color: var(--muted); margin-top: 0.25rem; }

  /* Modal backdrop */
  .cl-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.45);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 50; padding: 1rem;
    animation: clFadeIn 0.18s ease;
  }

  /* Modal */
  .cl-modal {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 18px; padding: 2rem; max-width: 420px; width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    animation: clScaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1);
    position: relative;
  }
  .cl-modal-close {
    position: absolute; top: 1rem; right: 1rem;
    background: var(--surface2); border: none; border-radius: 50%;
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: background 0.15s, color 0.15s;
  }
  .cl-modal-close:hover { background: var(--red-light); color: var(--red); }
  .cl-modal-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 1.5rem; }
  .cl-modal-title span { color: var(--accent); }

  /* Form fields */
  .cl-field { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
  .cl-label { font-size: 0.8125rem; font-weight: 600; color: #475569; }
  .cl-required { color: var(--red); }
  .cl-input, .cl-textarea {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text); font-family: var(--sans);
    font-size: 0.9375rem; padding: 0.7rem 0.875rem;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.15s;
  }
  .cl-input::placeholder, .cl-textarea::placeholder { color: var(--muted); font-size: 0.875rem; }
  .cl-input:focus, .cl-textarea:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: var(--surface);
  }
  .cl-textarea { resize: vertical; min-height: 90px; line-height: 1.6; }

  /* Modal footer */
  .cl-modal-footer { display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border); }
  .cl-modal-cancel {
    flex: 1; padding: 0.75rem; border: 1px solid var(--border); border-radius: 9px;
    background: transparent; color: var(--text); font-family: var(--sans);
    font-size: 0.875rem; font-weight: 500; cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .cl-modal-cancel:hover { background: var(--surface2); border-color: #94a3b8; }
  .cl-modal-submit {
    flex: 1; padding: 0.75rem; border: none; border-radius: 9px;
    background: var(--accent); color: #fff; font-family: var(--sans);
    font-size: 0.875rem; font-weight: 700; cursor: pointer;
    box-shadow: 0 4px 12px rgba(37,99,235,0.25);
    transition: background 0.15s, box-shadow 0.15s;
  }
  .cl-modal-submit:hover { background: var(--accent-hover); }

  /* Delete modal */
  .cl-del-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--red-light); border: 1.5px solid #fecaca;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;
  }
  .cl-del-title { font-size: 1.125rem; font-weight: 700; text-align: center; margin-bottom: 0.5rem; }
  .cl-del-sub   { font-size: 0.875rem; color: var(--muted); text-align: center; line-height: 1.5; }
  .cl-del-sub b { color: var(--text); font-weight: 600; }
  .cl-del-confirm {
    flex: 1; padding: 0.75rem; border: none; border-radius: 9px;
    background: var(--red); color: #fff; font-family: var(--sans);
    font-size: 0.875rem; font-weight: 700; cursor: pointer;
    box-shadow: 0 4px 12px rgba(220,38,38,0.25);
    transition: background 0.15s;
  }
  .cl-del-confirm:hover { background: #b91c1c; }

  /* Spinner */
  @keyframes clSpin { to { transform: rotate(360deg); } }
  .cl-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid #e2e8f0; border-top-color: var(--accent);
    animation: clSpin 0.7s linear infinite; margin: 6rem auto;
  }

  /* Animations */
  @keyframes clFadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes clFadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes clScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconPlus  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IconX     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconWarn  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconEmpty = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>;
const IconBox   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>;

// ─── Main ─────────────────────────────────────────────────────────────────────
const CategoryList = () => {
  const { success, error: showError } = useToast();
  const showErrorRef = useRef(showError);
  useEffect(() => { showErrorRef.current = showError; }, [showError]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
  const [formData, setFormData]     = useState({ nom: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAllCategories();
      setCategories(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      showErrorRef.current(err.response?.data?.message ?? 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => { setFormData({ nom: '', description: '' }); setEditingCat(null); setShowModal(true); };
  const openEdit = (cat) => { setFormData({ nom: cat.nom, description: cat.description ?? '' }); setEditingCat(cat); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingCat(null); setFormData({ nom: '', description: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) { showErrorRef.current('Le nom est requis'); return; }
    setSubmitting(true);
    try {
      if (editingCat) {
        await categoryService.updateCategory(editingCat.id, formData);
        success('Catégorie mise à jour avec succès');
      } else {
        await categoryService.createCategory(formData);
        success('Catégorie créée avec succès');
      }
      await fetchCategories();
      closeModal();
    } catch (err) {
      showErrorRef.current(err.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.category) return;
    try {
      await categoryService.deleteCategory(deleteModal.category.id);
      setCategories(c => c.filter(x => x.id !== deleteModal.category.id));
      success('Catégorie supprimée avec succès');
      setDeleteModal({ isOpen: false, category: null });
    } catch (err) {
      showErrorRef.current(err.response?.data?.message ?? 'Erreur lors de la suppression');
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="cl-root">
        <div className="cl-container">

          {/* Header */}
          <header className="cl-header">
            <div>
              <h1 className="cl-title">Gestion des <span>Catégories</span></h1>
              <p className="cl-subtitle">
                {loading ? '…' : `${categories.length} catégorie${categories.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button className="cl-add-btn" onClick={openAdd}>
              <IconPlus /> Ajouter une catégorie
            </button>
          </header>

          {/* Grid */}
          {loading ? (
            <div className="cl-spinner" />
          ) : (
            <div className="cl-grid">
              {categories.length === 0 ? (
                <div className="cl-empty">
                  <div className="cl-empty-icon"><IconEmpty /></div>
                  <p className="cl-empty-title">Aucune catégorie trouvée</p>
                  <p className="cl-empty-sub">Créez votre première catégorie pour organiser vos produits</p>
                </div>
              ) : categories.map((cat, i) => {
                const color = getColor(cat.nom);
                return (
                  <div key={cat.id} className="cl-card" style={{ animationDelay: `${i * 0.04}s` }}>
                    {/* Top color strip */}
                    <div className="cl-card-strip" style={{ background: color }} />

                    <div className="cl-card-body">
                      <div className="cl-card-top">
                        <div className="cl-avatar" style={{ background: color }}>
                          {getInitials(cat.nom)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="cl-card-name">{cat.nom}</p>
                          <div className="cl-card-count">
                            <IconBox />
                            <span>{cat.produits_count ?? 0} produit{(cat.produits_count ?? 0) !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>

                      {cat.description
                        ? <p className="cl-card-desc">{cat.description}</p>
                        : <p className="cl-card-desc-empty">Aucune description</p>
                      }

                      <div className="cl-card-actions">
                        <button className="cl-btn cl-btn-edit" onClick={() => openEdit(cat)}>
                          <IconEdit /> Modifier
                        </button>
                        <button className="cl-btn cl-btn-del" onClick={() => setDeleteModal({ isOpen: true, category: cat })}>
                          <IconTrash /> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="cl-backdrop" role="dialog" aria-modal="true">
          <div  style={{ backgroundColor:"#ffffff"}} className="cl-modal">
            <button className="cl-modal-close" onClick={closeModal}><IconX /></button>
            <h2 className="cl-modal-title">
              {editingCat ? <>Modifier la <span>catégorie</span></> : <>Nouvelle <span>catégorie</span></>}
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="cl-field">
                <label className="cl-label">Nom <span className="cl-required">*</span></label>
                <input
                  type="text" name="nom" className="cl-input"
                  value={formData.nom} autoFocus
                  onChange={e => setFormData(p => ({ ...p, nom: e.target.value }))}
                  placeholder="Ex: Informatique, Bureautique…"
                />
              </div>
              <div className="cl-field">
                <label className="cl-label">Description</label>
                <textarea
                  name="description" className="cl-textarea" rows={3}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Description de la catégorie…"
                />
              </div>
              <div className="cl-modal-footer">
                <button style={{flex: 1,padding: "10px 20px",borderRadius: "8px",border: "1.5px solid #d1d5db",backgroundColor: "#ffffff",color: "#374151",fontWeight: "600",cursor: "pointer",fontSize: "14px",}} type="button" className="cl-modal-cancel" onClick={closeModal}>Annuler</button>
                <button type="submit" className="cl-modal-submit" disabled={submitting} style={{ color: "#000000ff" }}>
                  {submitting ? 'Enregistrement…' : editingCat ? 'Mettre à jour' : 'Créer la catégorie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteModal.isOpen && (
        <div className="cl-backdrop" role="dialog" aria-modal="true">
          <div className="cl-modal" style={{ backgroundColor:"#ffffff"}}>
            <button className="cl-modal-close" onClick={() => setDeleteModal({ isOpen: false, category: null })}><IconX /></button>
            <div className="cl-del-icon"><IconWarn /></div>
            <p className="cl-del-title">Confirmer la suppression</p>
            <p className="cl-del-sub">
              Voulez-vous vraiment supprimer <b>« {deleteModal.category?.nom} »</b> ?<br />
              Cette action est irréversible.
            </p>
            <div className="cl-modal-footer">
              <button style={{flex: 1,padding: "10px 20px",borderRadius: "8px",border: "1.5px solid #d1d5db",backgroundColor: "#ffffff",color: "#374151",fontWeight: "600",cursor: "pointer",fontSize: "14px",}} className="cl-modal-cancel" onClick={() => setDeleteModal({ isOpen: false, category: null })}>Annuler</button>
              <button className="cl-del-confirm" onClick={handleDelete} style={{ color: "#000000ff" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryList;