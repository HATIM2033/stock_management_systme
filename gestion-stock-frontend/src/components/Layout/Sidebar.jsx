import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .sb-root {
    --surface: #ffffff;
    --surface2: #f8fafc;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #64748b;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --red: #dc2626;
    --red-light: #fef2f2;
    --sans: 'DM Sans', sans-serif;
    --mono: 'DM Mono', monospace;

    width: 240px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    height: 100vh;
    position: fixed; left: 0; top: 0;
    display: flex; flex-direction: column;
    font-family: var(--sans);
    z-index: 40;
    transition: width 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.22s cubic-bezier(0.4,0,0.2,1);
    overflow: hidden;
  }
  .sb-root.sb-collapsed { width: 64px; }

  /* Mobile: hidden by default, slides in when open */
  @media (max-width: 768px) {
    .sb-root {
      width: 240px !important;
      transform: translateX(-100%);
      box-shadow: 4px 0 24px rgba(0,0,0,0.12);
    }
    .sb-root.sb-mobile-open {
      transform: translateX(0);
    }
  }

  /* ── Logo row ── */
  .sb-logo {
    height: 60px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    flex-shrink: 0; overflow: hidden;
    padding: 0 0.75rem; gap: 0.5rem;
  }

  .sb-logo-icon {
    width: 34px; height: 34px; border-radius: 9px;
    background: var(--accent); display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .sb-logo-text {
    font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.02em;
    color: var(--text); white-space: nowrap;
    flex: 1; min-width: 0;
    overflow: hidden;
    opacity: 1;
    transition: opacity 0.12s;
  }
  .sb-logo-text span { color: var(--accent); }
  .sb-collapsed .sb-logo-text { opacity: 0; }

  /* Toggle btn */
  .sb-toggle-btn {
    background: none; border: 1px solid var(--border); cursor: pointer;
    color: var(--muted); width: 26px; height: 26px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: color 0.15s, background 0.15s, border-color 0.15s, transform 0.22s;
  }
  .sb-toggle-btn:hover { color: var(--accent); background: var(--accent-light); border-color: var(--accent); }
  .sb-collapsed .sb-toggle-btn { transform: rotate(180deg); }

  /* Hide toggle on mobile */
  @media (max-width: 768px) {
    .sb-toggle-btn { display: none; }
  }

  /* ── Nav ── */
  .sb-nav {
    flex: 1; padding: 0.875rem 0.5rem;
    display: flex; flex-direction: column; gap: 0.125rem;
    overflow-y: auto; overflow-x: hidden;
    scrollbar-width: none;
  }
  .sb-nav::-webkit-scrollbar { display: none; }

  .sb-section-label {
    font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--muted);
    padding: 0.625rem 0.625rem 0.25rem;
    margin-top: 0.25rem; white-space: nowrap;
    opacity: 1; transition: opacity 0.1s;
  }
  .sb-collapsed .sb-section-label { opacity: 0; height: 0; padding: 0; margin: 0; overflow: hidden; }

  .sb-divider { height: 1px; background: var(--border); margin: 0.5rem 0.25rem; display: none; }
  .sb-collapsed .sb-divider { display: block; }

  /* ── Nav link ── */
  .sb-link {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.625rem 0.75rem; border-radius: 9px;
    font-size: 0.875rem; font-weight: 500; color: var(--muted);
    text-decoration: none; transition: background 0.15s, color 0.15s, padding 0.22s;
    position: relative; white-space: nowrap;
  }
  .sb-link:hover { background: var(--surface2); color: var(--text); }
  .sb-link.active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
  .sb-link.active::before {
    content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0; background: var(--accent);
  }

  .sb-collapsed .sb-link { padding: 0.625rem; justify-content: center; }
  .sb-collapsed .sb-link.active::before { display: none; }
  .sb-collapsed .sb-link.active::after {
    content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0; background: var(--accent);
  }

  .sb-link-icon { width: 18px; height: 18px; flex-shrink: 0; }
  .sb-link-label { overflow: hidden; opacity: 1; transition: opacity 0.12s; }
  .sb-collapsed .sb-link-label { opacity: 0; width: 0; overflow: hidden; }

  /* ── Tooltip ── */
  .sb-tip {
    display: none; position: absolute;
    left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
    background: var(--text); color: #fff; font-size: 0.75rem; font-weight: 500;
    padding: 0.3rem 0.65rem; border-radius: 7px; white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); pointer-events: none; z-index: 200;
  }
  .sb-tip::before {
    content: ''; position: absolute; right: 100%; top: 50%; transform: translateY(-50%);
    border: 5px solid transparent; border-right-color: var(--text);
  }
  .sb-collapsed .sb-link:hover .sb-tip { display: block; }

  /* ── Footer ── */
  .sb-footer {
    border-top: 1px solid var(--border);
    padding: 0.75rem 0.5rem;
    flex-shrink: 0;
  }
  .sb-user {
    display: flex; align-items: center; gap: 0.625rem;
    padding: 0.5rem; border-radius: 9px;
    transition: background 0.15s; position: relative;
  }
  .sb-user:hover { background: var(--surface2); }
  .sb-collapsed .sb-user { justify-content: center; }

  .sb-avatar {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--accent); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8125rem; font-weight: 700; flex-shrink: 0;
    font-family: var(--mono);
  }
  .sb-user-info { flex: 1; min-width: 0; overflow: hidden; opacity: 1; transition: opacity 0.12s; }
  .sb-collapsed .sb-user-info { opacity: 0; width: 0; overflow: hidden; }
  .sb-user-name { font-size: 0.8125rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sb-user-role { font-size: 0.6875rem; color: var(--muted); }

  .sb-logout {
    background: none; border: none; cursor: pointer;
    color: var(--muted); padding: 0.25rem; border-radius: 6px; line-height: 0;
    transition: color 0.15s, background 0.15s; flex-shrink: 0;
    opacity: 1;
  }
  .sb-logout:hover { color: var(--red); background: var(--red-light); }
  .sb-collapsed .sb-logout { opacity: 0; width: 0; padding: 0; overflow: hidden; }

  .sb-user-tip {
    display: none; position: absolute;
    left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
    background: var(--text); color: #fff; font-size: 0.75rem; font-weight: 500;
    padding: 0.3rem 0.65rem; border-radius: 7px; white-space: nowrap;
    pointer-events: none; z-index: 200;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .sb-user-tip::before {
    content: ''; position: absolute; right: 100%; top: 50%; transform: translateY(-50%);
    border: 5px solid transparent; border-right-color: var(--text);
  }
  .sb-collapsed .sb-user:hover .sb-user-tip { display: block; }

  .sb-logout-row { display: none; justify-content: center; margin-top: 0.25rem; }
  .sb-collapsed .sb-logout-row { display: flex; }
  .sb-logout-row button {
    background: none; border: none; cursor: pointer;
    color: var(--muted); padding: 0.4rem; border-radius: 7px; line-height: 0;
    transition: color 0.15s, background 0.15s;
  }
  .sb-logout-row button:hover { color: var(--red); background: var(--red-light); }
`;

const IconDashboard   = () => <svg className="sb-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconBox         = () => <svg className="sb-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>;
const IconReceipt     = () => <svg className="sb-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>;
const IconTag         = () => <svg className="sb-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>;
const IconUsers       = () => <svg className="sb-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IconUserPerson  = () => <svg className="sb-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconAlert       = () => <svg className="sb-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconLogout      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconLogoBox     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>;
const IconChevronLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;

const Sidebar = ({ collapsed, mobileOpen, onToggle, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  // Close sidebar on mobile when navigating
  React.useEffect(() => {
    if (mobileOpen) onClose?.();
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const mainItems = [
    { path: '/dashboard', label: 'Tableau de Bord', icon: <IconDashboard /> },
    { path: '/produits',  label: 'Produits',         icon: <IconBox /> },
    { path: '/ventes',    label: 'Ventes',            icon: <IconReceipt /> },
  ];
  const adminItems = [
    { path: '/categories',   label: 'Catégories',   icon: <IconTag /> },
    { path: '/fournisseurs', label: 'Fournisseurs',  icon: <IconUsers /> },
    { path: '/utilisateurs', label: 'Utilisateurs',  icon: <IconUserPerson /> },
    { path: '/alertes',      label: 'Alertes',       icon: <IconAlert /> },
  ];

  const initials = (user?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <>
      <style>{STYLES}</style>
      <aside className={`sb-root${collapsed ? ' sb-collapsed' : ''}${mobileOpen ? ' sb-mobile-open' : ''}`}>

        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-icon"><IconLogoBox /></div>
          <span className="sb-logo-text">Gestion <span>Stock</span></span>
          <button className="sb-toggle-btn" onClick={onToggle} aria-label={collapsed ? 'Ouvrir' : 'Réduire'}>
            <IconChevronLeft />
          </button>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          {mainItems.map(item => (
            <NavLink key={item.path} to={item.path} className={`sb-link${isActive(item.path) ? ' active' : ''}`}>
              {item.icon}
              <span className="sb-link-label">{item.label}</span>
              <span className="sb-tip">{item.label}</span>
            </NavLink>
          ))}

          {isAdmin?.() && (
            <>
              <p className="sb-section-label">Administration</p>
              <div className="sb-divider" />
              {adminItems.map(item => (
                <NavLink key={item.path} to={item.path} className={`sb-link${isActive(item.path) ? ' active' : ''}`}>
                  {item.icon}
                  <span className="sb-link-label">{item.label}</span>
                  <span className="sb-tip">{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-user-info">
              <p className="sb-user-name">{user?.name ?? 'Utilisateur'}</p>
              <p className="sb-user-role">{user?.role ?? 'user'}</p>
            </div>
            <button className="sb-logout" onClick={logout} aria-label="Déconnexion"><IconLogout /></button>
            <span className="sb-user-tip">{user?.name ?? 'Utilisateur'} • {user?.role ?? 'user'}</span>
          </div>
          <div className="sb-logout-row">
            <button onClick={logout} aria-label="Déconnexion" title="Déconnexion"><IconLogout /></button>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;