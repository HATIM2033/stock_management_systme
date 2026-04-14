import React, { useState, useEffect, useMemo } from 'react';
import alertService from '../../services/alertService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .al-root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --surface2: #f1f5f9;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --green: #16a34a;  --green-light: #f0fdf4;  --green-border: #bbf7d0;
    --yellow: #d97706; --yellow-light: #fffbeb;  --yellow-border: #fde68a;
    --red: #dc2626;    --red-light: #fef2f2;     --red-border: #fecaca;
    --blue: #2563eb;   --blue-light: #eff6ff;    --blue-border: #bfdbfe;
    --mono: 'DM Mono', monospace;
    --sans: 'DM Sans', sans-serif;
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 2.5rem 1rem;
  }
  .al-root *, .al-root *::before, .al-root *::after { box-sizing: border-box; }
  .al-container { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }

  /* ── Header ── */
  .al-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .al-title { font-size: 1.625rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
  .al-title span { color: var(--red); }
  .al-subtitle { font-size: 0.8125rem; color: var(--muted); margin-top: 0.35rem; }

  .al-confirm-all {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.65rem 1.1rem; background: var(--green); color: #fff;
    border: none; border-radius: 9px; font-family: var(--sans);
    font-size: 0.875rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 4px 12px rgba(22,163,74,0.2);
    transition: background 0.15s, box-shadow 0.15s;
  }
  .al-confirm-all:hover { background: #15803d; box-shadow: 0 6px 16px rgba(22,163,74,0.3); }
  .al-confirm-all:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Stats ── */
  .al-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  @media(max-width:900px){ .al-stats { grid-template-columns: repeat(2,1fr); } }
  @media(max-width:500px){ .al-stats { grid-template-columns: 1fr 1fr; } }

  .al-stat {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 1.25rem 1.375rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    display: flex; flex-direction: column; gap: 0.75rem;
    animation: alFadeUp 0.25s ease both;
  }
  .al-stat:nth-child(2){ animation-delay:.05s }
  .al-stat:nth-child(3){ animation-delay:.1s }
  .al-stat:nth-child(4){ animation-delay:.15s }
  .al-stat-top { display: flex; align-items: center; justify-content: space-between; }
  .al-stat-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
  .al-stat-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
  .al-stat-val { font-family: var(--mono); font-size: 1.75rem; font-weight: 500; letter-spacing: -0.03em; line-height: 1; }

  /* ── Filters ── */
  .al-filters {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 1rem 1.25rem;
    display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
  }
  .al-filter-label { font-size: 0.75rem; font-weight: 600; color: var(--muted); margin-right: 0.25rem; text-transform: uppercase; letter-spacing: 0.08em; }
  .al-filter-btn {
    padding: 0.45rem 0.9rem; border-radius: 20px; border: 1.5px solid var(--border);
    background: transparent; font-family: var(--sans); font-size: 0.8125rem; font-weight: 500;
    color: var(--muted); cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .al-filter-btn:hover { border-color: #94a3b8; color: var(--text); background: var(--surface2); }
  .al-filter-btn.active-all      { background: var(--accent-light); color: var(--accent); border-color: var(--accent); font-weight: 600; }
  .al-filter-btn.active-pending  { background: var(--yellow-light); color: var(--yellow); border-color: var(--yellow-border); font-weight: 600; }
  .al-filter-btn.active-critical { background: var(--red-light);    color: var(--red);    border-color: var(--red-border);    font-weight: 600; }
  .al-filter-btn.active-warning  { background: var(--yellow-light); color: var(--yellow); border-color: var(--yellow-border); font-weight: 600; }

  /* ── Result count ── */
  .al-count {
    font-size: 0.75rem; color: var(--muted); font-weight: 500;
    padding: 0 0.25rem;
  }
  .al-count b { color: var(--text); }

  /* ── Alert List ── */
  .al-list { display: flex; flex-direction: column; gap: 0.75rem; }

  /* ── Alert Item ── */
  .al-item {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    display: flex; transition: box-shadow 0.2s, opacity 0.2s;
    animation: alFadeUp 0.22s ease both;
  }
  .al-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
  .al-item.acked { opacity: 0.55; }

  /* Left accent bar */
  .al-bar { width: 5px; flex-shrink: 0; }
  .al-bar-critical { background: var(--red); }
  .al-bar-warning  { background: var(--yellow); }
  .al-bar-info     { background: var(--blue); }

  /* Item content */
  .al-item-inner { flex: 1; padding: 1.125rem 1.25rem; display: flex; gap: 1rem; align-items: flex-start; min-width: 0; }

  /* Icon bubble */
  .al-icon-bubble {
    width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    margin-top: 0.1rem;
  }
  .al-icon-critical { background: var(--red-light); color: var(--red); }
  .al-icon-warning  { background: var(--yellow-light); color: var(--yellow); }
  .al-icon-info     { background: var(--blue-light); color: var(--blue); }

  /* Text */
  .al-item-body { flex: 1; min-width: 0; }
  .al-item-top { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.25rem; }
  .al-item-msg { font-size: 0.9375rem; font-weight: 600; color: var(--text); }

  .al-type-badge {
    display: inline-flex; align-items: center; gap: 0.25rem;
    padding: 0.15rem 0.55rem; border-radius: 20px;
    font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    white-space: nowrap;
  }
  .al-badge-critical { background: var(--red-light);    color: var(--red);    border: 1px solid var(--red-border); }
  .al-badge-warning  { background: var(--yellow-light); color: var(--yellow); border: 1px solid var(--yellow-border); }
  .al-badge-info     { background: var(--blue-light);   color: var(--blue);   border: 1px solid var(--blue-border); }

  .al-acked-badge {
    display: inline-flex; align-items: center; gap: 0.25rem;
    padding: 0.15rem 0.55rem; border-radius: 20px;
    font-size: 0.6875rem; font-weight: 700;
    background: var(--green-light); color: var(--green); border: 1px solid var(--green-border);
  }

  .al-item-desc { font-size: 0.8125rem; color: var(--muted); margin-bottom: 0.5rem; line-height: 1.5; }

  .al-item-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem; }
  .al-meta-chip {
    display: inline-flex; align-items: center; gap: 0.3rem;
    font-size: 0.7rem; color: var(--muted); font-family: var(--mono);
    background: var(--surface2); padding: 0.2rem 0.55rem; border-radius: 6px;
  }

  /* Actions */
  .al-item-actions { display: flex; align-items: center; gap: 0.375rem; flex-shrink: 0; padding-left: 0.5rem; }
  .al-action-btn {
    width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--surface2); display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: all 0.15s;
  }
  .al-action-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .al-action-btn.confirm:hover { border-color: var(--green); color: var(--green); background: var(--green-light); }

  /* Empty */
  .al-empty {
    padding: 4rem 1.5rem; text-align: center;
    background: var(--surface); border: 1px dashed var(--border); border-radius: 16px;
    color: var(--muted);
  }
  .al-empty-icon { opacity: 0.18; display: flex; justify-content: center; margin-bottom: 0.875rem; }
  .al-empty-title { font-size: 0.9375rem; font-weight: 600; color: var(--text); }
  .al-empty-sub { font-size: 0.8125rem; color: var(--muted); margin-top: 0.25rem; }

  /* Animations */
  @keyframes alFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBell     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IconWarn     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconInfo     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconCheck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconCheckAll = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconEye      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconClock    = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconBox      = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>;
const IconEmpty    = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => new Date(d).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

const TYPE_LABELS = { low_stock: 'Stock faible', out_of_stock: 'Rupture', system: 'Système' };

const FILTERS = [
  { key: 'all',       label: 'Toutes',          activeClass: 'active-all' },
  { key: 'pending',   label: 'Non confirmées',   activeClass: 'active-pending' },
  { key: 'critical',  label: 'Critiques',        activeClass: 'active-critical' },
  { key: 'warning',   label: 'Avertissements',   activeClass: 'active-warning' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
const AlertList = () => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [confirming, setConfirming] = useState(false);

  // ✅ Fetch real alerts from API
  useEffect(() => {
    let cancelled = false;
    
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching alerts from API...');
        
        const response = await alertService.getAllAlerts();
        console.log('📦 Raw alerts response:', response);
        
        const alertsData = Array.isArray(response)
          ? response
          : (response?.data || []);
        
        console.log('✅ Alerts loaded:', alertsData.length);
        
        if (!cancelled) {
          setAlerts(alertsData);
        }
        
      } catch (err) {
        console.error('❌ Error fetching alerts:', err);
        if (!cancelled) {
          setError('Erreur lors du chargement des alertes');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchAlerts();
    
    return () => { cancelled = true; };
  }, []); // ✅ Empty dependency array

  const filtered = useMemo(() => alerts.filter(a => {
    if (filter === 'all')      return true;
    if (filter === 'pending')  return a.lu === 0 || !a.lu;
    if (filter === 'critical') return a.type === 'critique';
    if (filter === 'warning')  return a.type === 'attention';
    return true;
  }), [alerts, filter]);

  const stats = useMemo(() => ({
    total:    alerts.length,
    critical: alerts.filter(a => a.type === 'critique').length,
    warning:  alerts.filter(a => a.type === 'attention').length,
    acked:    alerts.filter(a => a.lu === 1).length,
  }), [alerts]);

  const pendingCount = alerts.filter(a => a.lu === 0 || !a.lu).length;

  const acknowledge = async (id) => {
    try {
      await alertService.markAsRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, lu: 1 } : a));
      showSuccess('Alerte confirmée');
    } catch (err) {
      console.error('Error marking alert as read:', err);
      showError('Erreur lors de la confirmation');
    }
  };

  const acknowledgeAll = async () => {
    try {
      setConfirming(true);
      await alertService.markAllAsRead();
      setAlerts(prev => prev.map(a => ({ ...a, lu: 1 })));
      showSuccess('Toutes les alertes ont été confirmées');
    } catch (err) {
      console.error('Error marking all as read:', err);
      showError('Erreur lors de la confirmation');
    } finally {
      setConfirming(false);
    }
  };

  const getSeverity = (alert) => {
    if (alert.type === 'critique') return 'critical';
    if (alert.type === 'attention') return 'warning';
    return 'info';
  };

  const formatAlertMessage = (alert) => {
    if (alert.message) return alert.message;
    const productName = alert.produit?.nom || 'Produit';
    if (alert.type === 'critique') return `Rupture de stock pour "${productName}"`;
    return `Stock faible pour "${productName}"`;
  };

  const formatAlertDescription = (alert) => {
    if (alert.produit) {
      const stock = alert.produit.quantite_stock || 0;
      const seuil = alert.produit.seuil_alerte || 0;
      return `Stock actuel: ${stock} — Seuil d'alerte: ${seuil}`;
    }
    return alert.description || '';
  };

  if (loading) return <Loading text="Chargement des alertes..." />;
  if (error)   return <ErrorMessage message={error} variant="error" />;

  return (
    <>
      <style>{STYLES}</style>
      <div className="al-root">
        <div className="al-container">

          {/* Header */}
          <header className="al-header">
            <div>
              <h1 className="al-title">Alertes <span>Stock</span></h1>
              <p className="al-subtitle">
                {pendingCount > 0
                  ? `${pendingCount} alerte${pendingCount > 1 ? 's' : ''} en attente de confirmation`
                  : 'Toutes les alertes sont confirmées'}
              </p>
            </div>
            {pendingCount > 0 && (
              <button 
                className="al-confirm-all" 
                onClick={acknowledgeAll}
                disabled={confirming}
              >
                <IconCheckAll /> {confirming ? 'Confirmation...' : `Tout confirmer (${pendingCount})`}
              </button>
            )}
          </header>

          {/* Stats */}
          <div className="al-stats">
            {[
              { label:'Total', val: stats.total,    icon: <IconBell />, iconBg:'#f1f5f9', iconColor:'#64748b', valColor:'#0f172a' },
              { label:'Critiques', val: stats.critical, icon: <IconWarn />, iconBg:'var(--red-light)',    iconColor:'var(--red)',    valColor:'var(--red)' },
              { label:'Avertissements', val: stats.warning,  icon: <IconWarn />, iconBg:'var(--yellow-light)', iconColor:'var(--yellow)', valColor:'var(--yellow)' },
              { label:'Confirmées', val: stats.acked,   icon: <IconCheck/>, iconBg:'var(--green-light)',  iconColor:'var(--green)',  valColor:'var(--green)' },
            ].map((s, i) => (
              <div key={i} className="al-stat">
                <div className="al-stat-top">
                  <span className="al-stat-label">{s.label}</span>
                  <div className="al-stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
                </div>
                <p className="al-stat-val" style={{ color: s.valColor }}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="al-filters">
            <span className="al-filter-label">Filtrer</span>
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`al-filter-btn${filter === f.key ? ' ' + f.activeClass : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                {f.key === 'pending' && pendingCount > 0 && (
                  <span style={{ marginLeft:'0.35rem', background:'var(--yellow)', color:'#fff', borderRadius:'20px', padding:'0 0.4rem', fontSize:'0.65rem', fontWeight:700 }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
            <span className="al-count" style={{ marginLeft:'auto' }}>
              <b>{filtered.length}</b> / {alerts.length}
            </span>
          </div>

          {/* List */}
          <div className="al-list">
            {filtered.length === 0 ? (
              <div className="al-empty">
                <div className="al-empty-icon"><IconEmpty /></div>
                <p className="al-empty-title">Aucune alerte trouvée</p>
                <p className="al-empty-sub">
                  {filter !== 'all' 
                    ? 'Aucune alerte ne correspond au filtre actif' 
                    : 'Aucune alerte stock pour le moment'}
                </p>
              </div>
            ) : filtered.map((alert, i) => {
              const severity = getSeverity(alert);
              const isRead = alert.lu === 1;
              
              return (
                <div key={alert.id} className={`al-item${isRead ? ' acked' : ''}`} style={{ animationDelay: `${i * 0.04}s` }}>
                  {/* Accent bar */}
                  <div className={`al-bar al-bar-${severity}`} />

                  <div className="al-item-inner">
                    {/* Icon */}
                    <div className={`al-icon-bubble al-icon-${severity}`}>
                      {severity === 'info' ? <IconInfo /> : <IconWarn />}
                    </div>

                    {/* Body */}
                    <div className="al-item-body">
                      <div className="al-item-top">
                        <span className="al-item-msg">{formatAlertMessage(alert)}</span>
                        <span className={`al-type-badge al-badge-${severity}`}>
                          {alert.type === 'critique' ? 'Critique' : alert.type === 'attention' ? 'Attention' : alert.type}
                        </span>
                        {isRead && (
                          <span className="al-acked-badge"><IconCheck /> Confirmée</span>
                        )}
                      </div>
                      <p className="al-item-desc">{formatAlertDescription(alert)}</p>
                      <div className="al-item-meta">
                        <span className="al-meta-chip"><IconClock /> {fmt(alert.created_at)}</span>
                        {alert.produit && (
                          <span className="al-meta-chip"><IconBox /> {alert.produit.nom}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!isRead && (
                      <div className="al-item-actions">
                        {alert.produit_id && (
                          <button 
                            className="al-action-btn" 
                            title="Voir le produit"
                            onClick={() => navigate(`/produits/${alert.produit_id}`)}
                          >
                            <IconEye />
                          </button>
                        )}
                        <button 
                          className="al-action-btn confirm" 
                          title="Confirmer l'alerte" 
                          onClick={() => acknowledge(alert.id)}
                        >
                          <IconCheck />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
};

export default AlertList;