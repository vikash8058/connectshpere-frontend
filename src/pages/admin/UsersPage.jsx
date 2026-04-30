import { useEffect, useState } from 'react';
import { getAllUsers, deactivateUser, reactivateUser, deleteUser, updateUserRole } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { fullDate } from '../../utils/timeAgo';

export default function UsersPage() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { user: currentUser } = useAuth();

  useEffect(() => {
    getAllUsers()
      .then((r) => {
        const data = r.data?.data || r.data || [];
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (fn, id, msg, mutate) => {
    try { 
      await fn(id); 
      mutate(); 
      toast.success(msg); 
    } catch { 
      toast.error('Action failed'); 
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(us => us.map(u => u.userId === userId ? { ...u, role: newRole } : u));
      toast.success(`User promoted to ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="admin-section-title" style={{ margin: 0 }}>Users ({users.length})</h2>
        <input className="input" style={{ width: 240 }} placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <Spinner centered /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((u) => {
                  const isSelf = u.userId === currentUser?.userId;
                  return (
                    <tr key={u.userId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <Avatar src={u.profilePicUrl} name={u.username} size="sm" />
                          <div>
                            <div className="font-medium">{u.username} {isSelf && <span className="text-muted">(You)</span>}</div>
                            <div className="text-xs text-muted text-truncate-mobile">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className={`badge badge-${u.role === 'ADMIN' ? 'amber' : u.role === 'MODERATOR' ? 'success' : 'brown'}`}>
                            {u.role}
                          </span>
                          {!isSelf && (
                            <select 
                              className="text-xs" 
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.userId, e.target.value)}
                            >
                              <option value="USER">USER</option>
                              <option value="MODERATOR">MODERATOR</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="text-xs text-muted">{fullDate(u.createdAt)}</td>
                      <td>
                        <span className={`badge badge-${u.isActive ? 'success' : 'error'}`}>
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        {!isSelf && (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {u.isActive ? (
                              <button className="btn btn-danger btn-sm"
                                onClick={() => handleAction(deactivateUser, u.userId, 'User deactivated',
                                  () => setUsers((us) => us.map((x) => x.userId === u.userId ? { ...x, isActive: false } : x)))}>
                                Deactivate
                              </button>
                            ) : (
                              <button className="btn btn-secondary btn-sm"
                                onClick={() => handleAction(reactivateUser, u.userId, 'User reactivated',
                                  () => setUsers((us) => us.map((x) => x.userId === u.userId ? { ...x, isActive: true } : x)))}>
                                Reactivate
                              </button>
                            )}
                            <button className="btn btn-danger btn-sm"
                              onClick={() => {
                                if (!confirm('Permanently delete?')) return;
                                handleAction(deleteUser, u.userId, 'User deleted',
                                  () => setUsers((us) => us.filter((x) => x.userId !== u.userId)));
                              }}>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
