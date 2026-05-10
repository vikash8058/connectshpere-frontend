import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchPosts, searchHashtags, getTrendingHashtags } from '../api/social';
import { searchUsers } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/post/PostCard';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

export default function ExplorePage() {
  const [params, setParams]     = useSearchParams();
  const navigate                = useNavigate();
  const { isAuthenticated }     = useAuth();
  
  const [query, setQuery]       = useState(params.get('q') || '');
  const [tab, setTab]           = useState('posts'); // posts | people | hashtags
  const [posts, setPosts]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [tags, setTags]         = useState([]);
  const [loading, setLoading]   = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const q = params.get('q') || '';
    setQuery(q);
    if (!q) {
      setPosts([]);
      setUsers([]);
      setHashtags([]);
    }
  }, [params]);

  // Load trending and public feed when no query
  useEffect(() => {
    if (!query) {
      getTrendingHashtags().then((r) => setTags(r.data?.data || [])).catch(() => {});
      
      // Fetch public posts for the explore feed
      setLoading(true);
      import('../api/posts').then(({ getPublicPosts }) => {
        getPublicPosts()
          .then(res => setPosts(res.data?.data || []))
          .catch(() => setPosts([]))
          .finally(() => setLoading(false));
      });

      setUsers([]);
      setHashtags([]);
    }
  }, [query]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    
    // Independent searches so one service failure doesn't break everything
    try {
      searchPosts(query.trim())
        .then(res => setPosts(res.data?.data || []))
        .catch(err => {
          console.error('Post search failed:', err);
          setPosts([]);
        });

      searchUsers(query.trim())
        .then(res => setUsers(res.data?.data || []))
        .catch(err => {
          console.error('User search failed:', err);
          setUsers([]);
        });

      searchHashtags(query.trim())
        .then(res => setHashtags(res.data?.data || []))
        .catch(err => {
          console.error('Hashtag search failed:', err);
          setHashtags([]);
        });

    } finally { 
      // We set a small timeout to let the promises start, or use Promise.allSettled if we wanted to wait
      setTimeout(() => setLoading(false), 800); 
    }
  };

  useEffect(() => { 
    if (query) handleSearch(); 
  }, [query]);

  return (
    <div>
      {/* Search Header (Always visible) */}
      <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
        <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '1rem' }}>
          <input
            className="input"
            style={{ 
              padding: '0.75rem 1rem 0.75rem 3rem', 
              borderRadius: 'var(--r-md)', 
              width: '100%',
              background: 'var(--white)',
              border: '1px solid var(--border)'
            }}
            placeholder="Search posts, people or hashtags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            🔍
          </div>
        </form>
        
        {!query && (
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem' }}>Explore</h2>
        )}
      </div>

      {/* Default Explore View (Public Feed) */}
      {!query && (
        <div style={{ padding: '0 1.5rem 1.5rem' }}>

          {/* Public Posts Feed */}
          {posts.length > 0 && (
            <div>
              <h3 className="mb-3" style={{ fontSize: '1rem' }}>Latest on ConnectSphere</h3>
              <div className="flex flex-col gap-1">
                {posts.map((p) => <PostCard key={p.postId} post={p} />)}
              </div>
            </div>
          )}
          
          {loading && posts.length === 0 && <Spinner centered />}
        </div>
      )}

      {/* Search results */}
      {query && (
        <>
          {/* Tabs */}
          <div className="tabs" style={{ padding: '0 1.5rem' }}>
            <div className={`tab${tab === 'posts' ? ' active' : ''}`} onClick={() => setTab('posts')}>
              Posts {posts.length > 0 && `(${posts.length})`}
            </div>
            <div className={`tab${tab === 'people' ? ' active' : ''}`} onClick={() => setTab('people')}>
              People {users.length > 0 && `(${users.length})`}
            </div>
            <div className={`tab${tab === 'hashtags' ? ' active' : ''}`} onClick={() => setTab('hashtags')}>
              Hashtags {hashtags.length > 0 && `(${hashtags.length})`}
            </div>
          </div>

          {loading ? <Spinner centered /> : (
            <div style={{ minHeight: '300px' }}>
              {tab === 'posts' && (
                posts.length === 0
                  ? <EmptyState icon="🔍" title="No posts found" description={`No results for "${query}"`} />
                  : posts.map((p) => <PostCard key={p.postId} post={p} />)
              )}
              {tab === 'people' && (
                users.length === 0
                  ? <EmptyState icon="👤" title="No people found" description={`No users match "${query}"`} />
                  : (
                    <div style={{ padding: '0.5rem 1.5rem' }}>
                      {users.map((u) => (
                        <div key={u.userId}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                          onClick={() => navigate(`/profile/${u.userId}`)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Avatar src={u.profilePicUrl} name={u.username} size="md" />
                            <div>
                              <div className="font-medium">{u.username}</div>
                              <div className="text-sm text-muted">{u.fullName}</div>
                            </div>
                          </div>
                          <button className="btn btn-secondary btn-sm">View</button>
                        </div>
                      ))}
                    </div>
                  )
              )}
              {tab === 'hashtags' && (
                hashtags.length === 0
                  ? <EmptyState icon="#" title="No hashtags found" description={`No results for "${query}"`} />
                  : (
                    <div style={{ padding: '0.5rem 1.5rem' }}>
                      {hashtags.map((h) => (
                        <div 
                          key={h.tag || h}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                          onClick={() => navigate(`/hashtag/${h.tag || h}`)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 48, height: 48, background: 'var(--cream-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--amber)', fontSize: '1.2rem', fontWeight: 'bold' }}>#</div>
                            <div>
                              <div className="font-bold">#{h.tag || h}</div>
                              <div className="text-xs text-muted">{h.postCount || 0} posts</div>
                            </div>
                          </div>
                          <button className="btn btn-ghost btn-sm">View</button>
                        </div>
                      ))}
                    </div>
                  )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
