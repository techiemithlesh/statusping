import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api, getToken, setToken } from '../api/client';

const STATUS_SLUG = import.meta.env.VITE_STATUS_SLUG || 'demo';

export default function Layout() {
  const navigate = useNavigate();
  const loggedIn = !!getToken();

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Token may already be invalid; log out locally anyway.
    }
    setToken(null);
    navigate('/login');
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-dot" />
            StatusPing
          </Link>

          <nav className="nav" aria-label="Main">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Monitors
            </NavLink>
            <NavLink to="/incidents" className={({ isActive }) => (isActive ? 'active' : '')}>
              Incidents
            </NavLink>
            <NavLink to="/alert-channels" className={({ isActive }) => (isActive ? 'active' : '')}>
              Alert channels
            </NavLink>
            <a href={`/status/${STATUS_SLUG}`} target="_blank" rel="noopener noreferrer">
              Status page ↗
            </a>
          </nav>

          <div className="auth">
            {loggedIn ? (
              <button className="btn" type="button" onClick={logout}>
                Log out
              </button>
            ) : (
              <Link className="btn" to="/login">
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
