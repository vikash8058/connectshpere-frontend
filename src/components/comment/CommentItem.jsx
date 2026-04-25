import { useState, useEffect } from 'react';
import { Heart, CornerDownRight, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deleteComment, updateComment, likeComment, unlikeComment, getReplies } from '../../api/comments';
import Avatar from '../common/Avatar';
import CommentForm from './CommentForm';
import { timeAgo } from '../../utils/timeAgo';
import { getUserById } from '../../api/auth';
import toast from 'react-hot-toast';

import ConfirmModal from '../common/ConfirmModal';

export default function CommentItem({ comment, postId, onDeleted, onCountChange }) {
  const { user } = useAuth();
  const [editing, setEditing]       = useState(false);
  const [editText, setEditText]     = useState(comment.content);
  const [liked, setLiked]           = useState(false);
  const [likeCount, setLikeCount]   = useState(comment.likesCount || 0);
  const [localReplyCount, setLocalReplyCount] = useState(comment.replyCount || 0);
  const [showReply, setShowReply]   = useState(false);
  const [replies, setReplies]       = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [dynamicAuthor, setDynamicAuthor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch author info if missing (standard for microservices where comment-service only has authorId)
  useEffect(() => {
    if (!comment.authorUsername && comment.authorId) {
      getUserById(comment.authorId)
        .then(res => setDynamicAuthor(res.data?.data))
        .catch(() => {});
    }
  }, [comment.authorId, comment.authorUsername]);

  const authorName = comment.authorUsername || dynamicAuthor?.username || `User_${comment.authorId}`;
  const authorPic  = comment.authorProfilePic || dynamicAuthor?.profilePicUrl;

  const isOwner = user?.userId === comment.authorId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteComment(comment.commentId);
      toast.success('Comment removed');
      onDeleted?.(comment.commentId);
      setShowDeleteConfirm(false);
    } catch { 
      toast.error('Could not delete comment. Please try again.'); 
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    try {
      await updateComment(comment.commentId, editText);
      comment.content = editText;
      setEditing(false);
      toast.success('Comment updated');
    } catch { toast.error('Could not update'); }
  };

  const handleLike = async () => {
    try {
      if (liked) { await unlikeComment(comment.commentId); setLikeCount(c => Math.max(0, c - 1)); }
      else        { await likeComment(comment.commentId);  setLikeCount(c => c + 1); }
      setLiked(!liked);
    } catch {}
  };

  const loadReplies = async () => {
    if (showReplies) { setShowReplies(false); return; }
    setLoadingReplies(true);
    try {
      const res = await getReplies(comment.commentId);
      const allReplies = res.data?.data || res.data || [];
      // Filter out deleted replies
      const activeReplies = allReplies.filter(r => !r.isDeleted);
      setReplies(activeReplies);
      setLocalReplyCount(activeReplies.length);
      setShowReplies(true);
    } catch {
      setReplies([]);
    } finally { setLoadingReplies(false); }
  };

  return (
    <div>
      <div className="comment-item">
        <Avatar src={authorPic} name={authorName} size="sm" />
        <div style={{ flex: 1 }}>
          <div className="comment-bubble">
            <div className="comment-author">{authorName}</div>
            {editing ? (
              <div className="flex gap-2" style={{ marginTop: 4 }}>
                <input
                  className="input"
                  style={{ fontSize: '0.875rem', padding: '0.3rem 0.6rem', flex: 1 }}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={handleEdit}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            ) : (
              <span style={{ fontSize: '0.875rem' }}>{comment.content}</span>
            )}
          </div>

          {/* Comment actions */}
          <div className="comment-meta">
            <span>{timeAgo(comment.createdAt)}</span>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: liked ? 'var(--error)' : 'var(--text-muted)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 3 }}
              onClick={handleLike}
            >
              <Heart size={11} fill={liked ? 'currentColor' : 'none'} /> {likeCount > 0 && likeCount}
            </button>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem' }}
              onClick={() => setShowReply(!showReply)}
            >
              Reply
            </button>
            {isOwner && (
              <>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem' }} onClick={() => setEditing(true)}>
                  <Edit2 size={10} />
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: '0.72rem' }} onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={10} />
                </button>
              </>
            )}

            <ConfirmModal
              open={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onConfirm={handleDelete}
              loading={isDeleting}
              title="Delete Comment?"
              message="Are you sure you want to remove this comment? This action cannot be undone."
              confirmText="Delete"
            />
            {/* Show replies toggle (Instagram style) */}
            {localReplyCount > 0 && (
              <button
                className="view-replies-btn"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: 'var(--text-muted)', 
                  fontSize: '0.72rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  padding: '4px 0',
                  marginTop: 2,
                  fontWeight: '600'
                }}
                onClick={loadReplies}
              >
                <span style={{ width: 24, height: 1, background: 'var(--border)', display: 'inline-block' }}></span>
                {showReplies ? 'Hide replies' : `View ${localReplyCount} ${localReplyCount === 1 ? 'reply' : 'replies'}`}
                {loadingReplies && <span className="spinner-xs"></span>}
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReply && (
            <div style={{ marginTop: 4 }}>
              <CommentForm
                postId={postId}
                parentCommentId={comment.commentId}
                placeholder={`Reply to ${authorName}…`}
                onAdded={(r) => {
                  setReplies(prev => [...prev, r]);
                  setLocalReplyCount(prev => prev + 1);
                  onCountChange?.(prev => prev + 1); // Update post-level count
                  setShowReplies(true);
                  setShowReply(false);
                }}
              />
            </div>
          )}

          {/* Nested replies with vertical line indicator */}
          {showReplies && replies.length > 0 && (
            <div className="replies-wrapper" style={{ 
              marginTop: 8, 
              paddingLeft: 12, 
              borderLeft: '2px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              {replies.map((rep) => (
                <CommentItem
                  key={rep.commentId}
                  comment={rep}
                  postId={postId}
                  onCountChange={onCountChange}
                  onDeleted={(id) => {
                    setReplies(prev => prev.filter(r => r.commentId !== id));
                    setLocalReplyCount(prev => Math.max(0, prev - 1));
                    onCountChange?.(prev => Math.max(0, prev - 1));
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
