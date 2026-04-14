import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Common/Toast';
import userService from '../../services/userService';
import Loading from '../../components/Common/Loading';
import ErrorMessage from '../../components/Common/ErrorMessage';

// ─── Palette & Helpers ──────────────────────────────────────────────────────────
const PALETTE = ['#2563eb', '#7c3aed', '#16a34a', '#d97706', '#dc2626', '#0891b2', '#ea580c', '#65a30d'];
const getColor = (s) => PALETTE[(s?.charCodeAt(0) ?? 0) % PALETTE.length];
const getInitials = (n) => (n ?? '?').slice(0, 2).toUpperCase();
const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

  .ul-root {
    --bg: #f8fafc; --surface: #ffffff; --surface2: #f1f5f9; --border: #e2e8f0;
    --text: #0f172a; --muted: #64748b;
    --accent: #2563eb; --accent-h: #1d4ed8; --accent-light: #eff6ff;
    --green: #16a34a; --green-light: #f0fdf4; --green-border: #bbf7d0;
    --yellow: #d97706; --yellow-light: #fffbeb; --yellow-border: #fde68a;
    --red: #dc2626; --red-light: #fef2f2; --red-border: #fecaca;
    --purple: #7c3aed; --purple-light: #f3f0ff; --purple-border: #ddd6fe;
    --mono: 'DM Mono', monospace; --sans: 'DM Sans', sans-serif;

    font-family: var(--sans); background: var(--bg); color: var(--text);
    min-height: 100vh; padding: 2.5rem 1rem;
  }

  .ul-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }

  /* Header */
  .ul-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .ul-title { font-size: 1.625rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
  .ul-title span { color: var(--accent); }
  .ul-subtitle { font-size: 0.8125rem; color: var(--muted); margin-top: 0.35rem; }
  .ul-add-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.65rem 1.1rem; background: var(--accent); color: #fff;
    border: none; border-radius: 9px; font-family: var(--sans);
    font-size: 0.875rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 4px 12px rgba(37,99,235,0.2);
    transition: background 0.15s, box-shadow 0.15s;
  }
  .ul-add-btn:hover { background: var(--accent-h); box-shadow: 0 6px 16px rgba(37,99,235,0.3); }

  /* Stats */
  .ul-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  @media (max-width: 768px) { .ul-stats { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px) { .ul-stats { grid-template-columns: 1fr; } }
  
  .ul-stat {
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
    padding: 1.25rem; display: flex; align-items: center; gap: 1rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    animation: ulFadeUp 0.28s ease both;
  }
  .ul-stat-icon {
    width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .ul-stat-info { flex: 1; }
  .ul-stat-value { font-size: 1.5rem; font-weight: 700; font-family: var(--mono); line-height: 1; }
  .ul-stat-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-top: 0.25rem; }

  /* Filters */
  .ul-filters { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
  .ul-search-wrap { position: relative; flex: 1; max-width: 360px; }
  .ul-search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
  .ul-search {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: 9px; padding: 0.65rem 0.875rem 0.65rem 2.25rem;
    font-family: var(--sans); font-size: 0.875rem; color: var(--text); outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .ul-search::placeholder { color: var(--muted); }
  .ul-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  
  .ul-filter-select {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 9px; padding: 0.65rem 0.875rem;
    font-family: var(--sans); font-size: 0.875rem; color: var(--text);
    outline: none; cursor: pointer; transition: border-color 0.2s;
  }
  .ul-filter-select:focus { border-color: var(--accent); }
  
  .ul-clear-btn {
    padding: 0.65rem 0.875rem; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 9px; font-family: var(--sans); font-size: 0.875rem;
    font-weight: 500; color: var(--muted); cursor: pointer;
    transition: all 0.15s;
  }
  .ul-clear-btn:hover { background: var(--surface); border-color: #94a3b8; color: var(--text); }

  /* Table */
  .ul-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.05); animation: ulFadeUp 0.32s ease both; }
  .ul-table { width: 100%; border-collapse: collapse; }
  .ul-thead { background: var(--surface2); }
  .ul-th {
    padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted);
    border-bottom: 1px solid var(--border);
  }
  .ul-td {
    padding: 1rem; border-bottom: 1px solid var(--border); vertical-align: middle;
  }
  .ul-td:last-child { border-bottom: none; }
  .ul-tbody tr:hover { background: var(--surface2); }

  /* Avatar */
  .ul-avatar {
    width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center;
    justify-content: center; font-size: 0.875rem; font-weight: 700; color: #fff;
    letter-spacing: -0.02em; flex-shrink: 0;
  }

  /* Role badge */
  .ul-role-badge {
    display: inline-flex; align-items: center; gap: 0.25rem;
    padding: 0.25rem 0.65rem; border-radius: 20px;
    font-size: 0.75rem; font-weight: 600; white-space: nowrap;
  }
  .ul-role-admin {
    background: var(--purple-light); color: var(--purple); border: 1px solid var(--purple-border);
  }
  .ul-role-user {
    background: var(--accent-light); color: var(--accent); border: 1px solid #bfdbfe;
  }

  /* Actions */
  .ul-actions { display: flex; gap: 0.5rem; }
  .ul-action-btn {
    padding: 0.375rem 0.625rem; border: 1.5px solid var(--border); border-radius: 7px;
    background: var(--surface); font-family: var(--sans); font-size: 0.75rem;
    font-weight: 500; cursor: pointer; transition: all 0.15s;
    display: inline-flex; align-items: center; gap: 0.25rem;
  }
  .ul-action-btn:hover { background: var(--surface2); border-color: #94a3b8; }
  .ul-action-btn.delete:hover { background: var(--red-light); border-color: var(--red-border); color: var(--red); }

  /* Empty state */
  .ul-empty {
    padding: 4rem 1.5rem; text-align: center; background: var(--surface);
    border: 1px dashed var(--border); border-radius: 14px;
    animation: ulFadeUp 0.32s ease both;
  }
  .ul-empty-icon { opacity: 0.18; display: flex; justify-content: center; margin-bottom: 0.875rem; }
  .ul-empty-title { font-size: 0.9375rem; font-weight: 600; color: var(--text); }
  .ul-empty-sub { font-size: 0.8125rem; color: var(--muted); margin-top: 0.25rem; }

  /* Modal */
.ul-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px); display: flex; align-items: center;
  justify-content: center; z-index: 50; padding: 1rem;
  animation: ulFadeIn 0.18s ease;
}

.ul-modal {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 18px; padding: 2rem; max-width: 480px; width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
  animation: ulScaleIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.ul-modal-close {
  position: absolute; top: 1rem; right: 1rem;
  background: var(--surface2); border: none; border-radius: 50%;
  width: 30px; height: 30px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; color: var(--muted);
  transition: background 0.15s, color 0.15s;
}
.ul-modal-close:hover { background: var(--red-light); color: var(--red); }

.ul-modal-title { 
  font-size: 1.125rem; font-weight: 700; 
  text-align: center; margin-bottom: 0.5rem; 
}

.ul-modal-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--red-light); border: 1.5px solid var(--red-border);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.25rem;
}

.ul-modal-sub {
  font-size: 0.875rem; color: var(--muted); text-align: center;
  line-height: 1.5; margin-bottom: 1.5rem;
}
.ul-modal-sub b { color: var(--text); font-weight: 600; }

.ul-modal-footer { display: flex; gap: 0.75rem; }

.ul-modal-cancel {
  flex: 1; padding: 0.75rem; border: 1px solid var(--border); 
  border-radius: 9px; background: transparent; color: var(--text); 
  font-family: var(--sans); font-size: 0.875rem; font-weight: 500; 
  cursor: pointer; transition: background 0.15s, border-color 0.15s;
}
.ul-modal-cancel:hover { 
  background: var(--surface2); 
  border-color: #94a3b8; 
}

.ul-modal-confirm {
  flex: 1; padding: 0.75rem; border: none; 
  border-radius: 9px; background: var(--red); 
  color: #fff; font-family: var(--sans);
  font-size: 0.875rem; font-weight: 700; 
  cursor: pointer; box-shadow: 0 4px 12px rgba(220,38,38,0.25);
  transition: background 0.15s, box-shadow 0.15s;
}
.ul-modal-confirm:hover { 
  background: #b91c1c; 
  box-shadow: 0 6px 16px rgba(220,38,38,0.35); 
}

/* Animations */
@keyframes ulFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ulFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes ulScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IconAdmin = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconActive = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconEdit = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IconX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconWarn = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconEmpty = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;

// ─── Main Component ─────────────────────────────────────────────────────────────
const UserList = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { success, error: showError } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getAllUsers();
        setUsers(Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = !search.trim() || 
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());
      
      const matchRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    regularUsers: users.filter(u => u.role === 'user').length,
    activeToday: 0, // Placeholder for future implementation
  }), [users]);

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setRoleFilter('all');
  };

  // Delete user
  const handleDelete = async () => {
    if (!deleteModal.user) return;

    // Prevent deleting current user
    if (deleteModal.user.id === currentUser?.id) {
      showError('Vous ne pouvez pas supprimer votre propre compte');
      setDeleteModal({ isOpen: false, user: null });
      return;
    }

    try {
      await userService.deleteUser(deleteModal.user.id);
      setUsers(prev => prev.filter(u => u.id !== deleteModal.user.id));
      success('Utilisateur supprimé avec succès');
      setDeleteModal({ isOpen: false, user: null });
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading text="Chargement des utilisateurs..." />;
  if (error) return <ErrorMessage message={error} variant="error" />;

  return (
    <>
      <style>{STYLES}</style>
      <div className="ul-root">
        <div className="ul-container">

          {/* Header */}
          <header className="ul-header">
            <div>
              <h1 className="ul-title">Gestion des <span>Utilisateurs</span></h1>
              <p className="ul-subtitle">{loading ? '…' : `${users.length} utilisateur${users.length !== 1 ? 's' : ''}`}</p>
            </div>
            <button className="ul-add-btn" onClick={() => navigate('/utilisateurs/add')}>
              <IconPlus /> Nouvel Utilisateur
            </button>
          </header>

          {/* Stats */}
          <div className="ul-stats">
            <div className="ul-stat" style={{ animationDelay: '0.05s' }}>
              <div className="ul-stat-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                <IconUsers />
              </div>
              <div className="ul-stat-info">
                <div className="ul-stat-value">{stats.total}</div>
                <div className="ul-stat-label">Total Utilisateurs</div>
              </div>
            </div>
            <div className="ul-stat" style={{ animationDelay: '0.1s' }}>
              <div className="ul-stat-icon" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>
                <IconAdmin />
              </div>
              <div className="ul-stat-info">
                <div className="ul-stat-value">{stats.admins}</div>
                <div className="ul-stat-label">Administrateurs</div>
              </div>
            </div>
            <div className="ul-stat" style={{ animationDelay: '0.15s' }}>
              <div className="ul-stat-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
                <IconUser />
              </div>
              <div className="ul-stat-info">
                <div className="ul-stat-value">{stats.regularUsers}</div>
                <div className="ul-stat-label">Utilisateurs</div>
              </div>
            </div>
            <div className="ul-stat" style={{ animationDelay: '0.2s' }}>
              <div className="ul-stat-icon" style={{ background: 'var(--yellow-light)', color: 'var(--yellow)' }}>
                <IconActive />
              </div>
              <div className="ul-stat-info">
                <div className="ul-stat-value">{stats.activeToday}</div>
                <div className="ul-stat-label">Actifs Aujourd'hui</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="ul-filters">
            <div className="ul-search-wrap">
              <span className="ul-search-icon"><IconSearch /></span>
              <input
                type="text"
                className="ul-search"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="ul-filter-select"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="user">Utilisateurs</option>
            </select>
            {(search || roleFilter !== 'all') && (
              <button className="ul-clear-btn" onClick={clearFilters}>
                Effacer les filtres
              </button>
            )}
          </div>

          {/* Table */}
          <div className="ul-table-wrap">
            {filteredUsers.length === 0 ? (
              <div className="ul-empty">
                <div className="ul-empty-icon"><IconEmpty /></div>
                <p className="ul-empty-title">
                  {search || roleFilter !== 'all' ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
                </p>
                <p className="ul-empty-sub">
                  {search || roleFilter !== 'all' 
                    ? 'Aucun utilisateur ne correspond aux filtres actuels'
                    : 'Ajoutez votre premier utilisateur pour commencer'
                  }
                </p>
              </div>
            ) : (
              <table className="ul-table">
                <thead className="ul-thead">
                  <tr>
                    <th className="ul-th">Utilisateur</th>
                    <th className="ul-th">Email</th>
                    <th className="ul-th">Rôle</th>
                    <th className="ul-th">Créé le</th>
                    <th className="ul-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="ul-tbody">
                  {filteredUsers.map((user, index) => {
                    const avatarColor = getColor(user.name);
                    const isCurrentUser = user.id === currentUser?.id;
                    
                    return (
                      <tr key={user.id} style={{ animationDelay: `${index * 0.05}s` }}>
                        <td className="ul-td">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="ul-avatar" style={{ background: avatarColor }}>
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                                {user.name}
                                {isCurrentUser && (
                                  <span style={{ 
                                    fontSize: '0.7rem', 
                                    color: 'var(--accent)', 
                                    marginLeft: '0.5rem',
                                    fontWeight: 500 
                                  }}>
                                    (Vous)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="ul-td" style={{ fontFamily: 'var(--mono)', fontSize: '0.875rem' }}>
                          {user.email}
                        </td>
                        <td className="ul-td">
                          <span className={`ul-role-badge ul-role-${user.role}`}>
                            {user.role === 'admin' ? <IconAdmin /> : <IconUser />}
                            {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                          </span>
                        </td>
                        <td className="ul-td" style={{ fontFamily: 'var(--mono)', fontSize: '0.875rem', color: 'var(--muted)' }}>
                          {fmtDate(user.created_at)}
                        </td>
                        <td className="ul-td">
                          <div className="ul-actions">
                            <button
                              className="ul-action-btn"
                              onClick={() => navigate(`/utilisateurs/${user.id}/edit`)}
                              title="Modifier"
                            >
                              <IconEdit /> Modifier
                            </button>
                            <button
                              className="ul-action-btn delete"
                              onClick={() => setDeleteModal({ isOpen: true, user })}
                              title="Supprimer"
                              disabled={isCurrentUser}
                              style={{ 
                                opacity: isCurrentUser ? 0.5 : 1,
                                cursor: isCurrentUser ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <IconTrash /> Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>

      {/* Delete Modal */}
{deleteModal.isOpen && (
  <div className="ul-backdrop" role="dialog" aria-modal="true">
    <div style={{backgroundColor: "#ffffffff"}}className="ul-modal">
      <button
        className="ul-modal-close"
        onClick={() => setDeleteModal({ isOpen: false, user: null })}
        aria-label="Fermer"
      >
        <IconX />
      </button>
      
      <div className="ul-modal-icon">
        <IconWarn />
      </div>
      
      <h3 className="ul-modal-title">Confirmer la suppression</h3>
      
      <p className="ul-modal-sub">
        Voulez-vous vraiment supprimer l'utilisateur <b>{deleteModal.user?.name}</b> ?<br />
        Email: <b>{deleteModal.user?.email}</b><br />
        Cette action est irréversible.
      </p>
      
      <div className="ul-modal-footer">
        <button 
          className="ul-modal-cancel" 
          onClick={() => setDeleteModal({ isOpen: false, user: null })}
          style={{flex: 1,padding: "10px 20px",borderRadius: "8px",border: "1.5px solid #d1d5db",backgroundColor: "#ffffff",color: "#374151",fontWeight: "600",cursor: "pointer",fontSize: "14px",}}
        >
          Annuler
        </button>
        <button 
          className="ul-modal-confirm" 
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

export default UserList;
