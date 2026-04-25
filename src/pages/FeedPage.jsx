import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNewsFeed } from '../api/posts';
import PostCard from '../components/post/PostCard';
import PostForm from '../components/post/PostForm';
import StoryRing from '../components/story/StoryRing';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/common/Avatar';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);

  const loadFeed = () => {
    setLoading(true);
    getNewsFeed()
      .then(async (r) => {
        let data = Array.isArray(r.data?.data) ? r.data.data : [];
        
        // If follow feed is empty, show public posts
        if (data.length === 0) {
          try {
            const { getPublicPosts } = await import('../api/posts'); 
            const pr = await getPublicPosts();
            data = Array.isArray(pr.data?.data) ? pr.data.data : [];
          } catch (err) {
            console.error("Failed to load public feed", err);
          }
        }
        
        setPosts(data);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFeed(); }, []);

  const handleDeleted = (postId) => setPosts((prev) => prev.filter((p) => p.postId !== postId));

  return (
    <div>
      {/* Story bar */}
      <StoryRing />

      {/* Posts */}
      {loading ? (
        <Spinner centered />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="Your feed is empty"
          description="Follow people to see their posts here, or share your first post!"
        />
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.postId}
            post={post}
            onDeleted={handleDeleted}
            onEdit={(p) => { setEditingPost(p); setShowPostForm(true); }}
          />
        ))
      )}

      {/* New/edit post modal */}
      {showPostForm && (
        <PostForm
          editPost={editingPost}
          onClose={() => { setShowPostForm(false); setEditingPost(null); }}
          onSuccess={() => { loadFeed(); setShowPostForm(false); setEditingPost(null); }}
        />
      )}
    </div>
  );
}
