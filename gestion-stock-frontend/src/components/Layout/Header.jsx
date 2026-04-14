import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .hd-root {
    --surface: #ffffff;
    --surface2: #f8fafc;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --red: #dc2626;
    --sans: 'DM Sans', sans-serif;
    --mono: 'DM Mono', monospace;

    background: var(--surface);
    border-bottom: 1px solid var(--border);
    font-family: var(--sans);
    position: sticky; top: 0; z-index: 30;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }

  .hd-inner {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 1.75rem; height: 60px; gap: 1rem;
  }

  /* Burger button — only visible on mobile */
  .hd-burger {
    display: none;
    align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 9px;
    border: 1px solid var(--border); background: var(--surface2);
    cursor: pointer; color: var(--text);
    transition: all 0.15s; flex-shrink: 0;
  }
  .hd-burger:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

  @media (max-width: 768px) {
    .hd-burger { display: flex; }
    .hd-inner { padding: 0 1rem; }
    .hd-date { display: none !important; }
  }

  .hd-left { display: flex; align-items: center; gap: 0.75rem; }

  .hd-page-title { font-size: 1rem; font-weight: 700; color: var(--text); letter-spacing: -0.01em; }
  .hd-breadcrumb { display: flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; color: var(--muted); margin-top: 0.1rem; }
  .hd-bc-sep { opacity: 0.4; }
  .hd-bc-cur { color: var(--accent); font-weight: 600; }

  .hd-right { display: flex; align-items: center; gap: 0.5rem; }

  .hd-date {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.375rem 0.75rem; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface2);
    font-size: 0.75rem; color: var(--muted); font-family: var(--mono);
    white-space: nowrap;
  }

  .hd-icon-btn {
    width: 36px; height: 36px; border-radius: 9px;
    border: 1px solid var(--border); background: var(--surface2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: all 0.15s;
    position: relative;
  }
  .hd-icon-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .hd-notif-dot {
    position: absolute; top: 5px; right: 5px;
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--red); border: 1.5px solid var(--surface);
  }

  .hd-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; min-width: 260px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1); overflow: hidden; z-index: 100;
    animation: hdDrop 0.16s cubic-bezier(0.16,1,0.3,1) both;
  }
  .hd-dropdown-header {
    padding: 0.75rem 1rem; font-size: 0.6875rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted);
    border-bottom: 1px solid var(--border); background: var(--surface2);
  }
  .hd-notif-empty { padding: 2rem 1rem; text-align: center; font-size: 0.875rem; color: var(--muted); }

  @keyframes hdDrop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
`;

const TITLES = {
  '/dashboard':    { title: 'Tableau de Bord',     crumb: ['Dashboard'] },
  '/produits':     { title: 'Produits',             crumb: ['Dashboard', 'Produits'] },
  '/produits/add': { title: 'Ajouter un Produit',   crumb: ['Dashboard', 'Produits', 'Ajouter'] },
  '/ventes':       { title: 'Ventes',               crumb: ['Dashboard', 'Ventes'] },
  '/categories':   { title: 'Catégories',           crumb: ['Dashboard', 'Admin', 'Catégories'] },
  '/fournisseurs': { title: 'Fournisseurs',         crumb: ['Dashboard', 'Admin', 'Fournisseurs'] },
  '/alertes':      { title: 'Alertes Stock',        crumb: ['Dashboard', 'Admin', 'Alertes'] },
};

const getPageInfo = (pathname) => {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.includes('/edit'))   return { title: 'Modifier le Produit', crumb: ['Dashboard', 'Produits', 'Modifier'] };
  if (pathname.match(/\/produits\/\d+$/)) return { title: 'Détail Produit', crumb: ['Dashboard', 'Produits', 'Détail'] };
  if (pathname.includes('/history')) return { title: 'Historique des Ventes', crumb: ['Dashboard', 'Ventes', 'Historique'] };
  const match = Object.keys(TITLES).find(k => k !== '/dashboard' && pathname.startsWith(k));
  return match ? TITLES[match] : { title: 'Gestion Stock', crumb: ['Dashboard'] };
};

const IconBell = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const IconBurger = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const Header = ({ isMobile, onBurgerClick }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!e.target.closest('.hd-notif-wrap')) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const { title, crumb } = getPageInfo(location.pathname);
  const dateStr = time.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <style>{STYLES}</style>
      <header className="hd-root">
        <div className="hd-inner">

          <div className="hd-left">
            {/* Burger — mobile only */}
            {isMobile && (
              <button className="hd-burger" onClick={onBurgerClick} aria-label="Menu">
                <IconBurger />
              </button>
            )}

            <div>
              <p className="hd-page-title">{title}</p>
              {crumb.length > 1 && (
                <nav className="hd-breadcrumb">
                  {crumb.map((c, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="hd-bc-sep">/</span>}
                      <span className={i === crumb.length - 1 ? 'hd-bc-cur' : ''}>{c}</span>
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>
          </div>

          <div className="hd-right">
            <div className="hd-date">
              <span style={{ textTransform: 'capitalize' }}>{dateStr}</span>
              <span style={{ opacity: 0.35 }}>|</span>
              <span>{timeStr}</span>
            </div>

            <div className="hd-notif-wrap" style={{ position: 'relative' }}>
              <button className="hd-icon-btn" onClick={() => setOpen(o => !o)} aria-label="Notifications">
                <IconBell />
                <span className="hd-notif-dot" />
              </button>
              {open && (
                <div className="hd-dropdown">
                  <p className="hd-dropdown-header">Notifications</p>
                  <div className="hd-notif-empty">Aucune nouvelle notification</div>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>
    </>
  );
};

export default Header;