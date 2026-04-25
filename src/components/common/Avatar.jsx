import { useState } from 'react';
import { fixCdnUrl } from '../../utils/urlFixer';
import ImageModal from './ImageModal';

// Shows profile picture or a colored placeholder with initials
export default function Avatar({ src, name = '', size = 'md', className = '', onClick, viewable = false }) {
  const [showViewer, setShowViewer] = useState(false);
  const cls = `avatar-${size} ${className}`;
  
  // Use DiceBear as a high-quality free fallback if no real image is available
  const placeholderUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'default')}`;
  
  const displaySrc = fixCdnUrl(src) || placeholderUrl;

  const handleClick = (e) => {
    if (viewable && src) {
      setShowViewer(true);
    }
    if (onClick) onClick(e);
  };

  return (
    <>
      <img 
        src={displaySrc} 
        alt={name} 
        className={`avatar ${cls}`} 
        onClick={handleClick}
        style={{ cursor: (onClick || (viewable && src)) ? 'pointer' : 'default', objectFit: 'cover' }}
        onError={(e) => { e.target.src = placeholderUrl; }}
      />
      {showViewer && (
        <ImageModal 
          src={displaySrc} 
          onClose={() => setShowViewer(false)} 
          title={name} 
        />
      )}
    </>
  );
}
