import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .udb-root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --surface2: #f1f5f9;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --green: #16a34a; --green-light: #f0fdf4;
    --yellow: #d97706; --yellow-light: #fffbeb;
    --red: #dc2626; --red-light: #fef2f2;
    --purple: #7c3aed; --purple-light: #f5f3ff;
    --mono: 'DM Mono', monospace;
    --sans: 'DM Sans', sans-serif;
    font-family: var(--sans);
    background: var(--bg);
    min-height: 100vh;
    padding: 2.5rem 1rem;
  }
  .udb-root *, .udb-root *::before, .udb-root *::after { box-sizing: border-box; }
  .udb-container { max-width: 1400px; margin: 0 auto; }

  /* Header */
  .udb-header {
    margin-bottom: 2rem;
    animation: udbFadeUp 0.4s ease;
  }
  .udb-welcome {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }
  .udb-welcome-emoji {
    display: inline-block;
    animation: wave 1s ease-in-out infinite;
    transform-origin: 70% 70%;
  }
  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(20deg); }
    75% { transform: rotate(-10deg); }
  }
  .udb-subtitle {
    color: var(--muted);
    font-size: 0.9375rem;
  }

  /* Stats Grid */
  .udb-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .udb-stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.75rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    animation: udbFadeUp 0.4s ease both;
  }
  .udb-stat-card:nth-child(1) { animation-delay: 0.05s; }
  .udb-stat-card:nth-child(2) { animation-delay: 0.1s; }
  .udb-stat-card:nth-child(3) { animation-delay: 0.15s; }
  .udb-stat-card:nth-child(4) { animation-delay: 0.2s; }
  .udb-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }

  .udb-stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  .udb-stat-icon.blue { background: var(--accent-light); color: var(--accent); }
  .udb-stat-icon.green { background: var(--green-light); color: var(--green); }
  .udb-stat-icon.yellow { background: var(--yellow-light); color: var(--yellow); }
  .udb-stat-icon.purple { background: var(--purple-light); color: var(--purple); }

  .udb-stat-label {
    font-size: 0.8125rem;
    color: var(--muted);
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .udb-stat-value {
    font-size: 2.25rem;
    font-weight: 700;
    font-family: var(--mono);
    color: var(--text);
    line-height: 1;
    margin-bottom: 0.75rem;
  }

  .udb-stat-sub {
    font-size: 0.875rem;
    color: var(--muted);
    font-family: var(--mono);
  }

  .udb-stat-change {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 0.25rem 0.6rem;
    border-radius: 20px;
    margin-top: 0.75rem;
  }
  .udb-stat-change.positive { background: var(--green-light); color: var(--green); }
  .udb-stat-change.negative { background: var(--red-light); color: var(--red); }

  /* Main Content Grid */
  .udb-main-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  @media (max-width: 1024px) {
    .udb-main-grid { grid-template-columns: 1fr; }
  }

  /* Chart Card */
  .udb-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.75rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    animation: udbFadeUp 0.4s ease both;
    animation-delay: 0.25s;
  }

  .udb-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .udb-card-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text);
  }

  .udb-card-subtitle {
    font-size: 0.8125rem;
    color: var(--muted);
    margin-top: 0.25rem;
  }

  .udb-tabs {
    display: flex;
    gap: 0.5rem;
  }

  .udb-tab {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    background: transparent;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s;
  }
  .udb-tab.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }
  .udb-tab:hover:not(.active) {
    background: var(--surface2);
  }

  /* Top Products Grid */
  .udb-products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .udb-product-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--surface2);
    border-radius: 12px;
    transition: background 0.2s;
  }
  .udb-product-item:hover {
    background: #e2e8f0;
  }

  .udb-product-rank {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--accent-light);
    color: var(--accent);
    font-weight: 700;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .udb-product-rank.gold { background: #fef3c7; color: #d97706; }
  .udb-product-rank.silver { background: #f1f5f9; color: #64748b; }
  .udb-product-rank.bronze { background: #fed7aa; color: #c2410c; }

  .udb-product-img {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: var(--surface);
    object-fit: cover;
    flex-shrink: 0;
  }

  .udb-product-info {
    flex: 1;
    min-width: 0;
  }

  .udb-product-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .udb-product-meta {
    font-size: 0.75rem;
    color: var(--muted);
  }

  .udb-product-stats {
    text-align: right;
    flex-shrink: 0;
  }

  .udb-product-qty {
    font-size: 1rem;
    font-weight: 700;
    font-family: var(--mono);
    color: var(--text);
  }

  .udb-product-revenue {
    font-size: 0.75rem;
    color: var(--muted);
    font-family: var(--mono);
  }

  /* Recent Sales Table */
  .udb-table-wrap {
    border-radius: 10px;
    border: 1px solid var(--border);
    overflow: hidden;
  }

  .udb-table {
    width: 100%;
    border-collapse: collapse;
  }

  .udb-th {
    padding: 0.75rem 1rem;
    text-align: left;
    background: var(--surface2);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
  }

  .udb-tr {
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }
  .udb-tr:last-child { border-bottom: none; }
  .udb-tr:hover { background: var(--surface2); }

  .udb-td {
    padding: 1rem;
    font-size: 0.875rem;
  }

  .udb-td-mono {
    font-family: var(--mono);
    color: var(--accent);
    font-weight: 500;
  }

  .udb-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.6rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .udb-badge-dot { width: 6px; height: 6px; border-radius: 50%; }
  .udb-badge-green { background: var(--green-light); color: var(--green); }

  /* Empty State */
  .udb-empty {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--muted);
  }
  .udb-empty-icon {
    font-size: 3rem;
    opacity: 0.3;
    margin-bottom: 1rem;
  }
  .udb-empty-text {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.5rem;
  }
  .udb-empty-sub {
    font-size: 0.8125rem;
  }

  /* Loading */
  .udb-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }
  .udb-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* Animations */
  @keyframes udbFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Quick Action Button */
  .udb-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 4px 12px rgba(37,99,235,0.25);
    transition: all 0.2s;
  }
  .udb-action-btn:hover {
    background: var(--accent-hover);
    box-shadow: 0 6px 16px rgba(37,99,235,0.35);
    transform: translateY(-2px);
  }
`;

// Icons
const IconTrendUp = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconTrendDown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
const IconReceipt = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconDollar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IconStar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('30'); // 7, 30, 90

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/user/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="udb-root">
          <div className="udb-loading">
            <div className="udb-spinner" />
          </div>
        </div>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="udb-root">
          <div className="udb-empty">
            <div className="udb-empty-icon">📊</div>
            <div className="udb-empty-text">Aucune donnée disponible</div>
            <div className="udb-empty-sub">Commencez par faire votre première vente</div>
          </div>
        </div>
      </>
    );
  }

  const fmt = (n) => new Intl.NumberFormat('fr-MA', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(n) + ' DH';

  const fmtShort = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="udb-root">
        <div className="udb-container">
          
          {/* Header */}
          <div className="udb-header">
            <h1 className="udb-welcome">
              Bienvenue, {stats.user_name} <span className="udb-welcome-emoji">👋</span>
            </h1>
            <p className="udb-subtitle">Voici un aperçu de vos performances de vente</p>
          </div>

          {/* Stats Grid */}
          <div className="udb-stats-grid">
            {/* Today */}
            <div className="udb-stat-card">
              <div className="udb-stat-icon blue">
                <IconReceipt />
              </div>
              <div className="udb-stat-label">Aujourd'hui</div>
              <div className="udb-stat-value">{stats.ventes_today}</div>
              <div className="udb-stat-sub">{fmt(stats.ca_today)}</div>
            </div>

            {/* This Week */}
            <div className="udb-stat-card">
              <div className="udb-stat-icon green">
                <IconCalendar />
              </div>
              <div className="udb-stat-label">Cette Semaine</div>
              <div className="udb-stat-value">{stats.ventes_week}</div>
              <div className="udb-stat-sub">{fmt(stats.ca_week)}</div>
            </div>

            {/* This Month */}
            <div className="udb-stat-card">
              <div className="udb-stat-icon yellow">
                <IconDollar />
              </div>
              <div className="udb-stat-label">Ce Mois</div>
              <div className="udb-stat-value">{stats.ventes_month}</div>
              <div className="udb-stat-sub">{fmt(stats.ca_month)}</div>
              {stats.ventes_change_percent !== 0 && (
                <div className={`udb-stat-change ${stats.ventes_change_percent > 0 ? 'positive' : 'negative'}`}>
                  {stats.ventes_change_percent > 0 ? <IconTrendUp /> : <IconTrendDown />}
                  {Math.abs(stats.ventes_change_percent).toFixed(1)}% vs mois dernier
                </div>
              )}
            </div>

            {/* Average Sale */}
            <div className="udb-stat-card">
              <div className="udb-stat-icon purple">
                <IconStar />
              </div>
              <div className="udb-stat-label">Vente Moyenne</div>
              <div className="udb-stat-value">{fmt(stats.average_sale)}</div>
              <div className="udb-stat-sub">{stats.total_ventes} ventes totales</div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="udb-main-grid">
            
            {/* Chart */}
            <div className="udb-card">
              <div className="udb-card-header">
                <div>
                  <h3 className="udb-card-title">Performance des Ventes</h3>
                  <p className="udb-card-subtitle">Évolution du chiffre d'affaires</p>
                </div>
                <div className="udb-tabs">
                  <button className={`udb-tab ${chartPeriod === '7' ? 'active' : ''}`} onClick={() => setChartPeriod('7')}>7J</button>
                  <button className={`udb-tab ${chartPeriod === '30' ? 'active' : ''}`} onClick={() => setChartPeriod('30')}>30J</button>
                </div>
              </div>
              
              {stats.sales_chart_30_days && stats.sales_chart_30_days.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.sales_chart_30_days.slice(chartPeriod === '7' ? -7 : 0)}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      formatter={(value) => [fmt(value), 'CA']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="udb-empty">
                  <div className="udb-empty-text">Pas encore de données</div>
                  <div className="udb-empty-sub">Vos ventes apparaîtront ici</div>
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="udb-card">
              <div className="udb-card-header">
                <div>
                  <h3 className="udb-card-title">Top Produits</h3>
                  <p className="udb-card-subtitle">Mes meilleures ventes</p>
                </div>
              </div>
              
              {stats.my_top_products && stats.my_top_products.length > 0 ? (
                <div className="udb-products-grid">
                  {stats.my_top_products.map((product, index) => (
                    <div key={product.id} className="udb-product-item">
                      <div className={`udb-product-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                        #{index + 1}
                      </div>
                      <img 
                        src={product.image ? `http://localhost:8000/storage/${product.image}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(product.nom)}&background=2563eb&color=fff&size=96`}
                        alt={product.nom}
                        className="udb-product-img"
                      />
                      <div className="udb-product-info">
                        <div className="udb-product-name">{product.nom}</div>
                        <div className="udb-product-meta">{product.nombre_ventes} vente{product.nombre_ventes > 1 ? 's' : ''}</div>
                      </div>
                      <div className="udb-product-stats">
                        <div className="udb-product-qty">{product.total_quantite}</div>
                        <div className="udb-product-revenue">{fmtShort(product.total_revenue)} DH</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="udb-empty">
                  <div className="udb-empty-text">Aucune vente</div>
                  <div className="udb-empty-sub">Commencez à vendre</div>
                </div>
              )}
              
              <Link to="/ventes" className="udb-action-btn" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                <IconPlus /> Nouvelle Vente
              </Link>
            </div>

          </div>

          {/* Recent Sales */}
          <div className="udb-card">
            <div className="udb-card-header">
              <div>
                <h3 className="udb-card-title">Dernières Ventes</h3>
                <p className="udb-card-subtitle">Vos 10 ventes les plus récentes</p>
              </div>
              <Link to="/ventes/history" style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                Voir tout →
              </Link>
            </div>
            
            {stats.my_recent_sales && stats.my_recent_sales.length > 0 ? (
              <div className="udb-table-wrap">
                <table className="udb-table">
                  <thead>
                    <tr>
                      <th className="udb-th">Produit</th>
                      <th className="udb-th">Quantité</th>
                      <th className="udb-th">Prix Unitaire</th>
                      <th className="udb-th">Total</th>
                      <th className="udb-th">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.my_recent_sales.map(sale => (
                      <tr key={sale.id} className="udb-tr">
                        <td className="udb-td">{sale.produit_nom}</td>
                        <td className="udb-td">
                          <span className="udb-badge udb-badge-green">
                            <span className="udb-badge-dot" style={{ background: '#16a34a' }} />
                            {sale.quantite}
                          </span>
                        </td>
                        <td className="udb-td">{fmt(sale.prix_unitaire)}</td>
                        <td className="udb-td udb-td-mono">{fmt(sale.prix_total)}</td>
                        <td className="udb-td" style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>
                          {new Date(sale.date_vente).toLocaleDateString('fr-FR', { 
                            day: '2-digit', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="udb-empty">
                <div className="udb-empty-icon">📋</div>
                <div className="udb-empty-text">Aucune vente récente</div>
                <div className="udb-empty-sub">Vos ventes apparaîtront ici</div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default UserDashboard;