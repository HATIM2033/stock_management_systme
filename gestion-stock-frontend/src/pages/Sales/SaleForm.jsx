import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import venteService from '../../services/venteService';
import { useToast } from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_RESULTS = 5;
const LOW_STOCK = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' DH';

const imgSrc = (p) =>
  p.image
    ? `http://localhost:8000/storage/${p.image}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nom)}&background=3b82f6&color=fff&size=80&bold=true`;

const stockInfo = (qty) => {
  if (qty === 0) return { text: 'Rupture', dot: '#ef4444' };
  if (qty <= LOW_STOCK) return { text: `${qty} restant${qty > 1 ? 's' : ''}`, dot: '#f59e0b' };
  return { text: `${qty} en stock`, dot: '#22c55e' };
};

// ─── CSS injected once ────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .sf-root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --surface2: #f1f5f9;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --green: #16a34a;
    --red: #dc2626;
    --mono: 'DM Mono', monospace;
    --sans: 'DM Sans', sans-serif;
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 2.5rem 1rem;
  }

  .sf-root *, .sf-root *::before, .sf-root *::after { box-sizing: border-box; }
  .sf-container { max-width: 960px; margin: 0 auto; }

  /* Header */
  .sf-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 2rem; }
  .sf-title { font-size: 1.625rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
  .sf-title span { color: var(--accent); }
  .sf-subtitle { font-size: 0.8125rem; color: var(--muted); margin-top: 0.375rem; }
  .sf-hist-link { font-size: 0.8125rem; color: var(--accent); text-decoration: none; opacity: 0.85; cursor: pointer; transition: opacity 0.15s; }
  .sf-hist-link:hover { opacity: 1; }

  /* Layout */
  .sf-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
  @media (min-width: 768px) { .sf-grid { grid-template-columns: 3fr 2fr; } }
  .sf-col-left { display: flex; flex-direction: column; gap: 1.25rem; }
  .sf-col-right { display: flex; flex-direction: column; gap: 1.25rem; }
  .sf-sticky { position: sticky; top: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

  /* Card */
  .sf-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    transition: border-color 0.2s;
  }
  .sf-card-label {
    font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--muted); margin-bottom: 1rem;
  }

  /* Search */
  .sf-search-wrap { position: relative; }
  .sf-search-icon {
    position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
    color: var(--muted); pointer-events: none; width: 1rem; height: 1rem;
  }
  .sf-search-clear {
    position: absolute; right: 0.875rem; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: var(--muted);
    padding: 0; line-height: 0; transition: color 0.15s;
  }
  .sf-search-clear:hover { color: var(--text); }
  .sf-input {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text); font-family: var(--sans);
    font-size: 0.9375rem; padding: 0.75rem 2.5rem;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .sf-input::placeholder { color: var(--muted); }
  .sf-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }

  /* Results list */
  .sf-results {
    margin-top: 0.75rem; border-radius: 10px;
    border: 1px solid var(--border); overflow: hidden;
    max-height: 320px; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: var(--surface2) transparent;
  }
  .sf-result-item {
    display: flex; align-items: center; gap: 0.875rem;
    padding: 0.75rem 1rem; cursor: pointer;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
    animation: fadeSlide 0.18s ease both;
  }
  .sf-result-item:last-child { border-bottom: none; }
  .sf-result-item:hover { background: var(--surface2); }
  .sf-result-img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
  .sf-result-name { font-size: 0.875rem; font-weight: 500; }
  .sf-result-stock { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem; }
  .sf-stock-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .sf-result-price { font-family: var(--mono); font-size: 0.875rem; font-weight: 500; color: var(--accent); margin-left: auto; white-space: nowrap; }
  .sf-empty { padding: 2.5rem 1rem; text-align: center; font-size: 0.875rem; color: var(--muted); }

  /* Selected product */
  .sf-selected { display: flex; gap: 1rem; align-items: flex-start; }
  .sf-selected-img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; flex-shrink: 0; border: 1px solid var(--border); }
  .sf-selected-name { font-size: 1rem; font-weight: 600; }
  .sf-selected-unit { font-family: var(--mono); font-size: 0.8125rem; color: var(--accent); margin-top: 0.2rem; }
  .sf-selected-stock { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: var(--muted); margin-top: 0.5rem; }
  .sf-clear-btn {
    margin-left: auto; background: none; border: none; cursor: pointer;
    color: var(--muted); padding: 0.25rem; line-height: 0; border-radius: 6px;
    transition: color 0.15s, background 0.15s;
  }
  .sf-clear-btn:hover { color: var(--red); background: rgba(239,68,68,0.1); }

  /* Quantity stepper */
  .sf-qty-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin: 1.1rem 0 0.5rem; }
  .sf-qty-wrap { display: flex; align-items: center; }
  .sf-qty-btn {
    width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); cursor: pointer; font-size: 1.1rem; line-height: 1;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .sf-qty-btn:first-child { border-radius: 8px 0 0 8px; }
  .sf-qty-btn:last-child { border-radius: 0 8px 8px 0; }
  .sf-qty-btn:hover:not(:disabled) { background: var(--accent); color: #fff; border-color: var(--accent); }
  .sf-qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .sf-qty-input {
    width: 52px; height: 36px; text-align: center;
    background: var(--surface2); border: 1px solid var(--border);
    border-left: none; border-right: none;
    color: var(--text); font-family: var(--mono); font-size: 0.9375rem; font-weight: 500;
    outline: none; transition: background 0.15s;
  }
  .sf-qty-input:focus { background: var(--surface); }
  .sf-qty-input::-webkit-inner-spin-button,
  .sf-qty-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .sf-qty-input[type=number] { -moz-appearance: textfield; }

  /* Error */
  .sf-err { font-size: 0.75rem; color: var(--red); margin-top: 0.5rem; }

  /* Empty placeholder */
  .sf-placeholder {
    background: var(--surface); border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 14px; padding: 3rem 1.5rem;
    text-align: center; color: var(--muted); font-size: 0.875rem;
  }
  .sf-placeholder-icon { opacity: 0.2; margin-bottom: 0.75rem; display: flex; justify-content: center; }

  /* Summary */
  .sf-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
  .sf-row-label { font-size: 0.8125rem; color: var(--muted); }
  .sf-row-val { font-size: 0.8125rem; font-family: var(--mono); font-weight: 500; }
  .sf-divider { border: none; border-top: 1px solid var(--border); margin: 1rem 0; }
  .sf-total-row { display: flex; justify-content: space-between; align-items: baseline; }
  .sf-total-label { font-size: 0.9375rem; font-weight: 700; }
  .sf-total-val { font-family: var(--mono); font-size: 1.5rem; font-weight: 500; color: var(--accent); letter-spacing: -0.02em; }
  .sf-discount-val { color: var(--green); }

  /* Discount input */
  .sf-discount-wrap { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  .sf-discount-input {
    flex: 1; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text); font-family: var(--mono);
    font-size: 0.9rem; padding: 0.625rem 0.75rem;
    outline: none; transition: border-color 0.2s;
  }
  .sf-discount-input::placeholder { color: var(--muted); font-family: var(--sans); }
  .sf-discount-input:focus { border-color: var(--accent); }
  .sf-discount-select {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text); font-family: var(--mono);
    font-size: 0.875rem; padding: 0 0.75rem;
    outline: none; cursor: pointer; appearance: none;
    text-align: center; width: 58px; transition: border-color 0.2s;
  }
  .sf-discount-select:focus { border-color: var(--accent); }

  /* Buttons */
  .sf-btn-primary {
    width: 100%; padding: 0.9rem; border: none; border-radius: 10px;
    background: var(--accent); color: #fff;
    font-family: var(--sans); font-size: 0.9375rem; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
    box-shadow: 0 4px 16px rgba(37,99,235,0.25);
  }
  .sf-btn-primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 6px 20px rgba(37,99,235,0.35); }
  .sf-btn-primary:active:not(:disabled) { transform: translateY(1px); }
  .sf-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
  .sf-btn-secondary {
    width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 10px;
    background: transparent; color: var(--muted);
    font-family: var(--sans); font-size: 0.875rem; font-weight: 500;
    cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .sf-btn-secondary:hover { border-color: #94a3b8; color: var(--text); background: var(--surface2); }

  /* Modal */
  .sf-modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.45);
    backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 1rem;
    animation: fadeIn 0.2s ease;
  }
  .sf-modal {
    background: transparent; border: none;
    border-radius: 18px; padding: 2rem; max-width: 380px; width: 100%;
    animation: scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }
  .sf-modal-icon {
    width: 60px; height: 60px; border-radius: 50%;
    background: rgba(34,197,94,0.12); border: 1.5px solid rgba(34,197,94,0.3);
    display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;
  }
  .sf-modal-title { font-size: 1.125rem; font-weight: 700; text-align: center; }
  .sf-modal-sub { font-size: 0.8125rem; color: var(--muted); text-align: center; margin-top: 0.25rem; }
  .sf-modal-details {
    background: var(--surface2); border-radius: 10px; padding: 1rem 1.25rem;
    margin: 1.25rem 0; border: 1px solid var(--border);
  }
  .sf-modal-row { display: flex; justify-content: space-between; padding: 0.3rem 0; font-size: 0.8125rem; }
  .sf-modal-row-label { color: var(--muted); }
  .sf-modal-row-val { font-family: var(--mono); font-weight: 500; }
  .sf-modal-row-val.accent { color: var(--accent); }
  .sf-modal-btns { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
  .sf-modal-btn-green {
    flex: 1; padding: 0.75rem; border: none; border-radius: 9px;
    background: var(--green); color: #fff; font-family: var(--sans); font-size: 0.875rem; font-weight: 700;
    cursor: pointer; transition: opacity 0.15s;
  }
  .sf-modal-btn-green:hover { opacity: 0.88; }
  .sf-modal-btn-outline {
    flex: 1; padding: 0.75rem; border: 1px solid var(--border); border-radius: 9px;
    background: transparent; color: var(--text); font-family: var(--sans); font-size: 0.875rem; font-weight: 500;
    cursor: pointer; transition: border-color 0.15s, background 0.15s;
  }
  .sf-modal-btn-outline:hover { border-color: #94a3b8; background: var(--surface2); }

  /* Spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .sf-spin { animation: spin 0.7s linear infinite; display: inline-block; }

  /* Animations */
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg className="sf-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconX = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSpinner = () => (
  <svg className="sf-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="50" strokeDashoffset="20" strokeLinecap="round" />
  </svg>
);

const IconReceipt = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const SaleForm = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const searchRef = useRef(null);

  const [products, setProducts]               = useState([]);
  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity]               = useState(1);
  const [discount, setDiscount]               = useState('');
  const [discountType, setDiscountType]       = useState('percentage');
  const [loading, setLoading]                 = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [showModal, setShowModal]             = useState(false);
  const [lastSale, setLastSale]               = useState(null);
  const [errors, setErrors]                   = useState({});

  // ── Auto-focus ──────────────────────────────────────────────────────────────
  useEffect(() => { searchRef.current?.focus(); }, []);

  // ── Load products — cleanup prevents setState after unmount ─────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await productService.getAllProducts();
        if (!cancelled) setProducts(Array.isArray(res) ? res : res.data ?? []);
      } catch {
        if (!cancelled) showError('Erreur lors du chargement des produits');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived values (memoised — no redundant re-computation) ─────────────────
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return products
      .filter(p => p.quantite_stock > 0 && p.nom?.toLowerCase().includes(term))
      .slice(0, MAX_RESULTS);
  }, [searchTerm, products]);

  const subtotal = useMemo(
    () => (selectedProduct ? selectedProduct.prix * quantity : 0),
    [selectedProduct, quantity]
  );

  const discountAmount = useMemo(() => {
    if (!discount || !selectedProduct) return 0;
    const d = parseFloat(discount) || 0;
    return discountType === 'percentage' ? (subtotal * d) / 100 : d;
  }, [discount, discountType, subtotal, selectedProduct]);

  const total = subtotal - discountAmount;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const selectProduct = useCallback((product) => {
    if (product.quantite_stock === 0) { showError('Ce produit est en rupture de stock'); return; }
    setSelectedProduct(product);
    setQuantity(1);
    setDiscount('');
    setErrors({});
    setSearchTerm('');
  }, [showError]);

  const handleQuantityChange = useCallback((val) => {
    const next = Math.max(1, parseInt(val) || 1);
    if (selectedProduct && next > selectedProduct.quantite_stock) {
      setErrors(e => ({ ...e, quantity: `Max disponible : ${selectedProduct.quantite_stock}` }));
      return;
    }
    setQuantity(next);
    setErrors(e => ({ ...e, quantity: '' }));
  }, [selectedProduct]);

  const validate = () => {
    const e = {};
    if (!selectedProduct)                                       e.product  = 'Sélectionnez un produit';
    if (quantity < 1)                                           e.quantity = 'Quantité invalide';
    if (selectedProduct && quantity > selectedProduct.quantite_stock)
                                                                e.quantity = `Max disponible : ${selectedProduct.quantite_stock}`;
    if (discountAmount > subtotal)                              e.discount = 'Remise supérieure au sous-total';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        produit_id:    selectedProduct.id,
        quantite:      quantity,
        prix_unitaire: selectedProduct.prix,
        prix_total:    subtotal,
        remise:        discountAmount,
        remise_type:   discountType,
        date_vente:    new Date().toISOString(),
      };
      const res = await venteService.createVente(payload);
      setLastSale({
        ...res,
        product:        selectedProduct,
        quantity,
        total,
        remainingStock: selectedProduct.quantite_stock - quantity,
      });
      setShowModal(true);
      success('Vente enregistrée avec succès!');
    } catch (err) {
      showError(err.response?.data?.message ?? "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const clearForm = useCallback(() => {
    setSelectedProduct(null); setQuantity(1); setDiscount('');
    setDiscountType('percentage'); setErrors({}); setSearchTerm('');
    searchRef.current?.focus();
  }, []);

  const handleNewSale = () => { setShowModal(false); setLastSale(null); clearForm(); };

  if (loading) return <Loading text="Chargement des produits…" />;

  return (
    <>
      <style>{STYLES}</style>
      <div className="sf-root">
        <div className="sf-container">

          {/* ── Header ────────────────────────────────────────────────────── */}
          <header className="sf-header">
            <div>
              <h1 className="sf-title">Nouvelle <span>Vente</span></h1>
              <p className="sf-subtitle">Sélectionnez un produit et enregistrez la transaction</p>
            </div>
            <span className="sf-hist-link" role="button" tabIndex={0}
              onClick={() => navigate('/ventes/history')}
              onKeyDown={e => e.key === 'Enter' && navigate('/ventes/history')}>
              Historique →
            </span>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <div className="sf-grid">

              {/* ── Left column ───────────────────────────────────────────── */}
              <div className="sf-col-left">

                {/* Search card */}
                <div className="sf-card">
                  <p className="sf-card-label">Rechercher un produit</p>
                  <div className="sf-search-wrap">
                    <IconSearch />
                    <input
                      ref={searchRef}
                      type="text"
                      className="sf-input"
                      placeholder="Nom du produit…"
                      value={searchTerm}
                      autoComplete="off"
                      aria-label="Rechercher un produit"
                      onChange={e => setSearchTerm(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Escape') setSearchTerm('');
                        if (e.key === 'Enter' && filteredProducts.length > 0) {
                          e.preventDefault();
                          selectProduct(filteredProducts[0]);
                        }
                      }}
                    />
                    {searchTerm && (
                      <button type="button" className="sf-search-clear"
                        onClick={() => setSearchTerm('')} aria-label="Effacer la recherche">
                        <IconX size={14} />
                      </button>
                    )}
                  </div>

                  {searchTerm && (
                    <div className="sf-results" role="listbox" aria-label="Résultats de recherche">
                      {filteredProducts.length === 0 ? (
                        <div className="sf-empty">Aucun résultat pour « {searchTerm} »</div>
                      ) : filteredProducts.map(p => {
                        const s = stockInfo(p.quantite_stock);
                        return (
                          <div key={p.id} className="sf-result-item"
                            role="option" aria-selected="false"
                            onClick={() => selectProduct(p)}
                            onKeyDown={e => e.key === 'Enter' && selectProduct(p)}
                            tabIndex={0}>
                            <img src={imgSrc(p)} alt={p.nom} className="sf-result-img" loading="lazy" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="sf-result-name">{p.nom}</div>
                              <div className="sf-result-stock">
                                <span className="sf-stock-dot" style={{ background: s.dot }} />
                                {s.text}
                              </div>
                            </div>
                            <span className="sf-result-price">{fmt(p.prix)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {errors.product && !selectedProduct &&
                    <p className="sf-err">⚠ {errors.product}</p>}
                </div>

                {/* Selected product card */}
                {selectedProduct ? (
                  <div className="sf-card" style={{ borderColor: 'rgba(37,99,235,0.25)' }}>
                    <p className="sf-card-label">Produit sélectionné</p>
                    <div className="sf-selected">
                      <img src={imgSrc(selectedProduct)} alt={selectedProduct.nom}
                        className="sf-selected-img" loading="lazy" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="sf-selected-name">{selectedProduct.nom}</p>
                        <p className="sf-selected-unit">{fmt(selectedProduct.prix)} / unité</p>
                        <div className="sf-selected-stock">
                          <span className="sf-stock-dot"
                            style={{ background: stockInfo(selectedProduct.quantite_stock).dot }} />
                          {stockInfo(selectedProduct.quantite_stock).text}
                        </div>
                      </div>
                      <button type="button" className="sf-clear-btn"
                        onClick={() => setSelectedProduct(null)} aria-label="Retirer le produit">
                        <IconX size={15} />
                      </button>
                    </div>

                    <p className="sf-qty-label">Quantité</p>
                    <div className="sf-qty-wrap">
                      <button type="button" className="sf-qty-btn"
                        disabled={quantity <= 1}
                        onClick={() => handleQuantityChange(quantity - 1)}
                        aria-label="Diminuer">−</button>
                      <input
                        type="number" className="sf-qty-input"
                        min="1" max={selectedProduct.quantite_stock}
                        value={quantity}
                        onChange={e => handleQuantityChange(e.target.value)}
                        aria-label="Quantité"
                      />
                      <button type="button" className="sf-qty-btn"
                        disabled={quantity >= selectedProduct.quantite_stock}
                        onClick={() => handleQuantityChange(quantity + 1)}
                        aria-label="Augmenter">+</button>
                    </div>
                    {errors.quantity && <p className="sf-err">⚠ {errors.quantity}</p>}
                  </div>
                ) : (
                  <div className="sf-placeholder">
                    <div className="sf-placeholder-icon"><IconReceipt /></div>
                    Aucun produit sélectionné
                  </div>
                )}
              </div>

              {/* ── Right column ──────────────────────────────────────────── */}
              <div className="sf-col-right">
                <div className="sf-sticky">

                  {selectedProduct ? (
                    <div className="sf-card">
                      <p className="sf-card-label">Résumé</p>

                      <div className="sf-row">
                        <span className="sf-row-label">Produit</span>
                        <span className="sf-row-val"
                          style={{ maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {selectedProduct.nom}
                        </span>
                      </div>
                      <div className="sf-row">
                        <span className="sf-row-label">Qté × Prix</span>
                        <span className="sf-row-val">{quantity} × {fmt(selectedProduct.prix)}</span>
                      </div>

                      <hr className="sf-divider" />

                      <p className="sf-card-label" style={{ marginBottom: '0.5rem' }}>Remise (optionnelle)</p>
                      <div className="sf-discount-wrap">
                        <input type="number" min="0" placeholder="0"
                          className="sf-discount-input"
                          value={discount}
                          onChange={e => setDiscount(e.target.value)}
                          aria-label="Montant de la remise" />
                        <select className="sf-discount-select" value={discountType}
                          onChange={e => setDiscountType(e.target.value)} aria-label="Type de remise">
                          <option value="percentage">%</option>
                          <option value="fixed">DH</option>
                        </select>
                      </div>
                      {errors.discount && <p className="sf-err">⚠ {errors.discount}</p>}

                      <hr className="sf-divider" />

                      <div className="sf-row">
                        <span className="sf-row-label">Sous-total</span>
                        <span className="sf-row-val">{fmt(subtotal)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="sf-row">
                          <span className="sf-row-label">Remise</span>
                          <span className="sf-row-val sf-discount-val">− {fmt(discountAmount)}</span>
                        </div>
                      )}
                      <hr className="sf-divider" />
                      <div className="sf-total-row">
                        <span className="sf-total-label">Total</span>
                        <span className="sf-total-val">{fmt(total)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="sf-placeholder" style={{ padding: '2rem 1rem' }}>
                      Le résumé apparaîtra ici
                    </div>
                  )}

                  <button type="submit" className="sf-btn-primary"
                    disabled={!selectedProduct || submitting}>
                    {submitting ? <><IconSpinner /> Enregistrement…</> : 'Enregistrer la vente'}
                  </button>
                  <button type="button" className="sf-btn-secondary" onClick={clearForm}>
                    Réinitialiser
                  </button>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>

      {/* ── Success Modal ──────────────────────────────────────────────────── */}
      {showModal && lastSale && (
        <div className="sf-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="sf-modal" style={{position: 'relative',backgroundColor:"#ffffff"}} >
            <button onClick={() => setShowModal(false)} aria-label="Fermer" style={{position:"absolute",top:"0.75rem",right:"0.75rem",background:"rgba(228, 228, 228, 0.61)",border:"none",borderRadius:"50%",width:"30px",height:"30px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",backdropFilter:"blur(4px)"}}><IconX size={14} /></button>
            <div className="sf-modal-icon"><IconCheck /></div>
            <p className="sf-modal-title" id="modal-title">Vente enregistrée !</p>
            <p className="sf-modal-sub">La transaction a été sauvegardée avec succès.</p>

            <div className="sf-modal-details">
              {[
                ['Produit',       lastSale.product.nom,          false],
                ['Quantité',      lastSale.quantity,             false],
                ['Total',         fmt(lastSale.total),           true ],
                ['Stock restant', `${lastSale.remainingStock} unité${lastSale.remainingStock !== 1 ? 's' : ''}`, false],
              ].map(([label, val, accent]) => (
                <div className="sf-modal-row" key={label}>
                  <span className="sf-modal-row-label">{label}</span>
                  <span className={`sf-modal-row-val${accent ? ' accent' : ''}`}>{val}</span>
                </div>
              ))}
            </div>

            <div className="sf-modal-btns">
              <button style={{flex: 1,padding: "10px 20px",borderRadius: "8px",border: "1.5px solid #d1d5db",backgroundColor: "#ffffff",color: "#374151",fontWeight: "600",cursor: "pointer",fontSize: "14px",}} className="sf-modal-btn-green" onClick={handleNewSale}>Nouvelle vente</button>
              <button style={{flex: 1,padding: "10px 20px",borderRadius: "8px",border: "1.5px solid #d1d5db",backgroundColor: "#ffffff",color: "#374151",fontWeight: "600",cursor: "pointer",fontSize: "14px",}} className="sf-modal-btn-green" onClick={() => navigate('/ventes/history')}>Historique</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SaleForm;