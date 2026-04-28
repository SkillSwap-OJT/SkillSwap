import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate('/login');
  };

  if (!user) {
    return (
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-dot" /> SkillSwap
          </Link>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Link to="/login"><button className="btn btn-secondary btn-sm">Login</button></Link>
            <Link to="/register"><button className="btn btn-primary btn-sm">Sign Up</button></Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-dot" /> SkillSwap
        </Link>

        <div className="navbar-nav">
          {[
            { to: '/', icon: '🏠', label: 'Dashboard' },
            { to: '/match', icon: '🔍', label: 'Find Peers' },
            { to: '/skills', icon: '📚', label: 'Skills & Exams' },
            { to: '/sessions', icon: '💬', label: 'Sessions' },
            { to: '/requests', icon: '📨', label: 'Requests' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`navbar-link ${isActive(item.to) ? 'active' : ''}`}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <div style={{ position: 'relative' }}>
            <div className="navbar-avatar" onClick={() => setShowMenu(!showMenu)}>
              {user.avatarUrl && (user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('data:')) ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </div>
            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  width: '220px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
                {[
                  { label: '👤 Profile', to: '/profile' },
                  { label: '📚 Skills & Exams', to: '/skills' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setShowMenu(false)}
                    style={{
                      display: 'block',
                      padding: '11px 16px',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      fontSize: '0.875rem',
                      color: 'var(--danger)',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100 }}
          onClick={() => setShowMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
