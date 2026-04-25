import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, User, Settings, Hash, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const links = [
  { to: '/feed',          label: 'Home',          Icon: Home, end: true, authRequired: true },
  { to: '/explore',       label: 'Explore',       Icon: Compass },
  { to: '/notifications', label: 'Notifications', Icon: Bell, authRequired: true },
  { to: '/elite',         label: 'Elite Status',  Icon: Crown, authRequired: true },
];

export default function Sidebar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <aside className="app-sidebar">
      <div className="sidebar">
        {/* User mini-profile */}
        {isAuthenticated && (
          <>
            <NavLink to={`/profile/${user?.userId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 1rem 1rem', marginBottom: '0.5rem' }}>
              <Avatar src={user?.profilePicUrl} name={user?.username} size="sm" />
              <div style={{ minWidth: 0 }}>
                <div className="font-medium text-sm flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  <span className="truncate">{user?.username}</span>
                  {user?.isElite && <Crown size={12} className="text-amber" fill="currentColor" />}
                </div>
                <div className="text-xs text-muted truncate">{user?.fullName}</div>
              </div>
            </NavLink>
            <div style={{ height: 1, background: 'var(--border)', marginBottom: '0.75rem' }} />
          </>
        )}

        {/* Nav links */}
        {links.map(({ to, label, Icon, end, authRequired }) => {
          if (authRequired && !isAuthenticated) return null;
          return (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} className="icon" />
              {label}
            </NavLink>
          );
        })}

        {!isAuthenticated && (
          <div style={{ padding: '1rem', marginTop: '1rem', background: 'var(--cream-100)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--amber)', letterSpacing: '0.05em' }}>GUEST MODE</span>
            </div>
            <p className="text-xs text-muted mb-0">Sign in to unlock posting, likes, and following.</p>
          </div>
        )}
        {isAuthenticated && (
          <>
            <NavLink
              to={`/profile/${user?.userId}`}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <User size={18} className="icon" />
              Profile
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Settings size={18} className="icon" />
              Settings
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
}
