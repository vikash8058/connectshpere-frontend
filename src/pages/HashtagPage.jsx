import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostsByHashtag } from '../api/social';
import PostCard from '../components/post/PostCard';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

export default function HashtagPage() {
  const { tag }             = useParams();
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostsByHashtag(tag)
      .then((r) => setPosts(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tag]);

  return (
    <div>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', background: 'linear-gradient(135deg, var(--amber-light), var(--cream))' }}>
        <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--amber)' }}>#{tag}</div>
        <div className="text-sm text-muted">{posts.length} post{posts.length !== 1 ? 's' : ''}</div>
      </div>

      {loading ? <Spinner centered /> : posts.length === 0 ? (
        <EmptyState icon="#️⃣" title="No posts yet" description={`Be the first to post with #${tag}`} />
      ) : (
        posts.map((p) => <PostCard key={p.postId} post={p} />)
      )}
    </div>
  );
}
