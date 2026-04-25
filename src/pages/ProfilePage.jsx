import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfile } from '../api/auth';
import { getPostsByUser, getPostCount } from '../api/posts';
import { followUser, unfollowUser, isFollowing, getFollowerCount, getFollowingCount, getMutualFollows } from '../api/social';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/post/PostCard';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { formatCount } from '../utils/formatters';
import { fullDate } from '../utils/timeAgo';
import { Crown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { userId }  = useParams();
  const { user: me } = useAuth();
  const navigate    = useNavigate();

  const [profile, setProfile]       = useState(null);
  const [posts, setPosts]           = useState([]);
  const [following, setFollowing]   = useState(false);
  const [stats, setStats]           = useState({ posts: 0, followers: 0, following: 0, mutual: 0 });
  const [loading, setLoading]       = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [tab, setTab]               = useState('posts');

  const isMe = Number(userId) === me?.userId;

  useEffect(() => {
    const uid = Number(userId);
    if (isNaN(uid)) {
      setLoading(false);
      setProfile(null);
      return;
    }

    setLoading(true);
    Promise.all([
      getProfile(uid),
      getPostsByUser(uid),
      getFollowerCount(uid),
      getFollowingCount(uid),
      !isMe && me?.userId ? isFollowing(uid) : Promise.resolve({ data: { following: false } }),
      !isMe && me?.userId ? getMutualFollows(uid) : Promise.resolve({ data: { data: [] } }),
    ])
      .then(([pr, postr, fcr, fgr, ifr, mfr]) => {
        const profileData = pr.data?.data || pr.data;
        const postsData   = postr.data?.data || postr.data || [];
        const mutualData  = mfr.data?.data || mfr.data || [];
        
        setProfile(profileData);
        setPosts(postsData);
        setStats({
          posts:     postsData.length || 0,
          followers: fcr.data?.data?.count ?? fcr.data?.data ?? fcr.data?.count ?? fcr.data ?? 0,
          following: fgr.data?.data?.count ?? fgr.data?.data ?? fgr.data?.count ?? fgr.data ?? 0,
          mutual:    mutualData.length || 0,
        });
        setFollowing(ifr.data?.data?.following ?? ifr.data?.data ?? ifr.data?.following ?? ifr.data ?? false);
      })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => setLoading(false));
  }, [userId]);

  const toggleFollow = async () => {
    setFollowLoading(true);
    try {
      if (following) {
        await unfollowUser(Number(userId));
        setFollowing(false);
        setStats((s) => ({ ...s, followers: Math.max(0, s.followers - 1) }));
      } else {
        await followUser(Number(userId));
        setFollowing(true);
        setStats((s) => ({ ...s, followers: s.followers + 1 }));
      }
    } catch { toast.error('Action failed'); }
    finally { setFollowLoading(false); }
  };

  if (loading) return <Spinner centered />;
  if (!profile) return <EmptyState icon="👤" title="User not found" />;

  return (
    <div>
      {/* Profile header */}
      <div className="profile-header">
        <Avatar src={profile.profilePicUrl} name={profile.username} size="xl" viewable={true} />
        <div className="flex items-center justify-center gap-2 mt-3">
          <h2 style={{ margin: 0 }}>{profile.fullName || profile.username}</h2>
          {profile.isElite && (
            <Crown size={20} className="text-amber" fill="currentColor" />
          )}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.15rem' }}>@{profile.username}</div>
        {profile.bio && (
          <p style={{ maxWidth: 400, margin: '0.75rem auto 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {profile.bio}
          </p>
        )}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
          Joined {fullDate(profile.createdAt)}
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div style={{ textAlign: 'center' }}>
            <div className="profile-stat-value">{formatCount(stats.posts)}</div>
            <div className="profile-stat-label">Posts</div>
          </div>
          <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate(`/profile/${userId}/followers`)}>
            <div className="profile-stat-value">{formatCount(stats.followers)}</div>
            <div className="profile-stat-label">Followers</div>
          </div>
          <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate(`/profile/${userId}/following`)}>
            <div className="profile-stat-value">{formatCount(stats.following)}</div>
            <div className="profile-stat-label">Following</div>
          </div>
        </div>

        {/* Mutual Connections */}
        {!isMe && stats.mutual > 0 && (
          <div style={{ 
            fontSize: '0.85rem', 
            color: 'var(--primary-color)', 
            marginTop: '0.75rem',
            fontWeight: '500',
            cursor: 'pointer'
          }} onClick={() => navigate(`/profile/${userId}/mutual`)}>
            🤝 {stats.mutual} mutual connection{stats.mutual > 1 ? 's' : ''}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
          {isMe ? (
            <button className="btn btn-secondary" onClick={() => navigate('/settings')}>Edit Profile</button>
          ) : (
            <button
              className={`btn ${following ? 'btn-ghost' : 'btn-primary'}`}
              onClick={toggleFollow}
              disabled={followLoading}
            >
              {followLoading ? <Spinner size="sm" /> : following ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab${tab === 'posts' ? ' active' : ''}`} onClick={() => setTab('posts')}>Posts</div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <EmptyState icon="📝" title="No posts yet" description={isMe ? 'Share your first post!' : `${profile.username} hasn't posted yet`} />
      ) : (
        posts.map((p) => (
          <PostCard
            key={p.postId}
            post={p}
            authorDetails={profile}
            onDeleted={(id) => setPosts((prev) => prev.filter((x) => x.postId !== id))}
          />
        ))
      )}
    </div>
  );
}
