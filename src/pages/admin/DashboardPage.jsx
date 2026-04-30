import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPlatformStats, getTrendingHashtags, getAllPosts, getAllStories } from '../../api/admin';
import Spinner from '../../components/common/Spinner';
import { formatCount } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon, label, value, bg }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: bg }}>{icon}</div>
    <div>
      <div className="stat-value">{formatCount(value)}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats]   = useState(null);
  const [tags, setTags]     = useState([]);
  const [loading, setLoading] = useState(true);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getTrendingHashtags()
      .then(tr => setTags(tr.data?.data || tr.data || []))
      .catch(() => setTags([]));

    if (isAdmin) {
      Promise.allSettled([getPlatformStats(), getAllPosts(), getAllStories()])
        .then((results) => {
          const sr = results[0].status === 'fulfilled' ? results[0].value : null;
          const pr = results[1].status === 'fulfilled' ? results[1].value : null;
          const str = results[2].status === 'fulfilled' ? results[2].value : null;

          const userData = sr?.data?.data || sr?.data || [];
          const postData = pr?.data?.data || pr?.data || [];
          const storyData = str?.data?.data || str?.data || [];
          
          if (Array.isArray(userData)) {
            const today = new Date().toDateString();
            
            // Count stories created today
            const storiesCreatedToday = Array.isArray(storyData) ? storyData.filter(s => {
              const storyDate = new Date(s.createdAt || s.createdDate || s.createdTime).toDateString();
              return storyDate === today;
            }).length : 0;
            
            setStats({
              totalUsers: userData.length,
              activeUsers: userData.filter(u => u.isActive).length,
              totalPosts: Array.isArray(postData) ? postData.filter(p => p.type !== 'STORY' && !p.isStory).length : 0,
              totalComments: Array.isArray(postData) ? postData.reduce((acc, p) => acc + (p.commentsCount || 0), 0) : 0,
              totalLikes: Array.isArray(postData) ? postData.reduce((acc, p) => acc + (p.likesCount || 0), 0) : 0,
              storiesCreatedToday: storiesCreatedToday
            });
          }

          if (results[2].status === 'rejected') {
            console.warn("Media service fetch failed, showing 0 for stories today.");
          }
        })
        .catch((err) => {
          console.error("Critical stats fetch failed:", err);
          setStats({ totalUsers: 0, activeUsers: 0, totalPosts: 0, totalComments: 0, totalLikes: 0, storiesCreatedToday: 0 });
        })
        .finally(() => setLoading(false));
    } else {
      setStats({ totalUsers: 0, activeUsers: 0, totalPosts: 0, totalComments: 0, totalLikes: 0, storiesCreatedToday: 0 });
      setLoading(false);
    }
  }, [isAdmin]);

  if (loading) return <Spinner centered />;

  return (
    <div>
      <h2 className="admin-section-title">Dashboard</h2>
      
      <div className="stat-grid">
        <div onClick={() => isAdmin && navigate('/admin/users')} style={{ cursor: isAdmin ? 'pointer' : 'default' }}>
          <StatCard icon="👥" label="Total Users"   value={stats?.totalUsers   || 0} bg="#dbeafe" />
        </div>
        <div onClick={() => navigate('/admin/posts')} style={{ cursor: 'pointer' }}>
          <StatCard icon="📝" label="Total Posts"   value={stats?.totalPosts   || 0} bg="#dcfce7" />
        </div>
        <StatCard icon="💬" label="Comments"      value={stats?.totalComments || 0} bg="#fef3cd" />
        <StatCard icon="❤️" label="Reactions"     value={stats?.totalLikes   || 0} bg="#fdecea" />
        <div onClick={() => isAdmin && navigate('/admin/users')} style={{ cursor: isAdmin ? 'pointer' : 'default' }}>
          <StatCard icon="🔔" label="Active Users"  value={stats?.activeUsers  || 0} bg="#f3e8ff" />
        </div>
        <StatCard icon="📖" label="Stories Today" value={stats?.storiesCreatedToday || 0} bg="#fff7ed" />
      </div>

      {/* Trending hashtags table */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Trending Hashtags</h3>
        {tags.length === 0 ? <div className="text-sm text-muted">No data</div> : (
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Hashtag</th><th>Posts</th><th>Last Used</th></tr>
            </thead>
            <tbody>
              {tags.map((t, i) => (
                <tr key={t.tag || t}>
                  <td className="text-muted">{i + 1}</td>
                  <td style={{ color: 'var(--amber)', fontWeight: 500 }}>
                    <Link to={`/hashtag/${(t.tag || t).replace('#','')}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      #{ (t.tag || t).replace('#','') }
                    </Link>
                  </td>
                  <td>{t.postCount || '-'}</td>
                  <td className="text-muted text-xs">{t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
