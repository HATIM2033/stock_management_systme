import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const STYLES = `
  .ly-root { min-height: 100vh; background: #f8fafc; }

  .ly-main {
    margin-left: 240px;
    display: flex; flex-direction: column; min-height: 100vh;
    transition: margin-left 0.22s cubic-bezier(0.4,0,0.2,1);
  }
  .ly-main.ly-collapsed { margin-left: 64px; }

  .ly-content { flex: 1; }

  /* Overlay for mobile */
  .ly-overlay {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(2px);
    z-index: 35;
    animation: lyFadeIn 0.18s ease;
  }
  .ly-overlay.active { display: block; }

  @keyframes lyFadeIn { from { opacity: 0; } to { opacity: 1; } }

  @media (max-width: 768px) {
    .ly-main, .ly-main.ly-collapsed { margin-left: 0; }
  }
`;

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sb_collapsed') === 'true'; } catch { return false; }
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggle = () => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
    } else {
      setCollapsed(prev => {
        const next = !prev;
        try { localStorage.setItem('sb_collapsed', String(next)); } catch {}
        return next;
      });
    }
  };

  const closeOverlay = () => setMobileOpen(false);

  return (
    <>
      <style>{STYLES}</style>
      <div className="ly-root">

        {/* Mobile overlay */}
        <div
          className={`ly-overlay${mobileOpen ? ' active' : ''}`}
          onClick={closeOverlay}
        />

        <Sidebar
          collapsed={isMobile ? false : collapsed}
          mobileOpen={mobileOpen}
          onToggle={toggle}
          onClose={closeOverlay}
        />

        <div className={`ly-main${!isMobile && collapsed ? ' ly-collapsed' : ''}`}>
          <Header
            collapsed={isMobile ? false : collapsed}
            isMobile={isMobile}
            onBurgerClick={toggle}
          />
          <main className="ly-content">
            {children}
          </main>
        </div>

      </div>
    </>
  );
};

export default Layout;