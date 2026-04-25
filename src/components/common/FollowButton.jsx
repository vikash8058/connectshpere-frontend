import { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { followUser, unfollowUser, isFollowing } from '../../api/social';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

export default function FollowButton({ targetUserId, size = 'sm', showText = false }) {
  const { user, isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.userId === targetUserId) {
      setLoading(false);
      return;
    }
    isFollowing(targetUserId)
      .then(r => setFollowing(r.data?.data?.following ?? r.data?.data ?? false))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetUserId, isAuthenticated, user?.userId]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return toast.error('Log in to follow users');
    setActionLoading(true);
    try {
      if (following) {
        await unfollowUser(targetUserId);
        setFollowing(false);
        toast.success('Unfollowed');
      } else {
        await followUser(targetUserId);
        setFollowing(true);
        toast.success('Following');
      }
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated || user?.userId === targetUserId || loading) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={actionLoading}
      className={`btn ${following ? 'btn-ghost' : 'btn-secondary'} btn-sm`}
      style={{ 
        padding: '0.2rem 0.5rem', 
        fontSize: '0.75rem', 
        borderRadius: 'var(--r-full)',
        height: '24px',
        minWidth: following ? 'auto' : '60px'
      }}
    >
      {actionLoading ? <Spinner size="sm" /> : (
        <div className="flex items-center gap-1">
          {following ? <Check size={14} /> : <Plus size={14} />}
          {(showText || !following) && (following ? 'Following' : 'Follow')}
        </div>
      )}
    </button>
  );
}
