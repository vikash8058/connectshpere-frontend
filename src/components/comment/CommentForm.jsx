import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { addComment } from '../../api/comments';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

export default function CommentForm({ postId, parentCommentId = null, onAdded, placeholder = 'Write a comment…' }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await addComment({
        postId,
        authorId: user.userId,
        content: text.trim(),
        parentCommentId: parentCommentId || null,
      });
      setText('');
      // Enrich the response with current user details so it reflects instantly with name/avatar
      const newComment = {
        ...(res.data?.data || res.data), // Handle both wrapped and unwrapped response
        authorUsername: user.username,
        authorProfilePic: user.profilePicUrl
      };
      onAdded?.(newComment);
    } catch {
      toast.error('Could not post comment');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3 py-2 px-4 bg-cream-100 rounded-full mt-2 cursor-pointer" onClick={() => navigate('/login')}>
        <p className="text-sm text-muted flex-1">Write a comment...</p>
        <span className="text-xs font-bold text-amber">LOG IN</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2" style={{ padding: '0.75rem 0' }}>
      <Avatar src={user?.profilePicUrl} name={user?.username} size="sm" />
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          className="input"
          style={{ paddingRight: '2.5rem', borderRadius: 'var(--r-full)', fontSize: '0.875rem', padding: '0.5rem 2.5rem 0.5rem 1rem' }}
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!text.trim() || loading}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: text.trim() ? 'var(--amber)' : 'var(--text-light)',
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </form>
  );
}
