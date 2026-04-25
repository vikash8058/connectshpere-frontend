import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingHashtags, getSuggestedUsers } from '../../api/social';
import { getProfile } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

function SuggestedUserItem({ userId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile(userId)
      .then(r => setProfile(r.data?.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading || !profile) return null;

  return (
    <div className="suggested-user" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' }}>
      <div 
        className="suggested-user-info" 
        onClick={() => navigate(`/profile/${userId}`)} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}
      >
        <Avatar src={profile.profilePicUrl} name={profile.username} size="sm" />
        <div style={{ minWidth: 0 }}>
          <div className="suggested-username" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile.username}
          </div>
          <div className="suggested-meta" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile.fullName || 'Member'}
          </div>
        </div>
      </div>
      <button 
        className="btn btn-secondary btn-sm" 
        style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', borderRadius: 'var(--r-full)' }}
        onClick={() => navigate(`/profile/${userId}`)}
      >
        Follow
      </button>
    </div>
  );
}

export default function RightPanel() {
  const [tags, setTags]     = useState([]);
  const [users, setUsers]   = useState([]);
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    getTrendingHashtags().then((r) => setTags(r.data?.data?.slice(0, 6) || [])).catch(() => {});
    
    if (isAuthenticated) {
      getSuggestedUsers().then((r) => {
        const data = r.data?.data || r.data || [];
        setUsers(data.slice(0, 4));
      }).catch(() => {});
    } else {
      setUsers([]);
    }
  }, [isAuthenticated]);

  return (
    <aside className="app-right">
      <div className="right-panel">
        {/* Trending hashtags */}
        <div className="panel-section">
          <div className="panel-title">Trending</div>
          {tags.length === 0 && <div className="text-sm text-muted">No trends yet</div>}
          {tags.map((tag, idx) => (
            <div key={tag.tag || `tag-${idx}`} className="trending-tag" onClick={() => navigate(`/hashtag/${tag.tag || tag}`)}>
              <span className="tag-name">#{tag.tag || tag}</span>
              <span className="tag-count">{tag.postCount || ''}</span>
            </div>
          ))}
        </div>

        {/* Suggested users */}
        {users.length > 0 && (
          <div className="panel-section">
            <div className="panel-title">Who to follow</div>
            {users.map((userId) => (
              <SuggestedUserItem key={userId} userId={userId} />
            ))}
          </div>
        )}

      </div>
    </aside>
  );
}
