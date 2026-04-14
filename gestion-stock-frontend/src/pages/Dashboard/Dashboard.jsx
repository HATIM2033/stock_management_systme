import { useEffect, useState, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import dashboardService from '../../services/dashboardService';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' DH';

const fmtCompact = (n) => {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n));
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .db-root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --surface2: #f1f5f9;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --green: #16a34a; --green-light: #f0fdf4;
    --red: #dc2626;   --red-light: #fef2f2;
    --yellow: #d97706; --yellow-light: #fffbeb;
    --purple: #7c3aed; --purple-light: #f5f3ff;
    --mono: 'DM Mono', monospace;
    --sans: 'DM Sans', sans-serif;
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 2.5rem 1rem;
  }
  .db-root *, .db-root *::before, .db-root *::after { box-sizing: border-box; }
  .db-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }

  /* Header */
  .db-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .db-title { font-size: 1.625rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
  .db-title span { color: var(--accent); }
  .db-subtitle { font-size: 0.8125rem; color: var(--muted); margin-top: 0.35rem; }
  .db-refresh-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.6rem 1rem; border: 1px solid var(--border); border-radius: 9px;
    background: var(--surface); color: var(--muted); font-family: var(--sans);
    font-size: 0.8125rem; font-weight: 500; cursor: pointer;
    transition: all 0.15s;
  }
  .db-refresh-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

  /* Stat cards */
  .db-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  @media (max-width: 900px) { .db-stats { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px) { .db-stats { grid-template-columns: 1fr; } }

  .db-stat {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 1.375rem 1.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    display: flex; flex-direction: column; gap: 0.875rem;
    animation: dbFadeUp 0.28s ease both;
  }
  .db-stat:nth-child(2) { animation-delay: 0.05s; }
  .db-stat:nth-child(3) { animation-delay: 0.10s; }
  .db-stat:nth-child(4) { animation-delay: 0.15s; }

  .db-stat-top { display: flex; align-items: center; justify-content: space-between; }
  .db-stat-label { font-size: 0.75rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .db-stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .db-stat-val { font-family: var(--mono); font-size: 1.75rem; font-weight: 500; letter-spacing: -0.03em; line-height: 1; }
  .db-stat-sub { font-size: 0.75rem; color: var(--muted); }

  /* Card */
  .db-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 1.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    animation: dbFadeUp 0.28s ease both;
  }
  .db-card-title {
    font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--muted);
    margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;
  }
  .db-card-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* Chart title row — override pour avoir les buttons à droite */
  .db-chart-title-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem;
  }
  .db-chart-title-label {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--muted);
  }

  /* Chart grid */
  .db-chart-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
  @media (max-width: 800px) { .db-chart-grid { grid-template-columns: 1fr; } }

  /* Chart empty */
  .db-chart-empty {
    height: 240px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 0.5rem;
    color: var(--muted); font-size: 0.875rem;
  }
  .db-chart-empty-icon { opacity: 0.2; margin-bottom: 0.25rem; }

  /* Custom tooltip */
  .db-tooltip {
    background: var(--text); color: #fff; border-radius: 8px;
    padding: 0.5rem 0.875rem; font-family: var(--mono);
    font-size: 0.8125rem; font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  /* Alerts list */
  .db-alerts { display: flex; flex-direction: column; gap: 0.625rem; }
  .db-alert-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem; border-radius: 10px; background: var(--surface2);
    border: 1px solid var(--border);
    transition: background 0.15s;
  }
  .db-alert-item:hover { background: #eef2f7; }
  .db-alert-bar { width: 4px; border-radius: 999px; flex-shrink: 0; align-self: stretch; min-height: 32px; }
  .db-alert-name { font-size: 0.875rem; font-weight: 600; color: var(--text); }
  .db-alert-badge {
    margin-left: auto; padding: 0.2rem 0.6rem; border-radius: 20px;
    font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    white-space: nowrap;
  }
  .db-alert-empty {
    padding: 2.5rem 1rem; text-align: center;
    font-size: 0.875rem; color: var(--muted);
    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  }
  .db-alert-empty-icon { opacity: 0.2; }

  /* Top products table */
  .db-table { width: 100%; border-collapse: collapse; }
  .db-th {
    padding: 0.75rem 1rem; text-align: left; background: var(--surface2);
    font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--muted);
    border-bottom: 1px solid var(--border);
  }
  .db-th:last-child { text-align: right; }
  .db-th:nth-child(4) { text-align: right; }
  .db-tr {
    border-bottom: 1px solid var(--border);
    transition: background 0.12s;
    animation: dbFadeUp 0.2s ease both;
  }
  .db-tr:last-child { border-bottom: none; }
  .db-tr:hover { background: var(--surface2); }
  .db-td { padding: 0.875rem 1rem; font-size: 0.875rem; }
  .db-td-right { text-align: right; }
  .db-rank {
    width: 28px; height: 28px; border-radius: 8px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 700;
  }
  .db-rank-1 { background: #fef9c3; color: #854d0e; }
  .db-rank-2 { background: #f1f5f9; color: #475569; }
  .db-rank-3 { background: #fef3c7; color: #92400e; }
  .db-rank-n { background: var(--surface2); color: var(--muted); }
  .db-product-name { font-weight: 600; color: var(--text); }
  .db-cat-badge {
    display: inline-block; padding: 0.2rem 0.6rem; border-radius: 20px;
    font-size: 0.7rem; font-weight: 500;
    background: var(--accent-light); color: var(--accent);
  }
  .db-qty { font-family: var(--mono); font-size: 0.8125rem; font-weight: 500; }
  .db-rev { font-family: var(--mono); font-size: 0.875rem; font-weight: 500; color: var(--green); }

  .db-table-empty {
    padding: 3rem 1rem; text-align: center; font-size: 0.875rem; color: var(--muted);
    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  }
  .db-table-empty-icon { opacity: 0.2; }
  .db-table-wrap { border-radius: 10px; border: 1px solid var(--border); overflow: hidden; }

  /* Animations */
  @keyframes dbFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  /* Chart period selector */
  .db-period-btns { display: flex; gap: 0.25rem; }
  .db-period-btn {
    padding: 0.25rem 0.65rem; border-radius: 6px; border: 1px solid var(--border);
    background: transparent; font-family: var(--mono); font-size: 0.7rem;
    font-weight: 500; color: var(--muted); cursor: pointer;
    transition: all 0.15s;
  }
  .db-period-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .db-period-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBox     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>;
const IconMoney   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconWarn    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconUsers   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IconRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>;
const IconChart   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconShield  = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconTrophy  = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="10"/><path d="M7 4H4a2 2 0 000 4c0 3.31 2.69 6 6 6s6-2.69 6-6a2 2 0 000-4h-3"/><rect x="7" y="2" width="10" height="2" rx="1"/></svg>;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="db-tooltip">
      <div style={{ fontSize: '0.7rem', opacity: 0.65, marginBottom: '0.2rem' }}>{label}</div>
      {fmt(payload[0]?.value ?? 0)}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [chartPeriod, setChartPeriod] = useState(30);

  const fetchStats = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
      setError(null);
    } catch {
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <Loading />;
  if (error)   return <ErrorMessage message={error} onClose={() => setError(null)} />;
  if (!stats)  return (
    <>
      <style>{STYLES}</style>
      <div className="db-root" style={{ textAlign: 'center', paddingTop: '4rem', color: '#64748b' }}>
        Aucune donnée disponible
      </div>
    </>
  );

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const statCards = [
    {
      label: 'Total Produits',
      value: fmtCompact(stats.total_produits ?? 0),
      sub: `${stats.total_produits ?? 0} produits`,
      icon: <IconBox />,
      iconBg: 'var(--accent-light)', iconColor: 'var(--accent)',
      valColor: 'var(--accent)',
    },
    {
      label: "Ventes aujourd'hui",
      value: fmt(stats.total_ventes_today ?? 0),
      sub: 'chiffre du jour',
      icon: <IconMoney />,
      iconBg: 'var(--green-light)', iconColor: 'var(--green)',
      valColor: 'var(--green)',
    },
    {
      label: 'Alertes stock',
      value: fmtCompact(stats.total_alertes ?? 0),
      sub: stats.total_alertes > 0 ? 'produits en alerte' : 'tout est OK',
      icon: <IconWarn />,
      iconBg: 'var(--red-light)', iconColor: 'var(--red)',
      valColor: stats.total_alertes > 0 ? 'var(--red)' : 'var(--green)',
    },
    {
      label: 'Utilisateurs',
      value: fmtCompact(stats.total_users ?? 0),
      sub: `${stats.total_users ?? 0} comptes actifs`,
      icon: <IconUsers />,
      iconBg: 'var(--purple-light)', iconColor: 'var(--purple)',
      valColor: 'var(--purple)',
    },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="db-root">
        <div className="db-container">

          {/* ── Header ── */}
          <header className="db-header">
            <div>
              <h1 className="db-title">Tableau de <span>Bord</span></h1>
              <p className="db-subtitle" style={{ textTransform: 'capitalize' }}>{today}</p>
            </div>
            <button className="db-refresh-btn" onClick={() => fetchStats(true)} disabled={refreshing}>
              <span style={{ display: 'inline-block', transition: 'transform 0.5s', transform: refreshing ? 'rotate(360deg)' : 'none' }}>
                <IconRefresh />
              </span>
              Actualiser
            </button>
          </header>

          {/* ── Stat cards ── */}
          <div className="db-stats">
            {statCards.map((c, i) => (
              <div key={i} className="db-stat">
                <div className="db-stat-top">
                  <span className="db-stat-label">{c.label}</span>
                  <div className="db-stat-icon" style={{ background: c.iconBg, color: c.iconColor }}>
                    {c.icon}
                  </div>
                </div>
                <div>
                  <p className="db-stat-val" style={{ color: c.valColor }}>{c.value}</p>
                  <p className="db-stat-sub">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Chart + Alerts ── */}
          <div className="db-chart-grid">

            {/* Area chart */}
            <div className="db-card" style={{ animationDelay: '0.2s', overflow: 'hidden' }}>
              <div className="db-chart-title-row">
                <span className="db-chart-title-label">
                  <IconChart /> Ventes
                </span>
                <div className="db-period-btns">
                  {[7, 15, 30].map(p => (
                    <button
                      key={p}
                      className={`db-period-btn${chartPeriod === p ? ' active' : ''}`}
                      onClick={() => setChartPeriod(p)}
                    >
                      {p}j
                    </button>
                  ))}
                </div>
              </div>
              {stats.ventes_last_7_days?.length > 0 ? (() => {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - (chartPeriod - 1));
                const chartData = stats.ventes_last_7_days.filter(d => new Date(d.date) >= cutoff);
                const interval = chartPeriod === 7 ? 0 : chartPeriod === 15 ? 1 : 3;
                return (
                  <div style={{ width: '100%', height: 260, minHeight: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="dbGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Mono' }}
                          axisLine={false} tickLine={false}
                          tickFormatter={(d) => { const [, m, day] = d.split('-'); return `${day}/${m}`; }}
                          interval={interval}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Mono' }}
                          axisLine={false} tickLine={false}
                          tickFormatter={fmtCompact}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 2' }} />
                        <Area
                          type="monotone" dataKey="total"
                          stroke="#2563eb" strokeWidth={2.5}
                          fill="url(#dbGrad)"
                          dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                );
              })() : (
                <div className="db-chart-empty">
                  <div className="db-chart-empty-icon"><IconChart /></div>
                  <span>Aucune vente enregistrée</span>
                  <span style={{ fontSize: '0.75rem' }}>Les données apparaîtront après les premières ventes</span>
                </div>
              )}
            </div>

            <div className="db-card" style={{ animationDelay: '0.25s', display: 'flex', flexDirection: 'column' }}>
              <p className="db-card-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <IconShield /> Alertes récentes
                </span>
              </p>
              {stats.recent_alertes?.length > 0 ? (
                <>
                  <div className="db-alerts" style={{ flex: 1 }}>
                    {stats.recent_alertes.slice(0, 3).map((alert) => {
                      const isCritique =
                        alert.priority === 'haute' ||
                        alert.priority === 'critique' ||
                        alert.type === 'critique' ||
                        alert.type === 'out_of_stock';
                      const label = alert.priority ?? alert.type ?? 'alerte';
                      return (
                        <div key={alert.id} className="db-alert-item">
                          <div className="db-alert-bar" style={{ background: isCritique ? '#dc2626' : '#d97706' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="db-alert-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {alert.product_name}
                            </p>
                            {alert.message && (
                              <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {alert.message}
                              </p>
                            )}
                          </div>
                          <span
                            className="db-alert-badge"
                            style={{
                              background: isCritique ? '#fef2f2' : '#fffbeb',
                              color:      isCritique ? '#dc2626' : '#d97706',
                            }}
                          >
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <a
                    href="/alertes"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                      marginTop: '1rem', padding: '0.6rem',
                      borderRadius: '9px', border: '1px solid var(--border)',
                      fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)',
                      textDecoration: 'none', background: 'var(--accent-light)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-light)'}
                  >
                    Voir toutes les alertes
                    {stats.recent_alertes.length > 3 && (
                      <span style={{
                        background: 'var(--accent)', color: '#fff',
                        borderRadius: '20px', padding: '0.1rem 0.5rem',
                        fontSize: '0.7rem', fontWeight: 700,
                      }}>
                        +{stats.recent_alertes.length - 3}
                      </span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </a>
                </>
              ) : (
                <div className="db-alert-empty">
                  <div className="db-alert-empty-icon"><IconShield /></div>
                  <span>Aucune alerte active</span>
                  <span style={{ fontSize: '0.75rem' }}>Tous les stocks sont au-dessus du seuil</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Top products ── */}
          <div className="db-card" style={{ padding: 0, animationDelay: '0.3s' }}>
            <div style={{ padding: '1.5rem 1.5rem 0' }}>
              <p className="db-card-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <IconTrophy /> Top 5 — Produits les plus vendus
                </span>
              </p>
            </div>
            {stats.top_products?.length > 0 ? (
              <div className="db-table-wrap" style={{ margin: '0 0 0 0', borderRadius: '0 0 14px 14px', border: 'none', borderTop: '1px solid var(--border)' }}>
                <table className="db-table">
                  <thead>
                    <tr>
                      <th className="db-th" style={{ width: '48px' }}>#</th>
                      <th className="db-th">Produit</th>
                      <th className="db-th">Catégorie</th>
                      <th className="db-th" style={{ textAlign: 'right' }}>Qté vendue</th>
                      <th className="db-th" style={{ textAlign: 'right' }}>Revenu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.top_products.map((product, i) => (
                      <tr key={i} className="db-tr" style={{ animationDelay: `${0.32 + i * 0.04}s` }}>
                        <td className="db-td">
                          <span className={`db-rank ${i === 0 ? 'db-rank-1' : i === 1 ? 'db-rank-2' : i === 2 ? 'db-rank-3' : 'db-rank-n'}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="db-td">
                          <span className="db-product-name">{product.product_name}</span>
                        </td>
                        <td className="db-td">
                          <span className="db-cat-badge">{product.category_name}</span>
                        </td>
                        <td className="db-td db-td-right">
                          <span className="db-qty">{product.total_quantity}</span>
                        </td>
                        <td className="db-td db-td-right">
                          <span className="db-rev">{fmt(product.total_revenue)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="db-table-empty" style={{ padding: '3rem 1.5rem' }}>
                <div className="db-table-empty-icon"><IconTrophy /></div>
                <span>Aucune vente enregistrée</span>
                <span style={{ fontSize: '0.75rem' }}>Le classement apparaîtra après les premières ventes</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;