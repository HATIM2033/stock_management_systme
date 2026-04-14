import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import venteService from '../../services/venteService';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { useToast } from '../../components/Common/Toast';
import { useAuth } from '../../context/AuthContext'; // ✅ ADDED

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' DH';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

const getProductImage = (product) => {
  const img = product.image || product.image_url || product.photo || product.photo_url || product.image_path;
  return img?.trim()
    ? `http://localhost:8000/storage/${img}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(product.nom || 'P')}&background=2563eb&color=fff&size=400&bold=true`;
};

const stockInfo = (qty, seuil) => {
  if (qty === 0)       return { text: 'Rupture de stock', dot: '#dc2626', cls: 'pd-badge-red'    };
  if (qty < seuil)     return { text: 'Stock faible',     dot: '#d97706', cls: 'pd-badge-yellow' };
  return                      { text: 'Disponible',       dot: '#16a34a', cls: 'pd-badge-green'  };
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .pd-root {
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
  .pd-root *, .pd-root *::before, .pd-root *::after { box-sizing: border-box; }
  .pd-container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }

  /* Header */
  .pd-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .pd-back-wrap { display: flex; align-items: center; gap: 0.75rem; }
  .pd-back-btn {
    width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--border);
    background: var(--surface); display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: all 0.15s;
  }
  .pd-back-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .pd-title { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
  .pd-ref { font-size: 0.75rem; color: var(--muted); font-family: var(--mono); margin-top: 0.15rem; }
  .pd-header-actions { display: flex; gap: 0.625rem; }
  .pd-btn-edit {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.6rem 1rem; border: 1px solid var(--border); border-radius: 9px;
    background: var(--surface); color: var(--text); font-family: var(--sans);
    font-size: 0.875rem; font-weight: 500; cursor: pointer; text-decoration: none;
    transition: all 0.15s;
  }
  .pd-btn-edit:hover { border-color: var(--yellow); color: var(--yellow); background: var(--yellow-light); }
  .pd-btn-del {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.6rem 1rem; border: 1.5px solid #fecaca; border-radius: 9px;
    background: var(--red-light); color: var(--red); font-family: var(--sans);
    font-size: 0.875rem; font-weight: 600; cursor: pointer;
    transition: all 0.15s;
  }
  .pd-btn-del:hover { background: var(--red); color: #fff; border-color: var(--red); }

  /* Card */
  .pd-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 1.75rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    animation: pdFadeUp 0.28s ease both;
  }
  .pd-card:nth-child(2) { animation-delay: 0.05s; }
  .pd-card:nth-child(3) { animation-delay: 0.1s; }
  .pd-card:nth-child(4) { animation-delay: 0.15s; }
  .pd-card-title {
    font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--muted); margin-bottom: 1.25rem;
  }

  /* Main product grid */
  .pd-main-grid { display: grid; grid-template-columns: 260px 1fr; gap: 2rem; }
  @media (max-width: 680px) { .pd-main-grid { grid-template-columns: 1fr; } }

  /* Image */
  .pd-img-wrap {
    aspect-ratio: 1; border-radius: 12px; overflow: hidden;
    background: var(--surface2); border: 1px solid var(--border);
  }
  .pd-img { width: 100%; height: 100%; object-fit: cover; }

  /* Info section */
  .pd-info { display: flex; flex-direction: column; gap: 1.5rem; }
  .pd-price { font-family: var(--mono); font-size: 2rem; font-weight: 500; color: var(--accent); letter-spacing: -0.03em; line-height: 1; }
  .pd-price-label { font-size: 0.75rem; color: var(--muted); margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }

  /* Badge */
  .pd-badge {
    display: inline-flex; align-items: center; gap: 0.35rem;
    padding: 0.3rem 0.7rem; border-radius: 20px;
    font-size: 0.75rem; font-weight: 600;
  }
  .pd-badge-dot { width: 6px; height: 6px; border-radius: 50%; }
  .pd-badge-green  { background: var(--green-light);  color: var(--green);  }
  .pd-badge-yellow { background: var(--yellow-light); color: var(--yellow); }
  .pd-badge-red    { background: var(--red-light);    color: var(--red);    }

  /* DL rows */
  .pd-dl { display: flex; flex-direction: column; gap: 0.6rem; }
  .pd-dl-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
  .pd-dl-label { color: var(--muted); }
  .pd-dl-val { font-weight: 500; color: var(--text); font-family: var(--mono); font-size: 0.8125rem; }
  .pd-dl-val.plain { font-family: var(--sans); font-size: 0.875rem; }
  .pd-divider { border: none; border-top: 1px solid var(--border); margin: 0.25rem 0; }

  /* Stock bar */
  .pd-stock-nums { display: flex; align-items: baseline; gap: 0.4rem; margin-bottom: 0.6rem; }
  .pd-stock-big { font-family: var(--mono); font-size: 2.25rem; font-weight: 500; letter-spacing: -0.03em; line-height: 1; }
  .pd-stock-unit { font-size: 0.875rem; color: var(--muted); }
  .pd-stock-track { height: 6px; background: var(--surface2); border-radius: 999px; overflow: hidden; margin-bottom: 0.5rem; }
  .pd-stock-fill { height: 100%; border-radius: 999px; transition: width 0.6s ease; }

  /* Description */
  .pd-desc { font-size: 0.9375rem; color: #334155; line-height: 1.7; }

  /* Quick actions */
  .pd-actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; }
  .pd-action-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
    padding: 0.75rem 1rem; border-radius: 10px; border: 1.5px solid transparent;
    font-family: var(--sans); font-size: 0.875rem; font-weight: 600; cursor: pointer;
    transition: all 0.15s;
  }
  .pd-action-blue   { background: var(--accent);       color: #fff;          box-shadow: 0 3px 10px rgba(37,99,235,0.2);   }
  .pd-action-blue:hover   { background: var(--accent-hover); box-shadow: 0 5px 14px rgba(37,99,235,0.3); }
  .pd-action-green  { background: var(--green);        color: #fff;          box-shadow: 0 3px 10px rgba(22,163,74,0.2);   }
  .pd-action-green:hover  { background: #15803d;       box-shadow: 0 5px 14px rgba(22,163,74,0.3); }
  .pd-action-ghost  { background: var(--surface2);     color: var(--text);   border-color: var(--border); }
  .pd-action-ghost:hover  { border-color: #94a3b8; background: #e2e8f0; }

  /* Sales table */
  .pd-table-wrap { border-radius: 10px; border: 1px solid var(--border); overflow: hidden; }
  .pd-table { width: 100%; border-collapse: collapse; }
  .pd-th {
    padding: 0.7rem 1rem; text-align: left; background: var(--surface2);
    font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--muted);
    border-bottom: 1px solid var(--border);
  }
  .pd-tr { border-bottom: 1px solid var(--border); transition: background 0.12s; }
  .pd-tr:last-child { border-bottom: none; }
  .pd-tr:hover { background: var(--surface2); }
  .pd-td { padding: 0.875rem 1rem; font-size: 0.875rem; }
  .pd-td-mono { font-family: var(--mono); font-size: 0.8125rem; }
  .pd-td-accent { font-family: var(--mono); color: var(--accent); font-weight: 500; }
  .pd-empty-sales {
    padding: 2.5rem 1rem; text-align: center;
    font-size: 0.875rem; color: var(--muted);
  }

  /* Delete modal */
  .pd-modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.45);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 50; padding: 1rem;
    animation: pdFadeIn 0.18s ease;
  }
  .pd-modal {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 18px; padding: 2rem; max-width: 380px; width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    animation: pdScaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1);
    position: relative;
  }
  .pd-modal-close {
    position: absolute; top: 1rem; right: 1rem;
    background: var(--surface2); border: none; border-radius: 50%;
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: background 0.15s, color 0.15s;
  }
  .pd-modal-close:hover { background: var(--red-light); color: var(--red); }
  .pd-modal-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--red-light); border: 1.5px solid #fecaca;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;
  }
  .pd-modal-title { font-size: 1.125rem; font-weight: 700; text-align: center; margin-bottom: 0.5rem; }
  .pd-modal-sub   { font-size: 0.875rem; color: var(--muted); text-align: center; line-height: 1.5; }
  .pd-modal-sub b { color: var(--text); font-weight: 600; }
  .pd-modal-btns  { display: flex; gap: 0.75rem; margin-top: 1.75rem; }
  .pd-modal-cancel {
    flex: 1; padding: 0.75rem; border: 1px solid var(--border); border-radius: 9px;
    background: transparent; color: var(--text); font-family: var(--sans);
    font-size: 0.875rem; font-weight: 500; cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .pd-modal-cancel:hover { background: var(--surface2); border-color: #94a3b8; }
  .pd-modal-confirm {
    flex: 1; padding: 0.75rem; border: none; border-radius: 9px;
    background: var(--red); color: #fff; font-family: var(--sans);
    font-size: 0.875rem; font-weight: 700; cursor: pointer;
    box-shadow: 0 4px 12px rgba(220,38,38,0.25);
    transition: background 0.15s, box-shadow 0.15s;
  }
  .pd-modal-confirm:hover { background: #b91c1c; }

  /* Animations */
  @keyframes pdFadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pdFadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pdScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBack  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconEdit  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IconX     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconWarn  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconCart  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IconHist  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

// ─── Main Component ────────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { user } = useAuth(); // ✅ ADDED
  const isAdmin = user?.role === 'admin'; // ✅ ADDED
  
  const showErrorRef = useRef(showError);
  useEffect(() => { showErrorRef.current = showError; }, [showError]);

  const [product, setProduct]       = useState(null);
  const [sales, setSales]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await productService.getProduct(id);
        if (!cancelled) setProduct(res?.data ?? res);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Erreur lors du chargement du produit');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    venteService.getVentesByProduct(id)
      .then(res => { if (!cancelled) setSales(res?.data ?? res ?? []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    try {
      await productService.deleteProduct(deleteModal.product.id);
      success('Produit supprimé avec succès');
      navigate('/produits');
    } catch (err) {
      showErrorRef.current(err.response?.data?.message ?? 'Erreur lors de la suppression');
    } finally {
      setDeleteModal({ isOpen: false, product: null });
    }
  };

  if (loading) return <Loading text="Chargement du produit…" />;
  if (error)   return <ErrorMessage message={error} variant="error" />;
  if (!product) return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', fontFamily: 'DM Sans, sans-serif' }}>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>Produit non trouvé</p>
      <button onClick={() => navigate('/produits')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
        ← Retour à la liste
      </button>
    </div>
  );

  const stock   = stockInfo(product.quantite_stock, product.seuil_alerte);
  const fillPct = product.seuil_alerte
    ? Math.min(100, Math.round((product.quantite_stock / (product.seuil_alerte * 3)) * 100))
    : Math.min(100, product.quantite_stock);
  const fillColor = stock.dot;

  return (
    <>
      <style>{STYLES}</style>
      <div className="pd-root">
        <div className="pd-container">

          {/* ── Header ── */}
          <header className="pd-header">
            <div className="pd-back-wrap">
              <button className="pd-back-btn" onClick={() => navigate('/produits')} aria-label="Retour">
                <IconBack />
              </button>
              <div>
                <h1 className="pd-title">{product.nom}</h1>
                <p className="pd-ref">Réf. #{String(product.id).padStart(6, '0')}</p>
              </div>
            </div>
            {/* ✅ Only show for admins */}
            {isAdmin && (
              <div className="pd-header-actions">
                <button className="pd-btn-edit" onClick={() => navigate(`/produits/${product.id}/edit`)}>
                  <IconEdit /> Modifier
                </button>
                <button className="pd-btn-del" onClick={() => setDeleteModal({ isOpen: true, product })}>
                  <IconTrash /> Supprimer
                </button>
              </div>
            )}
          </header>

          {/* ── Main info card ── */}
          <div className="pd-card">
            <div className="pd-main-grid">

              {/* Image */}
              <div className="pd-img-wrap">
                <img
                  src={getProductImage(product)}
                  alt={product.nom}
                  className="pd-img"
                  loading="lazy"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.nom)}&background=2563eb&color=fff&size=400&bold=true`; }}
                />
              </div>

              {/* Info */}
              <div className="pd-info">
                <div>
                  <p className="pd-price-label">Prix de vente</p>
                  <p className="pd-price">{fmt(product.prix)}</p>
                </div>

                <div>
                  <p className="pd-price-label">Stock</p>
                  <div className="pd-stock-nums">
                    <span className="pd-stock-big">{product.quantite_stock}</span>
                    <span className="pd-stock-unit">unités</span>
                    <span className={`pd-badge ${stock.cls}`} style={{ marginLeft: '0.5rem' }}>
                      <span className="pd-badge-dot" style={{ background: stock.dot }} />
                      {stock.text}
                    </span>
                  </div>
                  <div className="pd-stock-track">
                    <div className="pd-stock-fill" style={{ width: `${fillPct}%`, background: fillColor }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Seuil d'alerte : {product.seuil_alerte ?? '—'} unités</p>
                </div>

                <hr className="pd-divider" />

                <div className="pd-dl">
                  <div className="pd-dl-row">
                    <span className="pd-dl-label">Catégorie</span>
                    <span className="pd-dl-val plain">{product.categorie?.nom ?? 'N/A'}</span>
                  </div>
                  <div className="pd-dl-row">
                    <span className="pd-dl-label">Fournisseur</span>
                    <span className="pd-dl-val plain">{product.fournisseur?.nom ?? 'N/A'}</span>
                  </div>
                  <div className="pd-dl-row">
                    <span className="pd-dl-label">Créé le</span>
                    <span className="pd-dl-val">{fmtDate(product.created_at)}</span>
                  </div>
                  <div className="pd-dl-row">
                    <span className="pd-dl-label">Modifié le</span>
                    <span className="pd-dl-val">{fmtDate(product.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {product.description && (
              <>
                <hr className="pd-divider" style={{ margin: '1.5rem 0' }} />
                <p className="pd-card-title">Description</p>
                <p className="pd-desc">{product.description}</p>
              </>
            )}
          </div>

          {/* ✅ Only show for admins */}
          {isAdmin && (
            <div className="pd-card">
              <p className="pd-card-title">Actions rapides</p>
              <div className="pd-actions-grid">
                <button 
                  className="pd-action-btn pd-action-blue" 
                  onClick={() => navigate(`/produits/${product.id}/edit`)}
                >
                  <IconEdit /> Modifier
                </button>
                
                <button 
                  className="pd-action-btn pd-action-green" 
                  onClick={() => navigate('/ventes')}
                >
                  <IconCart /> Vendre ce produit
                </button>
                
                <button 
                  className="pd-action-btn pd-action-ghost" 
                  onClick={() => navigate('/ventes/history')}
                >
                  <IconHist /> Historique des ventes
                </button>
              </div>
            </div>
          )}

          {/* ── Sales history ── */}
          <div className="pd-card">
            <p className="pd-card-title">Dernières ventes de ce produit</p>
            <div className="pd-table-wrap">
              {sales.length === 0 ? (
                <div className="pd-empty-sales">Aucune vente enregistrée pour ce produit</div>
              ) : (
                <table className="pd-table">
                  <thead>
                    <tr>
                      {['Date', 'Quantité', 'Prix unitaire', 'Total', 'Statut'].map(h => (
                        <th key={h} className="pd-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale, i) => (
                      <tr key={sale.id ?? i} className="pd-tr">
                        <td className="pd-td pd-td-mono">{fmtDateTime(sale.date_vente ?? sale.created_at)}</td>
                        <td className="pd-td" style={{ fontWeight: 600 }}>{sale.quantite}</td>
                        <td className="pd-td pd-td-mono">{fmt(sale.prix_unitaire)}</td>
                        <td className="pd-td pd-td-accent">{fmt(sale.prix_total ?? sale.total)}</td>
                        <td className="pd-td">
                          <span className={`pd-badge ${sale.status === 'completed' ? 'pd-badge-green' : sale.status === 'cancelled' ? 'pd-badge-red' : 'pd-badge-yellow'}`}>
                            <span className="pd-badge-dot" style={{ background: sale.status === 'completed' ? '#16a34a' : sale.status === 'cancelled' ? '#dc2626' : '#d97706' }} />
                            {sale.status === 'completed' ? 'Complétée' : sale.status === 'cancelled' ? 'Annulée' : 'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Delete Modal ── */}
      {deleteModal.isOpen && (
        <div className="pd-modal-backdrop" role="dialog" aria-modal="true">
          <div style={{backgroundColor: "#ffffffff"}} className="pd-modal">
            <button className="pd-modal-close" onClick={() => setDeleteModal({ isOpen: false, product: null })} aria-label="Fermer">
              <IconX />
            </button>
            <div className="pd-modal-icon"><IconWarn /></div>
            <p className="pd-modal-title">Confirmer la suppression</p>
            <p className="pd-modal-sub">
              Voulez-vous vraiment supprimer <b>« {deleteModal.product?.nom} »</b> ?<br />
              Cette action est irréversible.
            </p>
            <div className="pd-modal-btns">
              <button className="pd-modal-cancel" onClick={() => setDeleteModal({ isOpen: false, product: null })} style={{flex: 1,padding: "10px 20px",borderRadius: "8px",border: "1.5px solid #d1d5db",backgroundColor: "#ffffff",color: "#374151",fontWeight: "600",cursor: "pointer",fontSize: "14px",}}>Annuler</button>
              <button className="pd-modal-confirm" onClick={handleDelete} style={{ color: "#000000ff" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetail;