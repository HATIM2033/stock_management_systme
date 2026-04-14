import React, { useState, useEffect, useRef, useCallback } from 'react';
import fournisseurService from '../../services/fournisseurService';
import { useToast } from '../../components/Common/Toast';

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = ['#2563eb','#16a34a','#d97706','#7c3aed','#db2777','#0891b2','#ea580c','#65a30d'];
const getColor    = (s) => PALETTE[(s?.charCodeAt(0) ?? 0) % PALETTE.length];
const getInitials = (n) => (n ?? '?').slice(0, 2).toUpperCase();

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .fl-root {
    --bg:#f8fafc; --surface:#fff; --surface2:#f1f5f9; --border:#e2e8f0;
    --text:#0f172a; --muted:#64748b;
    --accent:#2563eb; --accent-h:#1d4ed8; --accent-light:#eff6ff;
    --green:#16a34a; --green-light:#f0fdf4; --green-border:#bbf7d0;
    --yellow:#d97706; --yellow-light:#fffbeb; --yellow-border:#fde68a;
    --red:#dc2626;   --red-light:#fef2f2;   --red-border:#fecaca;
    --mono:'DM Mono',monospace; --sans:'DM Sans',sans-serif;
    font-family:var(--sans); background:var(--bg); color:var(--text);
    min-height:100vh; padding:2.5rem 1rem;
  }
  .fl-root *,.fl-root *::before,.fl-root *::after{box-sizing:border-box}
  .fl-container{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:1.5rem}

  /* Header */
  .fl-header{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1rem}
  .fl-title{font-size:1.625rem;font-weight:700;letter-spacing:-0.02em;line-height:1}
  .fl-title span{color:var(--accent)}
  .fl-subtitle{font-size:.8125rem;color:var(--muted);margin-top:.35rem}
  .fl-add-btn{
    display:inline-flex;align-items:center;gap:.4rem;
    padding:.65rem 1.1rem;background:var(--accent);color:#fff;
    border:none;border-radius:9px;font-family:var(--sans);
    font-size:.875rem;font-weight:600;cursor:pointer;
    box-shadow:0 4px 12px rgba(37,99,235,.2);
    transition:background .15s,box-shadow .15s;
  }
  .fl-add-btn:hover{background:var(--accent-h);box-shadow:0 6px 16px rgba(37,99,235,.3)}

  /* Search bar */
  .fl-search-row{display:flex;gap:.75rem;align-items:center}
  .fl-search-wrap{position:relative;flex:1;max-width:360px}
  .fl-search-icon{position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
  .fl-search{
    width:100%;background:var(--surface);border:1px solid var(--border);
    border-radius:9px;padding:.65rem .875rem .65rem 2.25rem;
    font-family:var(--sans);font-size:.875rem;color:var(--text);outline:none;
    transition:border-color .2s,box-shadow .2s;
  }
  .fl-search::placeholder{color:var(--muted)}
  .fl-search:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,.1)}
  .fl-result-count{font-size:.75rem;color:var(--muted);font-weight:500;white-space:nowrap}
  .fl-result-count b{color:var(--text)}

  /* Grid */
  .fl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.125rem}

  /* Card */
  .fl-card{
    background:var(--surface);border:1px solid var(--border);
    border-radius:16px;overflow:hidden;
    box-shadow:0 1px 4px rgba(0,0,0,.05);
    transition:box-shadow .2s,transform .2s,border-color .2s;
    display:flex;flex-direction:column;
    animation:flFadeUp .25s ease both;
  }
  .fl-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.09);transform:translateY(-2px);border-color:#cbd5e1}
  .fl-card-strip{height:5px;width:100%}
  .fl-card-body{padding:1.25rem;flex:1;display:flex;flex-direction:column;gap:1rem}

  /* Card header */
  .fl-card-head{display:flex;align-items:center;gap:.875rem}
  .fl-avatar{
    width:46px;height:46px;border-radius:11px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    font-size:.9375rem;font-weight:700;color:#fff;letter-spacing:-.02em;
  }
  .fl-card-name{font-size:1rem;font-weight:700;color:var(--text);line-height:1.2}
  .fl-card-produits{
    display:inline-flex;align-items:center;gap:.25rem;
    font-size:.7rem;color:var(--muted);margin-top:.2rem;
  }

  /* Info list */
  .fl-info{display:flex;flex-direction:column;gap:.5rem;flex:1}
  .fl-info-row{display:flex;align-items:flex-start;gap:.625rem}
  .fl-info-icon{color:var(--muted);flex-shrink:0;margin-top:.1rem}
  .fl-info-val{font-size:.8125rem;color:var(--text);line-height:1.4;word-break:break-all}
  .fl-info-val.muted{color:var(--muted);font-style:italic}

  /* Location chip */
  .fl-location-chip{
    display:inline-flex;align-items:center;gap:.35rem;
    background:var(--surface2);border:1px solid var(--border);
    border-radius:20px;padding:.25rem .65rem;
    font-size:.75rem;font-weight:500;color:var(--muted);
    font-family:var(--mono);
  }

  /* Actions */
  .fl-card-actions{display:flex;gap:.5rem}
  .fl-btn{
    flex:1;display:inline-flex;align-items:center;justify-content:center;gap:.3rem;
    padding:.5rem;border-radius:8px;font-family:var(--sans);
    font-size:.75rem;font-weight:600;cursor:pointer;
    border:1.5px solid transparent;transition:all .15s;
  }
  .fl-btn-edit{background:var(--yellow-light);color:var(--yellow);border-color:#fde68a}
  .fl-btn-edit:hover{background:var(--yellow);color:#fff;border-color:var(--yellow)}
  .fl-btn-del{background:var(--red-light);color:var(--red);border-color:#fecaca}
  .fl-btn-del:hover{background:var(--red);color:#fff;border-color:var(--red)}

  /* Empty */
  .fl-empty{
    grid-column:1/-1;padding:4rem 1.5rem;text-align:center;
    background:var(--surface);border:1px dashed var(--border);border-radius:16px;color:var(--muted);
  }
  .fl-empty-icon{opacity:.18;display:flex;justify-content:center;margin-bottom:.875rem}
  .fl-empty-title{font-size:.9375rem;font-weight:600;color:var(--text)}
  .fl-empty-sub{font-size:.8125rem;color:var(--muted);margin-top:.25rem}

  /* Modal backdrop */
  .fl-backdrop{
    position:fixed;inset:0;background:rgba(0,0,0,.45);
    backdrop-filter:blur(4px);display:flex;align-items:center;
    justify-content:center;z-index:50;padding:1rem;
    animation:flFadeIn .18s ease;
  }

  /* Modal */
  .fl-modal{
    background:var(--surface);border:1px solid var(--border);
    border-radius:18px;padding:2rem;max-width:560px;width:100%;
    max-height:90vh;overflow-y:auto;
    box-shadow:0 20px 60px rgba(0,0,0,.12);
    animation:flScaleIn .22s cubic-bezier(.34,1.56,.64,1);
    position:relative;
  }
  .fl-modal::-webkit-scrollbar{width:6px}
  .fl-modal::-webkit-scrollbar-track{background:transparent}
  .fl-modal::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}

  .fl-modal-close{
    position:absolute;top:1rem;right:1rem;
    background:var(--surface2);border:none;border-radius:50%;
    width:30px;height:30px;display:flex;align-items:center;justify-content:center;
    cursor:pointer;color:var(--muted);transition:background .15s,color .15s;
  }
  .fl-modal-close:hover{background:var(--red-light);color:var(--red)}
  .fl-modal-title{font-size:1.125rem;font-weight:700;margin-bottom:1.5rem}
  .fl-modal-title span{color:var(--accent)}

  /* Form */
  .fl-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:.875rem}
  @media(max-width:500px){.fl-form-grid{grid-template-columns:1fr}}
  .fl-form-full{grid-column:1/-1}
  .fl-field{display:flex;flex-direction:column;gap:.375rem}
  .fl-label{font-size:.8125rem;font-weight:600;color:#475569}
  .fl-required{color:var(--red)}
  .fl-section-title{
    font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
    color:var(--muted);grid-column:1/-1;
    padding-top:.5rem;border-top:1px solid var(--border);margin-top:.25rem;
  }
  .fl-section-title:first-child{border-top:none;padding-top:0;margin-top:0}
  .fl-input,.fl-textarea{
    width:100%;background:var(--surface2);border:1px solid var(--border);
    border-radius:9px;color:var(--text);font-family:var(--sans);
    font-size:.9375rem;padding:.65rem .875rem;outline:none;
    transition:border-color .2s,box-shadow .2s,background .15s;
  }
  .fl-input::placeholder,.fl-textarea::placeholder{color:var(--muted);font-size:.875rem}
  .fl-input:focus,.fl-textarea:focus{
    border-color:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,.1);background:var(--surface);
  }
  .fl-textarea{resize:vertical;min-height:80px;line-height:1.6}

  .fl-modal-footer{
    display:flex;gap:.75rem;margin-top:1.5rem;
    padding-top:1.25rem;border-top:1px solid var(--border);
  }
  .fl-modal-cancel{
    flex:1;padding:.75rem;border:1px solid var(--border);border-radius:9px;
    background:transparent;color:var(--text);font-family:var(--sans);
    font-size:.875rem;font-weight:500;cursor:pointer;
    transition:background .15s,border-color .15s;
  }
  .fl-modal-cancel:hover{background:var(--surface2);border-color:#94a3b8}
  .fl-modal-submit{
    flex:1;padding:.75rem;border:none;border-radius:9px;
    background:var(--accent);color:#fff;font-family:var(--sans);
    font-size:.875rem;font-weight:700;cursor:pointer;
    box-shadow:0 4px 12px rgba(37,99,235,.25);
    transition:background .15s,box-shadow .15s;
  }
  .fl-modal-submit:hover{background:var(--accent-h)}
  .fl-modal-submit:disabled{opacity:.6;cursor:not-allowed}

  /* Delete modal */
  .fl-del-icon{
    width:56px;height:56px;border-radius:50%;
    background:var(--red-light);border:1.5px solid #fecaca;
    display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;
  }
  .fl-del-title{font-size:1.125rem;font-weight:700;text-align:center;margin-bottom:.5rem}
  .fl-del-sub{font-size:.875rem;color:var(--muted);text-align:center;line-height:1.5}
  .fl-del-sub b{color:var(--text);font-weight:600}
  .fl-del-confirm{
    flex:1;padding:.75rem;border:none;border-radius:9px;
    background:var(--red);color:#fff;font-family:var(--sans);
    font-size:.875rem;font-weight:700;cursor:pointer;
    box-shadow:0 4px 12px rgba(220,38,38,.25);transition:background .15s;
  }
  .fl-del-confirm:hover{background:#b91c1c}

  /* Spinner */
  @keyframes flSpin{to{transform:rotate(360deg)}}
  .fl-spinner{
    width:40px;height:40px;border-radius:50%;
    border:3px solid #e2e8f0;border-top-color:var(--accent);
    animation:flSpin .7s linear infinite;margin:6rem auto;
  }

  /* Animations */
  @keyframes flFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes flFadeIn{from{opacity:0}to{opacity:1}}
  @keyframes flScaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconPlus  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IconX     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconWarn  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconEmpty = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IconPhone = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.98 1.18 2 2 0 012.96 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>;
const IconMail  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconPin   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconBox   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>;
const IconSearch= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

const EMPTY_FORM = { nom:'', telephone:'', email:'', adresse:'', ville:'', pays:'', code_postal:'' };

// ─── Main ─────────────────────────────────────────────────────────────────────
const FournisseurList = () => {
  const { success, error: showError } = useToast();
  const showErrorRef = useRef(showError);
  useEffect(() => { showErrorRef.current = showError; }, [showError]);

  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [editingF, setEditingF]         = useState(null);
  const [deleteModal, setDeleteModal]   = useState({ isOpen: false, fournisseur: null });
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [submitting, setSubmitting]     = useState(false);

  const fetchFournisseurs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fournisseurService.getAllFournisseurs();
      setFournisseurs(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      showErrorRef.current(err.response?.data?.message ?? 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFournisseurs(); }, [fetchFournisseurs]);

  const filtered = fournisseurs.filter(f =>
    !search.trim() ||
    f.nom?.toLowerCase().includes(search.toLowerCase()) ||
    f.ville?.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setFormData(EMPTY_FORM); setEditingF(null); setShowModal(true); };
  const openEdit = (f) => { setFormData({ nom:f.nom||'', telephone:f.telephone||'', email:f.email||'', adresse:f.adresse||'', ville:f.ville||'', pays:f.pays||'', code_postal:f.code_postal||'' }); setEditingF(f); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingF(null); setFormData(EMPTY_FORM); };
  const set = (k) => (e) => setFormData(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom.trim())   { showErrorRef.current('Le nom est requis'); return; }
    if (!formData.telephone.trim()) { showErrorRef.current('Le téléphone est requis'); return; }
    if (!formData.email.includes('@')) { showErrorRef.current("L'email n'est pas valide"); return; }
    setSubmitting(true);
    try {
      if (editingF) {
        await fournisseurService.updateFournisseur(editingF.id, formData);
        success('Fournisseur mis à jour avec succès');
      } else {
        await fournisseurService.createFournisseur(formData);
        success('Fournisseur créé avec succès');
      }
      await fetchFournisseurs();
      closeModal();
    } catch (err) {
      showErrorRef.current(err.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.fournisseur) return;
    try {
      await fournisseurService.deleteFournisseur(deleteModal.fournisseur.id);
      setFournisseurs(p => p.filter(f => f.id !== deleteModal.fournisseur.id));
      success('Fournisseur supprimé avec succès');
      setDeleteModal({ isOpen: false, fournisseur: null });
    } catch (err) {
      showErrorRef.current(err.response?.data?.message ?? 'Erreur lors de la suppression');
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="fl-root">
        <div className="fl-container">

          {/* Header */}
          <header className="fl-header">
            <div>
              <h1 className="fl-title">Gestion des <span>Fournisseurs</span></h1>
              <p className="fl-subtitle">{loading ? '…' : `${fournisseurs.length} fournisseur${fournisseurs.length !== 1 ? 's' : ''}`}</p>
            </div>
            <button className="fl-add-btn" onClick={openAdd}><IconPlus /> Ajouter un fournisseur</button>
          </header>

          {/* Search */}
          <div className="fl-search-row">
            <div className="fl-search-wrap">
              <span className="fl-search-icon"><IconSearch /></span>
              <input
                type="text" className="fl-search"
                placeholder="Rechercher par nom, ville, email…"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            {search && (
              <span className="fl-result-count"><b>{filtered.length}</b> résultat{filtered.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="fl-spinner" />
          ) : (
            <div className="fl-grid">
              {filtered.length === 0 ? (
                <div className="fl-empty">
                  <div className="fl-empty-icon"><IconEmpty /></div>
                  <p className="fl-empty-title">{search ? 'Aucun résultat' : 'Aucun fournisseur trouvé'}</p>
                  <p className="fl-empty-sub">{search ? `Aucun fournisseur ne correspond à "${search}"` : 'Ajoutez votre premier fournisseur pour commencer'}</p>
                </div>
              ) : filtered.map((f, i) => {
                const color = getColor(f.nom);
                return (
                  <div key={f.id} className="fl-card" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="fl-card-strip" style={{ background: color }} />
                    <div className="fl-card-body">

                      {/* Header */}
                      <div className="fl-card-head">
                        <div className="fl-avatar" style={{ background: color }}>{getInitials(f.nom)}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p className="fl-card-name">{f.nom}</p>
                          <div className="fl-card-produits">
                            <IconBox />
                            <span>{f.produits_count ?? 0} produit{(f.produits_count ?? 0) !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="fl-info">
                        {f.telephone && (
                          <div className="fl-info-row">
                            <span className="fl-info-icon"><IconPhone /></span>
                            <span className="fl-info-val">{f.telephone}</span>
                          </div>
                        )}
                        {f.email && (
                          <div className="fl-info-row">
                            <span className="fl-info-icon"><IconMail /></span>
                            <span className="fl-info-val">{f.email}</span>
                          </div>
                        )}
                        {f.adresse && (
                          <div className="fl-info-row">
                            <span className="fl-info-icon" style={{ marginTop:'.15rem' }}><IconPin /></span>
                            <span className="fl-info-val" style={{ WebkitLineClamp:2, display:'-webkit-box', WebkitBoxOrient:'vertical', overflow:'hidden' }}>{f.adresse}</span>
                          </div>
                        )}
                        {(f.ville || f.pays) && (
                          <div>
                            <span className="fl-location-chip">
                              <IconPin />
                              {[f.ville, f.pays].filter(Boolean).join(', ')}
                              {f.code_postal && ` — ${f.code_postal}`}
                            </span>
                          </div>
                        )}
                        {!f.telephone && !f.email && !f.adresse && !f.ville && (
                          <p className="fl-info-val muted">Aucune information de contact</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="fl-card-actions">
                        <button className="fl-btn fl-btn-edit" onClick={() => openEdit(f)}><IconEdit /> Modifier</button>
                        <button className="fl-btn fl-btn-del" onClick={() => setDeleteModal({ isOpen:true, fournisseur:f })}><IconTrash /> Supprimer</button>
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
        <div className="fl-backdrop" role="dialog" aria-modal="true">
          <div style={{backgroundColor: "#ffffffff"}}className="fl-modal">
            <button className="fl-modal-close" onClick={closeModal}><IconX /></button>
            <h2 className="fl-modal-title">
              {editingF ? <>Modifier le <span>fournisseur</span></> : <>Nouveau <span>fournisseur</span></>}
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="fl-form-grid">

                <span className="fl-section-title">Informations générales</span>

                <div className="fl-field fl-form-full">
                  <label className="fl-label">Nom de l'entreprise <span className="fl-required">*</span></label>
                  <input type="text" className="fl-input" value={formData.nom} onChange={set('nom')} placeholder="Ex: TechSupply Maroc" autoFocus />
                </div>

                <div className="fl-field">
                  <label className="fl-label">Téléphone <span className="fl-required">*</span></label>
                  <input type="tel" className="fl-input" value={formData.telephone} onChange={set('telephone')} placeholder="+212 6XX XXX XXX" />
                </div>

                <div className="fl-field">
                  <label className="fl-label">Email <span className="fl-required">*</span></label>
                  <input type="email" className="fl-input" value={formData.email} onChange={set('email')} placeholder="email@exemple.com" />
                </div>

                <span className="fl-section-title">Adresse</span>

                <div className="fl-field fl-form-full">
                  <label className="fl-label">Adresse</label>
                  <textarea className="fl-textarea" rows={2} value={formData.adresse} onChange={set('adresse')} placeholder="Rue, quartier…" />
                </div>

                <div className="fl-field">
                  <label className="fl-label">Ville</label>
                  <input type="text" className="fl-input" value={formData.ville} onChange={set('ville')} placeholder="Casablanca" />
                </div>

                <div className="fl-field">
                  <label className="fl-label">Code postal</label>
                  <input type="text" className="fl-input" value={formData.code_postal} onChange={set('code_postal')} placeholder="20000" />
                </div>

                <div className="fl-field fl-form-full">
                  <label className="fl-label">Pays</label>
                  <input type="text" className="fl-input" value={formData.pays} onChange={set('pays')} placeholder="Maroc" />
                </div>
              </div>

              <div className="fl-modal-footer">
                <button type="button" className="fl-modal-cancel" onClick={closeModal} style={{flex: 1,padding: "10px 20px",borderRadius: "8px",border: "1.5px solid #d1d5db",backgroundColor: "#ffffff",color: "#374151",fontWeight: "600",cursor: "pointer",fontSize: "14px",}}>Annuler</button>
                <button type="submit" className="fl-modal-submit" disabled={submitting} style={{ color: "#000000ff" }}>
                  {submitting ? 'Enregistrement…' : editingF ? 'Mettre à jour' : 'Créer le fournisseur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteModal.isOpen && (
        <div className="fl-backdrop" role="dialog" aria-modal="true">
          <div className="fl-modal" style={{ maxWidth: '380px', backgroundColor:"#ffffffff" }}>
            <button className="fl-modal-close" onClick={() => setDeleteModal({ isOpen:false, fournisseur:null })}><IconX /></button>
            <div className="fl-del-icon"><IconWarn /></div>
            <p className="fl-del-title">Confirmer la suppression</p>
            <p className="fl-del-sub">
              Voulez-vous vraiment supprimer <b>« {deleteModal.fournisseur?.nom} »</b> ?<br />
              Cette action est irréversible.
            </p>
            <div className="fl-modal-footer">
              <button style={{flex: 1,padding: "10px 20px",borderRadius: "8px",border: "1.5px solid #d1d5db",backgroundColor: "#ffffff",color: "#374151",fontWeight: "600",cursor: "pointer",fontSize: "14px",}} className="fl-modal-cancel" onClick={() => setDeleteModal({ isOpen:false, fournisseur:null })}>Annuler</button>
              <button className="fl-del-confirm" onClick={handleDelete} style={{ color: "#000000ff" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FournisseurList;