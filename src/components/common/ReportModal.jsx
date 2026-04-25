import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createReport } from '../../api/social';

export default function ReportModal({ targetId, targetType, onClose }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    'Spam or misleading',
    'Harassment or bullying',
    'Hate speech',
    'Nudity or sexual activity',
    'Violence or dangerous organizations',
    'Intellectual property violation',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return toast.error('Please select a reason');

    setSubmitting(true);
    try {
      await createReport({ targetId, targetType, reason });
      toast.success('Report submitted. Thank you for keeping ConnectSphere safe!');
      onClose();
    } catch (err) {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--error)" />
            <h3 style={{ margin: 0 }}>Report {targetType.toLowerCase()}</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <p className="text-sm text-muted">
            Why are you reporting this {targetType.toLowerCase()}? Your report is anonymous.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {reasons.map((r) => (
              <label key={r} className="report-option" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.75rem', 
                borderRadius: 'var(--r-md)', 
                background: reason === r ? 'var(--amber-light)' : 'var(--cream-100)',
                border: `1px solid ${reason === r ? 'var(--amber)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <input 
                  type="radio" 
                  name="reason" 
                  value={r} 
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ accentColor: 'var(--amber)' }}
                />
                <span className="text-sm">{r}</span>
              </label>
            ))}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting}
            style={{ marginTop: '0.5rem' }}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
