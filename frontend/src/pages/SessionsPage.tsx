import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SessionApi } from '../api';
import { getInitials, timeAgo } from '../utils/helpers';
import type { Session } from '../types';

const StatusBadge = ({ status }: { status: Session['status'] }) => {
  const map: Record<Session['status'], string> = {
    active: 'badge-success',
    completed: 'badge-grey',
    flagged: 'badge-danger',
    cancelled: 'badge-grey',
  };
  return <span className={`badge ${map[status]}`}>{status}</span>;
};

const SessionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SessionApi.list()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const filtered = sessions.filter((s) => filter === 'all' || s.status === filter);

  return (
    <div className="page">
      <h1 style={{ fontSize: '1.75rem', marginBottom: 16 }}>My Sessions</h1>
      <div className="tabs" style={{ marginBottom: 24 }}>
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            className={`tab-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">💬</div>
          <div className="empty-title">No {filter !== 'all' ? filter : ''} sessions</div>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/match')}>
            Find Peers
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((s) => {
            const partner = s.participants.find((p) => p._id !== user.id);
            return (
              <div
                key={s._id}
                className="card"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
                onClick={() => navigate(`/session/${s._id}`)}
              >
                <div className="avatar avatar-md">
                  <span>{getInitials(partner?.name || '?')}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700 }}>{partner?.name || 'Peer'}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {(s.skillFromA as any)?.name} ↔ {(s.skillFromB as any)?.name}
                    <span style={{ marginLeft: 12 }}>{timeAgo(s.updatedAt)}</span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm">Open →</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
