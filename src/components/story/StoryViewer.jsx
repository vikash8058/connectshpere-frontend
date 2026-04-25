import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
import { viewStory, deleteStory, getStoryViewers } from '../../api/social';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { timeAgo } from '../../utils/timeAgo';
import { fixCdnUrl } from '../../utils/urlFixer';
import toast from 'react-hot-toast';

export default function StoryViewer({ group, onClose }) {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  
  const story = group.items[index];
  const DURATION = 5000;
  const isOwner = user?.userId === group.authorId;

  useEffect(() => {
    if (showViewers) return; // Pause while viewing list

    setProgress(0);
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        if (index < group.items.length - 1) {
          setIndex((i) => i + 1);
          if (!isOwner) viewStory(group.items[index + 1].storyId).catch(() => {});
        } else {
          onClose();
        }
      }
    }, 50);
    return () => clearInterval(timer);
  }, [index, showViewers, isOwner]);

  const prev = () => { if (index > 0) setIndex(index - 1); };
  const next = () => {
    if (index < group.items.length - 1) {
      setIndex(index + 1);
      if (!isOwner) viewStory(group.items[index + 1].storyId).catch(() => {});
    } else onClose();
  };

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const toastId = toast.loading('Deleting story...');
      await deleteStory(story.storyId);
      toast.success('Story deleted', { id: toastId });
      setShowConfirmDelete(false);
      onClose(); // Close the viewer immediately
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleOpenViewers = async () => {
    setShowViewers(true);
    setLoadingViewers(true);
    try {
      const res = await getStoryViewers(story.storyId);
      setViewers(res.data?.data || []);
    } catch {
      toast.error('Failed to load viewers');
    } finally {
      setLoadingViewers(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 420, height: '80vh', position: 'relative', borderRadius: 'var(--r-xl)', overflow: 'hidden', background: '#111' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: 4, zIndex: 10 }}>
          {group.items.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', background: '#fff', borderRadius: 2,
                  width: i < index ? '100%' : i === index ? `${progress}%` : '0%',
                  transition: i === index ? 'none' : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* Top shadow for readability */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)', zIndex: 5, pointerEvents: 'none' }} />

        {/* Author info */}
        <div style={{ position: 'absolute', top: 24, left: 16, right: 16, display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
          <Avatar src={group.profilePic} name={group.username} size="sm" />
          <div style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{group.username}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem' }}>{timeAgo(story?.createdAt)}</div>
          </div>
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            {isOwner && (
              <button 
                onClick={handleDelete} 
                style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: '#ff5c5c', cursor: 'pointer', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
              >
                <Trash2 size={18} />
              </button>
            )}
            <button 
              onClick={onClose} 
              style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', cursor: 'pointer', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Story media */}
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {story?.mediaType === 'VIDEO' ? (
            <video key={story.mediaUrl} src={fixCdnUrl(story.mediaUrl)} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <img src={fixCdnUrl(story?.mediaUrl)} alt="story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>

        {/* Owner Controls (Viewers) */}
        {isOwner && (
          <div 
            style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }}
            onClick={handleOpenViewers}
          >
            <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', padding: '10px 20px', borderRadius: 'var(--r-full)', color: '#fff', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
              <Eye size={18} />
              <span style={{ fontWeight: 600 }}>{story.viewsCount || 0} views</span>
            </div>
          </div>
        )}

        {/* Caption */}
        {!isOwner && story?.caption && (
          <div style={{ position: 'absolute', bottom: 24, left: 16, right: 16, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 'var(--r-md)', padding: '0.5rem 0.75rem', fontSize: '0.88rem', backdropFilter: 'blur(4px)' }}>
            {story.caption}
          </div>
        )}

        {/* Prev/Next tap zones */}
        {!showViewers && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={prev} />
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={next} />
          </div>
        )}

        {/* Viewers Modal */}
        {showViewers && (
          <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 30, animation: 'slideUp 0.3s ease', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Viewers</h3>
              <button onClick={() => setShowViewers(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {loadingViewers ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
              ) : viewers.length > 0 ? (
                viewers.map((v) => (
                  <div key={v.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                    <Avatar src={v.profilePicUrl} name={v.username} size="sm" />
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{v.username}</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No views yet</div>
              )}
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {showConfirmDelete && (
          <div 
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}
            onClick={() => setShowConfirmDelete(false)}
          >
            <div 
              style={{ background: '#fff', borderRadius: 'var(--r-lg)', width: '85%', maxWidth: '300px', padding: '24px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            >
              <h4 style={{ margin: '0 0 12px 0', color: '#111', fontSize: '1.1rem' }}>Delete Story?</h4>
              <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
                This will permanently remove this story from your profile and your friends' feeds.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button 
                  onClick={confirmDelete}
                  style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '12px', borderRadius: 'var(--r-md)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Delete
                </button>
                <button 
                  onClick={() => setShowConfirmDelete(false)}
                  style={{ background: '#f5f5f5', color: '#444', border: 'none', padding: '12px', borderRadius: 'var(--r-md)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
