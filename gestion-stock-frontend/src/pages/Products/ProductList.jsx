import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import fournisseurService from '../../services/fournisseurService';
import { useToast } from '../../components/Common/Toast';
import { useAuth } from '../../context/AuthContext'; // ✅ ADDED

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' DH';

const getProductImage = (product) =>
  product.image
    ? `http://localhost:8000/storage/${product.image}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(product.nom || 'P')}&background=2563eb&color=fff&size=200&bold=true`;

const stockInfo = (qty) => {
  if (qty === 0) return { label: 'Rupture',    cls: 'pl-badge-red',    dot: '#dc2626' };
  if (qty <= 5)  return { label: `${qty} restants`, cls: 'pl-badge-yellow', dot: '#d97706' };
  return             { label: `${qty} en stock`, cls: 'pl-badge-green',  dot: '#16a34a' };
};

const ITEMS_PER_PAGE = 18;

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .pl-root {
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
  .pl-root *, .pl-root *::before, .pl-root *::after { box-sizing: border-box; }
  .pl-container { max-width: 1200px; margin: 0 auto; }

  /* Header */
  .pl-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
  .pl-title { font-size: 1.625rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
  .pl-title span { color: var(--accent); }
  .pl-subtitle { font-size: 0.8125rem; color: var(--muted); margin-top: 0.375rem; }
  .pl-add-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.65rem 1.1rem; background: var(--accent); color: #fff;
    border: none; border-radius: 9px; font-family: var(--sans);
    font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none;
    box-shadow: 0 4px 12px rgba(37,99,235,0.2);
    transition: background 0.15s, box-shadow 0.15s;
  }
  .pl-add-btn:hover { background: var(--accent-hover); box-shadow: 0 6px 16px rgba(37,99,235,0.3); }

  /* Filters */
  .pl-filters {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;
  }
  .pl-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .pl-search-icon {
    position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%);
    color: var(--muted); pointer-events: none; width: 1rem; height: 1rem;
  }
  .pl-input {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text); font-family: var(--sans);
    font-size: 0.875rem; padding: 0.65rem 0.875rem 0.65rem 2.25rem;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .pl-input::placeholder { color: var(--muted); }
  .pl-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .pl-select {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text); font-family: var(--sans);
    font-size: 0.875rem; padding: 0.65rem 2rem 0.65rem 0.875rem;
    outline: none; cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 0.75rem center;
    transition: border-color 0.2s, box-shadow 0.2s; min-width: 170px;
  }
  .pl-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .pl-clear-btn {
    padding: 0.65rem 1rem; background: transparent; border: 1px solid var(--border);
    border-radius: 9px; color: var(--muted); font-family: var(--sans);
    font-size: 0.8125rem; cursor: pointer; white-space: nowrap;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .pl-clear-btn:hover { border-color: #94a3b8; color: var(--text); background: var(--surface2); }

  /* Result count bar */
  .pl-count-bar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1.25rem; font-size: 0.8125rem; color: var(--muted);
  }

  /* Grid */
  .pl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  /* Card */
  .pl-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
    animation: plFadeUp 0.25s ease both;
  }
  .pl-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1); transform: translateY(-2px); border-color: #cbd5e1; }

  /* Card image */
  .pl-img-wrap { position: relative; height: 160px; background: var(--surface2); overflow: hidden; }
  .pl-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
  .pl-card:hover .pl-img { transform: scale(1.04); }
  .pl-stock-pill {
    position: absolute; top: 0.75rem; right: 0.75rem;
    display: inline-flex; align-items: center; gap: 0.3rem;
    padding: 0.25rem 0.6rem; border-radius: 20px;
    font-size: 0.7rem; font-weight: 600; backdrop-filter: blur(6px);
  }
  .pl-stock-dot { width: 5px; height: 5px; border-radius: 50%; }
  .pl-badge-green  { background: rgba(240,253,244,0.92); color: #16a34a; }
  .pl-badge-yellow { background: rgba(255,251,235,0.92); color: #d97706; }
  .pl-badge-red    { background: rgba(254,242,242,0.92); color: #dc2626; }

  /* Card body */
  .pl-card-body { padding: 1rem 1.125rem 1.125rem; }
  .pl-card-name { font-size: 0.9375rem; font-weight: 700; color: var(--text); margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pl-card-price { font-family: var(--mono); font-size: 1.25rem; font-weight: 500; color: var(--accent); margin-bottom: 0.75rem; }
  .pl-card-meta { font-size: 0.75rem; color: var(--muted); margin-bottom: 0.875rem; display: flex; flex-direction: column; gap: 0.2rem; }
  .pl-card-meta span { display: flex; gap: 0.3rem; }
  .pl-card-meta b { color: #475569; font-weight: 500; }

  /* Card actions */
  .pl-card-actions { display: flex; gap: 0.5rem; }
  .pl-btn {
    flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem;
    padding: 0.5rem 0; border-radius: 8px; font-family: var(--sans);
    font-size: 0.75rem; font-weight: 600; cursor: pointer;
    text-decoration: none; border: 1.5px solid transparent;
    transition: all 0.15s;
  }
  .pl-btn-view   { background: var(--accent-light); color: var(--accent); border-color: #bfdbfe; }
  .pl-btn-view:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
  .pl-btn-edit   { background: var(--yellow-light); color: var(--yellow); border-color: #fde68a; }
  .pl-btn-edit:hover { background: var(--yellow); color: #fff; border-color: var(--yellow); }
  .pl-btn-delete { background: var(--red-light); color: var(--red); border-color: #fecaca; }
  .pl-btn-delete:hover { background: var(--red); color: #fff; border-color: var(--red); }

  /* Empty state */
  .pl-empty {
    background: var(--surface); border: 1px dashed var(--border);
    border-radius: 16px; padding: 4rem 1.5rem; text-align: center;
    color: var(--muted);
  }
  .pl-empty-icon { opacity: 0.2; display: flex; justify-content: center; margin-bottom: 0.75rem; }
  .pl-empty-text { font-size: 0.9375rem; font-weight: 600; color: var(--text); }
  .pl-empty-sub  { font-size: 0.8125rem; color: var(--muted); margin-top: 0.25rem; }

  /* Pagination */
  .pl-pagination { display: flex; justify-content: center; align-items: center; gap: 0.4rem; margin-top: 0.5rem; }
  .pl-page-btn {
    min-width: 36px; height: 36px; padding: 0 0.5rem;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 8px; border: 1px solid var(--border);
    background: var(--surface); color: var(--muted);
    font-family: var(--sans); font-size: 0.875rem; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .pl-page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .pl-page-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .pl-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Delete modal */
  .pl-modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.45);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 50; padding: 1rem;
    animation: plFadeIn 0.18s ease;
  }
  .pl-modal {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 18px; padding: 2rem; max-width: 380px; width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    animation: plScaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1);
    position: relative;
  }
  .pl-modal-close {
    position: absolute; top: 1rem; right: 1rem;
    background: var(--surface2); border: none; border-radius: 50%;
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: background 0.15s, color 0.15s;
  }
  .pl-modal-close:hover { background: var(--red-light); color: var(--red); }
  .pl-modal-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--red-light); border: 1.5px solid #fecaca;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;
  }
  .pl-modal-title { font-size: 1.125rem; font-weight: 700; text-align: center; margin-bottom: 0.5rem; }
  .pl-modal-sub   { font-size: 0.875rem; color: var(--muted); text-align: center; line-height: 1.5; }
  .pl-modal-sub b { color: var(--text); font-weight: 600; }
  .pl-modal-btns  { display: flex; gap: 0.75rem; margin-top: 1.75rem; }
  .pl-modal-cancel {
    flex: 1; padding: 0.75rem; border: 1px solid var(--border); border-radius: 9px;
    background: transparent; color: var(--text); font-family: var(--sans);
    font-size: 0.875rem; font-weight: 500; cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .pl-modal-cancel:hover { background: var(--surface2); border-color: #94a3b8; }
  .pl-modal-confirm {
    flex: 1; padding: 0.75rem; border: none; border-radius: 9px;
    background: var(--red); color: #fff; font-family: var(--sans);
    font-size: 0.875rem; font-weight: 700; cursor: pointer;
    box-shadow: 0 4px 12px rgba(220,38,38,0.25);
    transition: background 0.15s, box-shadow 0.15s;
  }
  .pl-modal-confirm:hover { background: #b91c1c; box-shadow: 0 6px 16px rgba(220,38,38,0.35); }

  /* Animations */
  @keyframes plFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes plFadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes plScaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .pl-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid #e2e8f0; border-top-color: var(--accent);
    animation: spin 0.7s linear infinite;
    margin: 6rem auto;
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg className="pl-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconWarn = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const ProductList = () => {
  const location = useLocation();
  const { success, error: showError } = useToast();
  const { user } = useAuth(); // ✅ ADDED
  const isAdmin = user?.role === 'admin'; // ✅ ADDED

  const [products, setProducts]               = useState([]);
  const [categories, setCategories]           = useState([]);
  const [fournisseurs, setFournisseurs]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedCategory, setSelectedCategory]     = useState('');
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [deleteModal, setDeleteModal]         = useState({ isOpen: false, product: null });
  const [currentPage, setCurrentPage]         = useState(1);

  const showErrorRef = useRef(showError);
  useEffect(() => { showErrorRef.current = showError; }, [showError]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, fournisseursRes] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories(),
        fournisseurService.getAllFournisseurs(),
      ]);
      const productsData =
        Array.isArray(productsRes)             ? productsRes :
        Array.isArray(productsRes?.data)        ? productsRes.data :
        Array.isArray(productsRes?.data?.data)  ? productsRes.data.data : [];

      setProducts(productsData);
      setCategories(Array.isArray(categoriesRes?.data)    ? categoriesRes.data    : Array.isArray(categoriesRes)    ? categoriesRes    : []);
      setFournisseurs(Array.isArray(fournisseursRes?.data) ? fournisseursRes.data  : Array.isArray(fournisseursRes)  ? fournisseursRes  : []);
    } catch (err) {
      showErrorRef.current(err.response?.data?.message ?? 'Erreur lors du chargement');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (location.state?.refresh) { fetchData(); window.history.replaceState({}, document.title); }
  }, [location.state, fetchData]);

  useEffect(() => {
    window.addEventListener('productUpdated', fetchData);
    return () => window.removeEventListener('productUpdated', fetchData);
  }, [fetchData]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(p => {
      const matchSearch = p.nom?.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term);
      const matchCat    = !selectedCategory    || String(p.categorie_id)  === String(selectedCategory);
      const matchFourn  = !selectedFournisseur || String(p.fournisseur_id) === String(selectedFournisseur);
      return matchSearch && matchCat && matchFourn;
    });
  }, [products, searchTerm, selectedCategory, selectedFournisseur]);

  const totalPages      = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() =>
    filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredProducts, currentPage]
  );

  const hasFilters = searchTerm || selectedCategory || selectedFournisseur;
  const clearFilters = () => { setSearchTerm(''); setSelectedCategory(''); setSelectedFournisseur(''); setCurrentPage(1); };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory, selectedFournisseur]);

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    try {
      await productService.deleteProduct(deleteModal.product.id);
      await fetchData();
      success('Produit supprimé avec succès');
      setDeleteModal({ isOpen: false, product: null });
    } catch (err) {
      showError(err.response?.data?.message ?? 'Erreur lors de la suppression');
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="pl-root">
        <div className="pl-container">

          {/* Header */}
          <header className="pl-header">
            <div>
              <h1 className="pl-title">Gestion des <span>Produits</span></h1>
              <p className="pl-subtitle">
                {loading ? '…' : `${products.length} produit${products.length !== 1 ? 's' : ''} enregistré${products.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            {/* ✅ Only show for admins */}
            {isAdmin && (
              <Link to="/produits/add" className="pl-add-btn">
                <IconPlus /> Ajouter un produit
              </Link>
            )}
          </header>

          {/* Filters */}
          <div className="pl-filters">
            <div className="pl-search-wrap">
              <IconSearch />
              <input
                type="text" className="pl-input"
                placeholder="Rechercher un produit…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                aria-label="Rechercher"
              />
            </div>
            <select className="pl-select" value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)} aria-label="Catégorie">
              <option value="">Toutes les catégories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <select className="pl-select" value={selectedFournisseur}
              onChange={e => setSelectedFournisseur(e.target.value)} aria-label="Fournisseur">
              <option value="">Tous les fournisseurs</option>
              {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
            {hasFilters && (
              <button className="pl-clear-btn" onClick={clearFilters}>Effacer</button>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="pl-spinner" role="status" aria-label="Chargement…" />
          ) : (
            <>
              {/* Count */}
              <div className="pl-count-bar">
                <span>{filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}{hasFilters ? ' trouvé' : ''}{filteredProducts.length !== 1 && hasFilters ? 's' : ''}</span>
                {totalPages > 1 && <span>Page {currentPage} / {totalPages}</span>}
              </div>

              {/* Grid */}
              {paginatedProducts.length === 0 ? (
                <div className="pl-empty">
                  <div className="pl-empty-icon">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                  </div>
                  <p className="pl-empty-text">Aucun produit trouvé</p>
                  <p className="pl-empty-sub">{hasFilters ? 'Essayez de modifier vos filtres' : 'Commencez par ajouter un produit'}</p>
                </div>
              ) : (
                <div className="pl-grid">
                  {paginatedProducts.map((product, i) => {
                    const stock = stockInfo(product.quantite_stock);
                    return (
                      <div key={product.id} className="pl-card" style={{ animationDelay: `${i * 0.03}s` }}>
                        <div className="pl-img-wrap">
                          <img
                            src={getProductImage(product)}
                            alt={product.nom}
                            className="pl-img"
                            loading="lazy"
                            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.nom)}&background=2563eb&color=fff&size=200&bold=true`; }}
                          />
                          <span className={`pl-stock-pill ${stock.cls}`}>
                            <span className="pl-stock-dot" style={{ background: stock.dot }} />
                            {stock.label}
                          </span>
                        </div>

                        <div className="pl-card-body">
                          <p className="pl-card-name" title={product.nom}>{product.nom}</p>
                          <p className="pl-card-price">{fmt(product.prix)}</p>
                          <div className="pl-card-meta">
                            <span><b>Catégorie</b> {product.categorie?.nom ?? 'N/A'}</span>
                            <span><b>Fournisseur</b> {product.fournisseur?.nom ?? 'N/A'}</span>
                          </div>
                          <div className="pl-card-actions">
                            <Link to={`/produits/${product.id}`} className="pl-btn pl-btn-view">
                              <IconEye /> Voir
                            </Link>
                            {/* ✅ Only show for admins */}
                            {isAdmin && (
                              <>
                                <Link to={`/produits/${product.id}/edit`} className="pl-btn pl-btn-edit">
                                  <IconEdit /> Modifier
                                </Link>
                                <button
                                  className="pl-btn pl-btn-delete"
                                  onClick={() => setDeleteModal({ isOpen: true, product })}
                                >
                                  <IconTrash /> Supprimer
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pl-pagination">
                  <button className="pl-page-btn" disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}>←</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '…'
                        ? <span key={`dots-${i}`} style={{ color: 'var(--muted)', padding: '0 0.25rem', fontSize: '0.875rem' }}>…</span>
                        : <button key={p} className={`pl-page-btn${currentPage === p ? ' active' : ''}`}
                            onClick={() => setCurrentPage(p)}>{p}</button>
                    )
                  }
                  <button className="pl-page-btn" disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}>→</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="pl-modal-backdrop" role="dialog" aria-modal="true">
          <div className="pl-modal" style={{ backgroundColor:"#ffffff"}}>
            <button className="pl-modal-close" onClick={() => setDeleteModal({ isOpen: false, product: null })} aria-label="Fermer">
              <IconX />
            </button>
            <div className="pl-modal-icon"><IconWarn /></div>
            <p className="pl-modal-title">Confirmer la suppression</p>
            <p className="pl-modal-sub">
              Voulez-vous vraiment supprimer <b>« {deleteModal.product?.nom} »</b> ?<br/>
              Cette action est irréversible.
            </p>
            <div className="pl-modal-btns">
              <button style={{flex: 1,padding: "10px 20px",borderRadius: "8px",border: "1.5px solid #d1d5db",backgroundColor: "#ffffff",color: "#374151",fontWeight: "600",cursor: "pointer",fontSize: "14px",}} className="pl-modal-cancel" onClick={() => setDeleteModal({ isOpen: false, product: null })}>Annuler</button>
              <button className="pl-modal-confirm" onClick={handleDelete} style={{ color: "#000000ff" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductList;