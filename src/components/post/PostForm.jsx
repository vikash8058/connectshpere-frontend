import { useState, useRef } from 'react';
import { Image, X, Globe, Users, Lock } from 'lucide-react';
import { createPost, updatePost } from '../../api/posts';
import { uploadMedia } from '../../api/social';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';
import toast from 'react-hot-toast';

const VISIBILITY_ICONS = { PUBLIC: <Globe size={14}/>, FOLLOWERS_ONLY: <Users size={14}/>, PRIVATE: <Lock size={14}/> };

export default function PostForm({ onClose, onSuccess, editPost = null }) {
  const { user } = useAuth();
  const [content, setContent]         = useState(editPost?.content || '');
  const [visibility, setVisibility]   = useState(editPost?.visibility || 'PUBLIC');
  const [previewUrl, setPreviewUrl]   = useState(editPost?.mediaUrls?.[0] || null);
  const [mediaFile, setMediaFile]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setMediaFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile && !editPost?.mediaUrls?.length) {
      return toast.error('Share something! Add text or media.');
    }
    setLoading(true);
    try {
      let mediaUrls = editPost?.mediaUrls || [];

      // Upload image if selected
      if (mediaFile) {
        const fd = new FormData();
        fd.append('file', mediaFile);
        const r = await uploadMedia(fd);
        // Correctly extract the URL from ApiResponseDTO<MediaResponseDTO>
        const uploadedUrl = r.data?.data?.url;
        if (!uploadedUrl) throw new Error('Failed to get media URL');
        mediaUrls = [uploadedUrl];
      }

      const payload = {
        authorId: user.userId,
        content,
        visibility,
        mediaUrls,
        postType: mediaFile 
          ? (mediaFile.type.startsWith('video') ? 'VIDEO' : 'IMAGE') 
          : 'TEXT',
        isElite: user?.isElite || false,
      };

      if (editPost) {
        await updatePost(editPost.postId, payload);
        toast.success('Post updated!');
      } else {
        await createPost(payload);
        toast.success('Post published!');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>{editPost ? 'Edit Post' : 'Create Post'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Author row */}
        <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
          <Avatar src={user?.profilePicUrl} name={user?.username} size="md" />
          <div style={{ flex: 1 }}>
            <div className="font-medium text-sm">{user?.username}</div>
            {/* Visibility selector */}
            <select
              className="input"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem', marginTop: 2, width: 'auto', borderRadius: 'var(--r-full)' }}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="PUBLIC">🌍 Public</option>
              <option value="FOLLOWERS_ONLY">👥 Followers Only</option>
              <option value="PRIVATE">🔒 Private</option>
            </select>
          </div>
        </div>

        {/* Content textarea */}
        <textarea
          className="input post-composer-textarea"
          style={{ 
            minHeight: 180, 
            marginBottom: '0.75rem', 
            fontSize: '1.1rem', 
            border: 'none', 
            background: 'transparent',
            resize: 'none',
            padding: '0.5rem 0'
          }}
          placeholder="What's on your mind? Use #hashtags and @mentions…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        />

        {/* Media preview */}
        {previewUrl && (
          <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
            {mediaFile?.type?.startsWith('video') || editPost?.postType === 'VIDEO' ? (
              <video 
                src={previewUrl} 
                controls 
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 'var(--r-md)' }} 
              />
            ) : (
              <img 
                src={previewUrl} 
                alt="preview" 
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 'var(--r-md)' }} 
              />
            )}
            <button
              onClick={() => { setPreviewUrl(null); setMediaFile(null); }}
              style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="post-form-footer">
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()} style={{ padding: '0.5rem 0.75rem' }}>
              <Image size={20} /> 
              <span style={{ marginLeft: '0.4rem', fontWeight: 600 }}>Photo/Video</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFile} />
          </div>
          <div className="flex gap-2 post-form-actions">
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ flex: 1, minWidth: '80px', fontWeight: 600 }}>Cancel</button>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleSubmit} 
              disabled={loading} 
              style={{ flex: 1, minWidth: '100px', borderRadius: 'var(--r-full)', fontWeight: 700 }}
            >
              {loading ? <Spinner size="sm" /> : editPost ? 'Update' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
