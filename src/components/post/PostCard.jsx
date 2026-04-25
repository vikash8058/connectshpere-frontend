import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Share2, MoreHorizontal, Globe, Users, Lock, Bookmark, AlertTriangle, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deletePost, incrementShareCount } from '../../api/posts';
import { getUserById } from '../../api/auth';
import Avatar from '../common/Avatar';
import FollowButton from '../common/FollowButton';
import ReactionBar from './ReactionBar';
import CommentList from '../comment/CommentList';
import ReportModal from '../common/ReportModal';
import ConfirmModal from '../common/ConfirmModal';
import { timeAgo } from '../../utils/timeAgo';
import { linkifyText } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { fixCdnUrl } from '../../utils/urlFixer';

const getYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const VIS_ICON = { PUBLIC: <Globe size={11}/>, FOLLOWERS_ONLY: <Users size={11}/>, PRIVATE: <Lock size={11}/> };

export default function PostCard({ post, onDeleted, onEdit, authorDetails = null }) {
  const { user, isStaff, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu]         = useState(false);
  const [showReport, setShowReport]     = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentsCount || 0);
  const [dynamicAuthor, setDynamicAuthor] = useState(null);

  const isOwner = user?.userId === post.authorId;
  const canManage = isOwner || isStaff;

  useEffect(() => {
    // If we don't have author info in the post or passed as props, fetch it
    const hasAuthorInfo = post.authorUsername || (authorDetails?.userId === post.authorId);
    if (!hasAuthorInfo && !isOwner && post.authorId) {
      getUserById(post.authorId)
        .then(res => setDynamicAuthor(res.data?.data))
        .catch(() => {});
    }
  }, [post.authorId, post.authorUsername, authorDetails, isOwner]);

  const displayAuthor = dynamicAuthor || authorDetails || (isOwner ? user : null);
  const authorName = post.authorUsername || displayAuthor?.username || post.authorName || (post.authorId ? `@user_${post.authorId}` : 'User');
  const authorPic  = post.authorProfilePic || displayAuthor?.profilePicUrl || null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post.postId);
      toast.success('Post permanently removed');
      onDeleted?.(post.postId);
      setShowDeleteConfirm(false);
    } catch { 
      toast.error('Could not delete post. Please try again.'); 
    } finally {
      setIsDeleting(false);
    }
  };

  const [shareCount, setShareCount] = useState(post.sharesCount || 0);

  const handleShare = async () => {
    const shareData = {
      title: `ConnectSphere Post by ${authorName}`,
      text: post.content.substring(0, 100),
      url: `${window.location.origin}/post/${post.postId}`,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared!');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
      
      // Increment count in backend and UI
      await incrementShareCount(post.postId);
      setShareCount(prev => prev + 1);
    } catch (err) {
      if (err.name !== 'AbortError') toast.error('Could not share');
    }
  };

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-header">
        <Avatar
          src={authorPic}
          name={authorName}
          size="md"
          className="cursor-pointer"
          viewable={true}
          onClick={() => navigate(`/profile/${post.authorId}`)}
        />
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2">
            <span
              className="post-author-name cursor-pointer"
              onClick={() => navigate(`/profile/${post.authorId}`)}
            >
              {authorName}
            </span>
            {(displayAuthor?.isElite || post.isElite) && (
              <Crown size={14} className="text-amber" fill="currentColor" />
            )}
            <span className="post-meta flex items-center gap-1">
              {VIS_ICON[post.visibility]}
            </span>
          </div>
          <div className="post-meta">
            {timeAgo(post.createdAt)}
            {post.updatedAt && post.updatedAt !== post.createdAt && ' · edited'}
          </div>
        </div>

        {/* Follow button (only if not me) */}
        {!isOwner && <FollowButton targetUserId={post.authorId} />}

        {/* 3-dot menu */}
        <div className="dropdown">
          <button className="action-btn" onClick={() => setShowMenu(!showMenu)}>
            <MoreHorizontal size={16} />
          </button>
          {showMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />
              <div className="dropdown-menu">
                {isOwner && (
                  <div className="dropdown-item" onClick={() => { onEdit?.(post); setShowMenu(false); }}>
                    ✏️ Edit
                  </div>
                )}
                {!isOwner && (
                  <button 
                    className="dropdown-item" 
                    style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', display: 'block', padding: '0.75rem 1rem' }}
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isAuthenticated) {
                        window.location.href = '/login'; // Force direct redirect for guests
                        return;
                      }
                      setShowReport(true); 
                      setShowMenu(false); 
                    }}
                  >
                    🚩 Report
                  </button>
                )}
                {canManage && (
                  <div className="dropdown-item danger" onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}>
                    🗑️ Delete
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Post?"
        message="Are you sure you want to permanently delete this post? This action cannot be undone."
        confirmText="Delete Post"
      />

      {/* Content */}
      <div
        className="post-content cursor-pointer"
        onClick={() => navigate(`/post/${post.postId}`)}
        dangerouslySetInnerHTML={{ __html: linkifyText(post.content) }}
      />

      {/* Media (Images/Videos) */}
      <div className="post-media-container">
        {/* Real YouTube Embed */}
        {getYoutubeId(post.content) && (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--r-md)', marginBottom: '1rem' }}>
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src={`https://www.youtube.com/embed/${getYoutubeId(post.content)}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Uploaded Media (Images/Videos) */}
        {post.mediaUrls?.length > 0 && (
          post.postType === 'VIDEO' ? (
            <video
              className="post-video"
              src={fixCdnUrl(post.mediaUrls[0])}
              controls
              style={{ width: '100%', borderRadius: 'var(--r-md)', maxHeight: '450px', background: '#000' }}
            />
          ) : (
            <img
              className="post-image cursor-pointer"
              src={fixCdnUrl(post.mediaUrls[0])}
              alt="post media"
              onClick={() => navigate(`/post/${post.postId}`)}
              onError={(e) => { 
                // Use a reliable Unsplash fallback if the media fails to load
                e.target.src = `https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?auto=format&fit=crop&w=800&q=80&sig=${post.postId}`;
              }}
            />
          )
        )}

        {/* Real Image Fallback for empty posts to look "premium" */}
        {!post.mediaUrls?.length && !getYoutubeId(post.content) && post.content?.length > 100 && (
          <img
            className="post-image cursor-pointer"
            src={`https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=800&q=80&sig=${post.postId}`}
            alt="featured media"
            style={{ height: '200px', opacity: 0.9 }}
          />
        )}
      </div>

      {/* Action bar */}
      <div className="post-actions">
        {/* Reaction bar (like with emoji picker) */}
        <ReactionBar
          targetId={post.postId}
          targetType="POST"
          initialCount={post.likesCount || 0}
          initialReaction={post.myReaction || null}
        />

        {/* Comment toggle */}
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          <MessageCircle size={15} />
          {commentCount > 0 && commentCount} Comment{commentCount !== 1 ? 's' : ''}
        </button>

        {/* Share */}
        <button className="action-btn" onClick={handleShare}>
          <Share2 size={15} />
          {shareCount > 0 && shareCount} Share{shareCount !== 1 ? 's' : ''}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <CommentList
          postId={post.postId}
          onCountChange={setCommentCount}
        />
      )}

      {showReport && (
        <ReportModal
          targetId={post.postId}
          targetType="POST"
          onClose={() => setShowReport(false)}
        />
      )}
    </article>
  );
}
