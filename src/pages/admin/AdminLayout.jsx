import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart2, Users, FileText, Flag, Bell, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getReportStats } from '../../api/admin';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getReportStats();
        setPendingCount(res.data?.data?.pending || 0);
      } catch (err) {
        console.error('Failed to fetch admin report stats', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const links = [
    { to: '/admin',           label: 'Dashboard',      Icon: BarChart2,  end: true, show: true },
    { to: '/admin/users',     label: 'Users',          Icon: Users, show: isAdmin },
    { to: '/admin/posts',     label: 'Posts',          Icon: FileText, show: true },
    { 
      to: '/admin/reports',   
      label: 'Reports',        
      Icon: Flag, 
      show: true,
      badge: pendingCount > 0 ? pendingCount : null 
    },
    { to: '/admin/broadcast', label: 'Broadcast',      Icon: Bell, show: isAdmin },
  ].filter(l => l.show);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="admin-shell">
      {/* Admin sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          ConnectSphere<br />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)' }}>Staff Panel</span>
        </div>

        {links.map(({ to, label, Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `admin-link${isActive ? ' active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Icon size={16} /> {label}
            </div>
            {badge && (
              <span style={{ 
                background: 'var(--error)', 
                color: 'white', 
                fontSize: '0.65rem', 
                padding: '2px 6px', 
                borderRadius: '10px',
                fontWeight: 'bold',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {badge}
              </span>
            )}
          </NavLink>
        ))}

        <div style={{ marginTop: 'auto', padding: '1rem 1.25rem' }}>
          <div
            className="admin-link"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/feed')}
          >
            <ArrowLeft size={16} /> Back to App
          </div>
          <div
            className="admin-link danger"
            style={{ cursor: 'pointer', marginTop: '0.5rem', color: '#fca5a5' }}
            onClick={handleLogout}
          >
            <LogOut size={16} /> Log Out
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
