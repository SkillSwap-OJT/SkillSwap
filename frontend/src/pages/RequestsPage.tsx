import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RequestApi } from '../api';
import { getSocket } from '../lib/socket';
import { getInitials, timeAgo } from '../utils/helpers';
import type { SwapRequest } from '../types';

const StatusBadge = ({ status }: { status: SwapRequest['status'] }) => {
  const map: Record<SwapRequest['status'], string> = {
    pending: 'badge-info',
    accepted: 'badge-success',
    rejected: 'badge-danger',
    cancelled: 'badge-grey',
  };
  return <span className={`badge ${map[status]}`}>{status}</span>;
};

const RequestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    RequestApi.list()
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    const onRequestChange = () => refresh();
    socket.on('notification:request', onRequestChange);
    socket.on('notification:request-updated', onRequestChange);
    return () => {
      socket.off('notification:request', onRequestChange);
      socket.off('notification:request-updated', onRequestChange);
    };
  }, [user]);

  if (!user) return null;

  const incoming = requests.filter((r) => (r.toUser as any)?._id === user.id);
  const outgoing = requests.filter((r) => (r.fromUser as any)?._id === user.id);
  const list = tab === 'incoming' ? incoming : outgoing;

  const respond = async (id: string, action: 'accept' | 'reject') => {
    setBusyId(id);
    try {
      const r = await RequestApi.respond(id, action);
      refresh();
      if (action === 'accept' && r.session) navigate(`/session/${r.session._id}`);
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (id: string) => {
    setBusyId(id);
    try {
      await RequestApi.cancel(id);
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page">
      <h1 style={{ fontSize: '1.75rem', marginBottom: 16 }}>Swap Requests</h1>
      <div className="tabs" style={{ marginBottom: 24 }}>
        <button
          className={`tab-btn ${tab === 'incoming' ? 'active' : ''}`}
          onClick={() => setTab('incoming')}
        >
          📥 Incoming ({incoming.filter((r) => r.status === 'pending').length})
        </button>
        <button
          className={`tab-btn ${tab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setTab('outgoing')}
        >
          📤 Outgoing ({outgoing.filter((r) => r.status === 'pending').length})
        </button>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : list.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">No {tab} requests</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((r) => {
            const counterparty: any = tab === 'incoming' ? r.fromUser : r.toUser;
            return (
              <div className="card" key={r._id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="avatar avatar-md">
                    {counterparty?.avatarUrl ? (
                      <img src={counterparty.avatarUrl} alt={counterparty.name} />
                    ) : (
                      <span>{getInitials(counterparty?.name || '?')}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>{counterparty?.name || 'User'}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      🎓 wants to learn <strong>{r.requestedSkill?.name}</strong>
                      {r.offeredSkill ? (
                        <>
                          {' '}· 🏫 offering <strong>{r.offeredSkill.name}</strong>
                        </>
                      ) : (
                        <>
                          {' '}· learning-only request
                        </>
                      )}
                    </div>
                    {r.message && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: '8px 12px',
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        "{r.message}"
                      </div>
                    )}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                      {timeAgo(r.createdAt)}
                    </div>
                  </div>
                  {r.status === 'pending' && tab === 'incoming' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-success btn-sm"
                        disabled={busyId === r._id}
                        onClick={() => respond(r._id, 'accept')}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={busyId === r._id}
                        onClick={() => respond(r._id, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {r.status === 'pending' && tab === 'outgoing' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={busyId === r._id}
                      onClick={() => cancel(r._id)}
                    >
                      Cancel
                    </button>
                  )}
                  {r.status === 'accepted' && r.session && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/session/${r.session}`)}
                    >
                      Open Session →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
