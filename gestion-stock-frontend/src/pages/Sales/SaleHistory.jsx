import React, { useState, useEffect, useMemo } from 'react';
import venteService from '../../services/venteService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' DH';

const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .sh-root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --surface2: #f1f5f9;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --green: #16a34a;
    --green-light: #f0fdf4;
    --red: #dc2626;
    --red-light: #fef2f2;
    --yellow: #d97706;
    --yellow-light: #fffbeb;
    --purple: #7c3aed;
    --purple-light: #f5f3ff;
    --mono: 'DM Mono', monospace;
    --sans: 'DM Sans', sans-serif;
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 2.5rem 1rem;
  }
  .sh-root *, .sh-root *::before, .sh-root *::after { box-sizing: border-box; }
  .sh-container { max-width: 1100px; margin: 0 auto; }

  /* Header */
  .sh-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
  .sh-title { font-size: 1.625rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
  .sh-title span { color: var(--accent); }
  .sh-subtitle { font-size: 0.8125rem; color: var(--muted); margin-top: 0.375rem; }
  .sh-new-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.6rem 1.1rem; background: var(--accent); color: #fff;
    border: none; border-radius: 9px; font-family: var(--sans);
    font-size: 0.875rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 4px 12px rgba(37,99,235,0.2);
    transition: background 0.15s, box-shadow 0.15s;
  }
  .sh-new-btn:hover { background: #1d4ed8; box-shadow: 0 6px 16px rgba(37,99,235,0.3); }

  /* Stats */
  .sh-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
  @media (max-width: 640px) { .sh-stats { grid-template-columns: 1fr; } }
  .sh-stat {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    display: flex; align-items: center; gap: 1rem;
    animation: shFadeUp 0.3s ease both;
  }
  .sh-stat:nth-child(2) { animation-delay: 0.06s; }
  .sh-stat:nth-child(3) { animation-delay: 0.12s; }
  .sh-stat-icon {
    width: 44px; height: 44px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .sh-stat-label { font-size: 0.75rem; color: var(--muted); font-weight: 500; margin-bottom: 0.2rem; }
  .sh-stat-val { font-family: var(--mono); font-size: 1.375rem; font-weight: 500; letter-spacing: -0.02em; }

  /* Filters */
  .sh-filters {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 1.25rem 1.5rem;
    margin-bottom: 1.25rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    display: flex; gap: 0.75rem; flex-wrap: wrap;
  }
  .sh-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .sh-search-icon {
    position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%);
    color: var(--muted); pointer-events: none; width: 1rem; height: 1rem;
  }
  .sh-input {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text); font-family: var(--sans);
    font-size: 0.875rem; padding: 0.65rem 0.875rem 0.65rem 2.25rem;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .sh-input::placeholder { color: var(--muted); }
  .sh-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .sh-date-input {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text); font-family: var(--sans);
    font-size: 0.875rem; padding: 0.65rem 0.875rem;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  .sh-date-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .sh-clear-btn {
    padding: 0.65rem 1rem; background: transparent; border: 1px solid var(--border);
    border-radius: 9px; color: var(--muted); font-family: var(--sans);
    font-size: 0.8125rem; cursor: pointer; white-space: nowrap;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .sh-clear-btn:hover { border-color: #94a3b8; color: var(--text); background: var(--surface2); }

  /* Table */
  .sh-table-wrap {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .sh-table { width: 100%; border-collapse: collapse; }
  .sh-thead { background: var(--surface2); }
  .sh-th {
    padding: 0.75rem 1.25rem; text-align: left;
    font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--muted);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  .sh-tr {
    border-bottom: 1px solid var(--border);
    transition: background 0.12s;
    animation: shFadeUp 0.25s ease both;
  }
  .sh-tr:last-child { border-bottom: none; }
  .sh-tr:hover { background: #f8fafc; }
  .sh-td { padding: 1rem 1.25rem; vertical-align: middle; }

  /* Date cell */
  .sh-date-main { font-size: 0.875rem; font-weight: 500; color: var(--text); }
  .sh-date-time { font-size: 0.75rem; color: var(--muted); font-family: var(--mono); margin-top: 0.1rem; }

  /* Customer */
  .sh-customer { font-size: 0.875rem; font-weight: 600; color: var(--text); }

  /* Items */
  .sh-item { font-size: 0.8125rem; color: var(--muted); line-height: 1.6; }
  .sh-item-name { color: var(--text); font-weight: 500; }

  /* Total */
  .sh-total { font-family: var(--mono); font-size: 0.9375rem; font-weight: 500; color: var(--accent); }

  /* Remise */
  .sh-remise { font-family: var(--mono); font-size: 0.875rem; color: var(--yellow); font-weight: 500; }
  .sh-remise-none { color: var(--muted); font-size: 0.8125rem; }

  /* Action buttons */
  .sh-actions { display: flex; gap: 0.5rem; }
  .sh-action-btn {
    padding: 0.35rem 0.75rem; border-radius: 7px; border: 1px solid var(--border);
    background: transparent; font-family: var(--sans); font-size: 0.75rem; font-weight: 500;
    cursor: pointer; transition: all 0.15s; color: var(--muted);
  }
  .sh-action-btn:hover { background: var(--accent); border-color: var(--accent); color: #fff; }
  .sh-action-btn.invoice:hover { background: var(--green); border-color: var(--green); color: #fff; }

  /* Empty state */
  .sh-empty {
    padding: 4rem 1rem; text-align: center;
  }
  .sh-empty-icon { opacity: 0.2; display: flex; justify-content: center; margin-bottom: 0.75rem; }
  .sh-empty-text { font-size: 0.9375rem; color: var(--muted); }
  .sh-empty-sub { font-size: 0.8125rem; color: var(--muted); opacity: 0.7; margin-top: 0.25rem; }

  /* Result count */
  .sh-result-count {
    padding: 0.65rem 1.25rem; font-size: 0.75rem; color: var(--muted);
    border-bottom: 1px solid var(--border); background: var(--surface2);
    display: flex; justify-content: space-between; align-items: center;
  }

  /* Overflow scroll on small screens */
  .sh-table-scroll { overflow-x: auto; }

  /* Animations */
  @keyframes shFadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg className="sh-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const SaleHistory = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    
    const fetchSales = async () => {
      try {
        setLoading(true);
        const response = await venteService.getAllVentes();
        const salesData = Array.isArray(response) ? response : (response?.data || []);
        
        const transformedSales = salesData.map(vente => {
          const items = [{
            name: vente.produit?.nom || 'Produit inconnu',
            quantity: parseInt(vente.quantite) || 0,
            price: parseFloat(vente.prix_unitaire) || 0
          }];
          
          return {
            id: vente.id,
            date: vente.date_vente || vente.created_at,
            total: parseFloat(vente.prix_total) || 0,
            remise: parseFloat(vente.remise) || 0,
            items: items,
            customer: vente.user?.name || 'Client',
          };
        });
        
        if (!cancelled) {
          setSales(transformedSales);
        }
      } catch (err) {
        console.error('Error fetching sales:', err);
        if (!cancelled) {
          setError('Erreur lors du chargement des ventes');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchSales();
    return () => { cancelled = true; };
  }, []);

  const filteredSales = useMemo(() => sales.filter(s => {
    const matchSearch = s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchDate = !dateFilter || s.date.startsWith(dateFilter);
    return matchSearch && matchDate;
  }), [sales, searchTerm, dateFilter]);

  const grandTotal = useMemo(() => filteredSales.reduce((s, v) => s + v.total, 0), [filteredSales]);
  const avgBasket = useMemo(() => filteredSales.length ? Math.round(grandTotal / filteredSales.length) : 0, [grandTotal, filteredSales]);

  // Show Details in Alert
  const showDetails = (sale) => {
    const details = `═══════════════════════════════
DÉTAILS DE LA VENTE #${sale.id}
═══════════════════════════════

📅 Date: ${fmtDate(sale.date)} ${fmtTime(sale.date)}
👤 Client: ${sale.customer}

📦 Produits:
${sale.items.map(item => `  • ${item.name}\n    Quantité: ${item.quantity}\n    Prix unitaire: ${fmt(item.price)}\n    Sous-total: ${fmt(item.price * item.quantity)}`).join('\n\n')}

💰 Sous-total: ${fmt(sale.total + sale.remise)}
🎁 Remise: ${sale.remise > 0 ? '-' + fmt(sale.remise) : 'Aucune'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 TOTAL: ${fmt(sale.total)}
═══════════════════════════════`;
    
    alert(details);
  };

  // Print Invoice
  const printInvoice = (sale) => {
    const subtotal = sale.total + sale.remise;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Facture #${sale.id}</title>
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
            <p>${fmtDate(sale.date)} ${fmtTime(sale.date)}</p>
          </div>
          <div class="info-block">
            <h3>Client</h3>
            <p>${sale.customer}</p>
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
            ${sale.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${fmt(item.price)}</td>
                <td style="text-align: right;">${fmt(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
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
              <td class="total-amount">${fmt(sale.total)}</td>
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

  if (loading) return <Loading text="Chargement de l'historique…" />;
  if (error) return <ErrorMessage message={error} variant="error" />;

  return (
    <>
      <style>{STYLES}</style>
      <div className="sh-root">
        <div className="sh-container">

          <header className="sh-header">
            <div>
              <h1 className="sh-title">Historique des <span>Ventes</span></h1>
              <p className="sh-subtitle">{sales.length} transaction{sales.length !== 1 ? 's' : ''} enregistrée{sales.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="sh-new-btn" onClick={() => window.location.href = '/ventes'}>
              <IconPlus /> Nouvelle vente
            </button>
          </header>

          <div className="sh-stats">
            <div className="sh-stat">
              <div className="sh-stat-icon" style={{ background: '#eff6ff' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div>
                <p className="sh-stat-label">Nombre de ventes</p>
                <p className="sh-stat-val" style={{ color: '#2563eb' }}>{filteredSales.length}</p>
              </div>
            </div>

            <div className="sh-stat">
              <div className="sh-stat-icon" style={{ background: '#f0fdf4' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="sh-stat-label">Chiffre d'affaires</p>
                <p className="sh-stat-val" style={{ color: '#16a34a' }}>{fmt(grandTotal)}</p>
              </div>
            </div>

            <div className="sh-stat">
              <div className="sh-stat-icon" style={{ background: '#f5f3ff' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
              <div>
                <p className="sh-stat-label">Panier moyen</p>
                <p className="sh-stat-val" style={{ color: '#7c3aed' }}>{fmt(avgBasket)}</p>
              </div>
            </div>
          </div>

          <div className="sh-filters">
            <div className="sh-search-wrap">
              <IconSearch />
              <input
                type="text"
                className="sh-input"
                placeholder="Rechercher par client ou produit…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                aria-label="Rechercher"
              />
            </div>
            <input
              type="date"
              className="sh-date-input"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              aria-label="Filtrer par date"
            />
            {(searchTerm || dateFilter) && (
              <button className="sh-clear-btn" onClick={() => { setSearchTerm(''); setDateFilter(''); }}>
                Effacer les filtres
              </button>
            )}
          </div>

          <div className="sh-table-wrap">
            <div className="sh-result-count">
              <span>{filteredSales.length} résultat{filteredSales.length !== 1 ? 's' : ''}</span>
              {(searchTerm || dateFilter) && <span>filtré{filteredSales.length !== 1 ? 's' : ''}</span>}
            </div>
            <div className="sh-table-scroll">
              <table className="sh-table">
                <thead className="sh-thead">
                  <tr>
                    {/* ✅ Replaced "Statut" with "Remise" */}
                    {['Date', 'Client', 'Articles', 'Total', 'Remise', 'Actions'].map(h => (
                      <th key={h} className="sh-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="sh-empty">
                          <div className="sh-empty-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                          </div>
                          <p className="sh-empty-text">Aucune vente trouvée</p>
                          <p className="sh-empty-sub">
                            {(searchTerm || dateFilter) 
                              ? 'Essayez de modifier vos filtres' 
                              : 'Commencez par enregistrer une vente'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSales.map((sale, i) => (
                    <tr key={sale.id} className="sh-tr" style={{ animationDelay: `${i * 0.04}s` }}>
                      <td className="sh-td">
                        <div className="sh-date-main">{fmtDate(sale.date)}</div>
                        <div className="sh-date-time">{fmtTime(sale.date)}</div>
                      </td>
                      <td className="sh-td">
                        <span className="sh-customer">{sale.customer}</span>
                      </td>
                      <td className="sh-td">
                        {sale.items.map((item, idx) => (
                          <div key={idx} className="sh-item">
                            <span className="sh-item-name">{item.name}</span>
                            <span> × {item.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td className="sh-td">
                        <span className="sh-total">{fmt(sale.total)}</span>
                      </td>
                      <td className="sh-td">
                        {/* ✅ Display Remise */}
                        {sale.remise > 0 ? (
                          <span className="sh-remise">-{fmt(sale.remise)}</span>
                        ) : (
                          <span className="sh-remise-none">—</span>
                        )}
                      </td>
                      <td className="sh-td">
                        <div className="sh-actions">
                          <button 
                            className="sh-action-btn" 
                            onClick={() => window.location.href = `/ventes/${sale.id}`}
                            title="Voir les détails"
                          >
                            Détails
                          </button>
                          <button 
                            className="sh-action-btn invoice" 
                            onClick={() => printInvoice(sale)}
                            title="Imprimer la facture"
                          >
                            Facture
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default SaleHistory;