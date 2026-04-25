import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUnreadNotificationCount } from '../../api/notifications';
import { useAuth } from '../../context/AuthContext';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prevCount = useRef(0);

  const fetchUnread = async () => {
    if (!isAuthenticated || !user?.userId) return;
    try {
      const res = await getUnreadNotificationCount(user.userId);
      // Backend returns ApiResponseDTO<Integer>, so data is in res.data.data
      const unreadCount = res.data?.data ?? 0;
      setCount(unreadCount);
      prevCount.current = unreadCount;
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    fetchUnread();
    
    // Poll for new notifications every 30 seconds
    const id = setInterval(fetchUnread, 30_000);
    return () => clearInterval(id);
  }, [user?.userId, isAuthenticated]);

  // Refresh count when user moves away from notifications page (they might have read them)
  useEffect(() => {
    if (location.pathname !== '/notifications') {
      fetchUnread();
    }
  }, [location.pathname]);

  return (
    <div 
      className="notification-bell-wrapper"
      style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
      onClick={() => navigate('/notifications')}
    >
      <div style={{ 
        padding: '0.6rem', 
        borderRadius: 'var(--r-md)', 
        background: 'var(--cream-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        color: 'var(--text-secondary)'
      }}
      className="hover-bg-cream"
      >
        <Bell size={20} />
      </div>

      {count > 0 && (
        <span 
          key={count} // Key change triggers animation re-run
          className="notification-badge-pulse"
          style={{
            position: 'absolute', 
            top: -2, 
            right: -2,
            background: 'var(--error)', 
            color: 'white',
            borderRadius: '50%', 
            fontSize: '0.65rem',
            fontWeight: 800, 
            minWidth: '18px', 
            height: '18px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid var(--white)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 10
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .notification-badge-pulse {
          animation: badgePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes badgePop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .hover-bg-cream:hover {
          background: var(--cream-300) !important;
          color: var(--amber) !important;
        }
      `}} />
    </div>
  );
}
