import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingHashtags } from '../api/social';
import Spinner from '../components/common/Spinner';
import { Hash, TrendingUp } from 'lucide-react';

export default function TrendingPage() {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingHashtags()
      .then((r) => setTags(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '1.5rem' }}>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={24} className="text-amber" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Trending Topics</h2>
      </div>

      <p className="text-muted mb-6" style={{ fontSize: '0.9rem' }}>
        Discover what's being discussed across ConnectSphere right now.
      </p>

      {loading ? (
        <Spinner centered />
      ) : (
        <div className="flex flex-col gap-3">
          {tags.map((tag, idx) => (
            <div 
              key={tag.tag || tag} 
              className="card flex items-center justify-between p-4 cursor-pointer hover:bg-cream-100 transition-colors"
              onClick={() => navigate(`/hashtag/${tag.tag || tag}`)}
              style={{ borderRadius: 'var(--r-lg)' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="flex items-center justify-center font-bold" 
                  style={{ width: 32, color: idx < 3 ? 'var(--amber)' : 'var(--text-muted)' }}
                >
                  {idx + 1}
                </div>
                <div>
                  <div className="font-bold text-lg" style={{ color: 'var(--charcoal)' }}>
                    #{tag.tag || tag}
                  </div>
                  <div className="text-xs text-muted">
                    {tag.postCount || 0} posts · Trending now
                  </div>
                </div>
              </div>
              <Hash size={20} className="text-muted" />
            </div>
          ))}

          {tags.length === 0 && (
            <div className="text-center py-12 text-muted">
              No trending topics available at the moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
