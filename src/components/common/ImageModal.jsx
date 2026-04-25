import { X } from 'lucide-react';

export default function ImageModal({ src, onClose, title }) {
  if (!src) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 9999, 
        background: 'rgba(0,0,0,0.9)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        backdropFilter: 'blur(8px)',
        cursor: 'zoom-out'
      }}
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        style={{ 
          position: 'absolute', 
          top: '2rem', 
          right: '2rem', 
          background: 'rgba(255,255,255,0.1)', 
          border: 'none', 
          color: '#fff', 
          width: 44, 
          height: 44, 
          borderRadius: '50%', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
      >
        <X size={24} />
      </button>

      <div 
        style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={src} 
          alt={title || 'Full size'} 
          style={{ 
            display: 'block',
            maxWidth: '100%', 
            maxHeight: '90vh', 
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.1)'
          }} 
        />
        {title && (
          <div style={{ 
            position: 'absolute', 
            bottom: '-2.5rem', 
            left: 0, 
            right: 0, 
            textAlign: 'center', 
            color: '#fff',
            fontWeight: 500,
            fontSize: '1rem'
          }}>
            {title}
          </div>
        )}
      </div>
    </div>
  );
}
