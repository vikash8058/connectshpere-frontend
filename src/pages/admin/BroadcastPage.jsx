import { useState } from 'react';
import { broadcastNotification } from '../../api/admin';
import { getAllUsers } from '../../api/admin';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function BroadcastPage() {
  const [message, setMessage]       = useState('');
  const [targetMode, setTargetMode] = useState('all');   // 'all' | 'selected'
  const [users, setUsers]           = useState([]);
  const [selected, setSelected]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    setUsersLoading(true);
    getAllUsers()
      .then((r) => {
        const data = r.data?.data || r.data || [];
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, []);

  const toggleUser = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSend = async () => {
    if (!message.trim()) { toast.error('Message cannot be empty'); return; }
    if (targetMode === 'selected' && selected.length === 0) { toast.error('Select at least one user'); return; }
    setLoading(true);
    try {
      await broadcastNotification({
        message: message.trim(),
        recipientIds: targetMode === 'all' ? users.map(u => u.userId) : selected,
        type: 'SYSTEM'
      });
      toast.success(`Notification sent to ${targetMode === 'all' ? 'all users' : `${selected.length} user(s)`}!`);
      setMessage('');
      setSelected([]);
    } catch { toast.error('Failed to send'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <h2 className="admin-section-title">Broadcast Notification</h2>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {/* Message */}
        <div className="input-group">
          <label className="input-label">Notification Message</label>
          <textarea
            className="input"
            placeholder="Type your broadcast message here…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ minHeight: 100 }}
          />
          <span className="text-xs text-muted" style={{ textAlign: 'right' }}>{message.length} characters</span>
        </div>

        {/* Target mode */}
        <div className="input-group">
          <label className="input-label">Send to</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { val: 'all',      label: '🌍 All Users' },
              { val: 'selected', label: '👥 Selected Users' },
            ].map(({ val, label }) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem', border: `1.5px solid ${targetMode === val ? 'var(--amber)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', background: targetMode === val ? 'var(--amber-light)' : 'var(--white)', fontSize: '0.88rem', fontWeight: targetMode === val ? 600 : 400, transition: 'all 0.15s' }}>
                <input type="radio" name="target" value={val} checked={targetMode === val} onChange={() => setTargetMode(val)} style={{ accentColor: 'var(--amber)' }} />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* User picker when 'selected' */}
        {targetMode === 'selected' && (
          <div style={{ marginTop: '0.5rem' }}>
            <label className="input-label">Select Users ({selected.length} selected)</label>
            {usersLoading ? <Spinner /> : (
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.5rem' }}>
                {users.map((u) => (
                  <label key={u.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.5rem', cursor: 'pointer', borderRadius: 'var(--r-sm)', background: selected.includes(u.userId) ? 'var(--amber-light)' : 'transparent' }}>
                    <input type="checkbox" checked={selected.includes(u.userId)} onChange={() => toggleUser(u.userId)} style={{ accentColor: 'var(--amber)' }} />
                    <span className="font-medium" style={{ fontSize: '0.88rem' }}>{u.username}</span>
                    <span className="text-xs text-muted">{u.email}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Send button */}
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handleSend} disabled={loading}>
            {loading ? <Spinner size="sm" /> : '📢 Send Notification'}
          </button>
          <span className="text-xs text-muted">
            {targetMode === 'all' ? 'Will notify all registered users' : `Will notify ${selected.length} user(s)`}
          </span>
        </div>
      </div>

      {/* Info box */}
      <div style={{ background: 'var(--info-bg, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: 'var(--r-md)', padding: '0.9rem 1.1rem', fontSize: '0.85rem', color: 'var(--info, #1e40af)' }}>
        <strong>ℹ️ Note:</strong> Notifications are delivered in-app and via email for high-priority events.
        Users can see them in their Notifications page. Bulk emails are rate-limited by the backend.
      </div>
    </div>
  );
}
