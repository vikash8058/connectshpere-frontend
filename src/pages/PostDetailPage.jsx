// ─── PostDetailPage ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById } from '../api/posts';
import { getProfile } from '../api/auth';
import PostCard from '../components/post/PostCard';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

export function PostDetailPage() {
  const { postId } = useParams();
  const navigate   = useNavigate();
  const [post, setPost]     = useState(null);
  const [loading, setLoading] = useState(true);

  const [author, setAuthor] = useState(null);

  useEffect(() => {
    getPostById(postId)
      .then((r) => {
        const p = r.data?.data || r.data;
        setPost(p);
        if (p?.authorId) {
          getProfile(p.authorId).then(ar => setAuthor(ar.data?.data || ar.data)).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  return (
    <div>
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Post</h3>
      </div>
      {loading ? <Spinner centered /> : !post ? <EmptyState icon="📭" title="Post not found" /> : (
        <PostCard post={post} authorDetails={author} onDeleted={() => navigate(-1)} />
      )}
    </div>
  );
}
