import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllRead, deleteNotification } from '../api/social';
import NotificationItem from '../components/notification/NotificationItem';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getNotifications(user.userId)
      .then((r) => {
        const data = Array.isArray(r.data?.data) ? r.data.data : [];
        setNotifs(data);
      })
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkAllRead = async () => {
    await markAllRead(user.userId).catch(() => {});
    setNotifs((n) => n.map((x) => ({ ...x, isRead: true })));
    toast.success('All marked as read');
  };

  const handleRead = (id) => {
    setNotifs((n) => n.map((x) => x.notificationId === id ? { ...x, isRead: true } : x));
  };

  const handleDelete = async (id) => {
    await deleteNotification(id).catch(() => {});
    setNotifs((n) => n.filter((x) => x.notificationId !== id));
  };

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Notifications {unread > 0 && <span className="badge badge-amber" style={{ marginLeft: 8 }}>{unread}</span>}</h2>
        {unread > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>Mark all read</button>
        )}
      </div>

      {loading ? <Spinner centered /> : notifs.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />
      ) : (
        notifs.map((n) => (
          <NotificationItem key={n.notificationId} notif={n} onRead={handleRead} />
        ))
      )}
    </div>
  );
}
