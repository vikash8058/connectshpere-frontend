import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFollowers, getFollowing } from '../api/social';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import UserListItem from '../components/common/UserListItem';
import { ChevronLeft, Users } from 'lucide-react';

export default function FollowersPage() {
  const { userId, type = 'followers' } = useParams();
  const navigate = useNavigate();
  const [users, setUsers]   = useState([]);
  const [targetName, setTargetName] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState(type);

  const load = (t) => {
    setLoading(true);
    const fn = t === 'followers' ? getFollowers : getFollowing;
    
    // Fetch profile for header + list
    Promise.all([
      fn(userId),
      import('../api/auth').then(m => m.getProfile(userId))
    ])
      .then(([res, profRes]) => {
        setUsers(res.data?.data || []);
        const p = profRes.data?.data || profRes.data;
        setTargetName(p?.username || p?.fullName || userId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    if (isNaN(Number(userId))) {
      setLoading(false);
      return;
    }
    load(tab); 
  }, [tab, userId]);

  return (
    <div className="followers-page">
      {/* Improved Header */}
      <div className="page-header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0.75rem 1.25rem', 
        borderBottom: '1px solid var(--border-light)',
        gap: '1rem',
        background: '#fff'
      }}>
        <button 
          className="btn-icon" 
          onClick={() => navigate(-1)}
          style={{ padding: '0.4rem', borderRadius: '50%', background: 'var(--cream-100)', color: 'var(--amber)' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Network</div>
          <div className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--charcoal)' }}>{targetName ? `@${targetName}` : '...'}</div>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab${tab === 'followers' ? ' active' : ''}`} onClick={() => setTab('followers')}>Followers</div>
        <div className={`tab${tab === 'following' ? ' active' : ''}`} onClick={() => setTab('following')}>Following</div>
      </div>

      {loading ? <Spinner centered /> : users.length === 0 ? (
        <EmptyState icon="👥" title={`No ${tab} yet`} />
      ) : (
        <div style={{ padding: '0.5rem 1.5rem' }}>
          {users.map((u) => {
            const targetId = tab === 'followers' ? u.followerId : u.followeeId;
            return (
              <UserListItem 
                key={u.followId || targetId} 
                userId={targetId} 
                initialData={u} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
