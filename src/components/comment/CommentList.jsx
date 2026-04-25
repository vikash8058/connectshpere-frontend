import { useEffect, useState } from 'react';
import { getCommentsByPost } from '../../api/comments';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import Spinner from '../common/Spinner';

export default function CommentList({ postId, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getCommentsByPost(postId)
      .then((r) => {
        const allComments = r.data?.data || [];
        // 1. Filter out deleted comments
        const activeComments = allComments.filter(c => !c.isDeleted);
        
        // 2. Map top-level comments and calculate their reply counts from the same result set
        const enrichedTopLevel = activeComments
          .filter(c => c.parentCommentId === null)
          .map(parent => ({
            ...parent,
            replyCount: activeComments.filter(child => child.parentCommentId === parent.commentId).length
          }));

        setComments(enrichedTopLevel);
        // 3. Update total count to include active replies
        onCountChange?.(activeComments.length);
      })
      .catch((err) => {
        console.error('Failed to fetch comments:', err);
        setComments([]);
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const handleAdded = (newComment) => {
    setComments((prev) => [newComment, ...(Array.isArray(prev) ? prev : [])]);
    onCountChange?.((c) => (typeof c === 'number' ? c + 1 : 1));
  };

  const handleDeleted = (commentId) => {
    setComments((prev) => (Array.isArray(prev) ? prev.filter((c) => c.commentId !== commentId) : []));
    // Note: If this was a parent, we might be missing the count of its replies being "deleted" from view.
    // However, since we hide the parent, the replies are gone too.
    // To be perfectly accurate, we should fetch again or track total count better.
    // For now, simple decrement.
    onCountChange?.((c) => (typeof c === 'number' ? Math.max(0, c - 1) : 0));
  };

  return (
    <div className="comment-list-container" style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
      {/* New comment input */}
      <CommentForm postId={postId} onAdded={handleAdded} />

      {/* Comment list */}
      <div className="comments-stack" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <Spinner centered />
        ) : !Array.isArray(comments) || comments.length === 0 ? (
          <div className="text-sm text-muted" style={{ padding: '1rem 0', textAlign: 'center' }}>
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.commentId}
              comment={c}
              postId={postId}
              onDeleted={handleDeleted}
              onCountChange={onCountChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
