import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../../api/auth';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';

export default function UserListItem({ userId, initialData = {} }) {
  const [profile, setProfile] = useState(initialData.username ? initialData : null);
  const [loading, setLoading] = useState(!initialData.username);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) return;
    setLoading(true);
    getProfile(userId)
      .then(r => setProfile(r.data?.data || r.data))
      .catch(() => setProfile({ username: `User ${userId}`, userId }))
      .finally(() => setLoading(false));
  }, [userId, profile]);

  if (loading) return (
    <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
        <div className="flex flex-col gap-2">
          <div className="skeleton" style={{ width: 100, height: 14 }} />
          <div className="skeleton" style={{ width: 60, height: 10 }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: 60, height: 32, borderRadius: 'var(--r-full)' }} />
    </div>
  );

  return (
    <div
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0.85rem 0', 
        borderBottom: '1px solid var(--border-light)', 
        cursor: 'pointer',
        gap: '1rem',
        width: '100%'
      }}
      onClick={() => navigate(`/profile/${userId}`)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
        <Avatar src={profile.profilePicUrl} name={profile.username} size="md" />
        <div style={{ minWidth: 0 }}>
          <div className="font-bold text-sm truncate" style={{ color: 'var(--charcoal)', marginBottom: '2px' }}>
            {profile.username}
          </div>
          <div className="text-xs text-muted truncate">
            {profile.fullName || 'ConnectSphere Member'}
          </div>
        </div>
      </div>
      
      <button 
        className="btn btn-secondary" 
        style={{ 
          padding: '0.4rem 1rem', 
          fontSize: '0.75rem', 
          borderRadius: 'var(--r-full)', 
          height: '32px',
          width: 'auto',
          minWidth: '70px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          background: 'var(--cream-100)',
          borderColor: 'var(--amber-light)',
          color: 'var(--amber-dark)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        View
      </button>
    </div>
  );
}
