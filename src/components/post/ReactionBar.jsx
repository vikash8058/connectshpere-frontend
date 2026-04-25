import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { REACTION_EMOJI } from '../../utils/constants';
import { reactToTarget, removeReaction, changeReaction, getUserReaction } from '../../api/likes';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ReactionBar({ targetId, targetType = 'POST', initialCount = 0, initialReaction = null, onUpdate }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [myReaction, setMyReaction] = useState(initialReaction);
  const [count, setCount]           = useState(initialCount);
  const [showPicker, setShowPicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const pickerTimer = useRef(null);

  // Sync state with props if they change externally
  useEffect(() => {
    setMyReaction(initialReaction);
    setCount(initialCount);
  }, [initialReaction, initialCount]);

  // Fetch latest reaction state from server to ensure sync
  const refreshSync = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getUserReaction(targetId, targetType);
      const serverReaction = res.data?.data?.reactionType || null;
      setMyReaction(serverReaction);
    } catch (err) {
      console.error('Failed to sync reaction state:', err);
    }
  };

  useEffect(() => {
    refreshSync();
  }, [targetId, targetType, isAuthenticated]);

  const handleReact = async (type) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    if (isProcessing) return;
    setIsProcessing(true);

    const oldReaction = myReaction;
    const oldCount = count;

    try {
      if (myReaction) {
        // If already reacted, any click on the main button should UNLIKE (Instagram style)
        setMyReaction(null);
        setCount(prev => Math.max(0, prev - 1));
        await removeReaction(targetId, targetType);
      } else {
        // NEW REACTION
        setMyReaction(type);
        setCount(prev => prev + 1);
        await reactToTarget({ targetId, targetType, reactionType: type });
      }
      onUpdate?.();
    } catch (err) {
      setMyReaction(oldReaction);
      setCount(oldCount);
      if (err.response?.status === 409) {
        await refreshSync();
      } else {
        toast.error('Action failed');
      }
    } finally {
      setIsProcessing(false);
      setShowPicker(false);
    }
  };

  const handleMouseEnter = () => {
    if (pickerTimer.current) clearTimeout(pickerTimer.current);
    if (!myReaction) setShowPicker(true); // Only show picker if not already liked
  };

  const handleMouseLeave = () => {
    pickerTimer.current = setTimeout(() => {
      setShowPicker(false);
    }, 800);
  };

  return (
    <div 
      className="reaction-container" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {/* Main Action Button */}
      <button
        className={`action-btn reaction-main-btn ${myReaction ? 'active' : ''} ${isProcessing ? 'loading' : ''}`}
        onClick={() => handleReact(myReaction || 'LIKE')}
        disabled={isProcessing}
        style={{ 
          color: myReaction ? 'var(--error)' : 'var(--text-muted)',
          fontWeight: myReaction ? '700' : '500',
          opacity: isProcessing ? 0.7 : 1,
          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          background: myReaction ? 'var(--error-bg)' : 'transparent',
          padding: '0.5rem 1.2rem',
          borderRadius: 'var(--r-full)',
          border: myReaction ? '1px solid #f5c6c2' : '1px solid transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span className="reaction-icon" style={{ 
          transform: myReaction ? 'scale(1.25) rotate(-5deg)' : 'scale(1)',
          display: 'inline-block',
          fontSize: '1.1rem'
        }}>
          {myReaction === 'LIKE' ? '❤️' : (myReaction ? REACTION_EMOJI[myReaction] : '🤍')}
        </span>
        <span className="reaction-label" style={{ fontSize: '0.9rem' }}>
          {count > 0 ? count : ''} {myReaction ? 'Liked' : 'Like'}
        </span>
      </button>

      {/* Floating Emoji Picker */}
      {showPicker && !myReaction && (
        <div
          className="reaction-picker"
          style={{
            position: 'absolute', 
            bottom: '100%', 
            left: 0, 
            marginBottom: 10,
            background: 'var(--white)', 
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-full)', 
            boxShadow: 'var(--shadow-lg)',
            display: 'flex', 
            gap: 8, 
            padding: '8px 16px', 
            zIndex: 100,
            animation: 'slideUp 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          {Object.entries(REACTION_EMOJI).map(([type, emoji]) => (
            <button
              key={type}
              onClick={(e) => { e.stopPropagation(); handleReact(type); }}
              disabled={isProcessing}
              title={type}
              className={`picker-emoji ${myReaction === type ? 'selected' : ''}`}
              style={{
                background: 'none',
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '1.4rem',
                padding: '4px',
                borderRadius: '50%',
                transform: myReaction === type ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 0.2s, background-color 0.2s',
                backgroundColor: myReaction === type ? 'var(--amber-light)' : 'transparent'
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
