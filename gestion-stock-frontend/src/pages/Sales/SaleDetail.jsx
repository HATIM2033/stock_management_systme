import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Common/Toast';
import venteService from '../../services/venteService';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .sd-root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --surface2: #f1f5f9;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #2563eb;
    --accent-h: #1d4ed8;
    --accent-light: #eff6ff;
    --green: #16a34a;
    --green-light: #f0fdf4;
    --green-border: #bbf7d0;
    --yellow: #d97706;
    --yellow-light: #fffbeb;
    --yellow-border: #fde68a;
    --red: #dc2626;
    --red-light: #fef2f2;
    --red-border: #fecaca;
    --mono: 'DM Mono', monospace;
    --sans: 'DM Sans', sans-serif;

    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 2rem 1rem;
  }

  .sd-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Header */
  .sd-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .sd-breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--muted);
  }

  .sd-breadcrumb a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.15s;
  }

  .sd-breadcrumb a:hover {
    color: var(--accent-h);
  }

  .sd-breadcrumb-separator {
    color: #cbd5e1;
  }

  .sd-title {
    font-size: 1.625rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .sd-title span {
    color: var(--accent);
  }

  .sd-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1.1rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 9px;
    font-family: var(--sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text);
    cursor: pointer;
    transition: all 0.15s;
  }

  .sd-back-btn:hover {
    background: var(--surface2);
    border-color: #94a3b8;
  }

  /* Grid layout */
  .sd-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 1.5rem;
  }

  @media (max-width: 968px) {
    .sd-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Cards */
  .sd-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    animation: sdFadeUp 0.3s ease both;
  }

  .sd-card-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sd-card-title span {
    color: var(--accent);
  }

  /* Sale info */
  .sd-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  @media (max-width: 640px) {
    .sd-info-grid {
      grid-template-columns: 1fr;
    }
  }

  .sd-info-item {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .sd-info-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
  }

  .sd-info-value {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text);
    font-family: var(--mono);
  }

  .sd-info-value.large {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--accent);
  }

  /* Status badge */
  .sd-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.875rem;
    border-radius: 20px;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .sd-status-badge.completed {
    background: var(--green-light);
    color: var(--green);
    border: 1px solid var(--green-border);
  }

  .sd-status-badge.pending {
    background: var(--yellow-light);
    color: var(--yellow);
    border: 1px solid var(--yellow-border);
  }

  .sd-status-badge.cancelled {
    background: var(--red-light);
    color: var(--red);
    border: 1px solid var(--red-border);
  }

  .sd-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  /* Product details */
  .sd-product-card {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    transition: all 0.15s;
  }

  .sd-product-card:hover {
    background: var(--surface);
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .sd-product-image {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    object-fit: cover;
    background: var(--surface);
    border: 1px solid var(--border);
  }

  .sd-product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sd-product-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    line-height: 1.3;
  }

  .sd-product-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: var(--muted);
  }

  .sd-product-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sd-product-price {
    font-family: var(--mono);
    font-weight: 500;
    color: var(--text);
  }

  .sd-product-subtotal {
    font-family: var(--mono);
    font-weight: 700;
    color: var(--accent);
    font-size: 1rem;
  }

  /* Payment summary */
  .sd-summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border);
  }

  .sd-summary-row:last-child {
    border-bottom: none;
  }

  .sd-summary-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--muted);
  }

  .sd-summary-value {
    font-family: var(--mono);
    font-weight: 500;
    color: var(--text);
  }

  .sd-summary-value.discount {
    color: var(--yellow);
  }

  .sd-summary-total {
    padding-top: 1rem;
    border-top: 2px solid var(--border);
  }

  .sd-summary-total .sd-summary-label {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
  }

  .sd-summary-total .sd-summary-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--green);
  }

  /* Action buttons */
  .sd-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  @media (max-width: 640px) {
    .sd-actions {
      flex-direction: column;
    }
  }

  .sd-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 9px;
    font-family: var(--sans);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    border: 1.5px solid transparent;
  }

  .sd-btn-secondary {
    background: var(--surface);
    color: var(--text);
    border-color: var(--border);
  }

  .sd-btn-secondary:hover {
    background: var(--surface2);
    border-color: #94a3b8;
  }

  .sd-btn-primary {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  .sd-btn-primary:hover {
    background: var(--accent-h);
    border-color: var(--accent-h);
  }

  .sd-btn-danger {
    background: var(--red);
    color: #fff;
    border-color: var(--red);
  }

  .sd-btn-danger:hover {
    background: #b91c1c;
    border-color: #b91c1c;
  }

  /* Modal */
  .sd-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
    animation: sdFadeIn 0.18s ease;
  }

  .sd-modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 2rem;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    animation: sdScaleIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
  }

  .sd-modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: var(--surface2);
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--muted);
    transition: all 0.15s;
  }

  .sd-modal-close:hover {
    background: var(--red-light);
    color: var(--red);
  }

  .sd-modal-title {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .sd-modal-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--red-light);
    border: 1.5px solid var(--red-border);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem;
  }

  .sd-modal-sub {
    font-size: 0.875rem;
    color: var(--muted);
    text-align: center;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }

  .sd-modal-sub b {
    color: var(--text);
    font-weight: 600;
  }

  .sd-modal-footer {
    display: flex;
    gap: 0.75rem;
  }

  .sd-modal-cancel {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 9px;
    background: transparent;
    color: var(--text);
    font-family: var(--sans);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .sd-modal-cancel:hover {
    background: var(--surface2);
    border-color: #94a3b8;
  }

  .sd-modal-confirm {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 9px;
    background: var(--red);
    color: #fff;
    font-family: var(--sans);
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(220,38,38,0.25);
    transition: all 0.15s;
  }

  .sd-modal-confirm:hover {
    background: #b91c1c;
    box-shadow: 0 6px 16px rgba(220,38,38,0.35);
  }

  /* Animations */
  @keyframes sdFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes sdFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes sdScaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconArrowLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IconPrint = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IconX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconWarn = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

// ─── Main Component ─────────────────────────────────────────────────────────────
const SaleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });

  // Fetch sale data
  useEffect(() => {
    const fetchSale = async () => {
      try {
        setLoading(true);
        const response = await venteService.getVenteById(id);
        setSale(response.data || response);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Vente non trouvée');
        } else {
          setError(err.response?.data?.message || 'Erreur lors du chargement de la vente');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [id]);

  // Print invoice
  const printInvoice = () => {
    if (!sale) return;

    const subtotal = (sale.prix_total || 0) + (sale.remise || 0);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Facture #${String(sale.id).padStart(6, '0')}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'DM Sans', sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #2563eb; }
          .header h1 { color: #2563eb; font-size: 2rem; margin-bottom: 0.5rem; }
          .header p { color: #64748b; font-size: 0.875rem; }
          .info { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
          .info-block h3 { font-size: 0.75rem; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem; }
          .info-block p { color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
          thead { background: #f1f5f9; }
          th { padding: 0.75rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 600; }
          td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
          .subtotal-row { background: #f8fafc; }
          .remise-row { background: #fffbeb; color: #d97706; font-weight: 600; }
          .total-row { background: #f8fafc; font-weight: 600; font-size: 1.125rem; }
          .total-amount { color: #16a34a; text-align: right; }
          .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 0.875rem; }
          .print-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; font-weight: 600; margin-top: 1rem; }
          .print-btn:hover { background: #1d4ed8; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FACTURE</h1>
          <p>Numéro: #${String(sale.id).padStart(6, '0')}</p>
        </div>

        <div class="info">
          <div class="info-block">
            <h3>Date</h3>
            <p>${fmtDate(sale.date_vente)} ${fmtTime(sale.date_vente)}</p>
          </div>
          <div class="info-block">
            <h3>Client</h3>
            <p>${sale.user?.name || 'Client'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th style="text-align: center;">Quantité</th>
              <th style="text-align: right;">Prix unitaire</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${sale.produit?.nom || 'Produit'}</td>
              <td style="text-align: center;">${sale.quantite || 1}</td>
              <td style="text-align: right;">${fmt(sale.prix_unitaire || 0)}</td>
              <td style="text-align: right;">${fmt((sale.prix_unitaire || 0) * (sale.quantite || 1))}</td>
            </tr>
            <tr class="subtotal-row">
              <td colspan="3" style="text-align: right; font-weight: 600;">Sous-total</td>
              <td style="text-align: right;">${fmt(subtotal)}</td>
            </tr>
            ${sale.remise > 0 ? `
              <tr class="remise-row">
                <td colspan="3" style="text-align: right; font-weight: 600;">Remise</td>
                <td style="text-align: right;">-${fmt(sale.remise)}</td>
              </tr>
            ` : ''}
            <tr class="total-row">
              <td colspan="3" style="text-align: right; font-weight: 700;">TOTAL À PAYER</td>
              <td class="total-amount">${fmt(sale.prix_total || 0)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Merci pour votre confiance</p>
          <p>Système de Gestion de Stock</p>
        </div>

        <center>
          <button class="print-btn" onclick="window.print()">🖨️ Imprimer</button>
        </center>
      </body>
      </html>
    `);
  };

  // Delete sale
  const handleDelete = async () => {
    try {
      await venteService.deleteVente(sale.id);
      success('Vente supprimée avec succès');
      navigate('/ventes/history');
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading text="Chargement des détails de la vente..." />;
  if (error) return <ErrorMessage message={error} variant="error" />;
  if (!sale) return <ErrorMessage message="Vente non trouvée" variant="error" />;

  const subtotal = (sale.prix_total || 0) + (sale.remise || 0);

  return (
    <>
      <style>{STYLES}</style>
      <div className="sd-root">
        <div className="sd-container">

          {/* Header */}
          <header className="sd-header">
            <div>
              <nav className="sd-breadcrumb">
                <a href="/dashboard">Dashboard</a>
                <span className="sd-breadcrumb-separator">›</span>
                <a href="/ventes/history">Ventes</a>
                <span className="sd-breadcrumb-separator">›</span>
                <span>Détail Vente #{String(sale.id).padStart(6, '0')}</span>
              </nav>
              <h1 className="sd-title">Détail de la <span>Vente</span></h1>
            </div>
            <button className="sd-back-btn" onClick={() => navigate('/ventes/history')}>
              <IconArrowLeft />
              Retour
            </button>
          </header>

          {/* Grid */}
          <div className="sd-grid">

            {/* Main content */}
            <div className="sd-card" style={{ animationDelay: '0.1s' }}>
              <h2 className="sd-card-title">
                Informations de la <span>Vente</span>
              </h2>

              {/* Sale info */}
              <div className="sd-info-grid">
                <div className="sd-info-item">
                  <span className="sd-info-label">Numéro de vente</span>
                  <span className="sd-info-value large">#{String(sale.id).padStart(6, '0')}</span>
                </div>
                <div className="sd-info-item">
                  <span className="sd-info-label">Date & Heure</span>
                  <span className="sd-info-value">
                    {fmtDate(sale.date_vente)} {fmtTime(sale.date_vente)}
                  </span>
                </div>
                <div className="sd-info-item">
                  <span className="sd-info-label">Client</span>
                  <span className="sd-info-value">{sale.user?.name || 'Client'}</span>
                </div>
                <div className="sd-info-item">
                  <span className="sd-info-label">Statut</span>
                  <span className="sd-status-badge completed">
                    <span className="sd-status-dot"></span>
                    Complétée
                  </span>
                </div>
              </div>

              {/* Product details */}
              <h3 className="sd-card-title" style={{ marginTop: '2rem' }}>
                Détails du <span>Produit</span>
              </h3>

              <div className="sd-product-card">
                <img
                  src={
                    sale.produit?.image
                      ? `http://localhost:8000/storage/${sale.produit.image}`
                      : `https://ui-avatars.com/api/?name=${sale.produit?.nom || 'Produit'}&background=2563eb&color=fff&size=80&bold=true`
                  }
                  alt={sale.produit?.nom || 'Produit'}
                  className="sd-product-image"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${sale.produit?.nom || 'Produit'}&background=2563eb&color=fff&size=80&bold=true`;
                  }}
                />
                <div className="sd-product-info">
                  <h4 className="sd-product-name">{sale.produit?.nom || 'Produit'}</h4>
                  <div className="sd-product-meta">
                    <div className="sd-product-row">
                      <span>Quantité:</span>
                      <span className="sd-product-price">{sale.quantite || 1}</span>
                    </div>
                    <div className="sd-product-row">
                      <span>Prix unitaire:</span>
                      <span className="sd-product-price">{fmt(sale.prix_unitaire || 0)}</span>
                    </div>
                    <div className="sd-product-row">
                      <span>Sous-total:</span>
                      <span className="sd-product-subtotal">
                        {fmt((sale.prix_unitaire || 0) * (sale.quantite || 1))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="sd-actions">
                <button className="sd-btn sd-btn-secondary" onClick={() => navigate('/ventes/history')}>
                  <IconArrowLeft />
                  Retour
                </button>
                <button className="sd-btn sd-btn-primary" onClick={printInvoice}>
                  <IconPrint />
                  Imprimer Facture
                </button>
                <button className="sd-btn sd-btn-danger" onClick={() => setDeleteModal({ isOpen: true })}>
                  <IconTrash />
                  Supprimer
                </button>
              </div>
            </div>

            {/* Payment summary */}
            <div className="sd-card" style={{ animationDelay: '0.2s' }}>
              <h2 className="sd-card-title">
                Résumé du <span>Paiement</span>
              </h2>

              <div className="sd-summary-row">
                <span className="sd-summary-label">Sous-total</span>
                <span className="sd-summary-value">{fmt(subtotal)}</span>
              </div>

              {sale.remise > 0 && (
                <div className="sd-summary-row">
                  <span className="sd-summary-label">Remise</span>
                  <span className="sd-summary-value discount">-{fmt(sale.remise)}</span>
                </div>
              )}

              <div className="sd-summary-row sd-summary-total">
                <span className="sd-summary-label">Total</span>
                <span className="sd-summary-value">{fmt(sale.prix_total || 0)}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteModal.isOpen && (
        <div className="sd-backdrop" role="dialog" aria-modal="true">
          <div style={{ backgroundColor:"#ffffff"}} className="sd-modal">
            <button
              className="sd-modal-close"
              onClick={() => setDeleteModal({ isOpen: false })}
              aria-label="Fermer"
            >
              <IconX />
            </button>

            <div className="sd-modal-icon">
              <IconWarn />
            </div>

            <h3 className="sd-modal-title">Confirmer la suppression</h3>

            <p className="sd-modal-sub">
              Êtes-vous sûr de vouloir supprimer cette vente ?<br />
              <b>Vente #{String(sale.id).padStart(6, '0')}</b> - Total: <b>{fmt(sale.prix_total || 0)}</b><br />
              Cette action est irréversible.
            </p>

            <div className="sd-modal-footer">
              <button
                className="sd-modal-cancel"
                onClick={() => setDeleteModal({ isOpen: false })}
                style={{flex: 1,padding: "10px 20px",borderRadius: "8px",border: "1.5px solid #d1d5db",backgroundColor: "#ffffff",color: "#374151",fontWeight: "600",cursor: "pointer",fontSize: "14px",}}
              >
                Annuler
              </button>
              <button
                className="sd-modal-confirm"
                onClick={handleDelete}
                style={{ color: "#000000ff" }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SaleDetail;