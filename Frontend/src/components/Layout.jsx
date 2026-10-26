import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api, getUser, setToken, setUser } from '../api/client';

const STATUS_SLUG = import.meta.env.VITE_STATUS_SLUG || 'demo';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const currentPage = location.pathname.startsWith('/incidents')
    ? 'Incidents'
    : location.pathname.startsWith('/alert-channels')
      ? 'Alert channels'
      : location.pathname.startsWith('/monitors/')
        ? 'Monitor details'
        : 'Overview';

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // The local session can still be cleared if the token has expired.
    }
    setToken(null);
    setUser(null);
    navigate('/login');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/dashboard" className="brand-mark admin-brand">
          <span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span>
          <span>statusping</span>
        </Link>
        <div className="workspace-switcher">
          <span className="workspace-avatar">{(user?.name || 'SP').slice(0, 1).toUpperCase()}</span>
          <span className="workspace-info"><b>{user?.name || 'My workspace'}</b><small>Monitoring workspace</small></span>
          <span className="workspace-chevron">⌄</span>
        </div>

        <span className="sidebar-label">WORKSPACE</span>
        <nav className="admin-nav" aria-label="Workspace">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-glyph">◫</span> Overview <span className="nav-count">↗</span>
          </NavLink>
          <NavLink to="/incidents" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-glyph">◷</span> Incidents
          </NavLink>
          <NavLink to="/alert-channels" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-glyph">⌁</span> Alert channels
          </NavLink>
        </nav>

        <div className="sidebar-status">
          <span className="sidebar-status-icon"><i /></span>
          <span><b>All systems normal</b><small>Everything is looking good</small></span>
        </div>

        <div className="sidebar-bottom">
          <a className="sidebar-link" href={`/status/${STATUS_SLUG}`} target="_blank" rel="noopener noreferrer"><span className="nav-glyph">↗</span> Public status page</a>
          <button className="sidebar-user" type="button" onClick={logout}>
            <span className="user-avatar">{(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}</span>
            <span className="user-details"><b>{user?.name || 'Account'}</b><small>{user?.email || 'Manage session'}</small></span>
            <span className="user-menu">···</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="breadcrumbs"><span>Workspace</span><i>/</i><b>{currentPage}</b></div>
          <div className="topbar-actions"><span className="system-indicator"><i /> Operational</span><Link className="topbar-help" to="/">Visit website <span aria-hidden="true">↗</span></Link></div>
        </header>
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
}
