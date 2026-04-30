import { useEffect, useState } from 'react';
import { getAllPosts, removePost } from '../../api/admin';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { timeAgo } from '../../utils/timeAgo';
import toast from 'react-hot-toast';

export default function PostsPage() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    getAllPosts()
      .then((r) => {
        // Handle both raw array and standard envelope responses
        const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setPosts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (postId) => {
    if (!confirm('Remove this post permanently?')) return;
    try {
      await removePost(postId);
      setPosts((p) => p.filter((x) => x.postId !== postId));
      toast.success('Post removed');
    } catch { toast.error('Failed to remove'); }
  };

  const filtered = Array.isArray(posts) ? posts.filter((p) =>
    p.content?.toLowerCase().includes(search.toLowerCase()) ||
    p.authorUsername?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="admin-section-title" style={{ margin: 0 }}>Posts ({posts.length})</h2>
        <input
          className="input"
          style={{ width: 240 }}
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? <Spinner centered /> : filtered.length === 0 ? (
        <EmptyState icon="📝" title="No posts found" />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Content</th>
                  <th>Visibility</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.postId}>
                    <td>
                      <span className="font-medium">{p.authorUsername || `User #${p.authorId}`}</span>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <span className="truncate" style={{ display: 'block', maxWidth: 260, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {p.content?.slice(0, 80)}{p.content?.length > 80 ? '…' : ''}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.visibility === 'PUBLIC' ? 'badge-success' : p.visibility === 'PRIVATE' ? 'badge-error' : 'badge-brown'}`}>
                        {p.visibility}
                      </span>
                    </td>
                    <td className="text-sm">{p.likesCount || 0}</td>
                    <td className="text-sm">{p.commentsCount || 0}</td>
                    <td className="text-xs text-muted">{timeAgo(p.createdAt)}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemove(p.postId)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
