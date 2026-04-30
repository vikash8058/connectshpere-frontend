import { useEffect, useState } from 'react';
import { getReports, resolveReport, getReportStats, deleteAnyPost, deleteAnyComment, deleteAllReports } from '../../api/admin';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { timeAgo } from '../../utils/timeAgo';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  PENDING:  'badge-amber',
  RESOLVED: 'badge-success',
  DISMISSED:'badge-brown',
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('PENDING');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadData = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        getReports(),
        getReportStats()
      ]);
      
      const reportsData = reportsRes.data?.data || reportsRes.data || [];
      setReports(Array.isArray(reportsData) ? reportsData : []);
      setStats(statsRes.data?.data || null);
    } catch (err) {
      console.error('Failed to load reports data', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (report) => {
    const { reportId, targetId, targetType } = report;
    const action = 'REMOVE'; // Only called by the red button
    
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE this ${targetType.toLowerCase()}?`)) return;

    try {
      // 1. Delete the actual content based on type
      if (targetType === 'POST') {
        await deleteAnyPost(targetId);
      } else if (targetType === 'COMMENT') {
        await deleteAnyComment(targetId);
      }
      
      // 2. Mark the report as resolved
      await resolveReport(reportId, 'RESOLVE');
      
      toast.success(`${targetType} removed and report resolved`);
      loadData();
    } catch (err) { 
      console.error(err);
      toast.error('Could not remove content. It might already be deleted.'); 
      // Still try to resolve the report if the content is gone
      await resolveReport(reportId, 'RESOLVE');
      loadData();
    }
  };

  const handleDismiss = async (reportId) => {
    try {
      await resolveReport(reportId, 'DISMISS');
      toast.success('Report dismissed');
      loadData();
    } catch { toast.error('Action failed'); }
  };

  const handleHardReset = async () => {
    if (!confirm('CRITICAL: This will delete ALL reports in the history and queue. This cannot be undone. Proceed?')) return;
    try {
      await deleteAllReports();
      toast.success('Database cleared! Everything is now at 0.');
      loadData();
    } catch { toast.error('Reset failed'); }
  };

  const filtered = reports.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'HISTORY') return r.status === 'RESOLVED' || r.status === 'DISMISSED';
    return r.status === filter;
  });

  return (
    <div>
      {/* Dashboard Stats */}
      {stats && (
        <div className="stat-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>🚩</div>
            <div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Reports</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>⏳</div>
            <div>
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending Action</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>✅</div>
            <div>
              <div className="stat-value">{stats.resolved + stats.dismissed}</div>
              <div className="stat-label">Solved/Closed</div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 className="admin-section-title" style={{ margin: 0 }}>
            Moderation Queue
          </h2>
          <button 
            className="btn btn-sm btn-ghost" 
            style={{ color: 'var(--error)', border: '1px solid var(--error-light)' }}
            onClick={handleHardReset}
          >
            🗑️ Reset All to 0
          </button>
        </div>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--cream-100)', padding: '4px', borderRadius: 'var(--r-md)' }}>
          {[
            { id: 'PENDING', label: '⏳ Active', color: 'var(--warning)' },
            { id: 'HISTORY', label: '📜 History', color: 'var(--text-primary)' },
            { id: 'ALL',     label: '📁 All',     color: 'var(--text-muted)' }
          ].map((s) => (
            <button
              key={s.id}
              className={`btn btn-sm ${filter === s.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ color: filter === s.id ? 'white' : s.color }}
              onClick={() => setFilter(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner centered /> : filtered.length === 0 ? (
        <EmptyState icon="🚩" title="No reports" description="All clear!" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((r) => (
            <div key={r.reportId} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '1rem' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${r.status === 'PENDING' ? 'badge-warning' : 'badge-success'}`}>
                    {r.status}
                  </span>
                  <span className="badge badge-neutral" style={{ background: 'var(--cream-200)', color: 'var(--text-primary)', fontSize: '0.7rem' }}>
                    {r.targetType} #{r.targetId}
                  </span>
                </div>
                <span className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>{timeAgo(r.createdAt)}</span>
              </div>

              {/* Reporter and reason */}
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong>Reported by:</strong> {r.reporterUsername || `User #${r.reporterId}`}
                </span>
              </div>
              {r.reason && (
                <div style={{ background: 'var(--cream-100)', borderRadius: 'var(--r-md)', padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-primary)', borderLeft: '3px solid var(--sand)' }}>
                  {r.reason}
                </div>
              )}

              {/* Actions for pending reports */}
              {r.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-danger btn-sm" style={{ flex: 1, minWidth: '140px' }} onClick={() => handleResolve(r)}>
                    🗑️ Remove Content
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, minWidth: '80px' }} onClick={() => handleDismiss(r.reportId)}>
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
