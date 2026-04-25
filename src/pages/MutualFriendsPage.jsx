import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMutualFollows } from '../api/social';
import { getProfile } from '../api/auth';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import UserListItem from '../components/common/UserListItem';
import { ChevronLeft } from 'lucide-react';

export default function MutualFriendsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mutualIds, setMutualIds] = useState([]);
  const [targetName, setTargetName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [res, profRes] = await Promise.all([
          getMutualFollows(userId),
          getProfile(userId)
        ]);
        
        setMutualIds(res.data?.data || []);
        const p = profRes.data?.data || profRes.data;
        setTargetName(p?.username || p?.fullName || userId);
      } catch (err) {
        console.error('Failed to load mutual connections', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) load();
  }, [userId]);

  return (
    <div className="mutual-friends-page">
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
          <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shared Connections</div>
          <div className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--charcoal)' }}>{targetName ? `@${targetName}` : '...'}</div>
        </div>
      </div>

      {loading ? (
        <Spinner centered />
      ) : mutualIds.length === 0 ? (
        <EmptyState icon="🤝" title="No mutual connections" description="You don't have any followers in common with this user yet." />
      ) : (
        <div style={{ padding: '0.5rem 1.5rem' }}>
          {mutualIds.map((id) => (
            <UserListItem 
              key={id} 
              userId={id} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
