import { AlertTriangle, X } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmModal({ 
  open, 
  onClose, 
  onConfirm, 
  title = 'Are you sure?', 
  message = 'This action cannot be undone.', 
  confirmText = 'Delete', 
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: type === 'danger' ? '#fee2e2' : '#fef3c7', 
          color: type === 'danger' ? '#ef4444' : '#f59e0b', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.5rem' 
        }}>
          <AlertTriangle size={32} />
        </div>
        
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          {title}
        </h3>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '2rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onClose} 
            disabled={loading}
            style={{ minWidth: '120px' }}
          >
            {cancelText}
          </button>
          <button 
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} 
            onClick={onConfirm} 
            disabled={loading}
            style={{ 
              minWidth: '120px',
              backgroundColor: type === 'danger' ? '#ef4444' : undefined,
              color: type === 'danger' ? '#fff' : undefined
            }}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
